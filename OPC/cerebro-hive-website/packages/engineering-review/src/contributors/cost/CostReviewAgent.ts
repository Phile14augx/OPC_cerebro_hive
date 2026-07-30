import { ContributorResult, IReviewContributor, ReviewContext } from '../../ports/IReviewContributor';

/**
 * Per ADR-007: no real cost-analysis logic exists yet — there is no
 * CostEstimation, BudgetPolicy, or Optimization pipeline anywhere in this
 * repository. `ReviewContext` carries only workflowId, workflowVersionId,
 * a snapshot, and {nodeCount, edgeCount} — nothing a cost finding could
 * honestly be derived from.
 *
 * A prior revision of this file fabricated a specific "Lambda function is
 * configured with 10240MB memory but peak usage is 256MB" finding against
 * a hardcoded `lambda-function-abc` regardless of the actual context —
 * that was reverted. Until this contributor has a real evidence source
 * (e.g. actual cloud resource inventory), it reports `status: 'skipped'`
 * honestly rather than inventing analysis it never performed.
 */
export class CostReviewAgent implements IReviewContributor {
  readonly contributorId = 'cost-review';
  readonly displayName = 'Cost Review';
  readonly version = '0.1.0';
  readonly category = 'Cost';

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
