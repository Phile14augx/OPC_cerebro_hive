-- AlterTable
ALTER TABLE "Agent" ADD COLUMN "departmentId" UUID;

-- CreateTable
CREATE TABLE "OperatingDepartment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "theme" TEXT NOT NULL,
    "leaderAgentId" UUID,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperatingDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatingGraphRelationship" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" UUID NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'healthy',
    "metadata" JSONB,
    "lastActivityAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperatingGraphRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatingActivityEvent" (
    "id" BIGSERIAL NOT NULL,
    "workspaceId" UUID NOT NULL,
    "eventType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "actorId" TEXT,
    "status" TEXT NOT NULL,
    "summary" JSONB NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperatingActivityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Agent_departmentId_idx" ON "Agent"("departmentId");

-- CreateIndex
CREATE INDEX "OperatingDepartment_workspaceId_idx" ON "OperatingDepartment"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "OperatingDepartment_workspaceId_slug_key" ON "OperatingDepartment"("workspaceId", "slug");

-- CreateIndex
CREATE INDEX "OperatingGraphRelationship_workspaceId_sourceId_idx" ON "OperatingGraphRelationship"("workspaceId", "sourceId");

-- CreateIndex
CREATE INDEX "OperatingGraphRelationship_workspaceId_targetId_idx" ON "OperatingGraphRelationship"("workspaceId", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "OperatingGraphRelationship_workspaceId_sourceType_sourceId_targetType_targetId_relationship_key"
ON "OperatingGraphRelationship"("workspaceId", "sourceType", "sourceId", "targetType", "targetId", "relationship");

-- CreateIndex
CREATE INDEX "OperatingActivityEvent_workspaceId_id_idx" ON "OperatingActivityEvent"("workspaceId", "id");

-- CreateIndex
CREATE INDEX "OperatingActivityEvent_workspaceId_eventType_occurredAt_idx" ON "OperatingActivityEvent"("workspaceId", "eventType", "occurredAt");

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "OperatingDepartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatingDepartment" ADD CONSTRAINT "OperatingDepartment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatingGraphRelationship" ADD CONSTRAINT "OperatingGraphRelationship_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatingActivityEvent" ADD CONSTRAINT "OperatingActivityEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
