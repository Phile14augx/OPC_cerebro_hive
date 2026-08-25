/**
 * Defines a contract for migrating an old event payload to a newer version during replay.
 */
export interface EventUpcaster<TOldPayload = unknown, TNewPayload = unknown> {
  /**
   * The version of the event schema this upcaster expects.
   */
  readonly fromVersion: number;
  
  /**
   * The version of the event schema this upcaster produces.
   */
  readonly toVersion: number;

  /**
   * The event type this upcaster applies to.
   */
  readonly eventType: string;

  /**
   * Upcasts the payload from the old version to the new version.
   * This is called lazily during event replay.
   * MUST be a pure, deterministic function.
   */
  upcast(payload: TOldPayload): TNewPayload;
}
