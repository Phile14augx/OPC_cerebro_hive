# Roadmap: CerebroHive Studio — Dashboard Functional Program

## Overview

This milestone converts Studio from a mostly-mocked front end into a fully wired application: every sidebar destination resolves to something honest, and the five feature pillars (Core Workspace, Core AI, Governance, Talent OS, Explore) run on real Prisma data instead of dummy content. The journey starts by closing schema/version unknowns and nav-integrity gaps (Phase 1), then builds strictly in dependency order — workspace primitives everything else attaches to (Phase 2), AI Studio/Workflows (Phase 3), the from-scratch Knowledge Hub ingestion pipeline (Phase 4), Governance (Phase 5), the greenfield-schema Talent OS (Phase 6), and Explore last since its core "instantiate a template" mechanic needs real Agents/Workflows to point at (Phase 7) — and closes with a trailing cleanup and whole-program verification pass (Phase 8) that removes remaining mock data and proves tenant isolation and build health.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Schema & Navigation Foundation** - Close schema/version unknowns and make every one of the navigation registry's 99 destinations honest (real page, or clear "not yet available") before later phases are sized; CerebroForge's 9 backend-backed items get real functionality
- [ ] **Phase 2: Core Workspace** - Real, tenant-scoped Organization/Project/Team CRUD and workspace switching that every later pillar attaches to
- [ ] **Phase 3: Core AI — AI Studio + Workflows** - Real Agent CRUD with model/provider selection and playground testing, plus agent-only Workflows with real execution history
- [ ] **Phase 4: Core AI — Knowledge Hub** - From-scratch, idempotent document ingestion pipeline (upload → extract → chunk → embed → entities/tags) and tenant-scoped semantic search
- [ ] **Phase 5: Governance** - Real, org-scoped Policy management and honest (non-fabricated) compliance status
- [ ] **Phase 6: Talent OS** - Net-new, tenant-scoped, audited hiring schema powering Candidates, Question Bank, Assessment Builder, and a stage-based Hiring Pipeline with a human-in-the-loop scoring gate
- [ ] **Phase 7: Explore** - Real Template/Marketplace catalog with industry-pack filtering and real "instantiate into my workspace" action; honest placeholders for Custom Solutions and Quantiva ERP
- [ ] **Phase 8: Dashboard-Wide Cleanup & Verification** - Remove remaining mock data (including API route handlers) and header stubs; whole-program lint/typecheck/test/build plus fresh-tenant and cross-tenant leak verification

## Phase Details

### Phase 1: Schema & Navigation Foundation
**Goal**: Every sidebar destination resolves to something honest, and the schema/version unknowns that would otherwise blow up later phase sizing are closed first
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: SCHM-01, SCHM-02, NAV-01, NAV-02, FORGE-01, FORGE-02

**Scope amendment (2026-08-10, via discuss-phase):** The navigation registry turned out to have 99 items across 14 groups, not the ~30 originally assumed from REQUIREMENTS.md's 5 named pillars. CerebroForge (19 items) has a working backend (`services/forge-api`, fixed this session) — user chose functional implementation for CerebroForge's 9 backend-having items over a placeholder (FORGE-01/FORGE-02), while the other 8 newly-discovered groups (HiveOps, Infrastructure, Data, Automation, Research, Academy, Business, Support — 50 items) get the standard honest placeholder alongside everything else NAV-02 already covered. See `01-CONTEXT.md` for the full decision record.

