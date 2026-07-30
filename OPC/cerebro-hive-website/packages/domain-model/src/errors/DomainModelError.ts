/**
 * Thrown for invariant violations within @cerebro/domain-model itself
 * (malformed identifiers, malformed value objects). Not a general-purpose
 * application error hierarchy — this package has no opinion on how a
 * consuming service maps this to an HTTP status, a Result type, or anything
 * else. Kept intentionally small, consistent with this slice's non-goals
 * (no API layer, no persistence).
 */
export class DomainModelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainModelError';
    Object.setPrototypeOf(this, DomainModelError.prototype);
  }
}
