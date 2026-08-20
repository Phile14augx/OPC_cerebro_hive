import { describe, it, expect } from 'vitest';
import { Execution } from '../Execution';
import { ExecutionStatus } from '../ExecutionStatus';
import { ExecutionId } from '../ExecutionId';
import { InMemoryExecutionRepository } from '../InMemoryExecutionRepository';
import { ExecutionOrchestrator, ExecutionProviderPort, ExecutionProviderResult } from '../ExecutionOrchestrator';
import { InMemoryExecutionIdempotencyStore } from '../ExecutionIdempotency';
import { InMemoryExecutionLeaseStore } from '../ExecutionLease';
import { Clock } from '../Clock';
import { DefaultExecutionFailureClassifier } from '../ExecutionFailureClassification';
import { MaxAttemptsRetryPolicy } from '../ExecutionRetryPolicy';
import { ConflictError, DuplicateCommandError } from '../../errors/DomainError';

const baseInput = {
  kind: 'Agent' as const,
  tenantId: 'tenant-1',
  workspaceId: 'workspace-1',
  userId: 'user-1',
  traceId: 'trace-1',
  correlationId: 'corr-1',
};

function makeFakeProvider(result: ExecutionProviderResult | (() => ExecutionProviderResult)): ExecutionProviderPort {
  return { execute: async () => (typeof result === 'function' ? result() : result) };
}

class DeterministicClock implements Clock {
  constructor(private current: Date) {}
  now(): Date {
    return this.current;
  }
  advance(ms: number): void {
    this.current = new Date(this.current.getTime() + ms);
  }
}

describe('ExecutionOrchestrator — idempotency (Phase 9f-2)', () => {
  it('behaves exactly like run() when no idempotency store is configured (NoOp default)', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    const orchestrator = new ExecutionOrchestrator(repo, provider);

    const first = await orchestrator.runIdempotent({ ...baseInput, idempotencyKey: 'same-key' });
    const second = await orchestrator.runIdempotent({ ...baseInput, idempotencyKey: 'same-key' });

    expect(first.id.equals(second.id)).toBe(false); // NoOp never dedupes
  });

  it('returns the existing Execution for a duplicate idempotency key, instead of creating a second one', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    const idempotencyStore = new InMemoryExecutionIdempotencyStore();
    const orchestrator = new ExecutionOrchestrator(repo, provider, undefined, { idempotencyStore });

    const first = await orchestrator.runIdempotent({ ...baseInput, idempotencyKey: 'order-42' });
    const second = await orchestrator.runIdempotent({ ...baseInput, idempotencyKey: 'order-42' });

    expect(second.id.equals(first.id)).toBe(true);
    expect(second.status).toBe(ExecutionStatus.Completed);
  });

  it('a different idempotency key always creates a distinct Execution', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    const idempotencyStore = new InMemoryExecutionIdempotencyStore();
    const orchestrator = new ExecutionOrchestrator(repo, provider, undefined, { idempotencyStore });

    const first = await orchestrator.runIdempotent({ ...baseInput, idempotencyKey: 'a' });
    const second = await orchestrator.runIdempotent({ ...baseInput, idempotencyKey: 'b' });

    expect(first.id.equals(second.id)).toBe(false);
  });

  it('throws DuplicateCommandError if the reserved key\'s owning Execution cannot be loaded', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    // A store that always claims the key is already owned by an id that was
    // never actually persisted — simulates a reservation racing ahead of
    // the owning Execution's own save().
    const phantomId = ExecutionId.generate();
    const store = {
      async reserve() {
        return { executionId: phantomId };
      },
    };
    const orchestrator = new ExecutionOrchestrator(repo, provider, undefined, { idempotencyStore: store });

    await expect(orchestrator.runIdempotent({ ...baseInput, idempotencyKey: 'ghost' })).rejects.toThrow(
      DuplicateCommandError
    );
  });
});

