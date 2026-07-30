import { describe, it, expect } from 'vitest';
import { Execution } from '../Execution';
import { ExecutionStatus } from '../ExecutionStatus';
import { ExecutionCreatedEvent } from '../ExecutionEvents';

/**
 * Event contract tests (recommended between Phase 9b and Phase 9c) — an
 * executable specification for `Execution`'s public event surface, so a
 * future Phase 9c consumer (an application service, an orchestrator) can
 * rely on this shape without re-deriving it from `Execution.ts`'s source.
 * Covers exactly the six areas named for this suite:
 * 1. Event type emitted per transition.
 * 2. Required payload fields.
 * 3. Aggregate identity and correlation metadata.
 * 4. Ordering guarantees.
 * 5. Retry-child execution semantics.
 * 6. Terminal-state event behavior.
 *
 * This suite does not test anything ExecutionTransitions.test.ts or
 * Execution.test.ts already cover in isolation (transition legality itself,
 * aggregate structural invariants) — it tests the EVENT surface those
 * transitions produce, as its own contract.
 *
 * A second file (`ExecutionEventContracts.test.ts`, plural) covering
 * overlapping ground was found already present when this suite was
 * finished — written by a different process moments earlier, not by this
 * one. Its narrower payload-shape assertions (`toStrictEqual` against the
 * exact expected object, catching stray/undefined keys that a
 * property-by-property check would miss) were real, non-duplicate coverage
 * and have been migrated into the "exact payload shape" section below before
 * that file was removed, per instruction, rather than deleting it outright.
 */

function makeExecution(overrides: Partial<Parameters<typeof Execution.create>[0]> = {}) {
  return Execution.create({
    kind: 'Agent',
    tenantId: 'tenant-1',
    workspaceId: 'workspace-1',
    userId: 'user-1',
    traceId: 'trace-1',
    correlationId: 'corr-1',
    ...overrides,
  });
}

describe('Event contract — 1. event type emitted per transition', () => {
  it('maps every legal transition to its documented event class', () => {
    const exec = makeExecution();
    expect(exec.transitionTo(ExecutionStatus.Validating).constructor.name).toBe('ExecutionValidatedEvent');
    expect(exec.transitionTo(ExecutionStatus.Queued).constructor.name).toBe('ExecutionQueuedEvent');
    expect(exec.transitionTo(ExecutionStatus.Running).constructor.name).toBe('ExecutionStartedEvent');
    expect(exec.transitionTo(ExecutionStatus.Waiting, { reason: 'human input needed' }).constructor.name).toBe(
      'ExecutionWaitingEvent'
    );
    expect(exec.transitionTo(ExecutionStatus.Running).constructor.name).toBe('ExecutionResumedEvent');
    expect(exec.transitionTo(ExecutionStatus.Cancelling, { reason: 'user requested' }).constructor.name).toBe(
      'ExecutionCancellingEvent'
    );
    expect(exec.transitionTo(ExecutionStatus.Cancelled, { reason: 'user requested' }).constructor.name).toBe(
      'ExecutionCancelledEvent'
    );
  });

  it('RUNNING maps to ExecutionStartedEvent from QUEUED, ExecutionResumedEvent from WAITING', () => {
    const fromQueued = makeExecution();
    fromQueued.transitionTo(ExecutionStatus.Validating);
    fromQueued.transitionTo(ExecutionStatus.Queued);
    expect(fromQueued.transitionTo(ExecutionStatus.Running).constructor.name).toBe('ExecutionStartedEvent');

    const fromWaiting = makeExecution();
    fromWaiting.transitionTo(ExecutionStatus.Validating);
    fromWaiting.transitionTo(ExecutionStatus.Queued);
    fromWaiting.transitionTo(ExecutionStatus.Running);
    fromWaiting.transitionTo(ExecutionStatus.Waiting);
    expect(fromWaiting.transitionTo(ExecutionStatus.Running).constructor.name).toBe('ExecutionResumedEvent');
  });

  it('TIMED_OUT maps to ExecutionTimedOutEvent from both RUNNING and WAITING', () => {
    const fromRunning = makeExecution();
    fromRunning.transitionTo(ExecutionStatus.Validating);
    fromRunning.transitionTo(ExecutionStatus.Queued);
    fromRunning.transitionTo(ExecutionStatus.Running);
    expect(fromRunning.transitionTo(ExecutionStatus.TimedOut).constructor.name).toBe('ExecutionTimedOutEvent');

    const fromWaiting = makeExecution();
    fromWaiting.transitionTo(ExecutionStatus.Validating);
    fromWaiting.transitionTo(ExecutionStatus.Queued);
    fromWaiting.transitionTo(ExecutionStatus.Running);
    fromWaiting.transitionTo(ExecutionStatus.Waiting);
    expect(fromWaiting.transitionTo(ExecutionStatus.TimedOut).constructor.name).toBe('ExecutionTimedOutEvent');
  });
});

