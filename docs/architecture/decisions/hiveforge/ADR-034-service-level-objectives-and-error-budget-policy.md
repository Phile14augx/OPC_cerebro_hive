# ADR-034: Service Level Objectives and error budget policy

**Status:** Proposed (Phase 7, operations track)

## Context

No SLO/SLI framework existed prior to this phase. Without one, "reliable" has no measurable definition, and no error-budget-driven basis exists for deciding when to slow feature work in favor of stability.

## Decision

SLOs are defined at the **capability** level (what a consumer experiences), not per internal service. Each capability publishes availability, latency (P95 minimum), and a capability-specific success metric (e.g., AI Review's "review completion success"). Each SLO carries an error budget; budget exhaustion triggers a defined response (feature-work slowdown, escalation), not an undefined one.

Illustrative targets recorded in `07-OPERATIONS.md` §5 (AI Review, API Gateway, `SecureAIGateway`) are **not commercial commitments** — real targets depend on Phase 0 §9 (success metrics, still deferred) and on operational data that doesn't yet exist.

## Consequences

- Every capability service must expose the Service Health contract (`07-OPERATIONS.md` §3) as the substrate SLO measurement reads from — an SLO cannot be measured against a service with no standardized health signal.
- Error-budget policy is a deferred implementation detail (specific thresholds, specific slowdown triggers) — this ADR fixes that budgets exist and are acted on, not the exact numbers.
- This ADR does not commit to any SLA (a customer-facing contractual guarantee) — SLOs are internal operating targets; SLAs, if ever offered, are a Phase 0 §8 (business model) decision, not fixed here.
