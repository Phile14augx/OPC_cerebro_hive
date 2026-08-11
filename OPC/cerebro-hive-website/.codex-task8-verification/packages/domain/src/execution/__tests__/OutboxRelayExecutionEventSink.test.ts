import { describe, it, expect } from 'vitest';
import { Execution } from '../Execution';
import { ExecutionStatus } from '../ExecutionStatus';
import { OutboxRelayExecutionEventSink } from '../OutboxRelayExecutionEventSink';
import { ExecutionEventContext, ExecutionIntegrationEventLike, ExecutionOutboxEventPublisher } from '../ExecutionOutboxEventPublisher';
import { ExecutionOrchestrator, ExecutionProviderPort } from '../ExecutionOrchestrator';

/**
 * A local fake standing in for a real `NatsIntegrationEventPublisher`
 * (`packages/events/src/NatsPublisher.ts`) — same public method shape
 * (`publish(event: { type: string; ... }, context: { tenantId: string; ... })`),
 * used here because this sandbox cannot resolve `@cerebro/core-bus`/
 * `@cerebro/events`'s transitive `@prisma/client` dependency (see
 * `ExecutionOutboxEventPublisher.ts`'s own doc comment). This fake proves
 * the *conversion logic* in `OutboxRelayExecutionEventSink` is correct; it
 * does not prove a real NATS broker receives anything.
 */
class RecordingOutboxEventPublisher implements ExecutionOutboxEventPublisher {
  public readonly published: Array<{ event: ExecutionIntegrationEventLike; context: ExecutionEventContext }> = [];

  async publish(event: ExecutionIntegrationEventLike, context: ExecutionEventContext): Promise<void> {
    this.published.push({ event, context });
  }
}

const baseInput = {
  kind: 'Agent' as const,
  tenantId: 'tenant-1',
  workspaceId: 'workspace-1',
  userId: 'user-1',
  traceId: 'trace-1',
  correlationId: 'corr-1',
};

describe('OutboxRelayExecutionEventSink — event-shape conversion', () => {
  it('converts a canonical Execution event into the {type, aggregateId, ...} shape the real publisher expects', async () => {
    const publisher = new RecordingOutboxEventPublisher();
    const sink = new OutboxRelayExecutionEventSink(publisher);

    const execution = Execution.create(baseInput);
    const event = execution.transitionTo(ExecutionStatus.Validating);

    await sink.publish(event);

    expect(publisher.published).toHaveLength(1);
    const { event: sent, context } = publisher.published[0];
    expect(sent.type).toBe('ExecutionValidatedEvent');
    expect(sent.aggregateId).toBe(execution.id.toString());
    expect(sent.aggregateType).toBe('Execution');
    expect(sent.eventId).toBe(event.eventId);
    expect(sent.payload).toEqual(event.payload);
    expect(context.tenantId).toBe('tenant-1');
    expect(context.correlationId).toBe('corr-1');
  });

  it('carries occurredAt as an ISO string derived from the event timestamp', async () => {
    const publisher = new RecordingOutboxEventPublisher();
    const sink = new OutboxRelayExecutionEventSink(publisher);
    const execution = Execution.create(baseInput);
    const event = execution.transitionTo(ExecutionStatus.Validating);

    await sink.publish(event);

    const { event: sent } = publisher.published[0];
    expect(sent.occurredAt).toBe(event.timestamp.toISOString());
  });
});

describe('OutboxRelayExecutionEventSink — integration with ExecutionOrchestrator', () => {
  it('every transition through a full orchestrator run reaches the publisher, in order', async () => {
    const publisher = new RecordingOutboxEventPublisher();
    const sink = new OutboxRelayExecutionEventSink(publisher);

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

    expect(publisher.published.map((p) => p.event.type)).toEqual([
      'ExecutionValidatedEvent',
      'ExecutionQueuedEvent',
      'ExecutionStartedEvent',
      'ExecutionCompletedEvent',
    ]);
  });
});
