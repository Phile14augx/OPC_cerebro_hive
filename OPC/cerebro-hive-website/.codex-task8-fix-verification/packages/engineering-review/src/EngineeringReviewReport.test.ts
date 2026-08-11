import { describe, expect, it } from 'vitest';
import { EngineeringReviewReport } from './EngineeringReviewReport';
import {
  DomainInvariantViolation,
  InvalidLifecycleTransition,
  MissingEvidenceReference,
} from './errors';
import {
  newEvidenceReferenceId,
  newFindingId,
  newManifestId,
  newRecommendationId,
  newReviewId,
} from './ids';
import {
  createEvidenceReference,
  createReviewFinding,
  createReviewManifest,
  createReviewRecommendation,
  createReviewVerdict,
} from './valueObjects';
import { InMemoryEngineeringReviewRepository } from './infrastructure/InMemoryEngineeringReviewRepository';

function buildManifest() {
  return createReviewManifest({
    id: newManifestId(),
    workflowId: 'wf-1',
    workflowVersionId: 'wf-1-v2',
    priorWorkflowVersionId: 'wf-1-v1',
    capabilityRegistrySnapshotId: 'cap-snap-1',
    platformVersion: '1.0.0',
    snapshotId: 'snap-1',
  });
}

function buildEvidence() {
  return createEvidenceReference({
    id: newEvidenceReferenceId(),
    description: 'Node "send-email" duplicates capability email.notify',
    provenance: {
      sourceSystem: 'workflow-graph',
      sourceElementId: 'node-42',
      retrievedAt: new Date().toISOString(),
    },
  });
}

/** Drives a review all the way to Published, for tests that need a
 * fully-formed review as a starting point. */
function buildPublishedReview() {
  const review = EngineeringReviewReport.create({
    id: newReviewId(),
    workflowId: 'wf-1',
    reviewVersion: 1,
    manifest: buildManifest(),
  });

  const evidence = buildEvidence();
  review.addEvidence(evidence);
  review.collectEvidence();

  const finding = createReviewFinding({
    id: newFindingId(),
    evidenceRefs: [evidence.id],
    severity: 'medium',
    confidence: 'high',
    message: 'Duplicates an existing capability.',
  });
  review.addFinding(finding);
  review.completeEvaluation();

  const recommendation = createReviewRecommendation({
    id: newRecommendationId(),
    findingRefs: [finding.id],
    priority: 'medium',
    message: 'Consider reusing email.notify instead of a bespoke node.',
  });
  review.addRecommendation(recommendation);
  review.generateRecommendations();

  const verdict = createReviewVerdict({
    outcome: 'flagged',
    recommendationRefs: [recommendation.id],
    summary: 'One duplication finding; author should review.',
  });
  review.decideVerdict(verdict);
  review.publish();

  return { review, evidence, finding, recommendation, verdict };
}

