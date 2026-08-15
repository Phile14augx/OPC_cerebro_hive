# HiveForge Masterplan — Phase 0: Executive Foundation

**Status:** Draft, pending your review and approval via the checklist in §10. This is a from-scratch strategy exercise — unlike every `audit/` document in this project, nothing here is grounded in existing code, PRDs, or ADRs unless explicitly marked **Verified** below.

## Amendment log

- **2026-07-29 — Amendment 3:** Added a fifth evidence status, **Vision** (exploratory/long-term direction, not yet scoped into a specific ADR or capability), to §0's legend, per Phase 8 (`08-ROADMAP.md` §3). Distinguished from **Planned**: Planned means a document or ADR already specifies the thing's shape; Vision means only the direction is named.
- **2026-07-29 — Amendment 2:** Added `AIGovernanceEngine` as a seventh HiveShield internal module (§1), per Phase 6 (`06-SECURITY.md` §0, `ADR-029`). Distinct from `PolicyEngine` — `PolicyEngine` answers resource-access questions, `AIGovernanceEngine` answers AI-workflow-execution-constraint questions, both evaluating the same `Policy` aggregate via different evaluators.
- **2026-07-29 — Amendment 1:** Added an eighth capability, `HiveDatabase`, to §3's capability inventory. Surfaced while writing Phase 2 (Service Catalog) — PostgreSQL/MySQL/Redis/Kafka/OpenSearch didn't map cleanly onto HiveCompute or HiveStorage. Resolved per your decision: databases are a distinct service domain (HA, replication, failover, backup/restore, connection management — not just compute or just storage), not a sub-category of either. See §3 for the amended table and internal service-family breakdown.

## Evidence status legend

| Status | Meaning |
|---|---|
| **Verified** | Confirmed by repository inspection or existing implementation. |
| **Approved** | Accepted architectural decision (ADR/PRD) — nothing in this document is at this status yet; it's reached via the §10 checklist. |
| **Planned** | Intended future capability; scoped and specified, not yet built. |
| **Vision** | Exploratory or long-term direction; not yet scoped into a specific ADR or capability. |
| **Open Decision** | Requires product or business approval before architecture proceeds. |

Every substantive claim below is tagged with one of these.

## 1. Where HiveForge sits

**Status: Open Decision** (naming and scope both) / **Verified: `CerebroStudio` only**

You described the product family as:

```
CerebroHive (Company)
│
├── CerebroStudio   — the workflow/agent builder and orchestration product
├── CerebroArchive
├── CerebroFlow
├── HiveOps
├── HiveShield
└── HiveForge       — the cloud infrastructure platform
```

Of these, only `CerebroStudio` is **Verified** — confirmed directly against `apps/studio` in this repository. `CerebroArchive`, `CerebroFlow`, `HiveOps`, and `HiveShield` are **Planned/declared** — named in this conversation for the first time, not confirmed against any repository, PRD, or ADR. As you noted, I can't rule out that they exist elsewhere outside what I have visibility into — but absent that evidence, "declared, not verified" is the accurate status, and it's on you to confirm one way or the other per the §10 checklist.

**Naming collision — resolved, 2026-07-29:** `HiveShield` is the canonical platform-capability name (used consistently in the product registry, masterplan, service catalog, architecture diagrams, and user-facing docs). Internal implementation modules get responsibility-oriented names instead of reusing it:

```
HiveShield (Platform Capability)
│
├── PolicyEngine
├── CloudSecurityPosture
├── ThreatDetectionEngine
├── ComplianceEngine
├── KeyManagementService
└── SecurityEvents
```

General naming convention this establishes for the rest of the masterplan: **platform capabilities** get business-oriented names (`HiveShield`, `HiveCompute`, `HiveStorage`, ...); **internal services/modules** get responsibility-oriented names (`PolicyEngine`, `ResourceScheduler`, `CredentialBroker`, `BillingAggregator`, ...). Phase 3 (Control Plane) and later phases should follow this pattern rather than reintroduce ambiguity.

HiveForge's declared role: the infrastructure layer other CerebroHive products (CerebroStudio first) run on, designed as if its first consumer were an external paying customer from day one — the "dogfooding" model you described, where CerebroStudio becomes HiveForge's first tenant.

## 2. Architectural principles (separable from commercial strategy)

