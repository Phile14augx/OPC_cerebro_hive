-- Apply only after the backfill manifest and verification queries are clean.

ALTER TABLE "Agent" ALTER COLUMN "lifecycleStatus" SET NOT NULL;

ALTER TABLE "AgentVersion"
  ALTER COLUMN "workspaceId" SET NOT NULL,
  ALTER COLUMN "definition" SET NOT NULL,
  ALTER COLUMN "definitionSchemaVersion" SET NOT NULL,
  ALTER COLUMN "definitionHash" SET NOT NULL,
  ALTER COLUMN "publishedAt" SET NOT NULL,
  ALTER COLUMN "publicationSource" SET NOT NULL;

ALTER TABLE "AgentDraft"
  ADD CONSTRAINT "AgentDraft_revision_positive" CHECK ("revision" > 0);

CREATE UNIQUE INDEX "AgentDraft_agentId_id_key" ON "AgentDraft"("agentId", "id");
CREATE UNIQUE INDEX "AgentVersion_workspaceId_id_key" ON "AgentVersion"("workspaceId", "id");

ALTER TABLE "AgentDraft"
  ADD CONSTRAINT "AgentDraft_workspace_agent_fkey"
  FOREIGN KEY ("workspaceId", "agentId") REFERENCES "Agent"("workspaceId", "id")
  ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "AgentDraft_baseVersion_same_agent_fkey"
  FOREIGN KEY ("agentId", "baseVersionId") REFERENCES "AgentVersion"("agentId", "id")
  ON DELETE NO ACTION ON UPDATE CASCADE;

ALTER TABLE "AgentVersion"
  ADD CONSTRAINT "AgentVersion_workspace_agent_fkey"
  FOREIGN KEY ("workspaceId", "agentId") REFERENCES "Agent"("workspaceId", "id")
  ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "AgentVersion_sourceDraft_same_agent_fkey"
  FOREIGN KEY ("agentId", "sourceDraftId") REFERENCES "AgentDraft"("agentId", "id")
  ON DELETE NO ACTION ON UPDATE CASCADE;

-- The active pointer must reference a version belonging to the same Agent.
ALTER TABLE "Agent" DROP CONSTRAINT "Agent_activeVersionId_fkey";
ALTER TABLE "Agent"
  ADD CONSTRAINT "Agent_activeVersion_same_agent_fkey"
  FOREIGN KEY ("id", "activeVersionId")
  REFERENCES "AgentVersion"("agentId", "id")
  ON DELETE NO ACTION
  ON UPDATE CASCADE;

ALTER TABLE "AgentVersion"
  ADD CONSTRAINT "AgentVersion_sourceDraftId_fkey"
  FOREIGN KEY ("sourceDraftId") REFERENCES "AgentDraft"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION prevent_agent_version_update()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'AgentVersion is immutable; publish a new version instead'
    USING ERRCODE = '55000';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "AgentVersion_immutable"
BEFORE UPDATE ON "AgentVersion"
FOR EACH ROW EXECUTE FUNCTION prevent_agent_version_update();
