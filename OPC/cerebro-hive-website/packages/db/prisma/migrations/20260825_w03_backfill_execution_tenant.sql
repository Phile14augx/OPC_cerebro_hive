-- Up migration
-- 1. Backfill Workspace ID from Agent
UPDATE "AgentExecution" ae
SET "workspaceId" = a."workspaceId"
FROM "Agent" a
WHERE ae."agentId" = a.id AND ae."workspaceId" IS NULL;

-- 2. Backfill Tenant ID from Workspace
UPDATE "AgentExecution" ae
SET "tenantId" = w."tenantId"
FROM "Workspace" w
WHERE ae."workspaceId" = w.id AND (ae."tenantId" IS NULL OR ae."tenantId" = '00000000-0000-0000-0000-000000000000');

-- 3. Backfill Correlation ID from Trace ID
UPDATE "AgentExecution" ae
SET "correlationId" = ae."traceId"
WHERE ae."correlationId" IS NULL OR ae."correlationId" = '';
