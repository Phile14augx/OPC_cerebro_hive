# Feature Research

**Domain:** Enterprise AI-Ops / EIOS dashboard (CerebroHive Studio) — Core Workspace, Core AI, Governance, Talent OS, Explore
**Researched:** 2026-08-09
**Confidence:** MEDIUM (patterns verified against real comparable products; exact CerebroHive backend capability per feature not independently re-verified beyond ARCHITECTURE.md/PROJECT.md — see Gaps)

## Context Note for This Milestone

This is a **wiring/integration milestone**, not a product-innovation milestone. Constraints from PROJECT.md:
- No fake data — every page renders real backend data or an honest empty state, never a mock/placeholder.
- No UI redesign — existing visual system is locked; this is backend wiring into existing screens.
- Reuse the existing Prisma schema; extend only where a genuine gap exists.

Because of this, the bar for "table stakes" below is deliberately **narrower** than a greenfield SaaS product spec: a feature only counts as table-stakes-for-this-milestone if (a) comparable production tools universally have it, AND (b) it's achievable by wiring existing schema/services rather than inventing new subsystems. Features that are standard in mature competitors but require net-new infrastructure (e.g., real-time collaborative editing, SOC2 evidence automation, resume-parsing ML) are flagged as differentiators or anti-features for v1 specifically because of this milestone's scope, not because they're bad ideas long-term.

---

## Feature Landscape by Area

### 1. Core Workspace — Organizations, Projects, Teams (multi-tenant admin CRUD)

Comparable products: Vercel/GitHub/Linear org-and-team model, generic multi-tenant SaaS admin.

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Organization list + detail view (real data) | Baseline admin surface for any multi-tenant product; users expect to see the orgs/workspaces they belong to | LOW | Prisma already has Organization/Tenant/Workspace models per ARCHITECTURE.md — this is a read-wiring task |
| Create/Edit/Delete (or archive) Organization, Project, Team | "CRUD" is explicitly named in PROJECT.md as the requirement; every admin panel in this category supports full lifecycle | MEDIUM | Delete should likely be soft-delete/archive given cascading Agent/Workflow/Document ownership — verify FK cascade behavior in schema before allowing hard delete |
| Member management (add/remove/change role) within Org/Team | Table stakes for any multi-tenant workspace tool (Vercel teams, GitHub orgs, Linear workspaces) | MEDIUM | Depends on `@cerebro/auth` role model already existing — confirm role enum exists in schema |
| Project → Team → Org hierarchy reflected consistently in UI and API | Users need to understand where an Agent/Workflow "lives" | MEDIUM | This is the anchor entity for everything else — Core AI, Talent OS, Governance all likely scope data by workspace/org |
| Empty states for orgs/projects/teams with zero members or zero resources | Explicit "no fake data" constraint — an org with 0 projects must show a real empty state, not a hardcoded sample | LOW | Direct application of the milestone's core constraint |
| Org/workspace switcher wired to real orgs (mentioned in PROJECT.md header controls) | Any multi-tenant product needs a way to move between tenants without re-login | MEDIUM | Already listed in Active requirements — cross-cutting with header wiring |

#### Differentiators (can slip to later milestone)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Role-based permission matrix UI (fine-grained per-resource ACLs) | Enterprise buyers eventually expect granular RBAC beyond owner/admin/member | HIGH | Real RBAC UIs (Vercel, GitHub) took years to mature; don't block v1 on this — binary/coarse roles are enough for a wiring milestone |
| Audit log of org/team/project changes | Enterprise compliance expectation, dovetails with Governance pillar | MEDIUM | Only build if Governance's audit infra (below) is being built anyway — avoid parallel implementations |
| Bulk member invite / CSV import | Efficiency feature, not core to functioning | MEDIUM | Defer — single-add invite flow is sufficient for v1 |
| Cross-org resource sharing / project templates | Nice productivity feature | HIGH | Out of scope; requires new sharing model |

#### Anti-Features (over-scoped for this milestone)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|------------------|-------------|
| SSO/SCIM provisioning UI | "Enterprise" branding implies SSO | Full SSO/SCIM is a distinct auth-provider integration project, not a CRUD-wiring task; scope creep risk is high | Leave org/team CRUD auth-agnostic; SSO is a separate milestone |
| Custom org-level branding/white-labeling | Feels "enterprise" | Touches the locked visual system (explicitly out of scope per PROJECT.md) | Do not build |
| Billing/plan management UI inside Org CRUD | Organization/billing models exist in Prisma per ARCHITECTURE.md, tempting to wire alongside | Billing has its own compliance/PCI concerns and is a distinct capability, not implied by "Organizations, Projects, Teams management" in Active requirements | Treat billing as separate scope; only surface read-only plan info if trivially available, don't build billing CRUD |

