# Project Research Summary

**Project:** CerebroHive Studio — Dashboard Functional Program (mock-to-real retrofit milestone)
**Domain:** Enterprise AI-Ops / EIOS dashboard — document ingestion pipeline (BullMQ + Gemini + Claude + Qdrant), multi-tenant admin CRUD (Core Workspace, Governance, Talent OS, Explore), command palette, wired into an existing large Next.js/NestJS/Fastify/Prisma monorepo
**Researched:** 2026-08-09
**Confidence:** HIGH (stack and architecture verified by direct repo/npm-registry inspection; features and pitfalls verified against real comparable products and this repo's actual schema)

## Executive Summary

This is not a greenfield product build — it's a **wiring/integration milestone** on top of a large, mostly-real monorepo where roughly 60 Next.js pages currently render mock data, dead buttons, or 404 routes. The core job across all five pillars (Core Workspace, Core AI, Governance, Talent OS, Explore) is to connect existing (or newly-scoped) Prisma models and backend services to real UI, and to build one genuinely net-new subsystem from scratch: the `services/archive-worker` BullMQ ingestion pipeline (DOWNLOAD→EXTRACT→CHUNK→EMBED→ENTITIES→TAGS→COMPLETE) that powers Knowledge Hub's document upload and semantic search. Most of the required infrastructure — BullMQ, Redis, Qdrant client, the `@cerebro/ai-gateway` Claude wrapper, React Query, Radix, react-hook-form — already exists elsewhere in the monorepo and should be reused, not reinvented; the stack research explicitly flags several "don't re-add this" traps (raw `@anthropic-ai/sdk`, `pdf-parse`, `react-beautiful-dnd`, LangChain's full package, a second in-process BullMQ worker).

The recommended approach follows a strict dependency order: **Core Workspace first** (Organization/Project/Team CRUD via direct Prisma, since nearly every other domain model is scoped by tenant/workspace), **then Core AI/Knowledge Hub** (archive-api DB+queue wiring, then archive-worker built from scratch, then the UI connected last), **then Governance/Talent OS/Explore** in parallel-capable order once workspace scoping exists, with **dashboard-wide fake-metric cleanup trailing each area**, not run as a single global pass. Two pillars carry a hidden scope trap the roadmap must account for: Talent OS has **zero existing data model** (Candidate/Assessment/HiringPipeline/Question don't exist in Prisma yet — this is schema design, not wiring), and Governance/Explore likely have the same gap (no Policy or Template/MarketplaceItem model confirmed in the schema) and need a pre-roadmap schema check.

The biggest risks are systemic, not feature-specific: (1) tenant isolation is enforced only by app-level `where: tenantId` filters with **no Postgres RLS backstop**, so a single missed filter on any new CRUD screen is a silent cross-tenant data leak; (2) the ingestion pipeline writes to two independent stores (Postgres + Qdrant) with no transaction spanning them, so partial job failures will silently orphan data unless idempotency and reconciliation are designed in from the first stage contract, not patched in later; (3) "no fake data" is easy to satisfy shallowly (empty arrays) while missing the loading/error/empty three-state distinction that only becomes visible once real latency and real failures replace instant mocks; and (4) mock data hides in API route handlers (not just page components) — every phase must audit `apps/studio/app/api/**/route.ts`, not just `.tsx` files, as part of its own definition of done.

## Key Findings

### Recommended Stack

The monorepo already has BullMQ, ioredis, Qdrant client, zod, React Query, Radix, and lucide-react in place — reuse all of them rather than adding parallel dependencies. Net-new additions are narrowly scoped: a Gemini SDK for embeddings, a container-safe PDF text extractor, a command palette primitive, and headless table/drag-and-drop libraries for Studio's admin UI. All version choices below were verified live against npm registry and this repo's actual `package.json` files, not training data.

**Core technologies:**
- `@google/genai ^2.16.0` — Gemini client for the EMBED stage — current official unified SDK, actively maintained; pin below 3.0.0 (Node 22+ line) until it's more field-tested.
- `unpdf ^1.8.0` — PDF text extraction for the EXTRACT stage — zero native dependencies, avoids the `pdf-parse` native-`canvas` crash risk in Docker/containerized deploys.
- `@qdrant/js-client-rest ^1.19.0` — vector storage — add to `archive-worker` at the exact same version already used by `archive-api` to avoid REST API-shape drift.
- `@cerebro/ai-gateway` (workspace dependency) — Claude calls for ENTITIES/TAGS stage — already wraps `@anthropic-ai/sdk` with circuit breaker, rate limiting, caching, cost tracking; do not add a second raw Anthropic SDK install.
- `cmdk ^1.1.1` — command palette — de facto standard (Linear/Vercel/Raycast/shadcn), composes with the Radix Dialog already in Studio; peer deps confirmed React 19-compatible.
- `react-hook-form ^7.85.0` + `@hookform/resolvers ^5.7.1` — forms (Assessment Builder, Candidate forms) — matches the pattern already used in sibling apps (`archive-portal`, `platform`, `pulse`); not yet in `apps/studio`, needs adding.
- `@tanstack/react-table ^8.21.3` (deliberately not v9, which is only days old at research time) — headless tables for Candidates, Question Bank, Assessments lists.
- `@dnd-kit/core`/`sortable`/`utilities` — Hiring Pipeline kanban and reorderable question lists — actively maintained, React-19-safe; avoid deprecated `react-beautiful-dnd`.
- Hand-rolled recursive character chunker for the CHUNK stage — avoid pulling in full LangChain for one utility function.

Full installation commands, env var additions (`GEMINI_API_KEY`, `QDRANT_URL`, `QDRANT_COLLECTION`), and a "what not to use" table are in `STACK.md`.

### Expected Features

This milestone's feature bar is deliberately narrower than a greenfield product spec: "table stakes" here means both (a) universal in comparable production tools AND (b) achievable by wiring existing schema/services rather than inventing new subsystems.

**Must have (table stakes) — this milestone's definition of done:**
- Core Workspace: Org/Project/Team CRUD with real data, member management, honest empty states, workspace switcher.
- Core AI/AI Studio: Agent CRUD, model/provider picker (via `@cerebro/ai-gateway`), test/run playground.
- Core AI/Workflows: list/create (agent-stage-only, matching current engine capability)/run/execution history.
- Core AI/Knowledge Hub: real upload/ingestion status pipeline + basic semantic search once vectors exist.
- Governance: Policies list/detail with real data (schema existence to be confirmed) + honest compliance status (never a fabricated percentage).
- Talent OS: Candidates + Hiring Pipeline (stage-based, drag-and-drop optional) + Question Bank + Assessment Builder + Assessments — all real CRUD, all net-new schema.
- Explore: Template/Marketplace catalog with a real "instantiate into my workspace" action (this is what makes it non-fake) + Industry Packs as a taxonomy/filter, not a separate entity.
- Zero 404s on any sidebar nav destination; header controls (org switcher, search, command palette) wired to real data.

**Should have (competitive, can slip to next milestone):** RBAC permission matrix UI, audit log of org/team changes, agent version diffing/comparison, streaming playground responses, workflow visual DAG builder, policy acknowledgment/attestation workflow, structured interview kits/scorecards, template ratings/usage counts.

**Defer (v2+ / explicitly anti-features for this milestone):** SSO/SCIM, custom org branding, billing CRUD, multi-framework GRC compliance mapping (SOC2/ISO27001), candidate self-service portal, two-sided marketplace with payments, real-time collaborative editing, AI-based candidate/resume scoring, building a new workflow engine beyond agent-only stages.

Feature dependency chain (from FEATURES.md): Core Workspace → everything else (workspace scoping); AI Studio → Workflows (agent-only engine); Knowledge Hub ingestion → Knowledge Hub search (cannot search zero real vectors); Explore → Core AI (templates must instantiate real agents/workflows or Explore is just another dead-button page); Talent OS is architecturally independent of Core AI/Governance and can be parallelized once Core Workspace lands.

### Architecture Approach

The system is a producer/consumer split: `archive-api` (Fastify) owns document/version row creation and BullMQ job enqueue; `archive-worker` (currently an empty scaffold — package.json only, no `src/`) consumes the queue and runs all seven pipeline stages, writing progress directly to Postgres via the shared `@cerebro/db` Prisma singleton (no HTTP callback to archive-api — this repo's established convention is direct-Prisma writes from the owning service, not cross-service REST for status). In `apps/studio`, two coexisting, both-legitimate data-fetching patterns already exist and must be chosen per-domain, not invented anew: Pattern 1 (Server Action → `fetch()` a dedicated backend service, reference: `app/actions/archive.ts`) for domains owned by a separate deployable service, and Pattern 2 (direct Prisma via `@cerebro/db` in a `lib/<domain>/services/*Service.ts` class, reference: `AssessmentService.ts`) for domains with no dedicated backend. Progress polling for ingestion status should use React Query's `refetchInterval`, not SSE/WebSockets — no real-time push infra exists for archive-api/worker (only `forge-api` has that, via NATS, for a different purpose), and building it now is out of scope.

**Major components:**
1. `services/archive-api` (Fastify) — REST surface for upload/list/search; must be fixed to actually create `ArchiveDocument`/`ArchiveDocumentVersion` rows and call `getIngestionQueue().add()` (both currently stubbed/unused).
2. `services/archive-worker` (BullMQ Worker, from-scratch build) — runs the 7-stage pipeline, needs `@cerebro/db` added as a dependency (currently missing), mirrors `archive-api/src/`'s directory conventions with a new `stages/` folder.
3. `packages/db` — single shared Prisma singleton every service should depend on directly for Postgres access; the load-bearing convention across the whole repo.
4. `apps/studio` (Server Actions + UI layers) — thin presentation layer; must pick Pattern 1 vs Pattern 2 per domain and never restyle the existing (locked) visual system.

Two important corrections surfaced during this research: prior codebase docs (`.planning/codebase/ARCHITECTURE.md`, dated 5 days earlier) are stale/inaccurate outside the `platform-api` DDD/CQRS layer — this repo has `packages/db` not `packages/database`, and `archive-api`/`archive-worker` live under `services/`, not `apps/`, among other drift. Also, `bullmq` versions are mismatched between `archive-api` (`^6`) and `archive-worker` (`^5`) and should be reconciled as a first step before wiring the producer/consumer.

### Critical Pitfalls

1. **Mock data hides in API route handlers, not just UI components** — teams "de-mock" `.tsx` files but leave `apps/studio/app/api/**/route.ts` returning hardcoded JSON (confirmed instances already exist: `enterprise/employees/route.ts`, `tickets/route.ts`). Every phase must trace page → fetch → route → Prisma → DB for its own requirements, not defer discovery to a final cleanup pass.
2. **Tenant isolation has no DB-level backstop** — every tenant-scoped model relies entirely on app-code `where: tenantId` filters with zero Postgres RLS. A single missed filter (or a `findUnique` instead of `findFirst` with tenantId) silently leaks cross-tenant data. Prevention: build one centralized tenant-scoping helper in the Core Workspace phase and reuse it everywhere; add a two-tenant leak test to every CRUD phase's definition of done.
3. **Postgres/Qdrant drift from non-transactional dual writes** — BullMQ's at-least-once retry semantics plus two independent stores (chunk metadata in Postgres, vectors in Qdrant) means partial failures orphan data by default. Prevention: use `embeddingStatus` as source of truth, mark `EMBEDDED` only after Qdrant upsert confirms, use the chunk's Postgres UUID as the Qdrant point ID for idempotent overwrite-on-retry, add a reconciliation job.
4. **Non-idempotent retries re-call paid Gemini/Claude APIs** — a partial-failure retry without a check-before-call guard silently multiplies AI spend. Prevention: check status field before calling, persist API response atomically with the status advance, use BullMQ `jobId` dedup.
5. **Talent OS is greenfield schema design disguised as wiring** — no Candidate/Assessment/HiringPipeline/Question model exists anywhere in the current Prisma schema (unlike every other pillar). If estimated like a wiring phase, this causes mid-phase scope surprise and rushed, compliance-weak schema design (compounds with EEOC adverse-impact risk if any auto-scoring/filtering ships without a human-in-the-loop gate).

Additional pitfalls documented in PITFALLS.md worth flagging to the roadmap: Qdrant multitenancy must use one shared collection with a tenant payload filter (not collection-per-tenant, which Qdrant Cloud caps at 1000); ingested documents are untrusted input and can prompt-inject Claude's entity/tag extraction (keep `source: AUTO` unapproved until human review, especially for anything ACL-adjacent); and "honest empty state" must be implemented as three distinct states (loading/empty/error), not a bare empty array — mock data never exercises the pending/error branches, so this gap is invisible until real latency/failures replace it.

## Implications for Roadmap

Based on combined research, suggested phase structure (dependency-ordered, matching the build-order already logged as a Key Decision in PROJECT.md: "nav → workspace → AI/knowledge → governance → talent → explore → cleanup → verification"):

### Phase 0: Pre-Roadmap Schema & Version Reconciliation
**Rationale:** Both FEATURES.md and PITFALLS.md independently flag that Governance (Policy), Explore (Template/MarketplaceItem), and Talent OS (Candidate/Assessment/HiringPipeline/Question) have unconfirmed or confirmed-absent Prisma models — this materially changes those phases from "wiring" (cheap) to "schema design + wiring" (expensive) and must be known before phase sizing, not discovered mid-phase. Also reconcile the `bullmq` v5/v6 mismatch between archive-worker and archive-api before any producer/consumer code is written.
**Delivers:** Confirmed schema-existence map for all five pillars; single BullMQ major version pinned across both services.
**Avoids:** Pitfall 8 (Talent OS schema-design-as-wiring surprise) and the Governance/Explore analogue.

### Phase 1: Core Workspace (Organizations, Projects, Teams)
**Rationale:** Nearly every other domain model (Agent, Workflow, ArchiveDocument, and likely Policy/Candidate/Template once designed) is scoped by tenant/workspace/org — building anything else against a fake or unwired workspace concept produces pages that are locally "real" but contextually meaningless.
**Delivers:** Org/Project/Team CRUD (Pattern 2, direct Prisma via `lib/<domain>/services/*Service.ts`), member management, workspace switcher, honest empty states.
**Addresses:** Core Workspace table-stakes features from FEATURES.md.
**Avoids:** Pitfall 2 (tenant isolation) — this phase must establish the shared tenant-scoping helper used by every subsequent CRUD phase.

### Phase 2: Core AI — AI Studio + Workflows
**Rationale:** Workflow stages are currently agent-only per the documented engine limitation; Workflow CRUD is meaningless without real Agent CRUD to reference first.
**Delivers:** Agent CRUD + model/provider picker (via `@cerebro/ai-gateway`) + test/run playground; Workflow list/create/run/execution history scoped to agent-only stages.
**Uses:** `@cerebro/ai-gateway`, `@tanstack/react-query` polling pattern.
**Implements:** Pattern 1 (Server Action → forge-api/platform-api fetch).

### Phase 3: Core AI — Knowledge Hub (Ingestion Pipeline + Search)
**Rationale:** This is the single largest net-new build in the milestone (archive-worker has zero `src/` today) and has the most systemic pitfalls (tenant-scoped vector search, dual-write drift, non-idempotent paid API retries, prompt injection). Must land archive-api DB/queue wiring and archive-worker together before the UI is connected — the UI's server actions already exist correctly and are just waiting on a real backend.
**Delivers:** Real document upload → DOWNLOAD→EXTRACT→CHUNK→EMBED→ENTITIES→TAGS→COMPLETE pipeline with visible per-stage/FAILED status; basic semantic search once vectors exist.
**Uses:** `@google/genai`, `unpdf`, `@qdrant/js-client-rest`, `@cerebro/ai-gateway`, `@bull-board` (recommended for ops visibility).
**Avoids:** Pitfalls 3, 4, 5, 6, 7 (Postgres/Qdrant drift, non-idempotent retries, silent dead-letter jobs, Qdrant multitenancy, prompt injection) — all explicitly scoped to this phase by PITFALLS.md's own phase mapping.

### Phase 4: Governance (Policies/Compliance)
**Rationale:** Independent of Core AI/Talent OS; only hard dependency is Core Workspace (policies scoped per org). Schema-existence confirmed in Phase 0 determines whether this is pure wiring or wiring + schema extension.
**Delivers:** Policy list/detail with real data, honest compliance status (real counts, not fabricated percentages).
**Addresses:** Governance table-stakes from FEATURES.md; defers acknowledgment workflows, audit-log viewer, and all multi-framework GRC mapping.

### Phase 5: Talent OS (Candidates, Hiring Pipeline, Assessments, Assessment Builder, Question Bank)
**Rationale:** Architecturally independent of Core AI/Knowledge Hub/Governance (no shared services beyond base workspace/auth per ARCHITECTURE.md) — can be parallelized against Phases 2-4 by a separate workstream once Phase 1 lands, but must budget schema design as an explicit first step, not fold it into CRUD-screen estimation.
**Delivers:** Candidate/Assessment/HiringPipeline/Question Prisma models with tenant scoping + audit trail from day one; Question Bank → Assessment Builder → Assessments (in that dependency order); stage-based Hiring Pipeline (drag-and-drop optional, given the no-redesign constraint).
**Avoids:** Pitfalls 8 and 9 (greenfield-schema-as-wiring surprise, EEOC adverse-impact exposure) — any scoring/auto-filter feature requires an explicit human-in-the-loop gate; no protected-class-adjacent signal as scoring input.

### Phase 6: Explore (Marketplace, Templates, Industry Packs, Custom Solutions)
**Rationale:** Requires Core AI (AI Studio + Workflows) to be functional first — "Use this template" is meaningless until Agent/Workflow CRUD is real; building Explore earlier risks it becoming another dead-button page, the exact anti-pattern this program exists to eliminate.
**Delivers:** Template/Marketplace catalog with a real "instantiate into my workspace" action; Industry Packs as a taxonomy/filter of the same catalog, not a separate entity; Quantiva ERP scope clarified (currently a one-line mention with no other context — treat as placeholder-to-real-page at minimum, flag for scoping, do not assume full ERP integration).

### Phase 7: Dashboard-Wide Cleanup + Verification
**Rationale:** Fake-metric cleanup should trail each area's real-data wiring, not run as one global final pass — you can't remove a fake metric until the real metric source exists. This phase catches stragglers (route handlers, remaining hardcoded arrays) and performs the cross-cutting verification pass.
**Delivers:** Zero remaining hardcoded/mock data anywhere in `apps/studio` (pages and API routes); loading/empty/error three-state audit across every converted screen; a full "fresh tenant, zero data" pass across the whole app; two-tenant cross-leak test repeated across every CRUD phase's models.
**Avoids:** Pitfall 1 (route-handler mocks) and Pitfall 10 (bare-empty-array-as-fake-honesty) — both are explicitly named as things this phase should *audit*, not *first-discover*.

### Phase Ordering Rationale

- **Workspace-first ordering** is directly supported by both ARCHITECTURE.md's "Build Order Implications" section and PROJECT.md's own logged Key Decision — every other domain model attaches to Tenant/Workspace/Organization.
- **Knowledge Hub sequenced as its own phase, not bundled into "Core AI"** because it is architecturally and risk-wise a different beast: it's the only flow crossing a message queue, the only net-new backend service in this milestone, and carries 5 of the 10 pitfalls identified in PITFALLS.md.
- **Talent OS flagged as parallelizable** because FEATURES.md and ARCHITECTURE.md both independently confirm no shared services with Core AI/Governance beyond the base workspace/auth model — a separate workstream could run it alongside Phases 2-4 once Phase 1 lands, if the roadmap wants to compress the timeline.
- **Explore sequenced last among the feature pillars** because its core "makes it real" mechanic (template → real Agent/Workflow instantiation) has a hard functional dependency on Core AI being complete, not just Core Workspace.
- **Cleanup/verification trailing, not parallel, per area** avoids the trap (Pitfall 10) of deleting mock arrays without replacing them with proper loading/error states — cheapest to get right at construction time per PITFALLS.md, so cleanup is really an audit pass, not first-pass remediation.

### Research Flags

Phases likely needing deeper research during planning (`/gsd:plan-phase --research-phase <N>`):
- **Phase 3 (Knowledge Hub):** Highest complexity and highest pitfall density — idempotency design, Qdrant multitenancy payload strategy, Claude prompt-injection mitigation, and failure-path UX all need phase-specific design decisions before implementation, not just wiring.
- **Phase 5 (Talent OS):** Genuinely greenfield schema design with EEOC/adverse-impact and PII-handling implications that this research could only flag, not resolve — needs a dedicated design pass for the hiring-pipeline state machine, PII classification, and RBAC before CRUD screens are built.
- **Phase 4 (Governance) and Phase 6 (Explore):** Contingent on Phase 0's schema-existence findings — if models don't exist, these phases inherit some of the same "schema design first" research need as Talent OS, just smaller in scope.
- **Phase 2 (Workflows specifically):** No typed client exists yet for `forge-api` (unlike `platform-api`'s `EngineeringReviewClient`) — worth a short research pass on whether to hand-roll fetch (fast) or invest in a typed client package (more consistent with repo convention) before committing to a pattern.

Phases with standard, well-documented patterns (research-phase can likely be skipped):
- **Phase 1 (Core Workspace):** Direct-Prisma CRUD pattern (Pattern 2) already has a reference implementation (`AssessmentService.ts`) in the repo — low ambiguity.
- **Phase 7 (Cleanup/Verification):** Checklist-driven audit work (route-handler trace, three-state UI check, two-tenant leak test) rather than novel design — PITFALLS.md's "Looks Done But Isn't" checklist is directly actionable as-is.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified live against this repo's actual `package.json` files and the npm registry directly (not training data); every version claim is registry-ground-truth as of research date. |
| Features | MEDIUM | Feature landscape verified against real comparable products (LangSmith, Vellum, Greenhouse/Lever, Vanta/Drata, n8n) across multiple independent sources, but exact CerebroHive backend capability per feature (especially Governance/Talent OS/Explore schema existence) was not independently re-verified beyond ARCHITECTURE.md/PROJECT.md — flagged explicitly as a gap. |
| Architecture | HIGH | All findings grounded in direct inspection of the live repo's source files (not the stale prior codebase docs, which this research explicitly corrects), including reading actual route handlers, service files, and Prisma schema. |
| Pitfalls | HIGH (repo-grounded) / MEDIUM-HIGH (external ecosystem patterns) | Tenant isolation, schema gaps, and mock-data patterns are grounded in this repo's actual `schema.prisma` and route handlers; BullMQ/Qdrant/Gemini/Claude/EEOC patterns are grounded in official docs and multiple independent sources but are general ecosystem guidance, not repo-specific verification. |

**Overall confidence:** HIGH — the two research files with the highest downstream risk (Stack, Architecture) are both grounded in direct, current repo/registry inspection rather than inference, and Pitfalls' most consequential findings (tenant isolation gap, Talent OS schema absence, mock-in-route-handlers) are similarly repo-grounded, not speculative.

### Gaps to Address

- **Policy/Compliance, Template/MarketplaceItem, and Candidate/Assessment/HiringPipeline/Question schema existence is unconfirmed for three of five pillars.** This is the single biggest open question surfaced by this research — it directly changes Governance and Explore (and confirms for Talent OS) from "wire existing schema" to "design schema, then wire," which materially changes phase sizing. Recommend a fast pre-roadmap check of `packages/db/prisma/schema.prisma` for these three areas specifically (folded into suggested Phase 0 above).
- **"Quantiva ERP" is named once in PROJECT.md's Active scope with zero other context anywhere in the read research or architecture documents.** Its expected functionality is unknown — could mean anything from a placeholder page to a full ERP integration. Flag explicitly for the requirements/roadmap phase rather than guessing at scope.
- **`InMemoryExecutionRepository` persistence limitation** (execution history is process-lifetime only) has a PR reportedly in progress on a `hiveforge` branch per ARCHITECTURE.md/CONCERNS.md. Roadmap should confirm whether that PR has landed before committing to "execution history" as a table-stakes AI Studio/Workflows feature — if not landed, this needs to be surfaced as an explicit, honest caveat in the UI rather than presented as durable history.
- **No typed client exists for `forge-api`** the way `platform-api` has `EngineeringReviewClient` — decide per-phase (flagged for Phase 2) whether to hand-roll fetch or invest in a typed client package.
- **BullMQ major-version mismatch** between `archive-api` (`^6`) and `archive-worker` (`^5`) needs reconciliation before producer/consumer code is written — small fix, but must not be discovered mid-implementation.

## Sources

### Primary (HIGH confidence)
- Direct repo inspection (2026-08-09): `services/archive-worker/package.json` + `src/` (empty scaffold), `services/archive-api/package.json` + `src/routes/upload.route.ts` + `src/services/{queue,storage,qdrant}.service.ts`, `packages/ai-gateway/src/{index,gateway}.ts`, `apps/studio/package.json`, `apps/{archive-portal,platform,pulse}/package.json`, `packages/db/prisma/schema.prisma`, `apps/studio/lib/prisma.ts`, `apps/studio/app/actions/archive.ts`, `apps/studio/lib/talent/services/AssessmentService.ts`, `apps/studio/lib/queue/{client,worker}.ts`, `apps/studio/app/(platform)/archive/documents/page.tsx`, `apps/studio/app/api/{v1/talent/metrics,enterprise/employees,tickets}/route.ts`, `services/forge-api/src/streaming/events.controller.ts`, `.env.example`.
- npm registry API (`registry.npmjs.org`), queried directly for exact version/peer-dependency data on `@google/genai`, `unpdf`, `cmdk`, `@tanstack/react-table`, `@hookform/resolvers`, `react-hook-form`, `@dnd-kit/*`.
- `.planning/PROJECT.md` (this repo) — milestone scope, requirements, prior decisions.
- `.planning/codebase/CONCERNS.md` — documented pre-existing risk (`InMemoryExecutionRepository`, sparse test coverage, unimplemented providers).
- BullMQ, Qdrant, Gemini, Claude official docs — retrying/idempotency, multitenancy, rate limits, `tool_choice`/refusal handling.

### Secondary (MEDIUM confidence)
- LangSmith, Vellum, Greenhouse/Lever/Ashby comparison articles, GRC tooling overviews (Sprinto, HackerNoon), n8n template marketplace docs — feature-landscape patterns, cross-referenced across multiple independent sources for consistency.
- EEOC/adverse-impact and ATS-bias sources (four-fifths rule, keyword-screening bias) — external HR-compliance guidance, not repo-specific.

### Tertiary (LOW confidence, flagged for validation)
- GitHub issue threads on `cmdk`/React 19 TypeScript friction — superseded by direct npm registry peer-dependency verification but kept for context; recommend a spike before committing UI time.

---
*Research completed: 2026-08-09*
*Ready for roadmap: yes*
