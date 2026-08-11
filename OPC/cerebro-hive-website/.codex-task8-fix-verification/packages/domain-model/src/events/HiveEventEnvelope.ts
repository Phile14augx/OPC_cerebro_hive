import type { HiveDomainEvent } from './HiveDomainEvent';
import type { HiveEventMetadata } from './HiveEventMetadata';

/**
 * What actually crosses a transport boundary — a HiveDomainEvent (or
 * HiveIntegrationEvent) paired with its HiveEventMetadata. Every contract
 * in this directory that talks about "publishing" or "storing" an event
 * operates on an envelope, not a bare event, so transport-context
 * metadata is never accidentally dropped.
 */
export interface HiveEventEnvelope<TEvent extends HiveDomainEvent = HiveDomainEvent> {
  readonly event: TEvent;
  readonly metadata: HiveEventMetadata;
}
