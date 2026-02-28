"""
Invoice Service — logic for syncing and managing invoices.
"""
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.integrations import government_client as gov
from app.logging_config import logger
from app.models.business import BusinessProfile
from app.models.invoice import Invoice, InvoiceStatus

async def sync_borrower_invoices(db: AsyncSession, profile: BusinessProfile) -> None:
    """Fetch unpaid invoices from Government API and persist them."""
    try:
        data = await gov.get_unpaid_invoices(db, profile.gst_number)
    except Exception as exc:
        logger.warning("invoice_sync.failed", gst=profile.gst_number, error=str(exc))
        return

    await persist_invoices(db, profile, data)

async def persist_invoices(db: AsyncSession, profile: BusinessProfile, data: dict | list) -> None:
    """Helper to upsert invoices into the local database."""
    if isinstance(data, list):
        invoices = data
    else:
        invoices = data.get("invoices", [])

    logger.info("invoice_sync.persisting", count=len(invoices))
    for inv in invoices:
        invoice_number = inv.get("invoice_number", f"INV-{profile.gst_number}")
        logger.info("invoice_sync.item_raw", invoice_number=invoice_number, data=inv)
        
        # Check if invoice already exists
        result = await db.execute(
            select(Invoice).where(
                Invoice.business_id == profile.id,
                Invoice.invoice_number == invoice_number
            )
        )
        invoice = result.scalar_one_or_none()

        # SANDBOX API uses 'grand_total' for amount and 'date' for the date
        amount = float(inv.get("grand_total", inv.get("amount", 0)))
        due_date_raw = inv.get("due_date") or inv.get("date", "2025-01-01")
        
        try:
            # Handle ISO format with 'Z'
            due_date = datetime.fromisoformat(due_date_raw.replace("Z", "+00:00"))
            if due_date.tzinfo is None:
                due_date = due_date.replace(tzinfo=timezone.utc)
        except Exception:
            due_date = datetime.now(timezone.utc)

        if invoice:
            logger.info("invoice_sync.updating", num=invoice_number, old_amt=float(invoice.amount), new_amt=amount)
            invoice.amount = amount
            invoice.due_date = due_date
            invoice.delay_days = int(inv.get("delay_days", 0))
        else:
            logger.info("invoice_sync.creating", num=invoice_number, amt=amount)
            invoice = Invoice(
                business_id=profile.id,
                invoice_number=invoice_number,
                amount=amount,
                due_date=due_date,
                delay_days=int(inv.get("delay_days", 0)),
                status=InvoiceStatus.UNPAID,
            )
            db.add(invoice)

    await db.flush()
    logger.info("invoice_sync.complete", gst=profile.gst_number, count=len(invoices))
