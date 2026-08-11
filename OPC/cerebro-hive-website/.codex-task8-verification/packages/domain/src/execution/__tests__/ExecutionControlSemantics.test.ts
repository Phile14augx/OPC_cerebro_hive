import { describe, it, expect, vi } from 'vitest';
import { Execution } from '../Execution';
import { ExecutionStatus } from '../ExecutionStatus';
import { InMemoryExecutionRepository } from '../InMemoryExecutionRepository';
import {
  ExecutionOrchestrator,
  ExecutionProviderPort,
  ExecutionProviderResult,
} from '../ExecutionOrchestrator';
import { Clock } from '../Clock';
import { ExecutionAuthorizationContext, ExecutionAuthorizationPolicy } from '../ExecutionAuthorizationPolicy';
import { Decision } from '../../policies/Decision';
import { AuthorizationError, InvariantViolationError } from '../../errors/DomainError';

const baseInput = {
  kind: 'Agent' as const,
  tenantId: 'tenant-1',
  workspaceId: 'workspace-1',
  userId: 'user-1',
  traceId: 'trace-1',
  correlationId: 'corr-1',
};

function makeFakeProvider(result: ExecutionProviderResult | (() => ExecutionProviderResult)): ExecutionProviderPort {
  return { execute: vi.fn(async () => (typeof result === 'function' ? result() : result)) };
}

/** A real, controllable test clock — advances only when told to, so a
 * timeout test never depends on real wall-clock sleeping. This is the kind
 * of deterministic test fixture explicitly scoped for 9f-1 (not production
 * infrastructure, unlike `Clock.ts`'s own real `SystemClock`). */
class DeterministicClock implements Clock {
  constructor(private current: Date) {}
  now(): Date {
    return this.current;
  }
  advance(ms: number): void {
    this.current = new Date(this.current.getTime() + ms);
  }
}

/** A test fixture standing in for a real authorization backend — not
 * production code, unlike `AllowAllExecutionAuthorizationPolicy` (which
 * genuinely is the orchestrator's real default). */
class RecordingAuthorizationPolicy implements ExecutionAuthorizationPolicy {
  public readonly evaluated: ExecutionAuthorizationContext[] = [];
  constructor(private readonly decide: (context: ExecutionAuthorizationContext) => Decision = () => ({ allowed: true })) {}
  async evaluate(context: ExecutionAuthorizationContext): Promise<Decision> {
    this.evaluated.push(context);
    return this.decide(context);
  }
}

describe('ExecutionOrchestrator — authorization (Phase 9f-1)', () => {
  it('defaults to permissive (AllowAll) when no policy is supplied — unchanged behavior for every existing caller', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    const orchestrator = new ExecutionOrchestrator(repo, provider);
    const execution = await orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Completed);
  });

  it('rejects every transition with AuthorizationError when the policy denies', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    const policy = new RecordingAuthorizationPolicy(() => ({ allowed: false, reason: 'not on the allowlist' }));
    const orchestrator = new ExecutionOrchestrator(repo, provider, undefined, { authorizationPolicy: policy });

    await expect(orchestrator.run(baseInput)).rejects.toThrow(AuthorizationError);
    await expect(orchestrator.run(baseInput)).rejects.toThrow('not on the allowlist');
  });

  it('passes actor and target status through to the policy for every transition', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    const policy = new RecordingAuthorizationPolicy();
    const orchestrator = new ExecutionOrchestrator(repo, provider, undefined, { authorizationPolicy: policy });

    await orchestrator.run(baseInput);

    expect(policy.evaluated.map((c) => c.toStatus)).toEqual([
      ExecutionStatus.Validating,
      ExecutionStatus.Queued,
      ExecutionStatus.Running,
      ExecutionStatus.Completed,
    ]);
    expect(policy.evaluated.every((c) => c.action === 'transition')).toBe(true);
  });

  it('rejects requestCancellation specifically when the policy denies the "cancel" action', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'waiting', reason: 'awaiting input' });
    const policy = new RecordingAuthorizationPolicy((ctx) => ({ allowed: ctx.action !== 'cancel' }));
    const orchestrator = new ExecutionOrchestrator(repo, provider, undefined, { authorizationPolicy: policy });

    const execution = await orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Waiting);

    await expect(orchestrator.requestCancellation(execution, { actor: 'user-2' })).rejects.toThrow(AuthorizationError);
  });
});

