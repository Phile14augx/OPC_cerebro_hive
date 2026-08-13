ALTER TABLE "TwinVersion" ADD COLUMN "sourceProposalId" UUID;

CREATE TABLE "TwinVersionProposal" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "twinId" UUID NOT NULL,
  "tenantId" UUID NOT NULL,
  "workspaceId" UUID NOT NULL,
  "model" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PREVIEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "appliedAt" TIMESTAMP(3),
  CONSTRAINT "TwinVersionProposal_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TwinVersion_sourceProposalId_key" ON "TwinVersion"("sourceProposalId");
CREATE INDEX "TwinVersionProposal_tenantId_workspaceId_twinId_status_idx"
  ON "TwinVersionProposal"("tenantId", "workspaceId", "twinId", "status");

ALTER TABLE "TwinVersionProposal"
  ADD CONSTRAINT "TwinVersionProposal_twinId_fkey"
  FOREIGN KEY ("twinId") REFERENCES "DigitalTwin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TwinVersion"
  ADD CONSTRAINT "TwinVersion_sourceProposalId_fkey"
  FOREIGN KEY ("sourceProposalId") REFERENCES "TwinVersionProposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
