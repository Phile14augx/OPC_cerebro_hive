import type { RegionId } from '../ids/ids';

/**
 * One entry of `HiveProviderMetadata.listResourceTypes()` (ADR-020
 * §Decision). `resourceType` is a plain string, not a closed enum this
 * package would have to keep in lockstep with every provider's real
 * offerings — same deliberate choice already made for
 * `ResourceReference.resourceType` (see that type's own doc comment) and
 * for `HiveCapabilityDescriptor.features`. Maps onto the Service Catalog
 * (`02-SERVICE-CATALOG.md`), not fixed here.
 */
export interface HiveResourceTypeDescriptor {
  readonly resourceType: string;
  readonly displayName: string;
  readonly supportedRegions: readonly RegionId[];
  /** e.g. whether this provider's execution model supports ADR-022's full
   * lifecycle-state machine, or only a binary up/down signal
   * (`04-PROVIDER-FRAMEWORK.md` §2, "Lifecycle-state support"). Left as a
   * flat string list rather than a closed enum for the same reason
   * `features` is — discovery-driven, not a static support matrix. */
  readonly supportedLifecycleFeatures: readonly string[];
}
