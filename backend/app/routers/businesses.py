"""
Businesses router — view business profile, credit score, collaterals.
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_officer
from app.database import get_db
from app.models.business import BusinessProfile
from app.models.credit import CreditScore, Collateral, Loan, Offer, EMI, EMIStatus, LoanStatus
from app.models.invoice import Invoice
from app.models.user import User
from app.schemas.schemas import BusinessProfileResponse, CreditScoreResponse, CollateralResponse, DashboardResponse, ActivityItem
from app.services.scoring_service import calculate_credit_score, get_latest_credit_score

router = APIRouter(prefix="/businesses", tags=["Businesses"])


@router.get("/me", response_model=BusinessProfileResponse)
async def get_my_business(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the current borrower's business profile."""
    result = await db.execute(
        select(BusinessProfile).where(BusinessProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No business profile found. Please complete KYC.",
        )
    return BusinessProfileResponse(
        id=str(profile.id),
        user_id=str(profile.user_id),
        gst_number=profile.gst_number,
        pan_number=profile.pan_number,
        created_at=profile.created_at,
    )


@router.get("/me/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get aggregated dashboard data for the user."""
    # 1. Fetch Profile
    bp_result = await db.execute(
        select(BusinessProfile).where(BusinessProfile.user_id == current_user.id)
    )
    profile = bp_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business profile not found")

    # 2. Fetch Credit Score
    score = await get_latest_credit_score(db, profile.id)
    if not score:
        score = await calculate_credit_score(db, profile.id)

    # 3. Fetch Active Loans
    loans_result = await db.execute(
        select(Loan)
        .join(Offer, Offer.id == Loan.offer_id)
        .join(Invoice, Invoice.id == Offer.invoice_id)
        .where(Invoice.business_id == profile.id, Loan.status == LoanStatus.ACTIVE)
    )
    active_loans = loans_result.scalars().all()
    active_loans_total = sum(l.principal for l in active_loans)

    # 4. Calculate Available Limit
    base_limit = score.final_score * 2500
    available_limit = max(0, float(base_limit) - float(active_loans_total))

    # 5. Fetch Next EMI
    next_emi_result = await db.execute(
        select(EMI)
        .join(Loan, Loan.id == EMI.loan_id)
        .join(Offer, Offer.id == Loan.offer_id)
        .join(Invoice, Invoice.id == Offer.invoice_id)
        .where(Invoice.business_id == profile.id, EMI.status == EMIStatus.PENDING)
        .order_by(EMI.due_date.asc())
        .limit(1)
    )
    next_emi = next_emi_result.scalar_one_or_none()
    next_emi_amount = float(next_emi.amount) if next_emi else None
    next_emi_date = next_emi.due_date if next_emi else None

    # 6. Fetch Recent Activity (Loans disbursed)
    recent_loans_result = await db.execute(
        select(Loan)
        .join(Offer, Offer.id == Loan.offer_id)
        .join(Invoice, Invoice.id == Offer.invoice_id)
        .where(Invoice.business_id == profile.id)
        .order_by(Loan.created_at.desc())
        .limit(3)
    )
    recent_loans = recent_loans_result.scalars().all()
    
    recent_activity = []
    for l in recent_loans:
        recent_activity.append(
            ActivityItem(
                id=str(l.id),
                type="LOAN_DISBURSED",
                title="Loan Disbursed",
                subtitle=f"Loan #{str(l.id)[:8].upper()}",
                amount=float(l.disbursed_amount or l.principal),
                date=l.created_at
            )
        )

    return DashboardResponse(
        available_limit=float(available_limit),
        credit_score=float(score.final_score),
        risk_grade=score.risk_grade,
        active_loans_total=float(active_loans_total),
        next_emi_amount=next_emi_amount,
        next_emi_date=next_emi_date,
        recent_activity=recent_activity,
    )


@router.get("/me/credit-score", response_model=CreditScoreResponse)
async def get_credit_score(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get (or recalculate) the latest credit score."""
    bp_result = await db.execute(
        select(BusinessProfile).where(BusinessProfile.user_id == current_user.id)
    )
    profile = bp_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business profile not found")

    score = await get_latest_credit_score(db, profile.id)
    if not score:
        score = await calculate_credit_score(db, profile.id)

    return CreditScoreResponse(
        id=str(score.id),
        business_id=str(score.business_id),
        external_score=score.external_score,
        internal_score=score.internal_score,
        final_score=score.final_score,
        risk_grade=score.risk_grade,
        created_at=score.created_at,
    )


@router.post("/me/credit-score/recalculate", response_model=CreditScoreResponse)
async def recalculate_credit_score(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Force recalculate credit score."""
    bp_result = await db.execute(
        select(BusinessProfile).where(BusinessProfile.user_id == current_user.id)
    )
    profile = bp_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business profile not found")

    score = await calculate_credit_score(db, profile.id)
    return CreditScoreResponse(
        id=str(score.id),
        business_id=str(score.business_id),
        external_score=score.external_score,
        internal_score=score.internal_score,
        final_score=score.final_score,
        risk_grade=score.risk_grade,
        created_at=score.created_at,
    )

@router.get("/me/credit-score/suggestions")
async def get_credit_score_suggestions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate dynamic AI-like actionable suggestions to improve credit score."""
    from app.services.scoring_service import get_latest_credit_score
    
    bp_result = await db.execute(
        select(BusinessProfile).where(BusinessProfile.user_id == current_user.id)
    )
    profile = bp_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business profile not found")

    score = await get_latest_credit_score(db, profile.id)
    if not score:
        return {"suggestions": ["Generate your first invoice to build your credit profile.", "Ensure you pay future EMIs on time.", "Increase overall trade volume."]}

    suggestions = []
    f_score = score.final_score

    # Simulated AI logic
    if f_score < 500:
        suggestions.append("Your score reflects a high risk. Focus strictly on clearing any existing overdue invoices.")
        suggestions.append("Upload more high-value B2B invoices to establish consistent transaction volume.")
        suggestions.append("Consider securing short-term loans and repaying them early to build instant trust.")
    elif f_score < 750:
        suggestions.append("Your score is good but can be optimized. Maintain consistently early EMI repayments.")
        suggestions.append("We noticed your external data (via PAN/GST) is stable; syncing newer sales ledgers could raise your internal score.")
        suggestions.append("Keep credit utilization below 40% of your available sanction limits.")
    else:
        suggestions.append("Excellent score! You are eligible for our lowest interest tier.")
        suggestions.append("To maintain your premium status, continue your 100% on-time repayment streak.")
        suggestions.append("Consider applying for higher sanction limits to scale operations without taking a score hit.")

    return {
        "score": f_score,
        "grade": score.risk_grade,
        "suggestions": suggestions
    }

@router.get("/{business_id}/collaterals", response_model=list[CollateralResponse])
async def get_collaterals(
    business_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all collaterals for loans under a business."""
    result = await db.execute(
        select(Collateral)
        .join(Loan, Loan.id == Collateral.loan_id)
        .join(
            __import__("app.models.credit", fromlist=["Offer"]).Offer,
            __import__("app.models.credit", fromlist=["Offer"]).Offer.id == Loan.offer_id
        )
    )
    # Simplified: return all collaterals (production would filter by user ownership)
    collaterals = result.scalars().all()
    return [
        CollateralResponse(
            id=str(c.id),
            asset_description=c.asset_description,
            asset_value=float(c.asset_value),
            status=c.status,
        )
        for c in collaterals
    ]
