/*
  Warnings:

  - You are about to drop the column `name` on the `Alert` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `HealthCheck` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `Metric` table. All the data in the column will be lost.
  - Added the required column `message` to the `Alert` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Alert` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Alert` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Incident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Incident` table without a default value. This is not possible if the table is not empty.

*/
-- Required by Organization/KnowledgeDocument's uuid_generate_v4() default below.
-- Recorded here (not applied ad hoc) so shadow-database replay for `migrate dev`
-- and fresh environments both pick it up as part of migration history.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER', 'BILLING_ADMIN');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('KEYCLOAK', 'GOOGLE', 'GITHUB', 'MICROSOFT', 'EMAIL');

-- CreateEnum
CREATE TYPE "OrgStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_DELETION', 'DELETED');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'STARTER', 'PRO', 'ENTERPRISE', 'ENTERPRISE_PLUS');

-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('QUEUED', 'RUNNING', 'WAITING_FOR_HUMAN', 'COMPLETED', 'FAILED', 'TIMEOUT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DEPRECATED', 'BETA', 'DRAFT');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED', 'DELETED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING', 'INCOMPLETE');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'OPEN', 'PAID', 'UNCOLLECTIBLE', 'VOID');

-- CreateEnum
CREATE TYPE "AuditSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- AlterTable
ALTER TABLE "AgentExecution" ADD COLUMN     "agentVersionId" UUID,
ADD COLUMN     "costUsd" DOUBLE PRECISION,
ADD COLUMN     "durationMs" INTEGER,
ADD COLUMN     "inputTokens" INTEGER,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "outputTokens" INTEGER,
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "reasoningTokens" INTEGER,
ADD COLUMN     "traceId" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Alert" DROP COLUMN "name",
ADD COLUMN     "category" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "message" TEXT NOT NULL,
ADD COLUMN     "pillar" TEXT,
ADD COLUMN     "severity" TEXT NOT NULL DEFAULT 'info',
ADD COLUMN     "source" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "HealthCheck" DROP COLUMN "timestamp",
ADD COLUMN     "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Incident" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "severity" TEXT NOT NULL DEFAULT 'info',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Metric" DROP COLUMN "timestamp",
ADD COLUMN     "category" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "target" DOUBLE PRECISION,
ADD COLUMN     "unit" TEXT;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "WorkflowExecution" ADD COLUMN     "error" JSONB,
ADD COLUMN     "output" JSONB,
ADD COLUMN     "temporalWorkflowId" TEXT;

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AgentExecutionStep" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "executionId" UUID NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "input" JSONB,
    "output" JSONB,
    "error" TEXT,

    CONSTRAINT "AgentExecutionStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentExecutionEvent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "executionId" UUID NOT NULL,
    "sequence" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "eventVersion" INTEGER NOT NULL DEFAULT 1,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentExecutionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentExecutionSnapshot" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "executionId" UUID NOT NULL,
    "sequence" BIGINT NOT NULL,
    "state" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentExecutionSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentExecutionMetric" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "executionId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentExecutionMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentExecutionLease" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "executionId" UUID NOT NULL,
    "ownerId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "AgentExecutionLease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentExecutionCheckpoint" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "executionId" UUID NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "providerRequest" JSONB,
    "providerResponse" JSONB,
    "usage" JSONB,
    "finishReason" TEXT,
    "toolCalls" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentExecutionCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentExecutionOutbox" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "executionId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "retries" INTEGER NOT NULL DEFAULT 0,
    "nextRetryAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentExecutionOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentExecutionInbox" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "executionId" UUID NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentExecutionInbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL DEFAULT ('org_' || replace(uuid_generate_v4()::text, '-', '')),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "status" "OrgStatus" NOT NULL DEFAULT 'ACTIVE',
    "plan" "PlanTier" NOT NULL DEFAULT 'FREE',
    "ownerId" TEXT NOT NULL,
    "billingEmail" TEXT,
    "taxId" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_memberships" (
    "userId" UUID NOT NULL,
    "orgId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "org_memberships_pkey" PRIMARY KEY ("userId","orgId")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "invitedById" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeDocument" (
    "id" TEXT NOT NULL DEFAULT ('doc_' || replace(uuid_generate_v4()::text, '-', '')),
    "collectionId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "sourceType" TEXT NOT NULL,
    "mimeType" TEXT,
    "contentHash" TEXT NOT NULL,
    "charCount" INTEGER NOT NULL DEFAULT 0,
    "chunkCount" INTEGER NOT NULL DEFAULT 0,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "KnowledgeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_usage_records" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "workflowId" TEXT,
    "executionId" TEXT,
    "agentId" TEXT,
    "userId" TEXT,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "costUsd" DECIMAL(12,6) NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "ttftMs" INTEGER,
    "cached" BOOLEAN NOT NULL DEFAULT false,
    "streamed" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "finishReason" TEXT,
    "requestId" TEXT NOT NULL,
    "traceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "interval" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "seats" INTEGER NOT NULL DEFAULT 1,
    "addons" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "stripeInvoiceId" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "tax" INTEGER NOT NULL DEFAULT 0,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "invoiceUrl" TEXT,
    "pdfUrl" TEXT,
    "lineItems" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_budgets" (
    "orgId" TEXT NOT NULL,
    "monthlyCapUsd" DECIMAL(10,2) NOT NULL,
    "alertThreshold" DECIMAL(4,3) NOT NULL DEFAULT 0.8,
    "alertEmail" TEXT NOT NULL,
    "hardCap" BOOLEAN NOT NULL DEFAULT false,
    "currentSpendUsd" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_budgets_pkey" PRIMARY KEY ("orgId")
);

