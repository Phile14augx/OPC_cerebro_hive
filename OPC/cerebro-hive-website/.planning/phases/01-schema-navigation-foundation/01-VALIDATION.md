---
phase: 1
slug: schema-navigation-foundation
status: gate-run
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-10
updated: 2026-08-11
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (`vitest.config.ts`, `vitest.dashboard.config.ts` at repo root) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm --filter studio vitest run <file> --reporter=dot` |
| **Full suite command** | `pnpm test` (repo root) |
| **Estimated runtime** | Build-verification-heavy phase — full `pnpm build` matters more than unit-test runtime here |

No existing test file covers `navigation/index.ts`, `Sidebar.tsx`, or any `forge/*` page. This phase is almost entirely route-resolution/rendering behavior, better covered by build-time verification (Next.js catching route conflicts) and a scripted route-audit than by unit tests.

---

## Sampling Rate

- **After every task commit:** Run the relevant package's `typecheck`/`build`; run the route-audit script for any nav-touching task
- **After every plan wave:** `pnpm build` (full monorepo)
- **Before `/gsd:verify-work`:** Full `pnpm build` green + manual click-through of every sidebar group (no automated sidebar-rendering test exists)
- **Max feedback latency:** ~60s (typecheck/build cycle)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01 Task 1, 01-01 Task 2, 01-04 Task 1 | 01, 04 | 0, 2 | NAV-01 | — | All 99 registry paths return 200 (real page or placeholder), never 404; `SIDEBAR_HANDPICK`/`PINNED_ORPHAN` assertions green | smoke (scripted route audit) | `node scripts/audit-nav-routes.mjs` | ✅ script exists | ✅ green — 99 registry items, 6/6 assertions passing |
| 01-01 Task 1, 01-01 Task 2 | 01 | 0 | NAV-02 | — | Every `planned`/`disabled` route renders `PlaceholderModule` with correct group/title/status | integration (Vitest + RTL) | `pnpm vitest run --config vitest.studio.config.ts --reporter=dot` | ✅ component + test exist | ✅ green — 1 file, 3 tests passed |
| 01-02 Task 1, 01-02 Task 2, 01-02 Task 3 | 02 | 1 | FORGE-01 | T-01-01 | 9 pages call their forge-api controller and render a non-decorative result | manual | — (no cross-service integration harness exists today; flag for future phase if repeated) | ❌ gap remains, stays manual | ⬜ pending — deferred to Task 2 human click-through (Check B) |
| 01-03 Task 1, 01-03 Task 2 | 03 | 1 | SCHM-01 | — | `Policy` model has org scoping + audit fields; no pending migrations against the live DB | build-time (Prisma migration status — the SCHM-01 blocking gate; a green build with a pending migration is a false positive) | `pnpm --filter @cerebro/db exec prisma migrate status` | ✅ migration applied (`20260810115849_policy_org_scoping`) | ✅ green — "Database schema is up to date!" (12 migrations found). Required starting Docker Desktop (was not running) and passing `DATABASE_URL` explicitly on the command — `pnpm --filter @cerebro/db exec` does not inherit `.env`, same finding as 01-03-SUMMARY.md |
| 01-03 Task 3 | 03 | 1 | SCHM-02 | — | `archive-api` and `archive-worker` are on the same BullMQ major version; no removed-API usage | build-time (package-manifest major-version comparison, not `typecheck` — `@cerebro/archive-worker` has no `typecheck` script and no `src/` directory, confirmed still true this run) | `node -e "const w=require('./services/archive-worker/package.json').dependencies.bullmq; const a=require('./services/archive-api/package.json').dependencies.bullmq; if (w.replace(/[^0-9.]/g,'').split('.')[0] !== a.replace(/[^0-9.]/g,'').split('.')[0]) { console.error('MAJOR-MISMATCH', w, a); process.exit(1); } console.log('BULLMQ-MAJOR-MATCH', w, a);"` (exact command from plan 01-03 task 3) | N/A | ✅ green — `BULLMQ-MAJOR-MATCH ^6.0.8 ^6.0.8`, exit 0 |
| 01-05 Task 1, 01-05 Task 2 | 05 | 2 | FORGE-02 | D-15 | 10 unbacked CerebroForge pages render the shared `PlaceholderModule`, zero fabricated `StatCard`/`setTimeout` remain | grep sweep (fabricated-content sweep, this plan's Task 1) | comment-stripped grep for `StatCard`/`setTimeout` + line-count check across `forge/{backend,database,api,mobile,web,desktop,bots,repos,ui-studio,monitoring}/page.tsx` | ✅ all 10 files exist, 7 lines each | ✅ green — 0 `StatCard`, 0 `setTimeout` across all 10 files, all 7 lines |
| 01-06 Task 1, 01-06 Task 2 | 06 | 2 | NAV-02 (HiveOps placeholder conversion) | D-05, T-01-18/19/20 | 7 HiveOps pages render the shared `PlaceholderModule`, zero fabricated pipeline/deployment/cluster/security/cost/gitops data remain | grep sweep (fabricated-content sweep, this plan's Task 1) | comment-stripped grep for `StatCard`/`setTimeout` + line-count check across `hiveops/{,pipelines,deployments,clusters,security,costs,gitops}/page.tsx` | ✅ all 7 files exist, 7 lines each | ✅ green — 0 `StatCard`, 0 `setTimeout` across all 7 files, all 7 lines |
| 01-07 Task 1 | 07 | 3 | Whole-program gate | T-01-22 | `typecheck`/`lint`/`test`/`build` all exit 0 across the monorepo | build-time | `pnpm typecheck && pnpm lint && pnpm test && pnpm build` | N/A | ⚠️ mixed — see "Whole-Program Gate Results" below: `typecheck` and `test` green; `lint` and `build` fail on pre-existing, out-of-phase-scope packages, not on any file this phase modified |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky/mixed*

---

## Whole-Program Gate Results (this plan, Task 1)

Run 2026-08-11. Commands run in the order specified by the plan action, from the repo working directory `OPC/cerebro-hive-website`:

| # | Command | Exit Code | Result |
|---|---------|-----------|--------|
| 1 | `node scripts/audit-nav-routes.mjs` | 0 | ✅ 99 registry items, 6/6 assertions passing, including `SIDEBAR_HANDPICK` and `PINNED_ORPHAN` |
| 2 | `pnpm vitest run --config vitest.studio.config.ts --reporter=dot` | 0 | ✅ 1 test file, 3 tests passed (the `PlaceholderModule` render test) |
| 3 | `pnpm --filter @cerebro/db exec prisma migrate status` | 0 | ✅ "Database schema is up to date!" (12 migrations found). **Deviation:** Docker Desktop was not running (the `cerebrohive-db` container was stopped); started it and waited for the container's healthcheck before retrying. Also had to pass `DATABASE_URL` explicitly on the command line — `pnpm --filter @cerebro/db exec` does not inherit the package's `.env`, a pre-existing tooling gap already documented in 01-03-SUMMARY.md's Issues Encountered |
| 4 | `pnpm typecheck` | 0 | ✅ 92/92 packages successful, including `@cerebro/studio` and `@cerebro/forge-api` |
| 5 | `pnpm lint` | 2 | ❌ **FAIL** — see "Lint Failure Detail" below |
| 6 | `pnpm test` | 0 | ✅ 61/61 packages successful (e.g. `@cerebro/domain` 191 tests, `@cerebro/forge-api` 74 tests, `@cerebro/engineering-review` 45 tests) |
| 7 | `pnpm build` | 2 | ❌ **FAIL** — see "Build Failure Detail" below |

### Lint Failure Detail (pre-existing, out of Phase 1 scope)

`pnpm lint` (unfiltered, `turbo lint --continue=always`) fails on 21 packages: `@cerebro-hive/contentops`, `@cerebro/ai`, `@cerebro/ai-gateway`, `@cerebro/archive-api`, `@cerebro/archive-contracts`, `@cerebro/auth`, `@cerebro/capability-registry`, `@cerebro/contracts`, `@cerebro/db`, `@cerebro/domain`, `@cerebro/domain-model`, `@cerebro/forge-api`, `@cerebro/policy`, `@cerebro/pulse`, `@cerebro/sphere`, `@cerebro/studio`, `@cerebro/telemetry`, `@cerebro/twin-studio`, `@cerebro/ui`, `@cerebro/workflow`, `platform`. Two distinct pre-existing causes, both confirmed via `git log` to predate every Phase 1 commit:

1. **Missing per-package ESLint flat config (majority of the list).** The root `eslint.config.mjs` is scoped to the root-level Next.js app only and globally ignores `apps/**`, `packages/**`, `services/**` ("Turborepo workspace packages have their own configs — don't double-lint them"). Any workspace package that lacks its own local `eslint.config.mjs` — including `@cerebro/db`, which this phase's plan 01-03 modified for the `Policy` schema change — falls through to that root config, whose blanket ignore then matches every file the package's own `lint` script tries to target, producing ESLint's hard error `"you are linting X, but all files matching the glob pattern are ignored"`. This is a repo-wide monorepo-tooling gap unrelated to any of this phase's actual code changes (schema field additions, nav registry, forge wiring) — fixing it properly means auditing and adding ~15+ per-package ESLint configs, which is out of a Task 1 gate's remit and risks masking real lint debt in packages this phase never reviewed. Not fixed.
2. **`@cerebro/studio`'s pre-existing baseline (524 errors / 435 warnings, unchanged from 01-06-SUMMARY.md's finding).** Confirmed via `git log` that the specific flagged lines (e.g. `Sidebar.tsx`'s unused `ChevronRight` import) predate the commit before plan 01-01 first touched this file (`1da9ccf`) — pre-existing, not a regression from any Phase 1 plan. Verified none of the flagged files/lines are inside `forge/*`, `hiveops/*`, `Sidebar.tsx`'s nav-rendering logic, `Topbar.tsx`, or `Breadcrumbs.tsx`'s changed regions.

**One narrow fix was applied** (Rule 3 — blocking issue in a file this phase's own SCHM-02 task modified): `services/archive-worker/package.json`'s `lint` script (`eslint src/`) hard-crashed with exit 2 before even reaching the packages above, because `@cerebro/archive-worker` has no `src/` directory (confirmed pre-existing, see Build Failure Detail). Added ESLint's `--no-error-on-unmatched-pattern` flag so the script degrades to a clean no-op instead of crashing the whole `pnpm lint` run — this is the same "package has no source yet" fact already documented in this plan's own `read_first` for SCHM-02, applied consistently to the `lint` script. This did not fix the 21-package failure above; it only stopped that specific crash from masking the real results.

### Build Failure Detail (pre-existing, out of Phase 1 scope)

`pnpm build` (unfiltered) fails on `@cerebro/archive-worker` alone: `error TS18003: No inputs were found in config file '...services/archive-worker/tsconfig.json'` — the package has **zero files under `src/`** (confirmed via `git log` that only `package.json`'s BullMQ version was touched by plan 01-03; the package has been an empty scaffold since the original `feat(archive): add CerebroArchive service foundation` commit, long before this phase). Turbo's default (non-`--continue`) behavior stops the run at the first failure. `@cerebro/archive-worker`'s implementation is explicitly Knowledge Hub/Phase 4 scope per `PROJECT.md` — not fixed; scaffolding real source files for it here would be an out-of-scope architectural addition.

Re-running `pnpm build --filter='!@cerebro/archive-worker'` with `DATABASE_URL`/`REDIS_URL` passed through (both are declared in `turbo.json`'s `globalEnv` but were not present in the invoking shell) completes **all 44 remaining packages successfully (exit 0)**, including `@cerebro/studio` (all `/app/forge/*` and `/app/hiveops/*` routes present in the static route table) and `@cerebro/forge-api`. `@cerebro/sphere` needed `REDIS_URL` at build time for its `/api/dashboard` static-generation step — confirmed via `git log` that `apps/sphere` has not been touched by any Phase 1 plan; this is a pre-existing missing-env-var gap in the build invocation, not a code defect, and was resolved by passing the env var rather than editing any file.

### Fabricated-Content Sweep (all 17 converted pages + catch-all)

Comment-stripped grep for `StatCard` and `setTimeout`, plus line-count check, across all 10 `forge/*` pages from plan 01-05 and all 7 `hiveops/*` pages from plan 01-06:

| File | Lines | `StatCard` | `setTimeout` |
|------|-------|------------|--------------|
| forge/backend/page.tsx | 7 | 0 | 0 |
| forge/database/page.tsx | 7 | 0 | 0 |
| forge/api/page.tsx | 7 | 0 | 0 |
| forge/mobile/page.tsx | 7 | 0 | 0 |
| forge/web/page.tsx | 7 | 0 | 0 |
| forge/desktop/page.tsx | 7 | 0 | 0 |
| forge/bots/page.tsx | 7 | 0 | 0 |
| forge/repos/page.tsx | 7 | 0 | 0 |
| forge/ui-studio/page.tsx | 7 | 0 | 0 |
| forge/monitoring/page.tsx | 7 | 0 | 0 |
| hiveops/page.tsx | 7 | 0 | 0 |
| hiveops/pipelines/page.tsx | 7 | 0 | 0 |
| hiveops/deployments/page.tsx | 7 | 0 | 0 |
| hiveops/clusters/page.tsx | 7 | 0 | 0 |
| hiveops/security/page.tsx | 7 | 0 | 0 |
| hiveops/costs/page.tsx | 7 | 0 | 0 |
| hiveops/gitops/page.tsx | 7 | 0 | 0 |

**Result: ✅ PASS.** All 17 files are 7 lines (well under the 15-line ceiling), zero `StatCard` and zero `setTimeout` occurrences. The catch-all route (`app/[...segments]/page.tsx`, 32 lines — expected to be larger since it does the registry lookup, not a converted stub) also has zero `StatCard`/`setTimeout` occurrences.

### Verdict

This phase's own code (navigation registry, `PlaceholderModule`, the 17 converted pages, the `Policy` schema change, the `archive-api`/`archive-worker` BullMQ reconciliation, forge-api wiring) is fully green: the route audit, the placeholder render test, the migration-status gate, whole-program `typecheck`, whole-program `test`, and the fabricated-content sweep all pass with no exceptions. `pnpm lint` and `pnpm build`, run unfiltered exactly as the plan's acceptance criteria specify, do **not** exit 0 — both failures are confirmed pre-existing and outside every file this phase's six plans modified (`@cerebro/archive-worker`'s empty scaffold, `@cerebro/sphere`'s missing build-time env var, and a repo-wide ESLint flat-config gap affecting ~21 packages). Per this plan's own instruction ("if any gate fails, stop and report the failure rather than proceeding to the human checkpoint"), Task 1 stops here and reports this mixed result rather than declaring the whole-program gate green. The orchestrator and user should decide whether these two pre-existing, separately-tracked gaps block sign-off or are accepted as-is before Task 2's human click-through proceeds.

---

## Wave 0 Requirements

- [x] `scripts/audit-nav-routes.mjs` — scripted verification that every registry href resolves without 404. Covers NAV-01. Exists and green (6/6 assertions).
- [x] `PlaceholderModule` component + a basic render test — covers NAV-02. Exists and green (3/3 tests, `vitest.studio.config.ts`).
- [x] No existing test harness for cross-service (Studio → forge-api) integration exists — FORGE-01 verification stays manual this phase, deferred to Task 2's human click-through (Check B); not a Wave 0 blocker, a documented gap.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| CerebroForge's 9 functional pages return real, non-decorative results from forge-api | FORGE-01 | No cross-service (Studio ↔ forge-api) integration test harness exists in this repo today | Run `pnpm dev` (both apps/studio and services/forge-api), click through each of the 9 pages, confirm real data renders (not a loading skeleton stuck forever, not an error swallowed silently). Deferred to this plan's Task 2, Check B. |
| Full sidebar click-through across all 14 groups | NAV-01 / D-13 | No automated sidebar-rendering test exists | Load Studio locally, expand every sidebar group, click every item, confirm no 404 and no dead link. Deferred to this plan's Task 2, Check A. |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies — every row in the Per-Task Verification Map above has a real automated command or an explicit manual-only justification
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (route-audit script, PlaceholderModule + test) — both now exist and are green
- [x] No watch-mode flags — every command above uses `run`/one-shot invocation, never `--watch`
- [x] Feedback latency < 60s — the per-task dev-loop commands (route audit, scoped typecheck, placeholder test) all complete well under 60s; the whole-program gate itself (this plan's Task 1) is a slower, once-per-phase run, not the per-task sampling loop this criterion targets
- [x] `nyquist_compliant: true` set in frontmatter — real plan/task IDs now populated in the Per-Task Verification Map above, replacing every `01-01-XX` placeholder

**Approval:** NOT YET APPROVED. This phase's own code is fully green (route audit, placeholder test, migration status, whole-program `typecheck`, whole-program `test`, fabricated-content sweep). `pnpm lint` and `pnpm build`, run unfiltered exactly as this plan's acceptance criteria specify, do not exit 0 — see "Whole-Program Gate Results" above for the full detail. Both failures are confirmed pre-existing and outside every file this phase's six plans modified. Per this plan's action text ("if any gate fails, stop and report the failure rather than proceeding to the human checkpoint"), sign-off is withheld pending an explicit orchestrator/user decision on whether these two pre-existing gaps block Task 2, before the human click-through proceeds.

---

## Security Domain (carried from 01-RESEARCH.md)

**Known, pre-existing gap — not this phase's job to fix, but must not be papered over:** none of forge-api's 9 controllers (`projects`, `planner`, `requirements`, `architect`, `codegen`, `testing`, `review`, `deploy`, `docs`) have an auth guard or enforced tenant/org scoping on their queries. This is pre-existing, not introduced by this phase's wiring work. Consistent with D-04 (no new backend surface) and WKSP-05 (the shared tenant-scoping helper is Phase 2's job), fixing this is out of Phase 1's scope — but the plan/verifier must record it as a known gap rather than an implicit "already secure" assumption.
