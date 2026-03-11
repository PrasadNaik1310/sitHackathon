# GST Banking Credit Lifecycle System

A production-ready, government-integrated fintech platform for **GST-based invoice discounting and credit management**. Built as a hackathon project, this system enables small and medium businesses to access quick credit by leveraging their GST compliance data and invoices as collateral.

## Overview

The platform automates the entire credit lifecycle:

**KYC Verification → Risk Assessment → Credit Scoring → Offer Generation → Loan Sanctioning → Disbursement → EMI Repayment → Default Recovery**

Borrowers (GST-registered businesses) submit invoices, receive financing offers, accept loans, and manage repayments through a mobile-first frontend. Admins and credit officers manage operations and portfolio analytics via dedicated backend APIs.

---

## Repository Structure

```
sitHackathon/
├── backend/    # FastAPI REST API (Python)
└── frontend/   # React + TypeScript + Vite web app
```

---

## Tech Stack

### Backend
| Category | Technology |
|----------|-----------|
| Framework | FastAPI 0.111 |
| Language | Python 3.x |
| Database | PostgreSQL (async via asyncpg) |
| ORM | SQLAlchemy 2.0 (async) |
| Migrations | Alembic |
| Authentication | JWT + OTP (phone-based) |
| Scheduled Jobs | APScheduler |
| Containerization | Docker + Docker Compose |

### Frontend
| Category | Technology |
|----------|-----------|
| Framework | React 19 |
| Language | TypeScript 5 |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| Routing | React Router DOM 7 |
| HTTP Client | Axios |
| Animations | Framer Motion |

---

## Key Features

### Authentication & Onboarding
- OTP-based login via phone number
- JWT access tokens (15-min) + refresh tokens (7-day)
- KYC verification integrating with government APIs (Aadhaar, PAN, GST)

### Credit Lifecycle
1. **Risk Assessment** — Hybrid credit scoring: 60% external (government data) + 40% internal (behavioral), producing risk grades A / B / C
2. **Offer Generation** — Secured and unsecured loan offers with risk-based pricing (12–16% interest, 12–60 month tenures), auto-expiring after 24 hours
3. **Loan Sanctioning** — Borrower accepts an offer → loan is sanctioned and disbursed with a full EMI schedule
4. **Repayment Management** — Per-EMI payment tracking; 2 bounces triggers automatic default classification
5. **Default & Recovery** — Auto NPA classification, collateral seizure, legal notice, settlement, and write-off workflows

### Admin & Compliance
- Portfolio summary: AUM, NPA ratio, risk distribution
- Full ledger summaries by account type
- Audit logs for all state changes
- Loan status override and user freeze capabilities

### Background Jobs
| Job | Schedule | Purpose |
|-----|----------|---------|
| Offer Expiry | Every 15 min | Expire stale offers, revert invoice status |
| EMI Reminders | Daily 09:00 | Notify borrowers of upcoming EMIs |
| NPA Classification | Daily 01:00 | Auto-default overdue loans |
| Risk Recalculation | Sunday 02:00 | Recalculate credit scores for all businesses |

---

## Quick Start

### Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit DATABASE_URL, GOV_API_KEY, GOV_API_SECRET

# Run (requires a running PostgreSQL instance)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or with Docker:

```bash
cd backend
docker-compose up --build
```

API docs available at: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

App available at: `http://localhost:5173`

---

## Credit Flow (End-to-End)

```
1.  POST /auth/otp/send          — Request OTP
2.  POST /auth/otp/verify        — Verify OTP → receive JWT
3.  POST /kyc/onboard            — Submit Aadhaar, PAN, GST
4.  POST /invoices/add           — Add invoice (sandbox)
5.  POST /offers/generate        — Generate secured + unsecured offers
6.  POST /loans/sanction         — Accept offer → loan disbursed + EMI schedule created
7.  POST /repayments/emi/{id}/pay — Pay each EMI
          ↓ (if 2+ bounces)
8.  POST /recovery/initiate      — Initiate recovery
9.  POST /recovery/{id}/complete — Record recovery outcome
```

---

## Database Schema

The system uses **11 tables** with **8 enum types**:

| Table | Description |
|-------|-------------|
| `users` | User accounts (UUID, phone, role, verification status) |
| `business_profiles` | Business identity with GST/Aadhaar/PAN data |
| `credit_scores` | Risk assessment results (external + internal + final score) |
| `invoices` | Invoices used as collateral |
| `loan_offers` | Generated financing offers (secured/unsecured) |
| `loans` | Sanctioned loans with disbursement and repayment tracking |
| `emis` | EMI schedule and payment status per loan |
| `collaterals` | Pledged assets linked to loans |
| `ledger_entries` | Double-entry accounting records |
| `audit_logs` | Full audit trail for all state changes |
| `government_api_cache` | Cached government API responses (TTL-based) |
| `recovery_actions` | Default recovery workflow records |

---

## Frontend Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page |
| `/how-to-use` | How to Use | Step-by-step tutorial |
| `/about` | About | Project information |
| `/login` | Login | OTP authentication flow |
| `/onboarding` | Onboarding | KYC form (Aadhaar, PAN, GST) |
| `/app/dashboard` | Dashboard | Credit score overview and stats |
| `/app/invoices` | Invoices | Invoice list and upload |
| `/app/loans` | Loans | Loan offers and sanction flow |
| `/app/repayments` | Repayments | EMI schedule and payment |
| `/app/credit-score` | Credit Score | Detailed credit score breakdown |
| `/app/profile` | Profile | User profile |

---

## Architecture Highlights

- **Async-first**: All database and I/O operations use `async/await` (asyncpg + SQLAlchemy async)
- **Service layer pattern**: Clean separation between API routers and business logic services
- **Concurrency safety**: `SELECT FOR UPDATE` on critical resources (offer generation, EMI payment)
- **Audit trail**: All state transitions are logged to the audit_logs table
- **Structured logging**: JSON-formatted logs via structlog
- **Government API integration**: GST returns, Aadhaar, and PAN verification with caching and retry logic
- **Mobile-first UI**: Responsive design optimized for mobile devices
