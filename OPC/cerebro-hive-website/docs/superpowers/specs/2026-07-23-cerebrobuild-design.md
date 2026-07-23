# CerebroBuild™ — AI Software Engineering Platform: Target Architecture

**Status:** Draft — approved as target architecture, pending implementation sequencing
**Governing Documents:** `CEREBROHIVE_CONSTITUTION.md`, `CAPABILITY_ARCHITECTURE.md`, `PRODUCT_REGISTRY.md`
**Relationship to existing products:** New Cerebro Application. Distinct from `HiveForge™` (agent-authoring/fine-tuning dev platform) — CerebroBuild generates *applications*, HiveForge builds *agents*. Built as a capability layered onto the existing `apps/studio/agentos` runtime, not a parallel service stack.

---

## 1. Vision & Positioning

CerebroBuild is the **Software Engineering capability of the CerebroHive Enterprise AI Operating System**. It is not "an AI app builder" bolted onto the platform — it is what AgentOS becomes when its existing primitives (agent runtime, workflow engine, tool framework, memory, governance) are pointed at the software development lifecycle itself.

The conceptual shift from earlier drafts of this design:

> "Generate a web app" → "Execute a software engineering lifecycle through a capability-driven multi-agent platform."

Long-term north star (realized incrementally, see §11 Rollout Sequencing, Phase 6):

```
Generate → Validate → Deploy → Observe → Improve → Refactor → Upgrade → Repeat
```

CerebroBuild does not stop at code generation. Once a project exists, it becomes a living asset the platform continues to operate on.

---

## 2. Platform Layering

The Capability Graph Engine and Planner are **not CerebroBuild-specific** — they are elevated to core AgentOS platform services, alongside the existing Workflow Engine, Agent Runtime, Tool Runtime, and Memory Runtime. CerebroBuild is the first consumer; HiveForge, CerebroFlow, and future products can execute capability graphs against these same services later.

```
AgentOS (apps/studio/agentos)
│
├── Workflow Engine        (existing — DAG executor, retries, approval nodes)
├── Capability Graph Engine (new — core platform service)
├── Agent Runtime          (existing)
├── Tool Runtime           (existing)
├── Memory Runtime         (existing)
└── Agent Registry         (existing — extended to a general Capability Registry, see §4)
        │
        ▼
CerebroBuild (new — a capability graph + agent roster + UI registered on top)
```

This keeps the architectural rule from `CAPABILITY_ARCHITECTURE.md` intact: platform services live in the shared runtime; products consume them.

---

## 3. Capability Graph, Planner, and Workflow Compiler

A **capability** and a **workflow** are distinct concepts. The capability graph is a declarative, reusable description of *what can be done*; a workflow is *one concrete execution* of a subset of it for one project.

```
Prompt
  ↓
Project Planner        — decides which capabilities, agents, stack, and approval
  ↓                       gates a given project actually needs
Capability Selection
  ↓
Workflow Compiler       — compiles the selected capability subgraph into a
  ↓                       concrete AgentOS Workflow DAG
Workflow DAG
  ↓
Execution
```

Each node in the capability graph is:

```
Capability → Required Agent → Required Tools → Output Contract → Next Capability(ies)
```

Edges may be conditional (e.g. skip `database-design` if the Planner determines the project is stateless). This is what makes the graph reusable across project types without hand-authoring a new DAG per stack/vertical.

---

## 4. Metadata Registries (Technology Catalog)

Everything the graph references is registered data, not hardcoded logic — extending the Agent Registry AgentOS already has (`Agent Registry — ✅ Full CRUD, versioned`) into a general Capability Registry:

| Registry | Contents |
|---|---|
| **Agent Registry** *(existing)* | The 14 engineering agents (§5), versioned |
| **Capability Registry** | Capability definitions (id, description, required output contract, required tools) |
| **Output Contract Registry** | Versioned schemas (§6) |
| **Validator Registry** | Validation pipeline stage definitions (§7) |
| **Tool Chain Registry** | Tool bundles a capability needs (e.g. "Next.js frontend toolchain") |
| **Stack Definitions (Technology Catalog)** | `Framework → Template → Validator → Builder → Docker Image`, one row per supported stack (§5.1) |

Adding a new framework (e.g. SolidJS) later means adding a Stack Definition row, not writing new orchestration code.

---

## 5. Agent Roster

Fourteen specialist agents, registered in the existing Agent Registry:

