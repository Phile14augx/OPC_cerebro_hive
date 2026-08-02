import { describe, it, expect } from 'vitest';
import { ExecutionStatus } from '../ExecutionStatus';
import { ExecutionId } from '../ExecutionId';
import { InMemoryExecutionRepository } from '../InMemoryExecutionRepository';
import { InMemoryExecutionLeaseStore } from '../ExecutionLease';
import { ExecutionOrchestrator, ExecutionProviderPort, ExecutionProviderResult } from '../ExecutionOrchestrator';
import { ExecutionLeaseHeartbeat } from '../ExecutionLeaseHeartbeat';
import { ExecutionWorker } from '../ExecutionWorker';
import { TimerHandle, TimerSource } from '../Timer';
import { Clock } from '../Clock';
import { ConflictError, NotFoundError } from '../../errors/DomainError';

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

/** A real test fixture (not production code): lets a test fire the
 * registered interval callback on command instead of waiting on real
 * elapsed time — the manual-driving pattern this whole phase has used for
 * `Clock`/`ExecutionScheduler`. */
class ManualTimerSource implements TimerSource {
  private callback?: () => void;
  private cleared = false;

  setInterval(callback: () => void, _intervalMs: number): TimerHandle {
    this.callback = callback;
    this.cleared = false;
    return {};
  }

  clearInterval(_handle: TimerHandle): void {
    this.cleared = true;
    this.callback = undefined;
  }

  fire(): void {
    this.callback?.();
  }

  get isCleared(): boolean {
    return this.cleared;
  }
}

function makeFakeProvider(result: ExecutionProviderResult | (() => ExecutionProviderResult)): ExecutionProviderPort {
  return { execute: async () => (typeof result === 'function' ? result() : result) };
}

describe('ExecutionLeaseHeartbeat', () => {
  it('start() registers with the TimerSource, and firing it renews the lease', async () => {
    const clock = new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
    const leaseStore = new InMemoryExecutionLeaseStore(clock);
    const timerSource = new ManualTimerSource();
    const executionId = ExecutionId.generate();

    await leaseStore.acquire(executionId, 'worker-1', 10_000);
    const heartbeat = new ExecutionLeaseHeartbeat(leaseStore, executionId, 'worker-1', 10_000, { timerSource });
    heartbeat.start();

    // Advance past the ORIGINAL lease's expiry, but rely on the heartbeat
    // having renewed it before that point (a real caller would fire on the
    // configured heartbeatIntervalMs cadence, well before expiry).
    clock.advance(8_000);
    timerSource.fire();
    clock.advance(8_000); // total 16s elapsed > original 10s duration

    const current = await leaseStore.currentLease(executionId);
    expect(current).toBeDefined(); // still held — the heartbeat's renewal extended it
  });

  it('stop() clears the timer so no further renewals happen', async () => {
    const clock = new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
    const leaseStore = new InMemoryExecutionLeaseStore(clock);
    const timerSource = new ManualTimerSource();
    const executionId = ExecutionId.generate();

    await leaseStore.acquire(executionId, 'worker-1', 10_000);
    const heartbeat = new ExecutionLeaseHeartbeat(leaseStore, executionId, 'worker-1', 10_000, { timerSource });
    heartbeat.start();
    heartbeat.stop();

    expect(timerSource.isCleared).toBe(true);

    clock.advance(20_000); // past expiry, no renewal happened
    const current = await leaseStore.currentLease(executionId);
    expect(current).toBeUndefined();
  });

  it('start() is idempotent — calling it twice does not register a second timer', async () => {
    const clock = new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
    const leaseStore = new InMemoryExecutionLeaseStore(clock);
    const timerSource = new ManualTimerSource();
    const executionId = ExecutionId.generate();
    await leaseStore.acquire(executionId, 'worker-1', 10_000);

    const heartbeat = new ExecutionLeaseHeartbeat(leaseStore, executionId, 'worker-1', 10_000, { timerSource });
    heartbeat.start();
    heartbeat.start(); // no-op, per doc comment
    heartbeat.stop();
    expect(timerSource.isCleared).toBe(true);
  });

  it('reports renewal failures via onRenewalFailure rather than swallowing them silently', async () => {
    const clock = new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
    const leaseStore = new InMemoryExecutionLeaseStore(clock);
    const timerSource = new ManualTimerSource();
    const executionId = ExecutionId.generate();

    await leaseStore.acquire(executionId, 'worker-1', 10_000);
    // A different owner now holds the lease (simulating it having been lost).
    clock.advance(11_000); // let it expire
    await leaseStore.acquire(executionId, 'worker-2', 10_000);

    let observedError: unknown;
    const heartbeat = new ExecutionLeaseHeartbeat(leaseStore, executionId, 'worker-1', 10_000, {
      timerSource,
      onRenewalFailure: (err) => {
        observedError = err;
      },
    });
    heartbeat.start();
    timerSource.fire();
    await Promise.resolve(); // let the fire-and-forget renew().catch() settle
    await Promise.resolve();

    expect(observedError).toBeInstanceOf(ConflictError);
  });
});

