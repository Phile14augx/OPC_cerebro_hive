import { ExecutionId } from './ExecutionId';
import { ConflictError } from '../errors/DomainError';
import { Clock, SystemClock } from './Clock';

/**
 * Phase 9f-2 — execution ownership via time-bounded leases, the shape
 * proposed when 9f's scope was first raised:
 * ```
 * LeaseStore
 * ├── acquire()
 * ├── renew()
 * ├── release()
 * └── expire()
 * ```
 * (`expire()` is not a separate method here — a lease expires simply by its
 * `expiresAt` passing, checked against an injected `Clock`, the same
 * deterministic-testability seam `ADR-044`/9f-1 already established for
 * timeout. There is nothing to separately "call" for expiry to take effect.)
 *
 * This contract specifies what `acquire`/`renew`/`release` MEAN and the
 * invariants they must satisfy — not whether a real implementation is
 * backed by Redis, PostgreSQL, etcd, or (as here) an in-memory `Map`. A
 * distributed backing store is explicitly Phase 9g's job.
 *
 * Reuses the existing `ConflictError` (`DomainError.ts`, previously
 * unused in this package) for "someone else already holds this lease" —
 * same reuse-before-invention discipline as `ExecutionIdempotency.ts`'s
 * `DuplicateCommandError`.
 */
export interface ExecutionLease {
  readonly executionId: ExecutionId;
  readonly owner: string;
  readonly expiresAt: Date;
}

export interface ExecutionLeaseStore {
  /** Acquires a lease on `executionId` for `owner`, valid for `durationMs`
   * from now. Succeeds if no lease currently exists, the existing lease has
   * expired, or `owner` already holds it (re-acquiring is idempotent — it
   * simply extends the lease, the same as `renew()` would). Throws
   * `ConflictError` if a *different*, still-valid owner holds it. */
  acquire(executionId: ExecutionId, owner: string, durationMs: number): Promise<ExecutionLease>;

  /** Extends a lease `owner` already holds. Throws `ConflictError` if
   * `owner` does not currently hold a valid (unexpired) lease on
   * `executionId` — renewing a lease you don't hold is not a valid
   * operation to silently no-op, unlike `release()` below. */
  renew(executionId: ExecutionId, owner: string, durationMs: number): Promise<ExecutionLease>;

  /** Releases a lease `owner` holds. A no-op (not an error) if `owner`
   * doesn't currently hold one — mirrors `ExecutionOrchestrator.requestCancellation()`'s
   * "already-terminal is a no-op" precedent (`ADR-044`): releasing something
   * that's already gone is not itself a failure. */
  release(executionId: ExecutionId, owner: string): Promise<void>;

  /** Returns the current lease if one exists and has not expired;
   * `undefined` otherwise (absent or expired — both look the same to a
   * caller asking "is anyone allowed to be working on this right now"). */
  currentLease(executionId: ExecutionId): Promise<ExecutionLease | undefined>;
}

/** Standalone, in-memory reference implementation — real acquire/renew/
 * release/expiry semantics against an injected `Clock` (default:
 * `SystemClock`, matching `ADR-044`'s own pattern), not a test double. */
export class InMemoryExecutionLeaseStore implements ExecutionLeaseStore {
  private readonly leases = new Map<string, ExecutionLease>();

  constructor(private readonly clock: Clock = new SystemClock()) {}

  async acquire(executionId: ExecutionId, owner: string, durationMs: number): Promise<ExecutionLease> {
    const key = executionId.toString();
    const existing = this.leases.get(key);
    const now = this.clock.now();

    if (existing && existing.owner !== owner && existing.expiresAt.getTime() > now.getTime()) {
      throw new ConflictError(
        `Execution ${key} is already leased by "${existing.owner}" until ${existing.expiresAt.toISOString()}.`
      );
    }

    const lease: ExecutionLease = { executionId, owner, expiresAt: new Date(now.getTime() + durationMs) };
    this.leases.set(key, lease);
    return lease;
  }

  async renew(executionId: ExecutionId, owner: string, durationMs: number): Promise<ExecutionLease> {
    const key = executionId.toString();
    const existing = this.leases.get(key);
    const now = this.clock.now();

    if (!existing || existing.owner !== owner || existing.expiresAt.getTime() <= now.getTime()) {
      throw new ConflictError(`"${owner}" does not currently hold a valid lease on Execution ${key} to renew.`);
    }

    const renewed: ExecutionLease = { ...existing, expiresAt: new Date(now.getTime() + durationMs) };
    this.leases.set(key, renewed);
    return renewed;
  }

  async release(executionId: ExecutionId, owner: string): Promise<void> {
    const key = executionId.toString();
    const existing = this.leases.get(key);
    if (existing && existing.owner === owner) {
      this.leases.delete(key);
    }
  }

  async currentLease(executionId: ExecutionId): Promise<ExecutionLease | undefined> {
    const existing = this.leases.get(executionId.toString());
    if (existing && existing.expiresAt.getTime() > this.clock.now().getTime()) {
      return existing;
    }
    return undefined;
  }
}
