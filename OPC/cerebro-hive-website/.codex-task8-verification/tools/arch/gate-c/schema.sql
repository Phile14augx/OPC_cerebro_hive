-- Gate C reference schema — ADR 0010 (D7).
--
-- The CORRECT configuration. Probes run against this and must all be blocked.
-- Deliberately weakened variants live in broken-variants.sql and must all leak,
-- which is what proves the probes are actually testing something.

CREATE TABLE IF NOT EXISTS projects (
  id           TEXT PRIMARY KEY,
  org_id       TEXT NOT NULL,
  name         TEXT NOT NULL,
  export_class TEXT NOT NULL DEFAULT 'none'
);

CREATE TABLE IF NOT EXISTS artifacts (
  id           TEXT PRIMARY KEY,
  org_id       TEXT NOT NULL,
  project_id   TEXT NOT NULL,
  logical_path TEXT NOT NULL,
  export_class TEXT NOT NULL DEFAULT 'none'
);

-- FORCE matters as much as ENABLE. Without it the table owner bypasses policy,
-- and migrations, admin scripts and psql sessions typically connect as owner —
-- which is exactly when someone is most likely to see data they should not.
ALTER TABLE projects  ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects  FORCE  ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts FORCE  ROW LEVEL SECURITY;

-- The `(SELECT ...)` wrapper around current_setting is deliberate and is the
-- subtlest line in this file.
--
-- PostgreSQL caches generic plans for prepared statements. A policy referencing
-- current_setting() directly can have the setting folded into a cached generic
-- plan, so a connection reused for a different tenant may execute a plan built
-- for the previous one. Wrapping in a subselect forces re-evaluation per
-- execution. The `true` second argument makes a missing setting return NULL
-- rather than erroring — combined with a NOT NULL org_id, an unset session
-- matches zero rows, which fails closed.
CREATE POLICY tenant_isolation ON projects
  USING       (org_id = (SELECT current_setting('app.current_org', true)))
  WITH CHECK  (org_id = (SELECT current_setting('app.current_org', true)));

CREATE POLICY tenant_isolation ON artifacts
  USING       (org_id = (SELECT current_setting('app.current_org', true)))
  WITH CHECK  (org_id = (SELECT current_setting('app.current_org', true)));

-- Export-class overlay: clearance filtering happens in the query layer, so an
-- uncleared subject's search returns nothing rather than a redacted placeholder.
-- Result-count leakage is itself disclosure.
CREATE POLICY export_clearance ON artifacts
  AS RESTRICTIVE
  USING (export_class = ANY (string_to_array(COALESCE((SELECT current_setting('app.clearances', true)), 'none'), ',')));

-- The application role: not superuser, not table owner. Both bypass RLS unless
-- forced, and relying on FORCE alone is one config change away from a breach.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'eda_app') THEN
    CREATE ROLE eda_app LOGIN PASSWORD 'gate_c_test';
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON projects, artifacts TO eda_app;
