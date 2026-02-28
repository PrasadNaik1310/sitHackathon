"""
RecoveryAction model — tracks recovery actions post-default.
"""
import enum
import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Numeric, func
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class RecoveryActionType(str, enum.Enum):
    COLLATERAL_SEIZURE = "COLLATERAL_SEIZURE"
    LEGAL_NOTICE = "LEGAL_NOTICE"
    SETTLEMENT = "SETTLEMENT"
    WRITE_OFF = "WRITE_OFF"


class RecoveryStatus(str, enum.Enum):
    INITIATED = "INITIATED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class RecoveryAction(Base):
    __tablename__ = "recovery_actions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    loan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("loans.id", ondelete="CASCADE"), nullable=False
    )
    action_type: Mapped[RecoveryActionType] = mapped_column(
        SAEnum(RecoveryActionType, name="recoveryactiontype"), nullable=False
    )
    status: Mapped[RecoveryStatus] = mapped_column(
        SAEnum(RecoveryStatus, name="recoverystatus"),
        nullable=False,
        default=RecoveryStatus.INITIATED,
    )
    amount_recovered: Mapped[float] = mapped_column(Numeric(15, 2), nullable=True)
    notes: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
