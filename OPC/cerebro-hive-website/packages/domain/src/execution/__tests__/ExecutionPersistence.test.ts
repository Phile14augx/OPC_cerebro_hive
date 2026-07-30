import { describe, it, expect } from 'vitest';
import { Execution } from '../Execution';
import { ExecutionStatus } from '../ExecutionStatus';
import { toExecutionSnapshot, fromExecutionSnapshot } from '../ExecutionSnapshot';
import { InMemoryExecutionRepository } from '../InMemoryExecutionRepository';
import { InMemoryExecutionCheckpointStore } from '../ExecutionCheckpointStore';
import { replayExecution } from '../ExecutionReplay';
import { ConcurrencyError } from '../../errors/DomainError';
import {
  ExecutionOrchestrator,
  ExecutionProviderPort,
  ExecutionProviderResult,
} from '../ExecutionOrchestrator';

const baseInput = {
  kind: 'Agent' as const,
  tenantId: 'tenant-1',
  workspaceId: 'workspace-1',
  userId: 'user-1',
  traceId: 'trace-1',
  correlationId: 'corr-1',
};

function driveThroughRunning(): Execution {
  const exec = Execution.create(baseInput);
  exec.transitionTo(ExecutionStatus.Validating);
  exec.transitionTo(ExecutionStatus.Queued);
  exec.transitionTo(ExecutionStatus.Running);
  return exec;
}

function makeFakeProvider(result: ExecutionProviderResult | (() => ExecutionProviderResult)): ExecutionProviderPort {
  return { execute: async () => (typeof result === 'function' ? result() : result) };
}

describe('ExecutionSnapshot — serialization round-trip', () => {
  it('round-trips a mid-lifecycle Execution through toExecutionSnapshot/fromExecutionSnapshot', () => {
    const original = driveThroughRunning();
    original.transitionTo(ExecutionStatus.Completed, { result: { answer: 42 } });

    const restored = fromExecutionSnapshot(toExecutionSnapshot(original));

    expect(restored.id.equals(original.id)).toBe(true);
    expect(restored.status).toBe(original.status);
    expect(restored.kind).toBe(original.kind);
    expect(restored.tenantId).toBe(original.tenantId);
    expect(restored.transitionHistory).toEqual(original.transitionHistory);
    expect(restored.createdAt.getTime()).toBe(original.createdAt.getTime());
    expect(restored.completedAt?.getTime()).toBe(original.completedAt?.getTime());
  });

  it('survives an actual JSON.stringify/JSON.parse pass, not just in-memory copying', () => {
    const original = driveThroughRunning();
    original.transitionTo(ExecutionStatus.Failed, { reason: 'boom' });

    const snapshot = toExecutionSnapshot(original);
    const throughJson = JSON.parse(JSON.stringify(snapshot));
    const restored = fromExecutionSnapshot(throughJson);

    expect(restored.status).toBe(ExecutionStatus.Failed);
    expect(restored.transitionHistory.at(-1)?.reason).toBe('boom');
    expect(restored.transitionHistory.at(-1)?.at).toBeInstanceOf(Date);
  });

  it('round-trips parent/child and contributor references as real ExecutionId instances', () => {
    const parent = Execution.create(baseInput);
    const child = Execution.create({ ...baseInput, parentExecutionId: parent.id });
    parent.addChildExecution(child.id);
    const contributorId = Execution.create(baseInput).id;
    parent.addContributorExecutionReference(contributorId);

    const restoredParent = fromExecutionSnapshot(toExecutionSnapshot(parent));
    expect(restoredParent.childExecutionIds[0].equals(child.id)).toBe(true);
    expect(restoredParent.contributorExecutionIds[0].equals(contributorId)).toBe(true);

    const restoredChild = fromExecutionSnapshot(toExecutionSnapshot(child));
    expect(restoredChild.parentExecutionId?.equals(parent.id)).toBe(true);
  });
});

