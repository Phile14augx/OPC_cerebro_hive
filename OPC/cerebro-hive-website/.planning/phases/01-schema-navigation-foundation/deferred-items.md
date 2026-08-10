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
