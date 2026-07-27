-- Platform Service schema
-- Coexists with the main @cerebro/db Prisma schema (different tables, same DB)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Platform Products ─────────────────────────────────────────────────────────

CREATE TYPE product_tier AS ENUM (
    'TIER_0_FOUNDATION',
    'TIER_1_INFRASTRUCTURE',
    'TIER_2_DATA_INTELLIGENCE',
    'TIER_3_AI_RUNTIME',
    'TIER_4_CEREBRO_APPS',
    'TIER_5_ECOSYSTEM'
);

CREATE TABLE platform_products (
    id           TEXT PRIMARY KEY DEFAULT ('prod_' || replace(uuid_generate_v4()::text, '-', '')),
    slug         TEXT UNIQUE NOT NULL,
    name         TEXT NOT NULL,
    tagline      TEXT NOT NULL,
    description  TEXT NOT NULL,
    tier         product_tier NOT NULL,
    tier_label   TEXT NOT NULL,
    features     TEXT[]   NOT NULL DEFAULT '{}',
    integrations TEXT[]   NOT NULL DEFAULT '{}',
    use_cases    TEXT[]   NOT NULL DEFAULT '{}',
    sla          TEXT,
    active       BOOLEAN  NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_tier   ON platform_products(tier);
CREATE INDEX idx_products_active ON platform_products(active);
CREATE INDEX idx_products_slug   ON platform_products(slug);

-- ── Platform Services ─────────────────────────────────────────────────────────

CREATE TYPE service_practice AS ENUM (
    'STRATEGY', 'ENGINEERING', 'OPERATIONS', 'SECURITY', 'INDUSTRY'
);

CREATE TABLE platform_services (
    id           TEXT PRIMARY KEY DEFAULT ('svc_' || replace(uuid_generate_v4()::text, '-', '')),
    code         TEXT UNIQUE NOT NULL,  -- e.g. "SA-01", "EI-03"
    slug         TEXT UNIQUE NOT NULL,
    name         TEXT NOT NULL,
    tagline      TEXT NOT NULL,
    description  TEXT NOT NULL,
    practice     service_practice NOT NULL,
    timeline     TEXT NOT NULL,
    investment   TEXT NOT NULL,
    deliverables TEXT[] NOT NULL DEFAULT '{}',
    outcomes     TEXT[] NOT NULL DEFAULT '{}',
    active       BOOLEAN NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_practice ON platform_services(practice);

-- ── Industries ────────────────────────────────────────────────────────────────

CREATE TABLE platform_industries (
    id          TEXT PRIMARY KEY DEFAULT ('ind_' || replace(uuid_generate_v4()::text, '-', '')),
    slug        TEXT UNIQUE NOT NULL,
    name        TEXT NOT NULL,
    tagline     TEXT NOT NULL,
    overview    TEXT NOT NULL,
    compliance  TEXT[] NOT NULL DEFAULT '{}',
    metrics     TEXT[] NOT NULL DEFAULT '{}',
    icon        TEXT,
    color       TEXT,
    active      BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE industry_use_cases (
    id          TEXT PRIMARY KEY DEFAULT ('uc_' || replace(uuid_generate_v4()::text, '-', '')),
    industry_id TEXT NOT NULL REFERENCES platform_industries(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT NOT NULL,
    products    TEXT[] NOT NULL DEFAULT '{}',
    roi         TEXT,
    sort_order  INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_use_cases_industry ON industry_use_cases(industry_id);

-- ── Solutions ─────────────────────────────────────────────────────────────────

CREATE TABLE platform_solutions (
    id          TEXT PRIMARY KEY DEFAULT ('sol_' || replace(uuid_generate_v4()::text, '-', '')),
    slug        TEXT UNIQUE NOT NULL,
    name        TEXT NOT NULL,
    category    TEXT NOT NULL,
    tagline     TEXT NOT NULL,
    description TEXT NOT NULL,
    deliverables TEXT[] NOT NULL DEFAULT '{}',
    timeline    TEXT NOT NULL,
    investment  TEXT NOT NULL,
    outcomes    TEXT[] NOT NULL DEFAULT '{}',
    products    TEXT[] NOT NULL DEFAULT '{}',
    services    TEXT[] NOT NULL DEFAULT '{}',
    methodology TEXT,
    active      BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Updated-at trigger ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at   BEFORE UPDATE ON platform_products   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_services_updated_at   BEFORE UPDATE ON platform_services   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_industries_updated_at BEFORE UPDATE ON platform_industries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_solutions_updated_at  BEFORE UPDATE ON platform_solutions  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
