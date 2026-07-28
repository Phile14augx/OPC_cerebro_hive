# ADR-001: Engineering Review is advisory and never authorizes publication

**Status:** Accepted

## Context

M26.1 (Workflow Engineering Review) introduces a review step into the workflow publication lifecycle. The platform already has a real authorization mechanism at that same point — `WorkflowApplicationService.publishVersion()` calls `policyEngine.evaluate('CanPublishWorkflow', ...)` before persisting a new `WorkflowVersion`. If the new review step could itself block publication, it would function as a second authorization mechanism operating alongside the first.

This audit found that pattern — two systems with overlapping authority over the same decision — repeatedly and expensively elsewhere in this platform: two Helm template generations both claiming to define the deployment topology, four independent `PolicyEngine`-shaped implementations, and two services (`apps/platform-api`, `apps/studio/platform`) both identifying as "the platform API." Each required a dedicated reconciliation effort after the fact. There's no reason to introduce a sixth instance of this pattern by design.

## Decision

Engineering Review is advisory. It produces evidence, findings, and a recommendation, but it does not determine whether a workflow version is allowed to publish. Publication proceeds according to the existing `CanPublishWorkflow` policy check regardless of what the review finds.

## Consequences

- A "needs attention" finding does not stop a publish. The review's value is in surfacing evidence for a human (or a later, explicitly-designed enforcement mechanism) to act on, not in gatekeeping.
- This decision can be revisited, but only as a new, explicit decision (see ADR-002's note on configurable enforcement as future scope) — not as an incremental feature addition that quietly turns an advisory system into a gate.
- Any UI or reporting surface for this feature must not imply a blocked or "pending" publish state on account of review findings alone, since that would misrepresent the actual authorization outcome.
