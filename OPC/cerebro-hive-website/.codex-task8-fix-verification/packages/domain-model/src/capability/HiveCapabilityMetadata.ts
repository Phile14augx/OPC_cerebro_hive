import type { HiveCapability } from '../enums/HiveCapability';
import type { HiveCapabilityMaturity } from './HiveCapabilityMaturity';
import type { HiveCapabilityVersion } from './HiveCapabilityVersion';

/**
 * Descriptive information about one capability instance — who owns it,
 * what it's called, how mature it is. Not the same shape as
 * @cerebro/capability-core's CapabilityMetadata (that package's `id` is a
 * free-form string keyed to its own registry; this one's `capability` field
 * is the closed HiveCapability enum fixed in 00-FOUNDATION.md §3 — the two
 * are not interchangeable, deliberately).
 */
export interface HiveCapabilityMetadata {
  readonly capability: HiveCapability;
  readonly displayName: string;
  readonly description?: string;
  readonly version: HiveCapabilityVersion;
  readonly maturity: HiveCapabilityMaturity;
  readonly owner: string;
}
