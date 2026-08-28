-- Extend the active RBAC model without restoring legacy User authorization fields.
ALTER TABLE "Role" ADD COLUMN "key" TEXT;
CREATE UNIQUE INDEX "Role_key_key" ON "Role"("key");

-- Reuse the oldest case-insensitive canonical display role when one exists,
-- otherwise create it, then remap matching memberships to the keyed role.
DO $$
DECLARE
  canonical_key TEXT;
  canonical_name TEXT;
  canonical_description TEXT;
  canonical_id UUID;
BEGIN
  FOR canonical_key, canonical_name, canonical_description IN
    SELECT * FROM (VALUES
      ('OWNER', 'Owner', 'Tenant owner'),
      ('ADMIN', 'Admin', 'Administrator'),
      ('RECRUITER', 'Recruiter', 'Talent recruiter'),
      ('CANDIDATE', 'Candidate', 'Talent candidate')
    ) AS canonical_roles("key", "name", "description")
  LOOP
    SELECT "id"
      INTO canonical_id
      FROM "Role"
     WHERE LOWER(TRIM("name")) = LOWER(canonical_key)
     ORDER BY "createdAt", "id"
     LIMIT 1;

    IF canonical_id IS NULL THEN
      INSERT INTO "Role" ("id", "key", "name", "description", "createdAt")
      VALUES (gen_random_uuid(), canonical_key, canonical_name, canonical_description, CURRENT_TIMESTAMP)
      RETURNING "id" INTO canonical_id;
    ELSE
      UPDATE "Role"
         SET "key" = canonical_key,
             "name" = canonical_name,
             "description" = COALESCE("description", canonical_description)
       WHERE "id" = canonical_id;
    END IF;

    INSERT INTO "Permission" ("id", "roleId", "action", "resource")
    SELECT gen_random_uuid(), canonical_id, permissions."action", permissions."resource"
      FROM "Permission" AS permissions
      JOIN "Role" AS source_roles ON source_roles."id" = permissions."roleId"
     WHERE source_roles."id" <> canonical_id
       AND LOWER(TRIM(source_roles."name")) = LOWER(canonical_key)
    ON CONFLICT ("roleId", "action", "resource") DO NOTHING;

    UPDATE "TenantMember"
       SET "roleId" = canonical_id
     WHERE "roleId" IN (
       SELECT "id"
         FROM "Role"
        WHERE "id" <> canonical_id
          AND LOWER(TRIM("name")) = LOWER(canonical_key)
     );
  END LOOP;
END $$;

-- Talent grants are a closed exact set. Existing roles not keyed above retain no
-- Talent grant; canonical grants are reinserted below through the active tuple key.
DELETE FROM "Permission"
 WHERE "resource" IN (
   'talent_assessments',
   'talent_copilot',
   'talent_sessions',
   'talent_session_telemetry',
   'talent_executions'
 );

INSERT INTO "Permission" ("id", "roleId", "action", "resource")
SELECT gen_random_uuid(), roles."id", grants."action", grants."resource"
  FROM "Role" AS roles
  JOIN (VALUES
    ('OWNER', 'read', 'talent_assessments'),
    ('OWNER', 'create', 'talent_assessments'),
    ('OWNER', 'read', 'talent_copilot'),
    ('OWNER', 'create', 'talent_sessions'),
    ('OWNER', 'submit', 'talent_sessions'),
    ('OWNER', 'write', 'talent_session_telemetry'),
    ('OWNER', 'create', 'talent_executions'),
    ('ADMIN', 'read', 'talent_assessments'),
    ('ADMIN', 'create', 'talent_assessments'),
    ('ADMIN', 'read', 'talent_copilot'),
    ('ADMIN', 'create', 'talent_sessions'),
    ('ADMIN', 'submit', 'talent_sessions'),
    ('ADMIN', 'write', 'talent_session_telemetry'),
    ('ADMIN', 'create', 'talent_executions'),
    ('RECRUITER', 'read', 'talent_assessments'),
    ('RECRUITER', 'create', 'talent_assessments'),
    ('RECRUITER', 'read', 'talent_copilot'),
    ('CANDIDATE', 'create', 'talent_sessions'),
    ('CANDIDATE', 'submit', 'talent_sessions'),
    ('CANDIDATE', 'write', 'talent_session_telemetry'),
    ('CANDIDATE', 'create', 'talent_executions')
  ) AS grants("roleKey", "action", "resource")
    ON grants."roleKey" = roles."key"
ON CONFLICT ("roleId", "action", "resource") DO NOTHING;

