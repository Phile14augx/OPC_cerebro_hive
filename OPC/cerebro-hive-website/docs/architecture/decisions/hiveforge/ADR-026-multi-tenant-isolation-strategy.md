# ADR-026: Multi-tenant isolation strategy

**Status:** Proposed (Phase 1, architecture track)

## Context

Phase 0 principle #5 commits to multi-tenancy from day one — CerebroStudio is HiveForge's first tenant, not a special-cased internal exception. That commitment is meaningless without a concrete isolation boundary: what actually stops one Tenant's data, credentials, or provisioned Resources from being visible to or affected by another's.

## Decision

Isolation is enforced at every layer already defined by the other Phase 1 ADRs, not as a separate bolted-on mechanism:

- **Identity (ADR-023):** every API call is authenticated and its authorization scoped to a specific Organization/Tenant/Project/Workspace — there is no cross-tenant query path in HiveGateway's authorization logic.
- **Credentials (ADR-023):** escrowed provider credentials are scoped per-Operation, which is itself scoped to one Workspace/Tenant — a leaked credential cannot span tenants because none is ever issued broadly enough to.
- **Data (domain model):** every aggregate below `Organization` carries its owning Tenant's identifier; queries are always scoped by it, never optional.
- **Events (ADR-024):** events carry their originating Tenant/Organization identifier; a consumer (e.g., a future external tenant's webhook integration) is only ever delivered events scoped to it.

Whether tenant isolation is additionally enforced at the infrastructure level (separate cloud accounts/subscriptions per Tenant, vs. shared accounts with logical isolation) is **not fixed by this ADR** — it's a real security/cost trade-off that depends on Phase 6 (Security) detail and Phase 0 §7's target-customer decision (an enterprise/regulated customer may require account-level isolation; a small-team customer may not need or want that cost).

## Amendment (2026-07-29, Phase 6)

The open infrastructure-level isolation question above is now resolved (`06-SECURITY.md` §1, `ADR-028`): **logical isolation by default** (shared infrastructure, Tenant-scoped by construction per this ADR), with **dedicated-account isolation available as a `Policy`-gated option per Organization**, not a universal requirement. This avoids mandating per-Tenant cloud accounts (and their cost) for every customer while still letting an enterprise/regulated Organization require it via `Policy`. The specific `Policy` schema and any pricing implication of choosing dedicated-account isolation remain open, deferred to Phase 0 §8 (business model, still deferred).

## Consequences

- No capability service or HiveGateway code path may query or act across Tenant boundaries implicitly — every query is Tenant-scoped by construction, not by convention alone.
- CerebroStudio, as HiveForge's first tenant, is isolated the same way any future external tenant would be — there is no "internal fast path" that bypasses this ADR's boundaries, which is the concrete test of whether Phase 0's "internal-first, external-ready" principle actually held.
- Infrastructure-level isolation (separate cloud accounts per Tenant) remains an open question, to be resolved in Phase 6 once target-customer requirements (Phase 0 §7) are known — this ADR does not commit to either shared or dedicated infrastructure.
