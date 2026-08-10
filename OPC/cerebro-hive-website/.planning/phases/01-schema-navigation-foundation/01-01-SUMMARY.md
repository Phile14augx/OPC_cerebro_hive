---
phase: 01-schema-navigation-foundation
plan: 01
subsystem: navigation
tags: [nextjs, app-router, catch-all-route, navigation-registry, react-testing-library, vitest]

# Dependency graph
requires: []
provides:
  - "implementationStatus (active|planned|disabled) on all 99 NavItems in navigation/index.ts"
  - "Shared registry lookup module (findNavEntryByPath, findNavTrailByPath, allNavGroups) at navigation/lookup.ts"
  - "PlaceholderModule component — canonical 'not yet available' UI"
  - "Registry-driven catch-all route at app/(platform)/app/[...segments]/page.tsx — zero /app/* 404s"
  - "Wave-0 verification harnesses: scripts/audit-nav-routes.mjs, vitest.studio.config.ts, tests/unit/placeholder-module.test.tsx"
affects: [01-04-breadcrumbs-sidebar-reachability, 01-05-forge-fake-data-removal, 01-06-forge-fake-data-removal]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Registry-driven catch-all route: single [...segments]/page.tsx resolves every /app/* path via a shared lookup module instead of per-route special-casing"
    - "Static text-parsing audit script (no dev server/build required) cross-checks a TypeScript config object against the filesystem route tree"

key-files:
  created:
    - apps/studio/app/(platform)/app/navigation/lookup.ts
    - apps/studio/app/(platform)/app/components/ui/PlaceholderModule.tsx
    - "apps/studio/app/(platform)/app/[...segments]/page.tsx"
    - scripts/audit-nav-routes.mjs
    - vitest.studio.config.ts
    - tests/unit/placeholder-module.test.tsx
    - .planning/phases/01-schema-navigation-foundation/01-NAV-STATUS.md
  modified:
    - apps/studio/app/(platform)/app/navigation/index.ts
    - apps/studio/app/(platform)/app/components/Sidebar.tsx

key-decisions:
  - "AI Agents (/app/agents) and AI Workflows (/app/workflows) classified planned despite calling fetch() — the SDK client targets a hardcoded 'Mocked URL for now' (localhost:3000) with no verified running backend, unlike forge-api's 9 active items (verified operational this session)"
  - "Analytics (/app/analytics) classified planned — its page.tsx only redirects into a store-driven dashboard, no backend call"
  - "forge/backend and forge/monitoring demoted from their existing page.tsx to planned — both render fabricated StatCard/alert data and setTimeout-backed fake actions (D-15); actual removal deferred to a later plan (FORGE-02 scope)"
  - "Fixed Sidebar.tsx's stale pinnedFavorites href (/app/automation/workflows -> /app/automation/builder) as a Rule 1 bug fix, outside the plan's original files_modified list, because the PINNED_ORPHAN acceptance gate requires it and D-14/01-PATTERNS.md name the exact one-line fix"

patterns-established:
  - "Pattern: implementationStatus is a required NavItem field — TypeScript enforces 99/99 coverage at compile time, no item can be silently added without a status"
  - "Pattern: navigation/lookup.ts is import-safe from server and client components (no 'use client', no React/next imports) — safe to import from both the catch-all route and future server-rendered breadcrumbs"

requirements-completed: [NAV-01, NAV-02]

# Metrics
duration: 65min
completed: 2026-08-10
---

# Phase 1 Plan 1: Schema & Navigation Foundation — Honest Destination Slice Summary

**Registry-driven catch-all route + PlaceholderModule + implementationStatus on all 99 nav items, eliminating every possible /app/\* 404 across CerebroHive Studio.**

## Performance

- **Duration:** ~65 min
- **Started:** 2026-08-10T12:15:00+05:30 (approx.)
- **Completed:** 2026-08-10T13:18:48+05:30
- **Tasks:** 2
- **Files modified:** 8 (6 new, 2 modified)

## Accomplishments

- Every one of the 99 navigation registry items now carries a compile-time-enforced `implementationStatus` (`active` | `planned` | `disabled`) — 9 `active` (CerebroForge's verified-live forge-api-backed tools), 90 `planned`.
- Built the single shared `PlaceholderModule` component (no prior "empty state" component existed anywhere in the codebase) rendering the exact locked copy from 01-UI-SPEC.md.
- Built `navigation/lookup.ts` — one resolver (`findNavEntryByPath`/`findNavTrailByPath`) used by the catch-all today and available for plan 01-04's breadcrumbs tomorrow, including the group-href fallback pass needed for `/app/security` and `/app/support`.
- Built the registry-driven catch-all route `[...segments]/page.tsx` — confirmed via production build (`ƒ /app/[...segments]`) and the Wave-0 audit script that no `/app/*` path can 404, including unregistered/stale links (rendered as `Unknown / {path}`).
- Built both Wave-0 verification harnesses first (Task 1) and confirmed they failed for the correct reasons before building the real implementation (Task 2) turned them green.
- Documented every classification decision (per-item `active`/`planned` rationale, including judgment calls) in `01-NAV-STATUS.md`.

## Task Commits

1. **Task 1: Build the two Wave-0 verification harnesses (both must FAIL on current code)** - `72f3aca` (test)
2. **Task 2: Ship the honest-destination slice — registry status, shared lookup, PlaceholderModule, catch-all route** - `1da9ccf` (feat)

_Note: both harnesses in Task 1 were confirmed failing (MISSING_STATUS token present, 99 item count reported; module-resolution failure naming PlaceholderModule) before Task 2 began, per the plan's Wave-0 requirement._

## Files Created/Modified

- `apps/studio/app/(platform)/app/navigation/index.ts` - `implementationStatus` added as a required `NavItem` field; value assigned to all 99 items across all 14 groups
- `apps/studio/app/(platform)/app/navigation/lookup.ts` - `allNavGroups`, `findNavEntryByPath`, `findNavTrailByPath` — single shared registry resolver (D-08)
- `apps/studio/app/(platform)/app/components/ui/PlaceholderModule.tsx` - canonical "not yet available" component (D-06/D-07), composed from existing `Card`/`Badge` primitives
- `apps/studio/app/(platform)/app/[...segments]/page.tsx` - registry-driven catch-all route, never calls `notFound()`
- `apps/studio/app/(platform)/app/components/Sidebar.tsx` - one-line fix: `pinnedFavorites`'s "Workflows" href corrected from a nonexistent route to `/app/automation/builder`
- `scripts/audit-nav-routes.mjs` - static Wave-0 audit script (6 named assertions: MISSING_STATUS, INVALID_STATUS, UNRESOLVED_ROUTE, ACTIVE_WITHOUT_PAGE, PINNED_ORPHAN, SIDEBAR_HANDPICK)
- `vitest.studio.config.ts` - jsdom + `tests/unit/**` vitest config, mirroring `vitest.dashboard.config.ts`
- `tests/unit/placeholder-module.test.tsx` - locked-copy render assertions for `PlaceholderModule`
- `.planning/phases/01-schema-navigation-foundation/01-NAV-STATUS.md` - per-item active/planned classification audit trail (99 rows)

## Decisions Made

- **AI Agents / AI Workflows classified `planned`, not `active`** — both have a literal `page.tsx` and call `fetch()` indirectly through `useAgents`/`useWorkflows` → `@cerebro/sdk`, but the SDK client is instantiated against a hardcoded `http://localhost:3000` with the source comment `// Mocked URL for now`. No service in this repo listens on port 3000 (Studio itself runs on 3401). This is a judgment call: unlike forge-api (verified operational on port 4005 this session, per D-02/D-03), there is no verified running backend for these two items, so they were held to the same `planned` standard as every other non-CerebroForge group.
- **Data / Analytics classified `planned`** — its `page.tsx` only performs a client-side `redirect()` into a Zustand-store-driven dashboard; no backend call anywhere in the chain.
- **forge/backend and forge/monitoring demoted from an existing `page.tsx` to `planned`** — both already render fabricated `StatCard`/alert data and (for `backend`) a `setTimeout`-backed fake action button, matching D-15's definition of "not a blank stub, but still dishonest." Actual removal of the fabricated content is FORGE-02 scope (owned by a later plan per this plan's `<files_modified>` boundary) — this plan only sets the registry status truthfully.
- **All 7 HiveOps items classified `planned`** — matches D-05's explicit naming of HiveOps as a placeholder group this phase; confirmed each page renders hardcoded arrays with zero backend calls.
- **Assumption A1 (root catch-all covers nested unmatched paths under a literal parent, e.g. `/app/ai/models` under the `ai/` folder which only has a top-level `page.tsx`) holds** — confirmed via the production build output, which lists `ƒ /app/[...segments]` as a dynamic (server-rendered on demand) route with no build errors, and via Next.js App Router's documented routing precedence (literal segment match > catch-all fallback, evaluated per unmatched path regardless of a sibling literal page existing higher in the tree). No per-prefix catch-all was needed; no deviation from the single root catch-all design.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Sidebar.tsx's stale `pinnedFavorites` href**
- **Found during:** Task 2 (running the audit script against acceptance criteria)
- **Issue:** `Sidebar.tsx`'s `pinnedFavorites` array hardcoded `{ title: "Workflows", href: "/app/automation/workflows" }`, which does not exist in the registry (the actual route is `/app/automation/builder`, titled "Workflow Builder"). This is exactly the D-14/Pitfall-3 broken link the phase targets. The plan's Task 2 `<files>` list did not include `Sidebar.tsx`, but the Task 2 acceptance criteria explicitly requires the `PINNED_ORPHAN` audit assertion to report zero failures, which is only possible by fixing this href (01-PATTERNS.md independently identifies this exact one-line fix under "Bug fix (D-14, Pitfall 3)").
- **Fix:** Changed the href from `/app/automation/workflows` to `/app/automation/builder`.
- **Files modified:** `apps/studio/app/(platform)/app/components/Sidebar.tsx`
- **Verification:** `node scripts/audit-nav-routes.mjs` — `PINNED_ORPHAN` assertion passes.
- **Committed in:** `1da9ccf` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix, Rule 1)
**Impact on plan:** Necessary for the plan's own explicit acceptance criteria (`PINNED_ORPHAN` must pass). Single-line, no scope creep — the D-13 hand-pick restructure of `Sidebar.tsx` (a much larger change) was correctly left untouched for plan 01-04, which is why `SIDEBAR_HANDPICK` still fails as expected.

## Issues Encountered

- A background `next build` process from an earlier verification run was still finalizing when a second build was started concurrently, causing a transient `EBUSY` file-copy error during the `.next/standalone` output stage. Not a code defect — resolved by removing the stale `.next/lock` file and re-running a single clean build, which completed successfully (exit 0) and confirmed the `/app/[...segments]` route in its output.

## Known Stubs

None. `PlaceholderModule` is an intentional, registry-driven "not yet available" state — not a stub — and every `planned` classification is documented with a reason in `01-NAV-STATUS.md`. No hardcoded empty arrays/placeholder text were introduced by this plan's own new files.

## Threat Flags

None. `[...segments]/page.tsx`'s unregistered-path fallback renders only the requested path string through React's default JSX text escaping (no `dangerouslySetInnerHTML`), matching threat T-01-01's mitigation exactly as specified in the plan's threat model — no new surface beyond what was already scoped.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `PlaceholderModule` and `navigation/lookup.ts` are ready for consumption by plan 01-04 (breadcrumbs, `Sidebar.tsx` D-13 restructure to fix `SIDEBAR_HANDPICK`) and plans 01-05/01-06 (FORGE-02 fake-data removal on the 10 unbacked CerebroForge pages, replacing their bodies with `PlaceholderModule`).
- `SIDEBAR_HANDPICK` remains the one intentionally-failing audit assertion — explicitly owned by plan 01-04 per this plan's own acceptance criteria, not a regression.
- `01-NAV-STATUS.md` gives plan 01-05/01-06 a ready-made list of which CerebroForge pages need fabricated-content removal (`forge/backend`, `forge/monitoring`, plus the 8 other unbacked items that were never fake to begin with).
- No blockers identified for downstream Phase 1 plans.

---
*Phase: 01-schema-navigation-foundation*
*Completed: 2026-08-10*
