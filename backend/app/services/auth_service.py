"""
Auth service: OTP flow, JWT issuance, token refresh, user freeze.
"""
from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.security import (
    generate_otp, hash_otp, verify_otp_hash,
    generate_refresh_token, hash_refresh_token,
    create_access_token,
)
from app.logging_config import logger
from app.models.user import User, UserRole, OTPTable, RefreshToken, RateLimit

OTP_EXPIRY_MINUTES = 10
MAX_OTP_ATTEMPTS = 5


async def _check_rate_limit(db: AsyncSession, identity: str) -> None:
    now = datetime.now(timezone.utc)
    window_start = now - timedelta(seconds=settings.RATE_LIMIT_WINDOW_SECONDS)

    result = await db.execute(
        select(RateLimit).where(RateLimit.identity == identity)
    )
    rl = result.scalar_one_or_none()

    if rl is None:
        db.add(RateLimit(identity=identity, request_count=1, window_start=now))
        await db.flush()
        return

    if rl.window_start < window_start:
        rl.request_count = 1
        rl.window_start = now
        await db.flush()
        return

    if rl.request_count >= settings.RATE_LIMIT_REQUESTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Try after some time.",
        )
    rl.request_count += 1
    await db.flush()


async def send_otp(db: AsyncSession, phone: str) -> str:
    """Generate and store OTP for phone. Returns OTP (for sandbox logging)."""
    await _check_rate_limit(db, f"otp:{phone}")
    otp = generate_otp()
    otp_hash = hash_otp(otp)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)

    existing = await db.execute(select(OTPTable).where(OTPTable.phone == phone))
    row = existing.scalar_one_or_none()
    if row:
        row.otp_hash = otp_hash
        row.expires_at = expires_at
        row.attempts = 0
    else:
        db.add(OTPTable(phone=phone, otp_hash=otp_hash, expires_at=expires_at, attempts=0))

    await db.flush()
    logger.info("otp.generated", phone=phone)

    # Dispatch via WhatsApp Integration
    from app.integrations.whatsapp_client import send_whatsapp_message
    await send_whatsapp_message(to_phone=phone, otp=otp)
    
    return otp


async def verify_otp_and_login(
    db: AsyncSession, phone: str, otp: str, role: UserRole = UserRole.BORROWER
) -> dict:
    """Verify OTP, create/fetch user, return JWT + refresh token."""
    now = datetime.now(timezone.utc)

    result = await db.execute(select(OTPTable).where(OTPTable.phone == phone))
    otp_row = result.scalar_one_or_none()

    if not otp_row:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP not found")

    if otp_row.expires_at.replace(tzinfo=timezone.utc) < now:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP expired")

    if otp_row.attempts >= MAX_OTP_ATTEMPTS:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many attempts")

    if not verify_otp_hash(otp, otp_row.otp_hash):
        otp_row.attempts += 1
        await db.flush()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP")

    # OTP valid — fetch or create user
    user_result = await db.execute(select(User).where(User.phone == phone))
    user = user_result.scalar_one_or_none()
    if not user:
        user = User(phone=phone, role=role, is_verified=True)
        db.add(user)
        await db.flush()

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is frozen")

    # Clean up OTP
    await db.delete(otp_row)
    await db.flush()

    # Issue tokens
    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    raw_refresh = generate_refresh_token()
    token_hash = hash_refresh_token(raw_refresh)
    refresh_expires = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    db.add(RefreshToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=refresh_expires,
    ))
    await db.flush()
    logger.info("auth.login_success", user_id=str(user.id))

    return {
        "access_token": access_token,
        "refresh_token": raw_refresh,
        "token_type": "bearer",
        "user_id": str(user.id),
        "role": user.role,
    }


async def refresh_access_token(db: AsyncSession, raw_refresh: str) -> dict:
    token_hash = hash_refresh_token(raw_refresh)
    now = datetime.now(timezone.utc)

    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked == False,
            RefreshToken.expires_at > now,
        )
    )
    rt = result.scalar_one_or_none()
    if not rt:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user_result = await db.execute(select(User).where(User.id == rt.user_id))
    user = user_result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account frozen or not found")

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}


async def freeze_user(db: AsyncSession, user_id: UUID) -> None:
    """Admin: freeze user and revoke all refresh tokens."""
    await db.execute(
        update(User).where(User.id == user_id).values(is_active=False)
    )
    await db.execute(
        update(RefreshToken).where(RefreshToken.user_id == user_id).values(revoked=True)
    )
    await db.flush()
    logger.info("auth.user_frozen", user_id=str(user_id))
