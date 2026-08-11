/**
 * Base helper for value objects — compared structurally (by value), not by
 * identity. Deliberately simple: structural equality via JSON serialization
 * is adequate for the plain-data props any Slice 1 value object holds
 * (no Date/Map/Set-valued props yet); a future slice with richer props
 * should extend this rather than this package inventing a general-purpose
 * deep-equal utility ahead of actual need.
 */
export abstract class ValueObject<TProps extends object> {
  protected constructor(protected readonly props: TProps) {}

  equals(other: ValueObject<TProps> | null | undefined): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this === other) {
      return true;
    }
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
