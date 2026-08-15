# HiveForge Masterplan — Phase 1: Platform Architecture Specification

**Status:** Proposed, per Phase 0 authorization (architecture track only — business decisions remain deferred/non-blocking per `00-FOUNDATION.md` §10). This document defines architectural **contracts** — invariants later services and ADRs must conform to — not implementation detail. Companion document: `01-DOMAIN-MODEL.md` (read first; this spec assumes its aggregates).

**Numbering reconciliation:** your message proposed two overlapping ADR numbering schemes — a table (ADR-020–024) and a fuller bulleted list (ADR-020–026). The bulleted list is more complete (it separates out Resource Lifecycle and Multi-Tenant Isolation as their own decisions, correctly — both are substantial enough to warrant independent ADRs rather than being folded into HiveGateway/Identity). This document adopts the **7-ADR list** as canonical; the table's numbering is superseded, not both kept in parallel.

| ADR | Decision |
|---|---|
| ADR-020 | Provider Abstraction Layer |
| ADR-021 | HiveGateway as the Platform Control Plane |
| ADR-022 | Resource Lifecycle State Machine |
| ADR-023 | Identity & Credential Escrow |
| ADR-024 | Event-Driven Platform Architecture |
| ADR-025 | Billing & Metering Model |
| ADR-026 | Multi-Tenant Isolation Strategy |

## 1. Architecture overview

**System context.** HiveForge sits between (a) HiveConsole/API callers — initially CerebroStudio, later external customers — and (b) infrastructure Providers (AWS, Azure, GCP, Hetzner, future owned infrastructure). Every call flows: caller → HiveGateway (control plane) → Provider Abstraction Layer → a specific Provider adapter → the actual cloud API.

**Capability decomposition** (per Phase 0 §3, unchanged here): HiveCompute, HiveStorage, HiveNetwork, HiveIdentity, HiveGateway, HiveConsole, HiveShield. HiveGateway is architecturally distinguished from the others — it's the control plane every other capability's provisioning calls pass through, not a peer service beside them.

**Trust boundaries**, top to bottom:
1. External caller ↔ HiveGateway (authenticated via HiveIdentity; zero trust — every call authenticated and authorized, no network-position-based trust).
2. HiveGateway ↔ internal capability services (HiveCompute, HiveStorage, etc.) — service-to-service auth, not open internal network trust.
3. Capability services ↔ Provider Abstraction Layer ↔ `ProviderExecutor` implementations ↔ actual cloud provider APIs — credentials for this boundary are escrowed and scoped per ADR-023, never held long-lived by capability services themselves.

## 2. Provider Abstraction Layer → ADR-020

**Updated per Phase 4:** the orchestration layer (HiveGateway and the capability services) depends only on Provider interfaces, never on a specific provider's SDK directly — now split into a metadata (discovery) contract and an execution contract, per `ADR-020`'s Phase 4 amendment and elaborated fully in `04-PROVIDER-FRAMEWORK.md`:

```
interface ProviderMetadata {
  listRegions(): Region[]
  listResourceTypes(): ResourceTypeDescriptor[]
  listCapabilities(): CapabilityDescriptor[]
  getQuotas(): QuotaDescriptor[]
}

interface ProviderExecutor {
  provision(resourceSpec): Operation
  deprovision(resourceId): Operation
  describe(resourceId): ResourceState
}
```

**Capability discovery**, not a static support matrix: a Provider adapter declares what it supports (e.g., "GPU compute: yes, spot pricing: yes, managed Kubernetes: yes") rather than HiveForge maintaining a separate, driftable capability list per provider. This directly enforces Phase 0 principle #2 (provider abstraction is the product) — if a capability can only be expressed by breaking this interface, that's a signal the interface is wrong, the same standard ADR-005 already applied to contributor interfaces in `packages/engineering-review`.

