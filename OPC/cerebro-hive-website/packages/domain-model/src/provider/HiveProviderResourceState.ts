import type { ResourceId } from '../ids/ids';
import type { ResourceLifecycleState } from '../enums/ResourceLifecycleState';

/**
 * The return type of `HiveProviderExecutor.status()` (ADR-020 §Decision).
 * Distinct from `HiveProviderOperation` — this describes a Resource's
 * *current* state as observed directly from the provider (a query, "still
 * hits the real API," per `04-PROVIDER-FRAMEWORK.md` §Execution contract),
 * not the record of a specific lifecycle call.
 *
 * `providerRawState` is kept only for diagnostics — per
 * `04-PROVIDER-FRAMEWORK.md` §2 ("Lifecycle-state support"), some providers
 * may not support every state in ADR-022's shared machine (e.g. only a
 * binary up/down signal); `lifecycleState` is always this package's
 * normalized `ResourceLifecycleState`, never a provider-specific string
 * leaking into control-plane logic — the same normalization discipline
 * `HiveProviderErrorCode` applies to failures.
 */
export interface HiveProviderResourceState {
  readonly resourceId: ResourceId;
  readonly lifecycleState: ResourceLifecycleState;
  readonly providerRawState?: string;
  readonly observedAt: Date;
}
