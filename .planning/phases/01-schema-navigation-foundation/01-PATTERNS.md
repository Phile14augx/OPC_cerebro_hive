# Phase 1: Schema & Navigation Foundation - Pattern Map

**Mapped:** 2026-08-10
**Files analyzed:** 26 (1 registry, 3 nav/layout components, 1 new catch-all route, 1 new component, 1 new breadcrumb, 9 FORGE-01 pages, 10 FORGE-02 pages, 1 schema file, 2 package.json, 1 audit script, 1 test file)
**Analogs found:** 24 / 26

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `apps/studio/app/(platform)/app/navigation/index.ts` | config (registry) | transform (static data) | itself (extend in place) | exact — modify, don't replace |
| `apps/studio/app/(platform)/app/[...segments]/page.tsx` | route (catch-all) | request-response | `apps/studio/app/(platform)/app/evaluations/[view]/page.tsx` (routing/param shape) + registry lookup logic is new | partial — anti-pattern precedent only, no direct analog for registry-lookup catch-all |
| `apps/studio/app/(platform)/app/components/ui/PlaceholderModule.tsx` | component | transform (props → static render) | `apps/studio/app/(platform)/app/forge/backend/page.tsx` (Card/Badge composition style) + `Card.tsx`/`Badge.tsx` primitives | role-match — no existing "empty state" component anywhere in the codebase |
| `apps/studio/app/(platform)/app/components/ui/Breadcrumbs.tsx` (new, Studio-local) | component | transform | `apps/studio/components/discovery/Breadcrumbs.tsx` (prop shape only — do NOT copy body) | partial — shape reuse, explicit anti-pattern on implementation |
| `apps/studio/app/(platform)/app/components/Sidebar.tsx` | component (nav) | event-driven (client render from static registry) | itself (existing `sections.map(...)` block, lines 219-261) | exact — restructure loop, reuse existing item-rendering JSX verbatim |
| `apps/studio/app/(platform)/app/components/Topbar.tsx` | component (nav) | event-driven | itself (existing header layout, insert breadcrumb strip below/beside title area) | role-match |
| `apps/studio/app/(platform)/app/forge/planner/page.tsx` | component (page) | request-response (client fetch) | `apps/studio/app/(platform)/app/forge/requirements/page.tsx` (has correct error-render + empty-state pattern; planner is missing both) | exact — same tier, gap-closing only |
| `apps/studio/app/(platform)/app/forge/codegen/page.tsx` | component (page) | streaming (SSE via `useCodegen`) | `apps/studio/app/(platform)/app/forge/requirements/page.tsx` (error/empty state) + `apps/studio/lib/forge/hooks.ts`'s `useCodegen` (already streaming-correct) | role-match — error/empty gap-closing only, streaming logic already exists |
| `apps/studio/app/(platform)/app/forge/{architect,testing,review,deploy,docs,page}.tsx` (verify/gap-close, 6 files) | component (page) | request-response | `apps/studio/app/(platform)/app/forge/requirements/page.tsx` | exact |
| `apps/studio/app/(platform)/app/forge/{backend,database,api,mobile,web,desktop,bots,repos,ui-studio,monitoring}/page.tsx` (10 files, FORGE-02) | component (page) | transform (fake→placeholder) | `apps/studio/app/(platform)/app/forge/backend/page.tsx` (itself — the fake-data pattern to remove) + `PlaceholderModule` (new, replacement) | exact — self-referential removal + new-component insertion |
| `packages/db/prisma/schema.prisma` (`Policy` model, line 1127) | model | CRUD (schema only, no CRUD UI this phase) | `Agent` model (line 172, tenant-scoped shape) + `Organization`/`OrgMembership` (line 1481/1502, FK style: bare string `orgId`, no `@db.Uuid`) | role-match — hybrid of two existing precedents, not a single 1:1 analog |
| `services/archive-worker/package.json` | config | batch (dependency manifest) | `services/archive-api/package.json` (target version already there) | exact |
| `scripts/audit-nav-routes.ts` (new) | utility (script) | batch | none — no existing route-audit script in the repo | no analog |
| `tests/placeholder-module.test.tsx` (new) | test | request-response (render test) | no existing Vitest+RTL component test found in `apps/studio` for this component tree | no analog |

