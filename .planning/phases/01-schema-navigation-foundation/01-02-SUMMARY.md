---
phase: 01-schema-navigation-foundation
plan: 02
subsystem: forge-ui
tags: [nextjs, app-router, forge-api, error-states, react-hooks]

# Dependency graph
requires: []
provides:
  - "Locked error-banner contract (Card p-4 border-red-500/20 bg-red-500/5 flex items-start gap-3 + AlertTriangle + Try again ghost button) applied uniformly across all 9 backed CerebroForge pages"
  - "No project selected empty-state text in each of the 8 project-scoped Forge pages' existing context/status slot"
  - "Forge Overview surfaces useForgeProjects().error and forgeApi.projects.create() failures with working retry"
affects: [01-05-forge-fake-data-removal, 01-06-forge-fake-data-removal]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Retry-kind state pattern: instead of storing a closure that could self-reference before initialization, track which of several possible failing actions last failed (retryKind: 'build' | 'new' | null) and dispatch the correct handler from a single retry callback"
    - "Context/status slot reuse: every page's existing header description paragraph or project-name badge slot doubles as the empty-state announcement location — no new banner component introduced anywhere in this plan"

key-files:
  modified:
    - "apps/studio/app/(platform)/app/forge/page.tsx"
    - "apps/studio/app/(platform)/app/forge/planner/page.tsx"
    - "apps/studio/app/(platform)/app/forge/codegen/page.tsx"
    - "apps/studio/app/(platform)/app/forge/requirements/page.tsx"
    - "apps/studio/app/(platform)/app/forge/architect/page.tsx"
    - "apps/studio/app/(platform)/app/forge/testing/page.tsx"
    - "apps/studio/app/(platform)/app/forge/review/page.tsx"
    - "apps/studio/app/(platform)/app/forge/deploy/page.tsx"
    - "apps/studio/app/(platform)/app/forge/docs/page.tsx"

key-decisions:
  - "Forge Overview's two forgeApi.projects.create() call sites (handleBuild, handleNewProject) share one createError/retryKind pair rather than two separate error states — retryKind ('build'|'new') records which handler last failed so Try again re-invokes exactly that handler, avoiding a self-referencing useCallback closure"
  - "AI Planner had no pre-existing context/status banner (unlike Requirements Studio's blue Card banner) — the No project selected text was added inline into the page's existing header description paragraph rather than inventing a new banner component, per the plan's explicit instruction not to add a new banner component"
  - "Testing/Review/Deploy/Docs pages' existing error banners used flex items-center gap-3 (not the locked flex items-start gap-3) — restructured to items-start with a flex-1 wrapper div per 01-UI-SPEC.md §4, while preserving the Card's own existing classes, exactly as the plan's Task 3 action anticipated"

requirements-completed: [FORGE-01]

# Metrics
duration: 45min
completed: 2026-08-10
---

# Phase 1 Plan 2: CerebroForge Honest-State Surface Summary

**All 9 backend-backed CerebroForge pages now render forge-api errors through one locked banner contract with a working per-action Try again retry, and every project-scoped page states "No project selected" instead of a silent/blank empty state.**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-08-10T07:52:00Z (approx.)
- **Completed:** 2026-08-10T08:33:39Z
- **Tasks:** 3
- **Files modified:** 9 (0 new, 9 modified)

## Accomplishments

