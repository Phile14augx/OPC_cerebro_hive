import { describe, it, expect } from 'vitest';
import { Execution } from '../Execution';
import { ExecutionStatus } from '../ExecutionStatus';
import { InMemoryTracer } from '../Tracer';
import { InMemoryMetricsCollector } from '../Meter';
import { InMemoryStructuredLogger } from '../Logger';
import { correlationContextFrom } from '../CorrelationContext';
import { DefaultExecutionTelemetry, NoOpExecutionTelemetry } from '../ExecutionTelemetry';
import { ExecutionOrchestrator, ExecutionProviderPort } from '../ExecutionOrchestrator';
import { ExecutionEventRelay } from '../ExecutionEventRelay';
import { InMemoryExecutionEventOutboxStore } from '../ExecutionEventOutbox';
import { TransactionalOutboxExecutionEventSink } from '../TransactionalOutboxExecutionEventSink';
import {
  ExecutionEventContext,
  ExecutionIntegrationEventLike,
  ExecutionOutboxEventPublisher,
} from '../ExecutionOutboxEventPublisher';

const baseInput = {
  kind: 'Agent' as const,
  tenantId: 'tenant-1',
  workspaceId: 'workspace-1',
  userId: 'user-1',
  traceId: 'trace-1',
  correlationId: 'corr-1',
};

