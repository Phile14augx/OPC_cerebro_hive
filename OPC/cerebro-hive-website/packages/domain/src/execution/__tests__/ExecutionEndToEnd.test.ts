import { describe, it, expect } from 'vitest';
import { Execution } from '../Execution';
import { ExecutionStatus } from '../ExecutionStatus';
import { isLegalExecutionTransition } from '../ExecutionTransitions';
import { InvariantViolationError, ConcurrencyError } from '../../errors/DomainError';
import { InMemoryExecutionRepository } from '../InMemoryExecutionRepository';
import {
  ExecutionOrchestrator,
  ExecutionEventSink,
  ExecutionProviderPort,
  ExecutionProviderResult,
} from '../ExecutionOrchestrator';
import { Clock } from '../Clock';
import { InMemoryExecutionIdempotencyStore } from '../ExecutionIdempotency';
import { MaxAttemptsRetryPolicy } from '../ExecutionRetryPolicy';
import { DefaultExecutionFailureClassifier } from '../ExecutionFailureClassification';
import { InMemoryExecutionEventOutboxStore } from '../ExecutionEventOutbox';
import { TransactionalOutboxExecutionEventSink } from '../TransactionalOutboxExecutionEventSink';
import { ExecutionEventRelay } from '../ExecutionEventRelay';
import {
  ExecutionEventContext,
  ExecutionIntegrationEventLike,
  ExecutionOutboxEventPublisher,
} from '../ExecutionOutboxEventPublisher';
import { InMemoryEventBus } from '../../events/InMemoryEventBus';
import { DomainEvent } from '../../events/DomainEvent';
import { InMemoryTracer } from '../Tracer';
import { InMemoryMetricsCollector } from '../Meter';
import { InMemoryStructuredLogger } from '../Logger';
import { DefaultExecutionTelemetry } from '../ExecutionTelemetry';
import { replayExecution } from '../ExecutionReplay';

/**
 * Phase 9g-6 — end-to-end verification of the full, in-process execution
 * pipeline:
 *
 *   API/Command -> ExecutionOrchestrator -> Execution aggregate ->
 *   Domain Events -> ExecutionEventSink -> Transactional Outbox ->
 *   ExecutionEventRelay -> Integration Events -> Consumer
 *                                            \-> InMemoryEventBus -> Consumer
 *
 * every node built and verified in 9a through 9g-5, wired together here for
 * the first time and exercised as a whole across the full scenario matrix
 * named in `ADR-051`. Per the same explicit scoping as every prior 9g
 * sub-phase: this verifies what a deterministic, in-process environment CAN
 * prove — no live Postgres/NATS, no multi-process test harness, no real
 * elapsed wall-clock time anywhere in this file. See `ADR-051`'s explicit
 * Implemented/Verified/Deferred breakdown for what this file does not (and
 * cannot) prove.
 */

const baseInput = {
  kind: 'Agent' as const,
  tenantId: 'tenant-1',
  workspaceId: 'workspace-1',
  userId: 'user-1',
  traceId: 'trace-1',
  correlationId: 'corr-1',
};

class DeterministicClock implements Clock {
  constructor(private current: Date) {}
  now(): Date {
    return this.current;
  }
  advance(ms: number): void {
    this.current = new Date(this.current.getTime() + ms);
  }
}

function makeFakeProvider(result: ExecutionProviderResult | (() => ExecutionProviderResult)): ExecutionProviderPort {
  return { execute: async () => (typeof result === 'function' ? result() : result) };
}

/** Stands in for a real `NatsIntegrationEventPublisher` — the "Consumer"
 * node downstream of `ExecutionEventRelay` in the pipeline diagram above.
 * Same pattern as `OutboxRelayExecutionEventSink.test.ts`/`ExecutionEventDelivery.test.ts`:
 * a real recording implementation of the real `ExecutionOutboxEventPublisher`
 * contract, not a mock framework stand-in. */
class RecordingOutboxEventPublisher implements ExecutionOutboxEventPublisher {
  public readonly published: ExecutionIntegrationEventLike[] = [];
  public failNextN = 0;

  async publish(event: ExecutionIntegrationEventLike, _context: ExecutionEventContext): Promise<void> {
    if (this.failNextN > 0) {
      this.failNextN -= 1;
      throw new Error('simulated publish failure');
    }
    this.published.push(event);
  }
}

