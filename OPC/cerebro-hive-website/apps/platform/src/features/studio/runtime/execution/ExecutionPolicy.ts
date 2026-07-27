/**
 * M24 — ExecutionPolicy
 *
 * Every node executes under a policy. Policies are resolved from:
 *   1. Node-level configuration  (highest priority)
 *   2. Stage-level defaults
 *   3. Global execution defaults (lowest priority)
 */

export interface RetryPolicy {
  maxAttempts: number;
  backoffMs: number;
  backoffMultiplier: number;
  retryableCategories: string[];
}

export interface CachePolicy {
  enabled: boolean;
  ttlMs: number;
  keyStrategy: 'input-hash' | 'node-id' | 'custom';
}

export type FailureStrategy = 'Fail' | 'Skip' | 'UseDefault' | 'Retry';

export interface ExecutionPolicy {
  /** Max wall-clock time allowed for this node (ms). */
  timeoutMs: number;
  /** Retry behaviour on recoverable errors. */
  retry: RetryPolicy;
  /** Output caching. */
  cache: CachePolicy;
  /** Max parallel instances (1 = sequential, -1 = unlimited). */
  concurrencyLimit: number;
  /** Scheduling priority (higher = sooner). */
  priority: number;
  /** Hard token budget for LLM nodes. */
  maxTokens?: number;
  /** Hard USD cost budget for this node. */
  maxCostUsd?: number;
  /** Requires human sign-off before execution. */
  approvalRequired: boolean;
  /** What to do on unrecoverable failure. */
  failureStrategy: FailureStrategy;
}

export const DEFAULT_EXECUTION_POLICY: ExecutionPolicy = {
  timeoutMs: 30_000,
  retry: {
    maxAttempts: 1,
    backoffMs: 500,
    backoffMultiplier: 2,
    retryableCategories: ['ProviderError'],
  },
  cache: { enabled: false, ttlMs: 0, keyStrategy: 'input-hash' },
  concurrencyLimit: 1,
  priority: 0,
  approvalRequired: false,
  failureStrategy: 'Fail',
};

export function resolvePolicy(nodePolicy?: Partial<ExecutionPolicy>): ExecutionPolicy {
  return { ...DEFAULT_EXECUTION_POLICY, ...nodePolicy };
}