## Pattern Assignments

### `apps/studio/app/(platform)/app/navigation/index.ts` (config, extend in place)

**Analog:** itself — this is a modify, not a new file. Read fully (`d:/{MY_PROJECTS}/{OPC_cerebro_hive}/OPC/cerebro-hive-website/apps/studio/app/(platform)/app/navigation/index.ts`, 262 lines).

**Current shape** (lines 25-36):
```typescript
export type NavItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
};

export type NavGroup = {
  title: string;
  href?: string;
  icon: LucideIcon;
  items: NavItem[];
};
```

**Extension needed:** add `implementationStatus?: "active" | "planned" | "disabled"` to `NavItem` (and optionally default at `NavGroup` level for groups that are 100% placeholder, e.g. Automation/Research/Academy/Business/Support/Infrastructure/Data). Every one of the 99 items across all 14 `NavGroup` consts (`workspaceNavigation` through `hiveopsNavigation`, lines 38-245) needs a value. `forgeNavigation` (lines 205-230) needs per-item status split 9 `active` / 10 `planned` per the D-03 table. `platformNavigation` array (lines 247-262) does **not** include `forgeNavigation` — confirmed by direct read; any registry-iteration code (catch-all, Sidebar, breadcrumb) must reference `forgeNavigation` explicitly alongside `platformNavigation`.

