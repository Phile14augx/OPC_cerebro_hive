# Ruleset Reconciliation Assessment

**Status:** Evidence-based audit. Descriptive, not prescriptive — records current state and a recommended reconciliation path. No ruleset, workflow, or branch-protection change has been applied as a result of this document.
**Scope:** GitHub repository ruleset `Main Production Protection` (id `19152342`, `Phile14augx/OPC_cerebro_hive`, `enforcement: active`, targeting `refs/heads/main`) and the 32 workflow files under the repository's actual root `.github/workflows/`. Primarily the `required_status_checks` rule's 10 contexts (Sections 4–5); Section 4.1 covers a second, independently-discovered broken rule (`required_deployments`).
**Discovered during:** Investigation of why two failing deploy workflows (`Deploy to VPS via SSH`, `Deploy to cPanel / Hostinger via FTP`) had been landing on `main` for two days despite CI failing on every push. See the incident thread this document follows on from; the three application defects that caused that incident are already fixed and merged (commits `c06bee5`, `f982347`, `3534764`) and are out of scope here — this document covers only the governance layer above CI, not the application code.

---

## 1. Executive Summary

**Purpose.** During the incident investigation above, CI was confirmed to be running, on Linux runners, and correctly detecting the defects that broke the build. Yet the failing commits still reached `main`. This audit exists to determine why, and to establish ground truth for the repository's branch-protection configuration before anyone changes it.

**Scope.** The one ruleset that applies to `main`, and the 10 status-check contexts it currently requires, each traced back to an actual workflow job (or the absence of one).

**Why no changes were applied.** The audit itself surfaced a broader problem than a simple naming drift: of the 10 required contexts, only 4 map to both a correctly-matching name *and* a real, currently-blocking check. Patching only the 4 clean renames would leave the ruleset internally inconsistent — still advertising governance (`Docker Build`, `Coverage`, `Deploy Preview`, etc.) that doesn't correspond to anything real. A partial patch was prepared and deliberately not applied, in favor of one comprehensive reconciliation.

**Current status.** Reconciliation deferred pending a complete decision on every required context (Section 5). This document is that decision's evidence base. Since the original audit, a second, independent broken rule was confirmed (Section 4.1): the ruleset's `required_deployments` rule requires a successful `github-pages` deployment, but GitHub Pages is disabled for this repository. That rule is currently unsatisfiable through normal operation, the same underlying failure mode as the `required_status_checks` findings below, just in a different rule type.

## 2. Objectives

- Establish the canonical, verified inventory of what each of the 10 required status-check contexts actually corresponds to today.
- Identify naming inconsistencies between the ruleset's required contexts and the literal context strings workflows emit.
- Prevent an accidental branch-protection regression from an incomplete or guessed rename.
- Preserve what already works (the 4 real, blocking gates) while giving the remaining 6 an explicit, deliberate disposition rather than leaving them as silent dead configuration.

## 3. Methodology

Evidence was gathered from five independent sources, cross-checked against each other rather than trusted individually:

- **The ruleset itself** — `gh api repos/.../rulesets/19152342`, read in full (all rule types, not just `required_status_checks`).
- **Workflow YAML definitions** — all 32 files under the repository's real root `.github/workflows/` (a nested, GitHub-inert copy at `OPC/cerebro-hive-website/.github/workflows/` was found and excluded after it produced job names that didn't match observed reality — see Finding 7.1).
- **Job names vs. workflow names** — for each candidate, both the workflow-level `name:` and the job-level `name:` (or, where absent, the job id, which GitHub uses as the literal check-run context) were read directly from source, not inferred from the workflow's display name in `gh workflow list`.
- **Actual posted check-runs** — `gh api repos/.../commits/main/check-runs`, the ground-truth list of what GitHub has actually recorded for the current `main` HEAD, used to confirm every literal context string byte-for-byte rather than assuming a job's `name:` field is what gets reported.
- **Step-level content, not just job names** — every candidate job's actual step bodies were read to distinguish a real check from a placeholder (e.g. `docker.yml`'s build job is an `echo` statement, not a build).

No required context was reconciled by name-similarity alone; each of the 10 was traced to either a real, currently-executing job or confirmed to have no corresponding job at all.

## 4. Evidence Matrix

