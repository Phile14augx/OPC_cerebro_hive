-- ── Enums ────────────────────────────────────────────────────────────────────
CREATE TYPE course_level    AS ENUM ('FOUNDATION','PRACTITIONER','ADVANCED','EXPERT');
CREATE TYPE course_category AS ENUM ('AI_ENGINEERING','ML_ENGINEERING','AI_STRATEGY','AI_OPERATIONS','AI_SECURITY','AI_GOVERNANCE');
CREATE TYPE enrollment_status AS ENUM ('ACTIVE','COMPLETED','PAUSED','CANCELLED');
CREATE TYPE license_tier    AS ENUM ('TEAM','DEPARTMENT','ENTERPRISE');

-- ── Courses ───────────────────────────────────────────────────────────────────
CREATE TABLE academy_courses (
    id          TEXT         NOT NULL DEFAULT ('crs_' || gen_random_uuid()),
    code        TEXT         NOT NULL,
    slug        TEXT         NOT NULL,
    name        TEXT         NOT NULL,
    description TEXT         NOT NULL DEFAULT '',
    category    course_category NOT NULL,
    level       course_level    NOT NULL,
    duration    TEXT         NOT NULL DEFAULT '',
    modules     TEXT[]       NOT NULL DEFAULT '{}',
    outcomes    TEXT[]       NOT NULL DEFAULT '{}',
    prerequisites TEXT[]     NOT NULL DEFAULT '{}',
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT academy_courses_pkey  PRIMARY KEY (id),
    CONSTRAINT academy_courses_code  UNIQUE (code),
    CONSTRAINT academy_courses_slug  UNIQUE (slug)
);

-- ── Learning Paths ────────────────────────────────────────────────────────────
CREATE TABLE academy_learning_paths (
    id              TEXT         NOT NULL DEFAULT ('lp_' || gen_random_uuid()),
    code            TEXT         NOT NULL,
    slug            TEXT         NOT NULL,
    name            TEXT         NOT NULL,
    cert_title      TEXT         NOT NULL DEFAULT '',
    description     TEXT         NOT NULL DEFAULT '',
    level           course_level NOT NULL,
    duration_min    TEXT         NOT NULL DEFAULT '',
    duration_max    TEXT         NOT NULL DEFAULT '',
    course_ids      TEXT[]       NOT NULL DEFAULT '{}',
    outcomes        TEXT[]       NOT NULL DEFAULT '{}',
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT academy_lp_pkey  PRIMARY KEY (id),
    CONSTRAINT academy_lp_code  UNIQUE (code),
    CONSTRAINT academy_lp_slug  UNIQUE (slug)
);

-- ── Enrollments ───────────────────────────────────────────────────────────────
CREATE TABLE academy_enrollments (
    id          TEXT              NOT NULL DEFAULT ('enr_' || gen_random_uuid()),
    user_id     TEXT              NOT NULL,
    course_id   TEXT              NOT NULL REFERENCES academy_courses(id),
    status      enrollment_status NOT NULL DEFAULT 'ACTIVE',
    progress_pct SMALLINT         NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
    started_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    CONSTRAINT academy_enrollments_pkey          PRIMARY KEY (id),
    CONSTRAINT academy_enrollments_user_course   UNIQUE (user_id, course_id)
);

CREATE INDEX academy_enrollments_user_idx   ON academy_enrollments (user_id);
CREATE INDEX academy_enrollments_course_idx ON academy_enrollments (course_id);

-- ── Certificates ──────────────────────────────────────────────────────────────
CREATE TABLE academy_certificates (
    id              TEXT        NOT NULL DEFAULT ('cert_' || gen_random_uuid()),
    user_id         TEXT        NOT NULL,
    course_id       TEXT        REFERENCES academy_courses(id),
    path_id         TEXT        REFERENCES academy_learning_paths(id),
    issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,
    verify_token    TEXT        NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
    CONSTRAINT academy_certs_pkey PRIMARY KEY (id)
);

CREATE INDEX academy_certs_user_idx  ON academy_certificates (user_id);
CREATE INDEX academy_certs_token_idx ON academy_certificates (verify_token);

-- ── Corporate Licenses ────────────────────────────────────────────────────────
CREATE TABLE academy_licenses (
    id          TEXT         NOT NULL DEFAULT ('lic_' || gen_random_uuid()),
    org_id      TEXT         NOT NULL,
    tier        license_tier NOT NULL,
    seat_count  INT          NOT NULL DEFAULT 1,
    seats_used  INT          NOT NULL DEFAULT 0,
    valid_from  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT academy_licenses_pkey PRIMARY KEY (id)
);

CREATE INDEX academy_licenses_org_idx ON academy_licenses (org_id);

-- ── License Assignments ───────────────────────────────────────────────────────
CREATE TABLE academy_license_assignments (
    id          TEXT        NOT NULL DEFAULT ('la_' || gen_random_uuid()),
    license_id  TEXT        NOT NULL REFERENCES academy_licenses(id),
    user_id     TEXT        NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT academy_license_assign_pkey    PRIMARY KEY (id),
    CONSTRAINT academy_license_assign_unique  UNIQUE (license_id, user_id)
);

-- ── Triggers ──────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER academy_courses_updated_at
    BEFORE UPDATE ON academy_courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER academy_lp_updated_at
    BEFORE UPDATE ON academy_learning_paths FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER academy_enrollments_updated_at
    BEFORE UPDATE ON academy_enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
