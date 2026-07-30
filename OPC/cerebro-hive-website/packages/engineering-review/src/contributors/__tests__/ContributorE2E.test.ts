import { describe, expect, it } from 'vitest';
import { EngineeringReviewOrchestrator } from '../../application/EngineeringReviewOrchestrator';
import { FixedSnapshotProvider } from '../../infrastructure/FixedSnapshotProvider';
import { InMemoryEngineeringReviewRepository } from '../../infrastructure/InMemoryEngineeringReviewRepository';
import { newReviewId } from '../../ids';
import { IReviewContributor } from '../../ports/IReviewContributor';
import { ContributorRegistry } from '../ContributorRegistry';

/**
 * Per ADR-007. A prior revision of this file asserted that all five
 * registered contributors (Security/Cost/Compliance/Reliability/
 * Architecture) each produce one evidence item and one finding — including
 * asserting 'critical'/'low' severities from the Security/Compliance
 * agents. That was wrong to assert: those agents fabricated findings that
 * could not be derived from `ReviewContext` (which carries no IAM, Lambda,
 * DynamoDB, or SQS data at all), and the assertions treated that
 * fabrication as correct behavior. Both the agents and this test have been
 * corrected. Only `ArchitectureReviewContributor` has real analysis logic
 * today; the other four honestly report `status: 'skipped'` until they
 * have a real evidence source, per the contributor docstrings themselves.
 */

const FIXED_SNAPSHOT = {
  snapshotId: 'snap-1',
  capabilityRegistrySnapshotId: 'cap-snap-1',
  platformVersion: '1.0.0',
  featureFlags: {},
};

function buildOrchestrator(registryObj: { getEnabled: () => readonly IReviewContributor[] }) {
  const snapshotProvider = new FixedSnapshotProvider(FIXED_SNAPSHOT);
  const repo = new InMemoryEngineeringReviewRepository();
  const orchestrator = new EngineeringReviewOrchestrator(snapshotProvider, repo, registryObj);
  return { orchestrator, repo };
}

describe('Contributor pipeline end-to-end (M26.5 LLM-Backed, ADR-013)', () => {
  it('registers all 5 contributors; Security and Architecture execute via LLMExecutionService and return deterministic mocked findings', async () => {
    const registry = new ContributorRegistry();
    expect(registry.getEnabled()).toHaveLength(5);

    const { orchestrator, repo } = buildOrchestrator(registry);

    const review = await orchestrator.run({
      reviewId: newReviewId(),
      reviewVersion: 1,
      workflowId: 'wf-full-e2e',
      workflowVersionId: 'wf-full-e2e-v1',
      workflowSummary: { nodeCount: 40, edgeCount: 60 }, // above ArchitectureReviewContributor's threshold
    });

    expect(review.state).toBe('Published');

    // Both SecurityReviewAgent and ArchitectureReviewContributor now return findings via the mocked LLM response.
    // The other three report 'skipped' with zero evidence/findings.
    expect(review.evidenceRefs).toHaveLength(2);
    expect(review.findings).toHaveLength(2);
    
    const findingCategories = review.findings.map(f => f.category);
    expect(findingCategories).toContain('IAM');
    expect(findingCategories).toContain('complexity');

    const persisted = await repo.load(review.id);
    expect(persisted?.state).toBe('Published');
  });

  it('isolates a failing contributor from the rest of the registry', async () => {
    const registry = new ContributorRegistry();
    const contributors = [...registry.getEnabled()];

    const throwingIndex = contributors.findIndex((c) => c.contributorId === 'cost-review');
    contributors[throwingIndex] = {
      contributorId: 'cost-review-throws',
      displayName: 'Cost Throws',
      version: '0.1.0',
      category: 'Cost',
      async execute() {
        throw new Error('Simulated Cost Failure');
      },
    };

    const { orchestrator } = buildOrchestrator({ getEnabled: () => contributors });

    const review = await orchestrator.run({
      reviewId: newReviewId(),
      reviewVersion: 1,
      workflowId: 'wf-partial-failure',
      workflowVersionId: 'wf-partial-failure-v1',
      workflowSummary: { nodeCount: 10, edgeCount: 5 }, // below threshold — no Architecture finding
    });

    // The throwing contributor must not abort the review — Architecture's
    // and Security's evidence still reaches the published review, and the review
    // completes even though one of five contributors failed and two
    // others honestly skipped.
    expect(review.state).toBe('Published');
    expect(review.evidenceRefs).toHaveLength(2); // Architecture + Security
    expect(review.findings).toHaveLength(1);     // Security (Architecture skips finding due to low nodeCount)
  });
});
