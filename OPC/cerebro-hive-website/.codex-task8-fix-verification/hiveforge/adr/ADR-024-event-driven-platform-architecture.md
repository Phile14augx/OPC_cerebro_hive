# ADR-024: Event-driven platform architecture

**Status:** Proposed (Phase 1, architecture track)

## Context

Billing (ADR-025), HiveConsole status views, HiveShield's SecurityEvents, and eventually external tenant integrations all need to react to Resource/Operation state changes. Without a shared event model, each of these would either poll for state (expensive, laggy) or grow its own bespoke notification path (the same fragmentation ADR-020/ADR-021 avoid at the provider/control-plane layers, recurring at the notification layer if not addressed).

## Decision

Every state-changing action in HiveForge emits an event. Illustrative taxonomy (not exhaustive, extensible without a new ADR as long as new event types follow this same shape): `ResourceRequested`, `ResourceProvisioned`, `ResourceDegraded`, `ResourceDeleted`, `OperationCompleted`, `OperationFailed`, `UsageRecorded`, `PolicyViolationDetected`.

Producers: HiveGateway and capability services, on every lifecycle transition (per `ADR-022`). Consumers: the billing pipeline, HiveShield's SecurityEvents, HiveConsole, and — per Phase 0's internal-first principle — CerebroStudio itself as HiveForge's first tenant, consuming the same events an external customer eventually would.

Delivery guarantee: **at-least-once**. Consumers must be idempotent; an Operation's or UsageRecord's own identifier is the natural idempotency key. Exactly-once delivery is explicitly not promised at this phase.

## Consequences

- Billing (ADR-025) is a consumer of this event bus, not a separate polling system that scans Resource state independently.
- New consumers (a future analytics pipeline, a future external webhook system) subscribe to existing events rather than requiring producers to add bespoke notification code per consumer.
- Every consumer must handle duplicate delivery correctly — this is a hard requirement of adopting at-least-once semantics, not an edge case to defer.
- This ADR does not specify the underlying event transport (Kafka, SNS/SQS, a managed event bus) — that's an implementation decision, constrained by the at-least-once/idempotent-consumer contract this ADR fixes, not dictated by it.
