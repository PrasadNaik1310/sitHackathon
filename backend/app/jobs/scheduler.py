"""
Background Jobs — APScheduler

Jobs:
1. expire_offers    — every 15 minutes
2. emi_reminders    — daily at 09:00
3. npa_classifier   — daily at 01:00
4. risk_recalculate — weekly on Sunday at 02:00
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from app.logging_config import logger

scheduler = AsyncIOScheduler()


def setup_scheduler(app) -> AsyncIOScheduler:
    from app.jobs.offer_expiry import expire_offers_job
    from app.jobs.emi_reminders import emi_reminder_job
    from app.jobs.npa_classifier import npa_classification_job
    from app.jobs.risk_recalculator import risk_recalculation_job

    scheduler.add_job(
        expire_offers_job,
        trigger=IntervalTrigger(minutes=15),
        id="expire_offers",
        name="Expire stale offers",
        replace_existing=True,
    )
    scheduler.add_job(
        emi_reminder_job,
        trigger=CronTrigger(hour=9, minute=0),
        id="emi_reminders",
        name="Send EMI reminders",
        replace_existing=True,
    )
    scheduler.add_job(
        npa_classification_job,
        trigger=CronTrigger(hour=1, minute=0),
        id="npa_classifier",
        name="NPA classification check",
        replace_existing=True,
    )
    scheduler.add_job(
        risk_recalculation_job,
        trigger=CronTrigger(day_of_week="sun", hour=2, minute=0),
        id="risk_recalculate",
        name="Weekly risk recalculation",
        replace_existing=True,
    )

    logger.info("scheduler.configured", job_count=4)
    return scheduler
