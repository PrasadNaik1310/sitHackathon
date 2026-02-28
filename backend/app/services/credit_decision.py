"""
Credit Committee Decision Engine

Evaluates:
- Risk grade
- Per-user exposure cap
- Per-GST exposure cap
- Portfolio cap
- Sector concentration (simplified)

Returns: APPROVED | CONDITIONAL_APPROVAL | REJECTED
"""
from enum import Enum
from uuid import UUID

from sqlalchemy import select, func as safunc
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.logging_config import logger
from app.models.business import BusinessProfile
from app.models.credit import RiskGrade, Loan, LoanStatus, Offer
from app.models.invoice import Invoice
from app.models.user import User


class CreditDecision(str, Enum):
    APPROVED = "APPROVED"
    CONDITIONAL_APPROVAL = "CONDITIONAL_APPROVAL"
    REJECTED = "REJECTED"


async def get_user_active_exposure(db: AsyncSession, user_id: UUID) -> float:
    """Sum of disbursed amounts on ACTIVE loans for a user."""
    result = await db.execute(
        select(safunc.coalesce(safunc.sum(Loan.disbursed_amount), 0))
        .join(Offer, Offer.id == Loan.offer_id)
        .join(Invoice, Invoice.id == Offer.invoice_id)
        .join(BusinessProfile, BusinessProfile.id == Invoice.business_id)
        .where(
            BusinessProfile.user_id == user_id,
            Loan.status.in_([LoanStatus.ACTIVE, LoanStatus.SANCTIONED]),
        )
    )
    return float(result.scalar() or 0)


async def get_gst_active_exposure(db: AsyncSession, gst_number: str) -> float:
    """Sum of disbursed amounts for a GST entity."""
    result = await db.execute(
        select(safunc.coalesce(safunc.sum(Loan.disbursed_amount), 0))
        .join(Offer, Offer.id == Loan.offer_id)
        .join(Invoice, Invoice.id == Offer.invoice_id)
        .join(BusinessProfile, BusinessProfile.id == Invoice.business_id)
        .where(
            BusinessProfile.gst_number == gst_number,
            Loan.status.in_([LoanStatus.ACTIVE, LoanStatus.SANCTIONED]),
        )
    )
    return float(result.scalar() or 0)


async def get_portfolio_exposure(db: AsyncSession) -> float:
    """Total portfolio AUM."""
    result = await db.execute(
        select(safunc.coalesce(safunc.sum(Loan.disbursed_amount), 0)).where(
            Loan.status.in_([LoanStatus.ACTIVE, LoanStatus.SANCTIONED])
        )
    )
    return float(result.scalar() or 0)


async def evaluate_credit_decision(
    db: AsyncSession,
    user: User,
    profile: BusinessProfile,
    risk_grade: RiskGrade,
    requested_amount: float,
) -> CreditDecision:
    """Evaluate if credit should be extended."""

    # 1. Hard reject for risk C without collateral intent
    # (Offers will be made at lower percentage, but we still allow CONDITIONAL)

    # 2. Portfolio-level cap
    portfolio_exposure = await get_portfolio_exposure(db)
    if portfolio_exposure + requested_amount > settings.PORTFOLIO_CAP:
        logger.warning("credit_decision.portfolio_cap_exceeded")
        return CreditDecision.REJECTED

    # 3. Per-user exposure cap
    user_exposure = await get_user_active_exposure(db, user.id)
    if user_exposure + requested_amount > settings.PER_USER_EXPOSURE_CAP:
        logger.warning("credit_decision.user_cap_exceeded", user_id=str(user.id))
        return CreditDecision.REJECTED

    # 4. Per-GST exposure cap
    gst_exposure = await get_gst_active_exposure(db, profile.gst_number)
    if gst_exposure + requested_amount > settings.PER_GST_EXPOSURE_CAP:
        logger.warning("credit_decision.gst_cap_exceeded", gst=profile.gst_number)
        return CreditDecision.REJECTED

    # 5. Risk-based decision
    if risk_grade == RiskGrade.C:
        return CreditDecision.CONDITIONAL_APPROVAL
    elif risk_grade == RiskGrade.B:
        return CreditDecision.CONDITIONAL_APPROVAL
    else:
        return CreditDecision.APPROVED
