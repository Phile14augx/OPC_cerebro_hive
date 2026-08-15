# HiveForge Masterplan — Phase 5: Business Platform

**Status:** Proposed, per Phase 4 completion. Per Phase 0 §10's authorization boundary (architecture approved, commercial strategy deferred/non-blocking): this phase defines the *architecture* of organizations, ownership, quota, metering, identity integration, and administrative APIs — not pricing, packaging, or go-to-market, which remain open per `00-FOUNDATION.md` §7–§8.

## 1. Business domain model — reconciled with `01-DOMAIN-MODEL.md`

Your proposed hierarchy adds two things not yet in the domain model: `Users` as a first-class entity, and a direct `Organization → Billing Account` edge. Reconciling rather than maintaining two competing domain models:

```
Organization
    ├── User            (new — added below, §1a)
    ├── BillingAccount   (resolves the open attachment-level decision, §1b)
    └── Tenant
          └── Project
                └── Workspace
                      └── Deployment → Resource → Operation   (unchanged, per 01-DOMAIN-MODEL.md §1)
```

**§1a — `User` added as a new aggregate.** A `User` belongs to an `Organization` (per Phase 0's Zero Trust/multi-tenancy principles, a User is never global/cross-Organization) and is granted roles at any level of the Tenant→Project→Workspace hierarchy via `Policy` attachment (unchanged mechanism from `01-DOMAIN-MODEL.md` §4). Service accounts and API keys (§5, below) are modeled as a `User` subtype, not a separate entity — they carry the same RBAC/Policy attachment mechanism a human User does, which avoids a second, parallel authorization model for machine identities.

**§1b — BillingAccount attachment level, resolved.** `01-DOMAIN-MODEL.md` §6 flagged this as open, deferred to "Phase 0 §7 or Phase 5, whichever comes first." Phase 0 §7 (target customers) is still deferred — so this resolves it here, as Phase 5 needs an answer to specify the metering pipeline (§4) concretely. **Decision: BillingAccount attaches at the Organization level.** A Tenant-level reseller scenario (one Organization operating multiple isolated Tenants, each wanting separate billing) is real per the domain model's own reseller rationale — but modeled as multiple BillingAccounts *referencing* Tenants under one Organization, not as BillingAccount moving to be a Tenant-owned aggregate. This keeps one BillingAccount shape regardless of whether an Organization runs one Tenant or many. `01-DOMAIN-MODEL.md` §2/§6 should be updated to reflect this as resolved, not open (see Architectural Impact, §8 below).

## 2. Ownership model

Every `Resource` (per `01-DOMAIN-MODEL.md` §2) carries, as first-class attributes rather than optional metadata:

- **Owner** — the `User` (or service account) that created it.
- **BillingAccount** — resolved transitively via its owning `Organization` (§1b), not stored redundantly on every Resource.
- **Project** — its position in the domain hierarchy (Workspace's parent).
- **Region** — per `01-DOMAIN-MODEL.md` §2's `Region`/`AvailabilityZone`.
- **Lifecycle state** — per `ADR-022`, unchanged.
- **Tags** — free-form, customer-assigned, for the customer's own organizational purposes — HiveForge does not interpret tag content for any platform logic (billing, policy, quota all use the structural hierarchy, not tags) to avoid tags becoming a shadow, unversioned second ownership model.
- **Audit lineage** — every Resource's full Operation history (per the domain model's append-only Operation record) is its audit lineage; not a separate tracked field, since it's already structurally derivable.

This gives every Resource exactly one authoritative owner and one path to its billing account — no Resource is ownerless or has ambiguous billing attribution, a concrete, testable invariant (see §7).

## 3. Quota and entitlement

Kept distinct, per your framing:

- **Entitlement** — what an Organization/Project is *allowed* to use (a ceiling, set by Policy or a future commercial plan — commercial specifics deferred per Phase 0 §8). Entitlements are relatively stable, changed deliberately (a plan upgrade, a support-negotiated limit increase).
- **Quota** — how much of that entitlement is *currently consumed/available*, computed from live Resource state and the Usage Ledger (§4). Quota is a live, frequently-changing view; Entitlement is the ceiling it's measured against.

This resolves `01-DOMAIN-MODEL.md` §6's other open question (Workspace vs. Project as the quota-enforcement boundary) without forcing a single answer: **Entitlement is set at the Project level** (matching the domain model's default), but **Quota is tracked at Workspace granularity** where a customer wants per-environment visibility — a Workspace's consumption is always a sub-view of its Project's Entitlement ceiling, not an independent ceiling of its own. A Project's Entitlement is enforced in aggregate across all its Workspaces; no Workspace can be individually entitled beyond what its Project allows.

## 4. Usage and metering — architectural pipeline

