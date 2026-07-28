/**
 * Domain exception hierarchy. A base `DomainError` with specific subclasses
 * so callers/tests can distinguish *why* an invariant was violated (a bad
 * lifecycle transition vs. a dangling reference vs. a duplicate identifier)
 * rather than catching one undifferentiated error type. Kept intentionally
 * small — extend with new subclasses as new invariant categories emerge,
 * rather than front-loading every conceivable failure mode now.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Catch-all for invariant violations that don't fit a more specific
 * subclass below (e.g. malformed construction: an empty message, a review
 * with no evidence at all). */
export class DomainInvariantViolation extends DomainError {}

/** A lifecycle transition was attempted from a state that doesn't allow it
 * (including any mutation attempted after Published). */
export class InvalidLifecycleTransition extends DomainError {}

/** A Finding (or other construct) referenced an EvidenceReference that was
 * never recorded on this review. */
export class MissingEvidenceReference extends DomainError {}

/** A Recommendation referenced a Finding that was never recorded on this
 * review. */
export class MissingFindingReference extends DomainError {}

/** A Verdict referenced a Recommendation that was never recorded on this
 * review. Symmetric with MissingFindingReference one level up the
 * evidence -> finding -> recommendation -> verdict chain. */
export class MissingRecommendationReference extends DomainError {}

/** An EvidenceReference, Finding, or Recommendation was added using an
 * identifier already present on this review. */
export class DuplicateDomainIdentifier extends DomainError {}
