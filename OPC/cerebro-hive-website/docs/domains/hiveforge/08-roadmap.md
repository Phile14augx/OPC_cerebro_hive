# HiveForge Masterplan — Phase 8: Roadmap (consolidation)

**Status:** Proposed, per Phase 7 approval. Final phase, per your instruction — no new platform capability is introduced here. This document ties Phases 0–7 together: a dependency map, a deferred-work roadmap, and repository-wide evidence conventions.

**Note on your example dependency table:** your illustrative table referenced `M26.5`, `AIGovernanceEngine` feeding "LLM Contributors," `ADR-013`, and "Future Plugins." None of these are real entries in this masterplan — `ADR-013` doesn't exist (the real ADR sequence is `ADR-006`/`007` for the closed engineering-review work and `ADR-020`–`037` for HiveForge), and no "M26.5" milestone or "LLM Contributors"/plugin architecture has been proposed anywhere in Phases 0–7. Read as illustrating the *format* you want (a concise "Area → Depends on" matrix), not as content to reproduce. §1 below is built from what actually exists.

## 1. Architecture dependency map

| Area | Depends on |
|---|---|
| Domain Model (Phase 1) | Foundation (Phase 0 §2 principles, §3 capability inventory) |
| Platform Architecture (Phase 1) | Domain Model; `ADR-020`–`026` |
| Service Catalog (Phase 2) | Domain Model; Foundation §3 (incl. Amendment 1, `HiveDatabase`) |
| Control Plane (Phase 3) | Platform Architecture; `ADR-020` (metadata/executor split), `ADR-021`, `ADR-022`, `ADR-024`; introduces `ADR-027` |
| Provider Framework (Phase 4) | `ADR-020` (amended); `ADR-027` |
| Business Platform (Phase 5) | Domain Model (resolves its two open decisions); `ADR-024`, `ADR-025` |
| Security (Phase 6) | Foundation §2 principle #4 (Zero Trust); `ADR-023`, `ADR-026` (amends it); Domain Model (`User`, `Policy`); Business Platform (`User` subtype pattern); introduces `ADR-028`–`033` |
| Operations (Phase 7) | Security (`HumanApprovalWorkflow`, `SecureAIGateway`, `AIGovernanceEngine`, `ADR-030` naming); Business Platform (Usage Ledger, `ADR-025`); Control Plane (`ADR-024` events); introduces `ADR-034`–`037` |
| Roadmap (Phase 8, this document) | All of the above — consolidation only, no new dependency introduced |
| Execution Lifecycle Runtime (Phase 9, post-masterplan — `09-EXECUTION-LIFECYCLE-RUNTIME.md`) | Provider Framework (Phase 4, its execution layer is the extension point); `ADR-022` (related precedent, different bounded context); `ADR-038` (policy integration target, sub-phase 9f); Control Plane (Phase 3, `ADR-024` events, sub-phase 9e) — introduces its own ADR(s), not yet drafted |