/** A real fan-out `ExecutionEventSink`: every canonical Execution event is
 * durably appended to the transactional outbox (the relayed/consumer-facing
 * path) AND handed to an `InMemoryEventBus` (the synchronous in-process
 * subscriber path 9g-4 demonstrated `EventBus` already supports with no
 * adapter). Both delivery paths named in the pipeline diagram, exercised
 * together against the same stream of events — this is test-local wiring,
 * not a new package export, since production callers choose exactly one
 * sink (or their own composite) rather than this specific pairing. */
class FanOutExecutionEventSink implements ExecutionEventSink {
  constructor(
    private readonly outboxSink: TransactionalOutboxExecutionEventSink,
    private readonly bus: InMemoryEventBus
  ) {}

  async publish(event: DomainEvent, tx?: unknown): Promise<void> {
    await this.outboxSink.publish(event, tx as never);
    await this.bus.publish(event);
  }
}

interface Pipeline {
  clock: DeterministicClock;
  repo: InMemoryExecutionRepository;
  outbox: InMemoryExecutionEventOutboxStore;
  publisher: RecordingOutboxEventPublisher;
  relay: ExecutionEventRelay;
  bus: InMemoryEventBus;
  busReceived: string[];
  tracer: InMemoryTracer;
  meter: InMemoryMetricsCollector;
  logger: InMemoryStructuredLogger;
  orchestrator: ExecutionOrchestrator;
}

const CONSUMED_EVENT_TYPES = [
  'ExecutionCreatedEvent',
  'ExecutionValidatedEvent',
  'ExecutionQueuedEvent',
  'ExecutionStartedEvent',
  'ExecutionWaitingEvent',
  'ExecutionCancellingEvent',
  'ExecutionResumedEvent',
  'ExecutionCompletedEvent',
  'ExecutionFailedEvent',
  'ExecutionCancelledEvent',
  'ExecutionTimedOutEvent',
];

function buildPipeline(
  provider: ExecutionProviderPort,
  opts: {
    clock?: DeterministicClock;
    idempotencyStore?: InMemoryExecutionIdempotencyStore;
    retryPolicy?: MaxAttemptsRetryPolicy;
  } = {}
): Pipeline {
  const clock = opts.clock ?? new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
  const repo = new InMemoryExecutionRepository();
  const outbox = new InMemoryExecutionEventOutboxStore();
  const publisher = new RecordingOutboxEventPublisher();
  const tracer = new InMemoryTracer();
  const meter = new InMemoryMetricsCollector();
  const logger = new InMemoryStructuredLogger();
  const telemetry = new DefaultExecutionTelemetry(tracer, meter, logger);
  const relay = new ExecutionEventRelay(outbox, publisher, { telemetry });
  const bus = new InMemoryEventBus();
  const busReceived: string[] = [];
  for (const type of CONSUMED_EVENT_TYPES) {
    bus.subscribe(type, async (event) => {
      busReceived.push(event.constructor.name);
    });
  }

  const outboxSink = new TransactionalOutboxExecutionEventSink(outbox);
  const sink = new FanOutExecutionEventSink(outboxSink, bus);

  const orchestrator = new ExecutionOrchestrator(repo, provider, sink, {
    clock,
    idempotencyStore: opts.idempotencyStore,
    failureClassifier: new DefaultExecutionFailureClassifier(),
    retryPolicy: opts.retryPolicy,
    telemetry,
  });

  return { clock, repo, outbox, publisher, relay, bus, busReceived, tracer, meter, logger, orchestrator };
}

