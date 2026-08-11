import type { HiveCapabilityDescriptor } from './HiveCapabilityDescriptor';

/**
 * Contract for anything that can declare which capabilities it exposes.
 * Deliberately more general than the future ProviderMetadata contract
 * (ADR-020, Slice 4) — a cloud Provider is one implementer of this, but
 * so could a capability-declaring Resource type or a test fixture be.
 * Slice 4 is expected to have ProviderMetadata compose or extend this,
 * not redefine capability declaration from scratch.
 */
export interface HiveCapabilityProvider {
  describeCapabilities(): Promise<readonly HiveCapabilityDescriptor[]>;
}
