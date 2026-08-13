---
phase: 01-schema-navigation-foundation
plan: 04
subsystem: navigation
tags: [nextjs, app-router, sidebar, breadcrumbs, navigation-registry]

# Dependency graph
requires: ["01-01"]
provides:
  - "Sidebar.tsx renders all 14 platformNavigation groups generically (SIDEBAR_HANDPICK audit assertion green)"
  - "Studio-local Breadcrumbs.tsx component (components/ui/Breadcrumbs.tsx)"
  - "Topbar.tsx breadcrumb strip + document.title, both sourced from one findNavTrailByPath(pathname) call (D-08)"
affects: ["01-07"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Sidebar section derivation: platformNavigation.filter(...).map(...) with a small display-label override map, instead of per-group .find(g => g.title === ...) hand-picking"
    - "Breadcrumbs.tsx: authenticated-internal-app breadcrumb variant with no structured-data emission, distinct from the public-site discovery/Breadcrumbs.tsx (JsonLd) variant — only the { label, href? }[] prop shape is shared"

key-files:
  created:
    - "apps/studio/app/(platform)/app/components/ui/Breadcrumbs.tsx"
  modified:
    - "apps/studio/app/(platform)/app/components/Sidebar.tsx"
    - "apps/studio/app/(platform)/app/components/Topbar.tsx"

key-decisions:
  - "Sidebar's automation/AI item lookups for pinnedFavorites switched from platformNavigation.find(g => g.title === ...) to direct named imports (aiNavigation, automationNavigation) — the literal .find(g => g.title === pattern is exactly what the SIDEBAR_HANDPICK audit assertion flags, so it had to be eliminated everywhere in the file, not just in the sections array"
  - "Topbar's /app/security link (UserMenu) left unchanged — findNavEntryByPath's group-href fallback pass (built in plan 01-01) already resolves securityNavigation's group-level href, confirmed by reading lookup.ts's findByGroupHref"
  - "Topbar's /app/support link (NotificationsMenu) retargeted to /app/support/help — plan's acceptance criteria explicitly required zero bare /app/support occurrences regardless of group-href fallback resolution, since supportNavigation's group href still has no literal page.tsx of its own"
  - "Breadcrumbs.tsx returns null when items is empty, and Topbar wraps the divider+breadcrumb block in the same trail.length > 0 check, so pages with no registry match (there should be none, per plan 01-01) show no partial/empty chrome strip"

requirements-completed: [NAV-01]

# Metrics
duration: 45min
completed: 2026-08-10
---

# Phase 1 Plan 4: Breadcrumbs & Sidebar Reachability Summary

**All 14 `platformNavigation` groups now render from one generic loop in `Sidebar.tsx` (34 previously-invisible items surfaced), plus a registry-derived breadcrumb strip and page title wired through a single `findNavTrailByPath` call in `Topbar.tsx`.**

## Performance

- **Duration:** ~45 min
- **Tasks:** 2
- **Files modified:** 3 (1 new, 2 modified)

## Accomplishments

- Deleted `Sidebar.tsx`'s hand-picked `sections` array (6 groups via `platformNavigation.find(g => g.title === ...)`) and replaced it with `platformNavigation.filter(g => g.title !== "CerebroForge").map(...)`, so all 13 non-Forge groups (HiveOps, Automation, Research, Academy, Business and Support included) render through one loop — CerebroForge keeps its own dedicated amber collapsible block, unchanged, so its 19 items are not double-rendered.
- Preserved the three pre-existing ad-hoc header labels (`AI` → `AI Platform`, `Solutions` → `Explore`) via a `SECTION_LABEL_OVERRIDES` map rather than reintroducing hand-picking. The former `Data & Security` merge is gone by design — `Data` and `Security` now render as two separate sections, since merging required a hand-pick.
- Eliminated every occurrence of the literal `platformNavigation.find(g => g.title === ...)` expression in `Sidebar.tsx` (it existed in `pinnedFavorites`'s icon lookups too, not just the old `sections` array) — replaced with direct named imports (`aiNavigation`, `automationNavigation`) from the registry module.
- Renamed the `pinnedFavorites` "Workflows" entry to "Workflow Builder" (matching its `/app/automation/builder` destination's real title) and pointed its icon lookup at that item's own icon instead of `automationNavigation.items[0]` (the Overview icon).
- Built `components/ui/Breadcrumbs.tsx` — a new, Studio-local breadcrumb component using only platform design tokens (`text-text-secondary`, `text-text-primary`, `font-[var(--font-weight-heading)]`) and a `lucide-react` `ChevronRight` separator. It intentionally does not reuse `apps/studio/components/discovery/Breadcrumbs.tsx` (which emits `JsonLd`/`BreadcrumbList` structured data for the public marketing site) — only that component's `{ label, href? }[]` prop shape is shared. Returns `null` when `items` is empty.
- Wired `Breadcrumbs` into `Topbar.tsx`'s left header section (after the mobile toggle and `WorkspaceMenu`, hidden below the `md` breakpoint) and added a `useEffect` that sets `document.title` to `{item title} · CerebroHive Studio` — both consumers share the exact same `findNavTrailByPath(pathname)` call result (D-08's "one lookup, two consumers").
- Repaired `Topbar.tsx`'s hardcoded `/app/support` link (`NotificationsMenu`'s "View all notifications →") to `/app/support/help`, since `supportNavigation`'s group-level href has no matching item of its own.

## Task Commits

1. **Task 1: Render all 14 navigation groups and repair the sidebar's stale links (D-13, D-14)** - `66717dd` (feat)
2. **Task 2: Add registry-derived breadcrumbs and page titles (D-08)** - `642e8dc` (feat)

## Files Created/Modified

- `apps/studio/app/(platform)/app/components/Sidebar.tsx` - generic `platformNavigation` loop replaces the 6-group hand-pick; `pinnedFavorites` icon lookups switched to direct group imports; "Workflows" pinned entry renamed to "Workflow Builder"
- `apps/studio/app/(platform)/app/components/ui/Breadcrumbs.tsx` - new component, exports `Breadcrumbs`
- `apps/studio/app/(platform)/app/components/Topbar.tsx` - `usePathname` + `findNavTrailByPath` wired to both the breadcrumb render and a `document.title` effect; `/app/support` link retargeted to `/app/support/help`

## Decisions Made

- **`findNavEntryByPath` group-href resolution confirmed for `/app/security`, left unchanged.** Read `navigation/lookup.ts` (built in plan 01-01): `findByGroupHref` performs a second-pass match against each group's own `href` field when no item href matches. `securityNavigation.href === "/app/security"`, so `findNavEntryByPath("/app/security")` already resolves to a valid (synthetic) entry. The plan's Task 2 instructions said to retarget this link to `/app/trust/security` only *if* the fallback did not exist — it does, so `Topbar.tsx`'s `/app/security` link (`UserMenu` → "Security") was left as-is.
- **`/app/support` retargeted regardless of the same fallback existing.** `supportNavigation.href === "/app/support"` also resolves via the same `findByGroupHref` fallback, but the plan's Task 2 acceptance criteria explicitly required zero bare `/app/support` occurrences in `Topbar.tsx` — the fallback makes the path *resolvable* (no 404, catch-all renders it) but there is still no literal `page.tsx` backing `/app/support` itself, unlike `/app/support/help`. Retargeted per the plan's explicit instruction.
- **Direct named-import replacement, not just for the `sections` array.** The acceptance criteria required zero occurrences of `platformNavigation.find(g => g.title ===` anywhere in the file, not just in the code being restructured. `pinnedFavorites`'s icon lookups used the same pattern for `AI` and `Automation` groups — switched both to `aiNavigation`/`automationNavigation` named imports already exported by `navigation/index.ts`, rather than leaving a second hand-pick pattern in place.

## Deviations from Plan

### Auto-fixed Issues

None beyond what the plan's own Task 1 action already specified (the `pinnedFavorites` icon-lookup fix was implied by "zero occurrences of `platformNavigation.find(g => g.title ===`" in the acceptance criteria, and is a direct, same-scope extension of the task's own described refactor — not a separate bug).

