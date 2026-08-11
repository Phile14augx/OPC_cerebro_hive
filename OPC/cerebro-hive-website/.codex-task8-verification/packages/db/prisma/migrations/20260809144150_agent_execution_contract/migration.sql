-- AlterTable
ALTER TABLE "AgentExecution" DROP COLUMN "metrics",
ALTER COLUMN "agentVersionId" SET NOT NULL,
ALTER COLUMN "traceId" SET NOT NULL;

-- AlterTable
ALTER TABLE "KnowledgeDocument" ALTER COLUMN "id" SET DEFAULT ('doc_' || replace(uuid_generate_v4()::text, '-', ''));

-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "id" SET DEFAULT ('org_' || replace(uuid_generate_v4()::text, '-', ''));
