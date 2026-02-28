"""Offer expiry background job."""
from datetime import datetime, timezone

from sqlalchemy import update, select

from app.database import AsyncSessionLocal
from app.logging_config import logger
from app.models.credit import Offer, OfferStatus
from app.models.invoice import Invoice, InvoiceStatus


async def expire_offers_job() -> None:
    async with AsyncSessionLocal() as db:
        try:
            now = datetime.now(timezone.utc)
            result = await db.execute(
                select(Offer).where(
                    Offer.status == OfferStatus.GENERATED,
                    Offer.expires_at <= now,
                )
            )
            expired_offers = result.scalars().all()

            for offer in expired_offers:
                offer.status = OfferStatus.EXPIRED
                # Revert invoice to UNPAID if no other active offers
                other_active = await db.execute(
                    select(Offer).where(
                        Offer.invoice_id == offer.invoice_id,
                        Offer.status == OfferStatus.GENERATED,
                        Offer.id != offer.id,
                    )
                )
                if not other_active.scalar_one_or_none():
                    await db.execute(
                        update(Invoice)
                        .where(Invoice.id == offer.invoice_id, Invoice.status == InvoiceStatus.OFFER_GENERATED)
                        .values(status=InvoiceStatus.UNPAID)
                    )
            await db.commit()
            logger.info("job.offer_expiry", count=len(expired_offers))
        except Exception as exc:
            await db.rollback()
            logger.error("job.offer_expiry.error", error=str(exc))
