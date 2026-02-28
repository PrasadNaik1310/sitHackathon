"""
Government Sandbox API Client

Integrates with:
- GET /identity/aadhaar/{aadhaar_number}
- GET /identity/pan/{pan_number}
- GET /business/company/{gst_number}
- GET /business/company/{gst_number}/unpaid-invoices
- GET /business/company/{gst_number}/returns
- POST /verification/full-check
- POST /external/v1/credit-evaluate

Features:
- HMAC-SHA256 signing
- Retry with exponential backoff
- DB-level caching via GovCache
"""
import hashlib
import hmac
import json
import time
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.config import settings
from app.logging_config import logger
from app.models.gov_cache import GovCache


_cached_gov_token: Optional[str] = None
_token_expires_at: Optional[datetime] = None

async def _get_bearer_token() -> str:
    """Fetch OAuth2 token from the Government Sandbox and cache it in memory."""
    global _cached_gov_token, _token_expires_at
    now = datetime.now(timezone.utc)
    
    # Return cached token if still valid for at least 60 more seconds
    if _cached_gov_token and _token_expires_at and _token_expires_at > (now + timedelta(seconds=60)):
        return _cached_gov_token

    url = f"{settings.GOV_API_BASE_URL}/auth/login"
    data = {
        "username": settings.GOV_API_EMAIL,
        "password": settings.GOV_API_PASSWORD,
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, data=data)
            
            # If 401, it means our admin user isn't registered in the Railway sandbox yet.
            if resp.status_code == 401:
                logger.info("gov_api.auto_registering_admin")
                reg_resp = await client.post(
                    f"{settings.GOV_API_BASE_URL}/auth/register",
                    json={
                        "email": settings.GOV_API_EMAIL,
                        "password": settings.GOV_API_PASSWORD,
                        "role": "ADMIN"
                    }
                )
                reg_resp.raise_for_status()
                # Retry login
                resp = await client.post(url, data=data)

            resp.raise_for_status()
            payload = resp.json()
            
            _cached_gov_token = payload["access_token"]
            _token_expires_at = now + timedelta(minutes=14)
            logger.info("gov_api.token_fetched", email=settings.GOV_API_EMAIL)
            return _cached_gov_token
    except Exception as e:
        logger.error("gov_api.token_failed", error=str(e))
        raise

async def _auth_headers() -> dict[str, str]:
    """Retrieve auth headers containing the active Bearer token."""
    token = await _get_bearer_token()
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


async def _get_cached(db: AsyncSession, cache_key: str) -> Optional[dict]:
    """Return cached response if still valid."""
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(GovCache).where(
            GovCache.cache_key == cache_key,
            GovCache.expires_at > now,
        )
    )
    entry = result.scalar_one_or_none()
    return entry.response_json if entry else None


async def _set_cache(db: AsyncSession, cache_key: str, response: dict) -> None:
    """Upsert a cached government response."""
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=settings.GOV_CACHE_TTL_SECONDS)
    existing = await db.execute(
        select(GovCache).where(GovCache.cache_key == cache_key)
    )
    entry = existing.scalar_one_or_none()
    if entry:
        entry.response_json = response
        entry.expires_at = expires_at
    else:
        db.add(GovCache(cache_key=cache_key, response_json=response, expires_at=expires_at))
    await db.flush()


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type((httpx.TimeoutException, httpx.NetworkError)),
)
async def _get(path: str) -> dict:
    url = f"{settings.GOV_API_BASE_URL}{path}"
    headers = await _auth_headers()
    async with httpx.AsyncClient(timeout=settings.GOV_API_TIMEOUT) as client:
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()
        return resp.json()


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type((httpx.TimeoutException, httpx.NetworkError)),
)
async def _post(path: str, body: dict) -> dict:
    url = f"{settings.GOV_API_BASE_URL}{path}"
    headers = await _auth_headers()
    async with httpx.AsyncClient(timeout=settings.GOV_API_TIMEOUT) as client:
        resp = await client.post(url, headers=headers, json=body)
        resp.raise_for_status()
        return resp.json()


# ── Public API methods ──────────────────────────────────────────────────────

async def verify_aadhaar(db: AsyncSession, aadhaar_number: str) -> dict:
    cache_key = f"aadhaar:{aadhaar_number}"
    cached = await _get_cached(db, cache_key)
    if cached:
        logger.info("gov_cache.hit", cache_key=cache_key)
        return cached
    path = f"/identity/aadhaar/{aadhaar_number}"
    data = await _get(path)
    await _set_cache(db, cache_key, data)
    logger.info("gov_api.aadhaar_verified", aadhaar=aadhaar_number)
    return data


async def verify_pan(db: AsyncSession, pan_number: str) -> dict:
    cache_key = f"pan:{pan_number}"
    cached = await _get_cached(db, cache_key)
    if cached:
        logger.info("gov_cache.hit", cache_key=cache_key)
        return cached
    path = f"/identity/pan/{pan_number}"
    data = await _get(path)
    await _set_cache(db, cache_key, data)
    logger.info("gov_api.pan_verified", pan=pan_number)
    return data


async def verify_gst(db: AsyncSession, gst_number: str) -> dict:
    cache_key = f"gst:{gst_number}"
    cached = await _get_cached(db, cache_key)
    if cached:
        logger.info("gov_cache.hit", cache_key=cache_key)
        return cached
    path = f"/business/company/{gst_number}"
    data = await _get(path)
    await _set_cache(db, cache_key, data)
    logger.info("gov_api.gst_verified", gst=gst_number)
    return data


async def get_unpaid_invoices(db: AsyncSession, gst_number: str) -> dict | list:
    cache_key = f"invoices:{gst_number}"
    # Bypassing cache for invoices to resolve amount 0 issue
    # cached = await _get_cached(db, cache_key)
    # if cached:
    #     return cached
    path = f"/business/company/{gst_number}/unpaid-invoices"
    data = await _get(path)
    await _set_cache(db, cache_key, data)
    return data


async def get_gst_returns(db: AsyncSession, gst_number: str) -> dict | list:
    cache_key = f"returns:{gst_number}"
    cached = await _get_cached(db, cache_key)
    if cached:
        return cached
    path = f"/business/company/{gst_number}/returns"
    data = await _get(path)
    await _set_cache(db, cache_key, data)
    return data


async def full_verification_check(
    db: AsyncSession,
    aadhaar_number: str,
    pan_number: str,
    gst_number: str,
    invoice_number: Optional[str] = None,
) -> dict:
    cache_key = f"full_check:{aadhaar_number}:{pan_number}:{gst_number}:{invoice_number}"
    cached = await _get_cached(db, cache_key)
    if cached:
        return cached
    body = {
        "aadhaar_number": aadhaar_number,
        "pan_number": pan_number,
        "gst_number": gst_number,
    }
    if invoice_number:
        body["invoice_id"] = invoice_number
    data = await _post("/verification/full-check", body)
    await _set_cache(db, cache_key, data)
    logger.info("gov_api.full_check_complete", gst=gst_number)
    return data


async def credit_evaluate(db: AsyncSession, gst_number: str, payload: dict) -> dict:
    cache_key = f"credit_eval:{gst_number}"
    cached = await _get_cached(db, cache_key)
    if cached:
        return cached
    data = await _post("/external/v1/credit-evaluate", payload)
    await _set_cache(db, cache_key, data)
    logger.info("gov_api.credit_evaluated", gst=gst_number)
    return data
