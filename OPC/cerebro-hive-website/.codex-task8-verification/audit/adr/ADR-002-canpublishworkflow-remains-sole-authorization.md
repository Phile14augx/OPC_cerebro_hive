# ADR-002: The existing `CanPublishWorkflow` policy remains the sole authorization authority

**Status:** Accepted

## Context

`WorkflowApplicationService.publishVersion()` already calls `policyEngine.evaluate('CanPublishWorkflow', context, { workflowId })` before validating and persisting a new `WorkflowVersion` (confirmed by direct code inspection during the M26.1 verification pass — see `audit/M26.1-ENGINEERING-REVIEW-ASSISTANT-BRIEF.md`). Separately, this repository contains at least four other independent `PolicyEngine`-shaped implementations (`packages/policy`, `packages/policy-core`, `apps/studio/platform`'s kernel `PolicyEngine`, and the domain-package instance wired into `apps/platform-api`), none of which currently govern workflow publication. Introducing Engineering Review creates a natural temptation to route authorization through a new or different policy source "while we're in there."

## Decision

`CanPublishWorkflow`, evaluated exactly where it is evaluated today, remains the sole source of truth for whether a workflow version is permitted to publish. Engineering Review does not read from, write to, replace, or wrap this check. It runs as an independent, additional step.

## Consequences

- Engineering Review's evidence sources (capability registry, prior version, engineering-convention rules) are separate inputs from whatever `CanPublishWorkflow` itself evaluates against. They may overlap in subject matter but are not the same call.
- If a future milestone decides an "engineering convention" ruleset is needed as an input to Engineering Review (see Open Question 2 in the M26.1 PRD), that ruleset informs a finding — it does not become a new authorization path, and it is not routed through `CanPublishWorkflow`.
- This ADR does not take a position on which of the platform's several policy-engine implementations should supply engineering-convention rules, if any — that's an open architecture question, deliberately left open rather than answered here to avoid smuggling an implementation decision into this ADR.