---

### 2. Core AI — AI Studio (agents), Workflows, Knowledge Hub

Comparable products: LangSmith, Vellum, Retool AI (agent builders); n8n/Retool workflow engines; RAG knowledge base UIs (Notion AI, generic vector-search knowledge tools).

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Agent list (real agents from `AgentRepository`, scoped to workspace) | Baseline read; agent CRUD is explicitly in PROJECT.md Active scope | LOW | `packages/capabilities/agent-builder` and Prisma Agent/AgentVersion models already exist |
| Agent create/edit form (name, system prompt/instructions, model/provider selection) | LangSmith and Vellum both treat "define an agent + pick a model" as the absolute floor | MEDIUM | AI Gateway (`packages/ai-gateway`) already abstracts Anthropic/OpenAI providers — wire the picker to gateway's registered providers, not a hardcoded list |
| Agent test/run ("playground") — send input, see output, see raw trace/tool calls | Universal pattern across LangSmith, Vellum, Retool AI — you cannot ship an agent builder without a way to run it before deploying | MEDIUM-HIGH | `ExecutionOrchestrator`/`AgentRuntimeService` already exists per ARCHITECTURE.md data flow — this is wiring the UI to `POST /api/v1/runtime/agents/execute`, but note: execution state is currently `InMemoryExecutionRepository` (process-lifetime only per Architectural Constraints) — execution history across restarts will not persist until that's fixed |
| Workflow list (real workflows, scoped to workspace) | Same rationale as agent list | LOW | `packages/workflow` + Workflow/WorkflowExecution Prisma models exist |
| Workflow create (define stages/DAG referencing agents) | Table stakes for n8n/Retool-style workflow tools | HIGH | ARCHITECTURE.md flags "workflow/tool kinds rejected, currently agent-only" in Workflow Engine — full DAG editor may exceed what backend currently supports; scope v1 workflow creation to what the engine can actually execute today |
| Workflow run + execution history (status, timestamps, output per run) | Anyone building a workflow needs to see whether it ran and what happened — this is the #1 feature in every workflow tool (n8n run history, Zapier zap history) | MEDIUM | WorkflowExecution model exists; wire list + detail view |
| Knowledge Hub: document upload/ingestion with real status (uploading → processing → ready/failed) | RAG products (and PROJECT.md itself) require real ingestion, not a fake "document library" | HIGH | This is explicitly called out as needing archive-api upload-complete wiring + archive-worker BullMQ consumer (extract/chunk/embed/entities/tags) — largest single piece of net-new integration work in the whole milestone |
| Knowledge Hub: semantic search over ingested documents | Explicitly named requirement ("semantic search, RAG-style knowledge base UI") | HIGH | Depends on Qdrant vectors existing from the ingestion pipeline — cannot ship search before ingestion pipeline is wired; hard dependency |
| Honest empty/loading/error states for agents, workflows, documents when none exist or ingestion fails | Direct application of "no fake data" constraint — this is the single most-repeated failure mode named in PROJECT.md ("dead buttons," "404 routes," "hardcoded metrics") | LOW-MEDIUM | Apply uniformly: empty org, empty agent list, zero-document Knowledge Hub, failed ingestion job all need real states, not silent fallback to sample content |

#### Differentiators (can slip to later milestone)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Prompt/version diffing and versioning UI (compare agent versions like LangSmith/Vellum) | Vellum's differentiator is bidirectional code/UI sync and version comparison; genuinely valuable for iteration | HIGH | AgentVersion model already exists in schema, so basic "version history list" is low-hanging, but diff/compare UI is a differentiator, not floor |
| Evaluation/benchmark scoring (LangSmith Evals-style) | `packages/capabilities/evaluation` package already exists per ARCHITECTURE.md | HIGH | Real differentiator once agent CRUD/run is solid, but don't let it block v1 — evals are a distinct product surface |
| Streaming responses in the agent test/run UI | AI Gateway supports `streamChat()` per ARCHITECTURE.md interface — nice UX but not required for a functional playground | MEDIUM | Table stakes in the top-tier tools (ChatGPT-style streaming) but non-streaming synchronous run is acceptable for v1 given "no redesign" constraint (streaming often needs new UI chrome) |
| Multi-provider model comparison (run same prompt across providers side-by-side) | LangSmith/Vellum differentiator | MEDIUM-HIGH | Defer; single-provider run is sufficient to prove the wiring works |
| Entity extraction / auto-tagging surfaced in Knowledge Hub UI (approve/reject tags) | Already designed in the archive-worker pipeline per PROJECT.md Context (Claude-based entity/tag extraction, "auto-apply unapproved tags") | MEDIUM | Backend pipeline decision already made; whether the *review/approval UI* ships in v1 or just auto-applied tags display read-only is a scoping call for the roadmap phase, not this research |
| Workflow visual DAG builder (drag-and-drop nodes, like n8n/Retool) | Xyflow/Dagre are already in the stack per ARCHITECTURE.md (Layer 1 dependencies) | HIGH | Genuinely differentiating but high complexity; a simpler ordered-stage-list editor may satisfy "create" requirement without a full visual builder |

