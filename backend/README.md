# GST Banking Credit Lifecycle System

Production-ready FastAPI backend for Government-Integrated Banking Credit Lifecycle System for GST-based Invoice Discounting.

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set environment variables
copy .env.example .env        # Windows
# cp .env.example .env        # Linux/macOS
# Edit DATABASE_URL, GOV_API_KEY, GOV_API_SECRET

# 3. Start PostgreSQL (or use Docker Compose below)
# psql -U postgres -c "CREATE DATABASE gst_credit_db;"

# 4. Run
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Docker (One Command)

```bash
docker-compose up --build
```

→ API: http://localhost:8000/docs

## Complete API Reference

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/auth/otp/send` | Public | Request OTP |
| POST | `/auth/otp/verify` | Public | Verify OTP → JWT + refresh token |
| POST | `/auth/token/refresh` | Public | Get new access token |
| POST | `/kyc/onboard` | BORROWER | Aadhaar+PAN+GST verification & onboarding |
| GET  | `/businesses/me` | BORROWER | View my business profile |
| GET  | `/businesses/me/credit-score` | BORROWER | Get latest credit score |
| POST | `/businesses/me/credit-score/recalculate` | BORROWER | Force recalculate |
| GET  | `/businesses/{id}/collaterals` | Any | List collaterals for a business |
| GET  | `/invoices/my` | BORROWER | List my invoices (filter by status) |
| GET  | `/invoices/{id}` | Any | Get invoice details |
| POST | `/invoices/add` | BORROWER | Manually add invoice (sandbox) |
| POST | `/offers/generate` | BORROWER | Generate SECURED + UNSECURED offers |
| GET  | `/offers/invoice/{id}` | Any | List offers for invoice |
| POST | `/loans/sanction` | BORROWER | Accept offer → Sanction + Disburse |
| GET  | `/loans/{id}` | Any | Get loan details |
| GET  | `/repayments/loan/{id}/emis` | Any | List EMI schedule |
| POST | `/repayments/emi/{id}/pay` | BORROWER | Pay an EMI |
| POST | `/repayments/emi/{id}/bounce` | Any | Mark EMI as bounced |
| POST | `/recovery/initiate` | OFFICER/ADMIN | Initiate recovery on defaulted loan |
| POST | `/recovery/{id}/complete` | OFFICER/ADMIN | Complete recovery + record amount |
| GET  | `/recovery/` | OFFICER/ADMIN | List recovery actions |
| GET  | `/admin/portfolio/summary` | ADMIN | AUM, NPA ratio, risk distribution |
| GET  | `/admin/ledger/summary` | ADMIN | Ledger totals by account |
| GET  | `/admin/audit-logs` | ADMIN | Full audit log history |
| PATCH | `/admin/loans/{id}/override` | ADMIN | Override loan status |
| POST | `/admin/users/{id}/freeze` | ADMIN | Freeze user (revokes all tokens) |
| GET  | `/health` | Public | Health check |

## Credit Lifecycle Flow

```
POST /auth/otp/send → POST /auth/otp/verify
         ↓
POST /kyc/onboard  (Aadhaar + PAN + GST)
         ↓
POST /invoices/add  (sandbox: manually add invoice)
         ↓
POST /offers/generate  (SELECT FOR UPDATE → 2 offers)
         ↓
POST /loans/sanction  (accept offer → Sanction → Disburse)
         ↓
POST /repayments/emi/{id}/pay  (per EMI)
         ↓ (if bounced ≥2 times)
POST /recovery/initiate → POST /recovery/{id}/complete
```

## Background Jobs

| Job | Schedule | Action |
|-----|--------|--------|
| Offer Expiry | Every 15 min | Expire stale offers, revert invoice status |
| EMI Reminders | Daily 09:00 | Notify upcoming EMIs |
| NPA Classification | Daily 01:00 | Auto-default overdue loans |
| Risk Recalculation | Sunday 02:00 | Recalculate all credit scores |
