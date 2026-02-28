import enum
import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Numeric, func
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class EntryType(str, enum.Enum):
    DEBIT = "DEBIT"
    CREDIT = "CREDIT"


class AccountType(str, enum.Enum):
    BANK_CAPITAL = "BANK_CAPITAL"
    BORROWER = "BORROWER"
    RECOVERY = "RECOVERY"
    PROVISIONING = "PROVISIONING"


class LedgerEntry(Base):
    __tablename__ = "ledger_entries"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    loan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("loans.id", ondelete="CASCADE"), nullable=False
    )
    entry_type: Mapped[EntryType] = mapped_column(
        SAEnum(EntryType, name="entrytype"), nullable=False
    )
    account_type: Mapped[AccountType] = mapped_column(
        SAEnum(AccountType, name="accounttype"), nullable=False
    )
    amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    loan = relationship("Loan", back_populates="ledger_entries")