#### Anti-Features (over-scoped for this milestone)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|------------------|-------------|
| Building a new workflow execution engine that supports arbitrary node types (tool/sub-workflow nodes) beyond agent-only | Feels incomplete that workflows are "agent-only" per current engine limitation | This is a runtime-engineering project, not a UI-wiring task; PROJECT.md explicitly scopes this milestone as wiring, and ARCHITECTURE.md documents this as a known, deliberate current limitation | Ship workflow CRUD/run against what the engine supports today (agent stages); log engine expansion as a future milestone |
| Custom embedding model selection UI in Knowledge Hub | Feels like it should mirror agent model-picker pattern | PROJECT.md's Key Decisions already fixed the embedding/extraction stack (Gemini embeddings, Claude entities) as "Pending approval" scope-locked decision — building a picker contradicts that decision | Ship with the fixed provider pipeline; no per-document provider choice in v1 |
| Real-time collaborative agent/workflow editing (multi-cursor, like Figma/Retool multiplayer) | "Enterprise" feel | Massive infra investment (CRDT/OT), zero mention in current requirements, unrelated to "no fake data" goal | Standard single-editor-at-a-time CRUD |
| Building a persistent execution store (`PrismaExecutionStore`) as part of this feature work | Execution history needs to survive restarts to be "real" | ARCHITECTURE.md already flags this as "PR in progress (hiveforge branch)" — i.e., someone else is already doing this; duplicating it risks conflict | Coordinate/depend on that PR landing rather than re-implementing; if not landed, wire UI against in-memory store and document the known limitation as an honest caveat, don't fake persistence |

---

### 3. Governance — Compliance and Policies

Comparable products: Vanta, Drata, Sprinto, OneTrust-style GRC dashboards (enterprise), scaled down to what's realistic for an internal-facing wiring milestone.

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Policy list (real policies: name, status, owner, last-updated) | Universal GRC pattern — "centralized console to create, distribute, track policies" is the baseline of every compliance tool researched | LOW-MEDIUM | Depends entirely on whether Prisma schema has a Policy/Compliance model — ARCHITECTURE.md's model list doesn't explicitly name one (see Gaps below); this needs a schema-existence check before roadmap phase sizing |
| Policy detail view (content, version, effective date) | Same rationale | LOW-MEDIUM | Same dependency as above |
| Compliance status/dashboard reflecting real data (not hardcoded percentages) | PROJECT.md explicitly calls out "hardcoded/fake metrics... replaced with real data or honest empty states" as dashboard-wide cleanup — Governance is exactly the kind of page prone to fake "94% compliant" numbers | LOW-MEDIUM | If no real compliance-scoring engine exists yet, the honest move is an empty state or a simple real count (e.g., "3 policies published, 0 pending review"), not a fabricated score |
| Honest empty state for zero policies/zero compliance data | Direct constraint application | LOW | Same principle as Core Workspace/Core AI |

#### Differentiators (can slip to later milestone)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Policy acknowledgment/attestation workflow (users sign off on reading a policy) | Named as a real GRC table-stakes feature ("centralized console to create, distribute, acknowledge") in mature products | MEDIUM-HIGH | Requires a new acknowledgment-tracking model + notification flow — real feature, but likely net-new schema, so treat as v1.x, not v1 |
| Automated evidence collection / continuous control monitoring | Modern GRC differentiator (Vanta/Drata-style) | VERY HIGH | Requires integrations with the very systems being governed (agents, workflows, data access) — is essentially a new product surface; explicitly defer |
| Risk register / risk scoring dashboard | Common enterprise GRC feature | HIGH | New domain model, new scoring logic — not implied by existing schema per ARCHITECTURE.md |
| Audit log viewer (who changed what, when) across the platform | Valuable, and technically may already be partially fed by the Outbox/event-sourcing pattern that ARCHITECTURE.md documents | MEDIUM | Worth flagging to roadmap as "cheap if Outbox events already capture this," otherwise defer |

