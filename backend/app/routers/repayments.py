"""Repayment router — EMI pay, bounce."""
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.credit import EMI, Loan
from app.models.user import User
from app.services.repayment_service import pay_emi, bounce_emi

router = APIRouter(prefix="/repayments", tags=["Repayments"])


@router.post("/emi/{emi_id}/pay")
async def pay_emi_endpoint(
    emi_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    emi = await pay_emi(db, emi_id, current_user)
    return {"message": "EMI paid", "emi_id": str(emi.id), "status": emi.status}


@router.post("/emi/{emi_id}/bounce")
async def bounce_emi_endpoint(
    emi_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    emi = await bounce_emi(db, emi_id)
    return {
        "message": "EMI bounced",
        "emi_id": str(emi.id),
        "status": emi.status,
        "retry_count": emi.retry_count,
    }


@router.get("/loan/{loan_id}/emis")
async def list_emis(
    loan_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(EMI).where(EMI.loan_id == loan_id).order_by(EMI.due_date))
    emis = result.scalars().all()
    return {
        "emis": [
            {
                "emi_id": str(e.id),
                "due_date": e.due_date.isoformat(),
                "amount": float(e.amount),
                "status": e.status,
                "retry_count": e.retry_count,
            }
            for e in emis
        ]
    }
