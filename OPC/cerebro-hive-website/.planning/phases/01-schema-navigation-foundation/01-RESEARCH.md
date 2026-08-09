# Phase 1: Schema & Navigation Foundation - Research

**Researched:** 2026-08-10
**Domain:** Next.js App Router navigation architecture, NestJS service integration, Prisma schema design
**Confidence:** HIGH (all findings verified by direct repo inspection; routing behavior cross-verified with official Next.js docs)

## Summary

This phase's real complexity is not "build a placeholder component" — it's reconciling four different truths that CONTEXT.md's framing doesn't fully capture, discovered by cross-referencing the 99-item navigation registry against the actual filesystem:

1. **62 of the registry's 101 unique href paths have no `page.tsx` at all today** — these are genuine Next.js 404s, not soft/mock pages. Only 39 unique paths currently resolve. The 8 "unscoped" groups from CONTEXT.md D-05 (HiveOps, Infrastructure, Data, Automation, Research, Academy, Business, Support) are NOT uniformly missing — HiveOps has full mock-UI pages for all 7 items; Infrastructure/Data/Automation/Research/Academy/Business/Support have **zero** page files (100% 404 today).
2. **The Sidebar component itself never renders 6 of the 14 registry groups.** `Sidebar.tsx` hardcodes a `sections` array that only surfaces Workspace, AI, Infrastructure, Data+Security, Talent OS, and Solutions. HiveOps, Automation, Research, Academy, Business, and Support (34 nav items) are exported from the registry but **never imported into the Sidebar** — a user cannot reach them via the sidebar at all today, regardless of whether their pages exist. Fixing `implementationStatus` alone will not make these visible; `Sidebar.tsx` must be restructured to render all groups.
3. **FORGE-01 is already ~90% done, not a from-scratch build.** `apps/studio/lib/forge/api-client.ts` (`forgeApi`) and `apps/studio/lib/forge/hooks.ts` already exist and are already wired into 8 of the 9 D-03 pages (planner, requirements, architect, testing, review, deploy, docs, codegen) with real `fetch()` calls to `forge-api` via `NEXT_PUBLIC_FORGE_API_URL` (already set in `.env.local`). This is a third, simpler calling convention than the two CONTEXT.md flagged (client-side typed fetch wrapper, not a Server Action, not direct Prisma). Phase 1's FORGE-01 work is mostly verification/gap-closing, not new wiring.
4. **FORGE-02's 10 "unbacked" pages are not blank stubs — several are fully-built fake UIs** that must be torn out. `forge/backend/page.tsx` (and siblings) render hardcoded `StatCard` values, fake "Generated Modules" lists, and a "Generate Backend" button wired to a `setTimeout` instead of any API call. These must be replaced with the honest placeholder, which is real removal work, not just an addition.

