"""NPA classification background job."""
from datetime import datetime, timezone

from sqlalchemy import select, update

from app.database import AsyncSessionLocal
from app.logging_config import logger
from app.models.credit import EMI, EMIStatus, Loan, LoanStatus
from app.services.repayment_service import _trigger_default


async def npa_classification_job() -> None:
    """Mark loans with bounced EMIs past retry threshold as DEFAULT."""
    async with AsyncSessionLocal() as db:
        try:
            now = datetime.now(timezone.utc)

            # Find ACTIVE loans with due EMIs past due date and PENDING status
            result = await db.execute(
                select(EMI).where(
                    EMI.status == EMIStatus.PENDING,
                    EMI.due_date < now,
                )
            )
            overdue_emis = result.scalars().all()

            processed = 0
            for emi in overdue_emis:
                # Check loan status
                loan_result = await db.execute(
                    select(Loan).where(Loan.id == emi.loan_id, Loan.status == LoanStatus.ACTIVE)
                )
                loan = loan_result.scalar_one_or_none()
                if not loan:
                    continue

                emi.status = EMIStatus.BOUNCED
                emi.retry_count += 1

                if emi.retry_count >= 2:
                    await _trigger_default(db, emi.loan_id)
                    processed += 1

            await db.commit()
            logger.info("job.npa_classification", defaulted_loans=processed)
        except Exception as exc:
            await db.rollback()
            logger.error("job.npa_classification.error", error=str(exc))
