import { describe, it, expect, vi } from 'vitest';
import { Execution } from '../Execution';
import { ExecutionId } from '../ExecutionId';
import { ExecutionStatus } from '../ExecutionStatus';
import { ExecutionRepository } from '../ExecutionRepository';
import {
  ExecutionOrchestrator,
  ExecutionProviderPort,
  ExecutionProviderResult,
  ExecutionEventSink,
} from '../ExecutionOrchestrator';
import { DomainEvent } from '../../events/DomainEvent';
import { ConcurrencyError } from '../../errors/DomainError';

/** A minimal in-memory ExecutionRepository — real enough to exercise the
 * orchestrator's persistence calls without any real database, consistent
 * with this suite testing coordination logic, not a real Phase 9d
 * implementation. Reconciled to the mandatory-`expectedVersion` contract:
 * enforces the same real optimistic-concurrency check
 * `InMemoryExecutionRepository.ts` does, so a bug in the orchestrator's own
 * version bookkeeping would surface here as a thrown `ConcurrencyError`,
 * not just in that class's own test suite. */
class InMemoryExecutionRepository implements ExecutionRepository {
  public readonly saved: Execution[] = [];
  private readonly store = new Map<string, { version: number; execution: Execution }>();

  async save(execution: Execution, expectedVersion: number): Promise<void> {
    const key = execution.id.toString();
    const existing = this.store.get(key);
    const currentVersion = existing?.version ?? 0;
    if (currentVersion !== expectedVersion) {
      throw new ConcurrencyError(
        `Execution ${key} was modified concurrently — expected version ${expectedVersion}, found ${currentVersion}.`
      );
    }
    this.saved.push(execution);
    this.store.set(key, { version: execution.version, execution });
  }

  async load(id: ExecutionId): Promise<Execution | undefined> {
    return this.store.get(id.toString())?.execution;
  }

  async exists(id: ExecutionId): Promise<boolean> {
    return this.store.has(id.toString());
  }

  async loadTransitions(id: ExecutionId) {
    return this.store.get(id.toString())?.execution.transitionHistory ?? [];
  }

  async findChildren(parentId: ExecutionId): Promise<readonly Execution[]> {
    return Array.from(this.store.values())
      .map((entry) => entry.execution)
      .filter((e) => e.parentExecutionId?.equals(parentId));
  }
}

class RecordingEventSink implements ExecutionEventSink {
  public readonly published: DomainEvent[] = [];
  publish(event: DomainEvent): void {
    this.published.push(event);
  }
}

function makeFakeProvider(result: ExecutionProviderResult | (() => ExecutionProviderResult)): ExecutionProviderPort {
  return {
    execute: vi.fn(async () => (typeof result === 'function' ? result() : result)),
  };
}

const baseInput = {
  kind: 'Agent' as const,
  tenantId: 'tenant-1',
  workspaceId: 'workspace-1',
  userId: 'user-1',
  traceId: 'trace-1',
  correlationId: 'corr-1',
};

describe('ExecutionOrchestrator.run — happy path', () => {
  it('drives a fresh Execution to COMPLETED, persisting and publishing every transition', async () => {
    const repo = new InMemoryExecutionRepository();
    const events = new RecordingEventSink();
    const provider = makeFakeProvider({ outcome: 'completed', result: { answer: 42 } });
    const orchestrator = new ExecutionOrchestrator(repo, provider, events);

    const execution = await orchestrator.run(baseInput);

    expect(execution.status).toBe(ExecutionStatus.Completed);
    expect(execution.isTerminal).toBe(true);
    expect(provider.execute).toHaveBeenCalledTimes(1);
    // Phase 9f-1: execute() now also receives a cancellationSignal (the
    // provider's read-only view of ExecutionCancellationTokenSource) as a
    // second argument.
    expect(provider.execute).toHaveBeenCalledWith(execution, expect.objectContaining({ cancellationSignal: expect.anything() }));

    // create() itself is not a transition (no event), then Validating,
    // Queued, Running, Completed — 4 persisted-with-event steps, plus the
    // initial create() save.
    expect(repo.saved.length).toBe(5);
    expect(events.published.map((e) => e.constructor.name)).toEqual([
      'ExecutionValidatedEvent',
      'ExecutionQueuedEvent',
      'ExecutionStartedEvent',
      'ExecutionCompletedEvent',
    ]);
    expect(execution.transitionHistory.map((r) => r.to)).toEqual([
      ExecutionStatus.Validating,
      ExecutionStatus.Queued,
      ExecutionStatus.Running,
      ExecutionStatus.Completed,
    ]);
  });

  it('never calls the provider more than once per run, and the orchestrator itself performs no work — only the provider does', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    const orchestrator = new ExecutionOrchestrator(repo, provider);
    await orchestrator.run(baseInput);
    expect(provider.execute).toHaveBeenCalledTimes(1);
  });
});