Business Analyst → Product Manager → Requirements Engineer → Solution Architect → UI/UX Designer → Frontend Engineer → Backend Engineer → Database Architect → API Engineer → QA Engineer → Security Engineer → DevOps Engineer → Documentation Agent → Deployment Agent

The Planner (§3) decides which of these a given project actually invokes — not every project needs Database Architect or Backend Engineer.

### 5.1 Stack Menu (Technology Catalog entries)

- **Frontend**: React, Vue, Angular, Svelte, Next.js, Nuxt, Flutter, React Native
- **Backend**: Spring, FastAPI, NestJS, Go, .NET, Laravel
- **Desktop**: Electron, Tauri, .NET MAUI

Solution Architect selects from the catalog against project requirements; the choice is stored as a structured `target_stack` object (frontend/backend/database/deployment), not a single string. **Note on scope**: this is the full target catalog. Each entry requires its own Docker build image, codegen prompt template, and validator — building and testing all 17 is a large surface; §11 sequences catalog entries across phases rather than shipping them simultaneously.

---

## 6. Output Contracts

Each capability emits a typed, versioned schema rather than free text:

```
<Capability>Specification
  version           — schema version, e.g. "1.0"
  schema            — the Pydantic/JSON schema itself
  producer          — which agent produced it
  consumer          — which capabilities/agents consume it
  validation_rules  — structural checks applied before hand-off
```

Contracts: `BusinessAnalysis`, `ProductSpecification`, `RequirementsSpecification`, `ArchitectureSpecification`, `DesignSpecification`, `FrontendSpecification`, `BackendSpecification`, `DatabaseSchema`, `APISpecification`, `TestSpecification`, `SecurityReport`, `DeploymentPlan`, `Documentation`.

Versioning means a contract can evolve (e.g. `ArchitectureSpecification` v1.1 adds a field) without breaking workflows still compiled against v1.0 — the Workflow Compiler checks producer/consumer contract versions at compile time.

---

## 7. Validation Pipeline

Each generated project passes through individually observable stages:

```
Generate → Format → Lint → Type Check → Build → Unit Tests
  → Security Scan → Dependency Health → Secrets Detection → SBOM Generation
  → Accessibility → License Compliance → Performance Checks
  → Screenshot → Package
```