**Success Criteria** (what must be TRUE):
  1. All 99 sidebar nav destinations in Studio, when clicked, render either a real page or an honest "not yet available" placeholder — never a 404
  2. The 9 CerebroForge items with an existing forge-api controller (Forge Overview, AI Planner, Requirements Studio, Architecture Studio, Code Generation, Testing Intelligence, AI Code Review, Deployment Studio, AI Documentation) are wired to real, working functionality
  3. Every non-functional destination (the 10 remaining CerebroForge items plus the 50 items across HiveOps/Infrastructure/Data/Automation/Research/Academy/Business/Support) renders from a single registry-driven placeholder component keyed by an `implementationStatus` field — not one-off hardcoded pages
  4. Governance, Talent OS, and Explore's Prisma schema gaps are confirmed model-by-model (exists / stub / absent), removing the sizing unknown for Phases 5-7
  5. `archive-worker` and `archive-api` run on a single reconciled BullMQ major version, unblocking Phase 4's producer/consumer wiring
**Plans**: 7 (01-01 nav registry + placeholder infra, 01-02 FORGE-01 real wiring, 01-03 schema gaps + BullMQ, 01-04 Sidebar/Topbar/Breadcrumbs fix, 01-05 FORGE-02 fake-data removal, 01-06 HiveOps placeholders, 01-07 phase-wide verification)
**UI hint**: yes

### Phase 2: Core Workspace
**Goal**: Users can manage Organizations, Projects, and Teams as real, tenant-scoped data, and switch between workspaces from the header
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: WKSP-01, WKSP-02, WKSP-03, WKSP-04, WKSP-05
**Success Criteria** (what must be TRUE):
  1. User can create an Organization and see it persist after refresh, plus view/update/delete it
  2. User can create, view, update, and delete Projects within an Organization
  3. User can create, view, update, and delete Teams and manage their membership
  4. User can switch workspaces via the header workspace switcher and see the UI reflect the selected workspace's real data
  5. Every Core Workspace screen queries through one shared tenant-scoping helper (single reused code path, not per-screen filters)
**Plans**: TBD
**UI hint**: yes

### Phase 3: Core AI — AI Studio + Workflows
**Goal**: Users can create Agents, choose a real model/provider, test-run them from a playground, and compose/run simple agent-only Workflows with real execution history
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: AIST-01, AIST-02, AIST-03, WKFL-01, WKFL-02
**Success Criteria** (what must be TRUE):
  1. User can create, view, update, and delete an Agent backed by real Prisma data
  2. User can select a model/provider for an Agent from `@cerebro/ai-gateway`'s supported providers
  3. User can run an Agent from a playground and see the real model response
  4. User can create and run a Workflow composed of agent-only stages
  5. User can view a Workflow's execution history showing real run data
**Plans**: TBD
**UI hint**: yes

### Phase 4: Core AI — Knowledge Hub
**Goal**: Users can upload a document, watch it move through a real ingestion pipeline, and run semantic search over ingested content, safely under retries and scoped per tenant
**Mode:** mvp
**Depends on**: Phase 1, Phase 2
**Requirements**: KHUB-01, KHUB-02, KHUB-03, KHUB-04, KHUB-05, KHUB-06, KHUB-07, KHUB-08
**Success Criteria** (what must be TRUE):
  1. Uploading a document persists real `ArchiveDocument`/`ArchiveDocumentVersion` rows and enqueues a real ingestion job
  2. User can see real per-stage ingestion progress (DOWNLOAD→EXTRACT→CHUNK→EMBED→ENTITIES→TAGS→COMPLETE) or a FAILED status, via polling
  3. PDF and txt/md documents extract real text and produce real embeddings stored in Qdrant, scoped per tenant via a payload filter
  4. Auto-generated entities/tags are visibly marked unapproved (`source: AUTO`) and distinguishable from human-approved tags
  5. User can run a basic semantic search over their tenant's ingested documents and get real results
  6. Retrying a failed ingestion job under BullMQ does not duplicate paid API calls or orphan Postgres/Qdrant writes
**Plans**: TBD

### Phase 5: Governance
**Goal**: Users can view and manage organization Policies with real data, and compliance status reflects real counts, never a fabricated score
**Mode:** mvp
**Depends on**: Phase 1, Phase 2
**Requirements**: GOVN-01, GOVN-02
**Success Criteria** (what must be TRUE):
  1. User can view a list and detail of Policies scoped to their Organization, backed by real (schema-extended) Prisma data
  2. User can create/update a Policy and see the change persist
  3. Compliance status shown to the user reflects a real computed count/state, never a hardcoded percentage
