# Requirements: CerebroHive Studio — Dashboard Functional Program

**Defined:** 2026-08-09
**Core Value:** Every page a user can navigate to in Studio must render real content wired to the actual backend/data model, or an honest empty state — never a fake number, a dead link, or a blank stub.

## v1 Requirements

Requirements for this milestone. Each maps to roadmap phases.

### Schema & Version Reconciliation (SCHM)

- [ ] **SCHM-01**: Governance, Talent OS, and Explore's Prisma schema gaps are confirmed and closed before their phases are sized (Policy model exists but is a bare stub with no tenant scoping; Talent OS and Explore have zero backing models)
- [ ] **SCHM-02**: `archive-worker` and `archive-api`'s BullMQ major version is reconciled to a single version before producer/consumer wiring begins

### Navigation (NAV)

- [x] **NAV-01**: Every sidebar navigation destination in Studio resolves to a real page — zero 404s. Scope note (discovered during Phase 1 discuss-phase): the navigation registry has 99 items across 14 groups, not the 5 originally described in this document's scope — this requirement covers all 99.
- [x] **NAV-02**: Every destination without a backing feature (this milestone or deferred) shows an honest "not yet available" state instead of a 404 or fake content, driven by an `implementationStatus` field on the shared navigation registry (not one-off hardcoded placeholder pages)

### CerebroForge (FORGE)

<!-- Added during Phase 1 discuss-phase (2026-08-10): CerebroForge is a 19-item nav group discovered outside REQUIREMENTS.md's original 5-pillar scope. Its backend (services/forge-api) already works end-to-end (fixed this session), so the user chose functional implementation over a placeholder for the 9 items with an existing controller. -->

- [ ] **FORGE-01**: The 9 CerebroForge nav items with an existing `forge-api` controller (Forge Overview, AI Planner, Requirements Studio, Architecture Studio, Code Generation, Testing Intelligence, AI Code Review, Deployment Studio, AI Documentation) are wired to real functionality — correct routing, correct API connection to the existing controller, usable (non-decorative) states. Deep UX polish is explicitly out of scope for this phase.
- [ ] **FORGE-02**: The remaining 10 CerebroForge nav items with no backend controller today (UI/UX Studio, Backend Studio, Database Studio, API Studio, Mobile Studio, Web Studio, Desktop Studio, CerebroBots, Repository Manager, Monitoring & Ops) show the same honest "not yet available" placeholder as NAV-02 — no new forge-api backend surface is built for them in this phase.

### Core Workspace (WKSP)

- [ ] **WKSP-01**: User can view, create, update, and delete Organizations backed by real Prisma data
- [ ] **WKSP-02**: User can view, create, update, and delete Projects within an Organization
- [ ] **WKSP-03**: User can view, create, update, and delete Teams and manage their membership
- [ ] **WKSP-04**: User can switch between workspaces via the header workspace switcher, reflecting real workspace data
- [ ] **WKSP-05**: Every Core Workspace screen uses a single shared tenant-scoping helper so no query can accidentally cross tenant boundaries

### Core AI — AI Studio (AIST)

- [ ] **AIST-01**: User can view, create, update, and delete Agents backed by real Prisma data
- [ ] **AIST-02**: User can select a model/provider for an Agent via `@cerebro/ai-gateway`'s supported providers
- [ ] **AIST-03**: User can test/run an Agent from a playground and see the real response

### Core AI — Workflows (WKFL)

