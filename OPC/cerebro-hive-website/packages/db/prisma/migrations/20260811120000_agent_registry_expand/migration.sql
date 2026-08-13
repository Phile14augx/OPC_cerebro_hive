CREATE TYPE "AgentLifecycleStatus" AS ENUM ('DRAFT', 'SANDBOX', 'CERTIFIED', 'PRODUCTION', 'SUSPENDED');
CREATE TYPE "AgentDraftValidationStatus" AS ENUM ('UNVALIDATED', 'VALID', 'INVALID');
CREATE TYPE "AgentVersionPublicationSource" AS ENUM ('USER', 'MIGRATION', 'SYSTEM');

ALTER TABLE "Agent"
  ADD COLUMN "lifecycleStatus" "AgentLifecycleStatus",
  ADD COLUMN "activeVersionId" UUID,
  ADD COLUMN "ownerId" UUID,
  ADD COLUMN "createdBy" UUID,
  ADD COLUMN "statusChangedAt" TIMESTAMP(3),
  ADD COLUMN "statusChangedBy" UUID;

ALTER TABLE "AgentVersion"
  ADD COLUMN "workspaceId" UUID,
  ADD COLUMN "definition" JSONB,
  ADD COLUMN "definitionSchemaVersion" INTEGER,
  ADD COLUMN "definitionHash" TEXT,
  ADD COLUMN "publishedBy" UUID,
  ADD COLUMN "publishedAt" TIMESTAMP(3),
  ADD COLUMN "publicationSource" "AgentVersionPublicationSource",
  ADD COLUMN "sourceDraftId" UUID,
  ADD COLUMN "sourceDraftRevision" INTEGER;

CREATE TABLE "AgentDraft" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "agentId" UUID NOT NULL,
  "workspaceId" UUID NOT NULL,
  "baseVersionId" UUID,
  "definition" JSONB NOT NULL,
  "revision" INTEGER NOT NULL DEFAULT 1,
  "validationStatus" "AgentDraftValidationStatus" NOT NULL DEFAULT 'UNVALIDATED',
  "validationErrors" JSONB,
  "createdBy" UUID,
  "updatedBy" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AgentDraft_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Agent_workspaceId_id_key" ON "Agent"("workspaceId", "id");
CREATE UNIQUE INDEX "Agent_activeVersionId_key" ON "Agent"("activeVersionId");
CREATE INDEX "Agent_workspaceId_lifecycleStatus_idx" ON "Agent"("workspaceId", "lifecycleStatus");
CREATE UNIQUE INDEX "AgentDraft_agentId_key" ON "AgentDraft"("agentId");
CREATE INDEX "AgentDraft_workspaceId_agentId_idx" ON "AgentDraft"("workspaceId", "agentId");
CREATE UNIQUE INDEX "AgentVersion_agentId_id_key" ON "AgentVersion"("agentId", "id");
CREATE INDEX "AgentVersion_workspaceId_agentId_version_idx" ON "AgentVersion"("workspaceId", "agentId", "version");
CREATE INDEX "AgentVersion_workspaceId_publishedAt_idx" ON "AgentVersion"("workspaceId", "publishedAt");
CREATE INDEX "AgentVersion_agentId_definitionHash_idx" ON "AgentVersion"("agentId", "definitionHash");

ALTER TABLE "Agent" ADD CONSTRAINT "Agent_activeVersionId_fkey" FOREIGN KEY ("activeVersionId") REFERENCES "AgentVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_statusChangedBy_fkey" FOREIGN KEY ("statusChangedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AgentVersion" ADD CONSTRAINT "AgentVersion_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentVersion" ADD CONSTRAINT "AgentVersion_publishedBy_fkey" FOREIGN KEY ("publishedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AgentDraft" ADD CONSTRAINT "AgentDraft_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentDraft" ADD CONSTRAINT "AgentDraft_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentDraft" ADD CONSTRAINT "AgentDraft_baseVersionId_fkey" FOREIGN KEY ("baseVersionId") REFERENCES "AgentVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AgentDraft" ADD CONSTRAINT "AgentDraft_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AgentDraft" ADD CONSTRAINT "AgentDraft_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
