/**
 * Base for anything with identity that persists across state changes
 * (an Entity, in the DDD sense — distinct from a ValueObject, which has no
 * identity and is compared structurally). Deliberately minimal: no
 * persistence hooks, no lifecycle state, no event handling — those belong
 * to AggregateRoot or to whichever slice actually implements a concrete
 * aggregate.
 */
export abstract class Entity<TId extends string> {
  protected constructor(public readonly id: TId) {}

  equals(other: Entity<TId> | null | undefined): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this === other) {
      return true;
    }
    return this.id === other.id;
  }
}
