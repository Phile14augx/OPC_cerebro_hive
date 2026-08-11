# ADR-020: Provider Abstraction Layer

**Status:** Proposed (Phase 1, architecture track — per `hiveforge/00-FOUNDATION.md` §10 authorization)

**Amended, Phase 4:** the original single `ProviderAdapter` interface conflated capability discovery with execution. Split below into `ProviderMetadata` and `ProviderExecutor` — this is a revision to a still-`Proposed` (not yet formally accepted) ADR, not a Phase-0-style frozen-baseline amendment; recorded here directly with the change explained, rather than left as two contradictory descriptions across documents.

## Context

Phase 0 principle #2 establishes that the provider abstraction is the product, not an implementation detail — HiveForge's entire value proposition depends on AWS/Azure/GCP/Hetzner/future owned infrastructure staying interchangeable behind one interface. Without a governing ADR, individual capability services (HiveCompute, HiveStorage, HiveNetwork) could each grow provider-specific logic independently, producing the same "competing implementations of one concern" pattern this project's own audit history has already found expensive to reconcile after the fact (the Helm template consolidation, the PolicyEngine/event-bus reconciliation in the M25.5 audits, and — most directly on point — the two competing `IReviewContributor` interfaces resolved in ADR-007).

The original decision defined one `ProviderAdapter` interface mixing `listCapabilities()` (discovery — cheap, cacheable, doesn't touch the provider's actual API on every call) with `provision`/`deprovision`/`describe` (execution — necessarily hits the real provider). Phase 4 (Provider Framework) identified this as a real design gap: discovery and execution have different caching, scheduling, and failure characteristics, and conflating them into one interface makes it harder to reason about either independently — the same kind of leaking abstraction Phase 0 principle #2 warns against.

## Decision

The single `ProviderAdapter` is replaced by two contracts, both implemented per provider, both registered under one logical `HiveProvider`:

```
interface ProviderMetadata {
  listRegions(): Region[]
  listResourceTypes(): ResourceTypeDescriptor[]
  listCapabilities(): CapabilityDescriptor[]   // GPU availability, feature flags, etc.
  getQuotas(): QuotaDescriptor[]
}

interface ProviderExecutor {
  provision(resourceSpec): Operation
  update(resourceId, changes): Operation
  resize(resourceId, spec): Operation
  delete(resourceId): Operation
  snapshot(resourceId): Operation
  restore(snapshotId): Operation
  status(resourceId): ResourceState
}
```

`ProviderMetadata` is read-only, cacheable by the control plane without invoking the provider's real API on every request — `ProviderSelector` (per `03-CONTROL-PLANE.md`) consults cached metadata to choose a provider before any execution call happens. `ProviderExecutor` handles only lifecycle operations — it does not own policy, billing, orchestration, auditing, or provider selection; those remain control-plane concerns per `ADR-021`/`03-CONTROL-PLANE.md`'s authoritative responsibility matrix. Both contracts are registered, versioned, and health-checked independently, same as the original single-interface decision — one provider's `ProviderExecutor` failing must not affect provisioning against any other provider (per `ADR-027`'s failure-classification model).

## Consequences

- No capability service (HiveCompute, HiveStorage, etc.) may import a provider-specific SDK directly — all provider calls route through `ProviderMetadata`/`ProviderExecutor` implementations.
- Adding a new provider means implementing both contracts once, not touching HiveGateway or any capability service's core logic — the same "boundary was misdrawn if a new implementation needs a structural change" test `ADR-005`/`ADR-007` already apply to contributors applies here to providers.
- Capability drift between providers is surfaced via `ProviderMetadata`, cached rather than re-queried per request — callers/`ProviderSelector` can check support cheaply before attempting execution.
- `ProviderExecutor` failures are classified and handled per `ADR-027` (Failure Handling and Retry Classification) — this ADR fixes the interface split, not the retry/error-normalization behavior, which lives in `ADR-027`.
- This ADR does not specify which providers are built first, or in what order — that's Phase 8 (Roadmap) scope, a business/sequencing decision, not an architectural one.
