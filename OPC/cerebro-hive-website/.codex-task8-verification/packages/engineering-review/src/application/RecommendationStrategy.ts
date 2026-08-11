import { newRecommendationId } from '../ids';
import {
  RecommendationPriority,
  ReviewFinding,
  ReviewRecommendation,
  Severity,
  createReviewRecommendation,
} from '../valueObjects';

/**
 * Recommendations are many-to-many relative to findings in general — a
 * future governance strategy might collapse five findings into two
 * recommendations, or expand one finding into three. Extracted as its own
 * interface so that relationship is never assumed to be 1:1 by the
 * orchestrator itself, even though Slice 2's only implementation happens to
 * be 1:1.
 */
export interface RecommendationStrategy {
  synthesize(findings: readonly ReviewFinding[]): ReviewRecommendation[];
}

/**
 * Slice 2's placeholder strategy: exactly one recommendation per finding,
 * restating it. Real synthesis (collapsing/expanding findings into a
 * different number of recommendations, weighing severity across multiple
 * findings, etc.) is later-slice governance logic, not decided here — this
 * exists only so the orchestrator has something to call before Slice 5.
 */
export class OneRecommendationPerFindingStrategy implements RecommendationStrategy {
  synthesize(findings: readonly ReviewFinding[]): ReviewRecommendation[] {
    return findings.map((finding) =>
      createReviewRecommendation({
        id: newRecommendationId(),
        findingRefs: [finding.id],
        priority: severityToPriority(finding.severity),
        message: `Address: ${finding.message}`,
      })
    );
  }
}

export function severityToPriority(severity: Severity): RecommendationPriority {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'high';
    case 'medium':
      return 'medium';
    case 'low':
    default:
      return 'low';
  }
}
