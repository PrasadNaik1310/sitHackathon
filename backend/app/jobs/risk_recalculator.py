"""Weekly risk recalculation background job."""
from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.logging_config import logger
from app.models.business import BusinessProfile
from app.services.scoring_service import calculate_credit_score


async def risk_recalculation_job() -> None:
    """Recalculate credit scores for all active businesses."""
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(select(BusinessProfile))
            profiles = result.scalars().all()

            for profile in profiles:
                try:
                    await calculate_credit_score(db, profile.id)
                except Exception as exc:
                    logger.warning("job.risk_recalc.profile_error", profile_id=str(profile.id), error=str(exc))

            await db.commit()
            logger.info("job.risk_recalculation_complete", count=len(profiles))
        except Exception as exc:
            await db.rollback()
            logger.error("job.risk_recalculation.error", error=str(exc))