Concrete tooling (named explicitly so this isn't a vague checklist):
- **Security Scan**: `semgrep` (or stack-equivalent static analysis)
- **Dependency Health**: `npm audit` / OSV-Scanner equivalent per stack
- **Secrets Detection**: `gitleaks` — already a convention in this repo (`.gitleaks.toml` at root); CerebroBuild reuses the same tool against generated code
- **SBOM Generation**: `syft`
- **Accessibility**: `axe-core` for web targets
- **License Compliance**: `license-checker` equivalent per package manager
- **Performance Checks**: Lighthouse CI for web targets

Every stage's pass/fail and output is recorded individually (not collapsed into one opaque "build" result), feeding both the `execution_graph` on `BuildRun` and the Workspace's Build Status panel.

---

## 8. Failure Handling

Reframed from a retry loop to a diagnostic cycle:

```
Failure → Diagnosis → Planning → Repair → Validation → Learning
```

- **Diagnosis**: classify the failure (syntax / runtime / dependency / architecture / security)
- **Planning**: route to the matching specialist agent (Frontend/Backend Engineer for syntax/runtime, Backend Engineer/Database Architect for dependency, Solution Architect for architecture-level failures, Security Engineer for security findings)
- **Repair**: the specialist agent produces a fix
- **Validation**: re-run the relevant pipeline stage(s), not the whole pipeline
- **Learning**: the failure + fix is recorded (feeds the knowledge graph, §9) so repeated failure patterns are visible over time, not just resolved in isolation

Capped at 3 attempts per stage; exhausting retries surfaces to a human approval gate (§10) rather than failing silently.

---

## 9. Knowledge Graph

Persisted as relational tables in the existing Postgres/SQLite (`GraphNode`, `GraphEdge`) — **not** a separate graph database (Neo4j). This is the one place earlier drafts already converged with the user's own recommendation: reuse existing infra now, revisit only if query patterns genuinely outgrow relational joins.

Node types: Requirements, Architecture Decisions, Components, Services, APIs, Database Entities, Test Coverage, Deployments, Documentation, Generated Artifacts.

Edge types are relationship-typed (e.g. `requirement → satisfied_by → component`, `component → tested_by → test`, `component → deployed_as → deployment`). This graph is CerebroBuild's persistent engineering memory — it's what makes future "modify this existing project" requests possible instead of every change being a fresh generation.

---

## 10. Data Model

- **Project** — id, name, owner_id, status, original_prompt, target_stack (structured), latest_build_id, metadata JSON, timestamps
- **BuildRun** — id, project_id FK, workflow_run_id FK (links into AgentOS's existing workflow execution tracking), status, phase, progress, estimated_completion, cost_tokens, provider, model, execution_graph (JSON snapshot of the resolved capability graph), execution_time, quality_score, security_score, performance_score, all output-contract documents (requirements/architecture/design/etc., each JSON conforming to its versioned schema), fix_attempts, screenshot_path, deployment_plan, documentation, error_message, timestamps
- **Artifact** — id, build_id FK, path, type, language, checksum, version, generator, size, hash, created_at
- **GraphNode / GraphEdge** — the knowledge graph (§9)
- **CapabilityDefinition / OutputContractDefinition / StackDefinition / ValidatorDefinition** — the metadata registries (§4)

---

## 11. Human Approval

Uses AgentOS's existing approval-queue workflow nodes (already built: *"Human-in-the-Loop — ✅ Approval queue, pause/resume execution"*). Optional gates after Requirements / Architecture / Generation / Deployment-plan.

Target tiers (architecture supports all; initial implementation ships Auto and Manual Gate only — see §12 Phase 5 for the rest):

```
Auto → Single Reviewer → Two Reviewers → Enterprise Policy → Manual Gate
```

---

## 12. Deployment Scope

Deployment Agent produces a **Deployment Plan** artifact (Dockerfile, docker-compose, runbook: target platform, env vars, steps) — it does **not** push to a live URL. The platform first becomes excellent at generating and validating software before taking responsibility for live infrastructure changes. The Deployments workspace panel displays this plan, not a link.

---

## 13. Execution Provider (Sandboxing)

Build/validate execution runs behind an `ExecutionProvider` interface, not a hardcoded Docker call:

```
ExecutionProvider
  ├── Docker        (implemented first)
  ├── Podman
  ├── Kubernetes
  ├── Firecracker
  └── Remote Builder
```

Only Docker is implemented initially; the interface exists so later providers are additive, matching AgentOS's existing pattern of "interfaces now, production infra as a documented swap-in."

---

## 14. Workspace UI

`apps/build` — 13 panels, all wired to real backend data (no empty chrome):

Prompt, Requirements, Architecture, Design, Code Explorer, Live Preview, Console, Build Status, Artifacts, Tests, Documentation, Deployments, History, **Engineering Graph** (visualizes the knowledge graph — relationships between requirements, components, services, APIs, tests, deployments).

---

## 15. Rollout Sequencing (for the GSD roadmap)

This architecture is the target design, not one implementation phase. It sequences as:

**Phase 1 — Core Pipeline**: Capability Graph Engine, Planner, Workflow Compiler, Next.js stack only, Frontend generation, build validation (Generate→Format→Lint→TypeCheck→Build), Docker execution provider.

**Phase 2 — Engineering Assets**: Knowledge Graph, Artifact management, Project workspace shell, History, Documentation panel.

**Phase 3 — Multi-Agent Expansion**: Backend Engineer, Database Architect, API Engineer, QA Engineer, Security Engineer agents; Backend/Database/API generation; Security Scan, Dependency Health, Secrets Detection, SBOM stages.

**Phase 4 — Multi-Stack Support**: remaining Technology Catalog entries (React, Vue, Angular, Spring, FastAPI, Go, Flutter, React Native, Electron, Tauri, ...), added incrementally as Stack Definition entries.

**Phase 5 — Enterprise Engineering**: Deployment planning, full human-approval tier support, governance/policy enforcement, cost optimization, observability, Accessibility/License Compliance/Performance Checks stages.

**Phase 6 — Autonomous Engineering**: continuous improvement loop (observe → improve → refactor → upgrade → repeat), self-healing workflows, technical debt analysis — realizing the §1 north star.

---

## 16. Open Items for Implementation Planning

These are flagged, not resolved, here — they belong in Phase 1 planning:
- Exact Pydantic schema definitions for each output contract
- Capability Graph Engine's storage format (is the graph itself versioned/stored as data, or code-defined initially with data-driven storage added in a later phase?)
- Whether Requirements/Architecture approval gates default to Auto or Manual for the Phase 1 MVP
