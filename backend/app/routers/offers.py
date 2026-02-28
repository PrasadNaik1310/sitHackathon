"""Offers router."""
import uuid
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.credit import Offer
from app.services.offer_service import generate_offers_for_invoice

router = APIRouter(prefix="/offers", tags=["Offer Engine"])


class GenerateOfferRequest(BaseModel):
    invoice_id: uuid.UUID


@router.post("/generate")
async def generate_offers(
    body: GenerateOfferRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    offers = await generate_offers_for_invoice(db, body.invoice_id, current_user)
    return {
        "message": "Offers generated",
        "offers": [
            {
                "offer_id": str(o.id),
                "loan_type": o.loan_type,
                "percentage": o.percentage,
                "interest_rate": o.interest_rate,
                "tenure_months": o.tenure_months,
                "expires_at": o.expires_at.isoformat(),
            }
            for o in offers
        ],
    }


@router.get("/invoice/{invoice_id}")
async def list_offers_for_invoice(
    invoice_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Offer).where(Offer.invoice_id == invoice_id))
    offers = result.scalars().all()
    return {
        "offers": [
            {
                "offer_id": str(o.id),
                "loan_type": o.loan_type,
                "status": o.status,
                "percentage": o.percentage,
                "interest_rate": o.interest_rate,
                "expires_at": o.expires_at.isoformat(),
            }
            for o in offers
        ]
    }
