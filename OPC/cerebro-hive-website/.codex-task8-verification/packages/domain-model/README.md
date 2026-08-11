# @cerebro/domain-model

## Purpose

Canonical source of shared domain types and contracts for the **HiveForge** platform (`hiveforge/00-FOUNDATION.md` through `08-ROADMAP.md`, `ADR-020`–`038`). Expresses the ubiquitous language fixed in `hiveforge/01-DOMAIN-MODEL.md` — strongly typed identifiers, entity/aggregate-root/value-object bases, the domain-event shape, and the two vocabulary enums (`ResourceLifecycleState`, `HiveCapability`) already approved at the architecture level.

This is **Phase 0, Slice 1** of HiveForge implementation, per the sequencing agreed for building outward from the domain rather than inward from infrastructure. It is deliberately thin: it should compile and do very little.

## Not to be confused with `@cerebro/domain`

This repository already has a `@cerebro/domain` package — it belongs to CerebroStudio's Agent/Workflow bounded context (Prisma-backed, its own `PolicyEngine`, `EventBus`, application services). It is a **different bounded context** from HiveForge and this package does not depend on it, extend it, or share types with it. The similar names are a known risk — if you're looking for Agent/Workflow domain logic, you want `@cerebro/domain`, not this package.

**Naming collision, flagged for future slices, not resolved here:** `@cerebro/domain/src/policies/PolicyEngine.ts` is a real, existing class (a simple named-policy evaluator returning `{ allowed, reason }`). HiveForge's own `PolicyEngine` (`hiveforge/00-FOUNDATION.md` §1, a HiveShield module — enterprise RBAC/ABAC, per `ADR-028`) is a different, larger concept with no relationship to this existing class. They will coexist as same-named classes in different packages once HiveForge's `PolicyEngine` is actually implemented (no TypeScript compile collision, since imports are package-scoped — but a real risk of human confusion). Whichever future slice implements HiveShield's `PolicyEngine` should name its package/module path to make the distinction unmistakable (e.g. `@cerebro/hiveshield-policy-engine`, not `@cerebro/policy-engine`), and should link back to this note.

## Repository Integration Findings

Every naming collision discovered while building this package, in one place, so future contributors don't have to reconstruct why a name looks the way it does. Each was investigated (existing artifact read, real consumers checked) before choosing a HiveForge-side name — never resolved by renaming or removing the existing artifact.

| Existing artifact | HiveForge artifact | Resolution |
|---|---|---|
| `@cerebro/domain`'s `PolicyEngine` (real, keyed by policy-name string map) | HiveShield's `PolicyEngine` (`00-FOUNDATION.md` §1, `ADR-028`) | Distinct bounded contexts; disambiguated by package, not renamed — see `06-SECURITY.md` §0's domain/package/namespace/class distinction. Not yet implemented in this package (Slice 1/2/3 don't touch authorization). |
| `@cerebro/capability-core`'s `CapabilityRegistry`/`CapabilityMetadata` (real, implemented; sole consumer is the seemingly-unwired `@cerebro/kernel-core`) | `HiveCapabilityRegistry`/`HiveCapabilityMetadata` (Slice 2) | `Hive`-prefixed, reusing the capability-naming convention already in `00-FOUNDATION.md` §3, rather than inventing a new disambiguation scheme. |
| `@cerebro/domain`'s `DomainEvent`/`EventBus`/`InMemoryEventBus`, and `@cerebro/core-bus`'s own (internally inconsistent — at least two differently-shaped `DomainEvent`s within `core-bus` itself: `Event.ts`'s `{type}`-based one and `contracts/DomainEvent.ts`'s `{eventType,payload}`-based one used by `MemoryEventBus`) `DomainEvent`/`IntegrationEvent`/`EventBus`/`MemoryEventBus`/`DomainEventBus` | `HiveDomainEvent`/`HiveIntegrationEvent`/`HiveEventBus` (Slice 1, retroactively renamed in Slice 3; Slice 3) | `Hive`-prefixed throughout. This matches the "event bus (3+ declarations)" contested finding recorded during the earlier M25.4A recon audit (task history) — independently reconfirmed here while building this package, not assumed resolved by that audit. `HiveDomainEvent`/`HiveEventBus` do not attempt to unify or replace any of the existing ones; they are HiveForge's own, additional, clearly-named contracts. |
| `@cerebro/hiveshield-policy`'s `HierarchicalPolicyEngine` (not a collision, a **convergence**: it independently implements most of `ADR-038`, written earlier in this same masterplan, using the exact package-naming convention this document recommended) | *(no HiveForge-side artifact needed for rules 1–4 — this is the real implementation and extension point)* | Not renamed or duplicated. Classified via a full checklist, not just "found and verified": **Partial** — rules 1–4 canonical (8/8 real tests passing against real `policy-core`/`identity-core` source), rule 5 ("one algorithm, two evaluators") **amended to Deferred** (evidence of intended future convergence with `engineering-review`'s own `AIGovernanceEngine`, not yet a settled decision). See `hiveforge/adr/ADR-038.md`'s "Implementation status" section and `08-ROADMAP.md` §2 for the `TenancyScope` gap and the separate `ADR-013`-citation finding it surfaced. |

