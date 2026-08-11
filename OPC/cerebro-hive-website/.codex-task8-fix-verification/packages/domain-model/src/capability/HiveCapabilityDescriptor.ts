import type { HiveCapability } from '../enums/HiveCapability';
import type { HiveCapabilityDependency } from './HiveCapabilityDependency';
import type { HiveCapabilityMetadata } from './HiveCapabilityMetadata';

/**
 * What a capability-declaring entity (a Provider, per the future
 * ProviderMetadata/ADR-020, or anything else that needs to say "I support
 * this") reports about one capability it exposes. Per
 * hiveforge/01-PLATFORM-ARCHITECTURE.md §2: "capability discovery, not a
 * static support matrix" — `features` is a flat list of provider-declared
 * strings (e.g. "gpu-compute", "spot-pricing"), not a fixed enum this
 * package would have to keep in lockstep with every provider's real
 * capabilities.
 */
export interface HiveCapabilityDescriptor {
  readonly capability: HiveCapability;
  readonly features: readonly string[];
  readonly metadata: HiveCapabilityMetadata;
  readonly dependencies: readonly HiveCapabilityDependency[];
}

export function isHiveCapabilityDescriptor(value: unknown): value is HiveCapabilityDescriptor {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<HiveCapabilityDescriptor>;
  return (
    typeof candidate.capability === 'string' &&
    Array.isArray(candidate.features) &&
    typeof candidate.metadata === 'object' &&
    candidate.metadata !== null &&
    Array.isArray(candidate.dependencies)
  );
}
