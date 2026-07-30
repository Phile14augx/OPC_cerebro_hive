import { describe, it, expect } from 'vitest';
import {
  ExecutionCreatedEvent,
  ExecutionValidatedEvent,
  ExecutionQueuedEvent,
  ExecutionStartedEvent,
  ExecutionWaitingEvent,
  ExecutionResumedEvent,
  ExecutionCompletedEvent,
  ExecutionFailedEvent,
  ExecutionCancelledEvent,
  ExecutionTimedOutEvent,
} from '../ExecutionEvents';
import { ExecutionStatus } from '../ExecutionStatus';

const base = {
  executionId: 'exec-1',
  tenantId: 'tenant-1',
  workspaceId: 'workspace-1',
  userId: 'user-1',
  correlationId: 'corr-1',
};

describe('Execution event shapes', () => {
  it('ExecutionCreatedEvent carries kind and CREATED status', () => {
    const evt = new ExecutionCreatedEvent({ ...base, kind: 'Agent' });
    expect(evt.aggregateType).toBe('Execution');
    expect(evt.aggregateId).toBe('exec-1');
    expect(evt.tenantId).toBe('tenant-1');
    expect(evt.payload.status).toBe(ExecutionStatus.Created);
    expect(evt.payload.kind).toBe('Agent');
    expect(evt.eventId).toBeTruthy();
    expect(evt.timestamp).toBeInstanceOf(Date);
  });

  it('ExecutionValidatedEvent carries VALIDATING status', () => {
    expect(new ExecutionValidatedEvent(base).payload.status).toBe(ExecutionStatus.Validating);
  });

  it('ExecutionQueuedEvent carries QUEUED status', () => {
    expect(new ExecutionQueuedEvent(base).payload.status).toBe(ExecutionStatus.Queued);
  });

  it('ExecutionStartedEvent carries RUNNING status', () => {
    expect(new ExecutionStartedEvent(base).payload.status).toBe(ExecutionStatus.Running);
  });

  it('ExecutionResumedEvent carries RUNNING status', () => {
    expect(new ExecutionResumedEvent(base).payload.status).toBe(ExecutionStatus.Running);
  });

  it('ExecutionTimedOutEvent carries TIMED_OUT status', () => {
    expect(new ExecutionTimedOutEvent(base).payload.status).toBe(ExecutionStatus.TimedOut);
  });

  it('ExecutionWaitingEvent carries an optional reason', () => {
    const evt = new ExecutionWaitingEvent({ ...base, reason: 'awaiting human input' });
    expect(evt.payload.status).toBe(ExecutionStatus.Waiting);
    expect(evt.payload.reason).toBe('awaiting human input');
  });

  it('ExecutionCompletedEvent carries an optional result', () => {
    const evt = new ExecutionCompletedEvent({ ...base, result: { ok: true } });
    expect(evt.payload.status).toBe(ExecutionStatus.Completed);
    expect(evt.payload.result).toEqual({ ok: true });
  });

  it('ExecutionFailedEvent requires a reason', () => {
    const evt = new ExecutionFailedEvent({ ...base, reason: 'provider timeout' });
    expect(evt.payload.status).toBe(ExecutionStatus.Failed);
    expect(evt.payload.reason).toBe('provider timeout');
  });

  it('ExecutionCancelledEvent carries an optional reason', () => {
    const evt = new ExecutionCancelledEvent({ ...base, reason: 'user requested' });
    expect(evt.payload.status).toBe(ExecutionStatus.Cancelled);
    expect(evt.payload.reason).toBe('user requested');
  });

  it('each event has a unique eventId', () => {
    const a = new ExecutionQueuedEvent(base);
    const b = new ExecutionQueuedEvent(base);
    expect(a.eventId).not.toBe(b.eventId);
  });
});
