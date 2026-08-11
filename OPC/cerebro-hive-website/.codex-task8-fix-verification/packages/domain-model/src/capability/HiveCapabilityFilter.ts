import type { HiveCapability } from '../enums/HiveCapability';
import type { HiveCapabilityMaturity } from './HiveCapabilityMaturity';

/**
 * A query predicate over registered capability descriptors — the shape a
 * future HiveCapabilityRegistry.list() call would accept. Every field is
 * optional and additive (AND semantics); this slice does not implement the
 * matching logic itself, only the shape a resolver would consume.
 */
export interface HiveCapabilityFilter {
  readonly capability?: HiveCapability;
  readonly maturity?: HiveCapabilityMaturity;
  readonly feature?: string;
}