describe('InMemoryExecutionRepository — save/load and optimistic concurrency', () => {
  it('saves and loads an Execution by id', async () => {
    const repo = new InMemoryExecutionRepository();
    const exec = driveThroughRunning();
    await repo.save(exec);

    const loaded = await repo.findById(exec.id);
    expect(loaded).toBeDefined();
    expect(loaded!.id.equals(exec.id)).toBe(true);
    expect(loaded!.status).toBe(ExecutionStatus.Running);
  });

  it('returns undefined for an unknown id', async () => {
    const repo = new InMemoryExecutionRepository();
    const exec = Execution.create(baseInput);
    expect(await repo.findById(exec.id)).toBeUndefined();
  });

  it('findChildren returns Executions declaring the given parent', async () => {
    const repo = new InMemoryExecutionRepository();
    const parent = Execution.create(baseInput);
    const child = Execution.create({ ...baseInput, parentExecutionId: parent.id });
    await repo.save(parent);
    await repo.save(child);

    const children = await repo.findChildren(parent.id);
    expect(children).toHaveLength(1);
    expect(children[0].id.equals(child.id)).toBe(true);
  });

  it('tracks revision as transitionHistory.length and exposes it via getRevision', async () => {
    const repo = new InMemoryExecutionRepository();
    const exec = Execution.create(baseInput);
    await repo.save(exec);
    expect(repo.getRevision(exec.id)).toBe(0);

    exec.transitionTo(ExecutionStatus.Validating);
    await repo.save(exec);
    expect(repo.getRevision(exec.id)).toBe(1);
  });

  it('rejects a save whose expectedRevision does not match the stored revision (ConcurrencyError)', async () => {
    const repo = new InMemoryExecutionRepository();
    const exec = Execution.create(baseInput);
    await repo.save(exec); // stored revision: 0

    exec.transitionTo(ExecutionStatus.Validating); // in-memory transitionHistory.length: 1
    await repo.save(exec, undefined, { expectedRevision: 0 }); // matches stored 0 -> accepted; stored revision is now 1

    // A second writer who last read the Execution when its stored revision
    // was still 0 (e.g. loaded before the transition above was persisted)
    // now attempts its own conditional save, still expecting revision 0.
    exec.transitionTo(ExecutionStatus.Queued); // in-memory transitionHistory.length: 2
    await expect(repo.save(exec, undefined, { expectedRevision: 0 })).rejects.toThrow(ConcurrencyError);
  });

  it('allows a save with no expectedRevision regardless of concurrent changes (opt-in check only)', async () => {
    const repo = new InMemoryExecutionRepository();
    const exec = Execution.create(baseInput);
    await repo.save(exec);
    exec.transitionTo(ExecutionStatus.Validating);
    await expect(repo.save(exec)).resolves.not.toThrow();
  });
});

describe('ExecutionCheckpointStore — checkpoint save/restore', () => {
  it('saves and loads the latest checkpoint by revision', async () => {
    const store = new InMemoryExecutionCheckpointStore();
    const exec = Execution.create(baseInput);

    await store.saveCheckpoint({
      executionId: exec.id.toString(),
      revision: 0,
      snapshot: toExecutionSnapshot(exec),
      createdAt: new Date(),
    });

    exec.transitionTo(ExecutionStatus.Validating);
    await store.saveCheckpoint({
      executionId: exec.id.toString(),
      revision: 1,
      snapshot: toExecutionSnapshot(exec),
      createdAt: new Date(),
    });

    const latest = await store.loadLatestCheckpoint(exec.id);
    expect(latest?.revision).toBe(1);
    expect(latest?.snapshot.status).toBe(ExecutionStatus.Validating);
  });

  it('returns undefined when no checkpoint exists for an Execution', async () => {
    const store = new InMemoryExecutionCheckpointStore();
    const exec = Execution.create(baseInput);
    expect(await store.loadLatestCheckpoint(exec.id)).toBeUndefined();
  });

  it('restoring a checkpoint reconstructs the exact Execution state at that revision', async () => {
    const store = new InMemoryExecutionCheckpointStore();
    const exec = driveThroughRunning();
    await store.saveCheckpoint({
      executionId: exec.id.toString(),
      revision: exec.transitionHistory.length,
      snapshot: toExecutionSnapshot(exec),
      createdAt: new Date(),
    });

    // Execution continues to a terminal state after the checkpoint was taken.
    exec.transitionTo(ExecutionStatus.Completed, { result: 'done' });

    const checkpoint = await store.loadLatestCheckpoint(exec.id);
    const restored = fromExecutionSnapshot(checkpoint!.snapshot);
    // The checkpoint reflects RUNNING (pre-completion), proving it's a real
    // historical point, not just an alias for "current state."
    expect(restored.status).toBe(ExecutionStatus.Running);
    expect(exec.status).toBe(ExecutionStatus.Completed);
  });
});

