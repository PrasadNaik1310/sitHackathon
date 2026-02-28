"""Auth router — OTP flow + token management."""
from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import UserRole
from app.services import auth_service
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Authentication"])


class SendOTPRequest(BaseModel):
    phone: str


class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str
    role: UserRole = UserRole.BORROWER


class RefreshTokenRequest(BaseModel):
    refresh_token: str


@router.post("/otp/send")
async def send_otp(body: SendOTPRequest, db: AsyncSession = Depends(get_db)):
    otp = await auth_service.send_otp(db, body.phone)
    return {"message": "OTP sent", "otp_sandbox": otp}


@router.post("/otp/verify")
async def verify_otp(body: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.verify_otp_and_login(db, body.phone, body.otp, body.role)


@router.post("/token/refresh")
async def refresh_token(body: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.refresh_access_token(db, body.refresh_token)
