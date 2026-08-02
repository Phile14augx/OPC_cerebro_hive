import { describe, it, expect } from 'vitest';
import { Execution } from '../Execution';
import { ExecutionStatus } from '../ExecutionStatus';
import { TransactionalOutboxExecutionEventSink } from '../TransactionalOutboxExecutionEventSink';
import { InMemoryExecutionEventOutboxStore } from '../ExecutionEventOutbox';
import { ExecutionEventRelay } from '../ExecutionEventRelay';
import {
  ExecutionEventContext,
  ExecutionIntegrationEventLike,
  ExecutionOutboxEventPublisher,
} from '../ExecutionOutboxEventPublisher';
import { ExecutionOrchestrator, ExecutionProviderPort } from '../ExecutionOrchestrator';
import { InMemoryEventBus } from '../../events/InMemoryEventBus';

const baseInput = {
  kind: 'Agent' as const,
  tenantId: 'tenant-1',
  workspaceId: 'workspace-1',
  userId: 'user-1',
  traceId: 'trace-1',
  correlationId: 'corr-1',
};

/** Same fake-publisher shape as `OutboxRelayExecutionEventSink.test.ts` —
 * stands in for a real `NatsIntegrationEventPublisher`, since this sandbox
 * cannot resolve `@cerebro/events`'s transitive `@prisma/client` dependency. */
class RecordingOutboxEventPublisher implements ExecutionOutboxEventPublisher {
  public readonly published: Array<{ event: ExecutionIntegrationEventLike; context: ExecutionEventContext }> = [];
  public failNextN = 0;

  async publish(event: ExecutionIntegrationEventLike, context: ExecutionEventContext): Promise<void> {
    if (this.failNextN > 0) {
      this.failNextN -= 1;
      throw new Error('simulated publish failure');
    }
    this.published.push({ event, context });
  }
}

describe('TransactionalOutboxExecutionEventSink', () => {
  it('appends a durable outbox entry instead of publishing directly', async () => {
    const outbox = new InMemoryExecutionEventOutboxStore();
    const sink = new TransactionalOutboxExecutionEventSink(outbox);

    const execution = Execution.create(baseInput);
    const event = execution.transitionTo(ExecutionStatus.Validating);
    await sink.publish(event);

    const pending = await outbox.loadPending();
    expect(pending).toHaveLength(1);
    expect(pending[0].event.type).toBe('ExecutionValidatedEvent');
    expect(pending[0].event.aggregateId).toBe(execution.id.toString());
    expect(pending[0].context.tenantId).toBe('tenant-1');
    expect(pending[0].context.correlationId).toBe('corr-1');
    expect(pending[0].status).toBe('pending');
  });

  it('every transition through a full orchestrator run is durably recorded, in order', async () => {
    const outbox = new InMemoryExecutionEventOutboxStore();
    const sink = new TransactionalOutboxExecutionEventSink(outbox);

    const repo = {
      saved: [] as Execution[],
      async save(execution: Execution, _expectedVersion: number) {
        this.saved.push(execution);
      },
      async load() {
        return undefined;
      },
      async exists() {
        return false;
      },
      async loadTransitions() {
        return [];
      },
      async findChildren() {
        return [];
      },
    };

    const provider: ExecutionProviderPort = {
      execute: async () => ({ outcome: 'completed', result: 'ok' }),
    };

    const orchestrator = new ExecutionOrchestrator(repo, provider, sink);
    await orchestrator.run(baseInput);

    const pending = await outbox.loadPending();
    expect(pending.map((p) => p.event.type)).toEqual([
      'ExecutionValidatedEvent',
      'ExecutionQueuedEvent',
      'ExecutionStartedEvent',
      'ExecutionCompletedEvent',
    ]);
  });
});

