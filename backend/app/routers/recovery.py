"""
Recovery router — officer/admin-only recovery action management.
"""
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_officer
from app.database import get_db
from app.models.recovery import RecoveryActionType
from app.models.user import User
from app.services.recovery_service import initiate_recovery, complete_recovery, list_recoveries

router = APIRouter(prefix="/recovery", tags=["Recovery"])


class InitiateRecoveryRequest(BaseModel):
    loan_id: uuid.UUID
    action_type: RecoveryActionType
    notes: Optional[str] = None


class CompleteRecoveryRequest(BaseModel):
    amount_recovered: float


@router.post("/initiate")
async def initiate_recovery_endpoint(
    body: InitiateRecoveryRequest,
    officer: User = Depends(require_officer),
    db: AsyncSession = Depends(get_db),
):
    recovery = await initiate_recovery(db, body.loan_id, body.action_type, body.notes, officer)
    return {
        "message": "Recovery initiated",
        "recovery_id": str(recovery.id),
        "loan_id": str(recovery.loan_id),
        "action_type": recovery.action_type,
        "status": recovery.status,
    }


@router.post("/{recovery_id}/complete")
async def complete_recovery_endpoint(
    recovery_id: uuid.UUID,
    body: CompleteRecoveryRequest,
    officer: User = Depends(require_officer),
    db: AsyncSession = Depends(get_db),
):
    recovery = await complete_recovery(db, recovery_id, body.amount_recovered, officer)
    return {
        "message": "Recovery completed",
        "recovery_id": str(recovery.id),
        "amount_recovered": float(recovery.amount_recovered),
        "status": recovery.status,
    }


@router.get("/")
async def list_recoveries_endpoint(
    loan_id: Optional[uuid.UUID] = Query(None),
    officer: User = Depends(require_officer),
    db: AsyncSession = Depends(get_db),
):
    recoveries = await list_recoveries(db, loan_id=loan_id)
    return {
        "recoveries": [
            {
                "id": str(r.id),
                "loan_id": str(r.loan_id),
                "action_type": r.action_type,
                "status": r.status,
                "amount_recovered": float(r.amount_recovered) if r.amount_recovered else None,
                "notes": r.notes,
                "created_at": r.created_at.isoformat(),
            }
            for r in recoveries
        ]
    }
