/**
 * Cross-cutting metadata about an event's transport/tracing context —
 * kept separate from HiveDomainEvent's own fields deliberately. The
 * existing @cerebro/domain DomainEvent bakes tenantId/workspaceId/userId/
 * correlationId/causationId directly into every event subclass; this
 * package instead keeps HiveDomainEvent minimal (per Slice 1) and carries
 * this metadata alongside it in a HiveEventEnvelope, so the event payload
 * shape and its transport metadata can evolve independently.
 */
export interface HiveEventMetadata {
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly organizationId?: string;
  readonly tenantId?: string;
  readonly workspaceId?: string;
  readonly userId?: string;
  /** Schema/contract version of the envelope itself, distinct from
   * HiveIntegrationEvent's own schemaVersion (that versions the payload
   * contract; this versions the envelope/metadata shape). */
  readonly envelopeVersion: string;
}
