---
phase: 1
slug: schema-navigation-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-10
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
| 01-01-XX | 01 | 0 | NAV-01 | — | All 99 registry paths return 200 (real page or placeholder), never 404 | smoke (scripted route audit) | `node scripts/audit-nav-routes.ts` | ❌ W0 — script doesn't exist yet | ⬜ pending |
| 01-01-XX | 01 | 0 | NAV-02 | — | Every `planned`/`disabled` route renders `PlaceholderModule` with correct group/title/status | integration (Vitest + RTL) | `pnpm --filter studio vitest run tests/placeholder-module.test.tsx` | ❌ W0 — component + test both new | ⬜ pending |
| 01-01-XX | 01 | 1 | FORGE-01 | T-01-01 | 9 pages call their forge-api controller and render a non-decorative result | manual | — (no cross-service integration harness exists today; flag for future phase if repeated) | ❌ W0 gap, stays manual | ⬜ pending |
| 01-01-XX | 01 | 1 | SCHM-01 | — | `Policy` model has org scoping + audit fields; `prisma generate`/`migrate` succeeds | build-time (Prisma validation) | `pnpm --filter @cerebro/db prisma validate && pnpm --filter @cerebro/db prisma migrate dev --create-only` | N/A — Prisma's own validation is the test | ⬜ pending |
| 01-01-XX | 01 | 1 | SCHM-02 | — | `pnpm install` succeeds with both services on the same bullmq major; no removed-API usage | build-time | `pnpm install && pnpm --filter @cerebro/archive-api typecheck && pnpm --filter @cerebro/archive-worker typecheck` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*
*Task IDs are placeholders (`01-01-XX`) — the planner assigns real task IDs; this table's rows map 1:1 to the requirement/verification pairs above regardless of final IDs.*

---

## Wave 0 Requirements

- [ ] `scripts/audit-nav-routes.ts` (or equivalent) — scripted verification that every registry href resolves without 404. Covers NAV-01.
- [ ] `PlaceholderModule` component + a basic render test — covers NAV-02.
- [ ] No existing test harness for cross-service (Studio → forge-api) integration exists — FORGE-01 verification is manual this phase; not a Wave 0 blocker, just a known gap.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| CerebroForge's 9 functional pages return real, non-decorative results from forge-api | FORGE-01 | No cross-service (Studio ↔ forge-api) integration test harness exists in this repo today | Run `pnpm dev` (both apps/studio and services/forge-api), click through each of the 9 pages, confirm real data renders (not a loading skeleton stuck forever, not an error swallowed silently) |
| Full sidebar click-through across all 14 groups | NAV-01 / D-13 | No automated sidebar-rendering test exists | Load Studio locally, expand every sidebar group, click every item, confirm no 404 and no dead link |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (route-audit script, PlaceholderModule + test)
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter (pending planner's real task IDs)

**Approval:** pending

---

## Security Domain (carried from 01-RESEARCH.md)

**Known, pre-existing gap — not this phase's job to fix, but must not be papered over:** none of forge-api's 9 controllers (`projects`, `planner`, `requirements`, `architect`, `codegen`, `testing`, `review`, `deploy`, `docs`) have an auth guard or enforced tenant/org scoping on their queries. This is pre-existing, not introduced by this phase's wiring work. Consistent with D-04 (no new backend surface) and WKSP-05 (the shared tenant-scoping helper is Phase 2's job), fixing this is out of Phase 1's scope — but the plan/verifier must record it as a known gap rather than an implicit "already secure" assumption.