function makeRepo() {
  return {
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
}

describe('CorrelationContext', () => {
  it('derives the correlation fields from an Execution', () => {
    const execution = Execution.create(baseInput);
    const ctx = correlationContextFrom(execution);
    expect(ctx).toEqual({
      executionId: execution.id.toString(),
      tenantId: 'tenant-1',
      workspaceId: 'workspace-1',
      traceId: 'trace-1',
      correlationId: 'corr-1',
      parentExecutionId: undefined,
    });
  });
});

describe('InMemoryTracer', () => {
  it('records span hierarchy, attributes, and duration', () => {
    const tracer = new InMemoryTracer();
    const parent = tracer.startSpan('parent-op', { attributes: { a: 1 } });
    const child = tracer.startSpan('child-op', { parent, attributes: { b: 'x' } });
    child.setAttribute('extra', true);
    child.end();
    parent.end();

    const spans = tracer.getSpans();
    expect(spans).toHaveLength(2);
    const childRecord = tracer.getSpan(child.spanId);
    const parentRecord = tracer.getSpan(parent.spanId);
    expect(childRecord?.parentSpanId).toBe(parent.spanId);
    expect(parentRecord?.parentSpanId).toBeUndefined();
    expect(childRecord?.attributes).toEqual({ b: 'x', extra: true });
    expect(childRecord?.endedAt).toBeDefined();
  });

  it('records an exception on a span', () => {
    const tracer = new InMemoryTracer();
    const span = tracer.startSpan('op');
    span.recordException(new Error('boom'));
    span.end();
    const record = tracer.getSpan(span.spanId);
    expect(record?.exceptions).toHaveLength(1);
  });
});

describe('InMemoryMetricsCollector', () => {
  it('records counter, gauge, and histogram calls and aggregates them', () => {
    const meter = new InMemoryMetricsCollector();
    meter.incrementCounter('requests_total', 1, { outcome: 'ok' });
    meter.incrementCounter('requests_total', 2, { outcome: 'ok' });
    meter.incrementCounter('requests_total', 1, { outcome: 'error' });
    meter.setGauge('queue_depth', 5);
    meter.setGauge('queue_depth', 3);
    meter.recordHistogram('duration_ms', 12);
    meter.recordHistogram('duration_ms', 34);

    expect(meter.counterTotal('requests_total', { outcome: 'ok' })).toBe(3);
    expect(meter.counterTotal('requests_total')).toBe(4);
    expect(meter.gaugeValue('queue_depth')).toBe(3);
    expect(meter.histogramValues('duration_ms')).toEqual([12, 34]);
  });
});

describe('InMemoryStructuredLogger', () => {
  it('records leveled entries with structured fields', () => {
    const logger = new InMemoryStructuredLogger();
    logger.info('hello', { a: 1 });
    logger.error('bad', { reason: 'x' });

    expect(logger.getEntries()).toHaveLength(2);
    expect(logger.getEntriesAtLevel('error')).toHaveLength(1);
    expect(logger.getEntriesAtLevel('error')[0].fields).toEqual({ reason: 'x' });
  });
});

describe('DefaultExecutionTelemetry — ExecutionOrchestrator instrumentation', () => {
  it('emits a span, a counter, and a log line for every transition through a full run', async () => {
    const tracer = new InMemoryTracer();
    const meter = new InMemoryMetricsCollector();
    const logger = new InMemoryStructuredLogger();
    const telemetry = new DefaultExecutionTelemetry(tracer, meter, logger);

    const repo = makeRepo();
    const provider: ExecutionProviderPort = {
      execute: async () => ({ outcome: 'completed', result: 'ok' }),
    };

    const orchestrator = new ExecutionOrchestrator(repo, provider, undefined, { telemetry });
    await orchestrator.run(baseInput);

    const transitionSpans = tracer.getSpans().filter((s) => s.name === 'execution.transition');
    expect(transitionSpans).toHaveLength(4); // Validating, Queued, Running, Completed

    expect(meter.counterTotal('execution_transitions_total')).toBe(4);
    expect(meter.counterTotal('execution_provider_invocations_total', { outcome: 'completed' })).toBe(1);
    expect(meter.histogramValues('execution_provider_duration_ms')).toHaveLength(1);

    const infoLogs = logger.getEntriesAtLevel('info').filter((e) => e.message === 'Execution transitioned');
    expect(infoLogs).toHaveLength(4);
  });

  it('records a failure metric and log when a provider reports failed', async () => {
    const tracer = new InMemoryTracer();
    const meter = new InMemoryMetricsCollector();
    const logger = new InMemoryStructuredLogger();
    const telemetry = new DefaultExecutionTelemetry(tracer, meter, logger);

    const repo = makeRepo();
    const provider: ExecutionProviderPort = {
      execute: async () => ({ outcome: 'failed', reason: 'boom' }),
    };

    const orchestrator = new ExecutionOrchestrator(repo, provider, undefined, { telemetry });
    await orchestrator.run(baseInput);

    expect(meter.counterTotal('execution_failures_total')).toBe(1);
    expect(logger.getEntriesAtLevel('error')).toHaveLength(1);
    expect(logger.getEntriesAtLevel('error')[0].fields.reason).toBe('boom');
  });

  it('records a retry decision', async () => {
    const tracer = new InMemoryTracer();
    const meter = new InMemoryMetricsCollector();
    const logger = new InMemoryStructuredLogger();
    const telemetry = new DefaultExecutionTelemetry(tracer, meter, logger);

    const repo = makeRepo();
    const provider: ExecutionProviderPort = {
      execute: async () => ({ outcome: 'failed', reason: 'transient error, please retry' }),
    };

    const orchestrator = new ExecutionOrchestrator(repo, provider, undefined, { telemetry });
    const execution = await orchestrator.run(baseInput);

    await orchestrator.retryIfEligible(execution, { attempt: 1 });

    expect(meter.counterTotal('execution_retries_total')).toBe(1);
    const retryLogs = logger.getEntriesAtLevel('info').filter((e) => e.message === 'Execution retry decision');
    expect(retryLogs).toHaveLength(1);
    expect(retryLogs[0].fields.retried).toBe(false); // default NeverRetryPolicy
  });

  it('records cancellation requested and acknowledged', async () => {
    const tracer = new InMemoryTracer();
    const meter = new InMemoryMetricsCollector();
    const logger = new InMemoryStructuredLogger();
    const telemetry = new DefaultExecutionTelemetry(tracer, meter, logger);

    const repo = makeRepo();
    const provider: ExecutionProviderPort = {
      execute: async () => ({ outcome: 'waiting', reason: 'still working' }),
    };

    const orchestrator = new ExecutionOrchestrator(repo, provider, undefined, { telemetry });
    const execution = await orchestrator.run(baseInput);

    await orchestrator.requestCancellation(execution);
    await orchestrator.acknowledgeCancellation(execution);

    expect(meter.counterTotal('execution_cancellations_total', { phase: 'requested' })).toBe(1);
    expect(meter.counterTotal('execution_cancellations_total', { phase: 'acknowledged' })).toBe(1);
  });

  it('records event-published metrics/logs when an events sink is configured', async () => {
    const tracer = new InMemoryTracer();
    const meter = new InMemoryMetricsCollector();
    const logger = new InMemoryStructuredLogger();
    const telemetry = new DefaultExecutionTelemetry(tracer, meter, logger);

    const outbox = new InMemoryExecutionEventOutboxStore();
    const sink = new TransactionalOutboxExecutionEventSink(outbox);
    const repo = makeRepo();
    const provider: ExecutionProviderPort = {
      execute: async () => ({ outcome: 'completed', result: 'ok' }),
    };

    const orchestrator = new ExecutionOrchestrator(repo, provider, sink, { telemetry });
    await orchestrator.run(baseInput);

    expect(meter.counterTotal('execution_events_published_total')).toBe(4);
  });
});

describe('ExecutionEventRelay telemetry', () => {
  class RecordingOutboxEventPublisher implements ExecutionOutboxEventPublisher {
    public readonly published: Array<{ event: ExecutionIntegrationEventLike; context: ExecutionEventContext }> = [];
    async publish(event: ExecutionIntegrationEventLike, context: ExecutionEventContext): Promise<void> {
      this.published.push({ event, context });
    }
  }

  it('records a relay batch metric/log after relayOnce()', async () => {
    const tracer = new InMemoryTracer();
    const meter = new InMemoryMetricsCollector();
    const logger = new InMemoryStructuredLogger();
    const telemetry = new DefaultExecutionTelemetry(tracer, meter, logger);

    const outbox = new InMemoryExecutionEventOutboxStore();
    const publisher = new RecordingOutboxEventPublisher();
    const relay = new ExecutionEventRelay(outbox, publisher, { telemetry });

    const execution = Execution.create(baseInput);
    const event = execution.transitionTo(ExecutionStatus.Validating);
    await outbox.append(
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

    await relay.relayOnce();

    expect(meter.counterTotal('execution_outbox_published_total')).toBe(1);
    expect(meter.gaugeValue('execution_outbox_batch_processed')).toBe(1);
    const relayLogs = logger.getEntriesAtLevel('info').filter((e) => e.message === 'Execution event relay batch processed');
    expect(relayLogs).toHaveLength(1);
  });
});

describe('NoOpExecutionTelemetry — default, behavior-preserving', () => {
  it('is a real no-op that does not throw and orchestrator behavior is unaffected without an explicit telemetry option', async () => {
    const telemetry = new NoOpExecutionTelemetry();
    const span = telemetry.startExecutionSpan('x', Execution.create(baseInput));
    expect(() => span.end()).not.toThrow();

    const repo = makeRepo();
    const provider: ExecutionProviderPort = {
      execute: async () => ({ outcome: 'completed', result: 'ok' }),
    };
    // No telemetry opt passed at all — must behave exactly as every prior phase's test expects.
    const orchestrator = new ExecutionOrchestrator(repo, provider);
    const execution = await orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Completed);
  });
});