#### Anti-Features (over-scoped for this milestone)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|------------------|-------------|
| Multi-framework compliance mapping (SOC2/ISO27001/HIPAA control mapping) | "Enterprise GRC" branding implies framework coverage | This is the core product of dedicated GRC vendors (Vanta/Drata/Sprinto) — building it inside a dashboard wiring milestone is massive scope creep unrelated to "wire existing screens to real data" | Ship Policies as a real document/version registry; explicitly do not attempt framework-mapping in v1 |
| AI-driven gap detection / autonomous evidence validation | Cited as "increasingly table stakes in 2026" by GRC vendors, but that's table stakes *for dedicated GRC products*, not for an internal compliance tab bundled in an ops platform | Requires an entire analysis engine; wildly out of proportion to a wiring milestone | Not in scope; revisit only if Governance becomes a standalone product pillar |
| Vendor risk management workflows | Common in full GRC suites | No indication this data model exists; unrelated to current Active requirements | Skip entirely |

---

### 4. Talent OS — Hiring Pipeline, Candidates, Assessments, Assessment Builder, Question Bank

Comparable products: Greenhouse, Lever, Ashby (ATS platforms) — this pillar is explicitly an internal HR/recruiting tool bundled into the platform, not the flagship product.

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Candidate list + profile (real candidates, contact info, resume/status) | Baseline of every ATS — "candidate" is the core entity | LOW-MEDIUM | Needs confirmation this model exists in schema; ARCHITECTURE.md's domain list doesn't mention Candidate/Hiring models explicitly (see Gaps) |
| Hiring pipeline / stage board (visual pipeline showing candidates by stage, drag-and-drop or at least stage-change action) | Explicitly cited as core to both Greenhouse and Lever ("Visual Pipeline Management provides a clear... interface... to visualize and manage candidates moving through various stages") | MEDIUM-HIGH | Drag-and-drop is UX-heavy; given "no redesign" constraint, a simpler stage-dropdown/list view satisfying the same function is acceptable if a kanban board isn't already built into the existing (locked) UI |
| Job/requisition → pipeline stages configuration | Both Greenhouse and Lever tie pipelines to specific job reqs with custom stages | MEDIUM | Needed to make "Hiring Pipeline" meaningful rather than one global list |
| Assessment list (real assessments tied to a role/pipeline) | Named requirement; both Greenhouse ("Built-in Assessment Tools... library of customizable skills tests") and dedicated tools treat this as standard | MEDIUM | — |
| Assessment Builder — create/edit an assessment from questions | Named requirement, mirrors Greenhouse's "structured interview kits" concept | MEDIUM-HIGH | This is effectively a form/quiz builder — scope to reusing existing form components in the locked UI, not inventing new builder chrome |
| Question Bank — reusable question CRUD, categorized | Named requirement; supports Assessment Builder | MEDIUM | This is a straightforward CRUD dependency of Assessment Builder — sequence it before or alongside the builder |
| Honest empty states (zero candidates, zero assessments, zero questions) | Direct constraint | LOW | — |

#### Differentiators (can slip to later milestone)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Structured interview kits / scorecards per interviewer | Cited as where Greenhouse "genuinely leads the market" — real differentiator in ATS space | HIGH | Valuable long-term but a distinct feature from pipeline/candidates/assessments named in scope; don't silently fold it in |
| Resume parsing / auto-extraction of candidate data | Common ATS feature, high user delight | HIGH | Requires ML/parsing service — clear net-new infra, not wiring |
| Candidate sourcing/CRM (Lever-style outbound sourcing & nurture) | Differentiator for active-sourcing teams | HIGH | Out of scope — PROJECT.md frames Talent OS as internal hiring tool, not a sourcing CRM |
| Integrations marketplace (500+ integrations like Greenhouse) | Huge ATS differentiator | VERY HIGH | Absolutely not appropriate for a wiring milestone |
| Assessment auto-scoring / candidate ranking | Efficiency differentiator | MEDIUM-HIGH | Depends on assessment data model maturity; defer until Assessment Builder + Question Bank are solid |

#### Anti-Features (over-scoped for this milestone)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|------------------|-------------|
| Candidate self-service portal (external-facing apply/status page) | ATS products always have a candidate-facing side | This pillar is internal HR tooling bundled into an ops platform per PROJECT.md framing, not a public-facing careers site — building external auth/portal is a different product | Keep Talent OS internal-only in v1; no external candidate access |
| Video interview / scheduling integration | Feature present in Greenhouse/Lever | Requires calendar/video-vendor integration — net-new infra unrelated to wiring existing schema | Skip; log status via manual stage updates instead |
| AI-based candidate/resume scoring | Trendy in modern ATS | Introduces bias/compliance risk plus new ML infra — high risk for a wiring milestone with no mandate for it | Skip entirely for v1 |

