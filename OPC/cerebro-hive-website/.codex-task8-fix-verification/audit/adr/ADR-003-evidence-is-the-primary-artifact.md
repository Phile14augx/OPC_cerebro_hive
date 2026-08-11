# ADR-003: Evidence is the primary artifact; findings and recommendations are derived from it

**Status:** Accepted

## Context

The M26.1 PRD's Explainability success criterion requires that "engineering reviewers can trace every finding and recommendation back to its supporting evidence, without implicit reasoning or hidden decision logic." This audit's own working method — evidence, then conclusion, revised when new evidence appeared, with every claim traceable to a specific file or code path — is the model this product is meant to hold itself to, not just describe in a metrics section.

A reviewer that produces a recommendation without a retrievable evidentiary basis is not distinguishable, from the user's side, from a black-box score. That undermines trust in exactly the cases where the review matters most — a finding a workflow engineer disagrees with.

## Decision

Evidence is the primary artifact the system produces. Findings are statements derived from evidence. Recommendations are derived from findings. Nothing in the review's output should exist without a traceable path back to the specific part of the workflow graph, prior version, or comparison source that produced it. This ordering (evidence → finding → recommendation) is a product commitment, not an internal implementation detail — it's what the Explainability success metric is measuring.

## Consequences

- Any architecture for this feature must treat evidence as retained and retrievable, not discarded once a finding is computed. If evidence isn't kept, explainability can't be verified after the fact.
- A finding without cited evidence is a defect, not an acceptable simplification, regardless of how confident the underlying analysis is.
- This decision does not prescribe how evidence is stored, computed, or represented — those are Phase 3/4 architecture and domain-model questions. It only establishes that the product's output must preserve this chain, whatever the implementation.
