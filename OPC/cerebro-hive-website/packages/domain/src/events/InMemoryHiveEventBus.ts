import { HiveEventBus, HiveEventHandler, HiveEventEnvelope } from '@cerebro/domain-model';

/**
 * A lightweight, in-memory implementation of the HiveEventBus contract.
 * Provides publish/subscribe routing for domain events within the same process.
 * 
 * Used by Phase 9c as the destination for OutboxRelay deliveries.
 */
export class InMemoryHiveEventBus implements HiveEventBus {
  private handlers = new Map<string, Set<HiveEventHandler>>();

  subscribe(eventType: string, handler: HiveEventHandler): void {
    const eventHandlers = this.handlers.get(eventType) ?? new Set<HiveEventHandler>();
    this.handlers.set(eventType, eventHandlers);
    eventHandlers.add(handler);
  }

  unsubscribe(eventType: string, handler: HiveEventHandler): void {
    const eventHandlers = this.handlers.get(eventType);
    if (eventHandlers) {
      eventHandlers.delete(handler);
    }
  }

  async publish(envelope: HiveEventEnvelope): Promise<void> {
    const event = envelope.event as typeof envelope.event & { readonly type?: unknown };
    const eventType = typeof event.type === 'string' && event.type
      ? event.type
      : event.constructor.name;
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
