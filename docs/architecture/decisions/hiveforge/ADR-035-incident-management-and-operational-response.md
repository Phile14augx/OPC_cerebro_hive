# ADR-035: Incident management and operational response

**Status:** Proposed (Phase 7, operations track)

## Context

Detection (`06-SECURITY.md` §12, `ADR-033`) tells the platform something is wrong; nothing previously fixed what happens next — classification, ownership, mitigation, and learning from the incident.

## Decision

A fixed incident lifecycle: `Detect → Classify → Assign → Mitigate → Recover → Root Cause Analysis → Postmortem → Action Items`. Alerts are severity-classified `P0`–`P4` (`07-OPERATIONS.md` §6), each carrying routing, owner, runbook link, escalation path, and suppression policy.

Every incident is recorded as an `Operation` (`01-DOMAIN-MODEL.md` §2) against the `Resource` or capability it concerned — not a new, parallel incident aggregate — consistent with the append-only audit-trail principle `Operation` already carries elsewhere in this masterplan.

Postmortems emphasize learning over blame; every postmortem produces tracked action items, not just a narrative record.

An alert whose corrective action would itself require sign-off routes through `HumanApprovalWorkflow` (`06-SECURITY.md` §14, amended by `ADR-028`) — incident response does not define its own, second approval mechanism.

## Consequences

- Incident severity classification (P0–P4) becomes the shared vocabulary across Security (`06-SECURITY.md`) and Operations alerting — one severity scale, not two.
- This ADR does not fix specific escalation timers or communication channels (Slack, PagerDuty, status page) — implementation detail, constrained but not dictated here.
- Postmortem action items are expected to sometimes produce ADR amendments elsewhere in this masterplan (Architectural Principle #6, `07-OPERATIONS.md` §16) — incidents are treated as a source of architectural feedback, not operational-only learning.