describe('Event contract — 2. required payload fields', () => {
  it('ExecutionFailedEvent always carries a non-empty reason (transitionTo enforces this)', () => {
    const exec = makeExecution();
    exec.transitionTo(ExecutionStatus.Validating);
    exec.transitionTo(ExecutionStatus.Queued);
    exec.transitionTo(ExecutionStatus.Running);
    const event = exec.transitionTo(ExecutionStatus.Failed, { reason: 'provider timeout' });
    expect((event.payload as { reason: string }).reason).toBe('provider timeout');
  });

  it('ExecutionCompletedEvent carries an optional result', () => {
    const exec = makeExecution();
    exec.transitionTo(ExecutionStatus.Validating);
    exec.transitionTo(ExecutionStatus.Queued);
    exec.transitionTo(ExecutionStatus.Running);
    const event = exec.transitionTo(ExecutionStatus.Completed, { result: { output: 42 } });
    expect((event.payload as { result: unknown }).result).toEqual({ output: 42 });
  });

  it('ExecutionWaitingEvent and ExecutionCancellingEvent carry an optional reason', () => {
    const exec = makeExecution();
    exec.transitionTo(ExecutionStatus.Validating);
    exec.transitionTo(ExecutionStatus.Queued);
    exec.transitionTo(ExecutionStatus.Running);
    const waiting = exec.transitionTo(ExecutionStatus.Waiting, { reason: 'awaiting approval' });
    expect((waiting.payload as { reason?: string }).reason).toBe('awaiting approval');
    const cancelling = exec.transitionTo(ExecutionStatus.Cancelling);
    expect((cancelling.payload as { reason?: string }).reason).toBeUndefined();
  });

  it('every event payload carries the target status', () => {
    const exec = makeExecution();
    const event = exec.transitionTo(ExecutionStatus.Validating);
    expect((event.payload as { status: string }).status).toBe(ExecutionStatus.Validating);
  });
});

describe('Event contract — 3. aggregate identity and correlation metadata', () => {
  it('every transition event carries the aggregate\'s own identity and correlation fields', () => {
    const exec = makeExecution();
    const event = exec.transitionTo(ExecutionStatus.Validating);
    expect(event.aggregateType).toBe('Execution');
    expect(event.aggregateId).toBe(exec.id.toString());
    expect(event.tenantId).toBe('tenant-1');
    expect(event.workspaceId).toBe('workspace-1');
    expect(event.userId).toBe('user-1');
    expect(event.correlationId).toBe('corr-1');
  });

  it('every event has a unique eventId and a real timestamp', () => {
    const exec = makeExecution();
    const e1 = exec.transitionTo(ExecutionStatus.Validating);
    const e2 = exec.transitionTo(ExecutionStatus.Queued);
    expect(e1.eventId).not.toBe(e2.eventId);
    expect(e1.timestamp).toBeInstanceOf(Date);
    expect(e2.timestamp).toBeInstanceOf(Date);
  });

  it('correlationId is stable across every event in a single Execution\'s lifecycle', () => {
    const exec = makeExecution();
    const events = [
      exec.transitionTo(ExecutionStatus.Validating),
      exec.transitionTo(ExecutionStatus.Queued),
      exec.transitionTo(ExecutionStatus.Running),
      exec.transitionTo(ExecutionStatus.Completed),
    ];
    expect(events.every((e) => e.correlationId === 'corr-1')).toBe(true);
  });
});

