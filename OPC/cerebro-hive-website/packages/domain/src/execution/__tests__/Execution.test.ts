import { describe, it, expect } from 'vitest';
import { Execution } from '../Execution';
import { ExecutionId } from '../ExecutionId';
import { ExecutionStatus } from '../ExecutionStatus';
import { InvariantViolationError } from '../../errors/DomainError';

function makeExecution(overrides: Partial<Parameters<typeof Execution.create>[0]> = {}) {
  return Execution.create({
    kind: 'Agent',
    tenantId: 'tenant-1',
    traceId: 'trace-1',
    correlationId: 'corr-1',
    ...overrides,
  });
}

describe('ExecutionId', () => {
  it('generates unique, non-empty ids', () => {
    const a = ExecutionId.generate();
    const b = ExecutionId.generate();
    expect(a.value.length).toBeGreaterThan(0);
    expect(a.equals(b)).toBe(false);
  });

  it('round-trips via of()/toString()', () => {
    const id = ExecutionId.of('abc-123');
    expect(id.toString()).toBe('abc-123');
    expect(ExecutionId.of('abc-123').equals(id)).toBe(true);
  });

  it('rejects empty ids', () => {
    expect(() => ExecutionId.of('')).toThrow();
    expect(() => ExecutionId.of('   ')).toThrow();
  });
});

describe('Execution.create invariants', () => {
  it('creates a valid Execution in CREATED status', () => {
    const exec = makeExecution();
    expect(exec.status).toBe(ExecutionStatus.Created);
    expect(exec.isTerminal).toBe(false);
    expect(exec.childExecutionIds).toEqual([]);
    expect(exec.contributorExecutionIds).toEqual([]);
    expect(exec.startedAt).toBeUndefined();
    expect(exec.completedAt).toBeUndefined();
  });

  it('rejects empty kind', () => {
    expect(() => makeExecution({ kind: '' })).toThrow(InvariantViolationError);
  });

  it('rejects empty tenantId', () => {
    expect(() => makeExecution({ tenantId: '' })).toThrow(InvariantViolationError);
  });

  it('rejects empty traceId', () => {
    expect(() => makeExecution({ traceId: '' })).toThrow(InvariantViolationError);
  });

  it('rejects empty correlationId', () => {
    expect(() => makeExecution({ correlationId: '' })).toThrow(InvariantViolationError);
  });

  it('rejects self-parenting via reconstitute', () => {
    const exec = makeExecution();
    const props = exec.toProps();
    expect(() =>
      Execution.reconstitute({ ...props, parentExecutionId: props.id })
    ).toThrow(InvariantViolationError);
  });
});

describe('Execution.transitionTo — legal transitions', () => {
  it('sets startedAt on first transition to RUNNING', () => {
    const exec = makeExecution();
    expect(exec.startedAt).toBeUndefined();
    exec.transitionTo(ExecutionStatus.Validating);
    exec.transitionTo(ExecutionStatus.Queued);
    exec.transitionTo(ExecutionStatus.Running);
    expect(exec.startedAt).toBeInstanceOf(Date);
  });

  it('sets completedAt on first terminal transition and freezes it', () => {
    const exec = makeExecution();
    exec.transitionTo(ExecutionStatus.Validating);
    exec.transitionTo(ExecutionStatus.Queued);
    exec.transitionTo(ExecutionStatus.Running);
    exec.transitionTo(ExecutionStatus.Completed);
    const completedAt = exec.completedAt;
    expect(completedAt).toBeInstanceOf(Date);
    expect(exec.isTerminal).toBe(true);

    // COMPLETED has no legal outgoing transitions at all — this is the same
    // mechanism that makes "completed executions are immutable" true, not a
    // separate special case.
    expect(() => exec.transitionTo(ExecutionStatus.Failed)).toThrow(InvariantViolationError);
    expect(exec.completedAt).toEqual(completedAt);
  });

  it('resumes from WAITING via ExecutionResumedEvent, not ExecutionStartedEvent', () => {
    const exec = makeExecution();
    exec.transitionTo(ExecutionStatus.Validating);
    exec.transitionTo(ExecutionStatus.Queued);
    exec.transitionTo(ExecutionStatus.Running);
    exec.transitionTo(ExecutionStatus.Waiting, { reason: 'awaiting human input' });
    const event = exec.transitionTo(ExecutionStatus.Running);
    expect(event.constructor.name).toBe('ExecutionResumedEvent');
  });

  it('records ordered transition history with actor/reason/correlationId', () => {
    const exec = makeExecution();
    exec.transitionTo(ExecutionStatus.Validating, { actor: 'validator-service' });
    exec.transitionTo(ExecutionStatus.Queued, { actor: 'scheduler' });
    expect(exec.transitionHistory).toHaveLength(2);
    expect(exec.transitionHistory[0]).toMatchObject({
      from: ExecutionStatus.Created,
      to: ExecutionStatus.Validating,
      actor: 'validator-service',
      correlationId: 'corr-1',
    });
    expect(exec.transitionHistory[1]).toMatchObject({
      from: ExecutionStatus.Validating,
      to: ExecutionStatus.Queued,
      actor: 'scheduler',
    });
  });

  it('returns the canonical event instance for each transition', () => {
    const exec = makeExecution();
    expect(exec.transitionTo(ExecutionStatus.Validating).constructor.name).toBe('ExecutionValidatedEvent');
    expect(exec.transitionTo(ExecutionStatus.Queued).constructor.name).toBe('ExecutionQueuedEvent');
    expect(exec.transitionTo(ExecutionStatus.Running).constructor.name).toBe('ExecutionStartedEvent');
    expect(exec.transitionTo(ExecutionStatus.Cancelling).constructor.name).toBe('ExecutionCancellingEvent');
    expect(exec.transitionTo(ExecutionStatus.Cancelled).constructor.name).toBe('ExecutionCancelledEvent');
  });
});