-- CreateTable
CREATE TABLE "prompts" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "category" TEXT NOT NULL DEFAULT 'general',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "activeVersion" INTEGER NOT NULL DEFAULT 1,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptVersion" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "variables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT NOT NULL DEFAULT '',
    "changelog" TEXT NOT NULL DEFAULT '',
    "contentHash" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "metrics" JSONB,

    CONSTRAINT "PromptVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvalDataset" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "schema" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "EvalDataset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvalRun" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "promptId" TEXT,
    "promptSlug" TEXT NOT NULL DEFAULT '',
    "datasetId" TEXT,
    "model" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "samples" INTEGER NOT NULL DEFAULT 0,
    "passed" INTEGER NOT NULL DEFAULT 0,
    "metrics" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "EvalRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelEntry" (
    "id" TEXT NOT NULL,
    "orgId" TEXT,
    "modelId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "contextWindow" INTEGER NOT NULL DEFAULT 0,
    "maxOutput" INTEGER NOT NULL DEFAULT 0,
    "inputPricePer1M" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "outputPricePer1M" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "capabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "ModelEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchiveDocument" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "documentType" TEXT NOT NULL,
    "currentVersionId" UUID,
    "ownerId" UUID,
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ArchiveDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchiveDocumentVersion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "documentId" UUID NOT NULL,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "storageKey" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "byteSize" BIGINT NOT NULL,
    "checksumSha256" TEXT NOT NULL,
    "processingStatus" TEXT NOT NULL DEFAULT 'CREATED',
    "language" TEXT NOT NULL DEFAULT 'en',
    "pageCount" INTEGER NOT NULL DEFAULT 0,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "ArchiveDocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchiveDocumentChunk" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "documentId" UUID NOT NULL,
    "versionId" UUID NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "tokenCount" INTEGER NOT NULL DEFAULT 0,
    "pageStart" INTEGER,
    "pageEnd" INTEGER,
    "sectionPath" JSONB,
    "contentHash" TEXT NOT NULL,
    "embeddingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArchiveDocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchiveEntity" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "canonicalName" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArchiveEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchiveChunkEntity" (
    "chunkId" UUID NOT NULL,
    "entityId" UUID NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "source" TEXT NOT NULL DEFAULT 'EXTRACTED',

    CONSTRAINT "ArchiveChunkEntity_pkey" PRIMARY KEY ("chunkId","entityId")
);

-- CreateTable
CREATE TABLE "ArchiveTag" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'AUTO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArchiveTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchiveDocumentTag" (
    "documentId" UUID NOT NULL,
    "tagId" UUID NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "source" TEXT NOT NULL DEFAULT 'AUTO',
    "approvedBy" UUID,

    CONSTRAINT "ArchiveDocumentTag_pkey" PRIMARY KEY ("documentId","tagId")
);

-- CreateTable
CREATE TABLE "ArchiveDocumentAcl" (
    "documentId" UUID NOT NULL,
    "principalType" TEXT NOT NULL,
    "principalId" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArchiveDocumentAcl_pkey" PRIMARY KEY ("documentId","principalType","principalId")
);