- Forge Overview (`forge/page.tsx`) no longer swallows `useForgeProjects().error` — it now destructures `error`/`refresh` and renders the locked error banner with `Try again` wired to `refresh()`. Both `forgeApi.projects.create()` call sites (`handleBuild`, `handleNewProject`) now set a `createError` on failure instead of discarding it, and a `retryKind` state lets one `Try again` control re-invoke exactly the handler that failed.
- AI Planner (`forge/planner/page.tsx`) and Code Generation (`forge/codegen/page.tsx`) — the two pages that RESEARCH.md flagged as fully silent — now render their already-destructured `error`/`state.error` through the locked banner, with `Try again` re-invoking `handlePlan`/`handleStart` respectively, and both show `No project selected` when `projectId` is absent.
- Requirements Studio and Architecture Studio's pre-existing bare error `Card`s were upgraded in place to the locked `AlertTriangle` + `Try again` contract without moving their position in the layout; Architecture Studio also gained the `No project selected` text it was missing.
- Testing Intelligence, AI Code Review, Deployment Studio, and AI Documentation — all four already had `AlertTriangle` banners — gained a `Try again` button wired to each page's own generation handler (`handleRunTests`, `handleReview`, `handleDeploy`, `handleGenerate`) and `No project selected` text in their existing description slot. Their banners' `flex items-center gap-3` wrapper was restructured to the locked `flex items-start gap-3` + `flex-1` shape.
- Zero new forge-api endpoints/DTOs, zero new client abstraction, zero CTA renames — confirmed via grep gates (`Generate Requirements` label unchanged) and by not touching any file under `apps/studio/lib/forge/`.
- `pnpm --filter @cerebro/studio typecheck` and `pnpm --filter @cerebro/studio build` both exit 0 with all three tasks' changes in place.

## Task Commits

1. **Task 1: Give the three silent pages an honest error/empty surface (Forge Overview, AI Planner, Code Generation)** - `7d1e85a` (feat)
2. **Task 2: Upgrade the two partially-covered pages (Requirements Studio, Architecture Studio)** - `5708928` (feat)
3. **Task 3: Add retry and empty states to the four already-bannered pages (Testing, Review, Deploy, Docs)** - `99a9da1` (feat)

## Files Created/Modified

- `apps/studio/app/(platform)/app/forge/page.tsx` - destructures `error`/`refresh` from `useForgeProjects()`; renders error banner above Active Builds with `Try again` → `refresh()`; adds `createError`/`retryKind` state around both `forgeApi.projects.create()` call sites with a shared retry banner
- `apps/studio/app/(platform)/app/forge/planner/page.tsx` - renders `error` through the locked banner with `Try again` → `handlePlan`; adds `No project selected` text to the header description
- `apps/studio/app/(platform)/app/forge/codegen/page.tsx` - renders `state.error` through the locked banner with `Try again` → `handleStart`; adds `No project selected` text to the header description
- `apps/studio/app/(platform)/app/forge/requirements/page.tsx` - upgrades existing bare error `Card` to the locked `AlertTriangle` + `Try again` contract, wired to `handleGenerate`
- `apps/studio/app/(platform)/app/forge/architect/page.tsx` - same upgrade wired to `handleDesign`; adds `No project selected` text alongside the existing project-name span
- `apps/studio/app/(platform)/app/forge/testing/page.tsx` - adds `Try again` (→ `handleRunTests`) inside the existing `AlertTriangle` banner, restructured to `items-start`; adds `No project selected` text
- `apps/studio/app/(platform)/app/forge/review/page.tsx` - adds `Try again` (→ `handleReview`); adds `No project selected` text
- `apps/studio/app/(platform)/app/forge/deploy/page.tsx` - adds `Try again` (→ `handleDeploy`, preserving the `environment` argument marshalling inside the existing handler); adds `No project selected` text
- `apps/studio/app/(platform)/app/forge/docs/page.tsx` - adds `Try again` (→ `handleGenerate`); adds `No project selected` text

## Decisions Made