describe('ExecutionEventRelay', () => {
  it('publishes pending entries and marks them published', async () => {
    const outbox = new InMemoryExecutionEventOutboxStore();
    const publisher = new RecordingOutboxEventPublisher();
    const relay = new ExecutionEventRelay(outbox, publisher);

    const execution = Execution.create(baseInput);
    const event = execution.transitionTo(ExecutionStatus.Validating);
    const entry = await outbox.append(
      {
        type: event.constructor.name,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        eventId: event.eventId,
        occurredAt: event.timestamp.toISOString(),
        payload: event.payload,
      },
      { tenantId: event.tenantId, correlationId: event.correlationId }
    );

    const result = await relay.relayOnce();

    expect(result).toEqual({ processed: 1, published: 1, failed: 0, permanentlyFailed: 0 });
    expect(publisher.published).toHaveLength(1);
    const stored = outbox.get(entry.id);
    expect(stored?.status).toBe('published');
    expect(await outbox.loadPending()).toHaveLength(0);
  });

  it('retries a transient failure without marking the entry permanently failed', async () => {
    const outbox = new InMemoryExecutionEventOutboxStore();
    const publisher = new RecordingOutboxEventPublisher();
    publisher.failNextN = 1;
    const relay = new ExecutionEventRelay(outbox, publisher, { maxAttempts: 5 });

    const execution = Execution.create(baseInput);
    const event = execution.transitionTo(ExecutionStatus.Validating);
    const entry = await outbox.append(
      {
        type: event.constructor.name,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        eventId: event.eventId,
        occurredAt: event.timestamp.toISOString(),
        payload: event.payload,
      },
      { tenantId: event.tenantId, correlationId: event.correlationId }
    );

    const first = await relay.relayOnce();
    expect(first).toEqual({ processed: 1, published: 0, failed: 1, permanentlyFailed: 0 });
    expect(outbox.get(entry.id)?.status).toBe('pending');
    expect(outbox.get(entry.id)?.attempts).toBe(1);

    const second = await relay.relayOnce();
    expect(second).toEqual({ processed: 1, published: 1, failed: 0, permanentlyFailed: 0 });
    expect(outbox.get(entry.id)?.status).toBe('published');
  });

  it('marks an entry permanently failed once attempts reach maxAttempts', async () => {
    const outbox = new InMemoryExecutionEventOutboxStore();
    const publisher = new RecordingOutboxEventPublisher();
    publisher.failNextN = 999;
    const relay = new ExecutionEventRelay(outbox, publisher, { maxAttempts: 2 });

    const execution = Execution.create(baseInput);
    const event = execution.transitionTo(ExecutionStatus.Validating);
    const entry = await outbox.append(
      {
        type: event.constructor.name,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        eventId: event.eventId,
        occurredAt: event.timestamp.toISOString(),
        payload: event.payload,
      },
      { tenantId: event.tenantId, correlationId: event.correlationId }
    );

    const first = await relay.relayOnce();
    expect(first.permanentlyFailed).toBe(0);
    expect(outbox.get(entry.id)?.status).toBe('pending');

    const second = await relay.relayOnce();
    expect(second.permanentlyFailed).toBe(1);
    expect(outbox.get(entry.id)?.status).toBe('failed');
    expect(outbox.get(entry.id)?.attempts).toBe(2);

    // A failed (dead-lettered) entry is no longer pending, so a further
    // relayOnce() call sees nothing left to do.
    const third = await relay.relayOnce();
    expect(third).toEqual({ processed: 0, published: 0, failed: 0, permanentlyFailed: 0 });
  });
});

describe('InMemoryEventBus as an ExecutionEventSink — reuse, not reinvention', () => {
  it('is directly assignable as ExecutionOrchestrator\'s events sink and delivers events to subscribers', async () => {
    const bus = new InMemoryEventBus();
    const received: string[] = [];
    bus.subscribe('ExecutionValidatedEvent', async (event) => {
      received.push(event.constructor.name);
    });

    const repo = {
      saved: [] as Execution[],
      async save(execution: Execution, _expectedVersion: number) {
        this.saved.push(execution);
      },
      async load() {
        return undefined;
      },
      async exists() {
        return false;
      },
      async loadTransitions() {
        return [];
      },
      async findChildren() {
        return [];
      },
    };

    const provider: ExecutionProviderPort = {
      execute: async () => ({ outcome: 'completed', result: 'ok' }),
    };

    // No adapter class needed: InMemoryEventBus.publish(event): Promise<void>
    // already satisfies ExecutionEventSink structurally.
    const orchestrator = new ExecutionOrchestrator(repo, provider, bus);
    await orchestrator.run(baseInput);

    expect(received).toEqual(['ExecutionValidatedEvent']);
  });
});
