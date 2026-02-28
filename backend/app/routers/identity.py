"""
Identity pass-through router.
Exposes direct lookups to the Government Sandbox API for the frontend.
"""
from fastapi import APIRouter, Depends, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database import get_db
from app.integrations import government_client as gov
from app.models.user import User

router = APIRouter(prefix="/identity", tags=["Identity Lookups"])


@router.get("/aadhaar/{aadhaar_number}")
async def get_aadhaar_info(
    aadhaar_number: str = Path(..., min_length=12, max_length=12),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch Aadhaar details from the Government Sandbox."""
    return await gov.verify_aadhaar(db, aadhaar_number)


@router.get("/pan/{pan_number}")
async def get_pan_info(
    pan_number: str = Path(..., min_length=10, max_length=10),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch PAN details from the Government Sandbox."""
    return await gov.verify_pan(db, pan_number)