describe('9g-6 — Full pipeline wiring (happy path)', () => {
  it('drives Command -> Orchestrator -> Aggregate -> Domain Events -> Outbox -> Relay -> Consumer, and -> InMemoryEventBus -> Consumer, in order', async () => {
    const provider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    const pipeline = buildPipeline(provider);

    const execution = await pipeline.orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Completed);

    // Durable half: every transition reached the outbox, in order, pending.
    const pending = await pipeline.outbox.loadPending();
    expect(pending.map((p) => p.event.type)).toEqual([
      'ExecutionValidatedEvent',
      'ExecutionQueuedEvent',
      'ExecutionStartedEvent',
      'ExecutionCompletedEvent',
    ]);

    // Relay half: publishes everything pending, in order, to the "Consumer".
    const result = await pipeline.relay.relayOnce();
    expect(result).toEqual({ processed: 4, published: 4, failed: 0, permanentlyFailed: 0 });
    expect(pipeline.publisher.published.map((e) => e.type)).toEqual([
      'ExecutionValidatedEvent',
      'ExecutionQueuedEvent',
      'ExecutionStartedEvent',
      'ExecutionCompletedEvent',
    ]);
    expect(await pipeline.outbox.loadPending()).toHaveLength(0);

    // In-process half: the same events reached the InMemoryEventBus subscriber.
    expect(pipeline.busReceived).toEqual([
      'ExecutionValidatedEvent',
      'ExecutionQueuedEvent',
      'ExecutionStartedEvent',
      'ExecutionCompletedEvent',
    ]);

    // Observability: real signals recorded across the whole run.
    expect(pipeline.meter.counterTotal('execution_transitions_total')).toBe(4);
    expect(pipeline.meter.counterTotal('execution_events_published_total')).toBe(4);
    expect(pipeline.tracer.getSpans().filter((s) => s.name === 'execution.transition')).toHaveLength(4);
    const transitionLogs = pipeline.logger.getEntriesAtLevel('info').filter((e) => e.message === 'Execution transitioned');
    expect(transitionLogs).toHaveLength(4);
    // Correlation IDs propagate end-to-end: aggregate -> telemetry log fields.
    for (const log of transitionLogs) {
      expect(log.fields.executionId).toBe(execution.id.toString());
      expect(log.fields.correlationId).toBe('corr-1');
    }
  });
});