describe('ExecutionOrchestrator.run — failure paths', () => {
  it('transitions to FAILED when the provider reports failure', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'failed', reason: 'provider timeout' });
    const orchestrator = new ExecutionOrchestrator(repo, provider);

    const execution = await orchestrator.run(baseInput);

    expect(execution.status).toBe(ExecutionStatus.Failed);
    expect(execution.transitionHistory.at(-1)?.reason).toBe('provider timeout');
  });

  it('transitions to FAILED with a fallback reason if the provider reports failure with none', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'failed' });
    const orchestrator = new ExecutionOrchestrator(repo, provider);

    const execution = await orchestrator.run(baseInput);

    expect(execution.status).toBe(ExecutionStatus.Failed);
    expect(execution.transitionHistory.at(-1)?.reason).toBe('Provider reported failure with no reason given.');
  });

  it('transitions to FAILED, capturing the error message, if the provider throws', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider: ExecutionProviderPort = {
      execute: vi.fn(async () => {
        throw new Error('connection refused');
      }),
    };
    const orchestrator = new ExecutionOrchestrator(repo, provider);

    const execution = await orchestrator.run(baseInput);

    expect(execution.status).toBe(ExecutionStatus.Failed);
    expect(execution.transitionHistory.at(-1)?.reason).toBe('connection refused');
  });
});

describe('ExecutionOrchestrator — WAITING and resume()', () => {
  it('transitions to WAITING when the provider reports waiting, then resumes to a terminal status', async () => {
    const repo = new InMemoryExecutionRepository();
    let callCount = 0;
    const provider = makeFakeProvider(() => {
      callCount += 1;
      return callCount === 1
        ? { outcome: 'waiting', reason: 'awaiting human input' }
        : { outcome: 'completed', result: 'approved' };
    });
    const orchestrator = new ExecutionOrchestrator(repo, provider);

    const execution = await orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Waiting);

    const resumed = await orchestrator.resume(execution);
    expect(resumed.status).toBe(ExecutionStatus.Completed);
    expect(provider.execute).toHaveBeenCalledTimes(2);
  });

  it('resume() throws if the Execution is not WAITING', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    const orchestrator = new ExecutionOrchestrator(repo, provider);

    const execution = await orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Completed);
    await expect(orchestrator.resume(execution)).rejects.toThrow();
  });
});

describe('ExecutionOrchestrator.retry — retry-as-child-execution semantics', () => {
  it('creates a new child Execution and drives it independently, without rewinding the original', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'failed', reason: 'transient error' });
    const orchestrator = new ExecutionOrchestrator(repo, provider);

    const original = await orchestrator.run(baseInput);
    expect(original.status).toBe(ExecutionStatus.Failed);

    const retryResult: ExecutionProviderResult = { outcome: 'completed', result: 'ok on retry' };
    const successProvider = makeFakeProvider(retryResult);
    const retryOrchestrator = new ExecutionOrchestrator(repo, successProvider);
    const retryExecution = await retryOrchestrator.retry(original);

    expect(retryExecution.status).toBe(ExecutionStatus.Completed);
    expect(retryExecution.parentExecutionId?.equals(original.id)).toBe(true);
    expect(original.status).toBe(ExecutionStatus.Failed);
    expect(original.childExecutionIds).toHaveLength(1);
    expect(original.childExecutionIds[0].equals(retryExecution.id)).toBe(true);

    // The retried original is persisted again (to capture the new child
    // reference) and the new child Execution is persisted through its own
    // full lifecycle.
    const savedIds = repo.saved.map((e) => e.id.toString());
    expect(savedIds).toContain(original.id.toString());
    expect(savedIds).toContain(retryExecution.id.toString());
  });

  it('retry() throws if the Execution has not reached a terminal status', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider(() => ({ outcome: 'waiting' }));
    const orchestrator = new ExecutionOrchestrator(repo, provider);

    const execution = await orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Waiting);
    await expect(orchestrator.retry(execution)).rejects.toThrow();
  });
});
