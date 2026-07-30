/**
 * Domain event *shape*, per hiveforge/ADR-024 (event-driven platform
 * architecture). No publish/subscribe mechanism, no transport, no ordering
 * or delivery guarantees live here — those are contracts in this same
 * directory (HiveEventBus, HiveEventPublisher, ...), built against this
 * interface, not folded into it.
 *
 * Renamed from a bare `DomainEvent` (Slice 1) to `HiveDomainEvent`, per the
 * Repository Integration Findings below — this repo already has at least
 * two other, differently-shaped `DomainEvent` definitions in unrelated
 * bounded contexts (@cerebro/domain, @cerebro/core-bus), and a bare name
 * would have been a third. Caught while building Slice 3 and fixed
 * retroactively rather than left inconsistent with the Hive-prefix
 * convention already applied in Slice 2.
 */
export interface HiveDomainEvent<TPayload = unknown> {
  readonly eventId: string;
  readonly eventType: string;
  readonly occurredAt: Date;
  /** The aggregate that raised this event — a plain string, not a branded
   * Identifier<Brand>, since a single event stream may carry events from
   * more than one aggregate type. */
  readonly aggregateId: string;
  readonly payload: TPayload;
}

/**
 * Per hiveforge/ADR-024 and 03-CONTROL-PLANE.md §5's Domain vs. Integration
 * Event split: a HiveDomainEvent is internal to one aggregate/bounded
 * context; a HiveIntegrationEvent is the (potentially reshaped, versioned)
 * event published *across* bounded-context boundaries — e.g. to an external
 * SIEM (06-SECURITY.md §12) or a customer webhook. Kept as a distinct type,
 * not a type alias of HiveDomainEvent, since the two are allowed to diverge
 * in shape (an integration event's payload is a stable public contract; a
 * domain event's payload can change freely alongside the aggregate).
 *
 * Note: @cerebro/core-bus independently defined its own DomainEvent /
 * IntegrationEvent split for CerebroStudio's bounded context — convergent
 * evolution of the same pattern (ADR-024 wasn't written with that package
 * in mind, and vice versa), not a shared abstraction. The two are unrelated
 * and this package does not depend on core-bus.
 */
export interface HiveIntegrationEvent<TPayload = unknown> {
  readonly eventId: string;
  readonly eventType: string;
  readonly occurredAt: Date;
  readonly aggregateId: string;
  readonly payload: TPayload;
  /** Schema version of this integration event's public contract, since
   * unlike a HiveDomainEvent, external consumers depend on this shape
   * remaining stable or explicitly versioned. */
  readonly schemaVersion: string;
}
