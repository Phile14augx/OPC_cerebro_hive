# HiveForge Masterplan — Phase 1a: Domain Model

**Status:** Proposed, per Phase 0 authorization (architecture track). This defines the ubiquitous language every later ADR, API, and service in this masterplan uses — written before the Provider Abstraction Layer (§Phase 1b) per your instruction, since the abstraction has to operate on named entities that exist first.

Per the Phase 0 governance rule: this document does not reopen anything approved in `00-FOUNDATION.md`. Where a domain decision here turns out to conflict with a Phase 0 principle, that's an amendment to raise explicitly, not something to silently resolve in this doc.

## 1. Aggregate hierarchy

```
Organization
    │
    ├── Tenant (1:N — an Organization may operate multiple isolated Tenants,
    │           e.g. separate business units, or a reseller's own customers)
    │       │
    │       └── Project (N per Tenant — the unit of billing/quota grouping)
    │               │
    │               └── Workspace (N per Project — the unit of resource
    │                       │       co-location and access-control scoping)
    │                       │
    │                       └── Deployment (N per Workspace — a named,
    │                               │        versioned set of provisioned
    │                               │        Resources, analogous to a
    │                               │        Terraform "stack" or CDK "app")
    │                               │
    │                               └── Resource (N per Deployment — the
    │                                       │      atomic provisioned unit:
    │                                       │      one VM, one bucket, one
    │                                       │      cluster, etc.)
    │                                       │
    │                                       └── Operation (N per Resource —
    │                                              every state-changing
    │                                              action taken against it)
```

Cross-cutting aggregates, not part of the containment hierarchy above but referenced by it:

- **User** (added, Phase 5) — belongs to exactly one `Organization`; granted roles at any level of the hierarchy via `Policy` attachment. See §2 below.
- **Provider** — a supported infrastructure backend (AWS, Azure, GCP, Hetzner, future owned infrastructure). Referenced by `Resource`, never contained by `Organization`/`Tenant`/etc.
- **Region** / **AvailabilityZone** — provider-scoped location entities. `Region` belongs to exactly one `Provider`; `AvailabilityZone` belongs to exactly one `Region`.
- **Policy** — an authorization/guardrail rule, attachable at `Organization`, `Tenant`, `Project`, or `Workspace` level (inheritance detailed in §4).
- **UsageRecord** — an immutable, append-only metering event, always referencing the `Resource` and `Operation` that produced it.
- **BillingAccount** — attached at the `Organization` level (**resolved, Phase 5** — see `05-BUSINESS-PLATFORM.md` §1b; a reseller Organization operating multiple Tenants uses multiple BillingAccounts referencing Tenants under one Organization, not a Tenant-owned BillingAccount). Aggregates `UsageRecord`s into billable amounts.
- **User** — added, Phase 5 (`05-BUSINESS-PLATFORM.md` §1a). Belongs to exactly one `Organization`; never global/cross-Organization. Granted roles via `Policy` attachment at any level of the Tenant→Project→Workspace hierarchy. Service accounts and API keys are a `User` subtype, not a separate entity.

## 2. Aggregate definitions

### Organization
The root tenant boundary — the customer relationship itself (whether that customer is an external company or, for HiveForge's first tenant, CerebroHive/CerebroStudio internally). Owns billing at the top level, holds the org-wide identity provider configuration.

### Tenant
A logically isolated operating unit within an Organization. Most Organizations will have exactly one Tenant initially; the concept exists so a reseller-style Organization (a company reselling HiveForge capacity to its own customers) can operate multiple isolated Tenants under one Organization without them sharing data or quotas.

### Project
The billing/quota grouping unit beneath a Tenant — analogous to an AWS account or a GCP project. Quotas (§Phase 1, Resource Model) are enforced at this level by default.

### Workspace
The access-control and co-location scoping unit beneath a Project — a group of Resources that share IAM boundaries and are typically deployed together (e.g., "production," "staging"). Distinct from Project because quota and access-control don't have to be scoped identically — a Project might have a shared budget across multiple Workspaces with different team access.

### Deployment
A named, versioned collection of Resources, provisioned and torn down as a unit. This is HiveForge's equivalent of a Terraform state file or CDK stack — the thing a `HiveGateway` provisioning call actually operates on.

### Resource
The atomic provisioned unit — one VM, one bucket, one Kubernetes cluster, one load balancer. Every Resource has exactly one `Provider`, exactly one `Region` (and optionally an `AvailabilityZone`), and a lifecycle state (§3).

### Operation
An immutable record of a single state-changing action taken against a Resource (provision, resize, delete, snapshot, etc.) — the audit trail and the unit `UsageRecord`s attach to. Operations are never mutated or deleted once recorded, consistent with the "no claim without evidence" principle from Phase 0 — an Operation's record is the evidence a UsageRecord or billing line item traces back to.

### Provider
A supported infrastructure backend. Detailed fully in the forthcoming Provider Abstraction Layer document (Phase 1b) — this domain model only fixes that `Provider` is a first-class entity every `Resource` references, not an implicit detail buried in configuration.

### Region / AvailabilityZone
Provider-scoped location entities. HiveForge does not invent its own region taxonomy — it maps to each Provider's real regions/AZs, exposed through a normalized shape (exact normalization strategy is Provider Abstraction Layer scope, not this document's).