**Verified route-existence ground truth** (from RESEARCH.md's filesystem audit, re-confirm at plan time if `/app/**` changed): all 19 `forgeNavigation` items and all 7 `hiveopsNavigation` items already have `page.tsx` files. All of `infrastructureNavigation`, `dataNavigation` (except `/app/analytics`), `automationNavigation`, `researchNavigation`, `academyNavigation`, `businessNavigation`, `supportNavigation`, `solutionsNavigation`, plus `workspaceNavigation`'s `/app/organizations`/`/app/projects`/`/app/teams`, `aiNavigation`'s `/app/ai/studio`/`/app/ai/models`/`/app/ai/prompts`/`/app/ai/knowledge`/`/app/ai/vectors`, `securityNavigation`'s `/app/security`/`/app/security/iam`/`/app/security/roles`/`/app/security/secrets`, and `talentNavigation`'s `/app/talent/assessments`/`/app/talent/questions` have no `page.tsx` — these all need `implementationStatus: "planned"`.

---

### `apps/studio/app/(platform)/app/[...segments]/page.tsx` (NEW — catch-all route)

**Analog:** No direct analog exists (no catch-all route currently in the repo). Closest structural precedent for "look up dynamic param, render conditionally" is `apps/studio/app/(platform)/app/evaluations/[view]/page.tsx` (67 lines, read in full) — but its `switch`-based fallback is the explicit anti-pattern RESEARCH.md flags (do not copy its `{view} Module - Coming Soon` fallback branch, lines 44-50):
```typescript
// apps/studio/app/(platform)/app/evaluations/[view]/page.tsx lines 36-51 — ANTI-PATTERN, do not extend
const renderMainContent = () => {
  switch (activeView) {
    case 'overview':
      return <OverviewDashboard />;
    ...
    default:
      return (
        <div className="flex-1 flex items-center justify-center text-muted-foreground bg-background">
          {activeView.charAt(0).toUpperCase() + activeView.slice(1)} Module - Coming Soon
        </div>
      );
  }
};
```
This bare-string fallback with shadcn `text-muted-foreground` token is exactly what `PlaceholderModule` supersedes — do not replicate the pattern anywhere in the new catch-all.

**Reference implementation** (from RESEARCH.md's Pattern 1, already vetted against Next.js App Router precedence — use as the base, adjust to import both `platformNavigation` and `forgeNavigation` explicitly):
```typescript
"use client";
import { useParams } from "next/navigation";
import { platformNavigation, forgeNavigation } from "../navigation";
import { PlaceholderModule } from "../components/ui/PlaceholderModule";

const ALL_GROUPS = [...platformNavigation, forgeNavigation];

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
          status={(item.implementationStatus as "planned" | "disabled") ?? "planned"}
        />
      );
    }
  }
  // Unregistered path (e.g. stale pinnedFavorites link) — per D-01/D-07, never a bare 404
  return <PlaceholderModule group="Unknown" title={path} status="planned" />;
}
```
Note: per the Copywriting Contract (01-UI-SPEC.md), unregistered-path fallback eyebrow format is `Unknown / {path}` — adjust `PlaceholderModule`'s `group`/`title` props accordingly (either pass `group="Unknown"` `title={path}` as above, or format the string before passing, matching the locked `{group} / {title}` eyebrow template).

**Layout wrapper convention:** confirmed via `evaluations/[view]/page.tsx` (`'use client'` at top, `useParams()`/`useRouter()` from `next/navigation`) — matches this pattern. All `/app/**` pages are `"use client"`.

---

### `apps/studio/app/(platform)/app/components/ui/PlaceholderModule.tsx` (NEW)

**Analog:** No existing "empty state" component anywhere in `apps/studio/components/`. Compose from `Card.tsx` + `Badge.tsx` primitives (read in full).

**`Card` primitive** (`apps/studio/app/(platform)/app/components/ui/Card.tsx` lines 1-14):
```typescript
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-border bg-surface text-text-primary shadow-sm overflow-hidden",
      className
    )}
    {...props}
  />
));
```

**`Badge` primitive** (`apps/studio/app/(platform)/app/components/ui/Badge.tsx` lines 5-23, variant used: `secondary`):
```typescript
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors ...",
  {
    variants: {
      variant: {
        default: "bg-primary-accent text-background",
        secondary: "bg-surface border border-border text-text-primary",
        destructive: "bg-red-500/10 text-red-500 border border-red-500/20",
        ...
      },
    },
    defaultVariants: { variant: "default" },
  }
);
```

**Composition to build** (locked shape, from 01-UI-SPEC.md's Component Contracts §1 — use verbatim, this is the checker-verified contract):
```tsx
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
          <p className="text-xs font-[var(--font-weight-heading)] uppercase tracking-widest text-text-muted">{group} / {title}</p>
          <h1 className="text-lg font-space font-[var(--font-weight-heading)] text-text-primary mt-1">Not yet available</h1>
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
Note: use `font-[var(--font-weight-heading)]` (Typography contract's 2-weight-cap rule), not a hardcoded `font-bold` literal, for the eyebrow/heading text — per 01-UI-SPEC.md's locked typography table. This differs slightly from RESEARCH.md's earlier draft (which used `font-bold`); the UI-SPEC.md version is authoritative (later, checker-verified document).

---

### `apps/studio/app/(platform)/app/components/ui/Breadcrumbs.tsx` (NEW, Studio-local)

**Analog (shape only, do not copy body):** `apps/studio/components/discovery/Breadcrumbs.tsx` — marketing-site component, emits `JsonLd` SEO schema, uses shadcn `text-foreground`/`text-muted-foreground` tokens. Per RESEARCH.md's Anti-Pattern list and 01-UI-SPEC.md Component Contract §2: reuse only the `{ label: string; href?: string }[]` prop shape, rebuild the render with Studio platform tokens, no `JsonLd`.

**Locked contract** (01-UI-SPEC.md §2):
```
Prop shape: { label: string; href?: string }[]
Render: label (text-text-secondary) separated by ChevronRight size={12} className="text-text-muted",
last item unstyled-as-link in text-text-primary font-[var(--font-weight-heading)] (current page, no href)
```
Source of truth for both breadcrumb and page `<title>`: same navigation-registry entry matched by current path (one lookup, two consumers, per D-08) — likely resolved via a small shared helper (e.g. `findNavItemByPath(pathname)`) used by both `Breadcrumbs` and wherever page titles are set, to avoid duplicating the lookup logic already written for the catch-all route.

---

### `apps/studio/app/(platform)/app/components/Sidebar.tsx` (MODIFY — D-13 restructure)

**Analog:** itself. Full file read (266 lines). Two things must change:

**1. The hand-picked `sections` array (lines 23-33, current — replace this, not the item-rendering JSX below it):**
```typescript
// CURRENT — hand-picks 6 of 14 groups by title string match, drops HiveOps/Automation/Research/Academy/Business/Support
const sections = [
  { title: "Workspace", items: platformNavigation.find(g => g.title === "Workspace")?.items || [] },
  { title: "AI Platform", items: platformNavigation.find(g => g.title === "AI")?.items || [] },
  { title: "Infrastructure", items: platformNavigation.find(g => g.title === "Infrastructure")?.items || [] },
  { title: "Data & Security", items: [
    ...(platformNavigation.find(g => g.title === "Data")?.items || []),
    ...(platformNavigation.find(g => g.title === "Security")?.items || [])
  ]},
  { title: "Talent OS", items: platformNavigation.find(g => g.title === "Talent OS")?.items || [] },
  { title: "Explore", items: platformNavigation.find(g => g.title === "Solutions")?.items || [] }
];
```
Replace with a generic map over `platformNavigation` (excluding `Workspace`, which keeps its special pinned/switcher treatment above, and excluding `CerebroForge`, which is `forgeNavigation` rendered separately via the amber collapsible block at lines 164-216 — that block stays as-is). All other groups (AI, Solutions, Infrastructure, Data, Security, Automation, Research, Academy, Business, Talent OS, Support, HiveOps) should render through one identical loop.

**2. The existing item-rendering JSX to reuse verbatim for the newly-surfaced groups** (lines 219-261 — this exact block, unchanged, per 01-UI-SPEC.md §3 "reused verbatim, not newly authored"):
```tsx
{sections.map((section, idx) => (
  section.items.length > 0 && (
    <div key={idx} className="px-3 py-3 border-t border-border/50">
      {!isCollapsed && (
        <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted px-2 mb-2">
          {section.title}
        </h4>
      )}
      <div className="space-y-0.5">
        {section.items.map((item, itemIdx) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <TrackedLink
              key={itemIdx}
              href={item.href}
              analyticsEvent="sidebar_nav_click"
              analyticsCategory="sidebar"
              analyticsLabel={item.title}
              onClick={closeMobile}
              title={isCollapsed ? item.title : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg text-sm transition-colors group",
                isActive ? "bg-surface-elevated text-text-primary font-bold shadow-sm border border-border" : "text-text-secondary hover:bg-surface hover:text-text-primary border border-transparent",
                isCollapsed ? "justify-center p-2.5" : "px-3 py-2"
              )}
            >
              {item.icon && (
                <item.icon size={20} className={cn("shrink-0 transition-colors", isActive ? "text-primary-accent" : "text-text-muted group-hover:text-text-primary")} />
              )}
              {!isCollapsed && <span>{item.title}</span>}
            </TrackedLink>
          );
        })}
      </div>
    </div>
  )
))}
```
Per 01-UI-SPEC.md §3: do NOT retrofit this block's literal `font-bold` to `font-[var(--font-weight-heading)]` — that's out of scope (behavioral fix only, not a restyle), unlike `PlaceholderModule` which is new code and must use the token form.

**3. Bug fix (D-14, Pitfall 3):** `pinnedFavorites` array (lines 35-39) hardcodes `{ title: "Workflows", href: "/app/automation/workflows", ... }` — this route doesn't exist in `automationNavigation` (closest real match is `Workflow Builder` at `/app/automation/builder`, confirmed in `navigation/index.ts` line 131). Fix the href directly; the catch-all's "Unknown" fallback would otherwise catch it but a direct fix is cleaner since the correct destination is known.

---

### `apps/studio/app/(platform)/app/components/Topbar.tsx` (MODIFY — add breadcrumb strip, D-08)

**Analog:** itself. Full file read (400 lines). Current `<header>` structure (lines 340-394) has three flex sections: left (mobile toggle + `WorkspaceMenu`), center (search/command palette), right (Hive Assistant, notifications, user menu) — no breadcrumb slot exists today. Insert the new `Breadcrumbs` component using the same `text-text-secondary`/`text-text-muted` tokens already used throughout this file (e.g. line 128 `text-text-secondary`, line 112 `text-text-muted`) — do not introduce shadcn tokens. Also note: this file hardcodes `/app/organizations` (line 136, 281), `/app/business/billing` (line 288), `/app/security` (line 295), `/app/support` (line 228) as plain `Link` hrefs — these are exactly the kind of links NAV-01/D-14 cover; confirm each still resolves (via placeholder or real page) after the registry/catch-all work lands, since Topbar's links bypass the registry entirely (raw `next/link` `Link`, not `TrackedLink` sourced from `platformNavigation`).

---

### `apps/studio/app/(platform)/app/forge/planner/page.tsx` (MODIFY — gap-close error/empty states)

**Analog:** `apps/studio/app/(platform)/app/forge/requirements/page.tsx` (full file read, 226 lines) — has the correct pattern that `planner/page.tsx` (also fully read, 228 lines) is missing.

**Error render gap — `requirements/page.tsx` HAS this (lines 129-133), `planner/page.tsx` destructures `error` but never renders it:**
```tsx
{error && (
  <Card className="p-4 border-red-500/20 bg-red-500/5">
    <p className="text-sm text-red-400">{error}</p>
  </Card>
)}
```
Per 01-UI-SPEC.md's Copywriting Contract, the new standard (apply when touching each of the 9 pages, not just planner) also requires an `AlertTriangle` icon + `Try again` retry button — upgrade this exact block to:
```tsx
{error && (
  <Card className="p-4 border-red-500/20 bg-red-500/5 flex items-start gap-3">
    <AlertTriangle size={16} className="text-red-400 shrink-0" />
    <div className="flex-1">
      <p className="text-sm text-red-400">{error}</p>
      <Button variant="ghost" size="sm" className="mt-2" onClick={handlePlan}>Try again</Button>
    </div>
  </Card>
)}
```
(swap `handlePlan`/`onClick` target for the specific retry action per page — `handleGenerate` in requirements, `runArchitect` in architect, etc.)

**Empty-state gap — `requirements/page.tsx`'s context banner already handles it (line 107):**
```tsx
<p className="text-sm font-bold text-text-primary">
  {project?.name ?? (projectId ? "Loading..." : "No project selected")}