**Primary recommendation:** Build one shared `PlaceholderModule` component + one catch-all route (`app/(platform)/app/[...segments]/page.tsx`) that looks up the requested path in the navigation registry and renders either that placeholder or (for `active` items) is never reached because a real static route already wins. Extend `NavItem` with `implementationStatus` in-place (no parallel registry). Restructure `Sidebar.tsx` to iterate all 14 `platformNavigation` groups generically instead of the current hand-picked `sections` array. Reuse the existing `forgeApi`/`useForge*` client pattern for the 9 real CerebroForge pages — do not introduce a new Server Action or typed-client-class pattern (that parity work is explicitly deferred, DEFR-09).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Navigation registry (`NavItem`/`NavGroup` + `implementationStatus`) | Frontend Server (SSR) — shared module | Browser (Sidebar client component reads it) | Single source of truth imported by both server (route resolution) and client (Sidebar/Topbar) components |
| Placeholder route rendering | Browser / Client (Next.js App Router page) | — | `"use client"` catch-all page reading `usePathname()`, matching existing codebase convention (all `/app/**` pages are client components) |
| Breadcrumbs / page titles | Browser / Client | Frontend Server (Next.js `generateMetadata` optional) | Existing Topbar/pages are all client components; deriving titles from registry can stay client-side for consistency, though `layout.tsx`'s `metadata` export is server-side and could also pull from the registry for `<title>` |
| CerebroForge (9 functional items) — API calls | Browser / Client → API / Backend | — | Existing `forgeApi` client fetches directly from the browser to `forge-api` (NestJS), no Next.js server intermediary — matches the already-built pattern |
| CerebroForge — business logic | API / Backend (`services/forge-api`) | — | NestJS controllers/services own plan/requirements/architecture generation; Studio only renders |
| Policy schema extension | Database / Storage (`packages/db/prisma/schema.prisma`) | — | Schema-only change this phase; no CRUD UI (that's Phase 5) |
| BullMQ version reconciliation | API / Backend (`services/archive-api`, `services/archive-worker`) | — | Dependency manifest change; `archive-worker` has no source code yet, so no runtime behavior to reconcile |

## User Constraints (from CONTEXT.md)

<user_constraints>

### Locked Decisions

- **D-01:** All 99 registered navigation destinations must resolve — zero 404s, phase-wide, not just within the 5 originally-scoped groups.
- **D-02:** CerebroForge (19 items) gets real, functional implementation in this phase, not a placeholder — its backend (`services/forge-api`) is already operational (DB connection, full Prisma migration, `/health` and `/forge/projects` confirmed live).
- **D-03:** Exactly 9 of the 19 CerebroForge nav items have a real backend controller today (Forge Overview, AI Planner, Requirements Studio, Architecture Studio, Code Generation, Testing Intelligence, AI Code Review, Deployment Studio, AI Documentation). The remaining 10 get the same honest-placeholder treatment as D-05 — do not build new forge-api backend surface for these in this phase.
- **D-04:** Do not over-polish CerebroForge's 9 functional items to final-product quality. Goal: correct routing, correct API connection, usable (not decorative) states. Deep UX polish belongs to a future CerebroForge-specific phase.
- **D-05:** The remaining 8 previously-unscoped groups — HiveOps (7), Infrastructure (9), Data (7), Automation (6), Research (5), Academy (5), Business (6), Support (5) = 50 items — all get a standardized, registry-driven honest placeholder this phase. No functionality build for any of them.
- **D-06:** Placeholders are NOT one-off hardcoded pages. The navigation registry gains an `implementationStatus` field (e.g. `active | planned | disabled`) per item. A single shared route/component renders either the real module or a standardized placeholder driven by that same registry entry.
- **D-07:** The standardized placeholder page states the module name, the specific feature name, and its status (e.g. "Automation / Workflows — This module is part of the CerebroHive platform but is not enabled in this release. Status: Planned"). Never a bare blank screen, never fake data.
- **D-08:** Breadcrumbs and page titles should derive from the same navigation registry entry used for routing/status — one source of truth for nav, breadcrumbs, page titles (only breadcrumbs/titles are in this phase's scope; search/command-palette/telemetry integration is deferred).
- **D-09:** Route identifiers in the registry should be stable — later phases (2-8) will build real functionality behind today's `planned` routes without renaming the navigation tree.
- **D-10:** `Policy` model is a bare 3-field stub (`id`, `name`, `rules Json`) — no tenant/org scoping, no audit fields. Needs schema extension before Phase 5 (Governance) can build real CRUD against it. Confirming/closing this gap is this phase's job; building the extended Governance UI is Phase 5's.
- **D-11:** Talent OS (`Candidate`/`Assessment`/`HiringPipeline`/`Question`) and Explore (`Template`/`MarketplaceItem`/`IndustryPack`) have zero backing models — confirmed via direct grep. This phase's job is confirming/documenting the gap; actual schema design happens in Phase 6 (Talent OS)/Phase 7 (Explore).
- **D-12:** `services/archive-api` pins `bullmq@^6`, `services/archive-worker` pins `bullmq@^5`. Reconcile to a single major version (v6) before Phase 4 (Knowledge Hub) starts producer/consumer wiring. Mechanical, Claude's discretion.

### Claude's Discretion

- Exact shape/naming of the `implementationStatus` field and its allowed values (`active | planned | disabled` given as an example, not literal).
- Whether the shared placeholder route is a catch-all (`[...segments]`) or another mechanism — CONTEXT.md does not mandate the implementation, only the outcome (one canonical schema, not per-page special-casing).
- BullMQ reconciliation direction and exact target version (v6, "the more current major").

### Deferred Ideas (OUT OF SCOPE)

- CerebroForge's remaining 10 unbacked nav items — real backend + functionality is a future CerebroForge-dedicated phase.
- Deep polish (streaming responses, advanced editing, analytics) for the 9 functional CerebroForge pages.
- Full functionality for the 8 newly-discovered placeholder groups (HiveOps, Infrastructure, Data, Automation, Research, Academy, Business, Support) — none have a milestone phase yet.
- Registry-driven search/command-palette/telemetry integration — future payoff, not this phase's scope.
- **DEFR-09** (from REQUIREMENTS.md v2): Typed API client for `forge-api` (parity with `platform-api`'s `EngineeringReviewClient`) — the existing `lib/forge/api-client.ts` plain-object client is sufficient for this phase; do not build a class-based typed client.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SCHM-01 | Governance/Talent OS/Explore Prisma schema gaps confirmed and closed before their phases are sized | See "Prisma Schema Extension Patterns" — `Policy` needs `organizationId` + audit fields following the `Organization`/`OrgMembership` pattern, not the `Workspace`/`Tenant` pattern (GOVN-01 says "scoped per organization"); Talent OS/Explore absence re-confirmed by direct grep, zero models found |
| SCHM-02 | archive-worker/archive-api BullMQ version reconciled to a single version | See "BullMQ Version Reconciliation" — confirmed `^6.0.8` (archive-api) vs `^5.0.0` (archive-worker); archive-worker has **no source files at all** yet, so this is a pure `package.json` edit, no runtime code to migrate |
| NAV-01 | Every sidebar destination resolves to a real page — zero 404s | See "Route Existence Audit" — exact list of 62 currently-404 paths; see "Sidebar Rendering Gap" — 6 groups never render regardless of route existence |
| NAV-02 | Every destination without a backing feature shows an honest placeholder via `implementationStatus` | See "Placeholder Architecture" — catch-all route pattern, registry field extension, existing design-system components to reuse |
| FORGE-01 | 9 CerebroForge items with existing controllers wired to real functionality | See "CerebroForge Calling Convention" — already implemented for 8/9 pages via `forgeApi`/`useForge*`; gap-closing, not net-new build |
| FORGE-02 | 10 CerebroForge items without controllers show the same honest placeholder | See "FORGE-02: Existing Fake UI Must Be Removed" — some pages already render fully-fabricated stats/data that must be torn out, not left in place |

</phase_requirements>

## Standard Stack

No new external packages are required for this phase. All work uses libraries already in the codebase.

### Core (existing, reused)
| Library | Version (verified in repo) | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.10 | App Router routing (catch-all segments for placeholder pattern) | Already the project's framework |
| react | 19.2.4 | Component model | Already the project's framework |
| lucide-react | (already a dependency) | Icons for nav registry and placeholder page | Already used throughout `navigation/index.ts` and all `/app/**` pages |
| bullmq | reconcile to `^6.0.9` (latest v6 as of research date) | Job queue (archive-api producer, future archive-worker consumer) | Matches archive-api's already-adopted major version; v6.0.0 released 2026-07-30 per official BullMQ changelog |

### Package Legitimacy Audit

No new packages are installed this phase — SCHM-02 only bumps an existing dependency's version range (`bullmq` `^5.0.0` → `^6.x` in `services/archive-worker/package.json`). `bullmq` is already present and trusted elsewhere in the monorepo (`services/archive-api`, `apps/studio`, `apps/studio/platform`), so no slopcheck/registry-legitimacy gate applies.

**Packages removed due to slopcheck [SLOP] verdict:** none (no new packages)
**Packages flagged as suspicious [SUS]:** none (no new packages)

## Architecture Patterns

### System Architecture Diagram

```
Browser
  │
  ├─ GET /app/automation/builder  (no static route exists)
  │     │
  │     ▼
  │  Next.js App Router route resolution
  │  (static routes win first; none match this path)
  │     │
  │     ▼
  │  app/(platform)/app/[...segments]/page.tsx  (catch-all, "use client")
  │     │
  │     ├─ join(segments) → "/app/automation/builder"
  │     ├─ look up path in platformNavigation registry
  │     ├─ found, implementationStatus = "planned"
  │     ▼
  │  <PlaceholderModule group="Automation" title="Workflow Builder" status="planned" />
  │     (shared component — same one used by every "planned"/"disabled" route)
  │
  ├─ GET /app/forge/planner?projectId=xyz  (static route exists: forge/planner/page.tsx)
  │     │
  │     ▼
  │  Static route wins — catch-all never invoked
  │     │
  │     ▼
  │  AIPlannerPage ("use client")
  │     ├─ useForgeProject(projectId) ──► GET  {NEXT_PUBLIC_FORGE_API_URL}/forge/projects/:id
  │     └─ useForgeActions(projectId).runPlanner(prompt)
  │              └─► POST {NEXT_PUBLIC_FORGE_API_URL}/forge/projects/:id/plan
  │                    │
  │                    ▼
  │            services/forge-api (NestJS, port 4005)
  │              PlannerController → PlannerService → (AI generation) → Prisma → Postgres
  │
  └─ Sidebar.tsx / Topbar.tsx (rendered in every /app/** layout)
        reads platformNavigation to build nav links + (new) breadcrumbs/title from
        the same registry entry matched by usePathname()
```

### Recommended Project Structure

```
apps/studio/app/(platform)/app/
├── navigation/
│   └── index.ts                  # extend NavItem with implementationStatus (in place)
├── [...segments]/
│   └── page.tsx                  # NEW — catch-all placeholder route ("use client")
├── components/
│   ├── Sidebar.tsx                # MODIFY — iterate all platformNavigation groups generically
│   ├── Topbar.tsx                 # MODIFY — add breadcrumb strip sourced from registry
│   └── ui/
│       └── PlaceholderModule.tsx  # NEW — shared "not yet available" component (Card/Badge based)
├── forge/
│   ├── backend/page.tsx           # REPLACE fake StatCard/mock content with <PlaceholderModule />
│   ├── database/page.tsx          # REPLACE (same)
│   ├── api/page.tsx               # REPLACE (same)
│   ├── mobile/page.tsx            # REPLACE (same)
│   ├── web/page.tsx               # REPLACE (same)
│   ├── desktop/page.tsx           # REPLACE (same)
│   ├── bots/page.tsx              # REPLACE (same)
│   ├── repos/page.tsx             # REPLACE (same)
│   ├── ui-studio/page.tsx         # REPLACE (same)
│   ├── monitoring/page.tsx        # REPLACE (same)
│   └── (planner/requirements/architect/codegen/testing/review/deploy/docs — verify, gap-close only)
```

### Pattern 1: Registry-Driven Catch-All Placeholder

**What:** A single `app/(platform)/app/[...segments]/page.tsx` catch-all route that joins the URL segments, looks the path up in `platformNavigation`, and renders `PlaceholderModule` with that item's `title`/group/`implementationStatus`.

**When to use:** For every registry path that has no dedicated `page.tsx` today (62 currently, see audit below), and for the 10 FORGE-02 items whose existing `page.tsx` must be replaced with the same shared component (those keep their file but delete the fake content — a static route with real fake content still wins over the catch-all, so those files must be edited directly, not deleted).

**Why this works (routing precedence):** Next.js App Router resolves the full path against the precomputed route table; static (literal) segments are matched first, dynamic segments next, catch-all last — confirmed by the official Next.js dynamic-routes documentation's catch-all section and cross-verified against community routing-precedence discussions. A `[...segments]` folder sibling to `forge/`, `hiveops/`, `ai/`, etc. inside `app/(platform)/app/` will catch any path under `/app/*` that has no literal file match, **including nested paths under a partially-existing static folder** (e.g. `/app/ai/studio` falls through to the catch-all even though `/app/ai/page.tsx` exists, because there is no literal match for the full 2-segment path). [CITED: nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes]

**Example:**
```typescript
// app/(platform)/app/[...segments]/page.tsx
"use client";
import { useParams } from "next/navigation";
import { platformNavigation, forgeNavigation } from "../navigation";
import { PlaceholderModule } from "../components/ui/PlaceholderModule";
import { notFound } from "next/navigation";

const ALL_GROUPS = [...platformNavigation, forgeNavigation]; // forgeNavigation isn't in platformNavigation's array export today — include explicitly or add it there

export default function CatchAllPage() {
  const params = useParams<{ segments: string[] }>();
  const path = "/app/" + (params.segments ?? []).join("/");

  for (const group of ALL_GROUPS) {
    const item = group.items.find((i) => i.href === path);
    if (item) {
      return (
        <PlaceholderModule
          group={group.title}
          title={item.title}
          status={item.implementationStatus ?? "planned"}
        />
      );
    }
  }
  // Path isn't in the registry at all (e.g. a stale hardcoded link) — true 404
  notFound();
}
```
*Note: `forgeNavigation` is exported standalone and imported separately by `Sidebar.tsx`; it is NOT one of the 14 entries in the `platformNavigation` array despite being rendered. Any registry-iteration logic (catch-all lookup, Sidebar loop, breadcrumb lookup) must account for this or the forge items will silently be excluded.*

### Pattern 2: Shared Placeholder Component (reuse existing design system)

**What:** `PlaceholderModule` built from the existing `Card`, `Badge` components (`apps/studio/app/(platform)/app/components/ui/`), using the project's design tokens (`text-text-primary`, `text-text-secondary`, `text-text-muted`, `bg-surface`, `border-border` — **not** shadcn's `text-foreground`/`text-muted-foreground`, which is a different token set used only in the marketing site's `components/discovery/` tree).

**Example:**
```tsx
// apps/studio/app/(platform)/app/components/ui/PlaceholderModule.tsx
import { Construction } from "lucide-react";
import { Card } from "./Card";
import { Badge } from "./Badge";

export function PlaceholderModule({
  group, title, status,
}: { group: string; title: string; status: "planned" | "disabled" }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md p-8 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-surface-elevated border border-border flex items-center justify-center">
          <Construction size={22} className="text-text-muted" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">{group} / {title}</p>
          <h1 className="text-lg font-space font-bold text-text-primary mt-1">Not yet available</h1>
        </div>
        <p className="text-sm text-text-secondary">
          This module is part of the CerebroHive platform but is not enabled in this release.
        </p>
        <Badge variant="secondary" className="text-xs">
          Status: {status === "planned" ? "Planned" : "Disabled"}
        </Badge>
      </Card>
    </div>
  );
}
```

### Pattern 3: CerebroForge Calling Convention (already established — extend, don't replace)

**What:** Plain-object client-side `fetch()` wrapper, not a Server Action, not a class-based typed client.

**Existing code (verified, already working):**
```typescript
// apps/studio/lib/forge/api-client.ts (excerpt — already exists)
const BASE = process.env.NEXT_PUBLIC_FORGE_API_URL ?? 'http://localhost:4005';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new Error(`forge-api ${res.status}: ${await res.text().catch(() => res.statusText)}`);
  return res.json() as Promise<T>;
}
```
Used from `"use client"` page components via `apps/studio/lib/forge/hooks.ts` (`useForgeProject`, `useForgeActions`, `useCodegen`). **This is a third calling convention distinct from the two CONTEXT.md flagged** (Server Action → dedicated backend service, per `app/actions/archive.ts`; direct Prisma in a service class). For consistency with the 8 already-built pages, extend this pattern for any remaining gap-closing work rather than introducing a Server Action wrapper around forge-api.

**Auth note (pitfall):** None of the 9 D-03 controllers use `@UseGuards` — `@ApiBearerAuth()` is Swagger-documentation-only annotation, not enforcement. `forgeApi`'s `request()` does not send an `Authorization` header at all. This differs from `archive.ts`'s Server Action pattern (which does attach a Bearer token from cookies). This is a real gap but matches D-04's "don't over-polish" — flagging for the plan-checker/verifier rather than treating as blocking, since forge-api has no auth enforcement to bypass yet either.

**Env var (already configured, verified in `.env.example` and `apps/studio/.env.local`):**
```
FORGE_API_PORT=4005
NEXT_PUBLIC_FORGE_API_URL=http://localhost:4005
```

### Pattern 4: Prisma Tenant-Scoping — two competing conventions exist, pick the one GOVN-01 implies

The schema has **two parallel tenant-root conventions**, not one:

1. `Tenant` → `Workspace` → `Agent`/`Workflow`/`Project` (uses `workspaceId String @db.Uuid` FK + `@@index([workspaceId])`)
2. `Organization` (id prefixed `org_...`) → `OrgMembership`/`Invitation`/`AIUsageRecord`/`Prompt` (uses `orgId String` FK)

**Recommendation:** REQUIREMENTS.md's GOVN-01 explicitly says Policies are "scoped per organization" — so `Policy` should follow convention #2 (`Organization`), not #1 (`Workspace`/`Tenant`). This is a genuine architectural fork that SCHM-01's planning must resolve explicitly, not something with an obvious single "established pattern" to copy (the phase description's framing that a clean precedent exists is only half-true).

**Also note:** The "recently-added" observability models the phase description suggested comparing against (`Metric`, `Alert`, `Incident`) are **themselves bare stubs with no tenant scoping at all** — they are not a good precedent to copy. The best precedent for "tenant-scoped model with audit fields" in this schema is `Agent`:
```prisma
// packages/db/prisma/schema.prisma (existing, verified — Agent model, adapt orgId not workspaceId)
model Agent {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  workspaceId String    @db.Uuid
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  name        String
  description String?
  isActive    Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([workspaceId])
}
```
For `Policy`, the equivalent extension (organization-scoped, per GOVN-01) would add `organizationId String`, a relation to `Organization`, `createdAt`/`updatedAt`, and `@@index([organizationId])` — matching `Organization`'s existing FK style (`orgId String` without `@db.Uuid`, since `Organization.id` is a prefixed string, not a raw UUID).

### Anti-Patterns to Avoid
- **Per-page hardcoded "coming soon" text:** One existing precedent already does this badly — `evaluations/[view]/page.tsx` renders a bare `{view} Module - Coming Soon` string with no Card/Badge/design-system treatment. Do not extend this pattern; it's exactly what D-06/D-07 supersede.
- **Copying `components/discovery/Breadcrumbs.tsx` as-is:** It's built for the public marketing site (emits SEO `JsonLd` schema, uses shadcn `text-foreground`/`text-muted-foreground` tokens). The Studio breadcrumb needs the same `{label, href}[]` prop shape but Studio's own design tokens and no JsonLd (internal authenticated app, not indexed).
- **Assuming `platformNavigation` is the complete group list:** `forgeNavigation` is exported and consumed separately by `Sidebar.tsx`, not included in the `platformNavigation` array. Any code that iterates "all groups" (catch-all lookup, breadcrumb resolution) must explicitly include it or add it to the array.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Per-route "not available" pages (62 of them) | 62 individual `page.tsx` files with copy-pasted placeholder JSX | One catch-all route + one shared `PlaceholderModule` component | D-06 explicitly requires this; also the sheer count (62) makes per-file maintenance a direct source of drift when Phase 2-8 flip statuses to `active` |
| Typed forge-api client class | A new `ForgeApiClient` class mirroring `EngineeringReviewClient` | Existing `lib/forge/api-client.ts` plain-object client | DEFR-09 explicitly defers "typed API client for forge-api" to v2 — building it now is scope creep beyond FORGE-01/02's wording ("correct routing, correct API connection... not final-product quality") |
| Breadcrumb SEO schema for internal app routes | Reusing `components/discovery/Breadcrumbs.tsx` wholesale (drags in `JsonLd`) | A lighter Studio-local breadcrumb component with the same prop shape, Studio design tokens, no JsonLd | Internal authenticated dashboard routes should not emit `BreadcrumbList` structured data intended for search engine indexing |

**Key insight:** The phase's actual hand-roll risk isn't "don't build a rich text editor" (typical for other phases) — it's "don't build 62 near-identical files that will all need to change in lockstep every time a later phase flips one `implementationStatus` from `planned` to `active`." The catch-all + registry-lookup design is the direct antidote.

## Runtime State Inventory

Not applicable — this phase does not rename, refactor, or migrate existing identifiers/strings. `implementationStatus` is a net-new field being added to an existing TypeScript object literal, not a rename of anything already stored, registered, or keyed elsewhere (confirmed: `NavItem`/`NavGroup` types are pure in-memory TS objects, not persisted to any datastore, and `apps/studio/lib/navigation/registry.ts` is a structurally separate, unrelated registry consumed only by an orphaned `StudioShell.tsx` — see Common Pitfalls).

## Common Pitfalls

### Pitfall 1: Two registries with the same purpose exist — editing the wrong one is a silent no-op

**What goes wrong:** `apps/studio/lib/navigation/registry.ts` (`NavigationRegistry` / `TrustNavigation` / `AnalyticsNavigation`, using `label` not `title`) is a **structurally different, second navigation registry**. It is consumed by `apps/studio/components/layout/StudioShell.tsx`, which is imported nowhere in the actually-routed `(platform)/app/**` tree (verified: only self-referencing import found; the real layout is `app/(platform)/app/layout.tsx` → `PlatformLayoutClient` → `Sidebar.tsx` + `Topbar.tsx`, which imports from `app/(platform)/app/navigation/index.ts`, not `lib/navigation/registry.ts`).
**Why it happens:** Both files are named similarly ("navigation"/"registry") and both model nav groups/items, inviting confusion about which is canonical.
**How to avoid:** Only edit `apps/studio/app/(platform)/app/navigation/index.ts`. Leave `lib/navigation/registry.ts` and `components/layout/StudioShell.tsx` untouched — they are dead code relative to this phase's routes (confirm this with a repo-wide import search before touching either, in case something changed since this research).
**Warning signs:** If a change to `implementationStatus` doesn't show up in the actual running Sidebar, check which file was edited.

### Pitfall 2: Sidebar.tsx's hardcoded `sections` array hides 6 groups regardless of route/placeholder status

**What goes wrong:** Even after every one of the 62 missing routes gets a placeholder page, users still cannot navigate to HiveOps, Automation, Research, Academy, Business, or Support via the sidebar, because `Sidebar.tsx`'s `sections` array (lines ~23-33) only looks up `"Workspace"`, `"AI"`, `"Infrastructure"`, `"Data"`+`"Security"`, `"Talent OS"`, `"Solutions"` by title string, and CerebroForge is rendered via a separate hand-built collapsible block. The other 6 groups' `.items` are simply never read.
**Why it happens:** The sidebar was built incrementally, adding groups by name as they were designed, rather than iterating `platformNavigation` generically.
**How to avoid:** Restructure `Sidebar.tsx` to `platformNavigation.map(group => ...)` (keeping Workspace's pinned-favorites treatment and CerebroForge's amber-themed collapsible special case if desired, but ensuring every group without special-casing still renders through the generic loop).
**Warning signs:** NAV-01 verification should include "click every group header in the rendered sidebar," not just "check every href resolves via direct URL" — the latter would pass with pages that are literally unreachable through normal navigation.

### Pitfall 3: `pinnedFavorites` in Sidebar.tsx hardcodes a link that doesn't exist in the registry

**What goes wrong:** `Sidebar.tsx`'s `pinnedFavorites` array includes `{ title: "Workflows", href: "/app/automation/workflows", ... }`, but the actual `automationNavigation` group has no `/app/automation/workflows` item — its closest match is `Workflow Builder` at `/app/automation/builder`. This is a pre-existing broken link, independent of the registry work.
**Why it happens:** Likely a naming drift between when the pinned-favorites list was written and when `automationNavigation` was defined/renamed.
**How to avoid:** The catch-all route will still catch this path (any unmatched `/app/*` path falls through to it) and, since it has no registry entry, would hit the `notFound()` branch in the example implementation above — i.e. it would remain a literal 404 unless fixed. Either correct the hardcoded href to `/app/automation/builder`, or make the catch-all render a generic placeholder (not a 404) for any unmatched `/app/*` path as an extra safety net, per D-01's "zero 404s, phase-wide" framing.
**Warning signs:** NAV-01 verification must click pinned-favorites links too, not just registry-driven sidebar links.

### Pitfall 4: Several nav groups have no requirement ID owner in this milestone at all — their placeholder may be permanent

**What goes wrong:** Assuming every `planned` placeholder is temporary (soon replaced by a future phase). Cross-referencing REQUIREMENTS.md's traceability table against the registry shows several nav items are not covered by **any** v1 requirement: Security group's IAM/Roles/Secrets/Audit Logs/Security Overview (GOVN-01/02 only cover Policies/Compliance), and AI group's AI Studio/AI Models/Prompt Library/Vector Store pages (AIST-01-03 only cover Agents CRUD + playground; KHUB covers only `/app/ai/knowledge`).
**Why it happens:** The nav registry was built with more surface area than the requirements ever scoped.
**How to avoid:** No special handling needed this phase (the same `implementationStatus: "planned"` placeholder is correct either way), but the plan should not assume every placeholder has a known future phase — some may need `implementationStatus: "disabled"` (D-06's third state) to signal "not even scheduled" rather than "planned," if the planner wants to distinguish the two. This is a judgment call, not a blocking gap.
**Warning signs:** None for this phase directly — flagged so Phase 5-8 planners don't get confused when their phase doesn't cover every route in "their" nav group.

### Pitfall 5: BullMQ v6 is a genuinely new major (released 2026-07-30), not a routine patch bump

**What goes wrong:** Treating the `^5` → `^6` bump as risk-free because `archive-worker` has no code yet. The bump itself is safe (nothing to migrate), but BullMQ v6 introduces a pluggable-backend abstraction (`IQueueBackend`) and **removes** `Queue#client`, `Worker#blockingClient`, `Queue#redisVersion`, `Queue#databaseType`, `FlowProducer#client`, and changes `Worker#waitUntilReady()` to resolve `void` instead of the Redis client [CITED: docs.bullmq.io/changelog, 6.0.0 (2026-07-30)]. `services/archive-api/src/services/queue.service.ts` (the only bullmq usage in archive-api) does not touch any of these removed APIs — confirmed by direct grep, safe as-is.
**Why it happens:** A major-version label alone doesn't communicate whether the removed surface area is used.
**How to avoid:** After bumping `archive-worker`'s `package.json`, run `pnpm install` and `pnpm --filter @cerebro/archive-worker typecheck` (once source exists) to catch any future v5-only API usage early; for this phase, the check is moot since there's no worker source yet — but Phase 4's planner/researcher should be told v6's removed-API list so they don't reach for `Queue#client` etc. when building the consumer.
**Warning signs:** None expected this phase (no compilable code depends on the removed APIs yet).

### Pitfall 6: `bullmq` is pinned to `^5.80.9` in two more places CONTEXT.md didn't mention

**What goes wrong:** `apps/studio/package.json` and `apps/studio/platform/package.json` also depend on `bullmq@^5.80.9` (used by `apps/studio/lib/queue/client.ts` / `worker.ts` for `pm-agent-queue`/`audit-queue` — unrelated to archive ingestion). SCHM-02's wording only requires reconciling `archive-api`/`archive-worker`; leaving these two on v5 is compliant with the letter of SCHM-02, but creates a 3-way version split repo-wide (`^6` in forge-api's transitive deps if any + archive-api, `^5` in apps/studio and platform).
**Why it happens:** CONTEXT.md's D-12 only surfaced the two services directly involved in Phase 4's producer/consumer wiring.
**How to avoid:** Decide explicitly (and document the decision) whether Phase 1 reconciles only the two SCHM-02-named services (minimal, strictly correct per requirement wording) or all four bullmq consumers repo-wide (more consistent, technically broader than SCHM-02's stated scope). Since `apps/studio`'s queues are functionally independent (different queue names, different consumer), this is safe to defer, but should be a conscious plan decision, not an oversight.
**Warning signs:** A future `pnpm audit` or dependency-consistency lint flagging the split.

## Code Examples

### Route Existence Audit (verified via filesystem scan against registry hrefs)

Of 101 unique `href` values referenced across the 14 `platformNavigation` groups + `forgeNavigation` + `hiveopsNavigation`, **39 already resolve to a real `page.tsx`**:
```
/app, /app/ai, /app/agents, /app/workflows, /app/playground, /app/analytics,
/app/trust/security, /app/trust/audit, /app/trust/compliance, /app/trust/policies,
/app/talent, /app/talent/candidates, /app/talent/builder,
/app/forge (+ all 18 forge/* sub-items — all 19 forge pages have page.tsx files),
/app/hiveops (+ all 6 hiveops/* sub-items — all 7 hiveops pages have page.tsx files)
```

**62 unique paths are literal 404s today** (grouped by nav section):
```
Workspace (3):        /app/organizations, /app/projects, /app/teams
AI (5):                /app/ai/studio, /app/ai/models, /app/ai/prompts, /app/ai/knowledge, /app/ai/vectors
Solutions/Explore (5): /app/marketplace, /app/templates, /app/industry, /app/quantiva, /app/custom
Infrastructure (9):    /app/infrastructure (+ 8 sub-items: cloud, deployments, kubernetes, databases,
                        storage, networking, edge, gateway)
Data (6):              /app/data (+ 5 sub-items: pipelines, etl, warehouse, lakehouse, bi)
Security (4):          /app/security, /app/security/iam, /app/security/roles, /app/security/secrets
Automation (6):        /app/automation (+ 5 sub-items: builder, events, schedulers, integrations, connectors)
Research (5):          /app/research (+ 4 sub-items: news, whitepapers, benchmarks, architecture)
Academy (5):           /app/academy (+ 4 sub-items: courses, certifications, labs, paths)
Business (6):          /app/business (+ 5 sub-items: billing, subscription, usage, invoices, licenses)
Support (5):           /app/support (+ 4 sub-items: assistant, help, tickets, community, status)
Talent OS (2):         /app/talent/assessments, /app/talent/questions
```
Note: Talent OS's 2 missing routes are NOT in CONTEXT.md's D-05 "8 groups" list (Talent OS's real build is Phase 6), but they still 404 today and need the same `implementationStatus: "planned"` treatment under NAV-01's "zero 404s, phase-wide" mandate. Same applies to Solutions/Explore (Phase 7) and Security's IAM/Roles/Secrets (unowned by any v1 requirement).

*Reproduce this audit:* `node -e '...'` script comparing `href:` regex matches in `navigation/index.ts` against `find apps/studio/app/(platform)/app -name page.tsx` output — see this research's working notes if the plan needs to re-verify after edits.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| BullMQ v5 with direct Redis client access via `Queue#client` | BullMQ v6 pluggable `IQueueBackend` abstraction | 2026-07-30 (v6.0.0) | Any future worker code must use `getBackend()` instead of `Queue#client`/`Worker#blockingClient`/`FlowProducer#client`; `Worker#waitUntilReady()` now resolves `void` |

**Deprecated/outdated:** None directly relevant beyond the BullMQ v5→v6 API removals noted above.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Catch-all route precedence (static > dynamic > catch-all, applies to nested paths under a partially-existing static sibling folder) behaves as described, based on official Next.js docs plus cross-verified community sources, not an explicit worked example in Next.js's own docs for this exact "static folder + catch-all sibling" scenario | Pattern 1 | If wrong, `/app/ai/studio` etc. would 404 instead of hitting the catch-all, and the plan would need per-prefix catch-alls (e.g. `app/(platform)/app/ai/[...segments]/page.tsx`) instead of one root-level catch-all — a build-time-visible failure, low risk, easy to detect and fix during Wave 0 verification |
| A2 | Target BullMQ version `^6.0.9` is "latest v6" as of research date — confirmed via `npm view bullmq versions`, but not re-verified against the registry at plan-time | Standard Stack | Low risk — any `^6.x` satisfies SCHM-02's "reconcile to a single major version" requirement; exact patch pinned doesn't matter |
| A3 | No auth guard on the 9 forge-api controllers is intentional/acceptable for this phase (not something Phase 1 must fix) — inferred from D-04's "don't over-polish" framing, not an explicit CONTEXT.md statement | Pattern 3 | If wrong (i.e., the user actually wants auth added), FORGE-01 tasks would need an added `@UseGuards` step; low implementation cost either way, worth a quick confirmation at plan/discuss time if not already settled |

## Open Questions

1. **Should the catch-all also handle completely unregistered paths (like the `pinnedFavorites` `/app/automation/workflows` bug) with a placeholder, or let them 404?**
   - What we know: D-01 says "zero 404s, phase-wide" for the 99 *registered* destinations; it's silent on paths that are linked from elsewhere in the UI but aren't in the registry at all.
   - What's unclear: Whether "phase-wide" should be read as "every link anywhere in Studio" or strictly "every registry item."
   - Recommendation: Cheap to make the catch-all's fallback (no registry match) render a generic placeholder instead of `notFound()` — strictly safer and closer to the spirit of D-01/D-07 ("never a bare blank screen"). Flag as a planner decision, not a blocker.

2. **Should Phase 1 fix `Sidebar.tsx`'s missing-6-groups issue, or is that arguably a pre-existing bug outside SCHM/NAV's stated scope?**
   - What we know: NAV-01 says "every sidebar navigation destination... resolves" — implying the destinations must be reachable *from the sidebar*, not just resolvable by direct URL.
   - What's unclear: CONTEXT.md's D-01/D-05 focus entirely on route resolution (404 vs. placeholder), never explicitly mentioning that the Sidebar component itself doesn't render 6 groups.
   - Recommendation: Treat this as in-scope — a "sidebar navigation destination" that isn't in the sidebar is definitionally not resolved "from the sidebar." Include the `Sidebar.tsx` restructure as a required task, not optional cleanup.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All work | ✓ | v22.17.0 | — |
| pnpm | Install/build | ✓ | 9.15.9 | — |
| PostgreSQL | forge-api DB, Prisma schema changes | Not directly probed this session; CONTEXT.md D-02 confirms DB connection + full Prisma migration were verified working earlier in this same session | — | If unavailable at plan/execute time, re-run the fix documented in `services/forge-api/src/main.ts`'s dotenv-loading comment |
| Redis | archive-api's BullMQ queue (`archive-ingestion`), apps/studio's `pm-agent-queue`/`audit-queue` | Not directly probed this session (`redis-cli` not on PATH in this shell) | — | Not required for Phase 1's actual work (no queue code is written or run this phase — only a `package.json` version bump) |
| forge-api service | FORGE-01 pages' live API calls during manual verification | Confirmed running on port 4005 per CONTEXT.md (this session, prior to this research) | — | Start via `pnpm --filter @cerebro/forge-api dev` if not running |

**Missing dependencies with no fallback:** none identified.
**Missing dependencies with fallback:** PostgreSQL/Redis availability should be re-confirmed at plan-execution time (`pg_isready`, `redis-cli ping`) since this research session did not have direct access to probe them.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (`vitest.config.ts`, `vitest.dashboard.config.ts` at repo root) |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm --filter studio vitest run <file> --reporter=dot` (no existing tests target `navigation/index.ts` or `Sidebar.tsx` — confirmed via search, no matches) |
| Full suite command | `pnpm test` (repo root, per `package.json`) |

No existing test file covers `apps/studio/app/(platform)/app/navigation/index.ts`, `Sidebar.tsx`, or any `forge/*` page. This phase is almost entirely route-resolution / rendering behavior, which is better covered by build-time verification (Next.js build catching route conflicts) and a manual/automated route-audit script (see "Route Existence Audit" reproduction note above) than by unit tests.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NAV-01 | All 99 registry paths return 200 (real page or placeholder), never 404 | smoke (scripted route audit) | `node scripts/audit-nav-routes.ts` (build against `next build` output or a running dev server, hitting every registry href) | ❌ Wave 0 — script doesn't exist yet |
| NAV-02 | Every `planned`/`disabled` route renders `PlaceholderModule` with correct group/title/status text | integration (Vitest + React Testing Library, if configured) or manual/visual | `pnpm --filter studio vitest run tests/placeholder-module.test.tsx` | ❌ Wave 0 — component and test both new |
| FORGE-01 | 9 pages successfully call their forge-api controller and render a non-decorative result | manual (requires running forge-api + seeded project) — no automated integration harness exists for cross-service calls today | — | ❌ Wave 0 gap, likely stays manual-only given no existing cross-service test harness |
| SCHM-01 | `Policy` model has org scoping + audit fields; `prisma generate`/`migrate` succeeds | build-time (Prisma validation) | `pnpm --filter @cerebro/db prisma validate && pnpm --filter @cerebro/db prisma migrate dev --create-only` | N/A — Prisma's own validation is the test |
| SCHM-02 | `pnpm install` succeeds with both services on the same bullmq major; no removed-API usage | build-time | `pnpm install && pnpm --filter @cerebro/archive-api typecheck && pnpm --filter @cerebro/archive-worker typecheck` | N/A |

### Sampling Rate
- **Per task commit:** relevant `typecheck`/`build` for the touched package; route audit script for nav-touching tasks
- **Per wave merge:** `pnpm build` (full monorepo) — this phase is unusually build-verification-heavy since most of its correctness is "does every route compile and resolve," not business logic
- **Phase gate:** Full `pnpm build` + manual click-through of every sidebar group (since no automated sidebar-rendering test exists) before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `scripts/audit-nav-routes.ts` (or equivalent) — scripted verification that every registry href resolves without 404, covers NAV-01
- [ ] `PlaceholderModule` component + a basic render test — covers NAV-02
- [ ] No existing test harness for cross-service (Studio → forge-api) integration — FORGE-01 verification will be manual this phase; flag for a future phase if repeated FORGE work needs it

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | Marginal | forge-api controllers currently have no auth guard (see Pitfall 3/Pattern 3's auth note) — not newly introduced by this phase, pre-existing gap; do not silently paper over it, but fixing it is arguably out of this phase's stated scope (D-04) |
| V3 Session Management | No | No session handling introduced this phase |
| V4 Access Control | Marginal | Same as V2 — no per-organization/tenant access control exists on forge-api's 9 controllers; Forge Overview's `projects.list()` accepts an optional `workspaceId`/`organizationId` query param but nothing enforces the caller only sees their own org's projects |
| V5 Input Validation | Yes | forge-api controllers already use `class-validator` DTOs (`IsString`, `IsNotEmpty` — verified in `PlanBodyDto`) with a global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` in `main.ts` — this is the existing standard, continue using it for any new/touched DTOs |
| V6 Cryptography | No | No cryptographic operations in this phase |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Cross-tenant data leakage via forge-api's optional (not enforced) `workspaceId`/`organizationId` filter | Information Disclosure | Not required to fix in this phase per D-04, but should be flagged to the plan/verifier as a known gap so it isn't mistaken for "already secure" — genuine fix belongs to a dedicated CerebroForge/security phase, consistent with WKSP-05's "single shared tenant-scoping helper" being scoped to Phase 2, not Phase 1 |
| Catch-all route accidentally shadowing a future real route | Tampering (routing integrity) | Next.js static routes always win over the catch-all by design — adding a real `page.tsx` in a later phase automatically takes precedence with no code change needed in the catch-all itself |

## Sources

### Primary (HIGH confidence — direct repo inspection)
- `apps/studio/app/(platform)/app/navigation/index.ts` — full registry read, all 14 `platformNavigation` groups + `forgeNavigation`
- `apps/studio/app/(platform)/app/components/Sidebar.tsx` — confirmed which groups are actually rendered
- `apps/studio/app/(platform)/app/components/Topbar.tsx` — confirmed no breadcrumb exists today; confirmed hardcoded links (`/app/security`, `/app/business/billing`, `/app/organizations`)
- `apps/studio/app/(platform)/app/layout.tsx`, `PlatformLayoutClient.tsx` — confirmed the actual layout chain for `/app/**` routes
- `apps/studio/lib/navigation/registry.ts`, `apps/studio/components/layout/StudioShell.tsx` — confirmed this is a separate, unused (for `/app/**`) registry/shell
- `apps/studio/lib/forge/api-client.ts`, `apps/studio/lib/forge/hooks.ts` — confirmed existing, working CerebroForge calling convention
- `apps/studio/app/(platform)/app/forge/{planner,requirements,architect,testing,review,deploy,docs,codegen,page}.tsx` — confirmed real API wiring already exists
- `apps/studio/app/(platform)/app/forge/backend/page.tsx` (and siblings) — confirmed fabricated mock data that must be removed for FORGE-02
- `apps/studio/app/actions/archive.ts` — confirmed Server Action calling convention precedent (not used for forge-api)
- `packages/api-client/src/EngineeringReviewClient.ts`, `apps/studio/lib/config/api.ts` — confirmed typed-client precedent (deferred per DEFR-09, not this phase's pattern)
- `packages/db/prisma/schema.prisma` — confirmed `Policy`/`Metric`/`Alert`/`Incident` are all bare stubs; confirmed `Agent`/`Workspace`/`Organization` as the actual tenant-scoping precedents; confirmed zero Talent OS/Explore models via grep
- `services/forge-api/src/{projects,planner,requirements,architect,codegen,testing,review,deploy,docs}/*.controller.ts` — confirmed no `@UseGuards` on any of the 9
- `services/forge-api/src/main.ts` — confirmed port (4005) and env var loading behavior
- `.env.example`, `apps/studio/.env.local` — confirmed `NEXT_PUBLIC_FORGE_API_URL` already configured
- `services/archive-api/package.json`, `services/archive-worker/package.json`, `apps/studio/package.json`, `apps/studio/platform/package.json` — confirmed all 4 bullmq version pins via grep
- `services/archive-api/src/services/queue.service.ts` — confirmed no removed-v6-API usage
- `services/archive-worker/` — confirmed literally no source files exist yet (package.json/tsconfig only)
- `apps/studio/components/discovery/Breadcrumbs.tsx` — confirmed existing breadcrumb precedent (marketing-site-oriented, not directly reusable)
- `apps/studio/app/(platform)/app/components/ui/Card.tsx` and sibling `Badge.tsx`/`Button.tsx`/`StatCard.tsx` — confirmed design-system components available for `PlaceholderModule`
- `apps/studio/package.json` — confirmed `next@16.2.10`, `react@19.2.4`

### Secondary (MEDIUM confidence)
- [BullMQ official changelog](https://docs.bullmq.io/changelog) — confirmed v6.0.0 released 2026-07-30, listed removed APIs (`Queue#client`, `Worker#blockingClient`, `Queue#redisVersion`, `Queue#databaseType`, `FlowProducer#client`, `Worker#waitUntilReady()` return-type change)
- [Next.js dynamic-routes docs](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) — confirmed catch-all `[...folderName]` and optional catch-all `[[...folderName]]` syntax and basic matching table (v16.3.0 docs, current)

### Tertiary (LOW confidence)
- WebSearch results on Next.js static-vs-catch-all precedence in the same directory (GitHub discussions, community blog posts) — general routing-precedence claim not found as an explicit worked example in Next.js's own docs; treated as Assumption A1 above

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages, all findings from direct repo inspection
- Architecture (route audit, sidebar gap, forge calling convention): HIGH — every claim verified against actual files/filesystem state, not inferred
- Catch-all routing precedence mechanism: MEDIUM — official docs confirm catch-all syntax/behavior in isolation; the specific "sibling static folder + nested catch-all" interaction is corroborated by community sources, not an explicit official worked example (flagged as Assumption A1)
- Prisma schema pattern recommendation: HIGH for "what exists" (direct grep), MEDIUM for "which convention to follow" (reasoned from REQUIREMENTS.md wording, not an explicit CONTEXT.md decision — flagged as a genuine architectural fork needing a plan-time decision)
- BullMQ reconciliation: HIGH — versions, breaking-changes list, and absence of removed-API usage all directly verified

**Research date:** 2026-08-10
**Valid until:** 2026-09-09 (30 days — stable internal codebase findings; re-verify route-existence audit if significant `/app/**` file changes land before planning starts, and re-check BullMQ's latest patch version at implementation time)
