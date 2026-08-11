import { HiveEventBus } from '@cerebro/domain-model';
import { HiveEventSubscriber, HiveEventHandler } from '@cerebro/domain-model';
import { HiveEventPublisher } from '@cerebro/domain-model';
import { HiveEventEnvelope } from '@cerebro/domain-model';

/**
 * A lightweight, in-memory implementation of the HiveEventBus contract.
 * Provides publish/subscribe routing for domain events within the same process.
 * 
 * Used by Phase 9c as the destination for OutboxRelay deliveries.
 */
export class InMemoryHiveEventBus implements HiveEventBus {
  private handlers = new Map<string, Set<HiveEventHandler>>();

  subscribe(eventType: string, handler: HiveEventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  unsubscribe(eventType: string, handler: HiveEventHandler): void {
    const eventHandlers = this.handlers.get(eventType);
    if (eventHandlers) {
      eventHandlers.delete(handler);
    }
  }

  async publish(envelope: HiveEventEnvelope): Promise<void> {
    // The type property exists on HiveDomainEvent. If not, fallback to constructor name.
    const eventType = (envelope.event as any).type || envelope.event.constructor.name;
    const eventHandlers = this.handlers.get(eventType);

    if (eventHandlers) {
      // Execute all handlers concurrently for this event
      await Promise.all(
        Array.from(eventHandlers).map(handler => handler(envelope))
      );
    }
  }

  async publishBatch(envelopes: readonly HiveEventEnvelope[]): Promise<void> {
    for (const envelope of envelopes) {
      await this.publish(envelope);
    }
  }
}