| Required Context | Workflow (file) | Actual Status Context | Verified | Notes |
|---|---|---|---|---|
| `typescript` | `ci.yml` (`typecheck` job) | `Type Check` | ✓ | Runs `tsc --noEmit` per package; `@cerebro/studio`'s check is blocking (no `continue-on-error`) — this is the exact check that caught the Button-casing and `LivingArchitecture` import bugs. Other packages (`forge`, `platform-api`, `ai-gateway`, `forge-api`) are `continue-on-error: true`. |
| `Unit Tests` | `ci.yml` (`unit-tests` job) | `Unit Tests` | ✓ | Already matches exactly. Runs `pnpm run test --if-present`, no failure suppression. |
| `Security Scan` | `security-scan.yml` (`security-gate` job) | `🛡️ Security Gate` | ✓ | Aggregate gate job depending on secret-scan, SAST, dependency-scan, container-scan, IaC-scan, SBOM, and OpenSSF scorecard jobs in the same workflow. |
| `Dependency Audit` | `security-scan.yml` (`dependency-scan` job) | `📦 Dependency Scan` | ✓ | Real, runs on `push` to `main` (trigger matches). A separate `dependency-review.yml` (workflow name `Dependency Review`) also exists but only triggers on `pull_request`, not `push` — not the same job. |
| `Lint` | `ci.yml` (`lint` job) | `Lint & Format` | Pending | Runs real ESLint and Prettier, but both commands end in `\|\| true` — the job cannot fail regardless of lint or formatting errors. Name is close, but the job is not currently a gate. |
| `build` | `docker.yml` (`build` job, no `name:` override) | `build` (literal job id) | Pending | Step body is `echo "This workflow will build multi-architecture Docker images... once a Dockerfile is present."` — placeholder, no build occurs. |
| `Docker Build` | `docker.yml` (workflow-level name) | No matching check-run found | Pending | Same underlying placeholder job as `build`, above. No check-run literally named `Docker Build` was found in the commit's check-run list — `docker.yml`'s workflow display name is `Docker Build`, but its one job's context is the literal job id `build`. |
| `Coverage` | None found | — | Pending | No workflow publishes a status check named `Coverage` or equivalent. `ci.yml`'s `unit-tests` job uploads a coverage **artifact** (`coverage-report`), not a status check. The only repository-wide string match is a markdown heading (`## 🧪 Test Coverage Gaps`) inside an unrelated PR-comment template in `ai-code-review.yml`. |
| `Playwright (optional)` | `visual-regression.yml` (`test` job, no `name:` override) | `test` (literal job id) | Pending | Real — installs and runs Playwright. But the emitted context is the generic literal string `test`, not `Playwright (optional)`. Checked for collisions against all 32 workflow files; `test` as a job id is currently unique, but it is fragile (any future workflow adding an unnamed `test:` job would collide). |
| `Deploy Preview` | `preview.yml` (workflow name `Preview Deployments`, `preview` job) | No matching check-run found | Pending | Step body is `echo "This workflow will deploy PR previews to Vercel/Cloudflare Pages once an integration is added."` — placeholder, same pattern as `build`/`Docker Build`. |

### 4.1 A second, independently-discovered broken rule: `required_deployments`

