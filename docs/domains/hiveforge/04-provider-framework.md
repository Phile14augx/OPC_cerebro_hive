# HiveForge Masterplan — Phase 4: Provider Framework

**Status:** Proposed, per Phase 3 completion. Anchored on the metadata/execution split carried forward from `ADR-020`'s amendment — this is the phase that gives that split its full architecture, not a small implementation detail bolted onto Phase 1.

## 1. Provider architecture

```
HiveGateway
        │
        ▼
ProviderSelector
        │
        ▼
HiveProvider
        │
        ├── ProviderMetadata   (what a provider can do — discovery, cacheable)
        └── ProviderExecutor   (how an operation is carried out — execution)
```

Three distinct roles, each independently evolvable:
- **`ProviderSelector`** (a HiveGateway-owned module, per `03-CONTROL-PLANE.md` §3) decides *which* provider fulfills a request.
- **`ProviderMetadata`** describes *what* a provider can do — read-only, cacheable, doesn't hit the provider's real API per request.
- **`ProviderExecutor`** performs *how* the operation is carried out — the only one of the three that actually calls the provider's real API.

This separation is what `ADR-020`'s amendment fixed at the interface level; this document is that decision's full elaboration.

## 2. Capability discovery

`ProviderMetadata`'s discovery contract answers, per provider:
- Which regions/availability zones are available (feeding the domain model's `Region`/`AvailabilityZone` entities).
- Which resource types are supported (mapping onto the Service Catalog, Phase 2).
- GPU availability and other feature flags.
- Quotas (provider-side limits, distinct from HiveForge's own Project/Workspace quotas in the Service Catalog).
- Lifecycle-state support — whether a provider's execution model actually supports every state in `ADR-022`'s shared state machine (e.g., some providers may not support a true `Degraded` health signal, only binary up/down).

The control plane caches this — `ProviderSelector` consults cached metadata, not a live provider call, for every selection decision. Cache invalidation strategy (TTL vs. event-driven refresh) is implementation detail, not fixed here; either is compatible with this contract.

## 3. Execution contract

`ProviderExecutor` is scoped exclusively to lifecycle operations: `provision`, `update`, `resize`, `delete`, `snapshot`, `restore`, `status`. It explicitly does **not** own policy, billing, orchestration, auditing, or provider selection — those remain control-plane concerns per `03-CONTROL-PLANE.md`'s authoritative responsibility matrix (§3, amended to note: that matrix governs HiveGateway's internal modules; this section is the equivalent authoritative statement for what a `ProviderExecutor` does and does not own). A `ProviderExecutor` that reaches into policy or billing logic is out of bounds, the same way a contributor reaching around `EngineeringReviewOrchestrator` was the exact defect `ADR-007` retired.

## 4. Capability matrix

Illustrative, not a real support commitment — every cell is Planned (per the Phase 0 evidence-status discipline), not Verified:

| Capability | AWS | Azure | GCP | Hetzner | Future HiveForge-owned |
|---|:---:|:---:|:---:|:---:|:---:|
| VM | ✓ | ✓ | ✓ | ✓ | ✓ |
| Bare Metal | — | — | — | ✓ | ✓ |
| GPU | ✓ | ✓ | ✓ | Limited | ✓ |
| Kubernetes | ✓ | ✓ | ✓ | ✓ | Planned |
| Serverless | ✓ | ✓ | ✓ | — | Planned |
| Object Storage | ✓ | ✓ | ✓ | — | Planned |
| Block/File Storage | ✓ | ✓ | ✓ | ✓ | Planned |
| Managed PostgreSQL/MySQL | ✓ | ✓ | ✓ | — | Planned |
| Redis/Kafka/OpenSearch | ✓ | ✓ | ✓ | — | Planned |

This matrix is generated from real `ProviderMetadata` responses once any adapter is actually built — it is not maintained as a hand-edited document once Phase 4 moves from planning into implementation. Keeping a hand-maintained matrix in sync with real provider capability is exactly the kind of drift `ADR-020`'s discovery-over-static-matrix decision exists to avoid — this table is illustrative scaffolding for the planning phase only.

## 5. Selection strategy

`ProviderSelector` chooses a provider given a request and the cached `ProviderMetadata` for all registered providers. Candidate inputs (not all necessarily used at Stage 1 — see Phase 8 Roadmap for sequencing): region, cost, latency, compliance requirements, explicit customer/tenant preference, GPU availability, current capacity, and tenant-level Policy (a Workspace might restrict which providers it may use at all, per the domain model's Policy attachment). `ProviderSelector` produces a provider choice and hands off to that provider's `ProviderExecutor` — it never executes provisioning itself, keeping selection and execution as cleanly separated as metadata and execution are.

Exact selection algorithm (weighted scoring, hard filters then tie-break, customer-configurable priority) is not fixed by this document — that's an implementation decision within the constraint that selection and execution stay separate roles.

## 6. Error normalization

Every `ProviderExecutor` translates provider-specific errors into the shared platform taxonomy fixed in `ADR-027`: `QuotaExceeded`, `RegionUnavailable`, `AuthenticationFailed`, `ProvisioningTimeout`, `InvalidSpecification`, `TransientProviderFailure`. This translation happens inside the `ProviderExecutor` implementation, before the failure reaches `OperationTracker` — retry/terminal classification (`ADR-027`) operates on the normalized taxonomy, never on provider-specific error codes or messages. A new provider's adapter is responsible for mapping its own error model onto this taxonomy; the taxonomy itself extends only when a genuinely new failure category is identified across providers, not per-provider special cases.

## 7. Capability evolution / provider registration

New providers (illustrative sequencing — a Phase 8 Roadmap decision, not fixed here): AWS, Azure, GCP, Hetzner first, then `HiveGPUProvider` (if GPU capacity warrants a dedicated provider abstraction beyond generic compute) and `HiveBareMetalProvider` (Stage 4, owned infrastructure). Each new provider implements `ProviderMetadata` and `ProviderExecutor` and registers with the platform — no change to `HiveGateway`, `ProviderSelector`'s core logic, or any capability service is required beyond that registration. This is the concrete test of whether `ADR-020`'s abstraction actually held: if adding `HiveBareMetalProvider` later requires touching control-plane code, that's a signal the abstraction was drawn in the wrong place, the same test already applied to contributors (`ADR-005`/`ADR-007`) and now to providers (`ADR-020`).

## Phase 4 deliverables — status

- Provider Framework Specification: **this document.**
- Provider lifecycle diagrams: **§1, above** (role diagram); full lifecycle state diagram already exists at `ADR-022`, not duplicated here.
- Provider metadata model: **§2, above.**
- Provider execution contract: **§3, above.**
- Capability discovery protocol: **§2, above.**
- Provider selection strategy: **§5, above.**
- Error normalization taxonomy: **§6, above (formalized in `ADR-027`).**
- Provider capability matrix: **§4, above** — explicitly illustrative/Planned, not a real support commitment.
- ADR updates: **`ADR-020` amended** (metadata/execution split), **`ADR-027` written** (failure handling, from Phase 3's gap).
