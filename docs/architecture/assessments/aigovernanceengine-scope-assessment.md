# Engineering Review: `AIGovernanceEngine` Scope Assessment

**Status:** Evidence-based review. Input to a future ADR — does not itself decide anything.
**Scope:** `packages/engineering-review/src/infrastructure/llm/AIGovernanceEngine.ts` and its call graph, compared against the platform AI-governance architecture (`hiveforge/adr/ADR-029-ai-agent-identity-and-governance-engine.md`, `hiveforge/06-SECURITY.md` §0/§3, `hiveforge/adr/ADR-038-policy-inheritance-precedence-and-conflict-resolution.md` rule 5).
**Discovered during:** `HIVEFORGE-IMPLEMENTATION-RECONCILIATION.md`'s HiveShield row, which surfaced `ADR-038`'s existing "rule 5 deferred" note pointing at this class as the one real `AIGovernanceEngine` found in the repository.

---

## 1. Objective

This review evaluates whether the class named `AIGovernanceEngine` in `packages/engineering-review` constitutes:

- an implementation of the platform AI-governance architecture (`ADR-029`),
- an initial slice of that architecture, or
- an intentionally local simulation.

This review does **not** attempt to resolve `ADR-038` rule 5 ("one algorithm, two evaluators — `PolicyEngine` and `AIGovernanceEngine`"). That remains deferred, exactly as `ADR-038`'s own "Implementation status" section already states. This document exists to give that future decision an evidence base, not to make it.

## 2. Evidence

**Location and size.** `packages/engineering-review/src/infrastructure/llm/AIGovernanceEngine.ts` — 29 lines total.

**Public surface.** One class, one method: `async evaluatePolicy(prompt: PromptVersion): Promise<void>`.

**Logic.** Two hardcoded boolean checks against `prompt.parameters`:
- `contains_pii` — if truthy, throws `ContributorExecutionFailure('policy_rejection', 'Governance Engine rejected prompt: contains PII', true, false)`.
- `simulate_policy_rejection` — if truthy, throws the same error type with a simulated-rejection message.
- Otherwise, the method resolves — an implicit allow.

**Self-disclosure.** Lines 5–7, the method's own comment: *"In a real implementation, this would call the centralized AI Governance engine to check for PII, banned terminology, budget constraints, or compliance rules. For M26.5, we implement basic deterministic checks to simulate the interception layer."*

**Call graph.** `AIGovernanceEngine` is instantiated as the default constructor argument of `LLMExecutionService` (`packages/engineering-review/src/infrastructure/llm/LLMExecutionService.ts:58`) and invoked unconditionally as step 1, labeled "Governance Interception," at the start of `executePrompt()` (`LLMExecutionService.ts:71`), before any LLM call is made. `LLMExecutionService` is in turn instantiated with its default (real) governance engine by two contributors: `SecurityReviewAgent` (`packages/engineering-review/src/contributors/security/SecurityReviewAgent.ts:12`) and `ArchitectureReviewContributor` (`packages/engineering-review/src/infrastructure/ArchitectureReviewContributor.ts:14`).

**Tests.** `packages/engineering-review/src/infrastructure/llm/__tests__/LLMExecutionService.test.ts` — 4 tests, including one that exercises the `contains_pii` rejection path directly (lines 28–37) and asserts on the exact rejection message. `packages/engineering-review/src/contributors/__tests__/ContributorE2E.test.ts` exercises the full contributor pipeline end-to-end; its describe-block title (line 37) reads `"Contributor pipeline end-to-end (M26.5 LLM-Backed, ADR-013)"`. No `ADR-013` exists anywhere in the repository — `audit/adr/` contains only `ADR-001` through `ADR-007`.

**Orchestration reachability.** `packages/engineering-review/src/contributors/ContributorRegistry.ts` registers `SecurityReviewAgent` and `ArchitectureReviewContributor` alongside the other contributors. A repository search confirms `packages/engineering-review/src/application/EngineeringReviewOrchestrator.ts` does not import `ContributorRegistry` — the governance-interception path is real and tested at the contributor level, but not currently reachable through the live orchestration entry point.

## 3. Architecture Comparison

Not framed as `ADR-038` compliance: the evidence in Section 2 shows this class does not attempt `ADR-038`'s policy model, so measuring it against that model's compliance criteria would be evaluating it against a specification it never claimed to implement. The comparison below is a scope assessment instead.

