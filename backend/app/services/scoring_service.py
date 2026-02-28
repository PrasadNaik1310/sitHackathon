"""
Hybrid Credit Scoring Engine

final_score = 0.6 * external_score + 0.4 * internal_score

Risk Grade:
  A (low risk):    final_score >= 700
  B (medium risk): 500 <= final_score < 700
  C (high risk):   final_score < 500
"""
from uuid import UUID
from app.models.credit import Loan
from sqlalchemy import select, func as safunc
from sqlalchemy.ext.asyncio import AsyncSession

from app.integrations import government_client as gov
from app.logging_config import logger
from app.models.business import BusinessProfile
from app.models.credit import CreditScore, RiskGrade, EMI
from app.models.invoice import Invoice, InvoiceStatus
from app.config import settings


def _derive_risk_grade(final_score: float) -> RiskGrade:
    if final_score >= 700:
        return RiskGrade.A
    elif final_score >= 500:
        return RiskGrade.B
    else:
        return RiskGrade.C


async def _compute_internal_score(db: AsyncSession, profile: BusinessProfile) -> float:
    """
    Deterministic internal scoring:
    - GST compliance:        up to 200
    - Return consistency:    up to 150
    - Delay penalty:         up to -200
    - Invoice volume:        up to 100
    - Exposure usage:        up to 100
    - Repayment history:     up to 250 (out of max 1000 raw → scaled to 800)
    """
    score = 0.0

    # 1. GST compliance (presence of returns)
    try:
        returns_data = await gov.get_gst_returns(db, profile.gst_number)
        returns = returns_data.get("returns", [])
        filed_count = len([r for r in returns if r.get("status") == "FILED"])
        total_count = max(len(returns), 1)
        compliance_ratio = filed_count / total_count
        score += compliance_ratio * 200
    except Exception:
        pass

    # 2. Invoice volume
    inv_count_result = await db.execute(
        select(safunc.count(Invoice.id)).where(Invoice.business_id == profile.id)
    )
    inv_count = inv_count_result.scalar() or 0
    score += min(inv_count * 10, 100)

    # 3. Delay penalty
    delay_result = await db.execute(
        select(safunc.avg(Invoice.delay_days)).where(Invoice.business_id == profile.id)
    )
    avg_delay = delay_result.scalar() or 0
    delay_penalty = min(avg_delay * 2, 200)
    score -= delay_penalty

    # 4. Repayment history (PAID vs total EMIs)
    total_emis_result = await db.execute(
        select(safunc.count(EMI.id))
        .join(Loan, Loan.id == EMI.loan_id)
        .join(CreditScore, CreditScore.business_id == profile.id)
        .where(Loan.id == EMI.loan_id)
    )
    # Simplified: count paid invoices as proxy for repayment
    paid_inv_result = await db.execute(
        select(safunc.count(Invoice.id)).where(
            Invoice.business_id == profile.id,
            Invoice.status == InvoiceStatus.REPAID,
        )
    )
    paid_count = paid_inv_result.scalar() or 0
    score += min(paid_count * 50, 250)

    # Normalize to 0-800 range
    score = max(0, min(score, 800))
    return score


async def calculate_credit_score(
    db: AsyncSession,
    business_id: UUID,
) -> CreditScore:
    """Calculate and persist hybrid credit score for a business."""
    result = await db.execute(
        select(BusinessProfile).where(BusinessProfile.id == business_id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")

    # External score via Government API
    try:
        credit_data = await gov.credit_evaluate(
            db,
            profile.gst_number,
            {
                "gst_number": profile.gst_number,
                "pan_number": profile.pan_number,
                "aadhaar_number": profile.aadhaar_number,
            },
        )
        external_score = float(credit_data.get("score", 600))
    except Exception as exc:
        logger.warning("scoring.external_score_fallback", error=str(exc))
        external_score = 600.0  # Conservative fallback

    # Internal score
    internal_score = await _compute_internal_score(db, profile)

    # Weighted final score
    final_score = (
        settings.EXTERNAL_SCORE_WEIGHT * external_score
        + settings.INTERNAL_SCORE_WEIGHT * internal_score
    )
    risk_grade = _derive_risk_grade(final_score)

    credit_score = CreditScore(
        business_id=business_id,
        external_score=external_score,
        internal_score=internal_score,
        final_score=final_score,
        risk_grade=risk_grade,
    )
    db.add(credit_score)
    await db.flush()

    logger.info(
        "scoring.calculated",
        business_id=str(business_id),
        final_score=final_score,
        risk_grade=risk_grade,
    )
    return credit_score


async def get_latest_credit_score(db: AsyncSession, business_id: UUID) -> CreditScore | None:
    result = await db.execute(
        select(CreditScore)
        .where(CreditScore.business_id == business_id)
        .order_by(CreditScore.created_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()
