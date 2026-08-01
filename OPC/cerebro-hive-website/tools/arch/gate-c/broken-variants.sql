-- Deliberately broken configurations — negative controls for Gate C.
--
-- Each variant models a mistake that has caused real cross-tenant breaches.
-- Every probe that passes against the correct schema MUST fail against the
-- matching variant. A probe that passes against both is not testing anything,
-- and would otherwise sit in CI looking reassuring for years.

-- V1: RLS enabled but not FORCEd. Passes casual review; the owner sees everything.
CREATE TABLE IF NOT EXISTS v1_artifacts (LIKE artifacts INCLUDING ALL);
ALTER TABLE v1_artifacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON v1_artifacts
  USING (org_id = (SELECT current_setting('app.current_org', true)));

-- V2: No RLS at all — relies purely on the application remembering a WHERE clause.
CREATE TABLE IF NOT EXISTS v2_artifacts (LIKE artifacts INCLUDING ALL);

-- V3: Policy present but permissive in the wrong direction — a NULL setting
-- matches everything instead of nothing. Fails OPEN, which is the worst default.
CREATE TABLE IF NOT EXISTS v3_artifacts (LIKE artifacts INCLUDING ALL);
ALTER TABLE v3_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE v3_artifacts FORCE  ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON v3_artifacts
  USING (COALESCE((SELECT current_setting('app.current_org', true)), org_id) = org_id);

-- V4: USING without WITH CHECK. Reads are contained; writes can plant rows into
-- another tenant. Frequently missed because read tests pass.
CREATE TABLE IF NOT EXISTS v4_artifacts (LIKE artifacts INCLUDING ALL);
ALTER TABLE v4_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE v4_artifacts FORCE  ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON v4_artifacts
  USING (org_id = (SELECT current_setting('app.current_org', true)));

GRANT SELECT, INSERT, UPDATE, DELETE ON v1_artifacts, v2_artifacts, v3_artifacts, v4_artifacts TO eda_app;