**Adapter lifecycle**: registered, versioned, health-checked independently — a failing AWS adapter must not take down Azure/GCP provisioning. This mirrors the failure-isolation principle already proven in `EngineeringReviewOrchestrator.safeExecute()` (one contributor failing doesn't abort the whole review) — same pattern, applied to provider adapters instead of review contributors.

## 3. Control Plane (HiveGateway) → ADR-021

HiveGateway responsibilities: request authentication/authorization (delegating to HiveIdentity), request validation against Policy (delegating to HiveShield's PolicyEngine), routing to the correct capability service, orchestrating multi-resource Deployments, and recording Operations. HiveGateway does **not** itself implement provisioning logic — that's each capability service's job, calling the Provider Abstraction Layer. HiveGateway is orchestration, not domain logic — the same separation of concerns `EngineeringReviewOrchestrator` already draws between itself and its contributors.

Workflow execution (multi-step Deployments) is modeled as a sequence of Operations against a Deployment's Resources, not as an opaque script — every step individually auditable, matching the append-only Operation record fixed in the domain model.

## 4. Data Plane

The data plane is where compute/storage/network Resources actually run — entirely within Provider infrastructure, not inside HiveForge's own control-plane services. HiveForge's data-plane responsibility is limited to: issuing provisioning calls, monitoring health, and (for owned infrastructure, Stage 4 only) actually hosting resources directly. Until Stage 4, HiveForge has no data plane of its own — this is worth stating explicitly so Phase 1–3 architecture doesn't accidentally assume compute capacity HiveForge doesn't have yet.

## 5. Resource Model → ADR-022

Covered in full in `01-DOMAIN-MODEL.md` §3. This section's role is narrower: fixing that the Resource lifecycle state machine is a **platform-wide contract**, not something each capability service (HiveCompute, HiveStorage, ...) reinvents independently. A Resource in any capability moves through the same `Requested → Provisioning → Active → {Updating|Degraded} → Deleting → Deleted` shape — capability-specific detail (e.g., what "Degraded" means for a VM vs. a bucket) is Phase 2 (Service Catalog) scope, not a different state machine.

## 6. Identity & IAM → ADR-023

Two distinct identity concerns, not one:
1. **HiveForge-facing identity** — who is calling the HiveGateway API (a human user, a service account, CerebroStudio itself). Authenticated via HiveIdentity, using standard OIDC/OAuth2 patterns.
2. **Provider-facing credentials** — what HiveForge uses to actually call AWS/Azure/GCP on the caller's behalf. These are **escrowed, short-lived, and scoped per-Operation**, never long-lived static credentials held by capability services. This is the "Credential Escrow" model: HiveIdentity's KeyManagementService issues narrowly-scoped, time-limited credentials to a capability service immediately before a Provider call, not in advance.

RBAC is scoped at Organization/Tenant/Project/Workspace per the domain model's Policy attachment levels — the actual role/permission model is ADR-023's detail, not fixed further here.

## 7. Regional Topology

HiveForge does not invent a new region taxonomy. Each Provider's real regions/AZs are exposed through a normalized `Region`/`AvailabilityZone` shape (domain model §2), tagged with the owning Provider — a HiveForge "region" is never a fiction independent of what a Provider actually offers. Failover assumptions (cross-region, cross-provider) are **not** fixed at this phase — multi-region HA is Phase 7 (Operations) scope, and shouldn't be assumed available until that phase specifies it.

## 8. Networking

VPC abstraction: HiveNetwork exposes a normalized VPC/subnet/load-balancer/DNS/firewall model, mapped per-provider by the Provider Abstraction Layer the same way compute/storage are. Whether HiveForge operates its own service mesh across provisioned resources (vs. relying on each provider's native networking) is an **open architectural question**, not decided here — flagged for Phase 2 (Service Catalog, HiveNetwork's detailed spec) rather than assumed either way.

## 9. Storage

Object/block/file storage abstractions follow the same Provider Abstraction Layer pattern as compute. Snapshots and backups are modeled as Operations against a Resource (per the domain model), not a separate parallel entity — a snapshot is itself a Resource with a lineage reference to its source, keeping one Resource/Operation model instead of a second one for backups specifically.

## 10. Observability

Per Phase 0 principle #6 (observability by default): every Operation is traced from creation, every Resource emits health/metric events consumed by HiveShield's SecurityEvents and a platform-wide metrics/logging/tracing pipeline (mechanism — OpenTelemetry-based or otherwise — is an implementation decision for whoever builds this, not fixed by this spec). The `ContributorResult` pattern in `packages/engineering-review` (which now requires `startedAt`/`completedAt`/`durationMs`/`metrics` on every result, per ADR-007's addendum) is a small but real precedent already established in this codebase for "observability fields aren't optional, they're part of the contract" — HiveForge's Operation record should hold the same standard.

## 11. Billing & Metering → ADR-025

Every billable action produces an immutable `UsageRecord` (domain model §2), referencing the Operation and Resource that produced it. Metering is event-driven (§12) — a UsageRecord is emitted as an event when an Operation completes, not computed retroactively by scanning Resource state. This makes the billing pipeline a consumer of the same event bus everything else uses, not a separate polling system.

## 12. Event-Driven Architecture → ADR-024

**Event taxonomy** (illustrative, finalized in ADR-024): `ResourceRequested`, `ResourceProvisioned`, `ResourceDegraded`, `ResourceDeleted`, `OperationCompleted`, `OperationFailed`, `UsageRecorded`, `PolicyViolationDetected`. **Producers**: HiveGateway and capability services, on every state transition. **Consumers**: the billing pipeline (§11), HiveShield's SecurityEvents, HiveConsole's live status views, and — per the Phase 0 "internal-first" principle — CerebroStudio itself, as HiveForge's first tenant consuming these events the same way an external customer eventually would. **Delivery guarantees**: at-least-once, with consumers required to be idempotent (an Operation/UsageRecord's own id is the natural idempotency key) — exactly-once is not assumed or promised at this phase.

## Cross-references to existing project precedent

This spec deliberately borrows patterns already proven in this repository rather than inventing unrelated ones: append-only evidence (`EvidenceReference` in `packages/engineering-review`) → append-only `UsageRecord`/`Operation`; contributor failure-isolation (`safeExecute`) → provider-adapter failure isolation; the ADR discipline itself (`ADR-001`–`ADR-007`) → `ADR-020`–`ADR-026`. This isn't coincidence — Phase 0 principle #7 requires it, and reusing a pattern this codebase has already exercised (and, in the M26 vertical-slice review, already caught and corrected real mistakes in) is lower-risk than inventing a new one for HiveForge specifically.