</p>
```
`planner/page.tsx` has no equivalent context banner at all — it goes straight from the prompt input (lines 70-96) to the phases pipeline. Add the same conditional text pattern to planner's existing UI (e.g. disable/label the input area) rather than inventing a new banner shape.

**Loading state (already consistent across both, no change needed)** — `requirements/page.tsx` lines 135-143 (centered `Loader2` + present-participle text) is the pattern; `planner/page.tsx` lines 98-126 (phase-pipeline animation) is planner's own richer equivalent — keep as-is per Copywriting Contract's "keep each tool's existing present-participle phrasing."

---

### `apps/studio/app/(platform)/app/forge/codegen/page.tsx` (MODIFY — gap-close, SSE-specific)

**Analog:** `apps/studio/lib/forge/hooks.ts`'s `useCodegen` (lines 167-201, already read in full) — the SSE state machine itself is already correct and complete:
```typescript
export function useCodegen(projectId: string) {
  const [state, setState] = useState<CodegenState>({
    running: false, events: [], activeAgent: null, files: {}, done: false, error: null,
  });
  const start = useCallback(() => {
    setState(s => ({ ...s, running: true, events: [], files: {}, done: false, error: null }));
    const stop = forgeApi.codegen.start(projectId, (event) => {
      setState(s => {
        const events = [...s.events, event];
        let { activeAgent, files, done, error } = s;
        if (event.type === 'agent_start') activeAgent = event.agentType ?? null;
        if (event.type === 'chunk' && event.filePath && event.chunk) {
          files = { ...files, [event.filePath]: (files[event.filePath] ?? '') + event.chunk };
        }
        if (event.type === 'done') { done = true; }
        if (event.type === 'error') error = event.error ?? 'Unknown error';
        const running = !done && !error;
        return { ...s, events, activeAgent, files, done, error, running };
      });
    });
    return stop;
  }, [projectId]);
  return { state, start };
}
```
`state.error` is already populated correctly — verify `codegen/page.tsx` actually renders it using the same upgraded error-Card pattern shown above for planner (`AlertTriangle` + red Card + `Try again` calling `start()` again). Apply the same `"No project selected"` empty-state check for `!projectId`.

---

### `apps/studio/app/(platform)/app/forge/{architect,testing,review,deploy,docs,page}.tsx` (verify/gap-close, 6 files)

**Analog:** `apps/studio/app/(platform)/app/forge/requirements/page.tsx` (same as above) — RESEARCH.md confirms these 6 (plus requirements itself) already have the correct error/empty pattern; this phase's job is verification, not rewriting. Only `planner` and `codegen` are confirmed gaps. Read each of these 6 briefly at plan/implementation time to confirm before assuming no change is needed — RESEARCH.md's claim is HIGH confidence but not exhaustively re-verified line-by-line in this pattern-mapping pass.

---

### `apps/studio/app/(platform)/app/forge/{backend,database,api,mobile,web,desktop,bots,repos,ui-studio,monitoring}/page.tsx` (10 files, FORGE-02 — MODIFY, remove fake content)

**Analog:** `apps/studio/app/(platform)/app/forge/backend/page.tsx` itself (full file read, 121 lines) — the fake-data pattern to strip out, verbatim example of what NOT to keep:
```tsx
// LINES 25-31 — fabricated data, must be deleted
const generatedModules = [
  { name: "Auth Module",         files: 8,  pattern: "JWT + Refresh tokens" },
  { name: "Patient Module",      files: 12, pattern: "CRUD + business rules" },
  ...
];

