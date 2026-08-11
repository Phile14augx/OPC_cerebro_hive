import type { RegionId, AvailabilityZoneId } from '../ids/ids';

/**
 * Input to `HiveProviderExecutor.provision()` (ADR-020 §Decision). Deliberately
 * minimal and provider-agnostic at this layer — `configuration` is an open
 * bag because each `resourceType` (Service Catalog, `02-SERVICE-CATALOG.md`)
 * has its own shape, and this package does not enumerate every capability
 * service's provisioning parameters (that would recreate the exact
 * static-matrix problem `ADR-020`'s discovery-over-static-matrix decision
 * exists to avoid).
 */
export interface HiveResourceSpec {
  readonly resourceType: string;
  readonly region: RegionId;
  readonly availabilityZone?: AvailabilityZoneId;
  readonly configuration: Readonly<Record<string, unknown>>;
}

/**
 * Input to `HiveProviderExecutor.resize()` — a partial spec describing only
 * what changes; `resourceType`/`region`/`availabilityZone` of an existing
 * Resource are immutable post-provision at this phase (relocating a
 * Resource across region/AZ is not modeled as a `resize`).
 */
export interface HiveResourceResizeSpec {
  readonly configuration: Readonly<Record<string, unknown>>;
}

/**
 * Input to `HiveProviderExecutor.update()` — likewise an open, partial
 * configuration bag; which fields are actually mutable post-provision is a
 * per-resource-type, per-provider concern this package does not fix.
 */
export interface HiveResourceUpdateSpec {
  readonly configuration: Readonly<Record<string, unknown>>;
}
