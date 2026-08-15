# ADR-038: Policy inheritance precedence and conflict resolution

**Status:** Proposed (post-Masterplan, closes the Open Architectural Question tracked in `08-ROADMAP.md` §2)

## Context

`01-DOMAIN-MODEL.md` §4 fixed that `Policy` attaches at any level of Organization→Tenant→Project→Workspace and is inherited downward, but explicitly left open what happens when Policies at different levels (or the same level) conflict. Every evaluator that reads `Policy` — `PolicyEngine` (resource ABAC, `ADR-028`) and `AIGovernanceEngine` (AI-workflow governance, `ADR-029`) — needs one shared answer, not two independently-invented ones. This ADR is scoped narrowly to precedence, conflict resolution, and evaluation order, per your instruction — it does not reopen anything else `01-DOMAIN-MODEL.md`, `ADR-028`, or `ADR-029` already fixed.

## Decision

**1. Deny takes precedence, always.** An explicit `Deny` at any level — regardless of specificity, regardless of how many `Permit`s exist elsewhere in the chain — overrides every `Permit`. This is the same posture Zero Trust (`00-FOUNDATION.md` principle #4) and the Layer 11 default-deny stance (`06-SECURITY.md`) already commit to: safety wins ties, not permissiveness.

**2. Child Policies may narrow, never widen.** A `Policy` at a more specific level (e.g., Workspace) can restrict what a parent level (e.g., Organization) permits, but cannot grant anything the parent hasn't already permitted. This mirrors the guardrail model `06-SECURITY.md` §1 already implies for ABAC scoping — inheritance is a ceiling that only ever lowers as you go deeper, never raises.

**3. Evaluation order is top-down, accumulating restrictions.** Organization → Tenant → Project → Workspace, in that order; each level's `Policy` is evaluated against the accumulated result of everything above it, not independently. The final decision is the most restrictive result of any level in the chain.

**4. Outcome precedence, extending `ADR-028`'s four-outcome decision engine.** Where multiple applicable Policies would produce different outcomes (`Permit`, `Deny`, `Step-up MFA`, `Human Approval`), precedence is fixed as:

```
Deny > Human Approval > Step-up MFA > Permit
```

The most restrictive/most-scrutinized outcome anywhere in the chain wins. A `Permit` at every level except one `Human Approval` at Workspace still requires approval; nothing downgrades a stricter outcome to a laxer one.

**5. One algorithm, two evaluators — deferred, amended post-implementation-review.** Originally: "Both `PolicyEngine` and `AIGovernanceEngine` implement this same precedence/conflict-resolution algorithm against their respective `Policy` classifications." That statement is now deferred rather than decided, per evidence found after this ADR was first written (see Implementation status, below): a real `AIGovernanceEngine` exists (`packages/engineering-review`, under an "M26.5" initiative), and its own code comments describe it as simulating a call to "the centralized AI Governance engine" — evidence of *intended* eventual convergence with something like `ADR-029`'s `AIGovernanceEngine`, but not yet a decision, and not yet an implementation of this algorithm.

**The long-term architecture intends for AI governance decisions to reuse a common policy-combining model where appropriate. At present, the `engineering-review` `AIGovernanceEngine` is a contributor-scoped governance component (a two-flag PII/rejection gate for one LLM execution path) and does not implement the enterprise governance responsibilities described in `ADR-029`/`06-SECURITY.md`, nor this ADR's combining algorithm. Whether it should converge with a future `ADR-029`-shaped `AIGovernanceEngine`, be extended to reuse `hiveshield-policy`'s algorithm, or remain intentionally separate is not decided by this ADR — that is a future ADR or architectural amendment's decision, made once both sides of the question have matured enough to evaluate. Rule 5 is deferred, not satisfied and not descoped, until then.**

## Consequences

- No `Policy` at any level can be used to escalate beyond what a parent level already permits — this closes a real privilege-escalation path that was previously unspecified (a Workspace-level Policy author could not, even by mistake, grant broader access than their Organization allows).
- Conflicting Policies at the *same* level (e.g., two Workspace-level Policies, one `Permit` one `Deny`, for the same action) resolve via rule 1 — `Deny` wins — without needing a separate same-level tiebreak rule.
- This ADR does not fix the exact `Policy` schema field that encodes precedence/priority numerically (if `PolicyEngine`'s implementation needs one for ordering multiple same-level Policies before applying rule 1) — implementation detail, constrained but not dictated here.
- Closes the Policy-inheritance-precedence Open Architectural Question from the HiveForge Masterplan (`08-ROADMAP.md` §2). A new one was surfaced by the real implementation found afterward (`TenancyScope` vs. this masterplan's domain hierarchy — see Implementation status, below, and `08-ROADMAP.md` §2) — recorded rather than silently resolved.

## Implementation status — Partial (rules 1–4 canonical, rule 5 deferred; found and independently confirmed, not built by this masterplan's author)

`@cerebro/hiveshield-policy`'s `HierarchicalPolicyEngine`, built on `@cerebro/policy-core`'s `PolicyEngine`, implements all four rules above. Confirmed, not assumed:

- Ran its real test suite (`HierarchicalPolicyEngine.test.ts`, 8 tests) against the actual `policy-core`/`identity-core` source (not mocked) — all 8 pass.
- Rule 1 (deny-precedence) and rule 4 (outcome precedence `Deny > HumanApproval > StepUpMfa > Permit`) are implemented directly in `policy-core`'s `PolicyEngine.evaluate()` via an `OUTCOME_PRECEDENCE` ranking, and again at the hierarchy-combining level in `HierarchicalPolicyEngine`.
- Rule 2 (child-narrows-never-widens) and rule 3 (top-down, accumulating evaluation) are implemented via a documented equivalence, verified by reading `policy-core`'s engine directly: every level defaults to `Deny` unless explicitly permitted ("Default Deny if NotApplicable"), so evaluating all four levels independently and taking the single most-restrictive result is equivalent to a literal accumulating narrowing evaluation. This is a real, checked equivalence, not an unverified claim in the implementation's own comments.
- `PolicyEffect`/`PolicyDecisionType` in `policy-core` already carry `StepUpMfa`/`HumanApproval` as first-class outcomes, citing `ADR-028` by name in-code.

**Classification (per a full verification checklist — ADR coverage, runtime integration, test coverage, consumers, architectural alignment): Partial implementation, not yet canonical.**

- Rules 1–4 (deny-precedence, narrow-never-widen, top-down accumulation, outcome precedence): implemented and verified — this is the extension point for future work, not something to duplicate.
- **Rule 5 ("one algorithm, two evaluators — `PolicyEngine` and `AIGovernanceEngine`"): deferred, not satisfied and not descoped.** The one real `AIGovernanceEngine` class found in the repo (`packages/engineering-review/src/infrastructure/llm/AIGovernanceEngine.ts`, wired into `SecurityReviewAgent`/`ArchitectureReviewContributor` under an initiative its own comments call "M26.5") does not use this outcome-precedence model — a narrow, two-flag PII/rejection gate for one LLM execution path, unrelated in current shape to `ADR-029`'s ten-submodule `AIGovernanceEngine`. Its own comments frame it as simulating a call to a future "centralized AI Governance engine," which is evidence of *intended* eventual convergence, not proof of a settled architectural decision. Closing rule 5 — extend `hiveshield-policy`'s algorithm once a real `ADR-029`-shaped engine exists, or formally descope it if the two are judged permanently distinct — is left to a future ADR, once there's enough maturity on both sides to decide rather than guess.
- **Related, separate finding, not part of this ADR's scope:** `packages/engineering-review`'s `ContributorE2E.test.ts` (part of the frozen `M26.2-3` baseline, modified post-freeze under "M26.5") cites `ADR-013` in its own describe-block title. Checked directly: no `ADR-013` exists in `audit/adr/` (only `001`–`007` are real). A citation to a nonexistent ADR, inside a frozen baseline — flagged here for whoever owns that baseline's post-freeze changes, not resolved by this ADR.
- Runtime integration: isolated, no consumers.
- Test coverage: strong at the unit level (9 real tests against real dependencies, including one added by the typed-ID reconciliation below), missing at integration/conformance level (no test against `HiveGateway`/`PolicyEvaluationClient`).
- Architectural alignment: **typed-ID reconciliation complete.** `HierarchyLevelPolicies` (`HierarchyTypes.ts`) is now a discriminated union carrying an optional, per-level-typed `id?:` field (`OrganizationId`/`TenantId`/`ProjectId`/`WorkspaceId` from `@cerebro/domain-model`, added as a dependency) instead of a plain interface with no identifier at all — a Workspace-level entry can no longer be constructed holding, say, an `OrganizationId`. This is purely additive: `id` is optional, unused by evaluation logic, and only threaded into `HierarchicalPolicyEngine`'s `evaluationPath` trace string for audit/debugging. No evaluation behavior changed — confirmed by a real `tsc` typecheck (clean) and a real `vitest` run (9/9 passing, including a new test asserting all four typed ids appear correctly in `evaluationPath`) against the actual `policy-core`/`identity-core`/`domain-model` source. **The `TenancyScope` gap below is deliberately untouched by this reconciliation** — it is a genuine architectural question (how a `Tenant` level gets derived when `TenancyScope` has none), not a mechanical typing fix, and remains open.

**Gap surfaced by the implementation, not resolved here:** `HierarchyTypes.ts` notes that `@cerebro/identity-core`'s `TenancyScope` (`organizationId`/`workspaceId`/`projectId`/`environmentId`, no explicit `Tenant` level) does not map cleanly onto this masterplan's `Organization→Tenant→Project→Workspace` hierarchy (`01-DOMAIN-MODEL.md` §1). The implementation works around this by taking an explicit `PolicyHierarchy` from the caller rather than deriving it from `TenancyScope` — a real, open reconciliation gap, tracked in `08-ROADMAP.md` §2 as a new Open Architectural Question, not silently resolved by either package.