describe('ExecutionOrchestrator — cancellation (Phase 9f-1)', () => {
  it('cancels straight to CANCELLED, without ever invoking the provider, if requested while still pre-RUNNING', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    let orchestrator!: ExecutionOrchestrator;
    let alreadyRequested = false;

    const wrappedRepo = {
      ...repo,
      save: async (execution: Execution, expectedVersion: number, tx?: unknown) => {
        await repo.save(execution, expectedVersion, tx as never);
        if (execution.status === ExecutionStatus.Queued && !alreadyRequested) {
          alreadyRequested = true;
          // Simulates a cancellation request arriving concurrently, right
          // after QUEUED was persisted but before RUNNING is entered.
          await orchestrator.requestCancellation(execution, { reason: 'user cancelled before it started' });
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
    expect(execution.transitionHistory.at(-1)?.reason).toBe('user cancelled before it started');
    expect(provider.execute).not.toHaveBeenCalled();
  });

  it('moves a RUNNING Execution to CANCELLING when cancellation is requested cooperatively, then finalizes via acknowledgeCancellation', async () => {
    const repo = new InMemoryExecutionRepository();
    let orchestrator!: ExecutionOrchestrator;

    const provider: ExecutionProviderPort = {
      execute: async (execution) => {
        // Simulates the orchestrator's `cancellationSignal` being observed
        // cooperatively by a real provider mid-work, alongside an external
        // requestCancellation() call arriving while this Execution is
        // RUNNING.
        await orchestrator.requestCancellation(execution, { reason: 'operator abort' });
        return { outcome: 'waiting', reason: 'still cleaning up' };
      },
    };

    orchestrator = new ExecutionOrchestrator(repo, provider);
    const execution = await orchestrator.run(baseInput);

    expect(execution.status).toBe(ExecutionStatus.Cancelling);

    const finalized = await orchestrator.acknowledgeCancellation(execution, { reason: 'cleanup finished' });
    expect(finalized.status).toBe(ExecutionStatus.Cancelled);
    expect(finalized.transitionHistory.at(-1)?.reason).toBe('cleanup finished');
  });

  it('acknowledgeCancellation moves to FAILED when cleanup itself did not succeed', async () => {
    const repo = new InMemoryExecutionRepository();
    let orchestrator!: ExecutionOrchestrator;
    const provider: ExecutionProviderPort = {
      execute: async (execution) => {
        await orchestrator.requestCancellation(execution, { reason: 'operator abort' });
        return { outcome: 'waiting' };
      },
    };
    orchestrator = new ExecutionOrchestrator(repo, provider);

    const execution = await orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Cancelling);

    const finalized = await orchestrator.acknowledgeCancellation(execution, { succeeded: false });
    expect(finalized.status).toBe(ExecutionStatus.Failed);
    expect(finalized.transitionHistory.at(-1)?.reason).toBe('Cancellation could not be completed cleanly.');
  });

  it('acknowledgeCancellation throws if the Execution is not CANCELLING', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    const orchestrator = new ExecutionOrchestrator(repo, provider);

    const execution = await orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Completed);

    await expect(orchestrator.acknowledgeCancellation(execution)).rejects.toThrow(InvariantViolationError);
  });

  it('requestCancellation on an already-terminal Execution is a no-op', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    const orchestrator = new ExecutionOrchestrator(repo, provider);

    const execution = await orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Completed);

    const result = await orchestrator.requestCancellation(execution, { reason: 'too late' });
    expect(result.status).toBe(ExecutionStatus.Completed);
  });

  it('commits to the CANCELLING path even if the provider still reports "completed" after cancellation was requested', async () => {
    const repo = new InMemoryExecutionRepository();
    let orchestrator!: ExecutionOrchestrator;
    const provider: ExecutionProviderPort = {
      execute: async (execution) => {
        await orchestrator.requestCancellation(execution, { reason: 'too slow to matter' });
        return { outcome: 'completed', result: 'finished anyway' };
      },
    };
    orchestrator = new ExecutionOrchestrator(repo, provider);

    // requestCancellation() transitions RUNNING -> CANCELLING synchronously
    // (see its own doc comment); by the time invokeProviderAndFinalize sees
    // the provider's "completed" result, the Execution is already committed
    // to the cancellation path, and the graph itself has no CANCELLING ->
    // COMPLETED edge to race against.
    const execution = await orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Cancelling);
  });

  it('the provider receives a cancellationSignal it can observe (but not itself set)', async () => {
    const repo = new InMemoryExecutionRepository();
    let observedBeforeCancel = false;
    let observedAfterCancel = false;
    let orchestrator!: ExecutionOrchestrator;

    const provider: ExecutionProviderPort = {
      execute: async (execution, opts) => {
        observedBeforeCancel = opts?.cancellationSignal?.isCancellationRequested ?? true;
        await orchestrator.requestCancellation(execution, { reason: 'mid-flight' });
        observedAfterCancel = opts?.cancellationSignal?.isCancellationRequested ?? false;
        return { outcome: 'waiting' };
      },
    };
    orchestrator = new ExecutionOrchestrator(repo, provider);
    await orchestrator.run(baseInput);

    expect(observedBeforeCancel).toBe(false);
    expect(observedAfterCancel).toBe(true);
  });
});

