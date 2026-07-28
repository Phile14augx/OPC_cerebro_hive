import { describe, expect, it } from 'vitest';
import { EngineeringReviewOrchestrator } from './EngineeringReviewOrchestrator';
import { ArchitectureReviewContributor } from '../infrastructure/ArchitectureReviewContributor';
import { FixedSnapshotProvider } from '../infrastructure/FixedSnapshotProvider';
import { InMemoryEngineeringReviewRepository } from '../infrastructure/InMemoryEngineeringReviewRepository';
import { newReviewId } from '../ids';
import { IReviewContributor, ContributorResult, ReviewContext } from '../ports/IReviewContributor';

const FIXED_SNAPSHOT = {
  snapshotId: 'snap-1',
  capabilityRegistrySnapshotId: 'cap-snap-1',
  platformVersion: '1.0.0',
  featureFlags: {},
};

function buildOrchestrator(contributors: readonly IReviewContributor[], repo = new InMemoryEngineeringReviewRepository()) {
  const snapshotProvider = new FixedSnapshotProvider(FIXED_SNAPSHOT);
  const orchestrator = new EngineeringReviewOrchestrator(snapshotProvider, repo, contributors);
  return { orchestrator, repo };
}

describe('EngineeringReviewOrchestrator end-to-end (Slice 2)', () => {
  it('runs Workflow -> Snapshot -> Contributor -> ContributorResult -> EngineeringReviewReport -> Repository for a clean workflow', async () => {
    const { orchestrator, repo } = buildOrchestrator([new ArchitectureReviewContributor(25)]);

    const review = await orchestrator.run({
      reviewId: newReviewId(),
      reviewVersion: 1,
      workflowId: 'wf-clean',
      workflowVersionId: 'wf-clean-v1',
      workflowSummary: { nodeCount: 5, edgeCount: 4 },
    });

    expect(review.state).toBe('Published');
    expect(review.findings).toHaveLength(0);
    expect(review.recommendations).toHaveLength(0);
    expect(review.verdict?.outcome).toBe('clear');
    // Evidence is still recorded even with no findings — evidence is "what
    // was examined," not "what was wrong" (per ArchitectureReviewContributor).
    expect(review.evidenceRefs.length).toBeGreaterThan(0);

    const persisted = await repo.load(review.id);
    expect(persisted?.state).toBe('Published');
  });

  it('produces a finding, a recommendation, and a flagged verdict for a complex workflow', async () => {
    const { orchestrator } = buildOrchestrator([new ArchitectureReviewContributor(25)]);

    const review = await orchestrator.run({
      reviewId: newReviewId(),
      reviewVersion: 1,
      workflowId: 'wf-complex',
      workflowVersionId: 'wf-complex-v1',
      workflowSummary: { nodeCount: 40, edgeCount: 60 },
    });

    expect(review.state).toBe('Published');
    expect(review.findings).toHaveLength(1);
    expect(review.recommendations).toHaveLength(1);
    expect(review.recommendations[0].findingRefs).toEqual([review.findings[0].id]);
    expect(review.verdict?.outcome).toBe('flagged');
    expect(review.verdict?.recommendationRefs).toEqual([review.recommendations[0].id]);
  });

  it('isolates a contributor failure instead of aborting the review (Phase 6 §4)', async () => {
    const throwingContributor: IReviewContributor = {
      contributorId: 'throws-always',
      displayName: 'Always Throws',
      version: '0.0.1',
      category: 'Test',
      async execute(_context: ReviewContext): Promise<ContributorResult> {
        throw new Error('simulated contributor crash');
      },
    };

    const { orchestrator } = buildOrchestrator([
      throwingContributor,
      new ArchitectureReviewContributor(25),
    ]);

    // The throwing contributor must not abort the whole review — the
    // well-behaved ArchitectureReviewContributor's evidence should still
    // reach the published review.
    const review = await orchestrator.run({
      reviewId: newReviewId(),
      reviewVersion: 1,
      workflowId: 'wf-with-bad-contributor',
      workflowVersionId: 'wf-with-bad-contributor-v1',
      workflowSummary: { nodeCount: 5, edgeCount: 4 },
    });

    expect(review.state).toBe('Published');
    expect(review.evidenceRefs.length).toBeGreaterThan(0);
    expect(review.verdict?.outcome).toBe('clear');
  });

  it('never lets a contributor exception propagate out of the orchestrator', async () => {
    const throwingContributor: IReviewContributor = {
      contributorId: 'throws-always',
      displayName: 'Always Throws',
      version: '0.0.1',
      category: 'Test',
      async execute(): Promise<ContributorResult> {
        throw new Error('simulated contributor crash');
      },
    };
    const { orchestrator } = buildOrchestrator([throwingContributor]);

    // Even with the ONLY contributor failing (zero evidence produced at
    // all), the orchestrator itself must not throw an uncaught contributor
    // exception. It will fail at collectEvidence() instead (invariant 1),
    // which is a domain error, not a leaked infrastructure exception.
    await expect(
      orchestrator.run({
        reviewId: newReviewId(),
        reviewVersion: 1,
        workflowId: 'wf-all-fail',
        workflowVersionId: 'wf-all-fail-v1',
        workflowSummary: { nodeCount: 5, edgeCount: 4 },
      })
    ).rejects.toThrow(/EvidenceReference/);
  });
});
