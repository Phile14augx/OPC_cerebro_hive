# ADR-004: Engineering Review is integrated into the workflow publication lifecycle, not the CI/CD release lifecycle

**Status:** Accepted

## Context

The M26.1 verification pass established that "workflow versioning" and "CI/CD release" are two real but architecturally unrelated systems in this repository. `release-train.yml` (test suite → ArgoCD staging → smoke tests → release PR → canary production) governs application/infrastructure code delivery. `WorkflowApplicationService.publishVersion()` governs a tenant publishing a new version of their own workflow. Neither references the other; `release-train.yml`'s only "workflow" occurrences are GitHub Actions' own generic vocabulary (`workflow_dispatch`, the `.github/workflows/` path), confirmed by direct inspection.

Framing M26.1 around "release" without specifying which of these two systems it means was the original ambiguity in the product brief; the product decision (Workflow Engineering Review, not Release Engineering Review) resolves it.

## Decision

M26.1 integrates at `WorkflowApplicationService.publishVersion()`, alongside the existing `CanPublishWorkflow` policy check, validation, audit logging, and outbox event. It does not touch `release-train.yml`, `docker-build.yml`, ArgoCD, or any other part of the CI/CD pipeline.

## Consequences

- Nothing in this milestone requires building governance hooks into CI/CD (invocation, persistence, audit trail, approval semantics for code releases) — that cost is deferred to a possible future "Release Engineering Review" milestone, should one be pursued, and starts from zero rather than reusing M26.1's integration.
- The review framework (per ADR-005) should be designed so that a future release-review contributor can be added without requiring this integration point to change — but building that second contributor is explicitly out of scope now.
- Documentation, findings, and reporting for this milestone should consistently use "workflow publication" rather than the ambiguous "release," to avoid reintroducing the confusion this ADR resolves.
