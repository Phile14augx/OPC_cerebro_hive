import { describe, it, expect } from 'vitest';
import { Execution } from '../Execution';
import { ExecutionStatus } from '../ExecutionStatus';
import { InMemoryExecutionRepository } from '../InMemoryExecutionRepository';
import { InMemoryExecutionScheduleQueue } from '../ExecutionScheduleQueue';
import { InMemoryExecutionLeaseStore } from '../ExecutionLease';
import { ExecutionScheduler } from '../ExecutionScheduler';
import { ExecutionOrchestrator, ExecutionProviderPort, ExecutionProviderResult } from '../ExecutionOrchestrator';
import { Clock } from '../Clock';
import { MaxAttemptsRetryPolicy, NeverRetryPolicy } from '../ExecutionRetryPolicy';

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

describe('ExecutionScheduler — scheduleRun (delayed execution)', () => {
  it('does not run a scheduled Execution before it is due', async () => {
    const clock = new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
    const repo = new InMemoryExecutionRepository();
    let executed = false;
    const provider: ExecutionProviderPort = {
      execute: async () => {
        executed = true;
        return { outcome: 'completed', result: 'ok' };
      },
    };
    const orchestrator = new ExecutionOrchestrator(repo, provider);
    const queue = new InMemoryExecutionScheduleQueue();
    const scheduler = new ExecutionScheduler(orchestrator, repo, queue, { clock });

    await scheduler.scheduleRun(baseInput, new Date(clock.now().getTime() + 60_000));
    await scheduler.tick();

    expect(queue.pendingCount).toBe(1);
    expect(executed).toBe(false);
  });

  it('runs a scheduled Execution once its due time has arrived', async () => {
    const clock = new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
    const repo = new InMemoryExecutionRepository();
    let executed = false;
    const provider: ExecutionProviderPort = {
      execute: async () => {
        executed = true;
        return { outcome: 'completed', result: 'ok' };
      },
    };
    const orchestrator = new ExecutionOrchestrator(repo, provider);
    const queue = new InMemoryExecutionScheduleQueue();
    const scheduler = new ExecutionScheduler(orchestrator, repo, queue, { clock });

    await scheduler.scheduleRun(baseInput, new Date(clock.now().getTime() + 1_000));
    await scheduler.tick();
    expect(executed).toBe(false);
    expect(queue.pendingCount).toBe(1);

    clock.advance(1_000);
    await scheduler.tick();
    expect(executed).toBe(true);
    expect(queue.pendingCount).toBe(0);
  });
});

describe('ExecutionScheduler — scheduleTimeoutCheck (proactive timeout)', () => {
  it('resumes a WAITING Execution once its deadline is due, via a leased resumeOwned()', async () => {
    const clock = new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
    const repo = new InMemoryExecutionRepository();
    let calls = 0;
    const provider: ExecutionProviderPort = {
      execute: async () => {
        calls += 1;
        return calls === 1 ? { outcome: 'waiting', reason: 'awaiting approval' } : { outcome: 'completed', result: 'ok' };
      },
    };
    const leaseStore = new InMemoryExecutionLeaseStore(clock);
    const orchestrator = new ExecutionOrchestrator(repo, provider, undefined, { leaseStore, clock });
    const queue = new InMemoryExecutionScheduleQueue();
    const scheduler = new ExecutionScheduler(orchestrator, repo, queue, { clock });

    const execution = await orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Waiting);

    await scheduler.scheduleTimeoutCheck(execution.id, new Date(clock.now().getTime() + 5_000));
    await scheduler.tick();
    // Not due yet — still WAITING.
    const stillWaiting = await repo.load(execution.id);
    expect(stillWaiting!.status).toBe(ExecutionStatus.Waiting);

    clock.advance(5_000);
    await scheduler.tick();

    const resumed = await repo.load(execution.id);
    expect(resumed!.status).toBe(ExecutionStatus.Completed);
  });

  it('is a no-op if the Execution already reached a terminal status by the time the check runs', async () => {
    const clock = new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    const orchestrator = new ExecutionOrchestrator(repo, provider);
    const queue = new InMemoryExecutionScheduleQueue();
    const scheduler = new ExecutionScheduler(orchestrator, repo, queue, { clock });

    const execution = await orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Completed);

    await scheduler.scheduleTimeoutCheck(execution.id, clock.now());
    await expect(scheduler.tick()).resolves.not.toThrow();

    const stillCompleted = await repo.load(execution.id);
    expect(stillCompleted!.status).toBe(ExecutionStatus.Completed);
  });
});