describe('EngineeringReviewReport lifecycle', () => {
  it('starts in Draft', () => {
    const review = EngineeringReviewReport.create({
      id: newReviewId(),
      workflowId: 'wf-1',
      reviewVersion: 1,
      manifest: buildManifest(),
    });
    expect(review.state).toBe('Draft');
    expect(review.evidenceRefs).toHaveLength(0);
  });

  it('cannot collect evidence with zero EvidenceReferences (invariant 1)', () => {
    const review = EngineeringReviewReport.create({
      id: newReviewId(),
      workflowId: 'wf-1',
      reviewVersion: 1,
      manifest: buildManifest(),
    });
    expect(() => review.collectEvidence()).toThrow(DomainInvariantViolation);
  });

  it('cannot skip states (e.g. Draft -> EvaluationCompleted directly)', () => {
    const review = EngineeringReviewReport.create({
      id: newReviewId(),
      workflowId: 'wf-1',
      reviewVersion: 1,
      manifest: buildManifest(),
    });
    review.addEvidence(buildEvidence());
    review.collectEvidence();
    expect(review.state).toBe('EvidenceCollected');
    // Attempting to jump straight to publish without completing evaluation,
    // generating recommendations, or deciding a verdict must fail.
    expect(() => review.publish()).toThrow(InvalidLifecycleTransition);
  });

  it('rejects a Finding that cites an EvidenceReference never recorded on this review (invariant 2, review-level check)', () => {
    const review = EngineeringReviewReport.create({
      id: newReviewId(),
      workflowId: 'wf-1',
      reviewVersion: 1,
      manifest: buildManifest(),
    });
    review.addEvidence(buildEvidence());
    review.collectEvidence();

    const orphanFinding = createReviewFinding({
      id: newFindingId(),
      evidenceRefs: [newEvidenceReferenceId()], // never added to this review
      severity: 'low',
      confidence: 'low',
      message: 'Orphaned finding.',
    });

    expect(() => review.addFinding(orphanFinding)).toThrow(MissingEvidenceReference);
  });

  it('a ReviewFinding cannot be constructed with zero EvidenceReferences at all (invariant 2, construction-level check)', () => {
    expect(() =>
      createReviewFinding({
        id: newFindingId(),
        evidenceRefs: [],
        severity: 'low',
        confidence: 'low',
        message: 'No evidence.',
      })
    ).toThrow(DomainInvariantViolation);
  });

  it('a ReviewRecommendation cannot be constructed with zero supporting Findings (invariant 3)', () => {
    expect(() =>
      createReviewRecommendation({
        id: newRecommendationId(),
        findingRefs: [],
        priority: 'low',
        message: 'Unsupported recommendation.',
      })
    ).toThrow(DomainInvariantViolation);
  });

  it('cannot decide a Verdict before EvaluationCompleted (invariant 11)', () => {
    const review = EngineeringReviewReport.create({
      id: newReviewId(),
      workflowId: 'wf-1',
      reviewVersion: 1,
      manifest: buildManifest(),
    });
    review.addEvidence(buildEvidence());
    review.collectEvidence();

    expect(() =>
      review.decideVerdict(
        createReviewVerdict({ outcome: 'clear', recommendationRefs: [], summary: 'Too early.' })
      )
    ).toThrow(InvalidLifecycleTransition);
  });

  it('cannot publish without a Verdict (invariant 12)', () => {
    const review = EngineeringReviewReport.create({
      id: newReviewId(),
      workflowId: 'wf-1',
      reviewVersion: 1,
      manifest: buildManifest(),
    });
    review.addEvidence(buildEvidence());
    review.collectEvidence();
    review.completeEvaluation();
    review.generateRecommendations();

    expect(() => review.publish()).toThrow(DomainInvariantViolation);
  });

  it('reaches Published through the full, valid transition sequence', () => {
    const { review, verdict } = buildPublishedReview();
    expect(review.state).toBe('Published');
    expect(review.verdict).toEqual(verdict);
    expect(review.publishedAt).toBeDefined();
  });

  it('is immutable once Published — no further mutation of any kind (invariant 4)', () => {
    const { review } = buildPublishedReview();

    expect(() => review.addEvidence(buildEvidence())).toThrow(InvalidLifecycleTransition);
    expect(() =>
      review.addFinding(
        createReviewFinding({
          id: newFindingId(),
          evidenceRefs: [review.evidenceRefs[0].id],
          severity: 'low',
          confidence: 'low',
          message: 'Too late.',
        })
      )
    ).toThrow(InvalidLifecycleTransition);
    expect(() =>
      review.addRecommendation(
        createReviewRecommendation({
          id: newRecommendationId(),
          findingRefs: [review.findings[0].id],
          priority: 'low',
          message: 'Too late.',
        })
      )
    ).toThrow(InvalidLifecycleTransition);
    expect(() =>
      review.decideVerdict(
        createReviewVerdict({ outcome: 'clear', recommendationRefs: [], summary: 'Too late.' })
      )
    ).toThrow(InvalidLifecycleTransition);
    expect(() => review.publish()).toThrow(InvalidLifecycleTransition);
  });

  it('produces a ReviewSummary computed on demand, not stored as separate state', () => {
    const { review } = buildPublishedReview();
    const summary = review.toSummary();
    expect(summary).toEqual({
      reviewId: review.id,
      workflowId: review.workflowId,
      state: 'Published',
      findingCount: 1,
      recommendationCount: 1,
      verdict: 'flagged',
    });
  });
});

describe('InMemoryEngineeringReviewRepository', () => {
  it('round-trips a review through save/load', async () => {
    const repo = new InMemoryEngineeringReviewRepository();
    const { review } = buildPublishedReview();

    await repo.save(review);
    const loaded = await repo.load(review.id);

    expect(loaded).toBeDefined();
    expect(loaded!.id).toBe(review.id);
    expect(loaded!.state).toBe('Published');
    expect(loaded!.findings).toHaveLength(1);
    expect(loaded!.recommendations).toHaveLength(1);
    expect(loaded!.verdict?.outcome).toBe('flagged');
  });

  it('findLatest returns the highest reviewVersion for a workflow', async () => {
    const repo = new InMemoryEngineeringReviewRepository();
    const manifest = buildManifest();

    const v1 = EngineeringReviewReport.create({
      id: newReviewId(),
      workflowId: 'wf-9',
      reviewVersion: 1,
      manifest,
    });
    const v2 = EngineeringReviewReport.create({
      id: newReviewId(),
      workflowId: 'wf-9',
      reviewVersion: 2,
      manifest,
    });
    await repo.save(v1);
    await repo.save(v2);

    const latest = await repo.findLatest('wf-9');
    expect(latest?.reviewVersion).toBe(2);
  });

  it('findByWorkflow only returns reviews for the requested workflow', async () => {
    const repo = new InMemoryEngineeringReviewRepository();
    const manifest = buildManifest();
    const a = EngineeringReviewReport.create({
      id: newReviewId(),
      workflowId: 'wf-a',
      reviewVersion: 1,
      manifest,
    });
    const b = EngineeringReviewReport.create({
      id: newReviewId(),
      workflowId: 'wf-b',
      reviewVersion: 1,
      manifest,
    });
    await repo.save(a);
    await repo.save(b);

    const results = await repo.findByWorkflow('wf-a');
    expect(results).toHaveLength(1);
    expect(results[0].workflowId).toBe('wf-a');
  });

  it('findByVerdict filters by the review verdict outcome', async () => {
    const repo = new InMemoryEngineeringReviewRepository();
    const { review } = buildPublishedReview();
    await repo.save(review);

    const flagged = await repo.findByVerdict('flagged');
    const clear = await repo.findByVerdict('clear');
    expect(flagged).toHaveLength(1);
    expect(clear).toHaveLength(0);
  });
});
