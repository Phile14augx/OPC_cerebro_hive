/**
 * A distributed lease that provides a monotonic fencing token to prevent split-brain writes.
 */
export interface ExecutionLease {
  readonly executionId: string;
  readonly ownerId: string;
  readonly expiresAt: Date;
  /**
   * The fencing token. Monotonically increases every time the lease is acquired or stolen.
   * MUST be passed to the EventStore on all writes.
   */
  readonly fencingToken: bigint;
}

export interface ExecutionLeaseManager {
  /**
   * Registers a worker in the system, returning a workerId.
   */
  registerWorker(workerId: string, metadata: unknown): Promise<void>;

  /**
   * Heartbeats a worker to prevent its leases from being reclaimed.
   */
  heartbeatWorker(workerId: string): Promise<void>;

  /**
   * Attempts to acquire an exclusive lock on an execution.
   * If successful, returns the lease containing the monotonic fencing token.
   * If already leased by a healthy worker, returns null.
   */
  acquireLease(executionId: string, ownerId: string, durationMs: number): Promise<ExecutionLease | null>;

  /**
   * Renews an existing lease. Uses optimistic concurrency to ensure the 
   * lease hasn't been stolen or expired.
   */
  renewLease(executionId: string, ownerId: string, currentFencingToken: bigint, durationMs: number): Promise<ExecutionLease | null>;

  /**
   * Releases a lease explicitly, allowing other workers to acquire it immediately.
   */
  releaseLease(executionId: string, ownerId: string): Promise<void>;
}