Discovered while investigating an unrelated CI build failure (`ci.yml`'s `Build` job unintentionally building `apps/studio` in static-export mode — see the incident thread this document follows on from). Not part of the original 10-context audit above, but the same failure pattern, in a different rule type.

| Rule | Requirement | Evidence | Status |
|---|---|---|---|
| `required_deployments` | `required_deployment_environments: ["github-pages"]` — a successful `github-pages` deployment is required before a change can be merged normally | `gh api repos/.../pages` returns `404 Not Found` — GitHub Pages is not enabled for this repository. The one workflow that could produce a `github-pages` deployment, `pages.yml` ("Deploy Next.js to GitHub Pages"), is `disabled_manually`. Directly observed on a real push: GitHub's own bypass message reads `"Missing successful active github-pages deployment."` | Unsatisfiable through normal operation |

This is the same root cause as `build`, `Docker Build`, `Coverage`, and `Deploy Preview` in Section 5's Category C: a required governance rule with no live, active thing behind it. The fix for `ci.yml`'s Build job itself (setting `IS_FTP_DEPLOY: "true"` to build in `standalone` mode, matching the two real deploy workflows) has already been applied and merged (`5ab11fb`) — that was an application/CI-config fix, not a ruleset change, and is out of scope for this document. What remains open here is the ruleset rule itself: `required_deployments: [github-pages]` should be given the same explicit disposition (retain/rename/remove/replace) as the Category C items below, as part of the same single reconciliation.

## 5. Classification Matrix

### Category A — Verified / Canonical

Contexts whose exact replacement string is confirmed against a real, currently-blocking check.

| Current Required | Confirmed Replacement | Supporting Evidence |
|---|---|---|
| `typescript` | `Type Check` | `ci.yml` line 40; blocking `tsc --noEmit` on `@cerebro/studio`; confirmed via `gh api .../commits/main/check-runs` |
| `Unit Tests` | `Unit Tests` (no change) | `ci.yml` line 121; no suppression; confirmed via check-runs |
| `Security Scan` | `🛡️ Security Gate` | `security-scan.yml` line 310; aggregate of 7 sub-jobs; confirmed via check-runs |
| `Dependency Audit` | `📦 Dependency Scan` | `security-scan.yml` line 103; runs on matching trigger; confirmed via check-runs |

### Category B — Requires Rename/Reconciliation

Real, functioning checks whose required-context string doesn't match what's emitted, where the fix is naming rather than a policy decision.

| Current Required | Actual Emitted Context | Ambiguity | Potential Impact |
|---|---|---|---|
| `Playwright (optional)` | `test` | The real job (`visual-regression.yml`) has no `name:` override, so its context is the bare job id. Renaming the required context to literally `test` works today but is fragile — any future workflow with an unnamed `test:` job would silently collide and satisfy this requirement without actually running Playwright. | Low immediate risk (no current collision), but a latent trap for future workflow authors. Recommend giving the job an explicit `name:` in `visual-regression.yml` *before* making it required, rather than requiring the fragile literal `test`. |

### Category C — Requires Explicit Disposition

No naming fix resolves these — each needs a deliberate retain / rename / remove / replace decision, because there is no corresponding real check today.

| Check | Retain | Rename | Remove | Replace | Notes |
|---|---|---|---|---|---|
| `build` | | | Candidate | Candidate | Placeholder (`echo`). Either implement a real Docker build in `docker.yml`, or drop the requirement until it's real. |
| `Docker Build` | | | Candidate | Candidate | Same underlying placeholder as `build` — these two required contexts currently point at the same non-functional job. Worth resolving both together, not independently. |
| `Coverage` | | | Candidate | Candidate | No corresponding check exists. The ruleset separately defines a `code_coverage` rule (`minimum_coverage: 0.8`) — whether that rule type reads from a named status check, a native GitHub coverage integration, or a third-party integration (Codecov, etc.) was not verified in this pass and should be resolved before deciding this row. |
| `Deploy Preview` | | | Candidate | Candidate | Placeholder (`echo`), `preview.yml`. Same pattern as `build`/`Docker Build`. |
| `Lint` | Candidate | | | Candidate | Real tooling runs, but `\|\| true` on both the ESLint and Prettier steps means the job cannot fail. This is a policy decision, not a naming one: either remove the suppression (making it a genuine gate) or explicitly decide lint failures should not block merges and document that choice. Requiring it as-is today would misrepresent it as enforcement when it is not. |
| `required_deployments: [github-pages]` (Section 4.1 — a different rule type, not a status check) | | | Candidate | Candidate | GitHub Pages is disabled for this repository (`404` on the Pages API) and `pages.yml` is `disabled_manually`. Either re-enable Pages and the workflow, or remove this rule — it cannot be satisfied as configured. |

## 6. Risk Assessment

- **Branch protection lockout.** Not currently observed — the repo owner's `RepositoryRole` bypass (`bypass_mode: "always"`) means an over-strict reconciliation cannot lock out the account performing it. Risk is low for this specific repository's current configuration, but any future removal of that bypass actor would need this reconciliation to be correct first, or ordinary contributors could be blocked by required contexts that never post (as they effectively are today).
- **False-required contexts.** Confirmed present now (`build`, `Docker Build`, `Coverage`, `Deploy Preview`) — required checks that will never be satisfied through normal operation because nothing produces them, or (for `Lint`) are satisfied unconditionally regardless of real outcome.
- **Duplicate/overlapping contexts.** `build` and `Docker Build` both resolve to the same single placeholder job — the ruleset is effectively double-counting one non-functional check as two required ones.
- **Workflow rename effects.** Renaming a job's `name:` field (e.g. to fix `Playwright (optional)` → a stable explicit name) changes its check-run context going forward; any ruleset update must be sequenced with the workflow change, not before it, or there will be a window where the newly-required exact string doesn't yet exist.
- **Required-check drift.** This is the root cause already found — required contexts and actual workflow output were allowed to diverge silently over time with no verification step catching it. Any reconciliation should include a way to detect future drift (e.g. a periodic check comparing required contexts against `gh api .../commits/main/check-runs`), not just a one-time fix.
- **Future maintenance burden.** Emoji-prefixed context strings (`🛡️ Security Gate`, `📦 Dependency Scan`) are exact-match, byte-for-byte required strings in the ruleset — any future edit to those job `name:` fields (including whitespace or emoji changes) will silently break the requirement the same way this audit found `typescript`/`Type Check` had already broken.

## 7. Findings

**7.1 — The nested `.github/workflows/` copy is a real hazard, independent of this audit's main subject.** Early in this investigation, `ci.yml` was read from `OPC/cerebro-hive-website/.github/workflows/ci.yml` — a path GitHub Actions never executes, since only the actual repository root's `.github/workflows/` is recognized. That file describes a plausible-looking but entirely different job structure (`typecheck-lint`, `build`, `storybook`, etc.) than what's real. Anyone editing workflows from within the `OPC/cerebro-hive-website/` subdirectory context (as this session initially was) is at risk of editing or reading the wrong copy without any error or warning.

**7.2 — Partial reconciliation increases operational risk rather than reducing it.** Patching only the 4 Category A renames would leave the ruleset simultaneously more accurate (for those 4) and no less misleading overall (for the other 6) — a reviewer checking "is `main` protected by X?" would still get a false yes for `Docker Build`, `Coverage`, and `Deploy Preview`, and a partially-false yes for `Lint`.

**7.3 — Generic, unnamed job contexts are fragile by construction.** Both problem cases found where a job's context is just its bare id (`build` in `docker.yml`, `test` in `visual-regression.yml`) exist because the job has no explicit `name:` field. This is a repeatable failure mode, not a one-off — any workflow author who omits `name:` on a job produces a context string that's short, generic, and prone to future collision.

**7.4 — Canonical naming should be established once, not per-incident.** This is the second time in this session that a name mismatch (application-level: `Button` vs `button.tsx`; governance-level: required-context strings vs. actual job names) caused a real failure that was invisible until specifically audited. Both were caught by direct, evidence-based comparison against source, not by assumption.

**7.5 — The "dead required rule" pattern isn't limited to `required_status_checks`.** Section 4.1's `required_deployments: [github-pages]` finding is the same failure mode as Category C above (a required governance rule with nothing real behind it), but in a different rule type entirely, discovered independently and later. This suggests the drift documented in this report may not be confined to the 10 status-check contexts audited in Section 4 — the ruleset's other rule types (`code_scanning`, `code_coverage`, `code_quality`, `pull_request`'s reviewer requirements, etc.) were read in Section 3 but not each individually verified against a live, currently-functioning enforcement mechanism the way `required_status_checks` and `required_deployments` were. That verification is not done in this pass and is noted here as a gap, not assumed to be clean.

