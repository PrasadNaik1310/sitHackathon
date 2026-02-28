"""
Admin Service

Portfolio monitoring, overrides, user freeze.
"""
from uuid import UUID
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select, func as safunc, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.audit import log_audit
from app.logging_config import logger
from app.models.audit import AuditLog
from app.models.business import BusinessProfile
from app.models.credit import (
    Loan, LoanStatus, Collateral, CollateralStatus, CreditScore,
)
from app.models.ledger import LedgerEntry
from app.models.invoice import Invoice, InvoiceStatus
from app.models.user import User
from app.services.auth_service import freeze_user as _freeze_user


async def get_portfolio_summary(db: AsyncSession) -> dict:
    """Return AUM, NPA ratio, risk distribution, collateral summary."""

    # AUM = disbursed_amount of ACTIVE loans
    aum_result = await db.execute(
        select(safunc.coalesce(safunc.sum(Loan.disbursed_amount), 0))
        .where(Loan.status == LoanStatus.ACTIVE)
    )
    aum = float(aum_result.scalar() or 0)

    # Performing loans count
    performing_result = await db.execute(
        select(safunc.count(Loan.id)).where(Loan.status == LoanStatus.ACTIVE)
    )
    performing = performing_result.scalar() or 0

    # NPA (default) count
    npa_result = await db.execute(
        select(safunc.count(Loan.id)).where(Loan.status == LoanStatus.DEFAULT)
    )
    npa = npa_result.scalar() or 0

    total_loans = performing + npa
    npa_ratio = (npa / total_loans * 100) if total_loans > 0 else 0

    # Risk distribution
    risk_dist_result = await db.execute(
        select(CreditScore.risk_grade, safunc.count(CreditScore.id))
        .group_by(CreditScore.risk_grade)
    )
    risk_distribution = {row[0]: row[1] for row in risk_dist_result.all()}

    # Seized collateral value
    seized_result = await db.execute(
        select(safunc.coalesce(safunc.sum(Collateral.asset_value), 0))
        .where(Collateral.status == CollateralStatus.SEIZED)
    )
    seized_value = float(seized_result.scalar() or 0)

    return {
        "aum": aum,
        "performing_loans": performing,
        "npa_loans": npa,
        "npa_ratio_pct": round(npa_ratio, 2),
        "risk_distribution": risk_distribution,
        "seized_collateral_value": seized_value,
    }


async def get_borrower_exposure(db: AsyncSession) -> list[dict]:
    """Per-borrower active exposure summary."""
    from app.models.credit import Offer as Offer_
    result = await db.execute(
        select(
            User.id,
            User.phone,
            safunc.coalesce(safunc.sum(Loan.disbursed_amount), 0).label("exposure"),
        )
        .join(BusinessProfile, BusinessProfile.user_id == User.id)
        .join(Invoice, Invoice.business_id == BusinessProfile.id)
        .join(Offer_, Offer_.invoice_id == Invoice.id)
        .join(Loan, Loan.offer_id == Offer_.id)
        .where(Loan.status.in_([LoanStatus.ACTIVE, LoanStatus.SANCTIONED]))
        .group_by(User.id, User.phone)
    )
    return [
        {"user_id": str(row.id), "phone": row.phone, "exposure": float(row.exposure)}
        for row in result.all()
    ]


async def get_ledger_summary(db: AsyncSession) -> list[dict]:
    result = await db.execute(
        select(
            LedgerEntry.account_type,
            LedgerEntry.entry_type,
            safunc.sum(LedgerEntry.amount).label("total"),
        ).group_by(LedgerEntry.account_type, LedgerEntry.entry_type)
    )
    return [
        {
            "account_type": row.account_type,
            "entry_type": row.entry_type,
            "total": float(row.total),
        }
        for row in result.all()
    ]


async def get_audit_logs(
    db: AsyncSession,
    entity_type: Optional[str] = None,
    limit: int = 100,
) -> list[AuditLog]:
    q = select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit)
    if entity_type:
        q = q.where(AuditLog.entity_type == entity_type)
    result = await db.execute(q)
    return result.scalars().all()


async def override_loan_status(
    db: AsyncSession,
    loan_id: UUID,
    new_status: LoanStatus,
    admin: User,
) -> Loan:
    result = await db.execute(select(Loan).where(Loan.id == loan_id))
    loan = result.scalar_one_or_none()
    if not loan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan not found")

    old_status = loan.status
    loan.status = new_status
    await db.flush()

    await log_audit(
        db,
        actor_id=admin.id,
        action="ADMIN_OVERRIDE_LOAN_STATUS",
        entity_type="Loan",
        entity_id=str(loan_id),
        old_value=old_status,
        new_value=new_status,
    )
    logger.info("admin.loan_override", loan_id=str(loan_id), new_status=new_status)
    return loan


async def admin_freeze_user(db: AsyncSession, user_id: UUID, admin: User) -> None:
    await _freeze_user(db, user_id)
    await log_audit(
        db,
        actor_id=admin.id,
        action="ADMIN_FREEZE_USER",
        entity_type="User",
        entity_id=str(user_id),
    )