-- CreateTable
CREATE TABLE "ArchiveProcessingRun" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "versionId" UUID NOT NULL,
    "pipelineVersion" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "currentStage" TEXT NOT NULL DEFAULT 'CREATED',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "traceId" TEXT,

    CONSTRAINT "ArchiveProcessingRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchiveProcessingEvent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "runId" UUID NOT NULL,
    "stage" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArchiveProcessingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchiveSearchQuery" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "userId" UUID,
    "queryHash" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'HYBRID',
    "filters" JSONB,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArchiveSearchQuery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentExecutionStep_executionId_stepNumber_key" ON "AgentExecutionStep"("executionId", "stepNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AgentExecutionEvent_executionId_sequence_key" ON "AgentExecutionEvent"("executionId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "AgentExecutionLease_executionId_key" ON "AgentExecutionLease"("executionId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentExecutionCheckpoint_executionId_stepNumber_key" ON "AgentExecutionCheckpoint"("executionId", "stepNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AgentExecutionInbox_eventId_key" ON "AgentExecutionInbox"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "org_memberships_orgId_role_idx" ON "org_memberships"("orgId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");

-- CreateIndex
CREATE INDEX "invitations_orgId_email_idx" ON "invitations"("orgId", "email");

-- CreateIndex
CREATE INDEX "invitations_token_idx" ON "invitations"("token");

-- CreateIndex
CREATE INDEX "ai_usage_records_orgId_createdAt_idx" ON "ai_usage_records"("orgId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_usage_records_orgId_provider_model_idx" ON "ai_usage_records"("orgId", "provider", "model");

-- CreateIndex
CREATE INDEX "ai_usage_records_executionId_idx" ON "ai_usage_records"("executionId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_orgId_status_idx" ON "subscriptions"("orgId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_stripeInvoiceId_key" ON "invoices"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "invoices_orgId_status_idx" ON "invoices"("orgId", "status");

-- CreateIndex
CREATE INDEX "prompts_orgId_status_idx" ON "prompts"("orgId", "status");

-- CreateIndex
CREATE INDEX "prompts_orgId_category_idx" ON "prompts"("orgId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "prompts_orgId_slug_key" ON "prompts"("orgId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ModelEntry_modelId_key" ON "ModelEntry"("modelId");

-- CreateIndex
CREATE INDEX "ArchiveDocument_tenantId_idx" ON "ArchiveDocument"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ArchiveDocumentVersion_documentId_versionNumber_key" ON "ArchiveDocumentVersion"("documentId", "versionNumber");

-- CreateIndex
CREATE INDEX "ArchiveDocumentChunk_versionId_idx" ON "ArchiveDocumentChunk"("versionId");

-- CreateIndex
CREATE INDEX "ArchiveDocumentChunk_contentHash_idx" ON "ArchiveDocumentChunk"("contentHash");

-- CreateIndex
CREATE UNIQUE INDEX "ArchiveEntity_tenantId_canonicalName_entityType_key" ON "ArchiveEntity"("tenantId", "canonicalName", "entityType");

-- CreateIndex
CREATE UNIQUE INDEX "ArchiveTag_tenantId_slug_key" ON "ArchiveTag"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "ArchiveSearchQuery_tenantId_createdAt_idx" ON "ArchiveSearchQuery"("tenantId", "createdAt");

-- AddForeignKey
ALTER TABLE "AgentExecutionStep" ADD CONSTRAINT "AgentExecutionStep_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "AgentExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentExecutionEvent" ADD CONSTRAINT "AgentExecutionEvent_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "AgentExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentExecutionSnapshot" ADD CONSTRAINT "AgentExecutionSnapshot_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "AgentExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentExecutionMetric" ADD CONSTRAINT "AgentExecutionMetric_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "AgentExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentExecutionLease" ADD CONSTRAINT "AgentExecutionLease_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "AgentExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentExecutionCheckpoint" ADD CONSTRAINT "AgentExecutionCheckpoint_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "AgentExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentExecutionOutbox" ADD CONSTRAINT "AgentExecutionOutbox_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "AgentExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentExecutionInbox" ADD CONSTRAINT "AgentExecutionInbox_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "AgentExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_memberships" ADD CONSTRAINT "org_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_memberships" ADD CONSTRAINT "org_memberships_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage_records" ADD CONSTRAINT "ai_usage_records_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_budgets" ADD CONSTRAINT "usage_budgets_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvalRun" ADD CONSTRAINT "EvalRun_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "prompts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchiveDocumentVersion" ADD CONSTRAINT "ArchiveDocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "ArchiveDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchiveDocumentChunk" ADD CONSTRAINT "ArchiveDocumentChunk_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ArchiveDocumentVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchiveChunkEntity" ADD CONSTRAINT "ArchiveChunkEntity_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "ArchiveDocumentChunk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchiveChunkEntity" ADD CONSTRAINT "ArchiveChunkEntity_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "ArchiveEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchiveDocumentTag" ADD CONSTRAINT "ArchiveDocumentTag_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "ArchiveDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchiveDocumentTag" ADD CONSTRAINT "ArchiveDocumentTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ArchiveTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchiveDocumentAcl" ADD CONSTRAINT "ArchiveDocumentAcl_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "ArchiveDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchiveProcessingRun" ADD CONSTRAINT "ArchiveProcessingRun_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ArchiveDocumentVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchiveProcessingEvent" ADD CONSTRAINT "ArchiveProcessingEvent_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ArchiveProcessingRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
