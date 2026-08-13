# HivePulse UI Reference (external design spec, screen-level detail)

**Captured:** 2026-08-10
**Source:** User-supplied build spec + reference screenshot for "HivePulse" (this is Studio's own dashboard branding — the exact `apps/studio/app/(platform)/app/**` sidebar Phase 1 is working on, not a separate app).
**Status:** Reference material only — NOT an approved requirement or active scope. Do not implement directly.

## Why this is captured but not actioned

The source spec asks for a "centralized mock data layer" and "realistic mock datasets" across Organizations, Projects, Teams, AI Agents, AI Workflows, AI Models, etc. That directly conflicts with this project's core value (`PROJECT.md`): *"no fake/placeholder data in the final state, use honest empty states instead."* Building mock data here would reintroduce exactly what Phase 1 (FORGE-02, CLNP-01) exists to remove.

User decision (2026-08-10): keep the phased, real-data-only plan. This doc exists so the spec's genuinely useful **screen/layout/route design detail** isn't lost before Phases 2, 3, 4, and 6 reach their own `discuss-phase`/`ui-phase` passes — at which point pull from this doc, but wire every page to real Prisma data (or an honest empty state) instead of mock data.

## Visual language (already-established, not new — matches locked design system)

Dark-first, near-black background, thin cool-gray borders, white primary text, muted blue-gray secondary text, electric green primary action color, blue=informational, purple=AI/intelligence, amber=warnings, red=errors only, 10-16px radius, minimal shadows, dense but spacious. Positioned between Linear/Vercel/Datadog/Retool in feel. This matches the already-locked Studio design system (`app/(platform)/app/components/ui/`) — nothing new needed here, just confirms the existing direction is correct.

## Global page pattern (useful convention to adopt across Phases 2-4, 6)

Every feature page: Page Header (breadcrumb, title, description, primary CTA) → optional Metrics Row (3-5 KPI cards) → Primary Content (table/cards/graph/builder) → optional contextual right panel/drawer. Every major component needs populated/empty/loading/error/no-results states — this maps directly onto CLNP-02's three-state requirement, already in REQUIREMENTS.md.

## Screen-by-screen reference (route → real requirement mapping)

### Organizations, Projects, Teams — maps to Phase 2 (WKSP-01..05)
- `/organizations`, `/organizations/:id` (tabs: Overview/Members/Projects/AI Resources/Usage/Security/Billing/Settings)
- `/projects`, `/projects/:id` (tabs: Overview/Resources/Agents/Workflows/Knowledge/Models/Deployments/Activity/Settings)
- `/teams`, team detail (Members/Roles/Projects/Resources/Permissions/Activity)
- Metrics rows, table columns, and filter sets specified in the source spec are good starting points for Phase 2's UI-SPEC — replace every mock metric with a real Prisma aggregate query or an honest "—"/empty state.

### AI Overview, AI Studio, AI Agents, AI Workflows, AI Playground — maps to Phase 3 (AIST-01..03, WKFL-01/02)
- `/ai` overview: metrics (Active Agents, Successful Runs, Active Workflows, Knowledge Sources, AI Spend, Avg Latency) + time-range controls (24H/7D/30D/90D) — real versions of these need actual execution/cost tracking tables, which may not fully exist yet; flag as a Phase 3 research question, not an assumption.
- `/ai/studio`: node-based visual agent/workflow builder (palette → canvas → inspector → run/logs/trace/variables/evaluation panel). This is a substantial feature (React Flow-class UI) — Phase 3's `discuss-phase` should explicitly scope whether a full visual builder ships in v1 or a simpler form-based agent editor does, given AIST-01..03's actual wording is CRUD + model selection + playground run, not necessarily a drag-and-drop builder.
- `/ai/agents`, `/ai/agents/:id`: table/cards + detail tabs (Overview/Instructions/Tools/Knowledge/Memory/Runs/Evaluations/Observability/Security/Versions/Settings) — good reference for AIST-01's CRUD screen, scope down to what real data actually supports.
- `/ai/workflows`, `/ai/workflows/:id`: table + Builder/Runs/Analytics/Versions/Settings tabs — maps to WKFL-01/02, note current engine is agent-stage-only per earlier research.
- `/ai/playground`: chat/prompt interface + config panel (provider/model/temperature/etc.) + model comparison mode — maps to AIST-03's "run from a playground" requirement; model comparison and side-by-side scoring may be a differentiator beyond v1 scope.

### AI Models, Prompt Library — maps to Phase 3, deferred features (DEFR list)
- `/ai/models`: model registry/gateway across providers, routing rules — the "routing" concept (high-complexity → Claude/GPT, fast tasks → smaller model) matches `@cerebro/ai-gateway`'s existing `ModelRouter` — reuse it, don't rebuild.
- `/ai/prompts`: prompt library with versioning — not in current REQUIREMENTS.md; flag as a candidate v2 requirement (DEFR) unless the user wants it pulled into Phase 3.

### Knowledge Hub, Vector Store — maps to Phase 4 (KHUB-01..08)
- `/ai/knowledge`: sources (Drive/SharePoint/Notion/Confluence/etc.), ingestion status, RAG test interface ("Ask your knowledge base..." with sources/scores/trace) — Phase 4's actual scope is narrower for v1 (PDF + txt/md only, one ingestion pipeline via archive-worker, not a multi-connector hub) — this spec's connector breadth is a **v2+ differentiator**, not v1.
- `/ai/vector-store`: collection management + vector search tester — Phase 4 already specs Qdrant as the vector store (KHUB-04); this page is a reasonable Phase 4 UI target once real vectors exist (KHUB-08's search UI).

### Infrastructure — NOT in current milestone scope
- `/infrastructure`: service health, environment health, AI provider status, cost — this whole pillar has no REQUIREMENTS.md entry and no Prisma-backed data source identified. Per Phase 1's CONTEXT.md decisions (D-05), Infrastructure is one of the 8 placeholder-only groups this milestone — stays a placeholder unless a future milestone scopes it properly (would need its own schema-gap + requirements pass, same as Talent OS got in Phase 1).

### Talent OS — maps to Phase 6 (TALN-01..07), and Workspace items — maps to Phase 2
- The "workspace also" and "talent os and its subsets" follow-up messages point at the same Organizations/Projects/Teams (Phase 2) and Talent OS (Phase 6, already fully scoped with net-new schema requirements TALN-01..07) work already covered above — no new screens beyond what's already captured.

### Hive Assistant, Command Palette — cross-cutting, maps to CLNP-03
- Global AI assistant drawer + Cmd/Ctrl+K command palette — maps directly to CLNP-03 ("command palette, notifications... wired to real data/actions"), already in Phase 8 scope. Context-aware suggested actions per page is a nice-to-have; scope down if Phase 8 is tight on time.

## Reusable component list (worth adopting as a shared library across phases)

`PageHeader`, `MetricCard`, `StatusBadge`, `DataTable`, `SearchInput`, `FilterBar`, `EmptyState`, `SkeletonLoader`, `ErrorState`, `ActivityFeed`, `SidePanel`/`DetailDrawer`, `ConfirmDialog`, `ResourceCard`, `ModelBadge`, `ProviderBadge`, `UsageChart`, `RunStatus`, `CostDisplay`, `HealthIndicator`. Check `apps/studio/app/(platform)/app/components/ui/` for existing equivalents before building new ones — Phase 1's pattern-mapper already found `Card`/`Badge`/`Button`/`StatCard` there.

## Explicit scope warnings for future phase planning

1. **Do not build a mock data layer.** Every metric/table/detail view must query real Prisma data or render an honest empty/loading/error state (CLNP-02).
2. **AI Studio's visual node builder is a scope decision, not a given** — confirm with the user during Phase 3's `discuss-phase` whether v1 needs a full drag-and-drop canvas or a simpler form-based agent editor is sufficient.
3. **Infrastructure and the multi-connector Knowledge Hub breadth are out of current milestone scope** — don't silently expand Phase 4/placeholder groups without a new requirements pass, same discipline used for Phase 1's CerebroForge scope expansion.
