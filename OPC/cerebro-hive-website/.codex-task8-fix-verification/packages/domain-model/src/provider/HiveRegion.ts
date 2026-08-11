import type { RegionId, AvailabilityZoneId } from '../ids/ids';

/**
 * One entry of `HiveProviderMetadata.listRegions()` (ADR-020 §Decision;
 * `04-PROVIDER-FRAMEWORK.md` §2). Read-only, cacheable — discovery data,
 * never a live per-request provider call.
 */
export interface HiveRegion {
  readonly id: RegionId;
  readonly displayName: string;
  readonly availabilityZones: readonly AvailabilityZoneId[];
}
