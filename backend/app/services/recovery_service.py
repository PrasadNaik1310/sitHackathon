"""
Recovery Service — manages post-default recovery actions.
"""
from uuid import UUID
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.audit import log_audit
from app.logging_config import logger
from app.models.credit import Loan, LoanStatus
from app.models.recovery import RecoveryAction, RecoveryActionType, RecoveryStatus
from app.models.user import User
from app.services.ledger_service import record_recovery


async def initiate_recovery(
    db: AsyncSession,
    loan_id: UUID,
    action_type: RecoveryActionType,
    notes: Optional[str],
    actor: User,
) -> RecoveryAction:
    """Initiate a recovery action on a defaulted loan."""
    loan_result = await db.execute(select(Loan).where(Loan.id == loan_id))
    loan = loan_result.scalar_one_or_none()
    if not loan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan not found")
    if loan.status != LoanStatus.DEFAULT:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Recovery can only be initiated on loans in DEFAULT status",
        )

    recovery = RecoveryAction(
        loan_id=loan_id,
        action_type=action_type,
        status=RecoveryStatus.INITIATED,
        notes=notes,
    )
    db.add(recovery)
    await db.flush()

    await log_audit(
        db,
        actor_id=actor.id,
        action="RECOVERY_INITIATED",
        entity_type="Loan",
        entity_id=str(loan_id),
        new_value={"action_type": action_type, "recovery_id": str(recovery.id)},
    )
    logger.info("recovery.initiated", loan_id=str(loan_id), action_type=action_type)
    return recovery


async def complete_recovery(
    db: AsyncSession,
    recovery_id: UUID,
    amount_recovered: float,
    actor: User,
) -> RecoveryAction:
    """Mark a recovery action as completed and record ledger entry."""
    result = await db.execute(
        select(RecoveryAction).where(RecoveryAction.id == recovery_id)
    )
    recovery = result.scalar_one_or_none()
    if not recovery:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recovery action not found")

    recovery.status = RecoveryStatus.COMPLETED
    recovery.amount_recovered = amount_recovered
    await db.flush()

    # Record recovery ledger entry
    await record_recovery(db, recovery.loan_id, amount_recovered)

    await log_audit(
        db,
        actor_id=actor.id,
        action="RECOVERY_COMPLETED",
        entity_type="RecoveryAction",
        entity_id=str(recovery_id),
        new_value={"amount_recovered": amount_recovered},
    )
    return recovery


async def list_recoveries(db: AsyncSession, loan_id: Optional[UUID] = None) -> list[RecoveryAction]:
    q = select(RecoveryAction).order_by(RecoveryAction.created_at.desc())
    if loan_id:
        q = q.where(RecoveryAction.loan_id == loan_id)
    result = await db.execute(q)
    return result.scalars().all()
