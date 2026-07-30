import { ValidationError } from '../errors/DomainError';

/**
 * Phase 9a (HiveForge `09-EXECUTION-LIFECYCLE-RUNTIME.md`) — the canonical
 * execution identifier. Per that phase's governing invariant ("exactly one
 * canonical Execution aggregate... one execution ID"), this is the ONLY
 * identifier an execution-producing subsystem (agent, workflow, tool,
 * evaluation, scheduler, or anything built later) should mint or reference
 * for "which execution is this."
 *
 * Deliberately NOT a domain-model `Identifier<Brand>` (packages/domain-model's
 * branded-string mechanism) — `packages/domain` and `packages/domain-model`
 * are different bounded contexts with no dependency between them today (see
 * packages/domain-model/README.md's own non-goals), and introducing that
 * dependency for one type is an architectural decision bigger than this
 * aggregate warrants on its own; it belongs in `ADR-039` if it's made at all,
 * not decided silently here. Instead this is a small, self-contained value
 * object in this package's own existing style (plain classes — see
 * `DomainError`, `Result` — not branded primitives).
 */
export class ExecutionId {
  private constructor(public readonly value: string) {}

  /** Constructs from an existing, already-known-valid id string (e.g. loaded
   * from persistence). Throws if empty/whitespace-only — an Execution can
   * never exist without a real identity. */
  static of(value: string): ExecutionId {
    if (!value || value.trim().length === 0) {
      throw new ValidationError('ExecutionId must be a non-empty string.');
    }
    return new ExecutionId(value);
  }

  /** Generates a fresh id for a brand-new Execution. Uses the same
   * crypto.randomUUID-with-fallback approach `DomainEvent` already uses in
   * this package, for consistency rather than introducing a second
   * ID-generation strategy. */
  static generate(): ExecutionId {
    const value =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(36) + Math.random().toString(36).substring(2);
    return new ExecutionId(value);
  }

  equals(other: ExecutionId): boolean {
    return other instanceof ExecutionId && other.value === this.value;
  }

  toString(): string {
    return this.value;
  }
}
