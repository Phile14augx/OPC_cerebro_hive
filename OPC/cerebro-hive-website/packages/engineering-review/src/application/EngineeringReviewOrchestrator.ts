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

export class EngineeringReviewOrchestrator {
  constructor(
    private readonly snapshotProvider: ISnapshotProvider,
    private readonly repository: IEngineeringReviewRepository,
    private readonly registry: { getEnabled(): readonly IReviewContributor[] },
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

    const contributors = this.registry.getEnabled();
    const results = await Promise.all(
      contributors.map(contributor => this.safeExecute(contributor, context))
    );

    for (const result of results) {
      if (result.status !== 'succeeded') continue;
      for (const evidence of result.evidence) {
        review.addEvidence(evidence);
      }
    }
    review.collectEvidence();

    for (const result of results) {
      if (result.status !== 'succeeded') continue;
      for (const finding of result.findings) {
        review.addFinding(finding);
      }
    }
    review.completeEvaluation();

    for (const recommendation of this.recommendationStrategy.synthesize(review.findings)) {
      review.addRecommendation(recommendation);
    }
    review.generateRecommendations();

    review.decideVerdict(this.verdictStrategy.decide(review.findings, review.recommendations));

    review.publish();
    await this.repository.save(review);
    return review;
  }

  private async safeExecute(
    contributor: IReviewContributor,
    context: ReviewContext
  ): Promise<ContributorResult> {
    const startedAt = new Date();
    try {
      return await contributor.execute(context);
    } catch (err) {
      const completedAt = new Date();
      console.error(`Contributor ${contributor.contributorId} failed:`, err);
      return {
        contributorId: contributor.contributorId,
        status: 'failed',
        startedAt: startedAt.toISOString(),
        completedAt: completedAt.toISOString(),
        durationMs: completedAt.getTime() - startedAt.getTime(),
        metrics: [],
        evidence: [],
        findings: [],
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
