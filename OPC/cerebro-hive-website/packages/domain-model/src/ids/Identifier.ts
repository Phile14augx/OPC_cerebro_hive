import { assertNonEmptyString, isNonEmptyString } from '../validation/guards';

/**
 * Strongly typed identifiers, per HiveForge Masterplan §Phase 1a
 * (hiveforge/01-DOMAIN-MODEL.md §1-2). A branded string — indistinguishable
 * from `string` at runtime (zero overhead, zero dependency), but distinct at
 * compile time, so an OrganizationId can never be passed where a
 * WorkspaceId is expected even though both are plain strings underneath.
 */
export type Identifier<Brand extends string> = string & { readonly __brand: Brand };

export interface IdentifierFactory<Brand extends string> {
  /** Constructs and validates an identifier. Throws DomainModelError if malformed. */
  of(value: string): Identifier<Brand>;
  /** Type guard — does not throw. */
  is(value: unknown): value is Identifier<Brand>;
}

export function createIdentifierFactory<Brand extends string>(
  brand: Brand,
): IdentifierFactory<Brand> {
  return {
    of(value: string): Identifier<Brand> {
      assertNonEmptyString(value, `${brand} must be a non-empty string, received: ${JSON.stringify(value)}`);
      return value as Identifier<Brand>;
    },
    is(value: unknown): value is Identifier<Brand> {
      return isNonEmptyString(value);
    },
  };
}