describe('Event contract — 4. ordering guarantees', () => {
  it('the sequence of returned events matches the sequence of transitionHistory entries 1:1', () => {
    const exec = makeExecution();
    const events = [
      exec.transitionTo(ExecutionStatus.Validating),
      exec.transitionTo(ExecutionStatus.Queued),
      exec.transitionTo(ExecutionStatus.Running),
      exec.transitionTo(ExecutionStatus.Waiting, { reason: 'paused' }),
      exec.transitionTo(ExecutionStatus.Running),
      exec.transitionTo(ExecutionStatus.Completed, { result: 'ok' }),
    ];

    expect(exec.transitionHistory).toHaveLength(events.length);
    exec.transitionHistory.forEach((record, i) => {
      expect((events[i].payload as { status: string }).status).toBe(record.to);
    });

    // Event classes appear in the same order the transitions actually
    // happened in — this is what makes the event stream a faithful replay
    // source, not just a bag of unordered facts.
    const eventClassNames = events.map((e) => e.constructor.name);
    expect(eventClassNames).toEqual([
      'ExecutionValidatedEvent',
      'ExecutionQueuedEvent',
      'ExecutionStartedEvent',
      'ExecutionWaitingEvent',
      'ExecutionResumedEvent',
      'ExecutionCompletedEvent',
    ]);
  });

  it('timestamps across a sequence of events are monotonically non-decreasing', () => {
    const exec = makeExecution();
    const events = [
      exec.transitionTo(ExecutionStatus.Validating),
      exec.transitionTo(ExecutionStatus.Queued),
      exec.transitionTo(ExecutionStatus.Running),
    ];
    for (let i = 1; i < events.length; i++) {
      expect(events[i].timestamp.getTime()).toBeGreaterThanOrEqual(events[i - 1].timestamp.getTime());
    }
  });
});

describe('Event contract — 5. retry-child execution semantics', () => {
  it('a retry\'s ExecutionCreatedEvent carries parentExecutionId; an original\'s does not', () => {
    const original = makeExecution();
    original.transitionTo(ExecutionStatus.Validating);
    original.transitionTo(ExecutionStatus.Queued);
    original.transitionTo(ExecutionStatus.Running);
    original.transitionTo(ExecutionStatus.Failed, { reason: 'transient error' });

    const retry = Execution.createRetryOf(original);

    // Execution.create()/createRetryOf() do not themselves emit events —
    // consistent with this package's established convention (see
    // WorkflowApplicationService's WorkflowPublishedEvent) that an
    // application service constructs creation events from the aggregate's
    // own props, not the aggregate factory itself. This test asserts that
    // such a caller CAN construct a correctly-shaped, lineage-carrying event
    // from the retry's own props.
    const retryCreatedEvent = new ExecutionCreatedEvent({
      executionId: retry.id.toString(),
      tenantId: retry.tenantId,
      workspaceId: retry.workspaceId,
      userId: retry.userId,
      correlationId: retry.correlationId,
      kind: retry.kind,
      parentExecutionId: retry.parentExecutionId?.toString(),
    });
    expect((retryCreatedEvent.payload as { parentExecutionId?: string }).parentExecutionId).toBe(
      original.id.toString()
    );

    const originalCreatedEvent = new ExecutionCreatedEvent({
      executionId: original.id.toString(),
      tenantId: original.tenantId,
      workspaceId: original.workspaceId,
      userId: original.userId,
      correlationId: original.correlationId,
      kind: original.kind,
      parentExecutionId: original.parentExecutionId?.toString(),
    });
    expect((originalCreatedEvent.payload as { parentExecutionId?: string }).parentExecutionId).toBeUndefined();
  });

  it('retry and original have independent transition histories and event sequences', () => {
    const original = makeExecution();
    original.transitionTo(ExecutionStatus.Validating);
    original.transitionTo(ExecutionStatus.Queued);
    original.transitionTo(ExecutionStatus.Running);
    original.transitionTo(ExecutionStatus.Failed, { reason: 'transient error' });

    const retry = Execution.createRetryOf(original);
    const retryEvent = retry.transitionTo(ExecutionStatus.Validating);

    expect(original.transitionHistory).toHaveLength(4);
    expect(retry.transitionHistory).toHaveLength(1);
    expect(retryEvent.aggregateId).toBe(retry.id.toString());
    expect(retryEvent.aggregateId).not.toBe(original.id.toString());
  });
});

