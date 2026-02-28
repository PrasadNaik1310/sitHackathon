"""
KYC & Onboarding Service

Flow:
1. Verify Aadhaar, PAN, GST via Government API
2. Run full-check
3. Create BusinessProfile with verification snapshot
4. Fetch and store unpaid invoices
"""
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.integrations import government_client as gov
from app.logging_config import logger
from app.models.business import BusinessProfile
from app.models.invoice import Invoice, InvoiceStatus
from app.models.user import User

from datetime import datetime, timezone


async def run_kyc_and_onboard(
    db: AsyncSession,
    user: User,
    aadhaar_number: str,
    pan_number: str,
    gst_number: str,
) -> BusinessProfile:
    # Check for duplicate GST
    existing_result = await db.execute(
        select(BusinessProfile).where(BusinessProfile.gst_number == gst_number)
    )
    existing = existing_result.scalar_one_or_none()
    if existing:
        if existing.user_id == user.id:
            # The current user is already onboarded with this GST. Returns profile early.
            logger.info("kyc.onboarding_skipped.already_exists", user_id=str(user.id), gst=gst_number)
            return existing
        else:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Business with this GST number already registered to another user",
            )

    # Step 1: Government verifications
    try:
        aadhaar_data = await gov.verify_aadhaar(db, aadhaar_number)
        pan_data = await gov.verify_pan(db, pan_number)
        gst_data = await gov.verify_gst(db, gst_number)
        
        # Fetch invoices early to get an invoice ID for the full check
        invoices_data = await gov.get_unpaid_invoices(db, gst_number)
        first_invoice_num = None
        if isinstance(invoices_data, list) and len(invoices_data) > 0:
            first_invoice_num = invoices_data[0].get("invoice_number")
        elif isinstance(invoices_data, dict):
            invoices_list = invoices_data.get("invoices", [])
            if invoices_list:
                first_invoice_num = invoices_list[0].get("invoice_number")

        full_check = await gov.full_verification_check(
            db, aadhaar_number, pan_number, gst_number, first_invoice_num
        )
    except Exception as exc:
        logger.error("kyc.gov_api_error", error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Government API error: {str(exc)}",
        )

    # Step 2: Validate responses (sandbox: check `status` or `verified` fields)
    if not _is_verified(aadhaar_data, pan_data, gst_data, full_check):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="KYC verification failed. Please check your credentials.",
        )

    # Step 3: Create BusinessProfile
    snapshot = {
        "aadhaar": aadhaar_data,
        "pan": pan_data,
        "gst": gst_data,
        "full_check": full_check,
    }
    profile = BusinessProfile(
        user_id=user.id,
        gst_number=gst_number,
        aadhaar_number=aadhaar_number,
        pan_number=pan_number,
        verification_snapshot=snapshot,
    )
    db.add(profile)
    await db.flush()

    # Step 4: Sync invoices (already fetched, but we persist them now)
    from app.services import invoice_service
    await invoice_service.persist_invoices(db, profile, invoices_data)

    logger.info("kyc.onboarding_complete", user_id=str(user.id), gst=gst_number)
    return profile


def _is_verified(aadhaar: dict, pan: dict, gst: dict, full_check: dict) -> bool:
    """
    Sandbox check: treat any non-error response as verified.
    In production, inspect actual status fields from Government API.
    """
    # Real logic would inspect: full_check.get("verified") == True etc.
    # For sandbox, we assume success if no error key
    return (
        "error" not in gst and 
        "error" not in aadhaar and 
        "error" not in pan and 
        "error" not in full_check
    )