- [ ] **WKFL-01**: User can view, create, and run Workflows composed of agent-only stages (matching the current execution engine's capability)
- [ ] **WKFL-02**: User can view a Workflow's execution history with real run data

### Core AI — Knowledge Hub (KHUB)

- [ ] **KHUB-01**: `archive-api`'s upload route persists real `ArchiveDocument`/`ArchiveDocumentVersion` rows and enqueues a real ingestion job (currently fabricates IDs and never persists or enqueues)
- [ ] **KHUB-02**: `archive-worker` consumes ingestion jobs through DOWNLOAD → EXTRACT → CHUNK → EMBED → ENTITIES → TAGS → COMPLETE stages, built from scratch against the existing `ArchiveProcessingRun`/`ArchiveProcessingEvent` schema
- [ ] **KHUB-03**: EXTRACT supports PDF and txt/md documents for v1
- [ ] **KHUB-04**: EMBED stage generates real embeddings via Gemini and stores vectors in Qdrant, scoped per tenant via a payload filter
- [ ] **KHUB-05**: ENTITIES/TAGS stages extract entities and tags via Claude (through `@cerebro/ai-gateway`, not a raw SDK); auto-generated tags are applied unapproved (`source: AUTO`) and are visibly distinguishable from human-approved tags
- [ ] **KHUB-06**: Pipeline stages are idempotent under BullMQ retry — no duplicate paid API calls, no orphaned Postgres/Qdrant writes on partial failure
- [ ] **KHUB-07**: User can see real per-stage ingestion progress (or FAILED status) for an uploaded document, via polling
- [ ] **KHUB-08**: User can run a basic semantic search over ingested documents once vectors exist for their tenant

### Governance (GOVN)

- [ ] **GOVN-01**: User can view and manage Policies backed by real (schema-extended) Prisma data, scoped per organization
- [ ] **GOVN-02**: Compliance status shown to the user reflects real counts/state — never a fabricated percentage or score

### Talent OS (TALN)

- [ ] **TALN-01**: Candidate, Assessment, HiringPipeline, and Question Prisma models are designed with tenant scoping and an audit trail from day one (net-new schema)
- [ ] **TALN-02**: User can view, create, update, and delete Candidates
- [ ] **TALN-03**: User can manage a stage-based Hiring Pipeline for candidates (drag-and-drop optional, given the no-redesign constraint)
- [ ] **TALN-04**: User can build and manage a Question Bank
- [ ] **TALN-05**: User can compose Assessments from the Question Bank via an Assessment Builder
- [ ] **TALN-06**: User can view Assessments and their results against real candidate data
- [ ] **TALN-07**: No scoring, filtering, or ranking feature uses a protected-class-adjacent signal, and any automated scoring requires an explicit human-in-the-loop gate before it affects a candidate's pipeline stage

### Explore (EXPL)

- [ ] **EXPL-01**: User can browse a Template/Marketplace catalog backed by real (schema-extended) data
- [ ] **EXPL-02**: User can instantiate a template into their workspace as a real Agent or Workflow
- [ ] **EXPL-03**: Industry Packs are presented as a taxonomy/filter over the same catalog, not a separate fake entity
- [ ] **EXPL-04**: Custom Solutions page renders real content or an honest "contact us" / "not yet available" state
- [ ] **EXPL-05**: Quantiva ERP nav destination renders an honest placeholder page stating the integration is not yet available — no fake data, no fake integration

### Dashboard-Wide Cleanup (CLNP)

- [ ] **CLNP-01**: Every hardcoded/mock metric, activity stream, and system-status number in Studio (including API route handlers under `app/api/**/route.ts`, not just page components) is replaced with real data or an honest empty state
- [ ] **CLNP-02**: Every converted screen distinguishes loading, empty, and error states — not a bare empty array standing in for all three
- [ ] **CLNP-03**: Header command input, suggestion buttons, search, command palette, notifications, and org switcher are wired to real data/actions

### Verification (VERF)

- [ ] **VERF-01**: Lint, typecheck, test, and build are clean across the whole program
- [ ] **VERF-02**: A fresh-tenant, zero-data pass across the whole app shows only honest empty states, never errors or fake fallback content
- [ ] **VERF-03**: A two-tenant cross-leak test passes for every CRUD area introduced or touched this milestone

## v2 Requirements

Deferred to a future milestone. Tracked but not in current roadmap.

### Should-Have (Deferred)

- **DEFR-01**: RBAC permission matrix UI
- **DEFR-02**: Audit log viewer for org/team changes
- **DEFR-03**: Agent version diffing/comparison
- **DEFR-04**: Streaming playground responses
- **DEFR-05**: Workflow visual DAG builder (beyond agent-only stages)
- **DEFR-06**: Policy acknowledgment/attestation workflow
- **DEFR-07**: Structured interview kits/scorecards (Talent OS)
- **DEFR-08**: Template ratings/usage counts (Explore)
- **DEFR-09**: Typed API client for `forge-api` (parity with `platform-api`'s `EngineeringReviewClient`)
- **DEFR-10**: Persistent execution store for AI Studio/Workflows (`InMemoryExecutionRepository` replacement — confirm `hiveforge` branch status before this milestone presents execution history as durable)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| UI/visual system redesign | Constraint from PROJECT.md — this is a wiring/integration milestone, not a redesign |
| SSO/SCIM | v2+, not required for core dashboard functionality |
| Custom org branding | v2+, not core to "real data, no dead links" goal |
| Billing CRUD | v2+, out of this milestone's pillars |
| Multi-framework GRC compliance mapping (SOC2/ISO27001) | Governance table-stakes only this milestone; full GRC mapping is a differentiator for later |
| Candidate self-service portal | Talent OS internal-admin scope only this milestone |
| Two-sided marketplace with payments | Explore ships as a catalog + instantiate action, not a transacting marketplace |
| Real-time collaborative editing | Not core to de-mocking the dashboard |
| AI-based candidate/resume scoring | EEOC/adverse-impact risk; explicitly excluded without a dedicated compliance design pass |
| New workflow engine capability beyond agent-only stages | Matches current engine limitation; engine work is a separate initiative |
| Full Quantiva ERP integration | Scope undefined beyond a one-line mention; ships as an honest placeholder this milestone |
| Real-time push (SSE/WebSockets) for ingestion progress | No push infra exists for archive-api/worker; polling is sufficient for v1 |

## Traceability

Populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCHM-01 | Phase 1 | Pending |
| SCHM-02 | Phase 1 | Pending |
| NAV-01 | Phase 1 | Complete |
| NAV-02 | Phase 1 | Complete |
| FORGE-01 | Phase 1 | Pending |
| FORGE-02 | Phase 1 | Pending |
| WKSP-01 | Phase 2 | Pending |
| WKSP-02 | Phase 2 | Pending |
| WKSP-03 | Phase 2 | Pending |
| WKSP-04 | Phase 2 | Pending |
| WKSP-05 | Phase 2 | Pending |
| AIST-01 | Phase 3 | Pending |
| AIST-02 | Phase 3 | Pending |
| AIST-03 | Phase 3 | Pending |
| WKFL-01 | Phase 3 | Pending |
| WKFL-02 | Phase 3 | Pending |
| KHUB-01 | Phase 4 | Pending |
| KHUB-02 | Phase 4 | Pending |
| KHUB-03 | Phase 4 | Pending |
| KHUB-04 | Phase 4 | Pending |
| KHUB-05 | Phase 4 | Pending |
| KHUB-06 | Phase 4 | Pending |
| KHUB-07 | Phase 4 | Pending |
| KHUB-08 | Phase 4 | Pending |
| GOVN-01 | Phase 5 | Pending |
| GOVN-02 | Phase 5 | Pending |
| TALN-01 | Phase 6 | Pending |
| TALN-02 | Phase 6 | Pending |
| TALN-03 | Phase 6 | Pending |
| TALN-04 | Phase 6 | Pending |
| TALN-05 | Phase 6 | Pending |
| TALN-06 | Phase 6 | Pending |
| TALN-07 | Phase 6 | Pending |
| EXPL-01 | Phase 7 | Pending |
| EXPL-02 | Phase 7 | Pending |
| EXPL-03 | Phase 7 | Pending |
| EXPL-04 | Phase 7 | Pending |
| EXPL-05 | Phase 7 | Pending |
| CLNP-01 | Phase 8 | Pending |
| CLNP-02 | Phase 8 | Pending |
| CLNP-03 | Phase 8 | Pending |
| VERF-01 | Phase 8 | Pending |
| VERF-02 | Phase 8 | Pending |
| VERF-03 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 44 total (42 from roadmap creation + FORGE-01, FORGE-02 added during Phase 1 discuss-phase after discovering the nav registry has 99 items, not the ~30 originally scoped, and that CerebroForge's 19-item group has a working backend)
- Mapped to phases: 44/44 ✓
- Unmapped: 0

---
*Requirements defined: 2026-08-09*
*Last updated: 2026-08-10 after Phase 1 discuss-phase — added FORGE-01/FORGE-02, amended NAV-01/NAV-02 scope notes, all 44 v1 requirements mapped across 8 phases*
