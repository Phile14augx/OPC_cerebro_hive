import { describe, expect, it } from 'vitest';
import { EngineeringReviewReport } from './EngineeringReviewReport';
import {
  DuplicateDomainIdentifier,
  MissingEvidenceReference,
  MissingFindingReference,
  MissingRecommendationReference,
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

/**
 * Dedicated test category for aggregate-internal graph consistency, as
 * distinct from the lifecycle tests in EngineeringReviewReport.test.ts.
 * These exercise cross-reference integrity specifically: can a Finding,
 * Recommendation, or Verdict point at something that isn't actually part of
 * this review, and are duplicate identifiers rejected.
 */

function buildManifest() {
  return createReviewManifest({
    id: newManifestId(),
    workflowId: 'wf-ref',
    workflowVersionId: 'wf-ref-v1',
    capabilityRegistrySnapshotId: 'cap-snap-1',
    platformVersion: '1.0.0',
    snapshotId: 'snap-1',
  });
}

function buildEvidence(description = 'evidence') {
  return createEvidenceReference({
    id: newEvidenceReferenceId(),
    description,
    provenance: {
      sourceSystem: 'workflow-graph',
      sourceElementId: 'node-1',
      retrievedAt: new Date().toISOString(),
    },
  });
}

function newDraftWithEvidence() {
  const review = EngineeringReviewReport.create({
    id: newReviewId(),
    workflowId: 'wf-ref',
    reviewVersion: 1,
    manifest: buildManifest(),
  });
  const evidence = buildEvidence();
  review.addEvidence(evidence);
  review.collectEvidence();
  return { review, evidence };
}

describe('EngineeringReviewReport reference integrity', () => {
  it('rejects a Finding referencing unknown evidence with MissingEvidenceReference', () => {
    const { review } = newDraftWithEvidence();
    const unknownEvidenceFinding = createReviewFinding({
      id: newFindingId(),
      evidenceRefs: [newEvidenceReferenceId()], // not recorded on this review
      severity: 'low',
      confidence: 'low',
      message: 'Cites evidence this review never collected.',
    });

    expect(() => review.addFinding(unknownEvidenceFinding)).toThrow(MissingEvidenceReference);
  });

  it('rejects a Recommendation referencing an unknown Finding with MissingFindingReference', () => {
    const { review, evidence } = newDraftWithEvidence();
    const finding = createReviewFinding({
      id: newFindingId(),
      evidenceRefs: [evidence.id],
      severity: 'low',
      confidence: 'low',
      message: 'A real finding.',
    });
    review.addFinding(finding);
    review.completeEvaluation();

    const orphanRecommendation = createReviewRecommendation({
      id: newRecommendationId(),
      findingRefs: [newFindingId()], // not recorded on this review
      priority: 'low',
      message: 'Cites a finding this review never recorded.',
    });

    expect(() => review.addRecommendation(orphanRecommendation)).toThrow(MissingFindingReference);
  });

  it('rejects a Verdict referencing an unknown Recommendation with MissingRecommendationReference', () => {
    const { review, evidence } = newDraftWithEvidence();
    const finding = createReviewFinding({
      id: newFindingId(),
      evidenceRefs: [evidence.id],
      severity: 'low',
      confidence: 'low',
      message: 'A real finding.',
    });
    review.addFinding(finding);
    review.completeEvaluation();

    const recommendation = createReviewRecommendation({
      id: newRecommendationId(),
      findingRefs: [finding.id],
      priority: 'low',
      message: 'A real recommendation.',
    });
    review.addRecommendation(recommendation);
    review.generateRecommendations();

    const badVerdict = createReviewVerdict({
      outcome: 'flagged',
      recommendationRefs: [newRecommendationId()], // not recorded on this review
      summary: 'Cites a recommendation this review never recorded.',
    });

    expect(() => review.decideVerdict(badVerdict)).toThrow(MissingRecommendationReference);
  });

  it('rejects re-adding an EvidenceReference with the same id (append-only, invariant 5)', () => {
    const review = EngineeringReviewReport.create({
      id: newReviewId(),
      workflowId: 'wf-ref',
      reviewVersion: 1,
      manifest: buildManifest(),
    });
    const evidence = buildEvidence();
    review.addEvidence(evidence);

    // Intended semantics: an EvidenceReference id is a one-time identifier
    // within a review. Re-adding the same id — even with different content
    // — is rejected outright rather than silently ignored or merged, so a
    // review's evidence set can't be quietly altered after the fact.
    expect(() => review.addEvidence(evidence)).toThrow(DuplicateDomainIdentifier);
  });

  it('rejects adding a Finding with an id already recorded on this review', () => {
    const { review, evidence } = newDraftWithEvidence();
    const finding = createReviewFinding({
      id: newFindingId(),
      evidenceRefs: [evidence.id],
      severity: 'low',
      confidence: 'low',
      message: 'First recording.',
    });
    review.addFinding(finding);

    const sameIdDifferentContent = createReviewFinding({
      id: finding.id,
      evidenceRefs: [evidence.id],
      severity: 'critical',
      confidence: 'high',
      message: 'Attempting to reuse the same FindingId.',
    });

    expect(() => review.addFinding(sameIdDifferentContent)).toThrow(DuplicateDomainIdentifier);
  });

  it('rejects adding a Recommendation with an id already recorded on this review', () => {
    const { review, evidence } = newDraftWithEvidence();
    const finding = createReviewFinding({
      id: newFindingId(),
      evidenceRefs: [evidence.id],
      severity: 'low',
      confidence: 'low',
      message: 'A real finding.',
    });
    review.addFinding(finding);
    review.completeEvaluation();

    const recommendation = createReviewRecommendation({
      id: newRecommendationId(),
      findingRefs: [finding.id],
      priority: 'low',
      message: 'First recording.',
    });
    review.addRecommendation(recommendation);

    const sameIdDifferentContent = createReviewRecommendation({
      id: recommendation.id,
      findingRefs: [finding.id],
      priority: 'high',
      message: 'Attempting to reuse the same RecommendationId.',
    });

    expect(() => review.addRecommendation(sameIdDifferentContent)).toThrow(
      DuplicateDomainIdentifier
    );
  });
});
