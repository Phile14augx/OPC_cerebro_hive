import type { HiveCapabilityDescriptor } from './HiveCapabilityDescriptor';

/**
 * The outcome of a discovery pass — a snapshot, not a live view. `source`
 * identifies who produced it (e.g. a specific Provider's id, once Slice 4
 * defines ProviderId-bearing discovery), kept as a plain string here since
 * this slice doesn't depend on the Provider Framework.
 */
export interface HiveCapabilityDiscoveryResult {
  readonly descriptors: readonly HiveCapabilityDescriptor[];
  readonly discoveredAt: Date;
  readonly source: string;
}
