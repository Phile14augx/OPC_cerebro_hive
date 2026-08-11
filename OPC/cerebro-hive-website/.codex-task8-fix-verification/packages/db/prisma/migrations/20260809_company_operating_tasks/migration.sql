-- CreateEnum
CREATE TYPE "OperatingTaskStatus" AS ENUM ('QUEUED', 'RUNNING', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "OperatingTask" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "prompt" TEXT,
    "status" "OperatingTaskStatus" NOT NULL DEFAULT 'QUEUED',
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdById" UUID NOT NULL,
    "executionId" UUID,
    "input" JSONB NOT NULL DEFAULT '{}',
    "output" JSONB,
    "error" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperatingTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatingTaskStep" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "taskId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "status" "OperatingTaskStatus" NOT NULL DEFAULT 'QUEUED',
    "detail" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "OperatingTaskStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatingTaskArtifact" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "taskId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "sizeBytes" BIGINT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperatingTaskArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OperatingTask_workspaceId_status_createdAt_idx" ON "OperatingTask"("workspaceId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "OperatingTask_workspaceId_targetType_targetId_idx" ON "OperatingTask"("workspaceId", "targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "OperatingTaskStep_taskId_position_key" ON "OperatingTaskStep"("taskId", "position");

-- CreateIndex
CREATE INDEX "OperatingTaskArtifact_taskId_createdAt_idx" ON "OperatingTaskArtifact"("taskId", "createdAt");

-- AddForeignKey
ALTER TABLE "OperatingTask" ADD CONSTRAINT "OperatingTask_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatingTaskStep" ADD CONSTRAINT "OperatingTaskStep_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "OperatingTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatingTaskArtifact" ADD CONSTRAINT "OperatingTaskArtifact_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "OperatingTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
