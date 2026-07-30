import { DomainModelError } from '../errors/DomainModelError';

/**
 * Zero-dependency runtime guards. Per this slice's scope ("runtime schemas
 * only where the architecture already requires them" — 01-DOMAIN-MODEL.md
 * doesn't yet require anything beyond non-empty identifiers), these are
 * plain type guards, not a validation library. Introducing zod or a similar
 * dependency here would violate the "keep it dependency-free" constraint
 * this package was scoped under.
 */

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function assertNonEmptyString(value: unknown, message: string): asserts value is string {
  if (!isNonEmptyString(value)) {
    throw new DomainModelError(message);
  }
}
