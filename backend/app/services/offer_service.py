"""
Offer Generation Engine

Flow:
1. SELECT FOR UPDATE on invoice (prevent race conditions)
2. Validate invoice is UNPAID
3. Check exposure caps
4. Get latest credit score
5. Run credit committee decision
6. Generate UNSECURED + SECURED offers
7. Mark invoice OFFER_GENERATED
"""
from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.audit import log_audit
from app.logging_config import logger
from app.models.business import BusinessProfile
from app.models.credit import CreditScore, Offer, RiskGrade, LoanType, OfferStatus
from app.models.invoice import Invoice, InvoiceStatus
from app.models.user import User
from app.services.credit_decision import evaluate_credit_decision, CreditDecision
from app.services.exposure_service import check_exposure_caps
from app.services.scoring_service import get_latest_credit_score, calculate_credit_score

OFFER_EXPIRY_HOURS = 24


def _secured_offer_params(risk_grade: RiskGrade) -> tuple[float, float]:
    """Returns (percentage, interest_rate) for secured offer by risk grade."""
    if risk_grade == RiskGrade.A:
        return 85.0, 12.0
    elif risk_grade == RiskGrade.B:
        return 70.0, 14.0
    else:
        return 50.0, 16.0


async def generate_offers_for_invoice(
    db: AsyncSession,
    invoice_id: UUID,
    user: User,
) -> list[Offer]:
    """Generate SECURED + UNSECURED offers. Uses SELECT FOR UPDATE."""

    # SELECT FOR UPDATE to prevent double financing
    result = await db.execute(
        select(Invoice).where(Invoice.id == invoice_id).with_for_update()
    )
    invoice = result.scalar_one_or_none()

    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")

    if invoice.status != InvoiceStatus.UNPAID:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Invoice is not eligible for financing. Status: {invoice.status}",
        )

    # Get business profile
    bp_result = await db.execute(
        select(BusinessProfile).where(BusinessProfile.id == invoice.business_id)
    )
    profile = bp_result.scalar_one_or_none()
    if not profile or profile.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your invoice")

    # Get or calculate credit score
    credit_score = await get_latest_credit_score(db, profile.id)
    if not credit_score:
        credit_score = await calculate_credit_score(db, profile.id)

    # Exposure caps check for the max possible loan amount (85% of invoice)
    max_requested = float(invoice.amount) * 0.85
    await check_exposure_caps(db, user, profile, max_requested)

    # Credit committee decision
    decision = await evaluate_credit_decision(
        db, user, profile, credit_score.risk_grade, max_requested
    )
    if decision == CreditDecision.REJECTED:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Credit decision: REJECTED due to exposure caps or risk constraints.",
        )

    expires_at = datetime.now(timezone.utc) + timedelta(hours=OFFER_EXPIRY_HOURS)

    # UNSECURED Offer: 100% of invoice
    unsecured_amount = float(invoice.amount) * 1.0
    unsecured_offer = Offer(
        invoice_id=invoice_id,
        loan_type=LoanType.UNSECURED,
        percentage=100.0,
        interest_rate=20.0,
        tenure_months=8,
        status=OfferStatus.GENERATED,
        expires_at=expires_at,
    )
    db.add(unsecured_offer)

    # SECURED Offer: 100% of invoice
    sec_pct, sec_rate = 100.0, _secured_offer_params(credit_score.risk_grade)[1]
    secured_offer = Offer(
        invoice_id=invoice_id,
        loan_type=LoanType.SECURED,
        percentage=sec_pct,
        interest_rate=sec_rate,
        tenure_months=4,
        status=OfferStatus.GENERATED,
        expires_at=expires_at,
    )
    db.add(secured_offer)

    # Mark invoice as OFFER_GENERATED
    invoice.status = InvoiceStatus.OFFER_GENERATED
    await db.flush()

    await log_audit(
        db,
        actor_id=user.id,
        action="OFFER_GENERATED",
        entity_type="Invoice",
        entity_id=str(invoice_id),
        old_value=InvoiceStatus.UNPAID,
        new_value=InvoiceStatus.OFFER_GENERATED,
    )

    logger.info(
        "offer.generated",
        invoice_id=str(invoice_id),
        risk_grade=credit_score.risk_grade,
        decision=decision,
    )
    return [unsecured_offer, secured_offer]