describe('ExecutionOrchestrator — retry eligibility and failure classification (Phase 9f-2)', () => {
  it('NeverRetryPolicy (the default) never retries, regardless of failure class', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'failed', reason: 'connection reset by peer' });
    const orchestrator = new ExecutionOrchestrator(repo, provider);

    const execution = await orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Failed);

    const retried = await orchestrator.retryIfEligible(execution, { attempt: 1 });
    expect(retried).toBeUndefined();
  });

  it('MaxAttemptsRetryPolicy retries a transient failure under the attempt cap', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'failed', reason: 'upstream connection timeout' });
    const orchestrator = new ExecutionOrchestrator(repo, provider, undefined, {
      retryPolicy: new MaxAttemptsRetryPolicy(3),
    });

    const execution = await orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Failed);

    const retried = await orchestrator.retryIfEligible(execution, { attempt: 1 });
    expect(retried).toBeDefined();
    if (!retried) throw new Error('Expected an eligible retry execution.');
    expect(retried.parentExecutionId?.equals(execution.id)).toBe(true);
  });

  it('MaxAttemptsRetryPolicy does not retry once the attempt cap is reached', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'failed', reason: 'connection timeout' });
    const orchestrator = new ExecutionOrchestrator(repo, provider, undefined, {
      retryPolicy: new MaxAttemptsRetryPolicy(3),
    });

    const execution = await orchestrator.run(baseInput);
    const retried = await orchestrator.retryIfEligible(execution, { attempt: 3 });
    expect(retried).toBeUndefined();
  });

  it('MaxAttemptsRetryPolicy does not retry a permanent (non-transient) failure', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'failed', reason: 'invalid input: missing required field' });
    const orchestrator = new ExecutionOrchestrator(repo, provider, undefined, {
      retryPolicy: new MaxAttemptsRetryPolicy(3),
    });

    const execution = await orchestrator.run(baseInput);
    const retried = await orchestrator.retryIfEligible(execution, { attempt: 1 });
    expect(retried).toBeUndefined();
  });

  it('DefaultExecutionFailureClassifier classifies TIMED_OUT as transient regardless of reason text', () => {
    const classifier = new DefaultExecutionFailureClassifier();
    const execution = Execution.create(baseInput);
    execution.transitionTo(ExecutionStatus.Validating);
    execution.transitionTo(ExecutionStatus.Queued);
    execution.transitionTo(ExecutionStatus.Running);
    execution.transitionTo(ExecutionStatus.TimedOut);

    expect(classifier.classify(execution)).toBe('transient');
  });

  it('DefaultExecutionFailureClassifier classifies a non-terminal Execution as unknown', () => {
    const classifier = new DefaultExecutionFailureClassifier();
    const execution = Execution.create(baseInput);
    expect(classifier.classify(execution)).toBe('unknown');
  });

  it('NeverRetryPolicy is the real default when none is supplied', async () => {
    const orchestrator = new ExecutionOrchestrator(new InMemoryExecutionRepository(), makeFakeProvider({ outcome: 'failed', reason: 'network unreachable' }));
    const execution = await orchestrator.run(baseInput);
    const retried = await orchestrator.retryIfEligible(execution, { attempt: 1 });
    expect(retried).toBeUndefined();
  });
});

describe('ExecutionOrchestrator — leases and ownership (Phase 9f-2)', () => {
  it('resumeOwned() acquires and releases a lease around resume()', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    const leaseStore = new InMemoryExecutionLeaseStore();
    const orchestrator = new ExecutionOrchestrator(repo, provider, undefined, { leaseStore });

    let waiting = makeFakeProvider(() => ({ outcome: 'waiting', reason: 'awaiting approval' }));
    const waitOrchestrator = new ExecutionOrchestrator(repo, waiting, undefined, { leaseStore });
    const execution = await waitOrchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Waiting);

    const resumed = await orchestrator.resumeOwned(execution, { owner: 'worker-1', leaseDurationMs: 30_000 });
    expect(resumed.status).toBe(ExecutionStatus.Completed);

    // Lease was released after resume() completed — a second owner can now
    // freely acquire it (nothing left to conflict with).
    const currentLease = await leaseStore.currentLease(execution.id);
    expect(currentLease).toBeUndefined();
  });

  it('rejects resumeOwned() with ConflictError if a different owner already holds a valid lease', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider(() => ({ outcome: 'waiting', reason: 'still working' }));
    const leaseStore = new InMemoryExecutionLeaseStore();
    const orchestrator = new ExecutionOrchestrator(repo, provider, undefined, { leaseStore });

    const execution = await orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Waiting);

    await leaseStore.acquire(execution.id, 'worker-1', 60_000);

    await expect(
      orchestrator.resumeOwned(execution, { owner: 'worker-2', leaseDurationMs: 30_000 })
    ).rejects.toThrow(ConflictError);
  });

  it('InMemoryExecutionLeaseStore treats an expired lease as available to a new owner', async () => {
    const clock = new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
    const leaseStore = new InMemoryExecutionLeaseStore(clock);
    const executionId = ExecutionId.generate();

    await leaseStore.acquire(executionId, 'worker-1', 1_000);
    clock.advance(2_000); // past expiry

    const lease = await leaseStore.acquire(executionId, 'worker-2', 1_000);
    expect(lease.owner).toBe('worker-2');
  });

  it('renew() extends a lease the same owner already holds, and throws for a non-holder', async () => {
    const clock = new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
    const leaseStore = new InMemoryExecutionLeaseStore(clock);
    const executionId = ExecutionId.generate();

    await leaseStore.acquire(executionId, 'worker-1', 1_000);
    const renewed = await leaseStore.renew(executionId, 'worker-1', 5_000);
    expect(renewed.owner).toBe('worker-1');

    await expect(leaseStore.renew(executionId, 'worker-2', 1_000)).rejects.toThrow(ConflictError);
  });

  it('release() is a no-op for an owner that does not hold the lease', async () => {
    const leaseStore = new InMemoryExecutionLeaseStore();
    const executionId = ExecutionId.generate();
    await expect(leaseStore.release(executionId, 'nobody')).resolves.not.toThrow();
  });
});
