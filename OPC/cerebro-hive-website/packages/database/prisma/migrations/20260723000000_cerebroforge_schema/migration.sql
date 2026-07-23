-- =============================================================================
-- CerebroForge™ Schema Migration
-- Extends existing Project/Module/Requirement/GeneratedArtifact models
-- Adds ForgeAgentRun and ForgeSession
-- =============================================================================

-- ─── Extend Project ───────────────────────────────────────────────────────────
ALTER TABLE "Project"
  ADD COLUMN IF NOT EXISTS "prompt"        TEXT,
  ADD COLUMN IF NOT EXISTS "forgeStatus"   TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS "forgePhase"    TEXT NOT NULL DEFAULT 'idea',
  ADD COLUMN IF NOT EXISTS "stack"         JSONB,
  ADD COLUMN IF NOT EXISTS "frameworks"    TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "actorList"     TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "totalModules"  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "totalStories"  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "totalApis"     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "planJson"      JSONB,
  ADD COLUMN IF NOT EXISTS "archJson"      JSONB,
  ADD COLUMN IF NOT EXISTS "designTokens"  JSONB,
  ADD COLUMN IF NOT EXISTS "repoOwner"     TEXT,
  ADD COLUMN IF NOT EXISTS "repoName"      TEXT,
  ADD COLUMN IF NOT EXISTS "repoUrl"       TEXT,
  ADD COLUMN IF NOT EXISTS "activeAgents"  TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS "Project_forgeStatus_idx" ON "Project"("forgeStatus");

-- ─── Extend Repository ────────────────────────────────────────────────────────
ALTER TABLE "Repository"
  ADD COLUMN IF NOT EXISTS "provider"       TEXT NOT NULL DEFAULT 'github',
  ADD COLUMN IF NOT EXISTS "defaultBranch"  TEXT NOT NULL DEFAULT 'main';

CREATE INDEX IF NOT EXISTS "Repository_projectId_idx" ON "Repository"("projectId");

-- ─── Extend Branch ────────────────────────────────────────────────────────────
ALTER TABLE "Branch"
  ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- ─── Extend Commit ────────────────────────────────────────────────────────────
ALTER TABLE "Commit"
  ADD COLUMN IF NOT EXISTS "agentType" TEXT;

CREATE INDEX IF NOT EXISTS "Commit_repositoryId_idx" ON "Commit"("repositoryId");

-- ─── Extend Module ────────────────────────────────────────────────────────────
ALTER TABLE "Module"
  ADD COLUMN IF NOT EXISTS "projectId"   UUID REFERENCES "Project"("id") ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "priority"    TEXT NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS "storyCount"  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "apiCount"    INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "status"      TEXT NOT NULL DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS "Module_projectId_idx" ON "Module"("projectId");

-- ─── Extend Feature ───────────────────────────────────────────────────────────
ALTER TABLE "Feature"
  ADD COLUMN IF NOT EXISTS "description"         TEXT,
  ADD COLUMN IF NOT EXISTS "acceptanceCriteria"  TEXT,
  ADD COLUMN IF NOT EXISTS "status"              TEXT NOT NULL DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS "Feature_moduleId_idx" ON "Feature"("moduleId");

-- ─── Extend Task ──────────────────────────────────────────────────────────────
ALTER TABLE "Task"
  ADD COLUMN IF NOT EXISTS "agentType"       TEXT,
  ADD COLUMN IF NOT EXISTS "estimatedHours"  FLOAT;

CREATE INDEX IF NOT EXISTS "Task_featureId_idx" ON "Task"("featureId");

-- ─── Extend Sprint ────────────────────────────────────────────────────────────
ALTER TABLE "Sprint"
  ADD COLUMN IF NOT EXISTS "goal"       TEXT,
  ADD COLUMN IF NOT EXISTS "startDate"  TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "endDate"    TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Sprint_projectId_idx" ON "Sprint"("projectId");

-- ─── Extend Milestone ─────────────────────────────────────────────────────────
ALTER TABLE "Milestone"
  ADD COLUMN IF NOT EXISTS "weekLabel"  TEXT,
  ADD COLUMN IF NOT EXISTS "order"      INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "Milestone_projectId_idx" ON "Milestone"("projectId");