---

### 5. Explore — Marketplace, Templates, Industry Packs, Custom Solutions

Comparable products: n8n template marketplace, Zapier template gallery, Retool component/template marketplace — treated here as a catalog feature, not a full seller/buyer marketplace.

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Template/Marketplace catalog list (real templates, browsable, categorized) | Core pattern across every reference product: n8n's "browse by category, integration, or search," Zapier's gallery | LOW-MEDIUM | Depends on whether a Template/MarketplaceItem model exists in schema — likely a genuine gap (see Gaps); may need minimal schema extension, which PROJECT.md permits when a "genuine gap exists" |
| Template detail view (description, what it sets up) | Universal — every template marketplace shows what you're about to install before installing | LOW | — |
| "Use this template" / instantiate action that creates a real Agent/Workflow from the template into the user's workspace | This is the actual value of a template marketplace — n8n's "one-click deployment into your own instance" is the entire point | MEDIUM-HIGH | This is the feature that makes Explore "real" rather than a static catalog page — without it, Explore is just a picture gallery, which violates "no dead buttons" |
| Industry Packs as a categorization/filter of the same template catalog | Reasonable interpretation: same underlying catalog, filtered/grouped by industry vertical | LOW-MEDIUM | Avoid treating "Industry Packs" as a wholly separate subsystem from "Templates" — that's likely over-scoping; confirm with roadmap that it's a taxonomy, not a new entity type |
| Honest empty state if catalog has zero templates | Direct constraint | LOW | Especially important here — Explore/Marketplace pages are the most likely place fake "12 trending templates" content currently lives per PROJECT.md's framing of the problem |

#### Differentiators (can slip to later milestone)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Ratings/reviews/usage-count on templates | Social-proof differentiator common in mature marketplaces | MEDIUM | Needs new tracking model; not required for a functional catalog |
| Custom Solutions as a request/intake flow (vs. just a static "contact us" page) | Could be a real lead-gen feature | LOW-MEDIUM | If it's just a form → CRM/email, this is cheap; if it implies a bespoke-solution builder, that's a differentiator/anti-feature line — clarify scope at roadmap time |
| Community/user-submitted templates | n8n's marketplace is largely community-driven | HIGH | Requires moderation, submission flow, review — well beyond wiring scope |
| Third-party marketplace-style "verified seller" ecosystem | Seen in third-party n8n/Zapier template resellers | VERY HIGH | Not applicable — CerebroHive is not building a two-sided marketplace business |

#### Anti-Features (over-scoped for this milestone)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|------------------|-------------|
| Full two-sided marketplace (external publishers, payments, revenue share) | "Marketplace" naming invites this interpretation | This is a distinct business model requiring payments infra, seller onboarding, moderation — nothing in PROJECT.md scope implies monetization | Build Explore as a first-party curated catalog only |
| Quantiva ERP page as a deep integration/build-out | Listed in PROJECT.md Active bullet alongside Explore items | It's named once with no further detail anywhere in PROJECT.md/ARCHITECTURE.md — treating it as a full ERP integration would be wildly out of proportion | Treat as a placeholder-to-real-page task at minimum (real "coming soon" or catalog entry with honest empty state), not a new ERP integration; flag as an open question for roadmap scoping |
| AI-generated custom templates on demand | Trendy "AI does it for you" feature | New generation pipeline, evaluation risk, unrelated to cataloging existing templates | Skip; Explore surfaces pre-built templates only |

---

## Feature Dependencies