**Status: Open Decision, but structurally independent of pricing/positioning** — these are commitments about how HiveForge is built, not what it costs or who it's sold to. You can approve these without having settled §5–§7.

1. **API-first.** Every capability is reachable via a documented API before any UI exists for it, including internal (CerebroStudio-facing) usage.
2. **Multi-cloud, provider abstraction as the product.** AWS/Azure/GCP/Hetzner/owned-infrastructure stay interchangeable behind one interface (detailed in Phase 4). If a feature can only be built by assuming one specific provider, that's the abstraction leaking, not a shortcut to take.
3. **Event-driven control plane.** Provisioning, billing, and policy state changes propagate as events, not polled state — detailed in Phase 3.
4. **Zero Trust.** No implicit trust between HiveForge's own internal services, let alone between tenants — detailed in Phase 6.
5. **Multi-tenancy from day one.** Internal-first, external-ready — not internal-only, retrofitted later. CerebroStudio is tenant one, not a special case exempt from the tenancy model.
6. **Observability by default.** Every provisioned resource and control-plane action is traced/logged/metered from first implementation, not bolted on before GA.
7. **Every architectural decision gets an ADR** — the same discipline already established in this codebase (`audit/adr/ADR-001`–`ADR-007`), not a separate documentation culture for HiveForge.
8. **No claim gets made without evidence behind it.** The standard this entire project has already been held to (including two retracted claims in the immediately preceding work). A HiveForge service catalog entry marked "supported" means a real, tested implementation exists — not a planned one described as if built.

## 3. Capability inventory

**Status: Planned** (all rows) — reframed per your note: this is a logical capability model, not a claim that these products exist. (Originally seven capabilities; now eight, per Amendment 1 below adding `HiveDatabase`.)

| Capability | Description | Status |
|---|---|---|
| HiveCompute | VMs, bare metal, GPU compute, Kubernetes, serverless | Planned |
| HiveStorage | Object, block, file storage, snapshots, backups | Planned |
| HiveNetwork | VPC, subnets, load balancers, DNS, VPN, firewalls | Planned |
| HiveIdentity | IAM, org/team/RBAC, API keys | Planned |
| HiveGateway | Unified provisioning API, provider abstraction entry point | Planned |
| HiveConsole | Customer-facing dashboard | Planned |
| HiveShield | Security capability (PolicyEngine, CloudSecurityPosture, ThreatDetectionEngine, ComplianceEngine, KeyManagementService, SecurityEvents — see §1 naming resolution) | Planned |
| HiveDatabase | Managed database services — relational, cache, streaming, search (added per Amendment 1, above) | Planned |

Their relationship to the Phase 4 provider framework and Phase 2 service catalog is defined there, not here — this table exists only to fix vocabulary before those phases use it.

## 4. Vision

**Status: Open Decision**

**Current hypothesis:**
> HiveForge is the infrastructure layer that lets a team provision compute, storage, networking, Kubernetes, and AI infrastructure across multiple cloud providers through one consistent API and dashboard — starting as a broker across AWS, Azure, GCP, and bare-metal providers, and growing into an owned-infrastructure provider as scale justifies it.

**Decision required:** Confirm, rewrite, or replace this statement in your own words.

**Impact:** Every later phase's scoping (service catalog breadth, provider priority order, roadmap sequencing) inherits whatever vision is confirmed here.

## 5. Mission

**Status: Open Decision**

**Current hypothesis:**
> Make multi-cloud infrastructure provisioning as simple as single-provider provisioning, for teams who don't want to choose one cloud vendor, or want a managed layer above raw cloud APIs without losing control of where workloads run.

**Decision required:** Confirm, rewrite, or replace.

**Impact:** Determines whether Phase 2's service catalog optimizes for breadth-across-providers or depth-within-a-managed-layer first.

## 6. Product positioning

**Status: Open Decision**

**Current hypothesis:** No defensible answer exists yet for *why a customer picks HiveForge over provisioning AWS/Azure/GCP directly, or over an existing multi-cloud tool*. Candidates, not conclusions:
- Simplicity/unified API and billing across providers (the DigitalOcean bet).
- Bundled with CerebroStudio/other CerebroHive products — infrastructure + orchestration as one vendor relationship.
- Price arbitrage across providers — only credible once HiveForge has real volume/negotiating leverage, not a Stage 1 claim.

