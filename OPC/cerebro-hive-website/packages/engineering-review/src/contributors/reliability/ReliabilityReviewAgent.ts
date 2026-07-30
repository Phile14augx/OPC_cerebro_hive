import { ContributorResult, IReviewContributor, ReviewContext } from '../../ports/IReviewContributor';

/**
 * Per ADR-007: no real reliability-analysis logic exists yet — there is no
 * static-snapshot or historical-runtime-evidence pipeline anywhere in this
 * repository. `ReviewContext` carries only workflowId, workflowVersionId,
 * a snapshot, and {nodeCount, edgeCount} — nothing a reliability finding
 * could honestly be derived from.
 *
 * A prior revision of this file fabricated a specific "Primary SQS queue
 * is missing a Dead Letter Queue" finding against a hardcoded
 * `sqs-queue-primary` regardless of the actual context — that was
 * reverted. Until this contributor has a real evidence source, it reports
 * `status: 'skipped'` honestly rather than inventing analysis it never
 * performed.
 */
export class ReliabilityReviewAgent implements IReviewContributor {
  readonly contributorId = 'reliability-review';
  readonly displayName = 'Reliability Review';
  readonly version = '0.1.0';
  readonly category = 'Reliability';

  async execute(_context: ReviewContext): Promise<ContributorResult> {
    const startedAt = new Date();
    const completedAt = new Date();

    return {
      contributorId: this.contributorId,
      status: 'skipped',
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
      metrics: [],
      evidence: [],
      findings: [],
    };
  }
}
