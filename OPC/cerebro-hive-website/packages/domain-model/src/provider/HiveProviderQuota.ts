import type { RegionId } from '../ids/ids';

/**
 * One entry of `HiveProviderMetadata.getQuotas()` (ADR-020 §Decision).
 * Provider-side limits — distinct from HiveForge's own Project/Workspace
 * quotas fixed in the Service Catalog (`02-SERVICE-CATALOG.md`); this
 * describes what the *provider* will allow, not what HiveForge allows a
 * tenant to consume.
 */
export interface HiveProviderQuota {
  readonly resourceType: string;
  readonly region?: RegionId;
  readonly limit: number;
  /** Provider-reported current consumption against `limit`, when the
   * provider's discovery API exposes it. Omitted (not zero) when unknown —
   * absence must not be read as "no usage." */
  readonly used?: number;
}