-- Optional local-password credential; global users remain valid without one.
CREATE TABLE "PasswordCredential" (
  "userId" UUID NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "passwordChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PasswordCredential_pkey" PRIMARY KEY ("userId")
);

CREATE TABLE "CandidateProfile" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "skills" TEXT[],
  "resumeUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CandidateProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Assessment" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workspaceId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "tags" TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AssessmentVersion" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "assessmentId" UUID NOT NULL,
  "versionNumber" INTEGER NOT NULL,
  "manifestHash" TEXT NOT NULL,
  "schemaPayload" JSONB NOT NULL,
  "manifestPayload" JSONB NOT NULL,
  "createdByUserId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AssessmentVersion_pkey" PRIMARY KEY ("id")
);

CREATE TYPE "SessionStatus" AS ENUM (
  'INITIALIZED',
  'READY',
  'ACTIVE',
  'PAUSED',
  'RESUMED',
  'SUBMITTED',
  'EXPIRED',
  'TERMINATED'
);

CREATE TABLE "AssessmentSession" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "candidateId" UUID NOT NULL,
  "assessmentVersionId" UUID NOT NULL,
  "status" "SessionStatus" NOT NULL DEFAULT 'INITIALIZED',
  "startedAt" TIMESTAMP(3),
  "endedAt" TIMESTAMP(3),
  "metrics" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AssessmentSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SessionTelemetryBatch" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "sessionId" UUID NOT NULL,
  "sequence" INTEGER NOT NULL,
  "events" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SessionTelemetryBatch_pkey" PRIMARY KEY ("id")
);

-- Preserve the active enum while adding the historical Talent execution states.
ALTER TYPE "ExecutionStatus" ADD VALUE IF NOT EXISTS 'STARTING' AFTER 'QUEUED';
ALTER TYPE "ExecutionStatus" ADD VALUE IF NOT EXISTS 'ALLOCATING' AFTER 'QUEUED';
ALTER TYPE "ExecutionStatus" ADD VALUE IF NOT EXISTS 'STREAMING' AFTER 'RUNNING';
ALTER TYPE "ExecutionStatus" ADD VALUE IF NOT EXISTS 'TIMED_OUT' AFTER 'TIMEOUT';

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

CREATE UNIQUE INDEX "CandidateProfile_userId_key" ON "CandidateProfile"("userId");
CREATE INDEX "Assessment_workspaceId_idx" ON "Assessment"("workspaceId");
CREATE UNIQUE INDEX "AssessmentVersion_manifestHash_key" ON "AssessmentVersion"("manifestHash");
CREATE UNIQUE INDEX "AssessmentVersion_assessmentId_versionNumber_key" ON "AssessmentVersion"("assessmentId", "versionNumber");
CREATE INDEX "AssessmentVersion_assessmentId_idx" ON "AssessmentVersion"("assessmentId");
CREATE INDEX "AssessmentSession_candidateId_idx" ON "AssessmentSession"("candidateId");
CREATE INDEX "AssessmentSession_assessmentVersionId_idx" ON "AssessmentSession"("assessmentVersionId");
CREATE UNIQUE INDEX "SessionTelemetryBatch_sessionId_sequence_key" ON "SessionTelemetryBatch"("sessionId", "sequence");
CREATE INDEX "SessionTelemetryBatch_sessionId_idx" ON "SessionTelemetryBatch"("sessionId");
CREATE INDEX "ExecutionJob_sessionId_idx" ON "ExecutionJob"("sessionId");

ALTER TABLE "PasswordCredential"
  ADD CONSTRAINT "PasswordCredential_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CandidateProfile"
  ADD CONSTRAINT "CandidateProfile_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Assessment"
  ADD CONSTRAINT "Assessment_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AssessmentVersion"
  ADD CONSTRAINT "AssessmentVersion_assessmentId_fkey"
  FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AssessmentVersion"
  ADD CONSTRAINT "AssessmentVersion_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AssessmentSession"
  ADD CONSTRAINT "AssessmentSession_candidateId_fkey"
  FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AssessmentSession"
  ADD CONSTRAINT "AssessmentSession_assessmentVersionId_fkey"
  FOREIGN KEY ("assessmentVersionId") REFERENCES "AssessmentVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SessionTelemetryBatch"
  ADD CONSTRAINT "SessionTelemetryBatch_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExecutionJob"
  ADD CONSTRAINT "ExecutionJob_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExecutionArtifact"
  ADD CONSTRAINT "ExecutionArtifact_jobId_fkey"
  FOREIGN KEY ("jobId") REFERENCES "ExecutionJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