- **Forge Overview's shared `createError`/`retryKind` pattern** — rather than giving `handleBuild` and `handleNewProject` two separate error/retry pairs, one `createError` state renders through one banner and a `retryKind: "build" | "new" | null` state records which handler last failed. `handleRetryCreate` dispatches to the correct handler. This avoids a `useCallback` referencing itself before initialization (which `setRetryCreate(() => handleBuild)` inside `handleBuild`'s own body would have required) while still satisfying the plan's "Try again re-invoking the same create handler" requirement.
- **AI Planner's empty state placed in the header description, not a new banner** — Planner has no pre-existing context/status `Card` (unlike Requirements Studio's blue banner). Per the plan's explicit "do not invent a new banner component; reuse the page's existing layout slots" instruction, `No project selected` was appended as conditional text inside the page's existing `<p>` description, matching the same pattern already used by Codegen/Architect/Testing/Review/Deploy/Docs (all of which show project context inline in a description paragraph or badge, not a dedicated banner).
- **Testing/Review/Deploy/Docs's `items-center` → `items-start` restructure** — their pre-existing banners used `flex items-center gap-3` with the message as a direct sibling of the icon. To add a `Try again` button under the message without it visually competing with `AlertTriangle`'s vertical center, the message and button were wrapped in a `flex-1` div and the row changed to `items-start`, matching 01-UI-SPEC.md §4's locked shape exactly, per the plan's own anticipation of this restructure in Task 3's action text.
- **Deploy's `Try again` reuses `handleDeploy` (not a raw `runDeploy(environment)` call)** — `handleDeploy` already closes over the page's `environment` select-state, so calling it from `Try again` preserves the same argument marshalling the primary CTA uses, per the plan's "call through whatever handler the page's primary CTA already uses" instruction.

## Deviations from Plan

None — plan executed exactly as written. Every file touched was in the plan's `<files>` list for its task, no file under `apps/studio/lib/forge/` was modified, and no forge-api endpoint/DTO/CTA label was added or changed.

## Issues Encountered

None.

## Known Stubs

None. All 9 pages already had real forge-api-backed data flows (`useForgeProjects`, `useForgeProject`, `useForgeActions`, `useCodegen`) from before this plan; this plan only added the missing error/empty rendering around existing real state, it did not introduce any new hardcoded/mock data path.

## Threat Flags

None. No new endpoints, DTOs, or trust boundaries were introduced. Per threat T-01-04's mitigation, every error string rendered by this plan flows through plain React text interpolation (`{error}` / `{state.error}`) — no `dangerouslySetInnerHTML`, no `console.error` of the raw response object, and no `NEXT_PUBLIC_FORGE_API_URL` or request header is surfaced in any banner. No `Authorization` header was added anywhere — `apps/studio/lib/forge/api-client.ts` was not modified by this plan, confirming T-01-05's deliberately-deferred gap was not widened.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All 9 backed CerebroForge pages (`forge`, `planner`, `requirements`, `architect`, `codegen`, `testing`, `review`, `deploy`, `docs`) now share one consistent error/empty-state contract, matching 01-UI-SPEC.md §4 verbatim (verified via `border-red-500/20`, `AlertTriangle`, and `Try again` grep gates on every file).
- `01-NAV-STATUS.md` from plan 01-01 already lists the 10 unbacked CerebroForge pages (`forge/backend`, `forge/database`, `forge/api`, `forge/mobile`, `forge/web`, `forge/desktop`, `forge/bots`, `forge/repos`, `forge/ui-studio`, `forge/monitoring`) that plans 01-05/01-06 (FORGE-02) will replace with `PlaceholderModule` — this plan did not touch any of those 10 files, so FORGE-02's fake-data-removal diff stays clean.
- No blockers identified for downstream Phase 1 plans.

## Self-Check: PASSED

All 9 modified files confirmed present on disk with expected content (grep gates for `AlertTriangle`, `Try again`, `No project selected`, `border-red-500/20` all passed per-file). All 3 commit hashes (7d1e85a, 5708928, 99a9da1) confirmed present in `git log`. `pnpm --filter @cerebro/studio typecheck` and `pnpm --filter @cerebro/studio build` both exited 0.

---
*Phase: 01-schema-navigation-foundation*
*Completed: 2026-08-10*