**Decision required:** Which differentiation HiveForge actually leads with, and against which named competitors.

**Impact:** Directly shapes Phase 2 service catalog priority and Phase 5 marketplace design.

## 7. Target customers

**Status: Open Decision**

**Current hypothesis:** Two plausible segments, unvalidated — (a) internal, CerebroHive's own products, CerebroStudio first; (b) external, later, teams resembling CerebroStudio's own target users who'd want infrastructure bundled with orchestration tooling they already use.

**Decision required:** A specific ICP (company size, industry, technical sophistication, budget) before Phase 2 can prioritize the catalog sensibly — a small-team PaaS customer and an enterprise platform-engineering buyer need different catalogs.

**Impact:** Phase 2 (Service Catalog) and Phase 5 (Business Platform: marketplace, billing tiers) both depend on this.

## 8. Business model

**Status: Open Decision**

**Current hypothesis, staged with the infrastructure strategy:**
- Stage 1 (Marketplace/reseller): margin over underlying provider cost, usage-based billing passthrough plus a platform fee.
- Stage 2 (Managed services): premium pricing for managed Kubernetes/databases/storage abstraction over raw provisioning.
- Stage 3 (AI infrastructure): GPU cluster access — likely highest-margin if demand holds.
- Stage 4 (Owned infrastructure): capital-intensive, justified only once Stages 1–3 prove demand and volume.

**Decision required:** Real pricing, margin targets, and revenue projections — none are asserted here; they require cost data (negotiated provider rates, projected volume) this document has no access to.

**Impact:** Determines whether Phase 1's billing/metering architecture needs to support tiered/metered pricing from the start or can be simplified for Stage 1 only.

## 9. Success metrics

**Status: Open Decision**

**Current hypothesis**, structural only, staged by phase:
- Stage 1: resources provisioned across providers, provisioning success rate/uptime, time-to-provision vs. calling providers directly.
- Stage 2: managed-service adoption rate vs. raw provisioning, support burden per managed resource.
- Stage 3: GPU utilization rate, inference latency/cost competitiveness.
- Stage 4: unit economics of owned infrastructure vs. the provider cost it replaces.

**Decision required:** Numeric targets — depend on funding, timeline, and risk tolerance outside this document's scope.

## 10. Phase 0 approval checklist

**Resolved, 2026-07-29:** architecture items approved; business items explicitly deferred (non-blocking) — see the Phase 1 Authorization note below.

**Business — deferred, not approved, explicitly non-blocking**
| Decision | Status |
|---|---|
| Vision wording (§4) | Deferred |
| Mission wording (§5) | Deferred |
| Competitive positioning (§6) | Deferred |
| Primary customer segments (§7) | Deferred |
| Pricing strategy / business model (§8) | Deferred |
| Success metric targets (§9) | Deferred |

**Architecture — approved**
- [x] Hybrid phased strategy (Stage 1→4) approved
- [x] Architectural principles (§2) approved
- [x] Capability inventory (§3) accepted as vocabulary, including the resolved `HiveShield` naming convention
- [x] Scope boundaries (§11) confirmed

### Phase 1 Authorization

Phase 1 is authorized to proceed on the basis of approved architectural decisions only. Business strategy decisions identified above remain open and are explicitly classified as **non-blocking** for architectural implementation. Features or implementation work that materially depend on unresolved business decisions — pricing, commercial packaging, or target-market-specific capabilities — require separate approval before execution, not implicit assumption during Phase 1–4 architecture work.

Business decisions should be finalized before milestones that actually depend on them: public launch, pricing implementation, sales collateral, marketing site, investor materials, commercial contracts. By then the technical foundation will already exist, which should make those decisions more concrete, not less.

## 11. Explicit scope and non-goals

**In scope**, across Phases 1–8: provider abstraction design, control plane architecture, service catalog definition, security architecture, operations model, phased roadmap.

**Explicitly not in scope:**
- Actual implementation — this is a planning program, consistent with how M26.1 kept architecture and implementation sequential rather than concurrent.
- Financial modeling beyond the structural placeholders in §8–§9.
- A commitment that Stage 3/4 will happen — contingent on earlier stages succeeding, not guaranteed roadmap.
- Any claim that `CerebroArchive`, `CerebroFlow`, `HiveOps`, or `HiveShield`-the-product exist as built products — declared only, per §1.
