# Phase 1: Schema & Navigation Foundation - Context

**Gathered:** 2026-08-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Close the schema/version unknowns that would otherwise blow up later phase sizing, and make every one of Studio's sidebar navigation destinations honest — either a real, functioning page or a clearly-labeled "not yet available" page. Zero 404s, zero dead links, zero silently-broken destinations.

**Scope was discovered to be significantly larger than originally captured in REQUIREMENTS.md.** The actual navigation registry (`apps/studio/app/(platform)/app/navigation/index.ts`) has **99 items across 14 groups**. REQUIREMENTS.md's NAV-01/NAV-02 only anticipated the 5 groups explicitly named in the milestone's original scope (Workspace, AI/partial, Solutions=Explore, Security=Governance, Talent OS — see Decisions below for the full reconciliation).

</domain>

<decisions>
## Implementation Decisions

### Navigation scope reconciliation (the primary decision this discussion produced)

- **D-01:** All 99 registered navigation destinations must resolve — zero 404s, phase-wide, not just within the 5 originally-scoped groups.
- **D-02:** **CerebroForge (19 items) gets real, functional implementation in this phase**, not a placeholder — because its backend (`services/forge-api`) is already operational (fixed and verified end-to-end this session: DB connection, full Prisma migration, `/health` and `/forge/projects` confirmed live).
- **D-03:** Verified against `services/forge-api/src/**/*.controller.ts` — exactly **9 of the 19** CerebroForge nav items have a real backend controller today:
  | Nav item | Backing controller |
  |---|---|
  | Forge Overview | `projects.controller.ts` (`forge/projects`) |
  | AI Planner | `planner.controller.ts` (`forge/projects/:id/plan`) |
  | Requirements Studio | `requirements.controller.ts` (`forge/projects/:id/requirements`) |
  | Architecture Studio | `architect.controller.ts` (`forge/projects/:id/architecture`) |
  | Code Generation | `codegen.controller.ts` (`forge/projects/:id/codegen`) |
  | Testing Intelligence | `testing.controller.ts` (`forge/projects/:id/testing`) |
  | AI Code Review | `review.controller.ts` (`forge/projects/:id/review`) |
  | Deployment Studio | `deploy.controller.ts` (`forge/projects/:id/deploy`) |
  | AI Documentation | `docs.controller.ts` (`forge/projects/:id/docs`) |

  The remaining 10 CerebroForge items (UI/UX Studio, Backend Studio, Database Studio, API Studio, Mobile Studio, Web Studio, Desktop Studio, CerebroBots, Repository Manager, Monitoring & Ops) have **no backend controller today** — these get the same honest-placeholder treatment as D-05 below, not fake functionality. Do not build new forge-api backend surface for these in this phase — that's CerebroForge's own future dedicated phase.
- **D-04:** Do not over-polish CerebroForge's 9 functional items to final-product quality in this phase. Goal is: correct routing, correct API connection to the existing forge-api controller, usable (not decorative) states. Deep UX polish, streaming responses, advanced editing, etc. belong to a future CerebroForge-specific phase.
- **D-05:** The remaining **8 previously-unscoped groups** — HiveOps (7), Infrastructure (9), Data (7), Automation (6), Research (5), Academy (5), Business (6), Support (5) = **50 items** — all get a standardized, registry-driven honest placeholder this phase. No functionality build for any of them.

### Placeholder architecture