### Policy
An authorization/guardrail rule. Can restrict which Providers/Regions a Workspace may provision into, cap resource types or sizes, or require approval workflows for certain Operations. Attachable at Organization/Tenant/Project/Workspace, with inheritance (a Policy at Organization level applies to everything beneath it; a more specific Policy may only narrow it, never widen it — full precedence/conflict-resolution rules in `ADR-038`, not Phase 6 as this section previously, incorrectly, stated).

### UsageRecord
An immutable, append-only record of billable consumption, always traceable to the Operation and Resource that produced it. Never mutated post-creation — corrections are new, offsetting UsageRecords, never edits, matching the append-only evidence pattern already established in `packages/engineering-review`'s own domain model (`EvidenceReference`s are append-only there too — the same discipline, applied to a different aggregate).

### BillingAccount
Aggregates UsageRecords into billable amounts. Attachment level (Organization vs. Tenant) is an **Open Decision** — see §6.

## 3. Resource lifecycle (state machine, high-level)

```
Requested → Provisioning → Active → { Updating → Active | Degraded → Active | Degraded → Failed }
                                   → Deleting → Deleted
```

- `Requested`: a provisioning call has been accepted but not yet dispatched to a Provider adapter.
- `Provisioning`: dispatched, in progress.
- `Active`: provisioned and healthy.
- `Updating`: a modification is in progress (resize, config change) — returns to `Active` on success.
- `Degraded`: provisioned but a health check is failing — can recover to `Active` or fail terminally.
- `Deleting` / `Deleted`: teardown in progress / complete. `Deleted` is terminal — a "recreate" is a new Resource, not a resurrected one, preserving Operation history integrity.

This state machine is deliberately simple at this phase — the full transition table (which states allow which Operations, concurrent-transition handling, idempotency keys) is Phase 3 (Control Plane) scope, formalized as its own ADR (`ADR-022`, per the reconciled numbering in §7 of the Platform Architecture Specification).

## 4. Policy inheritance (fixed here; precedence/override still open)

Policies attach at any level of the Organization→Tenant→Project→Workspace hierarchy and are inherited downward. This document fixes only that inheritance exists and flows downward, not the precedence/override algorithm when Policies conflict across levels.

**Correction, Phase 8 mechanical consistency pass:** this section previously said the override algorithm was "Phase 6 (Security) scope." Phase 6 (`06-SECURITY.md`) was written and did not, in fact, define one — checked directly, the term doesn't appear there. This was recorded as a genuine open gap in `08-ROADMAP.md` §2, then **resolved by `ADR-038`** (post-Masterplan): deny-precedence, child-narrows-never-widens, top-down accumulating evaluation across Organization→Tenant→Project→Workspace.

## 5. Relationship to the capability model (Phase 0 §3)

The aggregates above are cross-cutting infrastructure concerns; the eight capabilities (HiveCompute, HiveStorage, HiveNetwork, HiveIdentity, HiveGateway, HiveConsole, HiveShield, and `HiveDatabase` — added per Phase 0 Amendment 1, surfaced while writing the Service Catalog) are the services that operate on these aggregates. For example: HiveCompute creates/manages `Resource`s of compute type; HiveIdentity manages `Policy` and authentication for `Organization`/`Tenant`; HiveGateway is the entry point that turns an API call into `Operation`s against `Resource`s within a `Deployment`. This mapping is elaborated per-capability in the Service Catalog (Phase 2), not here.

## 6. Open decisions — status

Both decisions originally flagged here are now **resolved in Phase 5** (`05-BUSINESS-PLATFORM.md` §1b, §3), ahead of Phase 0 §7 (target customers) resolving, since Phase 5 needed an answer first:

- **BillingAccount attachment level:** resolved — Organization level (§2, above).
- **Workspace vs. Project as the quota-enforcement boundary:** resolved — Entitlement (the ceiling) is set at Project level; Quota (live consumption) is tracked at Workspace granularity as a sub-view of its Project's Entitlement, not an independently enforceable ceiling. See `05-BUSINESS-PLATFORM.md` §3 for the full Entitlement/Quota distinction this answer depends on.