describe('replayExecution — deterministic replay proves ADR-040\'s claim', () => {
  it('replaying identity + transitionHistory alone reconstructs the exact final state', () => {
    const original = driveThroughRunning();
    original.transitionTo(ExecutionStatus.Waiting, { reason: 'paused' });
    original.transitionTo(ExecutionStatus.Running);
    original.transitionTo(ExecutionStatus.Completed, { result: { ok: true } });

    const replayed = replayExecution({
      id: original.id,
      kind: original.kind,
      tenantId: original.tenantId,
      workspaceId: original.workspaceId,
      userId: original.userId,
      traceId: original.traceId,
      correlationId: original.correlationId,
      parentExecutionId: original.parentExecutionId,
      metadata: original.metadata,
      transitionHistory: original.transitionHistory,
    });

    expect(replayed.status).toBe(original.status);
    expect(replayed.transitionHistory).toEqual(original.transitionHistory);
    expect(replayed.startedAt?.getTime()).toBe(original.startedAt?.getTime());
    expect(replayed.completedAt?.getTime()).toBe(original.completedAt?.getTime());
  });

  it('replays a failed lifecycle identically, including the required reason', () => {
    const original = driveThroughRunning();
    original.transitionTo(ExecutionStatus.Failed, { reason: 'transient network error' });

    const replayed = replayExecution({
      id: original.id,
      kind: original.kind,
      tenantId: original.tenantId,
      traceId: original.traceId,
      correlationId: original.correlationId,
      transitionHistory: original.transitionHistory,
    });

    expect(replayed.status).toBe(ExecutionStatus.Failed);
    expect(replayed.transitionHistory.at(-1)?.reason).toBe('transient network error');
  });

  it('replaying an Execution with no transitions yet returns it in CREATED status', () => {
    const original = Execution.create(baseInput);
    const replayed = replayExecution({
      id: original.id,
      kind: original.kind,
      tenantId: original.tenantId,
      traceId: original.traceId,
      correlationId: original.correlationId,
      transitionHistory: [],
    });
    expect(replayed.status).toBe(ExecutionStatus.Created);
  });
});

describe('Crash recovery — orchestrator resumes correctly from persisted state after a simulated restart', () => {
  it('a WAITING Execution loaded from a fresh repository instance can be resumed to completion', async () => {
    const repo = new InMemoryExecutionRepository();
    let providerCallCount = 0;
    const provider = makeFakeProvider(() => {
      providerCallCount += 1;
      return providerCallCount === 1 ? { outcome: 'waiting', reason: 'awaiting approval' } : { outcome: 'completed', result: 'approved' };
    });
    const orchestrator = new ExecutionOrchestrator(repo, provider);

    const execution = await orchestrator.run(baseInput);
    expect(execution.status).toBe(ExecutionStatus.Waiting);

    // Simulate "the process restarted": load the Execution back out of the
    // repository as a brand-new object graph (not the same in-memory
    // instance `run()` returned), the same way a real process would after
    // recovering from a crash.
    const rehydrated = await repo.findById(execution.id);
    expect(rehydrated).toBeDefined();
    expect(rehydrated).not.toBe(execution);
    expect(rehydrated!.status).toBe(ExecutionStatus.Waiting);
    expect(rehydrated!.transitionHistory).toEqual(execution.transitionHistory);

    const resumed = await orchestrator.resume(rehydrated!);
    expect(resumed.status).toBe(ExecutionStatus.Completed);

    const finalPersisted = await repo.findById(execution.id);
    expect(finalPersisted!.status).toBe(ExecutionStatus.Completed);
  });

  it('a persisted Execution\'s history alone (via replayExecution) matches what the repository independently persisted', async () => {
    const repo = new InMemoryExecutionRepository();
    const provider = makeFakeProvider({ outcome: 'completed', result: 'ok' });
    const orchestrator = new ExecutionOrchestrator(repo, provider);

    const execution = await orchestrator.run(baseInput);
    const persisted = await repo.findById(execution.id);

    const replayed = replayExecution({
      id: persisted!.id,
      kind: persisted!.kind,
      tenantId: persisted!.tenantId,
      workspaceId: persisted!.workspaceId,
      userId: persisted!.userId,
      traceId: persisted!.traceId,
      correlationId: persisted!.correlationId,
      transitionHistory: persisted!.transitionHistory,
    });

    expect(replayed.status).toBe(persisted!.status);
    expect(replayed.status).toBe(ExecutionStatus.Completed);
  });
});