## Naming collision #2 — capability registry (found during Slice 2, more serious than the `PolicyEngine` one)

`@cerebro/capability-core` already has a **real, implemented** `CapabilityRegistry` class and `CapabilityMetadata` interface (registered by free-form string id, dependency resolution by id), consumed by `@cerebro/kernel-core`'s `CerebroKernel` bootstrap. A third, differently-shaped `CapabilityManifest` (zod schema) exists in `@cerebro/architecture-core`. Checked before writing anything: no other package in the repo declares a dependency on `capability-core` or `kernel-core` — this reads as an unwired prototype ("Enterprise AI OS" bootstrap, mocked identity), not verified production code — but the class/interface names are **identical** to what HiveForge's Masterplan called for, not merely similar (unlike the `PolicyEngine` case).

Resolution applied, reusing a convention HiveForge already has rather than inventing a new one: every concrete interface/type in `src/capability/` is prefixed `Hive` (`HiveCapabilityRegistry`, `HiveCapabilityDescriptor`, `HiveCapabilityMetadata`, ...), matching the same prefix already used for the capability names themselves (`HiveCompute`, `HiveStorage`, ..., `HiveDatabase`). The architecture-level term in HiveForge's own docs stays unprefixed ("Capability Registry") — same domain/package/class distinction already applied to `PolicyEngine` → `HiveShield.PolicyEngine`.

`HiveCapabilityMetadata`'s `capability` field is typed against the closed `HiveCapability` enum (`00-FOUNDATION.md` §3); `@cerebro/capability-core`'s `CapabilityMetadata.id` is a free-form string keyed to its own, unrelated registry. The two are not interchangeable and neither package depends on the other.

## Slice 4 — Provider contracts (ADR-020/`04-PROVIDER-FRAMEWORK.md`)

**Primary Finding:** No implementation corresponding to ADR-020's infrastructure/cloud provider abstraction (`ProviderMetadata`/`ProviderExecutor` for AWS/Azure/GCP/Hetzner-style resource provisioning) was found in the repository source inspected for this slice — a targeted pass across every `packages/*/src` tree matching `interface \w*Provider\b`, plus each matched file's real consumers via `package.json` workspace-dependency grep. This is **evidence of absence within that inspected scope, not proof of absence repository-wide**: `apps/`, `services/` (including the orphaned `services/platform-api` source tree noted below), and any non-TypeScript infrastructure code (Terraform, Helm, ad hoc scripts) were not exhaustively searched for a cloud-provider abstraction. `HiveProviderMetadata`/`HiveProviderExecutor`/`HiveProvider` (interfaces only, no adapter) are therefore new contracts filling what appears to be a genuine gap, not a disambiguation of something pre-existing — the first slice where that was true, and the first slice's finding that should be re-checked if a wider search ever surfaces a counter-example. `HiveProviderMetadata` extends Slice 2's `HiveCapabilityProvider` rather than redefining capability declaration, per that type's own doc comment anticipating exactly this composition. `HiveProviderExecutor`'s error/status/operation shapes (`HiveProviderErrorCode`, `HiveProviderOperation`, `HiveProviderResourceState`) are drawn directly from `ADR-020`/`ADR-027`/`04-PROVIDER-FRAMEWORK.md` — no invented vocabulary.

