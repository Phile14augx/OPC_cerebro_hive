# ADR-007: Canonical contributor interface; migration path for the M26.4 stub contributors

**Status:** Accepted

## Context

ADR-005 established that new review types are added as append-only contributors against a single framework interface, deliberately left undefined at that time (deferred to Phase 3/4, then delivered as `ports/IReviewContributor.ts` alongside `EngineeringReviewOrchestrator`). `audit/ARCHITECTURAL-REVIEW-UNPLANNED-VERTICAL-SLICE.md` found a second, structurally different `IReviewContributor` definition in `contributors/sdk/ContributorContext.ts`, executed via a separate `InProcessContributorHost`, backing four stub contributors (Security, Compliance, Cost, Reliability) built under an undocumented "M26.4" label. ADR-005 anticipated exactly these four categories as reasonable future contributors, but not a second interface to implement them against.

`audit/M26.3-CONTRIBUTOR-INTERFACE-RECONCILIATION.md` did the comparison this ADR formalizes: the baseline interface returns a typed `ContributorResult` with a closed status union; the `sdk/` interface returns `Promise<any>` with no structural guarantee. More importantly, `InProcessContributorHost.executeAgent()` calls a contributor's `execute()` directly, with no connection to `EngineeringReviewOrchestrator`, no dependency-DAG ordering, and no participation in the aggregate's evidence/finding lifecycle — a contributor run this way never reaches `EngineeringReviewReport` at all. `audit/M26.1-ARCHITECTURE-06-EXTENSION-FRAMEWORK.md` names "bypass the orchestrator" as one of six things a contributor must never do. The `sdk/` path does exactly that, and ADR-005 itself says a contributor needing a structural change signals the boundary was misdrawn and should be revisited, not special-cased — which is what happened instead.

## Decision

`ports/IReviewContributor.ts` is the sole contributor interface. `contributors/sdk/ContributorContext.ts` and `InProcessContributorHost.ts` are retired — not adopted in any form, not run alongside the governed path.

The four contributor categories (Security, Compliance, Cost, Reliability) are adopted as intended future contributors — the categories are reasonable and were already anticipated by ADR-005's own framing — but their current implementations are not adopted. Each is rewritten against `ports/IReviewContributor.ts` (`contributorId`, `displayName`, `version`, `category`, `execute(context: ReviewContext): Promise<ContributorResult>`) and registered into `EngineeringReviewOrchestrator`'s `contributors` array the same way `ArchitectureReviewContributor` is today.

None of the four is required to ship with real analyzer logic immediately. A contributor that isn't ready to produce real findings must report `status: 'skipped'` with a reason, rather than `status: 'succeeded'`/`'COMPLETED'` with zero findings — the current stubs' `{ findings: [], recommendations: [], status: 'COMPLETED' }` is indistinguishable from "ran and found nothing," which is a false signal, not an honest placeholder. Each stub's docstring claims delegation to analyzer classes (`EdgeEncryptionAnalyzer`, `TopologyExposureAnalyzer`, `IAMAnalyzer`, and the Compliance/Cost/Reliability equivalents) that do not exist anywhere in the repository; those claims must be removed, not left as aspirational fiction, regardless of whether the analyzers get built now or later.

Dependency-DAG ordering among contributors remains out of scope — it was already deferred to Slice 6 by the orchestrator's own comments, and this ADR doesn't change that. The four contributors run in sequence, like the existing single contributor does today.

`ContributorE2E.test.ts` is retired in its current form. Once at least one of the four contributors is rewritten, this file is replaced with real tests exercising it through `EngineeringReviewOrchestrator`, following the pattern already established in `EngineeringReviewOrchestrator.test.ts`'s failure-isolation tests.

## Addendum, 2026-07-29: real registry now exists

`packages/engineering-review/src/contributors/ContributorRegistry.ts` was added, constructing all five contributors (Security, Cost, Compliance, Reliability, Architecture) and exposing `getEnabled()`. `EngineeringReviewOrchestrator`'s constructor now takes a registry object (`{ getEnabled(): readonly IReviewContributor[] }`) rather than a raw contributor array. This resolves the gap task #83 found — previously no real composition root existed anywhere; contributors were only ever wired inside test files.

A regression was caught and corrected in the same pass: `SecurityReviewAgent`, `ComplianceReviewAgent`, and `CostReviewAgent` were briefly changed to report `status: 'succeeded'` with hardcoded, fabricated findings (a specific IAM wildcard-action finding, a specific Lambda over-provisioning finding, a specific DynamoDB encryption finding) that could not be derived from `ReviewContext` — which carries no IAM, Lambda, or DynamoDB data at all. This is a more severe version of the exact problem this ADR exists to prevent: not an unfinished stub, but confident, specific-sounding output that would repeat identically for every workflow regardless of what was actually reviewed. It was reverted; all four non-Architecture contributors are confirmed back to honestly reporting `status: 'skipped'`. `ContributorRegistry.ts` itself is unaffected by this — registering a contributor and that contributor being honest about what it found are separate concerns, and only the latter regressed.

`ContributorResult` was also extended (now requires `startedAt`, `completedAt`, `durationMs`, `metrics`) — a legitimate, welcome addition for observability, but it was rolled out inconsistently at first: `ArchitectureReviewContributor` and `EngineeringReviewOrchestrator.safeExecute()`'s failure path were briefly out of sync with the new shape. Both are now updated to match.

## Consequences

- `contributors/sdk/`, `InProcessContributorHost.ts`, and the four stub agent files as currently written are all replaced, not kept for reference or run in parallel — two competing extension points is the defect this ADR closes, not a state to preserve either side of.
- Until a given contributor's rewrite lands, it does not exist as far as the orchestrator or any test suite is concerned. A "27/27 passing" count must not include placeholder assertions against a category that hasn't been rebuilt — this is the same failure mode `audit/ARCHITECTURAL-REVIEW-UNPLANNED-VERTICAL-SLICE.md` flagged in `ContributorE2E.test.ts`'s original form, and this ADR is what prevents it recurring under a new name.
- This ADR does not decide implementation order or timeline for the four rewrites — that's a scheduling call, not an architectural one, left for whenever that work is picked up.
- This ADR does not touch persistence, eventing, or transport — see ADR-006 for that half of the vertical slice.
