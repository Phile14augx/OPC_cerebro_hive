import type { HiveEventPublisher } from './HiveEventPublisher';
import type { HiveEventSubscriber } from './HiveEventSubscriber';

/**
 * Composes HiveEventPublisher + HiveEventSubscriber — the shape a future
 * infrastructure-slice implementation would provide. **Interface only**;
 * no InMemoryEventBus/MemoryEventBus-style concrete class exists here.
 *
 * Naming note (Repository Integration Findings, README): this repo already
 * has at least two other, differently-shaped EventBus implementations —
 * @cerebro/domain's EventBus/InMemoryEventBus (DomainEvent-keyed, no
 * envelope/metadata concept) and @cerebro/core-bus's EventBus/MemoryEventBus
 * plus a separate DomainEventBus class (three overlapping shapes within
 * core-bus alone: Event.ts's {type}-based DomainEvent/IntegrationEvent,
 * contracts/DomainEvent.ts's {eventType,payload}-based one used by
 * MemoryEventBus, and DomainEventBus's own handler-registration model).
 * This matches the "event bus (3+ declarations)" contested finding
 * recorded during the earlier M25.4A recon audit — independently
 * reconfirmed here while building this slice, not assumed resolved by
 * that audit's prior classification. HiveEventBus does not attempt to
 * unify or replace any of them; it is HiveForge's own, fourth (now
 * documented) contract, scoped only to HiveDomainEvent/HiveIntegrationEvent.
 */
export interface HiveEventBus extends HiveEventPublisher, HiveEventSubscriber {}