-- ─── Extend Requirement ───────────────────────────────────────────────────────
ALTER TABLE "Requirement"
  ADD COLUMN IF NOT EXISTS "projectId"  UUID REFERENCES "Project"("id") ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS "type"       TEXT NOT NULL DEFAULT 'functional',
  ADD COLUMN IF NOT EXISTS "priority"   TEXT NOT NULL DEFAULT 'medium';

CREATE INDEX IF NOT EXISTS "Requirement_projectId_idx" ON "Requirement"("projectId");
CREATE INDEX IF NOT EXISTS "Requirement_type_idx"      ON "Requirement"("type");

-- ─── Extend ArchitectureDecision ──────────────────────────────────────────────
ALTER TABLE "ArchitectureDecision"
  ADD COLUMN IF NOT EXISTS "projectId"  UUID REFERENCES "Project"("id") ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS "pattern"    TEXT,
  ADD COLUMN IF NOT EXISTS "techStack"  JSONB;

CREATE INDEX IF NOT EXISTS "ArchitectureDecision_projectId_idx" ON "ArchitectureDecision"("projectId");

-- ─── Extend GeneratedArtifact ─────────────────────────────────────────────────
ALTER TABLE "GeneratedArtifact"
  ADD COLUMN IF NOT EXISTS "projectId"   UUID REFERENCES "Project"("id") ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS "filePath"    TEXT,
  ADD COLUMN IF NOT EXISTS "language"    TEXT,
  ADD COLUMN IF NOT EXISTS "serviceId"   TEXT,
  ADD COLUMN IF NOT EXISTS "lineCount"   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "status"      TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "agentType"   TEXT,
  ADD COLUMN IF NOT EXISTS "commitHash"  TEXT,
  ADD COLUMN IF NOT EXISTS "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "GeneratedArtifact_projectId_idx" ON "GeneratedArtifact"("projectId");
CREATE INDEX IF NOT EXISTS "GeneratedArtifact_status_idx"    ON "GeneratedArtifact"("status");
CREATE INDEX IF NOT EXISTS "GeneratedArtifact_serviceId_idx" ON "GeneratedArtifact"("serviceId");

-- ─── New: ForgeAgentRun ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ForgeAgentRun" (
  "id"           UUID        NOT NULL DEFAULT gen_random_uuid(),
  "projectId"    UUID        NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
  "agentType"    TEXT        NOT NULL,
  "phase"        TEXT        NOT NULL,
  "status"       TEXT        NOT NULL DEFAULT 'queued',
  "systemPrompt" TEXT        NOT NULL,
  "userPrompt"   TEXT        NOT NULL,
  "response"     TEXT,
  "tokensIn"     INTEGER     NOT NULL DEFAULT 0,
  "tokensOut"    INTEGER     NOT NULL DEFAULT 0,
  "durationMs"   INTEGER,
  "model"        TEXT,
  "errorMessage" TEXT,
  "startedAt"    TIMESTAMP(3),
  "completedAt"  TIMESTAMP(3),
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ForgeAgentRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ForgeAgentRun_projectId_idx"  ON "ForgeAgentRun"("projectId");
CREATE INDEX IF NOT EXISTS "ForgeAgentRun_agentType_idx"  ON "ForgeAgentRun"("agentType");
CREATE INDEX IF NOT EXISTS "ForgeAgentRun_status_idx"     ON "ForgeAgentRun"("status");

-- ─── New: ForgeSession ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ForgeSession" (
  "id"        UUID         NOT NULL DEFAULT gen_random_uuid(),
  "projectId" UUID         NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
  "userId"    UUID,
  "phase"     TEXT         NOT NULL,
  "isActive"  BOOLEAN      NOT NULL DEFAULT true,
  "clientId"  TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ForgeSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ForgeSession_projectId_idx" ON "ForgeSession"("projectId");
CREATE INDEX IF NOT EXISTS "ForgeSession_isActive_idx"  ON "ForgeSession"("isActive");
