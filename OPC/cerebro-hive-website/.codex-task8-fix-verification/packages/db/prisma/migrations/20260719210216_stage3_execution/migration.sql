-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('QUEUED', 'ALLOCATING', 'STARTING', 'RUNNING', 'STREAMING', 'COMPLETED', 'FAILED', 'TIMED_OUT', 'CANCELLED');

-- CreateTable
CREATE TABLE "ExecutionJob" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sessionId" UUID NOT NULL,
    "status" "ExecutionStatus" NOT NULL DEFAULT 'QUEUED',
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "runtimeVersion" TEXT,
    "containerImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExecutionJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionArtifact" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "jobId" UUID NOT NULL,
    "stdout" TEXT,
    "stderr" TEXT,
    "exitCode" INTEGER,
    "queueWaitMs" INTEGER,
    "startupTimeMs" INTEGER,
    "executionTimeMs" INTEGER,
    "memoryUsedBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExecutionArtifact_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExecutionJob" ADD CONSTRAINT "ExecutionJob_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionArtifact" ADD CONSTRAINT "ExecutionArtifact_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ExecutionJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