describe('ExecutionScheduler — scheduleRetry', () => {
  it('retries a terminal Execution once due, honoring the retry policy', async () => {
    const clock = new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'failed', reason: 'connection timeout' });
    const orchestrator = new ExecutionOrchestrator(repo, provider, undefined, {
      retryPolicy: new MaxAttemptsRetryPolicy(3),
    });
    const queue = new InMemoryExecutionScheduleQueue();
    const scheduler = new ExecutionScheduler(orchestrator, repo, queue, {
      clock,
      retryPolicy: new MaxAttemptsRetryPolicy(3),
    });

    const execution = await orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Failed);

    await scheduler.scheduleRetry(execution, 1, 'transient');
    await scheduler.tick();

    const children = await repo.findChildren(execution.id);
    expect(children).toHaveLength(1);
    expect(children[0].parentExecutionId?.equals(execution.id)).toBe(true);
  });

  it('does not retry once the attempt cap has been reached', async () => {
    const clock = new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'failed', reason: 'connection timeout' });
    const orchestrator = new ExecutionOrchestrator(repo, provider, undefined, {
      retryPolicy: new MaxAttemptsRetryPolicy(1),
    });
    const queue = new InMemoryExecutionScheduleQueue();
    const scheduler = new ExecutionScheduler(orchestrator, repo, queue, { clock, retryPolicy: new MaxAttemptsRetryPolicy(1) });

    const execution = await orchestrator.run(baseInput);
    await scheduler.scheduleRetry(execution, 1, 'transient');
    await scheduler.tick();

    const children = await repo.findChildren(execution.id);
    expect(children).toHaveLength(0);
  });

  it('is a no-op if the Execution is not (or no longer) terminal', async () => {
    const clock = new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider(() => ({ outcome: 'waiting', reason: 'still working' }));
    const orchestrator = new ExecutionOrchestrator(repo, provider);
    const queue = new InMemoryExecutionScheduleQueue();
    const scheduler = new ExecutionScheduler(orchestrator, repo, queue, { clock });

    const execution = await orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Waiting);

    await scheduler.scheduleRetry(execution, 1, 'transient');
    await expect(scheduler.tick()).resolves.not.toThrow();
  });

  it('honors ExecutionRetryPolicy.retryDelayMs() when computing the retry\'s due time', async () => {
    const clock = new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'failed', reason: 'connection timeout' });
    const orchestrator = new ExecutionOrchestrator(repo, provider, undefined, {
      retryPolicy: new MaxAttemptsRetryPolicy(3),
    });
    const queue = new InMemoryExecutionScheduleQueue();
    const delayingPolicy = {
      shouldRetry: () => true,
      retryDelayMs: () => 10_000,
    };
    const scheduler = new ExecutionScheduler(orchestrator, repo, queue, { clock, retryPolicy: delayingPolicy });

    const execution = await orchestrator.run(baseInput);
    await scheduler.scheduleRetry(execution, 1, 'transient');

    await scheduler.tick(); // not due yet (delay is 10s)
    expect(queue.pendingCount).toBe(1);

    clock.advance(10_000);
    await scheduler.tick();
    expect(queue.pendingCount).toBe(0);
  });
});

describe('ExecutionScheduler.tick — multiple due tasks', () => {
  it('processes all currently-due tasks in one tick, in dueAt order', async () => {
    const clock = new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
    const repo = new InMemoryExecutionRepository();
    const order: string[] = [];
    const provider: ExecutionProviderPort = {
      execute: async () => {
        order.push('run');
        return { outcome: 'completed', result: 'ok' };
      },
    };
    const orchestrator = new ExecutionOrchestrator(repo, provider);
    const queue = new InMemoryExecutionScheduleQueue();
    const scheduler = new ExecutionScheduler(orchestrator, repo, queue, { clock });

    await scheduler.scheduleRun({ ...baseInput, traceId: 'trace-a' }, clock.now());
    await scheduler.scheduleRun({ ...baseInput, traceId: 'trace-b' }, clock.now());

    await scheduler.tick();
    expect(order).toEqual(['run', 'run']);
    expect(queue.pendingCount).toBe(0);
  });
});