**Plans**: TBD
**UI hint**: yes

### Phase 6: Talent OS
**Goal**: Users can run a stage-based hiring pipeline — Candidates, Question Bank, Assessment Builder — on a net-new, tenant-scoped, audited schema, with no unreviewed automated scoring affecting a candidate's pipeline stage
**Mode:** mvp
**Depends on**: Phase 1, Phase 2
**Requirements**: TALN-01, TALN-02, TALN-03, TALN-04, TALN-05, TALN-06, TALN-07
**Success Criteria** (what must be TRUE):
  1. Candidate, Assessment, HiringPipeline, and Question Prisma models exist with tenant scoping and an audit trail
  2. User can create, view, update, and delete Candidates
  3. User can move a Candidate through stages of a Hiring Pipeline
  4. User can build a Question Bank and compose an Assessment from it via the Assessment Builder
  5. User can view Assessments and their results against real candidate data
  6. No scoring/filtering/ranking feature uses a protected-class-adjacent signal, and any automated scoring requires an explicit human approval step before it affects a candidate's pipeline stage
**Plans**: TBD
**UI hint**: yes

### Phase 7: Explore
**Goal**: Users can browse a real template/marketplace catalog, filter it by industry pack, and instantiate a template into their workspace as a real Agent or Workflow; ERP and custom-solution destinations are honest placeholders
**Mode:** mvp
**Depends on**: Phase 2, Phase 3
**Requirements**: EXPL-01, EXPL-02, EXPL-03, EXPL-04, EXPL-05
**Success Criteria** (what must be TRUE):
  1. User can browse a Template/Marketplace catalog backed by real (schema-extended) data
  2. User can instantiate a template into their workspace, producing a real Agent or Workflow visible in Phase 3's screens
  3. User can filter the catalog by Industry Pack as a taxonomy over the same catalog, not a separate fake entity
  4. Custom Solutions page renders real content or an honest "contact us" / "not yet available" state
  5. Quantiva ERP nav destination renders an honest "not yet available" placeholder with no fake data
**Plans**: TBD
**UI hint**: yes

### Phase 8: Dashboard-Wide Cleanup & Verification
**Goal**: Every remaining hardcoded/mock value across Studio (pages and API routes) and every header control is wired to real data, and the whole program passes lint/typecheck/test/build plus fresh-tenant and cross-tenant leak checks
**Mode:** mvp
**Depends on**: Phase 2, Phase 3, Phase 4, Phase 5, Phase 6, Phase 7
**Requirements**: CLNP-01, CLNP-02, CLNP-03, VERF-01, VERF-02, VERF-03
**Success Criteria** (what must be TRUE):
  1. No hardcoded/mock metric, activity stream, or system-status number remains anywhere in Studio, including `app/api/**/route.ts` handlers
  2. Every converted screen visibly distinguishes loading, empty, and error states
  3. Header command input, suggestion buttons, search, command palette, notifications, and org switcher are wired to real data/actions
  4. Lint, typecheck, test, and build are clean across the whole program
  5. A fresh-tenant, zero-data pass shows only honest empty states, and a two-tenant cross-leak test passes for every CRUD area introduced this milestone
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Schema & Navigation Foundation | 1/7 | In Progress|  |
| 2. Core Workspace | 0/TBD | Not started | - |
| 3. Core AI — AI Studio + Workflows | 0/TBD | Not started | - |
| 4. Core AI — Knowledge Hub | 0/TBD | Not started | - |
| 5. Governance | 0/TBD | Not started | - |
| 6. Talent OS | 0/TBD | Not started | - |
| 7. Explore | 0/TBD | Not started | - |
| 8. Dashboard-Wide Cleanup & Verification | 0/TBD | Not started | - |
