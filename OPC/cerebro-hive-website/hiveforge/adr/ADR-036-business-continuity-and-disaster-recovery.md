# ADR-036: Business continuity and disaster recovery

**Status:** Proposed (Phase 7, operations track)

## Context

No backup, restore, or disaster-recovery model existed prior to this phase, despite `01-DOMAIN-MODEL.md`'s append-only aggregates (`Operation`, `UsageRecord`) implying data that must survive loss events, and `ADR-026`'s multi-tenant isolation choice (logical by default, dedicated-account optional) having direct implications for how recovery is scoped per Tenant.

## Decision

RPO (Recovery Point Objective) and RTO (Recovery Time Objective) are tracked as distinct, per-system targets, not a single platform-wide number: illustrative targets for Metadata (15 min / 1 hr), Audit (5 min / 30 min), and Object Storage (1 hr / 4 hr) are recorded in `07-OPERATIONS.md` §9.

These targets apply to HiveForge's own control-plane data. A customer's `HiveStorage`/`HiveDatabase` Resources carry their own RPO/RTO as a Policy-configurable attribute, not a platform-imposed constant — consistent with the non-interpretive stance already taken on customer Tags (`06-SECURITY.md` §7).

Backup policy, restore testing, DR testing, failover, and regional recovery are all defined as ongoing, verified practices (tested, not just declared) — per Phase 0 principle #8, a DR claim is only Verified once a real DR test has run.

Multi-region pattern selection (`07-OPERATIONS.md` §10 — active-active, active-passive, pilot light, warm standby) depends on workload criticality and interacts with, but does not re-decide, `ADR-026`'s isolation choice: a dedicated-account Tenant operates its own regional footprint; a logically-isolated Tenant shares HiveForge's regional topology.

## Consequences

- No DR/backup claim in any HiveForge document may be marked Verified without a real, run test behind it — today, all of this is Planned.
- Customer-configurable RPO/RTO (via Policy) implies a cost/tier interaction (tighter RPO/RTO likely costs more) — that pricing question is Phase 0 §8 scope, deferred, not fixed here.
- This ADR does not fix a specific DR testing cadence (monthly, quarterly) — implementation detail.