**Secondary Observations (Out of Scope for this slice — recorded, not resolved):** an inventory pass across model/AI-gateway, execution, storage, and auth/identity provider abstractions ahead of this slice turned up several unrelated findings within that same inspected scope, each requiring its own separate architectural review:
- A real two-package naming collision: `identity-core`'s `CredentialProvider` (validates a presented credential) and `secrets-core`'s `CredentialProvider` (issues/revokes a new credential) share a name but do opposite things, with no shared types and no import relationship. **Reviewed separately, resolved:** see `audit/CREDENTIAL-PROVIDER-COLLISION-REVIEW.md` — `identity-core`'s version is unimplemented/unconsumed anywhere in the repo and is recommended for rename to `CredentialValidator`; `secrets-core`'s version is real and keeps its name.
- `packages/storage` is an entirely empty directory — no package, no code, zero references anywhere in the repo.
- `runtime-core`'s `CapabilityProvider` family defines a third, differently-shaped `PolicyProvider` (alongside `policy-core`'s and `change-core`'s), and lists `StorageProvider`/`EmbeddingProvider` only as string literals in a type union with no corresponding interfaces.
- `federation-core`, `change-core`, and `engineering-review`'s `ISnapshotProvider` are real, mock-backed code with zero consumers anywhere in the repo — isolated/unwired.
- `knowledge-sdk`'s `EmbeddingProvider` is a legitimate, differently-scoped model-adjacent provider (RAG embedding generation) with real consumers, unrelated to this slice.
- `packages/auth`'s `IAuthProvider`/`MockAuthProvider` is a permanently-hardcoded mock wired into `apps/forge`, with no conditional swap to a real backend found; `services/platform-api` (distinct from `apps/platform-api`) is a source tree with no `package.json` at all — an orphaned/undeclared workspace member. **Reviewed separately, classified:** see `audit/SERVICES-PLATFORM-API-CLASSIFICATION.md` — a substantial but never-wired parallel implementation attempt (Express, org/billing/API-key management), not a duplicate of the actively-developed Fastify-based `apps/platform-api`, recommended for archival as design reference rather than deletion or adoption.

None of these observations block or change Slice 4's contracts; they are recorded here so a future reviewer doesn't have to reconstruct the inventory pass that found them.

## Public API

- `Identifier<Brand>`, `createIdentifierFactory` — the generic branded-identifier mechanism.
- `OrganizationId`, `TenantId`, `ProjectId`, `WorkspaceId`, `DeploymentId`, `ResourceId`, `OperationId`, `ProviderId`, `RegionId`, `AvailabilityZoneId`, `PolicyId`, `UsageRecordId`, `BillingAccountId`, `UserId` — one identifier per aggregate fixed in `01-DOMAIN-MODEL.md` §1.
- `Entity<TId>`, `AggregateRoot<TId>` — DDD bases. `AggregateRoot` buffers raised `DomainEvent`s in memory only; it has no publish mechanism (no `EventBus` dependency).
- `ValueObject<TProps>`, `ResourceReference` — structural-equality helper and one concrete value object (a reference to a `Resource`, the shape `UsageRecord`/`Operation` will need later).
- `HiveDomainEvent<TPayload>` — the event *shape* only, per `ADR-024`. Renamed from a bare `DomainEvent` (see Repository Integration Findings, above) — no bus, no transport implemented here.
- `ResourceLifecycleState` — the eight states fixed in `01-DOMAIN-MODEL.md` §3 / `ADR-022`.
- `HiveCapability` — the eight capabilities fixed in `00-FOUNDATION.md` §3 (post-Amendment 1).
- `DomainModelError` — the one error type this package throws (identifier/value-object construction failures).

