# Deferred Items — Phase 01 (Schema & Navigation Foundation)

Items discovered during plan execution that are out of scope per the Scope
Boundary rule (pre-existing, unrelated to the executing plan's files) — not
fixed, logged here for a future cleanup plan.

## Logged during 01-04

### Pre-existing `@cerebro/studio` typecheck/build baseline failures (unrelated to Sidebar/Topbar/Breadcrumbs)

`pnpm --filter @cerebro/studio typecheck` and `pnpm --filter @cerebro/studio build`
both fail on files never touched by plan 01-04 (or any Phase 1 plan to date).
Confirmed pre-existing via `git log` — none of the offending files have been
modified since the initial monorepo-scaffold commits, well before this
milestone began:

- `app/case-studies/corporate-ai-training/page.tsx:43` — `TS7006` implicit `any` on an inline `onMouseEnter` handler parameter
- `app/case-studies/logistics-support-automation/page.tsx:43` — same pattern
- `app/case-studies/sales-pipeline-automation/page.tsx:43` — same pattern
- `app/layout.tsx:45` — `TS2322`, `ThemeProviderProps` missing `children` in its type (third-party `next-themes` typing mismatch)
- `components/home/ServicesOverview.tsx:177` — `TS7006` implicit `any`, same inline-handler pattern
- `components/home/v2/Scene.tsx:39` — `TS2578`, unused `@ts-expect-error` directive
- `components/providers/ThemeProvider.tsx:19` — `TS2339`, same `next-themes` `children` typing mismatch as `layout.tsx`

`next build`'s stricter production TypeScript pass fails on the first of
these (`case-studies/corporate-ai-training/page.tsx:43`), which blocks a
clean `pnpm --filter @cerebro/studio build` exit code for any plan in this
phase until a dedicated cleanup plan fixes the marketing/`case-studies`
routes and the `next-themes` provider typing. None of these files are in
plan 01-04's `files_modified` list (`Sidebar.tsx`, `Topbar.tsx`,
`Breadcrumbs.tsx`) and none reference navigation, breadcrumbs, or the
registry — out of scope per the Scope Boundary rule.

**Verification performed instead:** `node scripts/audit-nav-routes.mjs`
(the plan's primary functional gate) passes all 6 assertions. A scoped
`tsc --noEmit` pass restricted to the touched files reports zero errors —
none of the 7 failures above reference `Sidebar.tsx`, `Topbar.tsx`, or
`Breadcrumbs.tsx`.

## Logged during 01-05

### Same pre-existing `@cerebro/studio` typecheck/build baseline failures (unrelated to the 10 CerebroForge pages)

`pnpm --filter @cerebro/studio typecheck` and `pnpm --filter @cerebro/studio build`
fail on the identical 7 pre-existing files listed above (`case-studies/*`,
`layout.tsx`, `ServicesOverview.tsx`, `Scene.tsx`, `ThemeProvider.tsx`) — none
of which were touched by this plan. `next build`'s Turbopack compile step
reports `✓ Compiled successfully`, confirming all 10 rewritten
`forge/<tool>/page.tsx` files compile cleanly; only the pre-existing
production-typecheck failure in `case-studies/corporate-ai-training/page.tsx`
blocks a green `build` exit code, unchanged from 01-04's finding.

### `pnpm --filter @cerebro/studio lint` fails to start (broken `@typescript-eslint` install, pre-existing, unrelated to code)

`eslint` crashes at startup with `Cannot find module './parser-options'` while
loading `@typescript-eslint/types` — a corrupted/incomplete `node_modules`
artifact (`parser-options.d.ts` exists but `parser-options.js` does not) in
the shared pnpm store, not something any Phase 1 plan's file changes could
cause. Excluded from Rule 3 auto-fix per the package-manager-install
exclusion (reinstalling/patching `node_modules` is out of scope for an
executor). Verified instead via the plan's own grep gates (`PlaceholderModule`
present, zero `StatCard`/`setTimeout` occurrences across all 10 files) and a
manual visual scan of each of the 10 rewritten files for unused imports —
each file imports only `PlaceholderModule` and nothing else, so no
unused-import lint error is possible regardless of this tooling breakage.