describe('9g-6 — Complete lifecycle coverage', () => {
  it('happy path: reaches COMPLETED via the full pipeline', async () => {
    const provider = makeFakeProvider({ outcome: 'completed', result: 42 });
    const pipeline = buildPipeline(provider);
    const execution = await pipeline.orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Completed);
    expect(execution.version).toBe(5); // create() starts at 1, then Validating, Queued, Running, Completed
  });

  it('validation failure: the aggregate itself supports VALIDATING -> FAILED as a legal, exercised path', () => {
    // ExecutionOrchestrator's own driveNewExecution() always proceeds
    // VALIDATING -> QUEUED unconditionally (it has no real validation logic
    // of its own to fail) — so a "validation failed" outcome is exercised
    // here directly against the aggregate's transition graph, the same
    // mechanism a future real validation step would use. This is an honest,
    // explicit substitute for an orchestrator-level trigger that does not
    // exist yet, not a claim that the orchestrator itself validates anything.
    const execution = Execution.create(baseInput);
    execution.transitionTo(ExecutionStatus.Validating);
    const event = execution.transitionTo(ExecutionStatus.Failed, { reason: 'schema validation failed: missing field X' });

    expect(execution.status).toBe(ExecutionStatus.Failed);
    expect(event.constructor.name).toBe('ExecutionFailedEvent');
    expect(execution.transitionHistory.at(-1)?.reason).toContain('schema validation failed');
  });

  it('provider failure: reaches FAILED, recorded as a failure through the full pipeline', async () => {
    const provider = makeFakeProvider({ outcome: 'failed', reason: 'permanent: bad input' });
    const pipeline = buildPipeline(provider);
    const execution = await pipeline.orchestrator.run(baseInput);

    expect(execution.status).toBe(ExecutionStatus.Failed);
    expect(pipeline.meter.counterTotal('execution_failures_total')).toBe(1);
    const pending = await pipeline.outbox.loadPending();
    expect(pending.at(-1)?.event.type).toBe('ExecutionFailedEvent');
  });

  it('retry success: a transient failure is retried and the retry child completes', async () => {
    const provider = makeFakeProvider({ outcome: 'failed', reason: 'connection timeout, please retry' });
    const pipeline = buildPipeline(provider, { retryPolicy: new MaxAttemptsRetryPolicy(3) });

    const original = await pipeline.orchestrator.run(baseInput);
    expect(original.status).toBe(ExecutionStatus.Failed);

    // Swap the provider's behavior for the retry attempt to succeed.
    const succeedingOrchestrator = new ExecutionOrchestrator(
      pipeline.repo,
      makeFakeProvider({ outcome: 'completed', result: 'ok on retry' }),
      undefined,
      { retryPolicy: new MaxAttemptsRetryPolicy(3) }
    );
    const retried = await succeedingOrchestrator.retryIfEligible(original, { attempt: 1 });

    expect(retried).toBeDefined();
    expect(retried!.status).toBe(ExecutionStatus.Completed);
    expect(original.childExecutionIds.map((id) => id.toString())).toContain(retried!.id.toString());
  });

  it('retry exhaustion: retryIfEligible declines once attempt reaches maxAttempts', async () => {
    const provider = makeFakeProvider({ outcome: 'failed', reason: 'connection timeout, please retry' });
    const pipeline = buildPipeline(provider, { retryPolicy: new MaxAttemptsRetryPolicy(3) });
    const original = await pipeline.orchestrator.run(baseInput);

    const declined = await pipeline.orchestrator.retryIfEligible(original, { attempt: 3 });
    expect(declined).toBeUndefined();
    expect(pipeline.meter.counterTotal('execution_retries_total', { attempt: 3, retried: false })).toBe(1);
  });

  it('cancellation before execution: an Execution cancelled while pre-RUNNING never invokes the provider', async () => {
    const repo = new InMemoryExecutionRepository();
    let providerInvoked = false;
    const provider: ExecutionProviderPort = {
      execute: async () => {
        providerInvoked = true;
        return { outcome: 'completed', result: 'should never run' };
      },
    };
    let orchestrator!: ExecutionOrchestrator;
    let alreadyRequested = false;

    const wrappedRepo = {
      ...repo,
      save: async (execution: Execution, expectedVersion: number, tx?: unknown) => {
        await repo.save(execution, expectedVersion, tx as never);
        if (execution.status === ExecutionStatus.Queued && !alreadyRequested) {
          alreadyRequested = true;
          await orchestrator.requestCancellation(execution, { reason: 'cancelled before it started' });
        }
      },
      load: repo.load.bind(repo),
      exists: repo.exists.bind(repo),
      loadTransitions: repo.loadTransitions.bind(repo),
      findChildren: repo.findChildren.bind(repo),
    };

    orchestrator = new ExecutionOrchestrator(wrappedRepo, provider);
    const execution = await orchestrator.run(baseInput);

    expect(execution.status).toBe(ExecutionStatus.Cancelled);
    expect(providerInvoked).toBe(false);
  });

  it('cancellation during execution: moves to CANCELLING, then finalizes via acknowledgeCancellation', async () => {
    let orchestrator!: ExecutionOrchestrator;
    const provider: ExecutionProviderPort = {
      execute: async (execution) => {
        await orchestrator.requestCancellation(execution, { reason: 'operator abort' });
        return { outcome: 'waiting', reason: 'cleaning up' };
      },
    };
    const pipeline = buildPipeline(provider);
    orchestrator = pipeline.orchestrator;

    const execution = await orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Cancelling);

    const finalized = await orchestrator.acknowledgeCancellation(execution, { reason: 'cleanup finished' });
    expect(finalized.status).toBe(ExecutionStatus.Cancelled);
    expect(pipeline.meter.counterTotal('execution_cancellations_total', { phase: 'requested' })).toBe(1);
    expect(pipeline.meter.counterTotal('execution_cancellations_total', { phase: 'acknowledged' })).toBe(1);
  });

  it('cancellation after completion: requestCancellation on a terminal Execution is a no-op', async () => {
    const provider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    const pipeline = buildPipeline(provider);
    const execution = await pipeline.orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Completed);

    const result = await pipeline.orchestrator.requestCancellation(execution, { reason: 'too late' });
    expect(result.status).toBe(ExecutionStatus.Completed);
  });

  it('timeout: a deadline that has already passed takes precedence over the provider result', async () => {
    const clock = new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
    const provider: ExecutionProviderPort = {
      execute: async () => {
        clock.advance(10_000);
        return { outcome: 'completed', result: 'too slow' };
      },
    };
    const pipeline = buildPipeline(provider, { clock });
    const execution = await pipeline.orchestrator.run({ ...baseInput, timeoutMs: 1_000 });

    expect(execution.status).toBe(ExecutionStatus.TimedOut);
    expect(pipeline.meter.counterTotal('execution_failures_total')).toBe(1);
  });

  it('duplicate delivery / idempotent replay: a repeated runIdempotent() call returns the same Execution, not a second one', async () => {
    const provider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    const idempotencyStore = new InMemoryExecutionIdempotencyStore();
    const pipeline = buildPipeline(provider, { idempotencyStore });

    const first = await pipeline.orchestrator.runIdempotent({ ...baseInput, idempotencyKey: 'cmd-123' });
    const second = await pipeline.orchestrator.runIdempotent({ ...baseInput, idempotencyKey: 'cmd-123' });

    expect(second.id.equals(first.id)).toBe(true);
    // Only one Execution's worth of transitions reached the outbox/consumer —
    // duplicate delivery of the same command did not double-publish events.
    expect(await pipeline.outbox.loadPending()).toHaveLength(4);
  });

  it('event ordering: events are relayed to the consumer in the exact order they were produced', async () => {
    let orchestrator!: ExecutionOrchestrator;
    const provider: ExecutionProviderPort = {
      execute: async (execution) => ({ outcome: 'waiting', reason: 'pause' }),
    };
    const pipeline = buildPipeline(provider);
    orchestrator = pipeline.orchestrator;

    const execution = await orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Waiting);

    const resumingProvider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    const resumeOrchestrator = new ExecutionOrchestrator(pipeline.repo, resumingProvider, undefined);
    await resumeOrchestrator.resume(execution);

    await pipeline.relay.relayOnce();
    expect(pipeline.publisher.published.map((e) => e.type)).toEqual([
      'ExecutionValidatedEvent',
      'ExecutionQueuedEvent',
      'ExecutionStartedEvent',
      'ExecutionWaitingEvent',
    ]);
  });
});