// LINES 55-60 — fabricated StatCard row, must be deleted
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard label="Services"    value="8"    change="Microservices"    icon={Server}    trend="up" />
  <StatCard label="Endpoints"   value="84"   change="REST + GraphQL"   icon={Zap}       trend="up" />
  ...
</div>

// LINES 81-88 — setTimeout-backed fake action button, must be deleted
<Button
  onClick={() => { setBuilding(true); setTimeout(() => setBuilding(false), 2500); }}
  disabled={building}
  className="gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold h-8 text-xs"
>
  {building ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
  {building ? "Generating..." : "Generate Backend"}
</Button>
```
**Replacement (entire page body, per 01-UI-SPEC.md §5):**
```tsx
"use client";
import { PlaceholderModule } from "../../components/ui/PlaceholderModule";

export default function BackendStudioPage() {
  return <PlaceholderModule group="CerebroForge" title="Backend Studio" status="planned" />;
}
```
(swap `title` per page: "Database Studio", "API Studio", "Mobile Studio", "Web Studio", "Desktop Studio", "CerebroBots", "Repository Manager", "UI/UX Studio", "Monitoring & Ops" — use the exact `title` string from `forgeNavigation.items` in `navigation/index.ts` lines 205-230 for each). RESEARCH.md confirms `forge/monitoring/page.tsx` has the same fake-`StatCard`-and-alerts pattern despite not being read in this pass — treat identically to `backend/page.tsx`. Delete the `Suspense`/`useSearchParams` wrapper too — the placeholder doesn't need project context.

---

### `packages/db/prisma/schema.prisma` — `Policy` model extension (SCHM-01, D-10, D-16)

**Current bare stub** (line 1127-1131, confirmed via direct read):
```prisma
model Policy {
  id    String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name  String
  rules Json
}
```

**Analog #1 — tenant-scoped shape/audit-field convention** (`Agent` model, line 172-190, confirmed via direct read):
```prisma
model Agent {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  workspaceId String    @db.Uuid
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  name        String
  description String?
  avatarUrl   String?
  isActive    Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([workspaceId])
}
```

**Analog #2 — FK style to use instead** (per D-16, Policy follows `Organization`, not `Workspace`): `Organization`/`OrgMembership` (lines 1481-1514, confirmed via direct read) — `Organization.id` is a prefixed string (`org_...`), not a raw UUID, so the FK field is a bare `String` without `@db.Uuid`:
```prisma
model Organization {
  id String @id @default(dbgenerated("('org_' || replace(uuid_generate_v4()::text, '-', ''))"))
  ...
}

model OrgMembership {
  userId   String   @db.Uuid
  orgId    String
  role     UserRole @default(MEMBER)
  joinedAt DateTime @default(now())
  user User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  org  Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  @@id([userId, orgId])
  @@index([orgId, role])
  @@map("org_memberships")
}
```

**Target shape for `Policy`** (composite of both analogs — `Agent`'s audit-field/index structure, `OrgMembership`'s FK type):
```prisma
model Policy {
  id             String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  orgId          String
  organization   Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  name           String
  rules          Json
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  @@index([orgId])
}
```
Also add `policies Policy[]` to the `Organization` model's relation list (line ~1493-1499, alongside `members`/`invitations`/`aiUsage`/etc.) — Prisma requires the back-relation. This phase is schema-only (SCHM-01); no CRUD UI/controller is built against it (that's Phase 5/Governance).

---

### `services/archive-worker/package.json` (SCHM-02 — version bump)

**Analog/target:** `services/archive-api/package.json` line 26 (confirmed via grep):
```json
"bullmq": "^6.0.8",
```
**Current (to change):** `services/archive-worker/package.json` line 15 (confirmed via grep):
```json
"bullmq": "^5.0.0",
```
Bump to `^6.0.9` (RESEARCH.md's "latest v6 as of research date," any `^6.x` satisfies SCHM-02) or match `archive-api`'s exact `^6.0.8` for strict consistency — either satisfies the requirement per Assumption A2. `archive-worker` has no source files yet (confirmed in RESEARCH.md's Sources list) — pure manifest edit, no code migration needed. Note per Pitfall 6: `apps/studio/package.json` and `apps/studio/platform/package.json` also pin `bullmq@^5.80.9` — SCHM-02's wording only requires the two named services; leaving those two on v5 is compliant but creates a 3-way split — flagged as a plan-time decision, not a default action.

---

## Shared Patterns

### Design tokens (Studio platform tree — apply to all new/modified components in this phase)
**Source:** `apps/studio/app/(platform)/app/components/ui/Card.tsx`, `Badge.tsx`, `Button.tsx` (all read in full)
**Apply to:** `PlaceholderModule`, `Breadcrumbs`, catch-all route, all FORGE-01/FORGE-02 page edits
```
bg-background / bg-surface / bg-surface-elevated   (backgrounds)
text-text-primary / text-text-secondary / text-text-muted   (text)
border-border   (dividers/card borders)
text-primary-accent   (active states, links, primary CTA only — never decorative)
```
**Never** use shadcn's `text-foreground`/`text-muted-foreground` (scoped to `apps/studio/components/ui/*` lowercase, marketing/discovery tree only — confirmed by 01-UI-SPEC.md and RESEARCH.md's Anti-Pattern list).

### CerebroForge calling convention (apply to FORGE-01 gap-closing work only, not new architecture)
**Source:** `apps/studio/lib/forge/api-client.ts` lines 1-18 (read in full), `apps/studio/lib/forge/hooks.ts` (read in full, 201 lines)
```typescript
const BASE = process.env.NEXT_PUBLIC_FORGE_API_URL ?? 'http://localhost:4005';
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { 'Content-Type': 'application/json' }, ...init });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`forge-api ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}
```
Every `useForgeActions` action follows the same `try { setRunning(true); ... } catch (e) { setError(...) } finally { setRunning(false) }` shape (see `runPlanner`/`runRequirements`/`runArchitect`/`runTesting`/`runDeploy`/`runReview`/`runDocs`, lines 62-151 of `hooks.ts`) — any new/touched hook logic should match this shape exactly, not introduce a different error-handling convention. **No auth header is sent** (`request()` has no `Authorization`) — this is a known, accepted gap for this phase (D-04), do not silently add auth enforcement as a side effect of gap-closing work.

### Error banner + retry pattern (new standard this phase, apply to all 9 FORGE-01 pages)
**Source:** 01-UI-SPEC.md Component Contract §4, extending the existing pattern found in `requirements/page.tsx` lines 129-133
```tsx
<Card className="p-4 border-red-500/20 bg-red-500/5 flex items-start gap-3">
  <AlertTriangle size={16} className="text-red-400 shrink-0" />
  <div className="flex-1">
    <p className="text-sm text-red-400">{error}</p>
    <Button variant="ghost" size="sm" className="mt-2" onClick={/* re-invoke the specific failed action */}>Try again</Button>
  </div>
