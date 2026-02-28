"""
Pydantic schemas — request/response models for the entire API.
Separates validation from ORM models.
"""
import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, field_validator

from app.models.user import UserRole
from app.models.invoice import InvoiceStatus
from app.models.credit import (
    LoanType, OfferStatus, LoanStatus, EMIStatus, CollateralStatus, RiskGrade
)
from app.models.ledger import EntryType, AccountType


# ── Auth ──────────────────────────────────────────────────────────────────────

class SendOTPRequest(BaseModel):
    phone: str


class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str
    role: UserRole = UserRole.BORROWER


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user_id: str
    role: UserRole


class AccessTokenResponse(BaseModel):
    access_token: str
    token_type: str


# ── KYC ───────────────────────────────────────────────────────────────────────

class KYCRequest(BaseModel):
    aadhaar_number: str
    pan_number: str
    gst_number: str

    @field_validator("gst_number")
    @classmethod
    def gst_uppercase(cls, v: str) -> str:
        return v.strip().upper()

    @field_validator("pan_number")
    @classmethod
    def pan_uppercase(cls, v: str) -> str:
        return v.strip().upper()


class KYCResponse(BaseModel):
    message: str
    business_id: str
    gst_number: str
    credit_score: dict


# ── Business / Invoice ────────────────────────────────────────────────────────

class ActivityItem(BaseModel):
    id: str
    type: str
    title: str
    subtitle: str
    amount: float
    date: datetime

class DashboardResponse(BaseModel):
    available_limit: float
    credit_score: float
    risk_grade: RiskGrade
    active_loans_total: float
    next_emi_amount: Optional[float]
    next_emi_date: Optional[datetime]
    recent_activity: List[ActivityItem]

class BusinessProfileResponse(BaseModel):
    id: str
    user_id: str
    gst_number: str
    pan_number: str
    created_at: datetime

    model_config = {"from_attributes": True}


class InvoiceResponse(BaseModel):
    id: str
    business_id: str
    invoice_number: str
    amount: float
    due_date: datetime
    delay_days: int
    status: InvoiceStatus
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Offers ────────────────────────────────────────────────────────────────────

class GenerateOfferRequest(BaseModel):
    invoice_id: uuid.UUID


class OfferResponse(BaseModel):
    offer_id: str
    loan_type: LoanType
    percentage: float
    interest_rate: float
    tenure_months: int
    status: OfferStatus
    expires_at: datetime

    model_config = {"from_attributes": True}


# ── Loans ─────────────────────────────────────────────────────────────────────

class SanctionRequest(BaseModel):
    offer_id: uuid.UUID
    asset_description: Optional[str] = None
    asset_value: Optional[float] = None


class LoanResponse(BaseModel):
    loan_id: str
    status: LoanStatus
    principal: float
    disbursed_amount: float
    created_at: datetime

    model_config = {"from_attributes": True}


class CollateralResponse(BaseModel):
    id: str
    asset_description: str
    asset_value: float
    status: CollateralStatus

    model_config = {"from_attributes": True}


# ── Repayments ────────────────────────────────────────────────────────────────

class EMIResponse(BaseModel):
    emi_id: str
    due_date: datetime
    amount: float
    status: EMIStatus
    retry_count: int

    model_config = {"from_attributes": True}


# ── Credit Scoring ────────────────────────────────────────────────────────────

class CreditScoreResponse(BaseModel):
    id: str
    business_id: str
    external_score: float
    internal_score: float
    final_score: float
    risk_grade: RiskGrade
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Ledger ────────────────────────────────────────────────────────────────────

class LedgerSummaryItem(BaseModel):
    account_type: AccountType
    entry_type: EntryType
    total: float


# ── Admin ─────────────────────────────────────────────────────────────────────

class PortfolioSummaryResponse(BaseModel):
    aum: float
    performing_loans: int
    npa_loans: int
    npa_ratio_pct: float
    risk_distribution: dict
    seized_collateral_value: float


class AuditLogResponse(BaseModel):
    id: str
    actor_id: Optional[str]
    action: str
    entity_type: str
    entity_id: Optional[str]
    old_value: Optional[str]
    new_value: Optional[str]
    timestamp: datetime

    model_config = {"from_attributes": True}


class OverrideLoanRequest(BaseModel):
    new_status: LoanStatus


class BorrowerExposureItem(BaseModel):
    user_id: str
    phone: str
    exposure: float
