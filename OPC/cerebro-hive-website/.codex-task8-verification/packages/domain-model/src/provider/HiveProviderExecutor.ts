import type { ResourceId } from '../ids/ids';
import type { HiveResourceSpec, HiveResourceResizeSpec, HiveResourceUpdateSpec } from './HiveResourceSpec';
import type { HiveProviderOperation } from './HiveProviderOperation';
import type { HiveProviderResourceState } from './HiveProviderResourceState';

/**
 * ADR-020's `ProviderExecutor` (amended, Phase 4) / `04-PROVIDER-FRAMEWORK.md`
 * §1/§3. The only one of the three provider roles (`ProviderSelector`,
 * `HiveProviderMetadata`, `HiveProviderExecutor`) that actually calls a
 * provider's real API — every method here is expected to be an I/O call,
 * unlike `HiveProviderMetadata`'s cached discovery contract.
 *
 * Scoped exclusively to lifecycle operations, per `04-PROVIDER-FRAMEWORK.md`
 * §3: this interface explicitly does not own policy, billing, orchestration,
 * auditing, or provider selection — those remain control-plane concerns
 * (`03-CONTROL-PLANE.md`'s responsibility matrix). An implementation that
 * reaches into policy or billing logic is out of bounds, the same
 * misdrawn-boundary defect `ADR-007` retired for contributors.
 *
 * Every failure must be classified and normalized onto `HiveProviderErrorCode`
 * before it reaches `OperationTracker` (ADR-027) — reflected here as
 * `HiveProviderOperation.error`, never a thrown provider-specific exception
 * type that this interface would have to declare.
 */
export interface HiveProviderExecutor {
  provision(spec: HiveResourceSpec): Promise<HiveProviderOperation>;
  update(resourceId: ResourceId, changes: HiveResourceUpdateSpec): Promise<HiveProviderOperation>;
  resize(resourceId: ResourceId, spec: HiveResourceResizeSpec): Promise<HiveProviderOperation>;
  delete(resourceId: ResourceId): Promise<HiveProviderOperation>;
  snapshot(resourceId: ResourceId): Promise<HiveProviderOperation>;
  restore(snapshotId: ResourceId): Promise<HiveProviderOperation>;
  status(resourceId: ResourceId): Promise<HiveProviderResourceState>;
}
