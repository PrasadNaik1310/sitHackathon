-- ============================================================
-- GST Banking Credit Lifecycle System — Full Schema
-- Run this ONCE in Supabase SQL Editor
-- ============================================================

-- ── ENUM Types ─────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE userrole AS ENUM ('BORROWER', 'CREDIT_OFFICER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE riskgrade AS ENUM ('A', 'B', 'C');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE invoicestatus AS ENUM ('UNPAID', 'OFFER_GENERATED', 'FINANCED', 'REPAID', 'DEFAULTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE loantype AS ENUM ('SECURED', 'UNSECURED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE offerstatus AS ENUM ('GENERATED', 'ACCEPTED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE loanstatus AS ENUM ('SANCTIONED', 'ACTIVE', 'CLOSED', 'DEFAULT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE emistatus AS ENUM ('PENDING', 'PAID', 'BOUNCED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE collateralstatus AS ENUM ('PLEDGED', 'SEIZED', 'RELEASED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE entrytype AS ENUM ('DEBIT', 'CREDIT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE accounttype AS ENUM ('BANK_CAPITAL', 'BORROWER', 'PROVISION', 'RECOVERY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE recoveryactiontype AS ENUM ('COLLATERAL_SEIZURE', 'LEGAL_NOTICE', 'SETTLEMENT', 'WRITE_OFF');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE recoverystatus AS ENUM ('INITIATED', 'IN_PROGRESS', 'COMPLETED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Tables ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS gov_cache (
    cache_key VARCHAR(300) NOT NULL,
    response_json JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (cache_key)
);

CREATE TABLE IF NOT EXISTS otp_table (
    phone VARCHAR(20) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (phone)
);

CREATE TABLE IF NOT EXISTS rate_limits (
    identity VARCHAR(100) NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 0,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (identity)
);

CREATE TABLE IF NOT EXISTS users (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    phone VARCHAR(20) NOT NULL,
    role userrole NOT NULL DEFAULT 'BORROWER',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (phone)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    actor_id UUID,
    action VARCHAR(200) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (actor_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS business_profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    gst_number VARCHAR(20) NOT NULL,
    aadhaar_number VARCHAR(20) NOT NULL,
    pan_number VARCHAR(15) NOT NULL,
    verification_snapshot JSON,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (gst_number),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    invoice_number VARCHAR(100) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    delay_days INTEGER NOT NULL DEFAULT 0,
    status invoicestatus NOT NULL DEFAULT 'UNPAID',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (business_id) REFERENCES business_profiles (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS credit_scores (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    external_score FLOAT NOT NULL,
    internal_score FLOAT NOT NULL,
    final_score FLOAT NOT NULL,
    risk_grade riskgrade NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (business_id) REFERENCES business_profiles (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS offers (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL,
    loan_type loantype NOT NULL,
    percentage FLOAT NOT NULL,
    interest_rate FLOAT NOT NULL,
    tenure_months INTEGER NOT NULL,
    status offerstatus NOT NULL DEFAULT 'GENERATED',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS loans (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL,
    status loanstatus NOT NULL DEFAULT 'SANCTIONED',
    principal NUMERIC(15, 2) NOT NULL,
    disbursed_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (offer_id) REFERENCES offers (id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS collaterals (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL,
    asset_description VARCHAR(500) NOT NULL,
    asset_value NUMERIC(15, 2) NOT NULL,
    status collateralstatus NOT NULL DEFAULT 'PLEDGED',
    PRIMARY KEY (id),
    FOREIGN KEY (loan_id) REFERENCES loans (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emis (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    status emistatus NOT NULL DEFAULT 'PENDING',
    retry_count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    FOREIGN KEY (loan_id) REFERENCES loans (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL,
    entry_type entrytype NOT NULL,
    account_type accounttype NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    description VARCHAR(500),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (loan_id) REFERENCES loans (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recovery_actions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL,
    action_type recoveryactiontype NOT NULL,
    status recoverystatus NOT NULL DEFAULT 'INITIATED',
    amount_recovered NUMERIC(15, 2),
    notes VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (loan_id) REFERENCES loans (id) ON DELETE CASCADE
);

-- ── Indexes for performance ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_invoices_business ON invoices (business_id);
CREATE INDEX IF NOT EXISTS idx_loans_offer ON loans (offer_id);
CREATE INDEX IF NOT EXISTS idx_emis_loan ON emis (loan_id);
CREATE INDEX IF NOT EXISTS idx_ledger_loan ON ledger_entries (loan_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_credit_scores_business ON credit_scores (business_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_offers_invoice ON offers (invoice_id);
CREATE INDEX IF NOT EXISTS idx_recovery_loan ON recovery_actions (loan_id);

SELECT 'Schema created successfully — ' || count(*) || ' tables' as result
FROM information_schema.tables
WHERE table_schema = 'public';