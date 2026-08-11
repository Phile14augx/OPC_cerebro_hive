import { describe, expect, it } from 'vitest';
import type { HiveDomainEvent, HiveIntegrationEvent } from '../events/HiveDomainEvent';
import type { HiveEventEnvelope } from '../events/HiveEventEnvelope';
import type { HiveEventBus } from '../events/HiveEventBus';
import type { HiveEventHandler } from '../events/HiveEventSubscriber';
import type { HiveEventStore } from '../events/HiveEventStore';
import type { HiveEventSerializer } from '../events/HiveEventSerializer';
import type { HiveEventDispatcher } from '../events/HiveEventDispatcher';
import type { HiveEventPublisher } from '../events/HiveEventPublisher';

function buildEnvelope(): HiveEventEnvelope {
  const event: HiveDomainEvent<{ name: string }> = {
    eventId: 'evt-1',
    eventType: 'WorkspaceCreated',
    occurredAt: new Date(),
    aggregateId: 'ws-1',
    payload: { name: 'production' },
  };
  return {
    event,
    metadata: { envelopeVersion: '1.0' },
  };
}

describe('HiveIntegrationEvent', () => {
  it('is a distinct, separately-versioned shape from HiveDomainEvent', () => {
    const integrationEvent: HiveIntegrationEvent<{ workspaceId: string }> = {
      eventId: 'evt-2',
      eventType: 'WorkspaceCreated.v1',
      occurredAt: new Date(),
      aggregateId: 'ws-1',
      payload: { workspaceId: 'ws-1' },
      schemaVersion: '1.0.0',
    };
    expect(integrationEvent.schemaVersion).toBe('1.0.0');
  });
});

describe('HiveEventEnvelope', () => {
  it('pairs an event with its metadata', () => {
    const envelope = buildEnvelope();
    expect(envelope.event.eventType).toBe('WorkspaceCreated');
    expect(envelope.metadata.envelopeVersion).toBe('1.0');
  });
});

describe('Event contracts are implementable (interfaces only, no shipped implementation)', () => {
  it('a HiveEventBus implementation satisfies publish + subscribe/unsubscribe', async () => {
    const handlers = new Map<string, Set<HiveEventHandler>>();
    const bus: HiveEventBus = {
      async publish(envelope) {
        const set = handlers.get(envelope.event.eventType);
        if (set) {
          await Promise.all(Array.from(set).map((h) => h(envelope)));
        }
      },
      subscribe(eventType, handler) {
        if (!handlers.has(eventType)) handlers.set(eventType, new Set());
        handlers.get(eventType)?.add(handler);
      },
      unsubscribe(eventType, handler) {
        handlers.get(eventType)?.delete(handler);
      },
    };

    let received: HiveEventEnvelope | undefined;
    const handler: HiveEventHandler = async (envelope) => {
      received = envelope;
    };

    bus.subscribe('WorkspaceCreated', handler);
    await bus.publish(buildEnvelope());
    expect(received?.event.eventType).toBe('WorkspaceCreated');

    bus.unsubscribe('WorkspaceCreated', handler);
    received = undefined;
    await bus.publish(buildEnvelope());
    expect(received).toBeUndefined();
  });

  it('a HiveEventStore implementation satisfies append/loadEvents (in-memory only, not persistence)', async () => {
    const byAggregate = new Map<string, HiveEventEnvelope[]>();
    const store: HiveEventStore = {
      async append(aggregateId, envelopes) {
        const existing = byAggregate.get(aggregateId) ?? [];
        byAggregate.set(aggregateId, [...existing, ...envelopes]);
      },
      async loadEvents(aggregateId) {
        return byAggregate.get(aggregateId) ?? [];
      },
    };

    await store.append('ws-1', [buildEnvelope()]);
    await expect(store.loadEvents('ws-1')).resolves.toHaveLength(1);
    await expect(store.loadEvents('ws-unknown')).resolves.toHaveLength(0);
  });

  it('a HiveEventSerializer implementation round-trips an envelope', () => {
    const serializer: HiveEventSerializer = {
      serialize(envelope) {
        return JSON.stringify(envelope);
      },
      deserialize(payload) {
        const parsed = JSON.parse(payload) as HiveEventEnvelope;
        return { ...parsed, event: { ...parsed.event, occurredAt: new Date(parsed.event.occurredAt) } };
      },
    };

    const envelope = buildEnvelope();
    const roundTripped = serializer.deserialize(serializer.serialize(envelope));
    expect(roundTripped.event.eventId).toBe(envelope.event.eventId);
  });

  it('a HiveEventDispatcher implementation satisfies dispatch', async () => {
    let dispatched: HiveEventEnvelope | undefined;
    const dispatcher: HiveEventDispatcher = {
      async dispatch(envelope) {
        dispatched = envelope;
      },
    };
    await dispatcher.dispatch(buildEnvelope());
    expect(dispatched?.event.aggregateId).toBe('ws-1');
  });

  it('a HiveEventPublisher implementation satisfies publish', async () => {
    let published: HiveEventEnvelope | undefined;
    const publisher: HiveEventPublisher = {
      async publish(envelope) {
        published = envelope;
      },
    };
    await publisher.publish(buildEnvelope());
    expect(published).toBeDefined();
  });
});
