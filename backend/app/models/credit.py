import enum
import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Numeric, Integer, Float, func
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class RiskGrade(str, enum.Enum):
    A = "A"
    B = "B"
    C = "C"


class LoanType(str, enum.Enum):
    SECURED = "SECURED"
    UNSECURED = "UNSECURED"


class OfferStatus(str, enum.Enum):
    GENERATED = "GENERATED"
    ACCEPTED = "ACCEPTED"
    EXPIRED = "EXPIRED"


class LoanStatus(str, enum.Enum):
    SANCTIONED = "SANCTIONED"
    ACTIVE = "ACTIVE"
    CLOSED = "CLOSED"
    DEFAULT = "DEFAULT"


class EMIStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    BOUNCED = "BOUNCED"


class CollateralStatus(str, enum.Enum):
    PLEDGED = "PLEDGED"
    SEIZED = "SEIZED"
    RELEASED = "RELEASED"


class CreditScore(Base):
    __tablename__ = "credit_scores"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("business_profiles.id", ondelete="CASCADE"), nullable=False
    )
    external_score: Mapped[float] = mapped_column(Float, nullable=False)
    internal_score: Mapped[float] = mapped_column(Float, nullable=False)
    final_score: Mapped[float] = mapped_column(Float, nullable=False)
    risk_grade: Mapped[RiskGrade] = mapped_column(
        SAEnum(RiskGrade, name="riskgrade"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    business = relationship("BusinessProfile", back_populates="credit_scores")


class Offer(Base):
    __tablename__ = "offers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    invoice_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False
    )
    loan_type: Mapped[LoanType] = mapped_column(
        SAEnum(LoanType, name="loantype"), nullable=False
    )
    percentage: Mapped[float] = mapped_column(Float, nullable=False)
    interest_rate: Mapped[float] = mapped_column(Float, nullable=False)
    tenure_months: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[OfferStatus] = mapped_column(
        SAEnum(OfferStatus, name="offerstatus"), nullable=False, default=OfferStatus.GENERATED
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    invoice = relationship("Invoice", back_populates="offers")
    loans = relationship("Loan", back_populates="offer")


class Loan(Base):
    __tablename__ = "loans"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    offer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("offers.id", ondelete="RESTRICT"), nullable=False
    )
    status: Mapped[LoanStatus] = mapped_column(
        SAEnum(LoanStatus, name="loanstatus"), nullable=False, default=LoanStatus.SANCTIONED
    )
    principal: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    disbursed_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    offer = relationship("Offer", back_populates="loans")
    emis = relationship("EMI", back_populates="loan")
    collaterals = relationship("Collateral", back_populates="loan")
    ledger_entries = relationship("LedgerEntry", back_populates="loan")


class EMI(Base):
    __tablename__ = "emis"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    loan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("loans.id", ondelete="CASCADE"), nullable=False
    )
    due_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    status: Mapped[EMIStatus] = mapped_column(
        SAEnum(EMIStatus, name="emistatus"), nullable=False, default=EMIStatus.PENDING
    )
    retry_count: Mapped[int] = mapped_column(Integer, default=0)

    loan = relationship("Loan", back_populates="emis")


class Collateral(Base):
    __tablename__ = "collaterals"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    loan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("loans.id", ondelete="CASCADE"), nullable=False
    )
    asset_description: Mapped[str] = mapped_column(String(500), nullable=False)
    asset_value: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    status: Mapped[CollateralStatus] = mapped_column(
        SAEnum(CollateralStatus, name="collateralstatus"),
        nullable=False,
        default=CollateralStatus.PLEDGED,
    )

    loan = relationship("Loan", back_populates="collaterals")
