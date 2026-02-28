"""Admin router — portfolio monitoring, overrides, user management."""
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_admin
from app.database import get_db
from app.models.credit import LoanStatus
from app.models.user import User
from app.services.admin_service import (
    get_portfolio_summary,
    get_ledger_summary,
    get_audit_logs,
    override_loan_status,
    admin_freeze_user,
)

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/portfolio/summary")
async def portfolio_summary(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    return await get_portfolio_summary(db)


@router.get("/ledger/summary")
async def ledger_summary(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    return {"ledger": await get_ledger_summary(db)}


@router.get("/audit-logs")
async def audit_logs(
    entity_type: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    logs = await get_audit_logs(db, entity_type=entity_type, limit=limit)
    return {
        "logs": [
            {
                "id": str(log.id),
                "actor_id": str(log.actor_id) if log.actor_id else None,
                "action": log.action,
                "entity_type": log.entity_type,
                "entity_id": log.entity_id,
                "old_value": log.old_value,
                "new_value": log.new_value,
                "timestamp": log.timestamp.isoformat(),
            }
            for log in logs
        ]
    }


class OverrideLoanRequest(BaseModel):
    new_status: LoanStatus


@router.patch("/loans/{loan_id}/override")
async def override_loan(
    loan_id: uuid.UUID,
    body: OverrideLoanRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    loan = await override_loan_status(db, loan_id, body.new_status, admin)
    return {"message": "Loan status overridden", "loan_id": str(loan.id), "status": loan.status}


@router.post("/users/{user_id}/freeze")
async def freeze_user_endpoint(
    user_id: uuid.UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    await admin_freeze_user(db, user_id, admin)
    return {"message": f"User {user_id} has been frozen"}
