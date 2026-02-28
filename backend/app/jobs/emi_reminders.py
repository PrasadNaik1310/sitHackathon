"""EMI reminder background job."""
from datetime import datetime, timezone, timedelta

from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.logging_config import logger
from app.models.credit import EMI, EMIStatus


async def emi_reminder_job() -> None:
    async with AsyncSessionLocal() as db:
        try:
            now = datetime.now(timezone.utc)
            reminder_threshold = now + timedelta(days=3)

            result = await db.execute(
                select(EMI).where(
                    EMI.status == EMIStatus.PENDING,
                    EMI.due_date <= reminder_threshold,
                    EMI.due_date >= now,
                )
            )
            upcoming = result.scalars().all()

            # In production: send SMS/push notification
            for emi in upcoming:
                logger.info(
                    "job.emi_reminder",
                    emi_id=str(emi.id),
                    loan_id=str(emi.loan_id),
                    due_date=emi.due_date.isoformat(),
                    amount=float(emi.amount),
                )

            await db.commit()
            logger.info("job.emi_reminders_sent", count=len(upcoming))
        except Exception as exc:
            await db.rollback()
            logger.error("job.emi_reminder.error", error=str(exc))
