import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionLeaseManager, ExecutionLease } from '../ExecutionLeaseManager';

// A mock in-memory store simulating lease DB
class MockLeaseStore implements ExecutionLeaseManager {
  private leases = new Map<string, ExecutionLease>();
  private nextFencingToken = 1n;

  async registerWorker(workerId: string, metadata: any): Promise<void> {}
  async heartbeatWorker(workerId: string): Promise<void> {}

  async acquireLease(executionId: string, ownerId: string, durationMs: number): Promise<ExecutionLease | null> {
    const existing = this.leases.get(executionId);
    if (existing && existing.expiresAt.getTime() > Date.now()) {
      return null; // Already leased
    }
    const token = this.nextFencingToken++;
    const lease: ExecutionLease = {
      executionId,
      ownerId,
      fencingToken: token,
      expiresAt: new Date(Date.now() + durationMs)
    };
    this.leases.set(executionId, lease);
    return lease;
  }

  async renewLease(executionId: string, ownerId: string, currentFencingToken: bigint, durationMs: number): Promise<ExecutionLease | null> {
    const existing = this.leases.get(executionId);
    if (!existing || existing.ownerId !== ownerId || existing.fencingToken !== currentFencingToken) {
      return null; // Stolen or invalid
    }
    const token = this.nextFencingToken++;
    const lease: ExecutionLease = {
      executionId,
      ownerId,
      fencingToken: token,
      expiresAt: new Date(Date.now() + durationMs)
    };
    this.leases.set(executionId, lease);
    return lease;
  }

  async releaseLease(executionId: string, ownerId: string): Promise<void> {
    const existing = this.leases.get(executionId);
    if (existing && existing.ownerId === ownerId) {
      this.leases.delete(executionId);
    }
  }
}

describe('ExecutionLeaseManager Stress & Contention', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should monotonically increase fencing tokens on lease theft', async () => {
    const leaseManager = new MockLeaseStore();
    const execId = 'exec-1';

    // Worker A acquires lease
    const leaseA = await leaseManager.acquireLease(execId, 'worker-A', 5000);
    expect(leaseA).not.toBeNull();
    expect(leaseA!.fencingToken).toBe(1n);

    // Worker B tries to acquire - fails
    const leaseB_fail = await leaseManager.acquireLease(execId, 'worker-B', 5000);
    expect(leaseB_fail).toBeNull();

    // Time passes, lease expires
    vi.advanceTimersByTime(5001);

    // Worker B steals lease
    const leaseB = await leaseManager.acquireLease(execId, 'worker-B', 5000);
    expect(leaseB).not.toBeNull();
    expect(leaseB!.fencingToken).toBe(2n);

    // Worker A tries to renew with stale token 1n - fails (split brain prevented)
    const renewedA = await leaseManager.renewLease(execId, 'worker-A', 1n, 5000);
    expect(renewedA).toBeNull();
  });
});
