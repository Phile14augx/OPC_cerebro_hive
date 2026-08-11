import type { HiveCapability } from '../enums/HiveCapability';
import type { HiveCapabilityVersion } from './HiveCapabilityVersion';

/**
 * One capability's declared dependency on another capability being present
 * at a compatible version. `versionRange` is an opaque string (e.g. "^1.0.0")
 * — this slice does not implement range parsing/matching, only the shape a
 * future resolver would consume.
 */
export interface HiveCapabilityDependency {
  readonly capability: HiveCapability;
  readonly versionRange: string;
}

/**
 * A concrete Resource type's requirement on a specific *feature* of a
 * capability, not the whole capability — e.g. a GPU-backed VM requires
 * HiveCompute's "gpu-compute" feature, not just HiveCompute generically.
 * Mirrors hiveforge/01-PLATFORM-ARCHITECTURE.md §2's capability-discovery
 * principle: features are strings a provider declares, not a fixed enum
 * this package would otherwise have to keep in lockstep with every provider.
 */
export interface HiveCapabilityRequirement {
  readonly capability: HiveCapability;
  readonly feature: string;
  readonly versionRange?: HiveCapabilityVersion;
}
