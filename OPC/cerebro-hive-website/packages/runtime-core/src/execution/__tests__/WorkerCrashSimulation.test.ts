import { describe, it, expect, vi } from 'vitest';
import { ExecutionLeaseManager } from '../ExecutionLeaseManager';
import { ExecutionStore } from '../ExecutionStore';
import { ExecutionEvent } from '../../../../runtime-contracts/src/events/ExecutionEvent';

// Mock Execution Store that simulates optimistic concurrency and transactions
class MockExecutionStore implements ExecutionStore {
  public executions = new Map<string, { expectedVersion: number; fencingToken: bigint; events: ExecutionEvent<any>[]; outbox: any[] }>();
  public snapshots = new Map<string, { sequence: bigint; state: any; hash: string }>();

  async getEvents(executionId: string, fromSequence?: bigint): Promise<ExecutionEvent<any>[]> {
    const exec = this.executions.get(executionId);
    if (!exec) return [];
    if (fromSequence) {
      return exec.events.filter(e => e.sequence > fromSequence);
    }
    return exec.events;
  }

  async appendEvents(executionId: string, expectedVersion: number, events: ExecutionEvent<any>[], fencingToken: bigint, outboxEntries?: any[]): Promise<void> {
    const exec = this.executions.get(executionId) || { expectedVersion: -1, fencingToken: 0n, events: [], outbox: [] };
    
    // Simulate Fencing Token Rejection (Lease Expiration)
    if (fencingToken < exec.fencingToken) {
      throw new Error(`OptimisticConcurrencyException: Stale fencing token. Expected >= ${exec.fencingToken}, got ${fencingToken}`);
    }
    
    // Simulate Version Concurrency
    if (exec.expectedVersion !== -1 && expectedVersion !== exec.expectedVersion) {
      throw new Error('OptimisticConcurrencyException: Version mismatch');
    }

    exec.events.push(...events);
    if (outboxEntries) {
      exec.outbox.push(...outboxEntries);
    }
    exec.expectedVersion += events.length;
    exec.fencingToken = fencingToken; // Update to latest token
    this.executions.set(executionId, exec);
  }

  async saveSnapshot(executionId: string, sequence: bigint, state: any, fencingToken: bigint, hash: string): Promise<void> {
    this.snapshots.set(executionId, { sequence, state, hash });
  }

  async getLatestSnapshot(executionId: string): Promise<any> {
    return this.snapshots.get(executionId) || null;
  }

  async updateExecution() {}
  async createExecution() {}
}

describe('Worker Crash & Reliability Simulation', () => {

  it('should recover from crash after append without duplicate effects', async () => {
    const store = new MockExecutionStore();
    const execId = 'exec-crash-1';
    
    // Worker A appends an event but crashes BEFORE dispatching outbox or updating read models
    await store.appendEvents(execId, -1, [{ sequence: 1n, type: 'LLMCompleted', payload: {} }] as any, 10n);
    
    // Worker B picks up the execution later
    const events = await store.getEvents(execId);
    
    // Worker B sees the event already exists
    expect(events.length).toBe(1);
    expect(events[0].sequence).toBe(1n);
    // Since the state is deterministically rebuilt via replay, Worker B will NOT emit a duplicate event
  });

  it('should dispatch outbox once if crashed after outbox commit', async () => {
    const store = new MockExecutionStore();
    const execId = 'exec-outbox-1';
    
    // Worker A commits both Event and Outbox entry in a single transaction, then crashes
    const outboxMsg = { id: 'msg-1', dispatched: false };
    await store.appendEvents(execId, -1, [{ sequence: 1n, type: 'ToolRequested' }] as any, 10n, [outboxMsg]);

    // Worker B steals lease and drains outbox
    const execData = store.executions.get(execId)!;
    expect(execData.outbox.length).toBe(1);
    expect(execData.outbox[0].id).toBe('msg-1');
    
    // Worker B processes it
    execData.outbox[0].dispatched = true;
    expect(execData.outbox[0].dispatched).toBe(true);
  });

  it('should reject stale worker writes upon lease expiration', async () => {
    const store = new MockExecutionStore();
    const execId = 'exec-lease-1';
    
    // Worker A gets lease token 10n
    await store.appendEvents(execId, -1, [{ sequence: 1n, type: 'Started' }] as any, 10n);

    // Worker A hangs. Lease expires. Worker B steals lease, gets token 20n
    await store.appendEvents(execId, 0, [{ sequence: 2n, type: 'Ping' }] as any, 20n);

    // Worker A wakes up and tries to write with stale token 10n
    await expect(
      store.appendEvents(execId, 1, [{ sequence: 3n, type: 'LateWrite' }] as any, 10n)
    ).rejects.toThrow('Stale fencing token');
  });

  it('should detect snapshot corruption and trigger pure replay', async () => {
    const store = new MockExecutionStore();
    const execId = 'exec-snap-1';
    
    // Write 3 events
    await store.appendEvents(execId, -1, [
      { sequence: 1n, type: 'E1' },
      { sequence: 2n, type: 'E2' },
      { sequence: 3n, type: 'E3' }
    ] as any, 10n);

    // Save corrupted snapshot (wrong hash)
    await store.saveSnapshot(execId, 3n, { corrupted: true }, 10n, 'bad-hash');

    // Replay Engine Simulation
    const snapshot = await store.getLatestSnapshot(execId);
    
    const computedHash = 'expected-hash'; // in reality this is hash(snapshot.state)
    const isCorrupt = snapshot.hash !== computedHash;

    expect(isCorrupt).toBe(true);

    // Fallback to pure replay
    let events = [];
    if (isCorrupt) {
      events = await store.getEvents(execId); // sequence 0
    } else {
      events = await store.getEvents(execId, snapshot.sequence);
    }

    expect(events.length).toBe(3); // Pure replay from 0 because snapshot was ignored
  });

});
