"""
Repayment & Default Service

EMI lifecycle: PENDING → PAID | BOUNCED
Default handling: loan DEFAULT, collateral SEIZED, provisioning ledger
"""
from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.audit import log_audit
from app.logging_config import logger
from app.models.credit import (
    EMI, EMIStatus, Loan, LoanStatus, Collateral, CollateralStatus, Offer
)
from app.models.invoice import Invoice, InvoiceStatus
from app.models.user import User
from app.services.ledger_service import record_repayment, record_provisioning, record_recovery

MAX_EMI_RETRIES = 2


async def pay_emi(db: AsyncSession, emi_id: UUID, user: User) -> EMI:
    """Mark an EMI as PAID and potentially close the loan."""
    result = await db.execute(
        select(EMI).where(EMI.id == emi_id).with_for_update()
    )
    emi = result.scalar_one_or_none()
    if not emi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="EMI not found")

    if emi.status == EMIStatus.PAID:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="EMI already paid")

    emi.status = EMIStatus.PAID
    await db.flush()

    await record_repayment(db, emi.loan_id, float(emi.amount))

    # Check if all EMIs paid → close loan
    await _check_loan_closure(db, emi.loan_id)

    await log_audit(db, actor_id=user.id, action="EMI_PAID", entity_type="EMI", entity_id=str(emi_id))
    return emi


async def bounce_emi(db: AsyncSession, emi_id: UUID) -> EMI:
    """Mark an EMI as BOUNCED. If retry_count >= MAX, trigger default."""
    result = await db.execute(
        select(EMI).where(EMI.id == emi_id).with_for_update()
    )
    emi = result.scalar_one_or_none()
    if not emi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="EMI not found")

    emi.status = EMIStatus.BOUNCED
    emi.retry_count += 1
    await db.flush()

    if emi.retry_count >= MAX_EMI_RETRIES:
        await _trigger_default(db, emi.loan_id)

    return emi


async def _check_loan_closure(db: AsyncSession, loan_id: UUID) -> None:
    """Close loan if all EMIs are paid."""
    result = await db.execute(
        select(EMI).where(EMI.loan_id == loan_id, EMI.status != EMIStatus.PAID)
    )
    pending = result.scalars().all()
    if not pending:
        await db.execute(
            update(Loan).where(Loan.id == loan_id).values(status=LoanStatus.CLOSED)
        )
        # Mark related invoice as REPAID
        await _mark_invoice_repaid(db, loan_id)
        logger.info("loan.closed", loan_id=str(loan_id))


async def _mark_invoice_repaid(db: AsyncSession, loan_id: UUID) -> None:
    """Mark the financed invoice as REPAID."""
    loan_result = await db.execute(select(Loan).where(Loan.id == loan_id))
    loan = loan_result.scalar_one_or_none()
    if not loan:
        return
    offer_result = await db.execute(select(Offer).where(Offer.id == loan.offer_id))
    offer = offer_result.scalar_one_or_none()
    if not offer:
        return
    await db.execute(
        update(Invoice).where(Invoice.id == offer.invoice_id).values(status=InvoiceStatus.REPAID)
    )
    await db.flush()


async def _trigger_default(db: AsyncSession, loan_id: UUID) -> None:
    """Handle loan default: status, invoice, collateral, provisioning."""
    # Default loan
    await db.execute(
        update(Loan).where(Loan.id == loan_id).values(status=LoanStatus.DEFAULT)
    )

    # Get loan to check collateral
    loan_result = await db.execute(select(Loan).where(Loan.id == loan_id))
    loan = loan_result.scalar_one_or_none()
    if not loan:
        return

    # Mark invoice DEFAULTED
    offer_result = await db.execute(select(Offer).where(Offer.id == loan.offer_id))
    offer = offer_result.scalar_one_or_none()
    if offer:
        await db.execute(
            update(Invoice).where(Invoice.id == offer.invoice_id).values(status=InvoiceStatus.DEFAULTED)
        )

    # Seize collateral if SECURED
    coll_result = await db.execute(
        select(Collateral).where(
            Collateral.loan_id == loan_id,
            Collateral.status == CollateralStatus.PLEDGED,
        )
    )
    collaterals = coll_result.scalars().all()
    total_recovery = 0.0
    for col in collaterals:
        col.status = CollateralStatus.SEIZED
        total_recovery += float(col.asset_value)

    await db.flush()

    # Provisioning and recovery ledger entries
    await record_provisioning(db, loan_id, float(loan.disbursed_amount))
    if total_recovery > 0:
        await record_recovery(db, loan_id, total_recovery)

    logger.warning("loan.defaulted", loan_id=str(loan_id), recovery_value=total_recovery)
    await log_audit(
        db, actor_id=None, action="LOAN_DEFAULTED", entity_type="Loan",
        entity_id=str(loan_id), new_value={"status": LoanStatus.DEFAULT}
    )