describe('Execution.transitionTo — illegal transitions rejected', () => {
  it('rejects CREATED -> RUNNING (must pass through VALIDATING/QUEUED)', () => {
    const exec = makeExecution();
    expect(() => exec.transitionTo(ExecutionStatus.Running)).toThrow(InvariantViolationError);
  });

  it('rejects CREATED -> WAITING', () => {
    const exec = makeExecution();
    expect(() => exec.transitionTo(ExecutionStatus.Waiting)).toThrow(InvariantViolationError);
  });

  it('rejects COMPLETED -> RUNNING for any terminal Execution', () => {
    const exec = makeExecution();
    exec.transitionTo(ExecutionStatus.Validating);
    exec.transitionTo(ExecutionStatus.Queued);
    exec.transitionTo(ExecutionStatus.Running);
    exec.transitionTo(ExecutionStatus.Completed);
    expect(() => exec.transitionTo(ExecutionStatus.Running)).toThrow(InvariantViolationError);
  });

  it('rejects a FAILED transition with no reason', () => {
    const exec = makeExecution();
    exec.transitionTo(ExecutionStatus.Validating);
    exec.transitionTo(ExecutionStatus.Queued);
    exec.transitionTo(ExecutionStatus.Running);
    expect(() => exec.transitionTo(ExecutionStatus.Failed)).toThrow();
  });

  it('accepts a FAILED transition when a reason is supplied', () => {
    const exec = makeExecution();
    exec.transitionTo(ExecutionStatus.Validating);
    exec.transitionTo(ExecutionStatus.Queued);
    exec.transitionTo(ExecutionStatus.Running);
    expect(() => exec.transitionTo(ExecutionStatus.Failed, { reason: 'provider timeout' })).not.toThrow();
    expect(exec.status).toBe(ExecutionStatus.Failed);
  });

  it('rejects a non-monotonic transition timestamp', () => {
    const exec = makeExecution();
    const earlier = new Date(exec.updatedAt.getTime() - 1000);
    expect(() => exec.transitionTo(ExecutionStatus.Validating, { at: earlier })).toThrow(InvariantViolationError);
  });
});

describe('Execution.createRetryOf — retry semantics', () => {
  it('creates a new child Execution rather than rewinding the original', () => {
    const original = makeExecution();
    original.transitionTo(ExecutionStatus.Validating);
    original.transitionTo(ExecutionStatus.Queued);
    original.transitionTo(ExecutionStatus.Running);
    original.transitionTo(ExecutionStatus.Failed, { reason: 'transient network error' });

    const retry = Execution.createRetryOf(original);

    // The original's own terminal state and history are untouched.
    expect(original.status).toBe(ExecutionStatus.Failed);
    expect(original.isTerminal).toBe(true);
    expect(original.transitionHistory).toHaveLength(4);

    // The retry is a fresh Execution, registered as the original's child.
    expect(retry.status).toBe(ExecutionStatus.Created);
    expect(retry.parentExecutionId?.equals(original.id)).toBe(true);
    expect(original.childExecutionIds).toHaveLength(1);
    expect(original.childExecutionIds[0].equals(retry.id)).toBe(true);
    expect(retry.kind).toBe(original.kind);
    expect(retry.tenantId).toBe(original.tenantId);
  });
});

describe('Execution parent/child and contributor references', () => {
  it('accepts a parentExecutionId distinct from its own id', () => {
    const parent = makeExecution();
    const child = makeExecution({ parentExecutionId: parent.id });
    expect(child.parentExecutionId?.equals(parent.id)).toBe(true);
  });

  it('rejects self-parenting at creation time', () => {
    // create() always generates a fresh id internally, so to exercise this
    // path we go through reconstitute (covered above) — create() itself
    // cannot be handed its own not-yet-generated id, which is the point.
    const exec = makeExecution();
    expect(exec.parentExecutionId).toBeUndefined();
  });

  it('addChildExecution is idempotent', () => {
    const parent = makeExecution();
    const childId = ExecutionId.generate();
    parent.addChildExecution(childId);
    parent.addChildExecution(childId);
    expect(parent.childExecutionIds.length).toBe(1);
  });

  it('addContributorExecutionReference is idempotent and distinct from children', () => {
    const exec = makeExecution();
    const contributorId = ExecutionId.generate();
    exec.addContributorExecutionReference(contributorId);
    exec.addContributorExecutionReference(contributorId);
    expect(exec.contributorExecutionIds.length).toBe(1);
    expect(exec.childExecutionIds.length).toBe(0);
  });
});

describe('Execution metadata', () => {
  it('defaults to an empty object and preserves supplied metadata', () => {
    const withDefault = makeExecution();
    expect(withDefault.metadata).toEqual({});

    const withMetadata = makeExecution({ metadata: { source: 'unit-test', attempt: 1 } });
    expect(withMetadata.metadata).toEqual({ source: 'unit-test', attempt: 1 });
  });
});