```
Core Workspace (Org/Project/Team CRUD + workspace scoping)
    └──requires──> Auth/role model (@cerebro/auth) [existing]
                       └──enables──> everything below is scoped by workspace/org

Core AI: AI Studio (Agent CRUD + run)
    └──requires──> Core Workspace (agents belong to a workspace/org)
    └──requires──> AI Gateway provider registry [existing]
    └──enables──> Core AI: Workflows (workflow stages currently agent-only per ARCHITECTURE.md)

Core AI: Workflows (list/create/run/history)
    └──requires──> Core AI: AI Studio (agents must exist to be referenced by workflow stages)
    └──requires──> persistent or documented-limitation execution state
                       (currently InMemoryExecutionRepository — flagged limitation)

Core AI: Knowledge Hub (ingestion + semantic search)
    └──requires──> archive-api upload-complete wiring
                       └──requires──> archive-worker BullMQ consumer
                                          (DOWNLOAD → EXTRACT → CHUNK → EMBED → ENTITIES → TAGS → COMPLETE)
                                          └──requires──> Gemini (embeddings) + Claude (entities/tags) integration [decision made, pending approval]
    └──"semantic search" UI requires ingestion pipeline to be producing real Qdrant vectors first
       (cannot build search UI meaningfully before at least one document completes the pipeline)

Governance: Policies/Compliance
    └──requires──> Core Workspace (policies are scoped per org, most likely)
    └──may require──> new Policy schema model if one doesn't already exist (verify before phase sizing)
    └──enhances──> could reuse Outbox/event-sourcing pattern for audit trail (optional, cheap-if-available)

Talent OS: Hiring Pipeline / Candidates / Assessments / Assessment Builder / Question Bank
    └──requires──> Core Workspace (hiring activity scoped per org/team, most likely)
    └──requires──> Question Bank (must exist before Assessment Builder can meaningfully reference questions)
                       └──enables──> Assessment Builder
                                          └──enables──> Assessments (attached to pipeline stages)
    └──independent of Core AI and Governance (no functional coupling found)

Explore: Marketplace/Templates/Industry Packs/Custom Solutions
    └──requires──> Core AI: AI Studio + Workflows (templates instantiate into real Agents/Workflows —
                       "Use this template" is meaningless until Agent/Workflow CRUD is real)
    └──"Industry Packs" ──is-a-view-of──> Templates (avoid building as separate entity type)
    └──Quantiva ERP ──unclear-scope──> flag for roadmap clarification, do not assume full integration

Dashboard-wide cleanup (fake metrics removal) ──cross-cuts──> all five areas above
    └──should follow, not precede, each area's real-data wiring (can't remove a fake metric
       until the real metric source exists)
```

### Dependency Notes

- **Core AI (Workflows) requires Core AI (AI Studio):** Workflow stages are currently agent-only per ARCHITECTURE.md's documented engine limitation ("workflow/tool kinds rejected"). Building Workflow CRUD before Agent CRUD is real would mean the workflow builder has nothing valid to reference.
- **Knowledge Hub search requires Knowledge Hub ingestion:** Semantic search over zero real vectors is either a fake feature or an empty state — there is no honest middle ground. The ingestion pipeline (archive-worker) must land first, even partially (e.g., PDF-only), before search UI has anything real to query.
- **Explore requires Core AI:** "Templates" are only meaningful as marketplace items if they instantiate into real Agents/Workflows. Building Explore before Agent/Workflow CRUD is functional risks it becoming another "dead button" page — the exact anti-pattern PROJECT.md is trying to eliminate.
- **Talent OS is architecturally independent** of Core AI/Knowledge Hub/Governance — no evidence in ARCHITECTURE.md of shared services beyond the base workspace/org/auth model. This means Talent OS phases can be sequenced flexibly relative to Core AI/Knowledge Hub (parallelizable by a different workstream) as long as Core Workspace lands first.
- **Governance likely needs schema verification before estimation:** Unlike Core Workspace/Core AI/Knowledge Hub (all backed by explicitly-named Prisma models in ARCHITECTURE.md), no Policy/Compliance model is named in the architecture doc's domain list. This is a genuine gap to confirm early — it changes Governance from "wire existing schema" (low complexity, matches PROJECT.md's stated preference) to "extend schema, then wire" (medium complexity).
- **Explore/Marketplace likely needs schema verification too:** Same reasoning — no Template/MarketplaceItem model is named in ARCHITECTURE.md. Confirm before roadmap sizing.
- **Dashboard-wide fake-metric cleanup is sequenced last per area, not globally last:** each area's fake metrics can only be replaced with real ones once that area's real data source is wired — e.g., don't attempt to fix Knowledge Hub's document-count metric before ingestion is wired.

---

## MVP Definition (for this milestone, not the product's ultimate v1)

### Launch With (this milestone's "done")