- **D-06:** Placeholders are NOT one-off hardcoded pages. The navigation registry gains an `implementationStatus` field (e.g. `active | planned | disabled`) per item. A single shared route/component renders either the real module (status `active`) or a standardized "not yet available" page (status `planned`/`disabled`) driven by that same registry entry — one canonical schema, not per-page special-casing.
- **D-07:** The standardized placeholder page states the module name, the specific feature name, and its status (e.g. "Automation / Workflows — This module is part of the CerebroHive platform but is not enabled in this release. Status: Planned"). Never a bare blank screen, never fake data.
- **D-08:** Breadcrumbs and page titles should derive from the same navigation registry entry used for routing/status — one source of truth for nav, breadcrumbs, page titles, and (per the user's framing) future search/command-palette/telemetry integration, though only breadcrumbs/titles are in this phase's scope.
- **D-09:** Route identifiers in the registry should be stable — later phases (2-8) will build real functionality behind several of today's `planned` routes (Governance, Talent OS, Explore, etc.) without needing to rename the navigation tree.

### Schema gaps (SCHM-01) — verified directly against the live DB this session, not a gray area requiring further discussion

- **D-10:** `Policy` model exists in `packages/db/prisma/schema.prisma` but is a bare 3-field stub (`id`, `name`, `rules Json`) — no tenant/org scoping, no audit fields. Needs schema extension before Phase 5 (Governance) can build real CRUD against it. Confirming/closing this gap is this phase's job; building the extended Governance UI is Phase 5's.
- **D-11:** Talent OS (`Candidate`/`Assessment`/`HiringPipeline`/`Question`) and Explore (`Template`/`MarketplaceItem`/`IndustryPack`) have **zero** backing models — confirmed via direct `grep` against schema.prisma. This phase's job is confirming/documenting the gap (already done); actual schema design happens in Phase 5 (Talent OS)/Phase 7 (Explore) per the roadmap, matching SCHM-01's phrasing ("gaps are confirmed and closed before their phases are sized").

### Post-research amendments (2026-08-10, after 01-RESEARCH.md)

- **D-13:** `Sidebar.tsx` hand-picks only 8 of 14 nav groups by hardcoded title match — 6 groups (HiveOps, Automation, Research, Academy, Business, Support = 34 items) are unreachable from the UI even after routing/placeholders are fixed. In scope for this phase: fix `Sidebar.tsx` to render all 14 groups from `platformNavigation` (iterate, don't hand-pick), so NAV-01's "resolves to a real page" is actually reachable, not just resolvable-by-URL.
- **D-14:** Broken hardcoded links found outside the formal 99-item registry (e.g. `Sidebar.tsx`'s pinned-favorites pointing at nonexistent routes) are in scope too — same NAV-01 intent (zero dead links in the sidebar), not registry-only.
- **D-15:** `FORGE-02`'s "unbacked" pages are not blank stubs — several (e.g. `forge/backend/page.tsx`) render fabricated stats and fake interactive elements (e.g. a "Generate Backend" button wired to a `setTimeout`, not a real call). These need active removal of the fake behavior, not just a placeholder layered on top.
- **D-16:** `Policy`'s tenant scoping follows the **Organization** pattern (matches GOVN-01's "scoped per organization" wording and the newer Organization/billing subsystem), not the older Tenant→Workspace pattern used by Agent/Workflow.

### BullMQ version reconciliation (SCHM-02) — mechanical, Claude's discretion

- **D-12:** `services/archive-api` pins `bullmq@^6`, `services/archive-worker` pins `bullmq@^5`. Reconcile to a single major version (v6, matching archive-api and the more current major) before Phase 4 (Knowledge Hub) starts producer/consumer wiring. No user preference needed — straightforward dependency alignment.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Navigation
- `apps/studio/app/(platform)/app/navigation/index.ts` — the canonical navigation registry (99 items / 14 groups). Source of truth for every route this phase must make honest.

### CerebroForge backend (existing, working)
- `services/forge-api/src/projects/projects.controller.ts`
- `services/forge-api/src/planner/planner.controller.ts`
- `services/forge-api/src/requirements/requirements.controller.ts`
- `services/forge-api/src/architect/architect.controller.ts`
- `services/forge-api/src/codegen/codegen.controller.ts`
- `services/forge-api/src/testing/testing.controller.ts`
- `services/forge-api/src/review/review.controller.ts`
- `services/forge-api/src/deploy/deploy.controller.ts`
- `services/forge-api/src/docs/docs.controller.ts`

### Schema gaps
- `packages/db/prisma/schema.prisma` — `Policy` model (line ~1127, bare stub), confirmed absence of Talent OS/Explore models
- `services/archive-api/package.json`, `services/archive-worker/package.json` — BullMQ version mismatch (`^6` vs `^5`)

### Planning documents
- `.planning/PROJECT.md` — project context, core value, constraints
- `.planning/REQUIREMENTS.md` — v1 requirements (will need SCHM/NAV requirement wording amended to reflect D-01–D-11's expanded scope before/during planning)
- `.planning/ROADMAP.md` — Phase 1 goal and success criteria (will need success criteria amended to reflect the 99-item/CerebroForge decision)
- `.planning/research/SUMMARY.md`, `.planning/research/ARCHITECTURE.md` — prior milestone-level research (Architecture research already flagged `.planning/codebase/ARCHITECTURE.md`/`STRUCTURE.md` as stale in places — treat those two files with caution, prefer direct repo inspection)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/studio/app/(platform)/app/navigation/index.ts` — existing `NavGroup`/`NavItem` types; extend with `implementationStatus` rather than introducing a parallel structure.
- `services/forge-api` — 9 working NestJS controllers ready to wire directly (see D-03 table).

### Established Patterns
- No existing "coming soon" / empty-state component was found anywhere in `apps/studio/components/` — this phase introduces that pattern for the first time (D-06/D-07).
- `apps/studio/lib/navigation/registry.ts` also exists (87 lines) — smaller/older, not the file actually rendering the sidebar in the user's screenshots. Confirm during planning which file(s) the live sidebar actually imports from before editing, to avoid updating the wrong registry.

### Integration Points
- Sidebar rendering component(s) that consume `platformNavigation` (the exported array in `navigation/index.ts`) — planner should locate and confirm before adding `implementationStatus`-aware rendering logic.
- forge-api runs on port 4005 locally (per this session's `.env`-loading fix); confirm how `apps/studio` is expected to reach it (env var, proxy, or direct fetch) before wiring the 9 functional CerebroForge pages.

</code_context>

<specifics>
## Specific Ideas

- Placeholder copy pattern given verbatim by the user: `"{Module} / {Feature} — This module is part of the CerebroHive platform but is not enabled in this release. Status: Planned"`.
- Registry entry shape given as an example by the user (illustrative, not literal code to copy verbatim):
  ```ts
  { id: "automation.workflows", group: "automation", path: "/automation/workflows", implementationStatus: "planned" }
  { id: "forge.models", group: "cerebroforge", path: "/forge/models", implementationStatus: "active" }
  ```

</specifics>

<deferred>
## Deferred Ideas

- CerebroForge's remaining 10 unbacked nav items (UI/UX Studio, Backend Studio, Database Studio, API Studio, Mobile Studio, Web Studio, Desktop Studio, CerebroBots, Repository Manager, Monitoring & Ops) — real backend + functionality is a future CerebroForge-dedicated phase, not this one.
- Deep polish (streaming responses, advanced editing, analytics) for the 9 functional CerebroForge pages — future CerebroForge phase.
- Full functionality for the 8 newly-discovered placeholder groups (HiveOps, Infrastructure, Data, Automation, Research, Academy, Business, Support) — none of these have a milestone phase yet; would need their own future milestone/phase if ever prioritized.
- Registry-driven search/command-palette/telemetry integration — the user named this as a future payoff of the canonical schema, but it's explicitly out of this phase's scope (only breadcrumbs/titles are in-scope per D-08).

</deferred>

---

*Phase: 01-schema-navigation-foundation*
*Context gathered: 2026-08-10*
