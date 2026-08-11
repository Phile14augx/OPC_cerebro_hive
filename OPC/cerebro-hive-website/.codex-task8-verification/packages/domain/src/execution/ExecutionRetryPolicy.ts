import { Execution } from './Execution';
import { ExecutionFailureClass } from './ExecutionFailureClassification';

/**
 * Phase 9f-2 — "should this terminal Execution actually be retried?", the
 * decision `ExecutionOrchestrator.retryIfEligible()` delegates to a real,
 * injected policy rather than making every caller re-derive it inline.
 * `attempt` is supplied by the caller (a scheduler, a future 9g worker
 * loop), not derived internally — `Execution`'s own `childExecutionIds`
 * mixes strict-child and retry-child uses (`ADR-039`'s own distinction
 * between `childExecutionIds` and `contributorExecutionIds` does not
 * further distinguish "child because retried" from "child because it's a
 * workflow step"), so counting retries by walking that array would silently
 * miscount whenever both uses are mixed on the same Execution. Requiring the
 * caller to track and pass `attempt` explicitly is honest about that
 * limitation rather than papering over it with a plausible-looking but
 * fragile derivation.
 */
export interface ExecutionRetryDecisionContext {
  readonly execution: Execution;
  readonly failureClass: ExecutionFailureClass;
  readonly attempt: number;
}

export interface ExecutionRetryPolicy {
  shouldRetry(context: ExecutionRetryDecisionContext): boolean;
  /** Optional — how long to wait before the next retry attempt. Not
   * enforced by `ExecutionOrchestrator` itself (no scheduler exists in this
   * standalone phase to actually wait and re-invoke); exposed for a future
   * caller (Phase 9g) that does have one. */
  retryDelayMs?(context: ExecutionRetryDecisionContext): number;
}

/** The real, explicit default `ExecutionOrchestrator` uses when no policy is
 * supplied — never auto-retries. Matches every existing caller's current,
 * unchanged behavior (nothing today calls `retry()` automatically), and
 * "never" is the conservative, safe default for a decision with real
 * consequences (an unbounded or inappropriate auto-retry loop), unlike
 * `AllowAllExecutionAuthorizationPolicy`'s permissive default, which was
 * safe to default to *because* it matched pre-existing unchecked behavior
 * exactly. Named and visible, not a silent absence of retry logic. */
export class NeverRetryPolicy implements ExecutionRetryPolicy {
  shouldRetry(): boolean {
    return false;
  }
}

/** A real, usable policy: retry only classified-`'transient'` failures, up
 * to `maxAttempts` total attempts (the original attempt counts as attempt
 * 1; `attempt` passed in is the attempt number that just failed). */
export class MaxAttemptsRetryPolicy implements ExecutionRetryPolicy {
  constructor(private readonly maxAttempts: number = 3) {}

  shouldRetry(context: ExecutionRetryDecisionContext): boolean {
    return context.failureClass === 'transient' && context.attempt < this.maxAttempts;
  }
}