describe('Event contract — 6. terminal-state event behavior', () => {
  it('the terminal event is always the last event in a lifecycle sequence', () => {
    const exec = makeExecution();
    exec.transitionTo(ExecutionStatus.Validating);
    exec.transitionTo(ExecutionStatus.Queued);
    exec.transitionTo(ExecutionStatus.Running);
    const terminalEvent = exec.transitionTo(ExecutionStatus.Completed, { result: 'done' });

    expect((terminalEvent.payload as { status: string }).status).toBe(ExecutionStatus.Completed);
    // No further event can be produced — transitionTo itself throws, so
    // there is no possibility of a "phantom" event after a terminal one.
    expect(() => exec.transitionTo(ExecutionStatus.Running)).toThrow();
  });

  it('reaching COMPLETED produces exactly one ExecutionCompletedEvent carrying the terminal status', () => {
    const exec = makeExecution();
    exec.transitionTo(ExecutionStatus.Validating);
    exec.transitionTo(ExecutionStatus.Queued);
    exec.transitionTo(ExecutionStatus.Running);
    const event = exec.transitionTo(ExecutionStatus.Completed, { result: 'ok' });
    expect(event.constructor.name).toBe('ExecutionCompletedEvent');
    expect((event.payload as { status: string }).status).toBe(ExecutionStatus.Completed);
    expect(exec.isTerminal).toBe(true);
  });

  it('reaching FAILED produces exactly one ExecutionFailedEvent carrying the terminal status', () => {
    const exec = makeExecution();
    exec.transitionTo(ExecutionStatus.Validating);
    exec.transitionTo(ExecutionStatus.Queued);
    exec.transitionTo(ExecutionStatus.Running);
    const event = exec.transitionTo(ExecutionStatus.Failed, { reason: 'boom' });
    expect(event.constructor.name).toBe('ExecutionFailedEvent');
    expect((event.payload as { status: string }).status).toBe(ExecutionStatus.Failed);
    expect(exec.isTerminal).toBe(true);
  });

  it('reaching TIMED_OUT produces exactly one ExecutionTimedOutEvent carrying the terminal status', () => {
    const exec = makeExecution();
    exec.transitionTo(ExecutionStatus.Validating);
    exec.transitionTo(ExecutionStatus.Queued);
    exec.transitionTo(ExecutionStatus.Running);
    const event = exec.transitionTo(ExecutionStatus.TimedOut);
    expect(event.constructor.name).toBe('ExecutionTimedOutEvent');
    expect((event.payload as { status: string }).status).toBe(ExecutionStatus.TimedOut);
    expect(exec.isTerminal).toBe(true);
  });

  it('CANCELLED reached via CANCELLING produces ExecutionCancellingEvent then ExecutionCancelledEvent', () => {
    const exec = makeExecution();
    exec.transitionTo(ExecutionStatus.Validating);
    exec.transitionTo(ExecutionStatus.Queued);
    exec.transitionTo(ExecutionStatus.Running);
    const cancelling = exec.transitionTo(ExecutionStatus.Cancelling, { reason: 'user requested' });
    const cancelled = exec.transitionTo(ExecutionStatus.Cancelled, { reason: 'user requested' });
    expect(cancelling.constructor.name).toBe('ExecutionCancellingEvent');
    expect(cancelled.constructor.name).toBe('ExecutionCancelledEvent');
    expect(exec.isTerminal).toBe(true);
  });
});

