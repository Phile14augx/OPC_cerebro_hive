import type { HiveCapability } from '../enums/HiveCapability';
import type { HiveCapabilityDescriptor } from './HiveCapabilityDescriptor';
import type { HiveCapabilityFilter } from './HiveCapabilityFilter';

/**
 * Contract for a capability registry — **interface only**, per this slice's
 * explicit scope ("define contracts, not implementations") and the
 * architectural invariant it preserves: this package defines capabilities
 * and their relationships; infrastructure packages determine how they're
 * stored, discovered, and executed. A concrete in-memory/persistent
 * implementation belongs to a later, infrastructure-facing slice, not here.
 *
 * Distinct from @cerebro/capability-core's CapabilityRegistry class (a real,
 * already-implemented, differently-shaped registry for CerebroStudio's own
 * capabilities — agent-builder, workflow, etc., keyed by free-form string
 * id). This is a contract for HiveForge's own HiveCapability-keyed registry;
 * the two are unrelated bounded contexts that happen to solve a similar
 * shaped problem. See packages/domain-model/README.md for the full note.
 */
export interface HiveCapabilityRegistry {
  register(descriptor: HiveCapabilityDescriptor): void;
  get(capability: HiveCapability): HiveCapabilityDescriptor | undefined;
  list(filter?: HiveCapabilityFilter): readonly HiveCapabilityDescriptor[];
}

/**
 * Narrow, read-only accessor for callers that only need metadata, not the
 * full register/list surface — interface segregation over HiveCapabilityRegistry.
 */
export interface HiveCapabilityMetadataProvider {
  getMetadata(capability: HiveCapability): HiveCapabilityDescriptor['metadata'] | undefined;
}

/**
 * Contract for resolving a capability's full dependency graph. Kept
 * separate from HiveCapabilityRegistry itself — resolution (walking
 * dependencies, detecting cycles) is a distinct responsibility from
 * storage/lookup, and a registry implementation shouldn't be forced to
 * also be a resolver.
 */
export interface HiveCapabilityResolver {
  resolveDependencies(capability: HiveCapability): readonly HiveCapabilityDescriptor[];
}

export interface HiveCapabilityValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/**
 * Contract for validating a descriptor's internal consistency (e.g., every
 * declared dependency is itself a real HiveCapability value). No zod or
 * other schema library dependency — this slice stays dependency-free; a
 * concrete validator implementation is free to use one.
 */
export interface HiveCapabilityValidator {
  validate(descriptor: HiveCapabilityDescriptor): HiveCapabilityValidationResult;
}

/**
 * Persistence-facing contract — a repository interface only. No
 * implementation here (no database, no file system, no in-memory Map) —
 * persistence is an explicit non-goal of this package.
 */
export interface HiveCapabilityRegistryRepository {
  save(descriptor: HiveCapabilityDescriptor): Promise<void>;
  findByCapability(capability: HiveCapability): Promise<HiveCapabilityDescriptor | undefined>;
  list(): Promise<readonly HiveCapabilityDescriptor[]>;
}
