ALTER TABLE "DigitalTwin"
  ADD COLUMN "type" TEXT NOT NULL DEFAULT 'GENERIC',
  ADD COLUMN "metadata" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN "createdBy" TEXT,
  ADD COLUMN "updatedBy" TEXT,
  ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE INDEX "DigitalTwin_scope_status_updated_idx"
  ON "DigitalTwin"("tenantId", "workspaceId", "status", "updatedAt" DESC);

ALTER TABLE "TwinVersion"
  ADD COLUMN "sourceProposalId" UUID,
  ADD COLUMN "createdBy" TEXT,
  ADD COLUMN "publishedAt" TIMESTAMP(3),
  ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE INDEX "TwinVersion_twin_status_created_idx"
  ON "TwinVersion"("twinId", "status", "createdAt" DESC);

ALTER TABLE "TwinEntity"
  ADD COLUMN "name" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "TwinEntityState"
  ADD COLUMN "versionId" UUID,
  ADD COLUMN "source" TEXT,
  ADD COLUMN "classification" TEXT,
  ADD COLUMN "confidence" DOUBLE PRECISION;

UPDATE "TwinEntityState"
SET
  "versionId" = "DigitalTwin"."activeVersionId",
  "source" = COALESCE("TwinEntityState"."provenance"->>'source', 'unknown'),
  "classification" = COALESCE("TwinEntityState"."provenance"->>'classification', 'OBSERVED'),
  "confidence" = CASE
    WHEN "TwinEntityState"."provenance" ? 'confidence'
      THEN ("TwinEntityState"."provenance"->>'confidence')::DOUBLE PRECISION
    ELSE NULL
  END
FROM "DigitalTwin"
WHERE "DigitalTwin"."id" = "TwinEntityState"."twinId";

ALTER TABLE "TwinEntityState"
  ALTER COLUMN "versionId" SET NOT NULL,
  ALTER COLUMN "source" SET NOT NULL,
  ALTER COLUMN "classification" SET NOT NULL,
  ADD CONSTRAINT "TwinEntityState_versionId_fkey"
    FOREIGN KEY ("versionId") REFERENCES "TwinVersion"("id") ON DELETE RESTRICT;

CREATE INDEX "TwinEntityState_scope_effective_idx"
  ON "TwinEntityState"("tenantId", "workspaceId", "twinId", "effectiveAt" DESC);

CREATE TABLE "TwinEntityCurrentState" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "workspaceId" UUID NOT NULL,
  "twinId" UUID NOT NULL,
  "entityId" UUID NOT NULL UNIQUE,
  "versionId" UUID NOT NULL,
  "state" JSONB NOT NULL,
  "provenance" JSONB NOT NULL,
  "source" TEXT NOT NULL,
  "classification" TEXT NOT NULL,
  "confidence" DOUBLE PRECISION,
  "observedAt" TIMESTAMP(3) NOT NULL,
  "effectiveAt" TIMESTAMP(3) NOT NULL,
  "ingestedAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TwinEntityCurrentState_twinId_fkey"
    FOREIGN KEY ("twinId") REFERENCES "DigitalTwin"("id") ON DELETE CASCADE,
  CONSTRAINT "TwinEntityCurrentState_entityId_fkey"
    FOREIGN KEY ("entityId") REFERENCES "TwinEntity"("id") ON DELETE CASCADE,
  CONSTRAINT "TwinEntityCurrentState_versionId_fkey"
    FOREIGN KEY ("versionId") REFERENCES "TwinVersion"("id") ON DELETE RESTRICT
);

CREATE INDEX "TwinEntityCurrentState_scope_twin_idx"
  ON "TwinEntityCurrentState"("tenantId", "workspaceId", "twinId");

CREATE TABLE "TwinVersionProposal" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "workspaceId" UUID NOT NULL,
  "twinId" UUID NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PREVIEW',
  "definition" JSONB NOT NULL,
  "provenance" JSONB NOT NULL,
  "schemaValid" BOOLEAN NOT NULL,
  "policyValid" BOOLEAN NOT NULL,
  "rejectionReason" TEXT,
  "createdBy" TEXT,
  "appliedVersionId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "appliedAt" TIMESTAMP(3),
  "rejectedAt" TIMESTAMP(3),
  CONSTRAINT "TwinVersionProposal_twinId_fkey"
    FOREIGN KEY ("twinId") REFERENCES "DigitalTwin"("id") ON DELETE CASCADE,
  CONSTRAINT "TwinVersionProposal_appliedVersionId_fkey"
    FOREIGN KEY ("appliedVersionId") REFERENCES "TwinVersion"("id") ON DELETE SET NULL
);

CREATE INDEX "TwinVersionProposal_scope_status_created_idx"
  ON "TwinVersionProposal"("tenantId", "workspaceId", "twinId", "status", "createdAt" DESC);

ALTER TABLE "TwinVersion"
  ADD CONSTRAINT "TwinVersion_sourceProposalId_fkey"
  FOREIGN KEY ("sourceProposalId") REFERENCES "TwinVersionProposal"("id") ON DELETE SET NULL;

CREATE TABLE "TwinScenario" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "workspaceId" UUID NOT NULL,
  "twinId" UUID NOT NULL,
  "versionId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "inputs" JSONB NOT NULL,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TwinScenario_twinId_fkey"
    FOREIGN KEY ("twinId") REFERENCES "DigitalTwin"("id") ON DELETE CASCADE,
  CONSTRAINT "TwinScenario_versionId_fkey"
    FOREIGN KEY ("versionId") REFERENCES "TwinVersion"("id") ON DELETE RESTRICT
);

CREATE INDEX "TwinScenario_scope_twin_created_idx"
  ON "TwinScenario"("tenantId", "workspaceId", "twinId", "createdAt" DESC);

CREATE TABLE "TwinSimulationRun" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "workspaceId" UUID NOT NULL,
  "twinId" UUID NOT NULL,
  "versionId" UUID NOT NULL,
  "scenarioId" UUID NOT NULL,
  "status" TEXT NOT NULL,
  "snapshot" JSONB NOT NULL,
  "result" JSONB,
  "provenance" JSONB NOT NULL,
  "errorCode" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "TwinSimulationRun_scenarioId_fkey"
    FOREIGN KEY ("scenarioId") REFERENCES "TwinScenario"("id") ON DELETE CASCADE,
  CONSTRAINT "TwinSimulationRun_twinId_fkey"
    FOREIGN KEY ("twinId") REFERENCES "DigitalTwin"("id") ON DELETE CASCADE,
  CONSTRAINT "TwinSimulationRun_versionId_fkey"
    FOREIGN KEY ("versionId") REFERENCES "TwinVersion"("id") ON DELETE RESTRICT
);

CREATE INDEX "TwinSimulationRun_scope_twin_started_idx"
  ON "TwinSimulationRun"("tenantId", "workspaceId", "twinId", "startedAt" DESC);
CREATE INDEX "TwinSimulationRun_scenario_started_idx"
  ON "TwinSimulationRun"("scenarioId", "startedAt" DESC);