describe('9g-6 — State machine verification', () => {
  it('every legal transition in the graph is accepted and increments version by exactly one', () => {
    const execution = Execution.create(baseInput);
    expect(execution.version).toBe(1);
    execution.transitionTo(ExecutionStatus.Validating);
    expect(execution.version).toBe(2);
    execution.transitionTo(ExecutionStatus.Queued);
    expect(execution.version).toBe(3);
    execution.transitionTo(ExecutionStatus.Running);
    expect(execution.version).toBe(4);
    execution.transitionTo(ExecutionStatus.Completed, { result: 'ok' });
    expect(execution.version).toBe(5);
  });

  it('an illegal transition is rejected with InvariantViolationError and does not mutate state', () => {
    const execution = Execution.create(baseInput);
    execution.transitionTo(ExecutionStatus.Validating);
    expect(isLegalExecutionTransition(ExecutionStatus.Validating, ExecutionStatus.Completed)).toBe(false);

    expect(() => execution.transitionTo(ExecutionStatus.Completed)).toThrow(InvariantViolationError);
    expect(execution.status).toBe(ExecutionStatus.Validating); // unchanged
    expect(execution.version).toBe(2); // unchanged
  });

  it('a terminal Execution has no legal outgoing transitions', () => {
    const execution = Execution.create(baseInput);
    execution.transitionTo(ExecutionStatus.Validating);
    execution.transitionTo(ExecutionStatus.Queued);
    execution.transitionTo(ExecutionStatus.Running);
    execution.transitionTo(ExecutionStatus.Completed, { result: 'ok' });

    expect(() => execution.transitionTo(ExecutionStatus.Failed, { reason: 'too late' })).toThrow(
      InvariantViolationError
    );
  });

  it('optimistic concurrency: a stale expectedVersion is rejected with ConcurrencyError', async () => {
    const repo = new InMemoryExecutionRepository();
    const execution = Execution.create(baseInput);
    await repo.save(execution, 0);

    execution.transitionTo(ExecutionStatus.Validating);
    await repo.save(execution, 1); // correct: version was 1 before this transition; stored version is now 2

    // Simulates a second, stale in-memory holder of the SAME Execution that
    // never observed the transition above — its own copy still thinks the
    // persisted version is 1, but the store has already moved to 2.
    await expect(repo.save(execution, 1)).rejects.toThrow(ConcurrencyError);
  });
});

