"""
Ledger Service — Double-entry bookkeeping.
"""
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ledger import LedgerEntry, EntryType, AccountType


async def record_disbursement(db: AsyncSession, loan_id: UUID, amount: float) -> None:
    """Debit BANK_CAPITAL, Credit BORROWER."""
    db.add(LedgerEntry(
        loan_id=loan_id,
        entry_type=EntryType.DEBIT,
        account_type=AccountType.BANK_CAPITAL,
        amount=amount,
        description="Loan disbursement — bank capital debit",
    ))
    db.add(LedgerEntry(
        loan_id=loan_id,
        entry_type=EntryType.CREDIT,
        account_type=AccountType.BORROWER,
        amount=amount,
        description="Loan disbursement — borrower credit",
    ))
    await db.flush()


async def record_repayment(db: AsyncSession, loan_id: UUID, amount: float) -> None:
    """Debit BORROWER, Credit BANK_CAPITAL."""
    db.add(LedgerEntry(
        loan_id=loan_id,
        entry_type=EntryType.DEBIT,
        account_type=AccountType.BORROWER,
        amount=amount,
        description="EMI repayment — borrower debit",
    ))
    db.add(LedgerEntry(
        loan_id=loan_id,
        entry_type=EntryType.CREDIT,
        account_type=AccountType.BANK_CAPITAL,
        amount=amount,
        description="EMI repayment — bank capital credit",
    ))
    await db.flush()


async def record_provisioning(db: AsyncSession, loan_id: UUID, amount: float) -> None:
    """NPA provisioning entry."""
    db.add(LedgerEntry(
        loan_id=loan_id,
        entry_type=EntryType.DEBIT,
        account_type=AccountType.PROVISIONING,
        amount=amount,
        description="NPA provisioning — loan defaulted",
    ))
    await db.flush()


async def record_recovery(db: AsyncSession, loan_id: UUID, amount: float) -> None:
    """Recovery credit entry."""
    db.add(LedgerEntry(
        loan_id=loan_id,
        entry_type=EntryType.CREDIT,
        account_type=AccountType.RECOVERY,
        amount=amount,
        description="Recovery action — collateral seized",
    ))
    await db.flush()
