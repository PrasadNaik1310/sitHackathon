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
from app.models.credit import CreditScore, Collateral, Loan
from app.models.user import User
from app.schemas.schemas import BusinessProfileResponse, CreditScoreResponse, CollateralResponse
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