| Capability | `engineering-review`'s `AIGovernanceEngine` | Platform AI-governance architecture (`ADR-029`, `hiveshield-policy`) |
|---|---|---|
| Policy model | No — raw `prompt.parameters` booleans | Yes — `Policy` aggregate (`01-DOMAIN-MODEL.md` §2/§4) |
| Rule model | Hardcoded booleans (`contains_pii`, `simulate_policy_rejection`) | `PolicyRule` aggregate (`packages/policy-core/src/models/PolicyRule.ts`) |
| Evaluation algorithm | Local, inline in one method | Shared — `PolicyEngine.evaluate()` / `HierarchicalPolicyEngine.evaluate()` |
| Outcome hierarchy | Exception-or-silent-allow only | `Permit` / `Deny` / `StepUpMfa` / `HumanApproval`, ranked (`ADR-038` rule 4) |
| Policy composition | No | Yes — bundles, hierarchy levels (`ADR-038` rules 2–3) |
| Shared with HiveShield | No | Intended eventually, per `ADR-038` rule 5 |

## 4. Findings

**Finding 1: The implementation is a deterministic, contributor-local simulation of a governance interception layer.**
Evidence: the method's own comment explicitly frames it as a stand-in ("For M26.5, we implement basic deterministic checks to simulate the interception layer"); the logic is two hardcoded boolean checks; it shares no model or code with any other governance component in the repository.

**Finding 2: The implementation is not an implementation of `ADR-038`'s policy evaluation model.**
Evidence: no `Policy` aggregate, no `PolicyRule`, no outcome-precedence ranking, no shared evaluator with `packages/policy-core` or `packages/hiveshield-policy`.

**Finding 3: The current implementation is not yet part of the live engineering-review orchestration path.**
Evidence: `ContributorRegistry.ts` registers the two consuming contributors but is not imported by `EngineeringReviewOrchestrator.ts`; the governance-interception logic is exercised only through contributor-level and end-to-end contributor tests, not through the orchestrator's own entry point.

**Finding 4: An architectural naming collision exists between this class and `ADR-029`'s `AIGovernanceEngine`.**
Both are called `AIGovernanceEngine`. `ADR-029` defines a ten-submodule HiveShield component (`PromptPolicyEvaluator`, `ToolPolicyEvaluator`, `AgentPolicyEvaluator`, `ModelSelectionPolicy`, `BudgetPolicy`, `DataClassificationPolicy`, `SafetyPolicy`, `CompliancePolicy`, `ApprovalPolicy`, `OutputPolicy`). The class in `packages/engineering-review` implements none of these submodules and shares no code with a HiveShield package. Independent of which architectural alternative (Section 5) is eventually chosen, two unrelated classes currently share one name.

## 5. Architectural Alternatives

**Option A — Contributor-local simulation.**
Advantages: matches the current implementation and its own self-disclosing comment; requires no change to `packages/policy-core` or `packages/hiveshield-policy`.
Consequences: requires renaming the class (or otherwise removing the naming collision) and documenting that its scope is intentionally local to `engineering-review`, not a platform component; if platform AI-governance work later reaches `engineering-review`'s use case, this class would still need to be replaced rather than extended.

**Option B — First implementation slice of the platform `AIGovernanceEngine`.**
Advantages: avoids a naming collision by growing into the name rather than away from it; preserves a path to convergence with `hiveshield-policy` under `ADR-038` rule 5 without a later replacement step.
Consequences: requires a migration plan toward a shared evaluator, real rule-5 implementation work, and corresponding `ADR-029`/`ADR-038` updates to track the transition.

## 6. Review Conclusion

Based on the implementation evidence in Section 2, the current class behaves as a contributor-local deterministic simulation rather than an implementation of the platform AI-governance architecture.

This review does not determine whether that scope should remain permanent or evolve into the platform implementation. That architectural decision remains open.

## 7. Follow-up Actions

**Confirmed (no architecture decision needed):**
- Correct the `ADR-013` citation in `ContributorE2E.test.ts:37` — no such ADR exists.
- Decide whether `ContributorRegistry.ts` should be wired into `EngineeringReviewOrchestrator.ts`, or is intentionally still in progress.

**Architecture decision required:**
- Resolve the naming collision identified in Finding 4 (rename one class, or formally document both scopes).
- Decide the long-term ownership and scope of this class (Option A vs. Option B, Section 5).

**No action:**
- `ADR-038` rule 5 remains correctly deferred; nothing in this review changes that status.
- No changes required to `packages/policy-core` or `packages/hiveshield-policy` as a result of this review.

## Related Tracking

Tracked in `docs/ROADMAP.md` Section 5 (Future Work) — the platform `AIGovernanceEngine` implementation (Option B from Section 5 above) is listed there as proposed-but-undecided, not scheduled.