describe('9g-6 — Outbox verification', () => {
  it('persists, relays, marks delivered, and suppresses duplicate relay of an already-published entry', async () => {
    const provider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    const pipeline = buildPipeline(provider);
    await pipeline.orchestrator.run(baseInput);

    const first = await pipeline.relay.relayOnce();
    expect(first.published).toBe(4);
    expect(await pipeline.outbox.loadPending()).toHaveLength(0);

    // Duplicate suppression: relaying again finds nothing left pending —
    // an already-published entry is not re-delivered to the consumer.
    const second = await pipeline.relay.relayOnce();
    expect(second).toEqual({ processed: 0, published: 0, failed: 0, permanentlyFailed: 0 });
    expect(pipeline.publisher.published).toHaveLength(4); // not 8
  });

  it('a transient publish failure is retried on the next relayOnce() call without being dead-lettered', async () => {
    const provider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    const pipeline = buildPipeline(provider);
    await pipeline.orchestrator.run(baseInput);

    pipeline.publisher.failNextN = 1;
    const first = await pipeline.relay.relayOnce();
    expect(first.failed).toBe(1);
    expect(first.permanentlyFailed).toBe(0);

    const second = await pipeline.relay.relayOnce();
    expect(second.published).toBe(1); // just the one entry that was retried and left pending
    expect(await pipeline.outbox.loadPending()).toHaveLength(0);
    expect(pipeline.publisher.published).toHaveLength(4); // 3 from the first call, plus the retried one
  });

  it('crash recovery (simulated): a fresh relay instance over the same durable outbox resumes and delivers exactly once', async () => {
    const provider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    const pipeline = buildPipeline(provider);
    await pipeline.orchestrator.run(baseInput);

    // "Crash": the original relay/publisher/telemetry are discarded; only the
    // durable outbox store survives, exactly as a real Postgres-backed store
    // would across a process restart (this in-memory store is standing in
    // for that durability, per ADR-049's own disclosed scope).
    const survivedOutbox = pipeline.outbox;
    const freshPublisher = new RecordingOutboxEventPublisher();
    const freshRelay = new ExecutionEventRelay(survivedOutbox, freshPublisher);

    const result = await freshRelay.relayOnce();
    expect(result.published).toBe(4);
    expect(freshPublisher.published.map((e) => e.type)).toEqual([
      'ExecutionValidatedEvent',
      'ExecutionQueuedEvent',
      'ExecutionStartedEvent',
      'ExecutionCompletedEvent',
    ]);

    // Exactly-once from here on: a second relay resume finds nothing pending.
    const second = await freshRelay.relayOnce();
    expect(second).toEqual({ processed: 0, published: 0, failed: 0, permanentlyFailed: 0 });
  });
});

describe('9g-6 — Deterministic replay after simulated crash', () => {
  it('reconstructs an Execution from its persisted transitionHistory alone, matching the pre-crash state', async () => {
    const provider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    const pipeline = buildPipeline(provider);
    const original = await pipeline.orchestrator.run(baseInput);

    // "Crash": simulate losing the live in-memory Execution instance;
    // only the repository's persisted history survives.
    const persistedHistory = await pipeline.repo.loadTransitions(original.id);
    expect(persistedHistory.length).toBeGreaterThan(0);

    const replayed = replayExecution({
      id: original.id,
      kind: original.kind,
      tenantId: original.tenantId,
      workspaceId: original.workspaceId,
      userId: baseInput.userId,
      traceId: original.traceId,
      correlationId: original.correlationId,
      transitionHistory: persistedHistory.map((r) => ({ ...r, at: new Date(r.at) })),
    });

    expect(replayed.status).toBe(original.status);
    expect(replayed.transitionHistory).toHaveLength(original.transitionHistory.length);
    expect(replayed.transitionHistory.map((t) => t.to)).toEqual(original.transitionHistory.map((t) => t.to));
  });
});

describe('9g-6 — Observability verification across the full pipeline', () => {
  it('traces, metrics, and structured logs are all recorded, and correlation IDs propagate through every signal', async () => {
    const provider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    const pipeline = buildPipeline(provider);
    const execution = await pipeline.orchestrator.run(baseInput);
    await pipeline.relay.relayOnce();

    // Tracing.
    const spans = pipeline.tracer.getSpans();
    expect(spans.length).toBeGreaterThan(0);
    expect(spans.every((s) => s.endedAt !== undefined)).toBe(true);

    // Metrics.
    expect(pipeline.meter.counterTotal('execution_transitions_total')).toBe(4);
    expect(pipeline.meter.counterTotal('execution_provider_invocations_total', { outcome: 'completed' })).toBe(1);
    expect(pipeline.meter.gaugeValue('execution_outbox_batch_processed')).toBe(4);
    expect(pipeline.meter.counterTotal('execution_outbox_published_total')).toBe(4);

    // Structured logs, correlated back to this exact Execution.
    const logs = pipeline.logger.getEntries();
    expect(logs.length).toBeGreaterThan(0);
    const correlatedLogs = logs.filter((l) => l.fields.executionId === execution.id.toString());
    expect(correlatedLogs.length).toBeGreaterThan(0);
    expect(correlatedLogs.every((l) => l.fields.correlationId === 'corr-1' || l.fields.correlationId === undefined)).toBe(
      true
    );
  });
});
