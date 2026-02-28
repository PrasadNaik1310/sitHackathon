"""Loans router — sanction, disbursement, status."""
import uuid
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_officer
from app.database import get_db
from app.models.credit import Loan
from app.models.user import User
from app.services.loan_service import sanction_loan

router = APIRouter(prefix="/loans", tags=["Loan Lifecycle"])


class SanctionRequest(BaseModel):
    offer_id: uuid.UUID
    asset_description: Optional[str] = None
    asset_value: Optional[float] = None


@router.post("/sanction")
async def sanction(
    body: SanctionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    loan = await sanction_loan(
        db, body.offer_id, current_user, body.asset_description, body.asset_value
    )
    return {
        "message": "Loan sanctioned and disbursed",
        "loan_id": str(loan.id),
        "status": loan.status,
        "principal": float(loan.principal),
        "disbursed_amount": float(loan.disbursed_amount),
    }


@router.get("/user/my")
async def get_my_loans(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.business import BusinessProfile
    from app.models.credit import Offer
    from app.models.invoice import Invoice
    
    bp_result = await db.execute(select(BusinessProfile).where(BusinessProfile.user_id == current_user.id))
    profile = bp_result.scalar_one_or_none()
    if not profile:
        return {"loans": []}
        
    result = await db.execute(
        select(Loan)
        .join(Offer, Offer.id == Loan.offer_id)
        .join(Invoice, Invoice.id == Offer.invoice_id)
        .where(Invoice.business_id == profile.id)
        .order_by(Loan.created_at.desc())
    )
    loans = result.scalars().all()
    return {
        "loans": [
            {
                "id": str(loan.id),
                "offer_id": str(loan.offer_id),
                "amount": float(loan.principal),
                "status": loan.status,
                "created_at": loan.created_at.isoformat(),
            }
            for loan in loans
        ]
    }

@router.get("/user/repayments")
async def get_my_repayments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.business import BusinessProfile
    from app.models.credit import Offer, EMI
    from app.models.invoice import Invoice
    from sqlalchemy.orm import joinedload
    
    bp_result = await db.execute(select(BusinessProfile).where(BusinessProfile.user_id == current_user.id))
    profile = bp_result.scalar_one_or_none()
    if not profile:
        return {"repayments": []}
        
    result = await db.execute(
        select(EMI)
        .join(Loan, Loan.id == EMI.loan_id)
        .join(Offer, Offer.id == Loan.offer_id)
        .join(Invoice, Invoice.id == Offer.invoice_id)
        .where(Invoice.business_id == profile.id)
        .options(joinedload(EMI.loan))
        .order_by(EMI.due_date.desc())
    )
    emis = result.scalars().all()
    
    return {
        "repayments": [
            {
                "id": str(emi.id),
                "loan_id": str(emi.loan_id),
                "amount": float(emi.amount),
                "due_date": emi.due_date.isoformat(),
                "status": emi.status,
            }
            for emi in emis
        ]
    }

@router.get("/{loan_id}")
async def get_loan(
    loan_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Loan).where(Loan.id == loan_id))
    loan = result.scalar_one_or_none()
    if not loan:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan not found")
    return {
        "loan_id": str(loan.id),
        "status": loan.status,
        "principal": float(loan.principal),
        "disbursed_amount": float(loan.disbursed_amount),
        "created_at": loan.created_at.isoformat(),
    }
