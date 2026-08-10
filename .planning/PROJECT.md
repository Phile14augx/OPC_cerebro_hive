# CerebroHive Studio — Dashboard Functional Program

## What This Is

CerebroHive is an Enterprise Intelligence Operating System (EIOS) — `apps/studio` is its Next.js front-end control panel, giving enterprise users a single surface to run AI agents/workflows, manage workspaces and knowledge, review governance/compliance, and operate Talent OS and marketplace features. The backend (Prisma-modeled Postgres, `forge-api`, `archive-api`, `platform-api`, and supporting packages) is substantially real, but much of Studio's UI is still dummy content, dead buttons, or 404 routes layered on top of it.

## Core Value

Every page a user can navigate to in Studio must render real content wired to the actual backend/data model, or an honest empty state — never a fake number, a dead link, or a blank stub.

## Requirements

### Validated

- ✓ Monorepo dev pipeline (turbo + pnpm workspaces) runs cleanly across all 6 Next.js apps + archive-api + platform-api + forge-api — existing
- ✓ Prisma schema (`packages/db`) models the core domain: Tenant/Workspace/User, Agent/AgentVersion/AgentExecution, Workflow/WorkflowExecution, Metric/Alert/HealthCheck/Incident, Organization/billing, ArchiveDocument* (RAG/knowledge pipeline), prompts/eval — existing, migrated and verified against a live local DB this session
- ✓ `forge-api` (NestJS) — agent orchestration/codegen backend, connects to the DB correctly (this session's fix) — existing
- ✓ `archive-api` (Fastify) — document upload/archive service scaffold — existing
- ✓ `platform-api` (Fastify) — core platform backend — existing
- ✓ Studio sidebar navigation structure (`apps/studio/app/(platform)/app/navigation/index.ts`) defines the full intended IA across Core Workspace, Core AI, Governance, Talent OS, and Explore pillars — existing, 8 href-mismatch bugs fixed this session, ~60 destinations still have no backing page

### Active

- [ ] Every sidebar navigation destination resolves to a real page (zero 404s)
- [ ] Core Workspace: Organizations, Projects, Teams have real CRUD backed by the existing Prisma schema
- [ ] Core AI: AI Studio (agent CRUD, model/provider selection, test/run), Workflows (list/create/run/execution history), Knowledge Hub (real document ingestion: archive-api upload-complete wiring + archive-worker BullMQ consumer — extract/chunk/embed via Gemini, entity extraction/auto-tagging via Claude, vectors in Qdrant)
- [ ] Governance: Compliance and Policies pages backed by real data
- [ ] Talent OS: Hiring Pipeline, Candidates, Assessments, Assessment Builder, Question Bank
- [ ] Explore: Marketplace, Templates, Industry Packs, Quantiva ERP, Custom Solutions
- [ ] Dashboard-wide cleanup: hardcoded/fake metrics, activity streams, and system-status numbers replaced with real data or honest empty states
- [ ] Header/command controls wired: command input, suggestion buttons, search, command palette, notifications, org switcher
- [ ] Full program verification: lint/typecheck/test/build clean

### Out of Scope

- Redesigning the existing UI/visual system — connect existing screens to real data, don't restyle them
- Inventing new data models where the Prisma schema already has a fitting one (e.g. Archive* models for Knowledge Hub) — extend, don't duplicate
- Building bespoke ingestion infra when `archive-api`/`archive-worker` already own that responsibility — wire into it, don't replace it

## Context

- Large pre-existing monorepo, not greenfield. `.planning/codebase/` holds a prior codebase-mapping pass (ARCHITECTURE.md, STACK.md, STRUCTURE.md, CONVENTIONS.md, INTEGRATIONS.md, TESTING.md, CONCERNS.md) — reuse it, don't re-discover.
- Earlier this session: fixed the whole local dev pipeline (turbo concurrency, gray-matter patch, port renumbering across ~7 services onto 3400-3407, Fastify plugin version bumps, forge-api tsconfig/env-loading, packages/db/workflow/ai build output, Prisma schema extensions + migration debt, 8 studio nav href fixes, .gitignore fixes). All committed and pushed to `main`.
- The archive-worker BullMQ ingestion pipeline design was drafted earlier this session: DOWNLOAD → EXTRACT → CHUNK → EMBED → ENTITIES → TAGS → COMPLETE staged consumer, Gemini for embeddings, Claude for entity/tag extraction, PDF + txt/md support for v1, auto-apply unapproved tags. Needs formal approval as part of this milestone's roadmap (Knowledge Hub phase).
- Real repo root is `d:\{MY_PROJECTS}\{OPC_cerebro_hive}` (one level above this `OPC/cerebro-hive-website` working directory) — the git worktree and all commits track there.

## Constraints

- **Tech stack**: Next.js App Router (Studio), NestJS (forge-api), Fastify (archive-api, platform-api), Prisma 7 with driver adapters over Postgres — stay within the existing stack, no new frameworks.
- **Data model**: Prisma schema already has rich models for most of this scope (Organization, ArchiveDocument*, Agent*, Workflow*, Metric/Alert/HealthCheck/Incident) — extend the schema only where a genuine gap exists, don't duplicate.
- **No fake data**: every requirement in this milestone is written against "real or honestly empty," never placeholder/mock content in the shipped state.
- **Existing visual system**: Studio's component/design system is locked — this program is a wiring/backend-integration effort, not a redesign.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Reuse `.planning/codebase/` mapping instead of re-mapping | Prior pass already covers architecture/stack/structure/conventions for this large monorepo | ✓ Good |
| Archive-worker pipeline: Gemini for embeddings, Claude for entity/tag extraction, PDF+txt/md v1 scope | Matches available provider integrations and keeps v1 scope shippable | — Pending |
| Program phased in dependency order (nav → workspace → AI/knowledge → governance → talent → explore → cleanup → verification) | Later pillars depend on workspace/org primitives existing first | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-09 after initialization*