## 8. Recommendation

Perform one comprehensive ruleset reconciliation that simultaneously:

- validates every required status context against its actual, currently-emitted string,
- resolves the 3 confirmed naming inconsistencies (Category A),
- gives each of the remaining 6 required contexts (Category B/C) an explicit, documented disposition — retain, rename, remove, or replace — rather than leaving any as silent dead configuration,
- gives the `required_deployments: [github-pages]` rule (Section 4.1) the same explicit disposition, since it is unsatisfiable for the same underlying reason,
- updates the ruleset's `required_status_checks` and `required_deployments` parameters atomically, in one PATCH, rather than incrementally,
- and verifies the resulting configuration with a clean CI run afterward, confirming every context the ruleset now requires actually posts.

Given Finding 7.5, the reconciliation should also include a quick pass confirming the ruleset's other rule types (`code_scanning`, `code_coverage`, `code_quality`, `pull_request` review requirements) each correspond to something real, rather than assuming they're clean because this audit didn't find a problem with them — this audit didn't specifically look.

## 9. Non-Goals

This document does not modify any workflow file, does not modify the ruleset, does not rename any job, and does not alter branch protection in any way. It records verified evidence and a recommended reconciliation path only. The three Category A renames, despite being well-evidenced, remain unapplied pending the full disposition of Categories B and C, per the explicit decision to treat this as one governance change rather than a sequence of piecemeal edits.

## 10. Traceability

This document continues the same governance-first, evidence-before-implementation approach established by the prior architecture assessments in this directory:

- [`SPECIFICATION-GOVERNANCE-FINDING.md`](./SPECIFICATION-GOVERNANCE-FINDING.md) — specification-process governance (the 47-spec mass-production finding and the product-catalog mismatch).
- [`HIVEFORGE-IMPLEMENTATION-RECONCILIATION.md`](./HIVEFORGE-IMPLEMENTATION-RECONCILIATION.md) — implementation-scope governance (the 8-capability inventory against `hiveforge/`'s approved architecture).
- [`AIGOVERNANCEENGINE-SCOPE-ASSESSMENT.md`](./AIGOVERNANCEENGINE-SCOPE-ASSESSMENT.md) — architectural-boundary governance (the `AIGovernanceEngine` naming-collision and scope review).

Where those three established governance around specifications, implementation scope, and architectural boundaries respectively, this document establishes CI/CD governance: the verified state of what actually protects `main` today, and a complete reconciliation plan to be executed as one change before any ruleset or branch-protection modification is made.

This audit's findings are tracked in [`docs/ROADMAP.md`](../../ROADMAP.md) Section 4 (Outstanding Work) — the ruleset reconciliation itself, and the `required_deployments: [github-pages]` finding from Section 4.1, are both listed there as evidence-complete but not yet implemented.
