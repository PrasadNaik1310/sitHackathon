"""
Invoices router — list invoices, get detail, manually add (sandbox).
"""
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.business import BusinessProfile
from app.models.invoice import Invoice, InvoiceStatus
from app.models.user import User
from app.schemas.schemas import InvoiceResponse

router = APIRouter(prefix="/invoices", tags=["Invoices"])


class AddInvoiceRequest(BaseModel):
    invoice_number: str
    amount: float
    due_date: datetime
    delay_days: int = 0


@router.get("/my", response_model=list[InvoiceResponse])
async def list_my_invoices(
    status_filter: Optional[InvoiceStatus] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all invoices for the current borrower's business profile."""
    bp_result = await db.execute(
        select(BusinessProfile).where(BusinessProfile.user_id == current_user.id)
    )
    profile = bp_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No business profile found. Please complete KYC first.",
        )

    from app.services import invoice_service
    await invoice_service.sync_borrower_invoices(db, profile)

    q = select(Invoice).where(Invoice.business_id == profile.id).order_by(Invoice.created_at.desc())
    if status_filter:
        q = q.where(Invoice.status == status_filter)

    result = await db.execute(q)
    invoices = result.scalars().all()
    return [
        InvoiceResponse(
            id=str(inv.id),
            business_id=str(inv.business_id),
            invoice_number=inv.invoice_number,
            amount=float(inv.amount),
            due_date=inv.due_date,
            delay_days=inv.delay_days,
            status=inv.status,
            created_at=inv.created_at,
        )
        for inv in invoices
    ]


@router.get("/{identifier}", response_model=InvoiceResponse)
async def get_invoice(
    identifier: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve an invoice by its internal UUID or its invoice number."""
    try:
        # Try if it's a UUID
        obj_id = uuid.UUID(identifier)
        q = select(Invoice).where(Invoice.id == obj_id)
    except ValueError:
        # Not a UUID, search by invoice_number
        q = select(Invoice).where(Invoice.invoice_number == identifier)

    result = await db.execute(q)
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    
    return InvoiceResponse(
        id=str(invoice.id),
        business_id=str(invoice.business_id),
        invoice_number=invoice.invoice_number,
        amount=float(invoice.amount),
        due_date=invoice.due_date,
        delay_days=invoice.delay_days,
        status=invoice.status,
        created_at=invoice.created_at,
    )


@router.post("/add", response_model=InvoiceResponse)
async def add_invoice(
    body: AddInvoiceRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Manually add an invoice (for sandbox / testing). In production, invoices sync from Gov API."""
    bp_result = await db.execute(
        select(BusinessProfile).where(BusinessProfile.user_id == current_user.id)
    )
    profile = bp_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No business profile found. Please complete KYC first.",
        )

    due_date = body.due_date
    if due_date.tzinfo is None:
        due_date = due_date.replace(tzinfo=timezone.utc)

    invoice = Invoice(
        business_id=profile.id,
        invoice_number=body.invoice_number,
        amount=body.amount,
        due_date=due_date,
        delay_days=body.delay_days,
        status=InvoiceStatus.UNPAID,
    )
    db.add(invoice)
    await db.flush()

    return InvoiceResponse(
        id=str(invoice.id),
        business_id=str(invoice.business_id),
        invoice_number=invoice.invoice_number,
        amount=float(invoice.amount),
        due_date=invoice.due_date,
        delay_days=invoice.delay_days,
        status=invoice.status,
        created_at=invoice.created_at,
    )
