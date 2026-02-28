"""
Loan Lifecycle Service

Covers:
- Sanction (accept offer)
- Collateral registration (SECURED loans)
- Disbursement (ledger entries + status ACTIVE)
- EMI schedule generation
"""
import math
from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.audit import log_audit
from app.logging_config import logger
from app.models.credit import (
    Offer, OfferStatus, Loan, LoanStatus, LoanType,
    EMI, EMIStatus, Collateral, CollateralStatus,
)
from app.models.invoice import Invoice, InvoiceStatus
from app.models.user import User
from app.services.ledger_service import record_disbursement


def _calculate_emi_amount(principal: float, annual_rate: float, months: int) -> float:
    """Standard EMI formula: P × r × (1+r)^n / ((1+r)^n - 1)"""
    if annual_rate == 0:
        return principal / months
    r = annual_rate / (12 * 100)
    emi = principal * r * (1 + r) ** months / ((1 + r) ** months - 1)
    return round(emi, 2)


async def sanction_loan(
    db: AsyncSession,
    offer_id: UUID,
    user: User,
    asset_description: str | None = None,
    asset_value: float | None = None,
) -> Loan:
    """Accept an offer and create a SANCTIONED loan."""

    # Fetch offer with lock
    result = await db.execute(
        select(Offer).where(Offer.id == offer_id).with_for_update()
    )
    offer = result.scalar_one_or_none()
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")

    if offer.status != OfferStatus.GENERATED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Offer is not in GENERATED state. Current: {offer.status}",
        )

    if offer.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        offer.status = OfferStatus.EXPIRED
        await db.flush()
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Offer has expired")

    # Fetch invoice
    inv_result = await db.execute(select(Invoice).where(Invoice.id == offer.invoice_id))
    invoice = inv_result.scalar_one_or_none()

    principal = float(invoice.amount) * (offer.percentage / 100)

    # Create loan (SANCTIONED)
    loan = Loan(
        offer_id=offer_id,
        status=LoanStatus.SANCTIONED,
        principal=principal,
        disbursed_amount=0,
    )
    db.add(loan)
    await db.flush()

    # Mark offer as ACCEPTED
    offer.status = OfferStatus.ACCEPTED
    await db.flush()

    # Register collateral for SECURED loans
    if offer.loan_type == LoanType.SECURED:
        if not asset_description or not asset_value:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Collateral details required for SECURED loan",
            )
        db.add(Collateral(
            loan_id=loan.id,
            asset_description=asset_description,
            asset_value=asset_value,
            status=CollateralStatus.PLEDGED,
        ))
        await db.flush()

    # Disburse loan
    await _disburse_loan(db, loan, offer)

    await log_audit(
        db,
        actor_id=user.id,
        action="LOAN_SANCTIONED_AND_DISBURSED",
        entity_type="Loan",
        entity_id=str(loan.id),
        new_value={"status": LoanStatus.ACTIVE, "principal": principal},
    )

    return loan


async def _disburse_loan(db: AsyncSession, loan: Loan, offer: Offer) -> None:
    """Create ledger entries, generate EMI schedule, activate loan."""
    await record_disbursement(db, loan.id, loan.principal)

    # Generate EMI schedule
    emi_amount = _calculate_emi_amount(loan.principal, offer.interest_rate, offer.tenure_months)
    now = datetime.now(timezone.utc)
    for i in range(1, offer.tenure_months + 1):
        due_date = now + timedelta(days=30 * i)
        db.add(EMI(
            loan_id=loan.id,
            due_date=due_date,
            amount=emi_amount,
            status=EMIStatus.PENDING,
            retry_count=0,
        ))

    # Activate loan
    loan.status = LoanStatus.ACTIVE
    loan.disbursed_amount = loan.principal
    await db.flush()

    logger.info("loan.disbursed", loan_id=str(loan.id), amount=loan.principal)