### Deferred (out of scope, logged not fixed)

**1. [Scope Boundary] Pre-existing `@cerebro/studio` typecheck/build failures unrelated to this plan's files**
- **Found during:** Task 2 verification (`pnpm --filter @cerebro/studio typecheck` / `build`)
- **Issue:** 7 TypeScript errors across `app/case-studies/*/page.tsx` (×3, implicit-`any` inline handler params), `app/layout.tsx` + `components/providers/ThemeProvider.tsx` (`next-themes` `ThemeProviderProps` missing `children` in its type), and `components/home/v2/Scene.tsx` (unused `@ts-expect-error`). `next build`'s stricter TypeScript pass fails on the first `case-studies` error, blocking a clean build exit code.
- **Confirmed pre-existing:** `git log` shows none of these files have been touched since the initial monorepo-scaffold commits — well before Phase 1 began. None reference navigation, the registry, `Sidebar.tsx`, `Topbar.tsx`, or `Breadcrumbs.tsx`.
- **Action taken:** Not fixed (Scope Boundary rule — pre-existing failures in unrelated files are out of scope). Logged to `.planning/phases/01-schema-navigation-foundation/deferred-items.md` for a future cleanup plan.
- **Verification substituted:** `node scripts/audit-nav-routes.mjs` (this plan's primary functional gate) passes all 6 assertions, 0 failures. The `typecheck`/`build` error lists contain zero references to any of this plan's 3 touched files.

---

**Total deviations:** 1 deferred (pre-existing, out of scope), 0 auto-fixed bugs beyond the plan's own described scope.
**Impact on plan:** None on this plan's own deliverables — `SIDEBAR_HANDPICK`, `PINNED_ORPHAN`, and all other audit assertions pass; the sidebar and breadcrumb/title functionality is complete and correct. The `typecheck`/`build` verification steps could not be marked fully green due to an unrelated, pre-existing repo-wide baseline issue outside this plan's file scope.

## Issues Encountered

None beyond the deferred pre-existing typecheck/build baseline documented above.

## Known Stubs

None. `Breadcrumbs.tsx` is a real, functioning component wired to live registry data (`findNavTrailByPath`), not a stub.

## Threat Flags

None. `document.title` is set only from the registry entry's static `item.title` string (never interpolating the raw `pathname`), and breadcrumb labels render through React text interpolation only (no `dangerouslySetInnerHTML`) — both match the plan's `<threat_model>` mitigations for T-01-11 and T-01-12 exactly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 14 `platformNavigation` groups (99 items) are now reachable from the sidebar; `SIDEBAR_HANDPICK` and `PINNED_ORPHAN` audit assertions are green for the first time this phase.
- Breadcrumbs and page titles are live in `Topbar.tsx`, ready for plan 01-07's manual click-through checkpoint.
- `deferred-items.md` gives a future cleanup plan a ready-made list of the pre-existing `case-studies`/`ThemeProvider`/`Scene.tsx` typecheck failures blocking a fully clean `@cerebro/studio` build — not a blocker for Phase 1's remaining plans (01-05/01-06/01-07), none of which depend on those files.
- No blockers identified for downstream Phase 1 plans.

## Self-Check: PASSED

All 3 files confirmed present/modified on disk (Sidebar.tsx, Topbar.tsx, Breadcrumbs.tsx). Both commit hashes (66717dd, 642e8dc) confirmed present in git log.

---
*Phase: 01-schema-navigation-foundation*
*Completed: 2026-08-10*
