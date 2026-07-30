import type { ProviderId } from '../ids/ids';
import type { HiveProviderMetadata } from './HiveProviderMetadata';
import type { HiveProviderExecutor } from './HiveProviderExecutor';

/**
 * Both `HiveProviderMetadata` and `HiveProviderExecutor` are "implemented
 * per provider, both registered under one logical HiveProvider" (ADR-020
 * §Decision). This is that composition — a registration/lookup shape, not
 * a base class either contract extends. `metadata` and `executor` remain
 * independently evolvable (ADR-020: "registered, versioned, and
 * health-checked independently"); this type only fixes that a caller
 * resolves both halves via the same `id`.
 *
 * No registry, resolver, or registration mechanism is implemented in this
 * package — per this slice's non-goals, and consistent with Slice 2's
 * `HiveCapabilityRegistry` being an interface only. `ProviderSelector`
 * (control-plane, `03-CONTROL-PLANE.md` §3) is the consumer that resolves
 * a `HiveProvider` given a request; how it does so is not fixed here.
 */
export interface HiveProvider {
  readonly id: ProviderId;
  readonly displayName: string;
  readonly metadata: HiveProviderMetadata;
  readonly executor: HiveProviderExecutor;
}