describe('Event contract — 7. exact payload shape (migrated from the redundant ExecutionEventContracts.test.ts)', () => {
  // toStrictEqual is a deliberately stronger check than the property-by-
  // property assertions above: it fails if the payload carries a stray key
  // (including a key present with value `undefined`) that isn't part of the
  // documented shape. This is the one piece of real, non-duplicate coverage
  // the redundant file had — migrated here rather than lost when it was
  // removed.
  it('ExecutionValidatedEvent payload is exactly { status }', () => {
    const exec = makeExecution();
    const event = exec.transitionTo(ExecutionStatus.Validating);
    expect(event.payload).toStrictEqual({ status: 'VALIDATING' });
  });

  it('ExecutionQueuedEvent payload is exactly { status }', () => {
    const exec = makeExecution();
    exec.transitionTo(ExecutionStatus.Validating);
    const event = exec.transitionTo(ExecutionStatus.Queued);
    expect(event.payload).toStrictEqual({ status: 'QUEUED' });
  });

  it('ExecutionStartedEvent payload is exactly { status }', () => {
    const exec = makeExecution();
    exec.transitionTo(ExecutionStatus.Validating);
    exec.transitionTo(ExecutionStatus.Queued);
    const event = exec.transitionTo(ExecutionStatus.Running);
    expect(event.payload).toStrictEqual({ status: 'RUNNING' });
  });

  it('ExecutionWaitingEvent payload is exactly { status, reason } when a reason is given', () => {
    const exec = makeExecution();
    exec.transitionTo(ExecutionStatus.Validating);
    exec.transitionTo(ExecutionStatus.Queued);
    exec.transitionTo(ExecutionStatus.Running);
    const event = exec.transitionTo(ExecutionStatus.Waiting, { reason: 'Pending user input' });
    expect(event.payload).toStrictEqual({ status: 'WAITING', reason: 'Pending user input' });
  });

  it('ExecutionResumedEvent payload is exactly { status } (RUNNING) despite the distinct event class', () => {
    const exec = makeExecution();
    exec.transitionTo(ExecutionStatus.Validating);
    exec.transitionTo(ExecutionStatus.Queued);
    exec.transitionTo(ExecutionStatus.Running);
    exec.transitionTo(ExecutionStatus.Waiting);
    const event = exec.transitionTo(ExecutionStatus.Running);
    expect(event.constructor.name).toBe('ExecutionResumedEvent');
    expect(event.payload).toStrictEqual({ status: 'RUNNING' });
  });

  it('ExecutionCancellingEvent payload is exactly { status, reason }', () => {
    const exec = makeExecution();
    exec.transitionTo(ExecutionStatus.Validating);
    exec.transitionTo(ExecutionStatus.Queued);
    exec.transitionTo(ExecutionStatus.Running);
    const event = exec.transitionTo(ExecutionStatus.Cancelling, { reason: 'User hit abort' });
    expect(event.payload).toStrictEqual({ status: 'CANCELLING', reason: 'User hit abort' });
  });

  it('ExecutionCancelledEvent payload is exactly { status, reason }', () => {
    const exec = makeExecution();
    exec.transitionTo(ExecutionStatus.Validating);
    exec.transitionTo(ExecutionStatus.Queued);
    exec.transitionTo(ExecutionStatus.Running);
    exec.transitionTo(ExecutionStatus.Cancelling);
    const event = exec.transitionTo(ExecutionStatus.Cancelled, { reason: 'Abort completed' });
    expect(event.payload).toStrictEqual({ status: 'CANCELLED', reason: 'Abort completed' });
  });

  it('ExecutionCompletedEvent payload is exactly { status, result }', () => {
    const exec = makeExecution();
    exec.transitionTo(ExecutionStatus.Validating);
    exec.transitionTo(ExecutionStatus.Queued);
    exec.transitionTo(ExecutionStatus.Running);
    const result = { answer: 42, tokens: 100 };
    const event = exec.transitionTo(ExecutionStatus.Completed, { result });
    expect(event.payload).toStrictEqual({ status: 'COMPLETED', result });
  });

  it('ExecutionFailedEvent payload is exactly { status, reason }', () => {
    const exec = makeExecution();
    exec.transitionTo(ExecutionStatus.Validating);
    exec.transitionTo(ExecutionStatus.Queued);
    exec.transitionTo(ExecutionStatus.Running);
    const event = exec.transitionTo(ExecutionStatus.Failed, { reason: 'LLM Timeout' });
    expect(event.payload).toStrictEqual({ status: 'FAILED', reason: 'LLM Timeout' });
  });

  it('ExecutionTimedOutEvent payload is exactly { status }', () => {
    const exec = makeExecution();
    exec.transitionTo(ExecutionStatus.Validating);
    exec.transitionTo(ExecutionStatus.Queued);
    exec.transitionTo(ExecutionStatus.Running);
    const event = exec.transitionTo(ExecutionStatus.TimedOut);
    expect(event.payload).toStrictEqual({ status: 'TIMED_OUT' });
  });

  it('verifies immutable payloads across subsequent transitions', () => {
    const exec = makeExecution();
    const validatedEvent = exec.transitionTo(ExecutionStatus.Validating);
    
    // Capture snapshot of the payload
    const originalPayloadString = JSON.stringify(validatedEvent.payload);
    
    // Perform subsequent transitions
    exec.transitionTo(ExecutionStatus.Queued);
    exec.transitionTo(ExecutionStatus.Running);
    exec.transitionTo(ExecutionStatus.Completed, { result: 'done' });
    
    // The previous event's payload must remain unaltered by reference mutation
    expect(JSON.stringify(validatedEvent.payload)).toBe(originalPayloadString);
  });
});