describe('ExecutionWorker.resume', () => {
  it('acquires a lease, resumes a WAITING Execution, and releases the lease afterward', async () => {
    const clock = new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
    const repo = new InMemoryExecutionRepository();
    const leaseStore = new InMemoryExecutionLeaseStore(clock);
    let providerCalls = 0;
    const provider: ExecutionProviderPort = {
      execute: async () => {
        providerCalls += 1;
        return providerCalls === 1 ? { outcome: 'waiting', reason: 'awaiting input' } : { outcome: 'completed', result: 'ok' };
      },
    };
    const orchestrator = new ExecutionOrchestrator(repo, provider);
    const execution = await orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Waiting);

    const worker = new ExecutionWorker(orchestrator, repo, leaseStore, 'worker-1', {
      leaseDurationMs: 30_000,
      timerSource: new ManualTimerSource(),
    });

    const resumed = await worker.resume(execution.id);
    expect(resumed.status).toBe(ExecutionStatus.Completed);

    // Lease was released after completion.
    expect(await leaseStore.currentLease(execution.id)).toBeUndefined();
  });

  it('renews the lease via heartbeat while a long provider call is in flight, keeping it held past the original duration', async () => {
    const clock = new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
    const repo = new InMemoryExecutionRepository();
    const leaseStore = new InMemoryExecutionLeaseStore(clock);
    const timerSource = new ManualTimerSource();

    const setupOrchestrator = new ExecutionOrchestrator(repo, makeFakeProvider({ outcome: 'waiting', reason: 'awaiting input' }));
    const execution = await setupOrchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Waiting);

    const longRunningProvider: ExecutionProviderPort = {
      execute: async () => {
        // Simulate a long-running provider call: elapse more time than the
        // lease's original duration, firing the heartbeat partway through.
        clock.advance(20_000);
        timerSource.fire(); // renews the lease for another 30s from here
        clock.advance(20_000); // total 40s elapsed, past the original 30s duration
        return { outcome: 'completed', result: 'ok' };
      },
    };
    const orchestrator = new ExecutionOrchestrator(repo, longRunningProvider);
    const worker = new ExecutionWorker(orchestrator, repo, leaseStore, 'worker-1', {
      leaseDurationMs: 30_000,
      timerSource,
    });

    const resumed = await worker.resume(execution.id);
    expect(resumed.status).toBe(ExecutionStatus.Completed);
  });

  it('throws NotFoundError for an unknown executionId, and still releases the lease it had acquired', async () => {
    const clock = new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
    const repo = new InMemoryExecutionRepository();
    const leaseStore = new InMemoryExecutionLeaseStore(clock);
    const orchestrator = new ExecutionOrchestrator(repo, makeFakeProvider({ outcome: 'completed', result: 'ok' }));
    const worker = new ExecutionWorker(orchestrator, repo, leaseStore, 'worker-1', {
      leaseDurationMs: 10_000,
      timerSource: new ManualTimerSource(),
    });

    const unknownId = ExecutionId.generate();
    await expect(worker.resume(unknownId)).rejects.toThrow(NotFoundError);
    expect(await leaseStore.currentLease(unknownId)).toBeUndefined();
  });

  it('requestCancellation() delegates to the orchestrator with the worker as actor', async () => {
    const clock = new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
    const repo = new InMemoryExecutionRepository();
    const leaseStore = new InMemoryExecutionLeaseStore(clock);
    const orchestrator = new ExecutionOrchestrator(repo, makeFakeProvider(() => ({ outcome: 'waiting' })));
    const worker = new ExecutionWorker(orchestrator, repo, leaseStore, 'worker-1', { timerSource: new ManualTimerSource() });

    const execution = await orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Waiting);

    const cancelling = await worker.requestCancellation(execution, { reason: 'operator request' });
    expect(cancelling.status).toBe(ExecutionStatus.Cancelling);
    expect(cancelling.transitionHistory.at(-1)?.actor).toBe('worker-1');
  });
});
