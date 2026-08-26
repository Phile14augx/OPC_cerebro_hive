/**
 * Failure classification — ADR 0009 (D4).
 *
 * ADR 0009 names this as the most easily botched part of the design, so it is
 * implemented as data and exhaustive matching rather than as scattered
 * `if (exitCode !== 0)` checks.
 *
 * The rule:
 *
 *   A tool exiting non-zero is a domain OUTCOME. The activity succeeded — it ran
 *   the tool, and the tool said no. Not retryable.
 *
 *   An INFRASTRUCTURE fault means the activity never got to find out what the
 *   tool would say. Retryable.
 *
 * Conflating them produces the worst available behaviour: Temporal retries a
 * 40-hour deterministic failure five times with backoff, burning six days of
 * compute to reach the same answer — while the engineer waits.
 *
 * The inverse error is quieter and worse: classifying an evicted pod as a domain
 * outcome marks a run failed when it should have retried, and the engineer
 * debugs a design problem that never existed.
 */

import type { ExecutionResult, InfraFailure } from '@cerebro/eda-execution';

/** What the workflow engine should do next. */
export type Disposition =
  | { readonly action: 'complete'; readonly outcome: 'success' }
  | { readonly action: 'complete'; readonly outcome: 'tool-rejected'; readonly exitCode: number }
  | { readonly action: 'retry'; readonly reason: InfraFailure; readonly attempt: number; readonly delayMs: number }
  | { readonly action: 'fail-permanently'; readonly reason: string };

export interface RetryPolicy {
  readonly maxAttempts: number;
  readonly initialIntervalMs: number;
  readonly backoffCoefficient: number;
  readonly maxIntervalMs: number;
  /** Jitter prevents a thundering herd when a backend recovers and 500 jobs retry at once. */
  readonly jitterFactor: number;
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 4,
  initialIntervalMs: 5_000,
  backoffCoefficient: 2,
  maxIntervalMs: 120_000,
  jitterFactor: 0.2,
};

/**
 * Infrastructure failures that are NOT worth retrying.
 *
 * `image-pull-failed` is usually a bad digest or a missing registry credential —
 * retrying cannot fix either, and doing so hides a configuration error behind
 * four minutes of backoff.
 *
 * `sandbox-unsupported-syscall` is deterministic: the same tool under the same
 * runtime will fail identically every time (ADR 0013). It needs a runtime change
 * or an exception grant, not another attempt.
 */
const NON_RETRYABLE_INFRA: ReadonlySet<InfraFailure> = new Set<InfraFailure>([
  'image-pull-failed',
  'sandbox-unsupported-syscall',
]);

export function computeDelayMs(policy: RetryPolicy, attempt: number, rand = Math.random): number {
  const raw = policy.initialIntervalMs * policy.backoffCoefficient ** Math.max(0, attempt - 1);
  const capped = Math.min(raw, policy.maxIntervalMs);
  const jitter = capped * policy.jitterFactor * (rand() * 2 - 1);
  return Math.max(0, Math.round(capped + jitter));
}

/**
 * The single decision point. Everything that decides whether to retry goes
 * through here, so the semantics cannot drift between call sites.
 */
export function classify(
  result: ExecutionResult,
  attempt: number,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY,
  rand: () => number = Math.random,
): Disposition {
  switch (result.kind) {
    case 'outcome':
      // The tool ran. Whatever it decided is the answer — including "no".
      return result.exitCode === 0
        ? { action: 'complete', outcome: 'success' }
        : { action: 'complete', outcome: 'tool-rejected', exitCode: result.exitCode };

    case 'infrastructure': {
      if (NON_RETRYABLE_INFRA.has(result.reason)) {
        return {
          action: 'fail-permanently',
          reason: `${result.reason} is deterministic; retrying cannot resolve it.`,
        };
      }
      if (attempt >= policy.maxAttempts) {
        return {
          action: 'fail-permanently',
          reason: `${result.reason} persisted across ${String(policy.maxAttempts)} attempts.`,
        };
      }
      return {
        action: 'retry',
        reason: result.reason,
        attempt: attempt + 1,
        delayMs: computeDelayMs(policy, attempt, rand),
      };
    }
      throw new Error(`Unrecognized ExecutionResult kind: ${String((result as { kind?: unknown }).kind)}`);
  }
}

/**
 * Guard for the boundary where adapters produce results.
 *
 * A backend adapter reporting a non-zero exit as `infrastructure` would silently
 * reintroduce the exact bug this module exists to prevent, and it would look
 * fine in review. Adapters call this on the way out.
 */
export function assertClassificationSound(result: ExecutionResult): void {
  if (result.kind === 'infrastructure' && 'exitCode' in result) {
    throw new Error(
      'An infrastructure failure must not carry a tool exit code. A tool that exited ' +
        'has run, which makes its result a domain outcome (ADR 0009).',
    );
  }
}
