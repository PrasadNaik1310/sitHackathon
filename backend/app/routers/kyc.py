"""KYC & onboarding router."""
import uuid
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.services import kyc_service
from app.services.scoring_service import calculate_credit_score

router = APIRouter(prefix="/kyc", tags=["KYC & Onboarding"])


class KYCRequest(BaseModel):
    aadhaar_number: str
    pan_number: str
    gst_number: str


@router.post("/onboard")
async def onboard_business(
    body: KYCRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile = await kyc_service.run_kyc_and_onboard(
        db, current_user, body.aadhaar_number, body.pan_number, body.gst_number
    )
    # Trigger initial credit scoring
    credit_score = await calculate_credit_score(db, profile.id)
    return {
        "message": "KYC successful. Business onboarded.",
        "business_id": str(profile.id),
        "gst_number": profile.gst_number,
        "credit_score": {
            "final_score": credit_score.final_score,
            "risk_grade": credit_score.risk_grade,
        },
    }