Reading the map: every phase after 0 depends on something fixed earlier; nothing later silently overrides an earlier decision without an explicit amendment (tracked per-phase in each document's own "Architectural Impact" section). The only two *amended* (not merely extended) ADRs across the whole masterplan are `ADR-020` (metadata/executor split, Phase 4) and `ADR-026` (infrastructure-isolation resolution, Phase 6) — worth knowing as the two places the architecture actually revised itself rather than only adding to itself.

## 2. Deferred roadmap

Consolidating every item this masterplan flagged as intentionally deferred, rather than leaving them scattered per-phase:

**Business decisions (Phase 0 §4–§9, still deferred, non-blocking per the Phase 1 Authorization):** vision/mission wording, competitive positioning, target-customer ICP, pricing/business model, success-metric targets.

**Architecture extensions flagged but not designed:**
- AI Evidence & Provenance implementation (`06-SECURITY.md` §15) — prompt/tool/document/model/approval/execution lineage as traceable chains, beyond the flat `Operation` evidence payload fixed today.
- `SecureAIGateway` vs. `ProviderExecutor` re-evaluation (`ADR-030`'s explicit trigger: revisit when ≥2 non-LLM provider classes need identical routing/telemetry/policy/retry/failover semantics).
- `HiveDatabase`'s `StreamingService`/`SearchService` capability-graduation candidacy (`02-SERVICE-CATALOG.md`) — same pattern as the `SecureAIGateway` trigger, not yet met.
- Dedicated-account isolation `Policy` schema and its pricing implication (`ADR-026`'s amendment, Phase 6) — the default/option split is fixed; the schema and cost aren't.
- Billing API implementation and real pricing/invoicing (`05-BUSINESS-PLATFORM.md` §4/§6) — the metering *mechanism* is fixed; the *price* is not, pending Phase 0 §8.
- Cross-Organization delegation (`05-BUSINESS-PLATFORM.md` §5) — explicitly out of scope, not designed around.
> **Update, post-`ADR-038`:** `@cerebro/hiveshield-policy`'s `HierarchicalPolicyEngine` (built on `@cerebro/policy-core`) — found while inventorying "provider" abstractions ahead of Slice 4, not built by this masterplan's author. Classified via a full checklist (ADR coverage, runtime integration, test coverage, consumers, architectural alignment), not just "verified": **Partial implementation.** Rules 1–4 (deny-precedence, narrow-never-widen, top-down accumulation, outcome precedence) are canonical and the extension point for future work — 8 real tests pass against the actual `policy-core`/`identity-core` source. **Rule 5** ("one algorithm, two evaluators") is now **amended to Deferred**, not unimplemented-and-pending: the real `AIGovernanceEngine` found in the repo (`packages/engineering-review`, under an "M26.5" initiative, added after that package's frozen baseline) doesn't share this outcome-precedence model, but its own code comments frame it as simulating a call to a future "centralized AI Governance engine" — evidence of intended convergence, not a settled decision either way. Whether it converges, gets extended, or stays permanently distinct is left to a future ADR. Isolated (no consumers), strong unit test coverage but no integration/conformance tests. **Update — typed-ID reconciliation complete:** `HierarchyLevelPolicies` now carries an optional, per-level-typed `id?:` (`OrganizationId`/`TenantId`/`ProjectId`/`WorkspaceId` from `packages/domain-model`) instead of no identifier at all — additive only, no evaluation-behavior change, verified by a real `tsc` typecheck and 9/9 passing `vitest` tests (one new, asserting typed ids flow into `HierarchicalPolicyEngine`'s `evaluationPath`). The `TenancyScope` gap below remains open — that reconciliation is a genuine architectural question, not a mechanical one, and was deliberately left untouched. Full detail in `ADR-038`'s "Implementation status" section, which also flags a separate finding: a real test in that same frozen baseline cites a nonexistent `ADR-013`. It surfaced a new gap, recorded below.

> **Open Architectural Question — `TenancyScope` vs. HiveForge's domain hierarchy.** `@cerebro/identity-core`'s `TenancyScope` (`organizationId`/`workspaceId`/`projectId`/`environmentId`, no explicit `Tenant` level) does not map cleanly onto `01-DOMAIN-MODEL.md` §1's `Organization→Tenant→Project→Workspace` hierarchy. `hiveshield-policy`'s `HierarchyTypes.ts` works around this by taking an explicit `PolicyHierarchy` from the caller rather than deriving it from `TenancyScope`. Not yet assigned to any ADR.

> **Open Architectural Question — Policy inheritance precedence. RESOLVED, `ADR-038`.** When Policies conflict across Organization/Tenant/Project/Workspace levels, which one wins? `01-DOMAIN-MODEL.md` §4 fixed that inheritance exists and flows downward, but left the precedence/override algorithm open. This was previously mis-recorded as "Phase 6 (Security) scope" — checked directly during this phase's mechanical consistency pass, `06-SECURITY.md` never defined one; the pointer was corrected at the source (`01-DOMAIN-MODEL.md` §4). **Resolved post-Masterplan by `ADR-038`:** deny-precedence, child-narrows-never-widens, top-down accumulating evaluation, and an outcome-precedence order (`Deny > Human Approval > Step-up MFA > Permit`) extending `ADR-028`'s four-outcome decision engine. No open architectural gap remains as of `ADR-038`.
- SIEM product selection and specific compliance certifications pursued (`06-SECURITY.md` §12/§16).
- Real SLO targets, DR testing cadence, multi-region pattern per workload (`ADR-034`, `ADR-036`, `07-OPERATIONS.md` §10) — frameworks are fixed; the numbers depend on data and customer requirements that don't exist yet.
- Additional review domains / service catalog breadth beyond what's listed (implicit in `02-SERVICE-CATALOG.md`'s Planned-only status) — no specific expansion is proposed here; noted only as a category, since inventing a domain list this document has no evidence to justify would violate Phase 0 principle #8.

**Explicitly not proposed by this masterplan, and not retroactively added here either:** any external analyzer integration, dynamic contributor/plugin discovery mechanism, or "LLM Contributors" architecture — these appeared only in your illustrative dependency-table example (§1, above), not in any Phase 0–7 content. If you want these designed, that's new scope for a Phase 9, not something Phase 8 should quietly absorb.

> **Update — Phase 9 now exists.** `09-EXECUTION-LIFECYCLE-RUNTIME.md`, proposed following `audit/SLICE-5-EXECUTION-LIFECYCLE-REVIEW.md`'s finding that the execution lifecycle (aggregate, state machine, orchestrator, persistence, events, policy integration) exists only as disconnected fragments, not a coherent runtime. Not the "LLM Contributors"/plugin architecture referenced above — a different, evidence-driven scope. See `08-ROADMAP.md` §1's dependency map for its place in the masterplan.

## 3. Repository-wide evidence conventions

`00-FOUNDATION.md` §0's legend (Verified / Approved / Planned / Open Decision) is amended to add a fifth status, per your recommendation, and is hereby declared the convention for *all* documents in this masterplan (and recommended, not mandated, for other `audit/` and `hiveforge/`-adjacent documentation in this repository, since this is HiveForge's own convention, not a repo-wide policy this masterplan has authority to impose unilaterally):

| Status | Meaning |
|---|---|
| **Verified** | Confirmed by repository inspection or existing implementation. |
| **Approved** | Accepted architectural decision (ADR/PRD), not yet implemented. |
| **Planned** | Intended future capability; scoped and specified, not yet built. |
| **Vision** | Exploratory or long-term direction; not yet scoped into a specific ADR or capability. |
| **Open Decision** | Requires product or business approval before architecture proceeds. |

Placement, since "Planned" and "Vision" could otherwise blur: **Planned** means this document (or an ADR) already specifies its shape — `HiveDatabase`'s services, `SecureAIGateway`, `AIGovernanceEngine` are all Planned. **Vision** means the direction is named but not yet specified to that level — Stage 3/4 of Phase 0 §8's business model (GPU infrastructure, owned infrastructure) and the "additional review domains" line in §2 above are Vision, not Planned, since neither has a shape yet.

This amendment is recorded in `00-FOUNDATION.md`'s amendment log (§17, below), not silently applied.

## 4. Architectural impact

Per the standing governance rule, applied one final time:

**ADRs created:** none. Phase 8 is consolidation, per your instruction — introducing a new ADR here would itself violate "no new platform capabilities in Phase 8."

**ADRs amended:** none directly, though §2 above surfaces one real, previously-unassigned gap (the Open Architectural Question on `Policy` inheritance precedence) that should become an ADR whenever it's picked up — recorded as a gap, not silently closed by inventing an ADR number for it here.

**Mechanical consistency pass, run this phase (per your request, before commit):**
- ADR numbering/references checked across every `.md` file in `hiveforge/` and `hiveforge/adr/` — no dangling or duplicate ADR numbers found; all `ADR-0XX` references resolve to a real file except the two intentional exceptions already addressed (`ADR-013`, `08-ROADMAP.md` §1, explicitly flagged as never real; `ADR-006`/`ADR-007`, correctly pointing to the separate, closed `packages/engineering-review` ADR set, not HiveForge's).
- Component names checked for drift: `SecureAIGateway`, `AIGovernanceEngine`, `HumanApprovalWorkflow`, `PolicyEngine`, `PolicyEvaluationClient` all used consistently; no leftover `AIPolicyEngine` or bare "AI Gateway" naming found; remaining `ProviderAdapter` mentions are all intentional historical references documenting `ADR-020`'s amendment, not unfixed stale usage.
- **One real inconsistency found and fixed:** `01-DOMAIN-MODEL.md` §4 (and its §2 `Policy` definition) claimed Policy override/precedence semantics were "Phase 6 (Security) scope" — checked directly, `06-SECURITY.md` never defines an override algorithm. Both spots in `01-DOMAIN-MODEL.md` are corrected to point to this document's Open Architectural Question instead of a Phase 6 section that doesn't address it.
- Evidence-status legend (`Verified`/`Approved`/`Planned`/`Vision`/`Open Decision`) usage spot-checked across phases — consistent.

**Existing specifications requiring updates:** `00-FOUNDATION.md` §0 (evidence legend) — amended per §3, above, with a new Amendment 3 log entry.

**Future phases depending on these decisions:** none — this is the last phase this masterplan defines. Any future work (the explicitly-flagged-out "LLM Contributors"/plugin architecture, §2, or any new capability) is new scope requiring its own Phase 0-style authorization, not an implicit Phase 9 continuation of this document.

**Assumptions remaining open:** every item in §2's deferred roadmap, by definition. None of them block what's already been approved in Phases 0–7 — they're the explicit, honestly-recorded boundary of what this masterplan did and didn't design, consistent with Phase 0 principle #8 held across all eight phases.

---

**Masterplan status, Phases 0–8:** Foundation (Approved, architecture track) → Domain Model, Platform Architecture, Service Catalog, Control Plane, Provider Framework, Business Platform, Security, Operations, Roadmap (all Proposed, pending your final sign-off on this closing phase). No phase reopened an earlier one without an explicit, recorded amendment. Business-strategy decisions (Phase 0 §4–§9) remain deferred throughout, as authorized at the outset.
