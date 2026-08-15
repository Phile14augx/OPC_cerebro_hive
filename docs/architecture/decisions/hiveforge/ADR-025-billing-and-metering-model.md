# ADR-025: Billing and metering model

**Status:** Proposed (Phase 1, architecture track)

## Context

Phase 0 §8 (Business Model) is an explicitly **deferred, non-blocking** business decision — real pricing, margin targets, and tiering are not known yet. But the *architectural* question of how usage is captured and attributed is independent of what price gets attached to it later, the same separation Phase 0 draws between architecture and commercial strategy generally.

## Decision

Every billable action produces an immutable `UsageRecord` (per the domain model), referencing the `Operation` and `Resource` that produced it, emitted as an event (`UsageRecorded`, per `ADR-024`) when the Operation completes — not computed retroactively by scanning Resource state on a schedule. `UsageRecord`s are append-only; corrections are new, offsetting records, never edits to an existing one, matching the append-only evidence discipline already established for `EvidenceReference` in `packages/engineering-review`.

`BillingAccount` aggregates `UsageRecord`s into billable amounts. The attachment level (Organization vs. Tenant) is left as an open decision in the domain model (`01-DOMAIN-MODEL.md` §6), pending Phase 0 §7's resolution of target customers — this ADR fixes the metering mechanism, not that downstream decision.

## Consequences

- The billing pipeline is a consumer of the platform event bus (ADR-024), not a privileged, separately-built subsystem that reads Resource state directly.
- Because `UsageRecord`s are immutable and traceable to a specific Operation, a disputed bill can be traced back to the exact provisioning action that produced it — the same evidentiary standard this project's audit work has already held itself to.
- This ADR does not fix pricing, currency handling, invoicing cadence, or tax logic — those depend on the Phase 0 §8 business-model decision and are out of scope until that resolves.
- Real-time vs. batched aggregation of `UsageRecord`s into a `BillingAccount` balance is an implementation choice, not fixed here — either is compatible with this ADR's event-sourced metering model.
