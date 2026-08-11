/**
 * Phase 9a's unified status vocabulary — one of the six representations
 * `audit/SLICE-5-EXECUTION-LIFECYCLE-REVIEW.md` found (`packages/database`'s
 * plain, unconstrained strings; `packages/db`'s real-but-unreachable
 * `ExecutionStatus` enum: QUEUED/RUNNING/WAITING_FOR_HUMAN/COMPLETED/FAILED/
 * TIMEOUT/CANCELLED; three more elsewhere) is replaced by exactly this one,
 * per Phase 9's governing invariant.
 *
 * This vocabulary is deliberately a superset of `packages/db`'s (reused
 * rather than reinvented, per the phase doc's own "reuse before invention"
 * note about that stranded-but-well-designed enum) plus `CREATED`/
 * `VALIDATING`/`CANCELLING` from the 9b lifecycle diagram, so 9a's vocabulary
 * doesn't need a breaking change once 9b's state machine is built on top of
 * it.
 *
 * IMPORTANT — scope boundary: this file fixes the vocabulary only — which
 * values exist. Which transitions between them are legal is fixed
 * separately, in `ExecutionTransitions.ts` (Phase 9b, `ADR-040`), and
 * enforced by `Execution.transitionTo()` (see `Execution.ts`). Keeping the
 * vocabulary and the transition graph in separate files/PRs is deliberate —
 * ADR-039 fixed this vocabulary before ADR-040 fixed the graph, and a future
 * change to one should not require re-litigating the other.
 */
export const ExecutionStatus = {
  Created: 'CREATED',
  Validating: 'VALIDATING',
  Queued: 'QUEUED',
  Running: 'RUNNING',
  Waiting: 'WAITING',
  Cancelling: 'CANCELLING',
  Completed: 'COMPLETED',
  Failed: 'FAILED',
  Cancelled: 'CANCELLED',
  TimedOut: 'TIMED_OUT',
} as const;

export type ExecutionStatus = (typeof ExecutionStatus)[keyof typeof ExecutionStatus];

/** Statuses from which no further transition is possible. Provided here as a
 * simple fact about the vocabulary (useful to callers and to 9b's future
 * transition table alike) — not itself a transition-legality mechanism. */
export const TERMINAL_EXECUTION_STATUSES: ReadonlySet<ExecutionStatus> = new Set([
  ExecutionStatus.Completed,
  ExecutionStatus.Failed,
  ExecutionStatus.Cancelled,
  ExecutionStatus.TimedOut,
]);

export function isTerminalExecutionStatus(status: ExecutionStatus): boolean {
  return TERMINAL_EXECUTION_STATUSES.has(status);
}
