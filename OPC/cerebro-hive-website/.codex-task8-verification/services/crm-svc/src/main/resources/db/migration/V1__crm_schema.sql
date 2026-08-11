-- ── Enums ────────────────────────────────────────────────────────────────────
CREATE TYPE lead_status     AS ENUM ('NEW','QUALIFIED','NURTURING','PROPOSAL','NEGOTIATION','WON','LOST','DISQUALIFIED');
CREATE TYPE engagement_type AS ENUM ('enterprise_ai','workforce_automation','data_analytics',
                                     'security_compliance','digital_transform','ml_infrastructure',
                                     'custom_ai','academy','general');
CREATE TYPE booking_status  AS ENUM ('PENDING','CONFIRMED','CANCELLED','COMPLETED','NO_SHOW');

-- ── Contacts ──────────────────────────────────────────────────────────────────
CREATE TABLE crm_contacts (
    id          TEXT        NOT NULL DEFAULT ('con_' || gen_random_uuid()),
    user_id     TEXT,                              -- nullable: not all contacts have accounts
    email       TEXT        NOT NULL,
    first_name  TEXT        NOT NULL DEFAULT '',
    last_name   TEXT        NOT NULL DEFAULT '',
    company     TEXT        NOT NULL DEFAULT '',
    job_title   TEXT        NOT NULL DEFAULT '',
    industry    TEXT        NOT NULL DEFAULT '',
    company_size TEXT       NOT NULL DEFAULT '',
    region      TEXT        NOT NULL DEFAULT '',
    phone       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT crm_contacts_pkey  PRIMARY KEY (id),
    CONSTRAINT crm_contacts_email UNIQUE (email)
);

CREATE INDEX crm_contacts_user_idx ON crm_contacts (user_id);

-- ── Leads ─────────────────────────────────────────────────────────────────────
CREATE TABLE crm_leads (
    id              TEXT            NOT NULL DEFAULT ('lead_' || gen_random_uuid()),
    contact_id      TEXT            NOT NULL REFERENCES crm_contacts(id),
    status          lead_status     NOT NULL DEFAULT 'NEW',
    engagement_type engagement_type NOT NULL DEFAULT 'general',
    message         TEXT            NOT NULL DEFAULT '',
    products_interested TEXT[]      NOT NULL DEFAULT '{}',
    score           NUMERIC(5,2)    NOT NULL DEFAULT 0,
    grade           CHAR(1),
    source          TEXT            NOT NULL DEFAULT 'website',
    assigned_to     TEXT,           -- Keycloak user id of sales rep
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT crm_leads_pkey PRIMARY KEY (id)
);

CREATE INDEX crm_leads_contact_idx ON crm_leads (contact_id);
CREATE INDEX crm_leads_status_idx  ON crm_leads (status);
CREATE INDEX crm_leads_score_idx   ON crm_leads (score DESC);

-- ── Lead Activity Log ─────────────────────────────────────────────────────────
CREATE TABLE crm_lead_activities (
    id          TEXT        NOT NULL DEFAULT ('act_' || gen_random_uuid()),
    lead_id     TEXT        NOT NULL REFERENCES crm_leads(id),
    action      TEXT        NOT NULL,   -- e.g. "status_changed", "note_added"
    payload     JSONB       NOT NULL DEFAULT '{}',
    created_by  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT crm_activities_pkey PRIMARY KEY (id)
);

CREATE INDEX crm_activities_lead_idx ON crm_lead_activities (lead_id);

-- ── Bookings (demo / discovery calls) ────────────────────────────────────────
CREATE TABLE crm_bookings (
    id              TEXT            NOT NULL DEFAULT ('bkg_' || gen_random_uuid()),
    lead_id         TEXT            REFERENCES crm_leads(id),
    contact_id      TEXT            NOT NULL REFERENCES crm_contacts(id),
    status          booking_status  NOT NULL DEFAULT 'PENDING',
    meeting_type    TEXT            NOT NULL DEFAULT 'discovery',
    scheduled_at    TIMESTAMPTZ,
    duration_mins   SMALLINT        NOT NULL DEFAULT 30,
    calendar_event_id TEXT,
    notes           TEXT            NOT NULL DEFAULT '',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT crm_bookings_pkey PRIMARY KEY (id)
);

CREATE INDEX crm_bookings_contact_idx ON crm_bookings (contact_id);
CREATE INDEX crm_bookings_status_idx  ON crm_bookings (status);

-- ── Referrals ─────────────────────────────────────────────────────────────────
CREATE TABLE crm_referrals (
    id              TEXT        NOT NULL DEFAULT ('ref_' || gen_random_uuid()),
    referrer_id     TEXT        NOT NULL,   -- Keycloak user id
    referred_email  TEXT        NOT NULL,
    referred_lead_id TEXT       REFERENCES crm_leads(id),
    commission_pct  NUMERIC(4,2) NOT NULL DEFAULT 20.00,
    converted       BOOLEAN     NOT NULL DEFAULT FALSE,
    payout_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT crm_referrals_pkey  PRIMARY KEY (id),
    CONSTRAINT crm_referrals_unique UNIQUE (referrer_id, referred_email)
);

CREATE INDEX crm_referrals_referrer_idx ON crm_referrals (referrer_id);

-- ── Triggers ──────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER crm_contacts_updated_at
    BEFORE UPDATE ON crm_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER crm_leads_updated_at
    BEFORE UPDATE ON crm_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER crm_bookings_updated_at
    BEFORE UPDATE ON crm_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
