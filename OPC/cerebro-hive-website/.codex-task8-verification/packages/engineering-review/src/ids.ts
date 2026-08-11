import { randomUUID } from 'node:crypto';

/**
 * Standardized identity types (Phase 5 §8) — dedicated branded types rather
 * than bare strings, so a FindingId can't be accidentally passed where a
 * RecommendationId was expected.
 */
type Brand<T, B extends string> = T & { readonly __brand: B };

export type ReviewId = Brand<string, 'ReviewId'>;
export type FindingId = Brand<string, 'FindingId'>;
export type RecommendationId = Brand<string, 'RecommendationId'>;
export type EvidenceReferenceId = Brand<string, 'EvidenceReferenceId'>;
export type ManifestId = Brand<string, 'ManifestId'>;

export function newReviewId(): ReviewId {
  return `review_${randomUUID()}` as ReviewId;
}
export function newFindingId(): FindingId {
  return `finding_${randomUUID()}` as FindingId;
}
export function newRecommendationId(): RecommendationId {
  return `recommendation_${randomUUID()}` as RecommendationId;
}
export function newEvidenceReferenceId(): EvidenceReferenceId {
  return `evidence_${randomUUID()}` as EvidenceReferenceId;
}
export function newManifestId(): ManifestId {
  return `manifest_${randomUUID()}` as ManifestId;
}
