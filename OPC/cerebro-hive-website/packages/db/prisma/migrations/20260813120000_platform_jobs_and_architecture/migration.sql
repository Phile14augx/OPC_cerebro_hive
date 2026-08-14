-- CreateTable
CREATE TABLE "PlatformJob" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" UUID NOT NULL,
    "projectId" UUID,
    "userId" UUID,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "traceId" TEXT,
    "errorCode" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformJobLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "jobId" UUID NOT NULL,
    "stream" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformJobLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchitectureGraph" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" UUID NOT NULL,
    "projectId" UUID,
    "name" TEXT NOT NULL,
    "graph" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArchitectureGraph_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchitectureGraphVersion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "graphId" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArchitectureGraphVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSpecificationRecord" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "projectId" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "specification" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectSpecificationRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PlatformJob_workspaceId_createdAt_idx" ON "PlatformJob"("workspaceId", "createdAt");
CREATE INDEX "PlatformJob_status_idx" ON "PlatformJob"("status");
CREATE INDEX "PlatformJobLog_jobId_createdAt_idx" ON "PlatformJobLog"("jobId", "createdAt");
CREATE INDEX "ArchitectureGraph_workspaceId_idx" ON "ArchitectureGraph"("workspaceId");
CREATE UNIQUE INDEX "ArchitectureGraphVersion_graphId_version_key" ON "ArchitectureGraphVersion"("graphId", "version");
CREATE UNIQUE INDEX "ProjectSpecificationRecord_projectId_version_key" ON "ProjectSpecificationRecord"("projectId", "version");

ALTER TABLE "PlatformJob" ADD CONSTRAINT "PlatformJob_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlatformJob" ADD CONSTRAINT "PlatformJob_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PlatformJobLog" ADD CONSTRAINT "PlatformJobLog_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "PlatformJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArchitectureGraph" ADD CONSTRAINT "ArchitectureGraph_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArchitectureGraph" ADD CONSTRAINT "ArchitectureGraph_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ArchitectureGraphVersion" ADD CONSTRAINT "ArchitectureGraphVersion_graphId_fkey" FOREIGN KEY ("graphId") REFERENCES "ArchitectureGraph"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectSpecificationRecord" ADD CONSTRAINT "ProjectSpecificationRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
