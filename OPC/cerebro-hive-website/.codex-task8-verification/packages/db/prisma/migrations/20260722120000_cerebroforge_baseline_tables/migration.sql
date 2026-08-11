-- =============================================================================
-- Baseline migration for CerebroForge tables missing from migration history
-- =============================================================================
-- Root cause: migration 20260723000000_cerebroforge_schema uses
-- `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` against Module, Feature,
-- Milestone, Requirement, ArchitectureDecision, and GeneratedArtifact, but
-- no earlier migration ever creates these tables - they were evidently
-- introduced via `prisma db push` in a dev environment at some point and
-- never captured as a real migration. `prisma migrate deploy` against a
-- fresh database therefore fails with P3018 ("relation ... does not exist")
-- partway through 20260723000000, at whichever ALTER TABLE happens to run
-- first against a nonexistent table.
--
-- Confirmed via reproduction against an isolated, disposable Postgres
-- container (not any shared database): applying migrations 1-5 cleanly,
-- then diffing the resulting database against the current schema.prisma,
-- shows Module/Feature/Milestone/Requirement/ArchitectureDecision/
-- GeneratedArtifact as entirely absent from migration history.
--
-- These tables have never successfully existed in any environment (no
-- migrate deploy run has ever gotten past 20260723000000), so there is no
-- historical data to preserve. This migration creates them in their
-- complete, current shape (matching schema.prisma exactly) rather than
-- reconstructing a hypothetical pre-CerebroForge intermediate shape.
-- 20260723000000's `ADD COLUMN IF NOT EXISTS` statements are idempotent
-- and will no-op harmlessly against columns that already exist here.
--
-- Deliberately omits the two unique constraints
-- (Module_projectId_name_key, GeneratedArtifact_projectId_filePath_key)
-- that migration 20260723000001_forge_unique_constraints adds - that
-- migration is not idempotent (plain ADD CONSTRAINT) and would fail if
-- the constraint already existed here.
--
-- Scope note: this fixes the specific migration-history gap blocking CI's
-- Integration Tests. A much larger, separate finding surfaced during
-- investigation - schema.prisma currently defines 90+ additional tables
-- (spanning several apparently-unreconciled workstreams) with zero
-- migration coverage at all, and a full `prisma migrate diff` against the
-- live schema would drop 27 existing tables (Organization, Conversation,
-- AuditEvent, KnowledgeDocument, the Talent/Assessment/Skill domain, etc.)
-- that are very likely still in active use. That is NOT addressed here -
-- it needs its own investigation and explicit sign-off before any
-- migration touches it, given the size and destructive potential.
-- =============================================================================

-- ─── Module ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Module" (
  "id"          UUID NOT NULL DEFAULT gen_random_uuid(),
  "projectId"   UUID NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "priority"    TEXT NOT NULL DEFAULT 'medium',
  "storyCount"  INTEGER NOT NULL DEFAULT 0,
  "apiCount"    INTEGER NOT NULL DEFAULT 0,
  "status"      TEXT NOT NULL DEFAULT 'pending',

  CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Module_projectId_idx" ON "Module"("projectId");

-- ─── Feature ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Feature" (
  "id"                  UUID NOT NULL DEFAULT gen_random_uuid(),
  "moduleId"            UUID NOT NULL REFERENCES "Module"("id") ON DELETE CASCADE,
  "name"                TEXT NOT NULL,
  "description"         TEXT,
  "acceptanceCriteria"  TEXT,
  "status"              TEXT NOT NULL DEFAULT 'pending',

  CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Feature_moduleId_idx" ON "Feature"("moduleId");

-- ─── Task.featureId ─────────────────────────────────────────────────────────
-- Task itself already exists (from 20260719064705_pm_agent), but 20260723000000
-- creates an index on Task.featureId (line: CREATE INDEX ... "Task_featureId_idx")
-- without ever adding that column - a second, distinct gap in that migration.
-- Must come after Feature is created, above, since it references it.
ALTER TABLE "Task"
  ADD COLUMN IF NOT EXISTS "featureId" UUID REFERENCES "Feature"("id") ON DELETE SET NULL;

-- ─── Milestone ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Milestone" (
  "id"        UUID NOT NULL DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
  "title"     TEXT NOT NULL,
  "dueDate"   TIMESTAMP(3),
  "weekLabel" TEXT,
  "order"     INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Milestone_projectId_idx" ON "Milestone"("projectId");

-- ─── Requirement ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Requirement" (
  "id"          UUID NOT NULL DEFAULT gen_random_uuid(),
  "projectId"   UUID REFERENCES "Project"("id") ON DELETE CASCADE,
  "type"        TEXT NOT NULL DEFAULT 'functional',
  "title"       TEXT NOT NULL,
  "description" TEXT,
  "priority"    TEXT NOT NULL DEFAULT 'medium',

  CONSTRAINT "Requirement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Requirement_projectId_idx" ON "Requirement"("projectId");
CREATE INDEX IF NOT EXISTS "Requirement_type_idx" ON "Requirement"("type");

-- ─── ArchitectureDecision ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ArchitectureDecision" (
  "id"        UUID NOT NULL DEFAULT gen_random_uuid(),
  "projectId" UUID REFERENCES "Project"("id") ON DELETE CASCADE,
  "title"     TEXT NOT NULL,
  "context"   TEXT NOT NULL,
  "decision"  TEXT NOT NULL,
  "status"    TEXT NOT NULL DEFAULT 'accepted',
  "pattern"   TEXT,
  "techStack" JSONB,

  CONSTRAINT "ArchitectureDecision_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ArchitectureDecision_projectId_idx" ON "ArchitectureDecision"("projectId");

-- ─── GeneratedArtifact ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "GeneratedArtifact" (
  "id"          UUID NOT NULL DEFAULT gen_random_uuid(),
  "projectId"   UUID REFERENCES "Project"("id") ON DELETE CASCADE,
  "type"        TEXT NOT NULL,
  "filePath"    TEXT,
  "language"    TEXT,
  "serviceId"   TEXT,
  "content"     TEXT NOT NULL,
  "lineCount"   INTEGER NOT NULL DEFAULT 0,
  "status"      TEXT NOT NULL DEFAULT 'pending',
  "agentType"   TEXT,
  "commitHash"  TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "GeneratedArtifact_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "GeneratedArtifact_projectId_idx" ON "GeneratedArtifact"("projectId");
CREATE INDEX IF NOT EXISTS "GeneratedArtifact_status_idx" ON "GeneratedArtifact"("status");
CREATE INDEX IF NOT EXISTS "GeneratedArtifact_serviceId_idx" ON "GeneratedArtifact"("serviceId");
