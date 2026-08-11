import { Execution } from './Execution';
import { ExecutionStatus } from './ExecutionStatus';

/**
 * Phase 9f-2 — a failure taxonomy answering "was this failure worth
 * retrying?", the missing piece `ExecutionRetryPolicy.ts`'s `shouldRetry()`
 * needs to make that call. Deliberately NOT stored on the `Execution`
 * aggregate itself (no new field on `ExecutionTransitionRecord`/`ExecutionProps`)
 * — classification is a judgment call about a failure *reason string*,
 * re-derivable at any time from what's already persisted
 * (`transitionHistory`), not new structural state the aggregate itself needs
 * to carry. This keeps `Execution.ts` exactly as `ADR-039`/`ADR-041`/`ADR-044`
 * already scoped it.
 */
export type ExecutionFailureClass = 'transient' | 'permanent' | 'unknown';

export interface ExecutionFailureClassifier {
  classify(execution: Execution): ExecutionFailureClass;
}

/**
 * A real, usable default classifier — not a stub. TIMED_OUT is always
 * classified `'transient'` (a deadline being too short says nothing about
 * whether the underlying work is fundamentally impossible). FAILED is
 * classified by matching the most recent transition's `reason` string
 * against a fixed set of transient-failure patterns (connection/network/
 * timeout/rate-limit/unavailable language); anything else is `'permanent'`
 * (the conservative default — an unrecognized failure reason is not assumed
 * safe to retry). Any non-failed, non-timed-out status is `'unknown'`
 * (there is no failure to classify yet).
 */
export class DefaultExecutionFailureClassifier implements ExecutionFailureClassifier {
  private static readonly TRANSIENT_PATTERNS: readonly RegExp[] = [
    /timeout/i,
    /timed out/i,
    /connection/i,
    /network/i,
    /unavailable/i,
    /rate limit/i,
    /throttl/i,
    /ECONNRESET/i,
    /ETIMEDOUT/i,
    /temporarily/i,
  ];

  classify(execution: Execution): ExecutionFailureClass {
    if (execution.status === ExecutionStatus.TimedOut) {
      return 'transient';
    }
    if (execution.status !== ExecutionStatus.Failed) {
      return 'unknown';
    }
    const reason = execution.transitionHistory.at(-1)?.reason ?? '';
    return DefaultExecutionFailureClassifier.TRANSIENT_PATTERNS.some((pattern) => pattern.test(reason))
      ? 'transient'
      : 'permanent';
  }
}