- [ ] Core Workspace: Org/Project/Team CRUD with real data + empty states — foundation everything else scopes against
- [ ] Core AI — AI Studio: Agent CRUD + model/provider selection + test/run against real AI Gateway
- [ ] Core AI — Workflows: list/create (agent-stage-only, matching current engine capability)/run/execution history
- [ ] Core AI — Knowledge Hub: real document upload/ingestion status + basic semantic search once pipeline produces vectors
- [ ] Governance: Policies list/detail with real data (or schema-gap flagged early if model doesn't exist) + honest compliance-status empty/real state
- [ ] Talent OS: Candidates + Hiring Pipeline (stage-based, not necessarily drag-and-drop) + Question Bank + Assessment Builder + Assessments, all real CRUD
- [ ] Explore: Templates/Marketplace catalog with real "instantiate into my workspace" action (the feature that makes it non-fake); Industry Packs as a filter/taxonomy of the same catalog
- [ ] Every sidebar nav destination resolves (zero 404s) — this is the umbrella acceptance criterion from PROJECT.md
- [ ] Header controls (org switcher, search, command palette) wired to real data

### Add After Validation (next milestone)

- [ ] Policy acknowledgment/attestation workflow — trigger: Governance CRUD is stable and a real user/notification loop is wanted
- [ ] Structured interview kits/scorecards in Talent OS — trigger: basic hiring pipeline proven useful, teams asking for interviewer structure
- [ ] Workflow visual DAG builder (replacing simple stage list) — trigger: workflow engine itself is extended beyond agent-only stages
- [ ] Agent version diffing/comparison — trigger: agent iteration volume justifies it
- [ ] Template ratings/usage counts in Explore — trigger: catalog has enough real templates for social proof to matter

### Future Consideration (v2+, likely different milestones entirely)

- [ ] Multi-framework GRC compliance mapping (SOC2/ISO27001) — defer until/unless Governance becomes a dedicated product pillar
- [ ] Candidate self-service portal / external ATS surface — defer, different product surface (public-facing)
- [ ] Two-sided marketplace (external publishers, payments) — defer, different business model entirely
- [ ] SSO/SCIM — separate auth-infrastructure project
- [ ] Real-time collaborative editing across Core AI builders — defer, large infra investment

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|----------------------|----------|
| Core Workspace CRUD (Org/Project/Team) | HIGH | MEDIUM | P1 |
| AI Studio agent CRUD + test/run | HIGH | MEDIUM-HIGH | P1 |
| Workflows list/create/run/history (agent-only stages) | HIGH | MEDIUM-HIGH | P1 |
| Knowledge Hub ingestion pipeline wiring | HIGH | HIGH | P1 |
| Knowledge Hub semantic search UI | HIGH | MEDIUM (once ingestion lands) | P1 |
| Governance Policies CRUD (pending schema confirm) | MEDIUM-HIGH | MEDIUM (LOW if model exists, HIGH if not) | P1 |
| Governance compliance status (real, not fake) | MEDIUM | LOW-MEDIUM | P1 |
| Talent OS: Candidates + Hiring Pipeline | HIGH | MEDIUM-HIGH | P1 |
| Talent OS: Question Bank | MEDIUM | MEDIUM | P1 (dependency of Assessment Builder) |
| Talent OS: Assessment Builder + Assessments | MEDIUM-HIGH | MEDIUM-HIGH | P1 |
| Explore: Template catalog + instantiate action | MEDIUM-HIGH | MEDIUM (LOW if model exists, HIGH if not) | P1 |
| Explore: Industry Packs (as taxonomy) | MEDIUM | LOW (if built as filter, not new entity) | P1 |
| Explore: Custom Solutions (intake form) | LOW-MEDIUM | LOW | P2 |
| Explore: Quantiva ERP page | UNKNOWN | UNKNOWN | P2 (needs scope clarification) |
| Dashboard-wide fake-metric cleanup | HIGH (trust/credibility) | LOW-MEDIUM per area | P1 (trailing each area) |
| Policy acknowledgment workflow | MEDIUM | MEDIUM-HIGH | P2 |
| Structured interview kits/scorecards | MEDIUM | HIGH | P2 |
| Workflow visual DAG builder | MEDIUM | HIGH | P3 |
| Agent version diffing | LOW-MEDIUM | HIGH | P3 |
| Multi-framework GRC mapping | LOW (for this product) | VERY HIGH | P3 (likely never, for this milestone's context) |

**Priority key:**
- P1: Must have for this milestone's "no fake data, zero 404s" definition of done
- P2: Should have, defer to next milestone without blocking this one
- P3: Nice to have, future consideration / possibly out of scope permanently for this product surface

---

## Competitor Feature Analysis

| Feature | Reference Product A | Reference Product B | CerebroHive v1 Approach |
|---------|---------------------|----------------------|--------------------------|
| Agent builder + model picker | LangSmith (framework-agnostic, multi-model) | Vellum (bidirectional code/UI sync) | Simple form-based CRUD + AI Gateway provider list; no bidirectional sync, no framework-agnostic abstraction needed (already single-gateway) |
| Agent test/run | LangSmith playground with tracing | Vellum's evaluation-integrated run | Basic run + raw output/trace display; defer evaluation scoring |
| Workflow builder | n8n (full visual DAG, 400+ node types) | Retool Workflows (code + UI hybrid) | Ordered agent-stage list/form (matches actual engine capability today); defer visual DAG until engine supports more than agent stages |
| Hiring pipeline | Greenhouse (deep stage config, interview kits, 500+ integrations) | Lever (ATS+CRM combined) | Stage-based candidate list scoped to internal use only; no CRM/sourcing, no external integrations |
| Assessment tools | Greenhouse (skills-test library + structured scorecards) | — | Question Bank + Assessment Builder CRUD; defer scorecards/structured interview kits |
| Policy management | Vanta/Drata/Sprinto (continuous monitoring, evidence automation, framework mapping) | — | Simple Policy CRUD + version/status, no framework mapping or automated evidence — this is a lightweight internal policy registry, not a GRC product |
| Template marketplace | n8n (9,300+ community templates, category browse, one-click deploy) | Zapier (curated gallery) | First-party curated catalog (no external submissions), "use template" instantiates into real Agent/Workflow — matches n8n's core value prop at much smaller scale |

---

## Gaps to Address (flag for roadmap / requirements phase)

- **Policy/Compliance schema existence unconfirmed.** ARCHITECTURE.md's named Prisma domain list (Tenant/Workspace/User, Agent*, Workflow*, Metric/Alert/HealthCheck/Incident, Organization/billing, ArchiveDocument*) does not mention a Policy or Compliance model. Before sizing the Governance phase, confirm in `packages/db`/`prisma/schema.prisma` whether one exists. If not, this is schema-extension work (permitted per PROJECT.md when "a genuine gap exists"), not pure wiring — raises Governance's real complexity.
- **Template/Marketplace schema existence unconfirmed.** Same gap for Explore — no MarketplaceItem/Template model named in ARCHITECTURE.md.
- **Candidate/Hiring/Assessment schema existence unconfirmed.** ARCHITECTURE.md's domain list doesn't mention Talent OS models either. All three of Governance, Explore, and Talent OS may need schema-existence confirmation before phase sizing — this is the single biggest open question this research surfaces, since it directly changes each area from "wiring" (cheap) to "schema design + wiring" (materially more expensive) if models don't already exist. Recommend a fast pre-roadmap check of `packages/db/prisma/schema.prisma` for these three areas specifically.
- **"Quantiva ERP" is named once in PROJECT.md Active scope with zero other context anywhere in the read documents.** Its actual expected functionality is unknown — could mean anything from "a placeholder page" to "an ERP integration." Flag explicitly for the requirements/roadmap phase rather than guessing.
- **Execution persistence limitation (`InMemoryExecutionRepository`) is a known, documented gap** in ARCHITECTURE.md with a PR reportedly in progress on a `hiveforge` branch. Roadmap should confirm whether that PR has landed before committing to "execution history" as a table-stakes feature for AI Studio/Workflows — if it hasn't landed, execution history is only honestly "real" within a single server process lifetime, which itself needs to be surfaced as a caveat rather than silently presented as durable history.

## Sources

- LangSmith platform pages — https://www.langchain.com/langsmith-platform, https://www.langchain.com/langsmith/evaluation (MEDIUM confidence, WebSearch-derived summary of official product pages)
- Vellum "Top 13 AI Agent Builder Platforms for Enterprises" — https://www.vellum.ai/blog/top-13-ai-agent-builder-platforms-for-enterprises (MEDIUM confidence, vendor blog but describes category norms consistent with known agent-builder UX patterns)
- ATS comparison articles (Greenhouse/Lever/Ashby) — https://www.outsail.co/post/greenhouse-vs-lever-vs-ashby, https://theundercoverrecruiter.com/greenhouse-vs-lever-vs-workable-vs-bullhorn/, https://www.hiretruffle.com/blog/greenhouse-vs-lever (MEDIUM confidence, multiple independent comparison sources agree on core feature set)
- GRC tooling overviews — https://sprinto.com/blog/grc-tools/, https://sprinto.com/blog/saas-grc/, https://hackernoon.com/12-best-governance-risk-and-compliance-grc-tools-and-software-for-2026-compared (MEDIUM confidence, vendor/industry blogs, cross-referenced across 3 sources for consistency)
- n8n template marketplace docs and coverage — https://docs.n8n.io/workflows/templates/, https://connectsafely.ai/articles/n8n-templates-workflow-automation-examples (MEDIUM-HIGH confidence, includes official n8n docs)
- `.planning/PROJECT.md` (this repo) — HIGH confidence, primary source of milestone scope/constraints
- `.planning/codebase/ARCHITECTURE.md` (this repo) — HIGH confidence, primary source of existing system capability and known limitations

---
*Feature research for: CerebroHive Studio dashboard functional program (subsequent milestone)*
*Researched: 2026-08-09*
</content>
</invoke>
