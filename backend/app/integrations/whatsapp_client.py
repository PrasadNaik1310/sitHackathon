"""
WhatsApp Notification Service

Handles sending OTPs and important alerts via WhatsApp.
"""
import httpx
from app.config import settings
from app.logging_config import logger


async def send_whatsapp_message(to_phone: str, otp: str) -> bool:
    """
    Send a WhatsApp OTP message using AutomateX India API.
    """
    url = "https://automatexindia.com/api/v1/whatsapp/send/template"

    # API credentials provided by user
    payload = {
        "apiToken": "10246|fXbANWcEylCgH5mEE7vYMWka9XFPKTFa6a8rUeEj4d3f6327",
        "phone_number_id": "199945969862737",
        "template_id": "274017",
        "templateVariable-calling-1": otp,
        "phone_number": to_phone
    }

    try:
        # AutomateX expects form-data (-d curl requests)
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, data=payload)
            response.raise_for_status()
            logger.info("whatsapp.sent_success", phone=to_phone, response=response.text[:100])
            return True
    except httpx.HTTPError as e:
        logger.error("whatsapp.send_failed", phone=to_phone, error=str(e))
        return False
    except Exception as e:
        logger.error("whatsapp.send_error", phone=to_phone, error=str(e))
        return False
