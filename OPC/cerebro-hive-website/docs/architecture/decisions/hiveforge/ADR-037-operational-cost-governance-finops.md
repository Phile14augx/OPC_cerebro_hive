# ADR-037: Operational cost governance (FinOps)

**Status:** Proposed (Phase 7, operations track)

## Context

`05-BUSINESS-PLATFORM.md` §4 already fixed a Usage Ledger pipeline for customer-facing billing (`ProviderExecutor → UsageRecorded → Normalization → Usage Ledger → Aggregation → Billing API`). No internal cost-optimization consumer of that same data existed — "what does it cost us to run this" is a different question than "what do we charge the customer," and answering it does not require Phase 0 §8's pricing decisions to be resolved first.

## Decision

FinOps is an **internal consumer of the existing Usage Ledger** — not a second metering pipeline. Cost is tracked separately across: infrastructure, AI, storage, search, network, data transfer, and per-tenant/per-workspace/per-agent/per-review granularity. Budgets, forecasting, and chargeback/showback are built on this same ledger data.

The distinction from the Billing API (`05-BUSINESS-PLATFORM.md` §6) is explicit: Billing API answers what the customer is charged (pricing, still deferred, Phase 0 §8); FinOps answers what it costs HiveForge to deliver the service (can proceed regardless of that deferral).

## Consequences

- No new `UsageRecord` schema or ledger is introduced — FinOps reads the same append-only ledger `05-BUSINESS-PLATFORM.md` §4 already defined.
- Chargeback/showback numbers are internal cost-governance artifacts; this ADR does not commit to exposing per-tenant cost data externally to customers — that remains a Billing API/pricing decision, separate from this ADR.
- Cost-optimization automation (e.g., auto-scaling down under-utilized capacity) that this ADR's forecasting enables is itself an Operational Automation (`07-OPERATIONS.md` §13) concern, not redefined here.