describe('ExecutionOrchestrator — timeout (Phase 9f-1)', () => {
  it('runs to completion normally when no timeoutMs is given, regardless of the clock', async () => {
    const clock = new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider(() => {
      clock.advance(1_000_000); // clock moving doesn't matter without a deadline
      return { outcome: 'completed', result: 'ok' };
    });
    const orchestrator = new ExecutionOrchestrator(repo, provider, undefined, { clock });

    const execution = await orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Completed);
  });

  it('times out, overriding the provider\'s own result, if the deadline passes while it is running', async () => {
    const clock = new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
    const repo = new InMemoryExecutionRepository();
    const provider: ExecutionProviderPort = {
      execute: async () => {
        clock.advance(10_000); // deadline was 5000ms — this pushes past it
        return { outcome: 'completed', result: 'too late' };
      },
    };
    const orchestrator = new ExecutionOrchestrator(repo, provider, undefined, { clock });

    const execution = await orchestrator.run({ ...baseInput, timeoutMs: 5_000 });
    expect(execution.status).toBe(ExecutionStatus.TimedOut);
  });

  it('times out immediately, without invoking the provider, if the deadline has already passed before RUNNING', async () => {
    const clock = new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    const orchestrator = new ExecutionOrchestrator(repo, provider, undefined, { clock });

    // A 0ms timeout means the deadline (now + 0) has already been reached by
    // the time invokeProviderAndFinalize checks it.
    const execution = await orchestrator.run({ ...baseInput, timeoutMs: 0 });
    expect(execution.status).toBe(ExecutionStatus.TimedOut);
    expect(provider.execute).not.toHaveBeenCalled();
  });

  it('resume() times out directly, without re-entering RUNNING, if the deadline passed while WAITING', async () => {
    const clock = new DeterministicClock(new Date('2024-01-01T00:00:00Z'));
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider(() => ({ outcome: 'waiting', reason: 'awaiting input' }));
    const orchestrator = new ExecutionOrchestrator(repo, provider, undefined, { clock });

    const execution = await orchestrator.run({ ...baseInput, timeoutMs: 5_000 });
    expect(execution.status).toBe(ExecutionStatus.Waiting);

    clock.advance(10_000);
    const resumed = await orchestrator.resume(execution);
    expect(resumed.status).toBe(ExecutionStatus.TimedOut);
    expect(provider.execute).toHaveBeenCalledTimes(1); // only the original run() call, not a second one from resume()
  });
});
