# ADR-005: The review framework is extensible through append-only contributors

**Status:** Accepted

## Context

The M26.1 brief's longer-term framing anticipates additional review types beyond workflow review — security, cost/performance, compliance, and eventually release engineering review (ADR-004) — sharing common concerns: orchestration, evidence handling, reporting, and confidence aggregation. Building M26.1 as a single-purpose, workflow-specific implementation risks the same outcome this audit found repeatedly: a capability that later needs a second, parallel implementation for the next use case, followed by a reconciliation effort (the Helm consolidation and the PolicyEngine/event-bus resolution were both exactly this pattern, discovered after the fact rather than designed against).

At the same time, this audit's other repeated lesson is that premature unification is its own failure mode — forcing Workflow Review and a hypothetical Release Review into one monolithic reviewer now, before either exists, would be designing against requirements that don't exist yet.

## Decision

The review framework is structured so new review types are added as append-only contributors — self-contained units that supply their own evidence sources and finding logic — rather than by modifying a shared, growing core. M26.1 ships exactly one contributor (Workflow Review). The framework itself (orchestration, evidence handling per ADR-003, reporting, confidence aggregation) is built generically enough that a second contributor doesn't require changing the first, but no second contributor is built now.

## Consequences

- M26.1's implementation should distinguish "framework" code from "workflow review" code even though only one contributor exists at launch — not as speculative generality, but so the boundary this ADR describes is real rather than aspirational when a second contributor is eventually added.
- Future contributors (security, cost, compliance, release) are expected to plug into the same framework without it needing structural changes. If a future contributor turns out to require a structural change anyway, that's a signal this ADR's boundary was drawn in the wrong place, and worth revisiting explicitly rather than special-casing around.
- This ADR does not define what the framework's interfaces look like — that's Phase 3 (Architecture Review) and Phase 4 (Domain Model) work, deliberately not decided here.