```
ProviderExecutor (ADR-020)
      │  (Operation completes)
      ▼
UsageRecorded event (ADR-024, ADR-025)
      │
      ▼
Normalization        — maps provider-specific units (vCPU-hours, GB-hours, request-count)
      │                 onto HiveForge's own metering vocabulary
      ▼
Usage Ledger         — append-only, per BillingAccount (per 01-DOMAIN-MODEL.md's
      │                 UsageRecord immutability principle)
      ▼
Aggregation          — rolls Usage Ledger entries into billing-period totals
      │
      ▼
Billing API (§6)     — read surface; pricing/invoicing itself is Phase 0 §8 scope,
                        deferred — this pipeline produces the *numbers*, not the *price*
```

This is a direct application of `ADR-024`'s event model and `ADR-025`'s billing architecture — Phase 5 doesn't redecide either, it's the concrete pipeline shape those ADRs implied but didn't fully draw out.

## 5. Identity integration

The Business Platform consumes HiveIdentity; it does not implement its own authentication. Concretely:
- **Organizations, Teams, Roles** — modeled as `Policy` attachment targets (per `01-DOMAIN-MODEL.md` §4), evaluated by HiveShield's `PolicyEngine` (per `ADR-023`/`03-CONTROL-PLANE.md`), not reimplemented here.
- **Service accounts** — a `User` subtype (§1a), authenticated the same way (OIDC/OAuth2 per `ADR-023`), not a separate credential system.
- **API keys** — a credential type bound to a `User` (human or service account), scoped to whatever that User's Policy grants — an API key is never itself a separate authorization principal with its own permissions.
- **Cross-project delegation** — a User's Policy attachment can span multiple Projects/Workspaces within their Organization (per the existing inheritance model); cross-*Organization* delegation is out of scope at this phase — consistent with `ADR-026`'s multi-tenant isolation boundary, which doesn't yet define a cross-tenant sharing mechanism.

## 6. Administrative APIs

Control-plane-adjacent, but distinct from infrastructure provisioning (per `03-CONTROL-PLANE.md`'s command/query separation, §3a — administrative APIs are mostly commands and queries against business entities, not against Resources):

- Organization management (create, update, User membership).
- Project management (create, update, Entitlement assignment).
- BillingAccount management (per §1b's resolved attachment level).
- Quota inspection (read-only — a query, per `03-CONTROL-PLANE.md` §3a; quota is never directly "set," only Entitlement is).
- API credential management (issue/revoke, per §5).
- Usage reporting (a read surface over the Usage Ledger, §4).

These route through HiveGateway the same way infrastructure commands do (per `ADR-021`) — there is no separate, parallel "admin API gateway."

## 7. Architectural validation

- **Can infrastructure capabilities remain unaware of billing?** Yes — `ProviderExecutor` (per `ADR-020`) emits `UsageRecorded` events; it has no billing logic itself, no BillingAccount awareness, consistent with `ADR-025`'s original decision that billing is an event consumer, not embedded in provisioning.
- **Can providers operate without organization-specific logic?** Yes — `ProviderMetadata`/`ProviderExecutor` (per `ADR-020`'s amendment) operate on `ResourceSpec`/`ResourceId`, never on `Organization`/`Tenant` identifiers directly; multi-tenancy is enforced at the control-plane layer (`ADR-026`), not pushed down into provider adapters.
- **Does every resource have a single authoritative owner?** Yes, by construction per §2 — Owner and BillingAccount (via Organization) are structural, not optional fields a Resource could lack.
- **Are business concepts isolated from provider implementations?** Yes — nothing in this document introduces a business-entity-aware provider interface; `Organization`/`Tenant`/`BillingAccount` are control-plane and business-platform concepts exclusively.

## 8. Architectural impact

Per the governance rule adopted this phase onward:

- **ADRs created or amended:** none new. This phase resolves two items `01-DOMAIN-MODEL.md` §6 had already flagged as pending exactly this phase (BillingAccount attachment, quota-enforcement boundary) — it doesn't introduce new ADR-worthy decisions, since both were already anticipated as domain-model detail, not control-plane/provider-framework architecture.
- **Existing specifications requiring updates:** `01-DOMAIN-MODEL.md` §2 needs a `User` aggregate added, and §6 needs both open decisions marked resolved (with a pointer to this document), not left reading as still-open. Doing this now, not deferring it (see below).
- **Future phases depending on these decisions:** Phase 6 (Security) depends on the `User`/service-account model (§1a, §5) for its identity-flow detail; Phase 7 (Operations) depends on the Usage Ledger (§4) for any cost/capacity-planning observability.
- **Assumptions remaining open:** pricing, invoicing, and plan-tier definitions (Phase 0 §8, still deferred) — this document fixes the metering *mechanism*, not what gets charged. Cross-Organization delegation (§5) is explicitly out of scope, not designed around, at this phase.
