-- CreateTable
CREATE TABLE "CandidateProfile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "skills" TEXT[],
    "resumeUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruiterProfile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruiterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "AssessmentResource" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assessmentId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentVersion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assessmentId" UUID NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "manifestHash" TEXT NOT NULL,
    "schemaPayload" JSONB NOT NULL,
    "manifestPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,

    CONSTRAINT "AssessmentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentAttempt" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidateProfileId" UUID NOT NULL,
    "assessmentVersionId" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'started',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "statePayload" JSONB,

    CONSTRAINT "AssessmentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentSubmission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "attemptId" UUID NOT NULL,
    "finalPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationResult" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "submissionId" UUID NOT NULL,
    "deterministicScore" DOUBLE PRECISION NOT NULL,
    "aiReviewScore" DOUBLE PRECISION,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "aiSummary" TEXT,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "detailsPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelemetryEvent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "attemptId" UUID NOT NULL,
    "eventType" TEXT NOT NULL,
    "widgetId" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelemetryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillDomain" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "SkillDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillCompetency" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "domainId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "SkillCompetency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillCapability" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "competencyId" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "SkillCapability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillEvidence" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "capabilityId" UUID NOT NULL,
    "candidateProfileId" UUID NOT NULL,
    "submissionId" UUID,
    "score" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "context" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Embedding" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'text-embedding-3-small',
    "dimensions" INTEGER NOT NULL DEFAULT 1536,
    "embedding" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Embedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxonomyVersion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "versionLabel" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxonomyVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationTaxonomyAssignment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "taxonomyVersionId" UUID NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),

    CONSTRAINT "OrganizationTaxonomyAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceSource" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "assessmentId" UUID,
    "interviewId" UUID,
    "repositoryId" UUID,
    "reviewerId" UUID,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillProfileSnapshot" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidateProfileId" UUID NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "graphPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillProfileSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSkillRequirement" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "projectId" UUID NOT NULL,
    "capabilityName" TEXT NOT NULL,
    "requiredLevel" DOUBLE PRECISION NOT NULL,
    "importance" TEXT NOT NULL DEFAULT 'REQUIRED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectSkillRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CandidateProfile_userId_key" ON "CandidateProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RecruiterProfile_userId_key" ON "RecruiterProfile"("userId");

-- CreateIndex
CREATE INDEX "Assessment_workspaceId_idx" ON "Assessment"("workspaceId");

-- CreateIndex
CREATE INDEX "AssessmentResource_assessmentId_idx" ON "AssessmentResource"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentVersion_manifestHash_key" ON "AssessmentVersion"("manifestHash");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentVersion_assessmentId_versionNumber_key" ON "AssessmentVersion"("assessmentId", "versionNumber");

-- CreateIndex
CREATE INDEX "AssessmentAttempt_candidateProfileId_idx" ON "AssessmentAttempt"("candidateProfileId");

-- CreateIndex
CREATE INDEX "AssessmentAttempt_assessmentVersionId_idx" ON "AssessmentAttempt"("assessmentVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentSubmission_attemptId_key" ON "AssessmentSubmission"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationResult_submissionId_key" ON "EvaluationResult"("submissionId");

-- CreateIndex
CREATE INDEX "TelemetryEvent_attemptId_idx" ON "TelemetryEvent"("attemptId");

-- CreateIndex
CREATE INDEX "TelemetryEvent_eventType_idx" ON "TelemetryEvent"("eventType");

-- CreateIndex
CREATE UNIQUE INDEX "SkillDomain_name_key" ON "SkillDomain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SkillCompetency_domainId_name_key" ON "SkillCompetency"("domainId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "SkillCapability_competencyId_name_key" ON "SkillCapability"("competencyId", "name");

-- CreateIndex
CREATE INDEX "SkillEvidence_candidateProfileId_idx" ON "SkillEvidence"("candidateProfileId");

-- CreateIndex
CREATE INDEX "SkillEvidence_capabilityId_idx" ON "SkillEvidence"("capabilityId");

-- CreateIndex
CREATE INDEX "Embedding_entityType_entityId_idx" ON "Embedding"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxonomyVersion_versionLabel_key" ON "TaxonomyVersion"("versionLabel");

-- CreateIndex
CREATE INDEX "OrganizationTaxonomyAssignment_organizationId_idx" ON "OrganizationTaxonomyAssignment"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillProfileSnapshot_candidateProfileId_snapshotDate_key" ON "SkillProfileSnapshot"("candidateProfileId", "snapshotDate");

-- CreateIndex
CREATE INDEX "ProjectSkillRequirement_projectId_idx" ON "ProjectSkillRequirement"("projectId");

-- AddForeignKey
ALTER TABLE "CandidateProfile" ADD CONSTRAINT "CandidateProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruiterProfile" ADD CONSTRAINT "RecruiterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentResource" ADD CONSTRAINT "AssessmentResource_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentVersion" ADD CONSTRAINT "AssessmentVersion_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAttempt" ADD CONSTRAINT "AssessmentAttempt_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAttempt" ADD CONSTRAINT "AssessmentAttempt_assessmentVersionId_fkey" FOREIGN KEY ("assessmentVersionId") REFERENCES "AssessmentVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentSubmission" ADD CONSTRAINT "AssessmentSubmission_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "AssessmentAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationResult" ADD CONSTRAINT "EvaluationResult_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "AssessmentSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelemetryEvent" ADD CONSTRAINT "TelemetryEvent_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "AssessmentAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillCompetency" ADD CONSTRAINT "SkillCompetency_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "SkillDomain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillCapability" ADD CONSTRAINT "SkillCapability_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "SkillCompetency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillEvidence" ADD CONSTRAINT "SkillEvidence_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "SkillCapability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillEvidence" ADD CONSTRAINT "SkillEvidence_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillEvidence" ADD CONSTRAINT "SkillEvidence_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "AssessmentSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationTaxonomyAssignment" ADD CONSTRAINT "OrganizationTaxonomyAssignment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationTaxonomyAssignment" ADD CONSTRAINT "OrganizationTaxonomyAssignment_taxonomyVersionId_fkey" FOREIGN KEY ("taxonomyVersionId") REFERENCES "TaxonomyVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillProfileSnapshot" ADD CONSTRAINT "SkillProfileSnapshot_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSkillRequirement" ADD CONSTRAINT "ProjectSkillRequirement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