</Card>
```

### Placeholder/empty-state pattern (new this phase — single canonical component)
**Source:** `PlaceholderModule.tsx` (new, see Pattern Assignments above)
**Apply to:** catch-all route (62 currently-missing paths), all 10 FORGE-02 pages, Sidebar's orphaned-link fallback

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `scripts/audit-nav-routes.ts` | utility | batch | No existing route-audit/smoke-test script anywhere in the repo (confirmed — RESEARCH.md's Wave 0 Gaps list). Build from scratch: read `navigation/index.ts`'s exported groups, collect all `href` values, hit each against a running dev server or `next build`'s route manifest, assert 200/non-404 for every one. No structural precedent to copy; use Node's built-in `fetch` + the existing `navigation/index.ts` exports as the only inputs. |
| `tests/placeholder-module.test.tsx` | test | request-response (render) | No existing Vitest + React Testing Library component test found under `apps/studio` for the `app/(platform)/app/components/ui/` tree (confirmed — RESEARCH.md's Validation Architecture section: "No existing test file covers navigation/index.ts, Sidebar.tsx, or any forge/* page"). Use `vitest.config.ts`'s existing config and standard RTL `render()`/`screen.getByText()` assertions against `PlaceholderModule`'s locked copy strings (`"Not yet available"`, the `{group} / {title}` eyebrow, `"Status: Planned"`/`"Status: Disabled"`) — no in-repo precedent, follow Vitest/RTL defaults. |

## Metadata

**Analog search scope:** `apps/studio/app/(platform)/app/**`, `apps/studio/lib/forge/**`, `apps/studio/components/discovery/**`, `packages/db/prisma/schema.prisma`, `services/archive-api/package.json`, `services/archive-worker/package.json`
**Files scanned:** navigation/index.ts, Sidebar.tsx, Topbar.tsx, forge/requirements/page.tsx, forge/planner/page.tsx, forge/backend/page.tsx, evaluations/[view]/page.tsx, components/ui/Card.tsx, components/ui/Badge.tsx, components/ui/Button.tsx, lib/forge/api-client.ts, lib/forge/hooks.ts, packages/db/prisma/schema.prisma (Policy, Agent, Organization, OrgMembership models), services/archive-api/package.json, services/archive-worker/package.json (~16 files read in full or targeted excerpt)
**Pattern extraction date:** 2026-08-10
