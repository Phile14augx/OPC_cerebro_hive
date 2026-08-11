import type { HiveCapabilityProvider } from '../capability/HiveCapabilityProvider';
import type { HiveRegion } from './HiveRegion';
import type { HiveResourceTypeDescriptor } from './HiveResourceTypeDescriptor';
import type { HiveProviderQuota } from './HiveProviderQuota';

/**
 * ADR-020's `ProviderMetadata` (amended, Phase 4) / `04-PROVIDER-FRAMEWORK.md`
 * §1-2. Read-only, cacheable — `ProviderSelector` (control-plane, per
 * `03-CONTROL-PLANE.md` §3) consults cached `HiveProviderMetadata`, never a
 * live provider call, for every selection decision. This interface performs
 * no execution of any kind; see `HiveProviderExecutor` for the operational
 * half of the split.
 *
 * Deliberately extends `HiveCapabilityProvider` (Slice 2) rather than
 * redefining capability declaration — `HiveCapabilityProvider.describeCapabilities()`
 * already anticipated this exact composition (see that type's own doc
 * comment: "Slice 4 is expected to have ProviderMetadata compose or extend
 * this, not redefine capability declaration from scratch").
 */
export interface HiveProviderMetadata extends HiveCapabilityProvider {
  listRegions(): Promise<readonly HiveRegion[]>;
  listResourceTypes(): Promise<readonly HiveResourceTypeDescriptor[]>;
  getQuotas(): Promise<readonly HiveProviderQuota[]>;
}
