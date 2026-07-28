import { newEvidenceReferenceId, newFindingId } from '../ids';
import { createEvidenceReference, createReviewFinding } from '../valueObjects';
import { ContributorResult, IReviewContributor, ReviewContext } from '../ports/IReviewContributor';

/**
 * Slice 2's one concrete contributor (roadmap: "for example, an Architecture
 * contributor"). Deliberately simple, deterministic logic — this exists to
 * validate that the contributor contract fits naturally around the
 * aggregate, not to be a real architectural analysis.
 *
 * Always produces at least one EvidenceReference (Phase 3 invariant 1
 * requires at least one to leave Draft, and — more importantly — evidence
 * represents "what was examined," not "what was wrong"; a clean review
 * should still show its work). Only produces a Finding when the workflow's
 * node count crosses a fixed, arbitrary-for-Slice-2 threshold.
 */
export class ArchitectureReviewContributor implements IReviewContributor {
  readonly contributorId = 'architecture-review';
  readonly displayName = 'Architecture Review';
  readonly version = '0.1.0';
  readonly category = 'Architecture';

  constructor(private readonly complexityThreshold = 25) {}

  async execute(context: ReviewContext): Promise<ContributorResult> {
    const examinedEvidence = createEvidenceReference({
      id: newEvidenceReferenceId(),
      description: `Examined workflow graph: ${context.workflowSummary.nodeCount} nodes, ${context.workflowSummary.edgeCount} edges.`,
      provenance: {
        sourceSystem: 'workflow-graph',
        sourceElementId: context.workflowVersionId,
        retrievedAt: new Date().toISOString(),
      },
    });

    if (context.workflowSummary.nodeCount <= this.complexityThreshold) {
      return {
        contributorId: this.contributorId,
        status: 'succeeded',
        evidence: [examinedEvidence],
        findings: [],
      };
    }

    const finding = createReviewFinding({
      id: newFindingId(),
      evidenceRefs: [examinedEvidence.id],
      severity: 'medium',
      confidence: 'medium',
      message: `Workflow has ${context.workflowSummary.nodeCount} nodes, above the ${this.complexityThreshold}-node complexity threshold. Consider decomposing into sub-workflows.`,
      category: 'complexity',
    });

    return {
      contributorId: this.contributorId,
      status: 'succeeded',
      evidence: [examinedEvidence],
      findings: [finding],
    };
  }
}
