import {
  ReviewFinding,
  ReviewOutcome,
  ReviewRecommendation,
  ReviewVerdict,
  Severity,
  createReviewVerdict,
} from '../valueObjects';

/**
 * Extracted so Slice 5's real policy/governance-driven verdict logic can
 * replace this without touching EngineeringReviewOrchestrator itself.
 */
export interface VerdictStrategy {
  decide(
    findings: readonly ReviewFinding[],
    recommendations: readonly ReviewRecommendation[]
  ): ReviewVerdict;
}

/**
 * Slice 2's placeholder strategy: a fixed, deterministic mapping from
 * finding severities only. No policy evaluation, no weighting across
 * recommendation priority — that's Slice 5 (policy evaluation port).
 */
export class SeverityBasedVerdictStrategy implements VerdictStrategy {
  decide(
    findings: readonly ReviewFinding[],
    recommendations: readonly ReviewRecommendation[]
  ): ReviewVerdict {
    const outcome = deriveOutcome(findings.map((f) => f.severity));
    return createReviewVerdict({
      outcome,
      recommendationRefs: recommendations.map((r) => r.id),
      summary: summarizeOutcome(outcome, findings.length),
    });
  }
}

function deriveOutcome(severities: readonly Severity[]): ReviewOutcome {
  if (severities.some((s) => s === 'critical' || s === 'high')) return 'needs-attention';
  if (severities.length > 0) return 'flagged';
  return 'clear';
}

function summarizeOutcome(outcome: ReviewOutcome, findingCount: number): string {
  switch (outcome) {
    case 'clear':
      return 'No findings — review is clear.';
    case 'flagged':
      return `${findingCount} finding(s) recorded; author should review.`;
    case 'needs-attention':
    default:
      return `${findingCount} finding(s) recorded, including at least one high-severity item.`;
  }
}
