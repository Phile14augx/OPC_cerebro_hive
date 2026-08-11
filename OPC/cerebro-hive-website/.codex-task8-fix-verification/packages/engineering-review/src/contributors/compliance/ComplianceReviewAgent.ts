import { ContributorResult, IReviewContributor, ReviewContext } from '../../ports/IReviewContributor';

/**
 * Per ADR-007: no real compliance-policy logic exists yet — there is no
 * GDPRPolicy, HIPAAPolicy, SOC2Policy adapter, or any source of
 * infrastructure/data-handling evidence anywhere in this repository.
 * `ReviewContext` carries only workflowId, workflowVersionId, a snapshot,
 * and {nodeCount, edgeCount} — nothing a compliance finding could
 * honestly be derived from.
 *
 * A prior revision of this file fabricated a specific "Data at rest
 * encryption is enabled" finding against a hardcoded `dynamodb-table-xyz`
 * regardless of the actual context — that was reverted. Until this
 * contributor has a real evidence source, it reports `status: 'skipped'`
 * honestly rather than inventing analysis it never performed.
 */
export class ComplianceReviewAgent implements IReviewContributor {
  readonly contributorId = 'compliance-review';
  readonly displayName = 'Compliance Review';
  readonly version = '0.1.0';
  readonly category = 'Compliance';

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
