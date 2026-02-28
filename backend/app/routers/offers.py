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


@router.get("/user/my")
async def get_my_offers(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.business import BusinessProfile
    from app.models.invoice import Invoice
    
    bp_result = await db.execute(select(BusinessProfile).where(BusinessProfile.user_id == current_user.id))
    profile = bp_result.scalar_one_or_none()
    if not profile:
        return {"offers": []}
        
    # We load invoice relation to calculate amount
    from sqlalchemy.orm import joinedload
    result = await db.execute(
        select(Offer)
        .options(joinedload(Offer.invoice))
        .join(Invoice, Invoice.id == Offer.invoice_id)
        .where(Invoice.business_id == profile.id)
        .order_by(Offer.created_at.desc())
    )
    offers = result.scalars().all()
    return {
        "offers": [
            {
                "id": str(o.id),
                "invoice_id": str(o.invoice_id),
                "amount": float(o.invoice.amount) * (float(o.percentage) / 100),
                "interest_rate": o.interest_rate,
                "tenure_days": o.tenure_months * 30, # Assuming approx 30 days per month
                "platform_fee": 1500,
                "status": o.status,
            }
            for o in offers
        ]
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
