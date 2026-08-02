import { ExecutionId } from './ExecutionId';

/**
 * Phase 9f-2 — duplicate-command detection for `ExecutionOrchestrator.runIdempotent()`.
 * A real, previously-unused `DomainError` already existed for this exact
 * purpose (`DuplicateCommandError` in `DomainError.ts`) — reused here rather
 * than inventing a parallel error, same "reuse before invention" discipline
 * `ExecutionAuthorizationPolicy.ts` already applied to `AuthorizationError`.
 *
 * SCOPE BOUNDARY: this is single-process, in-memory duplicate detection by
 * default — a real distributed deployment (multiple `apps/platform-api`
 * instances) would need a shared store (Redis, a database unique
 * constraint) behind this same contract; building that store is explicitly
 * Phase 9g's job, not this one's. The contract is designed so a real
 * implementation is a drop-in: `reserve()` must be atomic (check-and-set),
 * which is exactly what a `SET key value NX` (Redis) or a unique-constraint
 * insert (SQL) already gives you.
 */
export interface ExecutionIdempotencyRecord {
  readonly executionId: ExecutionId;
}

export interface ExecutionIdempotencyStore {
  /**
   * Atomically reserves `key` for `executionId` if the key is not already
   * held by a different Execution. Returns the record that now owns the
   * key — either the one just reserved (its `executionId` equals the
   * `executionId` argument) or a pre-existing one (a real duplicate; the
   * caller must compare, not assume success).
   */
  reserve(key: string, executionId: ExecutionId): Promise<ExecutionIdempotencyRecord>;
}

/** The real, explicit default `ExecutionOrchestrator` uses when no store is
 * supplied — every reservation always succeeds, meaning duplicate detection
 * is not enforced. Named and visible, not a silent absence of a check, same
 * pattern as `AllowAllExecutionAuthorizationPolicy` (`ADR-044`). */
export class NoOpExecutionIdempotencyStore implements ExecutionIdempotencyStore {
  async reserve(_key: string, executionId: ExecutionId): Promise<ExecutionIdempotencyRecord> {
    return { executionId };
  }
}

/** Standalone, in-memory reference implementation — real check-and-set
 * semantics (not a test double), same status as `InMemoryExecutionRepository.ts`:
 * a genuine, usable implementation for single-process deployments and
 * tests, not disposable scaffolding. */
export class InMemoryExecutionIdempotencyStore implements ExecutionIdempotencyStore {
  private readonly keys = new Map<string, ExecutionId>();

  async reserve(key: string, executionId: ExecutionId): Promise<ExecutionIdempotencyRecord> {
    const existing = this.keys.get(key);
    if (existing) {
      return { executionId: existing };
    }
    this.keys.set(key, executionId);
    return { executionId };
  }
}
