"""
Exposure Management Service

Checks per-user, per-GST, and portfolio-level exposure caps.
Used by offer engine before generating offers.
"""
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.business import BusinessProfile
from app.models.user import User
from app.services.credit_decision import (
    get_user_active_exposure,
    get_gst_active_exposure,
    get_portfolio_exposure,
)


async def check_exposure_caps(
    db: AsyncSession,
    user: User,
    profile: BusinessProfile,
    requested_amount: float,
) -> None:
    """
    Raise HTTPException if any exposure cap would be exceeded.
    """
    user_exposure = await get_user_active_exposure(db, user.id)
    if user_exposure + requested_amount > settings.PER_USER_EXPOSURE_CAP:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Per-user exposure cap exceeded. Current: {user_exposure:,.2f}, Cap: {settings.PER_USER_EXPOSURE_CAP:,.2f}",
        )

    gst_exposure = await get_gst_active_exposure(db, profile.gst_number)
    if gst_exposure + requested_amount > settings.PER_GST_EXPOSURE_CAP:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Per-GST exposure cap exceeded. Current: {gst_exposure:,.2f}, Cap: {settings.PER_GST_EXPOSURE_CAP:,.2f}",
        )

    portfolio_exposure = await get_portfolio_exposure(db)
    if portfolio_exposure + requested_amount > settings.PORTFOLIO_CAP:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Portfolio cap exceeded. Current: {portfolio_exposure:,.2f}, Cap: {settings.PORTFOLIO_CAP:,.2f}",
        )
