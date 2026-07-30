import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const ReviewStateSchema = z.enum([
  'Draft',
  'GatheringEvidence',
  'Evaluating',
  'Published',
  'Archived'
]).openapi({ description: 'The lifecycle state of the engineering review.' });

export const ReviewOutcomeSchema = z.enum([
  'pass',
  'fail',
  'needs-attention',
  'not-applicable'
]).openapi({ description: 'The governance verdict outcome.' });

export const EngineeringReviewSummarySchema = z.object({
  id: z.string().openapi({ example: 'review_123' }),
  workflowId: z.string().openapi({ example: 'wf_sec_review' }),
  reviewVersion: z.number().int().positive().openapi({ example: 1 }),
  state: ReviewStateSchema,
  createdAt: z.string().datetime().openapi({ example: '2026-07-28T12:00:00Z' }),
  publishedAt: z.string().datetime().optional().openapi({ example: '2026-07-28T12:05:00Z' }),
  verdict: z.object({
    outcome: ReviewOutcomeSchema,
    summary: z.string()
  }).optional(),
  findingCount: z.number().int().nonnegative().openapi({ example: 3 }),
  evidenceCount: z.number().int().nonnegative().openapi({ example: 12 })
}).openapi('EngineeringReviewSummary');

export const FindingDetailSchema = z.object({
  id: z.string().openapi({ example: 'finding_456' }),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  confidence: z.enum(['high', 'medium', 'low']),
  message: z.string().openapi({ example: 'Hardcoded credentials found.' }),
  evidenceRefs: z.array(z.string()).openapi({ example: ['evidence_789'] })
}).openapi('FindingDetail');

export const EvidenceSchema = z.object({
  id: z.string().openapi({ example: 'evidence_789' }),
  description: z.string().openapi({ example: 'AST Analysis Result' }),
  provenance: z.object({
    sourceSystem: z.string().openapi({ example: 'SecurityScanner' }),
    sourceElementId: z.string().openapi({ example: 'auth.js:L42' }),
    retrievedAt: z.string().datetime().openapi({ example: '2026-07-28T12:01:00Z' })
  }),
  payload: z.record(z.string(), z.unknown()).optional()
}).openapi('Evidence');

export const ContributorResultSchema = z.object({
  agentId: z.string().openapi({ example: 'SecurityReviewAgent' }),
  agentVersion: z.string().openapi({ example: '1.2.0' }),
  findingsProduced: z.number().int().nonnegative().openapi({ example: 1 }),
  executionTimeMs: z.number().int().nonnegative().openapi({ example: 450 }),
  completedAt: z.string().datetime().openapi({ example: '2026-07-28T12:02:00Z' })
}).openapi('ContributorResult');

export const FreshnessStatusSchema = z.object({
  isStale: z.boolean().openapi({ example: false }),
  reason: z.enum([
    'POLICY_CHANGED',
    'PLATFORM_CHANGED',
    'CONTRIBUTOR_UPGRADED',
    'WORKFLOW_CHANGED'
  ]).optional()
}).openapi('FreshnessStatus');
