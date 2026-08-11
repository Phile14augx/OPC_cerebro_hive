import type { OperationId, ResourceId, ProviderId } from '../ids/ids';
import type { ResourceLifecycleState } from '../enums/ResourceLifecycleState';
import type { HiveProviderError } from './HiveProviderErrorCode';

/**
 * The kind of lifecycle call that produced this Operation — mirrors
 * `HiveProviderExecutor`'s method names 1:1 (ADR-020 §Decision), so a
 * caller can always tell which executor call an Operation resulted from
 * without inspecting `configuration`/request payloads.
 */
export const HiveProviderOperationKind = {
  Provision: 'Provision',
  Update: 'Update',
  Resize: 'Resize',
  Delete: 'Delete',
  Snapshot: 'Snapshot',
  Restore: 'Restore',
} as const;

export type HiveProviderOperationKind =
  (typeof HiveProviderOperationKind)[keyof typeof HiveProviderOperationKind];

/**
 * The return type of every `HiveProviderExecutor` lifecycle method (ADR-020
 * §Decision: `provision`/`update`/`resize`/`delete`/`snapshot`/`restore`
 * each return an `Operation`). Per `03-CONTROL-PLANE.md` §4: an Operation is
 * created in `Requested` state synchronously, before any provider call is
 * dispatched — the caller always gets an Operation id immediately, never
 * blocks on provider latency. This package fixes only the shape; creation,
 * persistence, polling, and state-transition orchestration are
 * `OperationTracker`/`ResourceStateManager` (control-plane) concerns, not
 * implemented here.
 *
 * Named `HiveProviderOperation` (Hive-prefixed, consistent with this
 * package's disambiguation convention) rather than a bare `Operation` —
 * no colliding `Operation` type was found elsewhere in the repository
 * during this slice's inventory, but the prefix is kept for consistency
 * with every other Slice 2-4 contract in this package.
 */
export interface HiveProviderOperation {
  readonly id: OperationId;
  readonly kind: HiveProviderOperationKind;
  readonly providerId: ProviderId;
  readonly resourceId?: ResourceId;
  readonly state: ResourceLifecycleState;
  /** Per `03-CONTROL-PLANE.md` §3b — set only for caller-supplied
   * idempotent commands; absent for non-idempotent submissions. */
  readonly idempotencyKey?: string;
  /** Populated only once `state` reaches a terminal-failure state; per
   * ADR-027, retry/terminal classification is derived from
   * `HiveProviderError.retryable`, not re-inspected from this field by
   * control-plane logic. */
  readonly error?: HiveProviderError;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
