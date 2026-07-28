import { EngineeringReviewReport } from '../EngineeringReviewReport';
import { ReviewId, newManifestId } from '../ids';
import { createReviewManifest } from '../valueObjects';
import { IEngineeringReviewRepository } from '../ports/IEngineeringReviewRepository';
import { ContributorResult, IReviewContributor, ReviewContext } from '../ports/IReviewContributor';
import { ISnapshotProvider } from '../ports/ISnapshotProvider';
import { OneRecommendationPerFindingStrategy, RecommendationStrategy } from './RecommendationStrategy';
import { SeverityBasedVerdictStrategy, VerdictStrategy } from './VerdictStrategy';

export interface RunReviewInput {
  reviewId: ReviewId;
  reviewVersion: number;
  workflowId: string;
  workflowVersionId: string;
  priorWorkflowVersionId?: string;
  workflowSummary: { nodeCount: number; edgeCount: number };
}

/**
 * Application layer (Phase 3/4 split): coordinates the use case — obtains a
 * snapshot, invokes contributors, assembles their output into the aggregate,
 * synthesizes recommendations and a verdict via injected strategies,
 * publishes, and persists. Never itself implements evaluation logic (that
 * lives in contributors, in the domain's own construction invariants, and —
 * as of this revision — in the RecommendationStrategy/VerdictStrategy it's
 * handed) — this class is orchestration, not domain or governance logic.
 *
 * Slice 2 scope only: one (or more) contributors run in sequence with no
 * dependency-DAG ordering yet (Phase 6 §3 — deferred to Slice 6). The
 * default strategies below are intentionally minimal placeholders, not real
 * governance logic (that's Slice 5) — but they're no longer hardcoded here,
 * specifically so a 1:1 finding-to-recommendation assumption never gets
 * baked into the orchestrator itself. Recommendations are many-to-many
 * relative to findings in general; only Slice 2's default strategy happens
 * to be 1:1.
 */
export class EngineeringReviewOrchestrator {
  constructor(
    private readonly snapshotProvider: ISnapshotProvider,
    private readonly repository: IEngineeringReviewRepository,
    private readonly contributors: readonly IReviewContributor[],
    private readonly recommendationStrategy: RecommendationStrategy = new OneRecommendationPerFindingStrategy(),
    private readonly verdictStrategy: VerdictStrategy = new SeverityBasedVerdictStrategy()
  ) {}

  async run(input: RunReviewInput): Promise<EngineeringReviewReport> {
    const snapshot = await this.snapshotProvider.getSnapshot(input.workflowId);

    const manifest = createReviewManifest({
      id: newManifestId(),
      workflowId: input.workflowId,
      workflowVersionId: input.workflowVersionId,
      priorWorkflowVersionId: input.priorWorkflowVersionId,
      capabilityRegistrySnapshotId: snapshot.capabilityRegistrySnapshotId,
      platformVersion: snapshot.platformVersion,
      featureFlags: snapshot.featureFlags,
      snapshotId: snapshot.snapshotId,
    });

    const review = EngineeringReviewReport.create({
      id: input.reviewId,
      workflowId: input.workflowId,
      reviewVersion: input.reviewVersion,
      manifest,
    });

    const context: ReviewContext = {
      workflowId: input.workflowId,
      workflowVersionId: input.workflowVersionId,
      priorWorkflowVersionId: input.priorWorkflowVersionId,
      snapshot,
      workflowSummary: input.workflowSummary,
    };

    const results: ContributorResult[] = [];
    for (const contributor of this.contributors) {
      results.push(await this.safeExecute(contributor, context));
    }

    // Composition (Phase 6 §5): findings and evidence are appended across
    // contributors, never replaced.
    for (const result of results) {
      if (result.status !== 'succeeded') continue; // failed/skipped contributors
      // contribute nothing in Slice 2 — governance over required-vs-optional
      // contributor failure is deferred to Slice 6, per Phase 6 §4.
      for (const evidence of result.evidence) {
        review.addEvidence(evidence);
      }
      for (const finding of result.findings) {
        review.addFinding(finding);
      }
    }

    review.collectEvidence();
    review.completeEvaluation();

    // Phase 6 §5: "Recommendations are synthesized after contributor
    // execution ... by the framework, not by individual contributors."
    // Delegated to the injected strategy rather than assumed to be 1:1 with
    // findings — see RecommendationStrategy.ts.
    for (const recommendation of this.recommendationStrategy.synthesize(review.findings)) {
      review.addRecommendation(recommendation);
    }
    review.generateRecommendations();

    // Real governance/policy-driven verdicts are Slice 5 (policy evaluation
    // port) — delegated to the injected strategy so that arrives without
    // touching this orchestrator. See VerdictStrategy.ts.
    review.decideVerdict(this.verdictStrategy.decide(review.findings, review.recommendations));

    review.publish();
    await this.repository.save(review);
    return review;
  }

  /**
   * Phase 6 §4 (failure isolation): a contributor throwing must not
   * propagate across the contributor boundary or abort the whole review.
   * Converted here into a structured, failed ContributorResult instead.
   */
  private async safeExecute(
    contributor: IReviewContributor,
    context: ReviewContext
  ): Promise<ContributorResult> {
    try {
      return await contributor.execute(context);
    } catch (err) {
      return {
        contributorId: contributor.contributorId,
        status: 'failed',
        evidence: [],
        findings: [],
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