**Slice 2 — capability contracts (interfaces/types only, no concrete implementations):**
- `HiveCapabilityVersion`, `isHiveCapabilityVersion` — semver string + format guard.
- `HiveCapabilityMaturity` — Experimental/Beta/Stable/Deprecated (distinct from the documentation evidence-status legend — see the type's own doc comment).
- `HiveCapabilityDependency`, `HiveCapabilityRequirement` — one capability's declared dependency on another; a Resource's requirement on a capability feature.
- `HiveCapabilityMetadata` — descriptive info (name, version, maturity, owner) about one capability instance.
- `HiveCapabilityDescriptor`, `isHiveCapabilityDescriptor` — what a capability-declaring entity reports it supports, plus a type guard.
- `HiveCapabilityFilter` — a query predicate shape for discovery.
- `HiveCapabilityDiscoveryResult` — the outcome of a discovery pass.
- `HiveCapabilityProvider` — contract for anything that can describe its own capabilities.
- `HiveCapabilityRegistry`, `HiveCapabilityMetadataProvider`, `HiveCapabilityResolver`, `HiveCapabilityValidator`, `HiveCapabilityValidationResult`, `HiveCapabilityRegistryRepository` — service/repository **interfaces only**; no concrete registry, resolver, validator, or persistence implementation exists in this package, per the architectural invariant: this package defines capabilities and their relationships, infrastructure packages determine how they're stored, discovered, and executed.

**Slice 3 — event contracts (interfaces only, no concrete bus/store/serializer implementation):**
- `HiveIntegrationEvent<TPayload>` — the Domain vs. Integration Event split (`ADR-024`, `03-CONTROL-PLANE.md` §5), carrying a `schemaVersion` since external consumers depend on its shape.
- `HiveEventMetadata` — cross-cutting transport/tracing metadata, kept separate from the event payload itself.
- `HiveEventEnvelope<TEvent>` — a `HiveDomainEvent`/`HiveIntegrationEvent` paired with its `HiveEventMetadata`; every contract below operates on envelopes, not bare events.
- `HiveEventPublisher`, `HiveEventSubscriber`, `HiveEventBus` (composes the two) — outbound/subscription contracts. No `InMemoryEventBus`-style concrete class ships here.
- `HiveEventStore` — append-only store contract, keyed by aggregate id.
- `HiveEventSerializer` — (de)serialization contract.
- `HiveEventDispatcher` — in-process routing contract, distinct from `HiveEventPublisher` (which crosses a transport boundary).

**Slice 4 — provider contracts (interfaces/types only, no concrete AWS/Azure/GCP/Hetzner adapter):**
- `HiveRegion`, `HiveResourceTypeDescriptor`, `HiveProviderQuota` — `HiveProviderMetadata`'s discovery return shapes (`04-PROVIDER-FRAMEWORK.md` §2).
- `HiveProviderMetadata` — read-only, cacheable discovery contract; extends `HiveCapabilityProvider` (Slice 2) rather than redefining capability declaration.
- `HiveResourceSpec`, `HiveResourceUpdateSpec`, `HiveResourceResizeSpec` — inputs to `HiveProviderExecutor`'s mutating methods.
- `HiveProviderErrorCode`, `HIVE_PROVIDER_ERROR_RETRYABILITY`, `HiveProviderError` — the shared failure taxonomy and Retryable/Terminal classification fixed by `ADR-027`.
- `HiveProviderOperationKind`, `HiveProviderOperation` — the return shape of every `HiveProviderExecutor` lifecycle method.
- `HiveProviderResourceState` — the return shape of `HiveProviderExecutor.status()`.
- `HiveProviderExecutor` — the execution contract (`provision`/`update`/`resize`/`delete`/`snapshot`/`restore`/`status`); scoped exclusively to lifecycle operations, no policy/billing/orchestration/auditing/selection.
- `HiveProvider` — composes one provider's `HiveProviderMetadata` + `HiveProviderExecutor` under one `ProviderId`. No registry, resolver, or registration mechanism implemented — that remains `ProviderSelector`'s (control-plane) concern.

## ADR references

- `ADR-020` (Provider Abstraction Layer) — implemented as interfaces-only in Slice 4 (`HiveProviderMetadata`/`HiveProviderExecutor`/`HiveProvider`). `ResourceReference`'s `resourceType` remains a plain string, consistent with `HiveResourceSpec`/`HiveResourceTypeDescriptor`'s own plain-string `resourceType`.
- `ADR-022` (Resource Lifecycle State Machine) — source of `ResourceLifecycleState`, reused directly by `HiveProviderOperation`/`HiveProviderResourceState`.
- `ADR-024` (Event-Driven Platform Architecture) — source of `DomainEvent`'s shape; this package implements none of that ADR's transport/delivery guarantees.
- `ADR-027` (Failure Handling and Retry Classification) — source of `HiveProviderErrorCode`'s taxonomy and the Retryable/Terminal split fixed in `HIVE_PROVIDER_ERROR_RETRYABILITY`.
- `ADR-038` (Policy Inheritance Precedence and Conflict Resolution) — not implemented here; `PolicyId` exists as an identifier only, no `Policy` aggregate or evaluator.

## Explicit non-goals (this slice)

No concrete AWS/Azure/GCP/Hetzner adapter, no `ProviderSelector` implementation, no provider registry/registration mechanism, no execution engine, credential handling, persistence, event transport, policy evaluation, API layer, or service orchestration. No dependency on `@cerebro/domain`, `@cerebro/database`, or any other workspace package — this package has zero runtime dependencies by design.

## Ownership boundary

Owned by whoever owns HiveForge architecture governance (see `hiveforge/08-ROADMAP.md`). Changes to the public API here are changes to the ubiquitous language every later HiveForge slice depends on — treat them as ADR-worthy if they change a concept `01-DOMAIN-MODEL.md` already fixed, not as routine refactors.

## Consumers

None yet — this is Slice 1. Slice 2 (capability registry contracts and service interfaces) is the first expected consumer.
