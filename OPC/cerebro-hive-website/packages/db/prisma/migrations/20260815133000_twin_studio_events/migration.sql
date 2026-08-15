CREATE TABLE "TwinEvent" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "workspaceId" UUID NOT NULL,
  "twinId" UUID NOT NULL,
  "entityId" UUID NOT NULL,
  "versionId" UUID NOT NULL,
  "ruleKey" TEXT NOT NULL,
  "kind" TEXT NOT NULL DEFAULT 'RULE_FIRED',
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "message" TEXT NOT NULL,
  "state" JSONB NOT NULL,
  "provenance" JSONB NOT NULL,
  "source" TEXT NOT NULL,
  "classification" TEXT NOT NULL,
  "openedAt" TIMESTAMP(3) NOT NULL,
  "clearedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TwinEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TwinEvent_twinId_fkey"
    FOREIGN KEY ("twinId") REFERENCES "DigitalTwin"("id") ON DELETE CASCADE,
  CONSTRAINT "TwinEvent_entityId_fkey"
    FOREIGN KEY ("entityId") REFERENCES "TwinEntity"("id") ON DELETE CASCADE
);

CREATE INDEX "TwinEvent_scope_twin_opened_idx"
  ON "TwinEvent"("tenantId", "workspaceId", "twinId", "openedAt" DESC);

CREATE INDEX "TwinEvent_twin_entity_rule_status_idx"
  ON "TwinEvent"("twinId", "entityId", "ruleKey", "status");

CREATE UNIQUE INDEX "TwinEvent_open_rule_uidx"
  ON "TwinEvent"("twinId", "entityId", "ruleKey")
  WHERE "status" = 'OPEN';
