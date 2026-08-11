# Chapter 2 — Domain-Driven Design & Bounded Contexts

> As in Chapter 1: ✅ built and tested today · 🟡 partially built · ⬜ target, not yet built.
> This chapter documents the boundaries the *existing* `agentos/` codebase already has (each
> bounded context maps onto a real `models/*.py` + `core/*.py` file today) and is honest about
> where the MVP currently blurs a boundary a production system would keep hard.

## 2.1 Why DDD matters here specifically

AgentOS's core risk is not "can we call an LLM" — it's "can twenty engineering teams each add an
agent, a tool, a policy, or a workflow without their changes silently corrupting each other's
data or assumptions." Bounded contexts are the mechanism for that: each context owns its own
data, its own invariants, and talks to other contexts only through explicit, narrow contracts.
Chapter 3's schema and Chapter 4's package layout both derive directly from the boundaries drawn
here — get this chapter wrong and every later one inherits the mistake.

## 2.2 Ubiquitous language

| Term | Meaning | Owning context |
|---|---|---|
| **Agent** | A registered, versioned worker with capabilities, permissions, an LLM/reasoning/memory profile, and a lifecycle state | Agent Registry |
| **Run** | One invocation of the Agent Runtime Kernel against a goal, from `idle` through `completed`/`failed`/`pending_approval` | Execution |
| **WorkflowRun** | One execution of a DAG of nodes (tool/condition/approval/loop/**agent**/**agent_vote**/finish) | Execution |
| **Policy** | A declarative rule (`if` condition → `require_approval` \| `block`) evaluated before a Run's first step | Governance |
| **Approval** | A pending human decision blocking a specific Run (or a WorkflowRun's approval node) | Governance |
| **MemoryItem** | A single record in one of six memory tiers (working/short-term/long-term/semantic/episodic/procedural) | Memory |
| **Document / Chunk** | A source document and its embedded, retrievable slices | Knowledge |
| **ToolDefinition / SkillPackage** | A permissioned, schema'd capability an agent can invoke; a versioned bundle of such capabilities | Tools & Skills |
| **TraceSpan / MetricEvent / EventLogEntry** | A timed step in a Run's execution; a numeric measurement; an append-only domain event | Observability |
| **AgentTemplate / Installation** | A marketplace-installable agent definition; a record of one such install | Marketplace |
| **ContextBundle** | The fused Memory + Knowledge + applicable-Policy view assembled for one reasoning step | Context Engine (read model, no aggregate of its own — see §2.3.10) |

## 2.3 Bounded contexts

Each context below is listed with its aggregate root(s), the invariant(s) it's actually
responsible for enforcing, and the files that implement it today.

### 2.3.1 Identity & Access
- **Aggregate root:** `APIKey` (Organization exists as a model but nothing enforces
  organization-scoped isolation yet — see §2.7).
- **Invariant:** a revoked key can never authenticate (`APIKey.revoked`).
- **Files:** `models/identity.py`, `security.py`.
- **Target gap:** no RBAC/ABAC, no JWT, no per-org scoping (Ch. 13).

### 2.3.2 Agent Registry
- **Aggregate root:** `Agent`.
- **Invariant:** `slug` is globally unique; `lifecycle_state` only ever holds one of the nine
  documented runtime states at a time (enforced by convention in `runtime.py`, not a DB
  constraint — a real gap, see §2.7).
- **Files:** `models/registry.py`, `api/routers/agents.py`.

### 2.3.3 Execution (Agent Runtime Kernel + Workflow Engine)
- **Aggregate roots:** `Run`, `WorkflowRun`.
- **Invariant:** governance is evaluated before the first step of any `Run` executes — no code
  path in `runtime.execute()` can reach a tool or LLM call before that check (§1.4, principle 1).
- **Files:** `models/execution.py`, `core/runtime.py`, `core/planner.py`, `core/workflow_engine.py`.
- **Sub-concept — the Agent Mesh:** `agent` and `agent_vote` workflow nodes are how the Execution
  context calls back into *itself* recursively (a WorkflowRun's node dispatches a brand new
  `Run` against a different `Agent`). This is intentionally a same-context recursive call, not a
  cross-context one — the delegated Run goes through the exact same governance/planning path as
  any top-level Run, which is what makes the delegation "real" rather than a shortcut.

### 2.3.4 Memory
- **Aggregate root:** `MemoryItem`.
- **Invariant:** every item belongs to exactly one agent and one of six named tiers.
- **Files:** `models/memory.py`, `core/memory_engine.py`.
- **Target gap:** embeddings are a local hashing scheme (`core/embeddings.py`), not a real model
  (Ch. 7).

### 2.3.5 Knowledge
- **Aggregate root:** `Document` (with `Chunk` as a dependent entity, not independently
  addressable outside its parent document).
- **Invariant:** a `Chunk` cannot outlive its `Document` (no cascade delete enforced yet — gap).
- **Files:** `models/knowledge.py`, `core/knowledge_engine.py`.

### 2.3.6 Tools & Skills
- **Aggregate roots:** `ToolDefinition`, `SkillPackage`.
- **Invariant:** a tool invocation is refused if the caller's permission list doesn't include
  `execute` (`tool_framework.invoke`) — this is enforced at the function boundary, which is also
  where an MCP server or REST/GraphQL-backed tool would plug in without changing callers.
- **Files:** `models/tools.py`, `core/tool_framework.py`, `core/skills.py`.

### 2.3.7 Governance
- **Aggregate roots:** `Policy`, `Approval`, `AuditLog`.
- **Invariant:** an `Approval` can only transition `pending → approved` or `pending → rejected`
  once (`decide_approval` checks `approval.status != "pending"` before allowing a decision).
- **Files:** `models/governance.py`, `core/governance_engine.py`, `api/routers/governance.py`.
- **Cross-context responsibility:** Governance is upstream of Execution (evaluated before a Run
  starts) and is queried read-only by the Context Engine (to surface "which policies apply to
  this agent right now" without re-implementing evaluation).

### 2.3.8 Observability
- **Aggregate roots:** `TraceSpan`, `MetricEvent`, `EventLogEntry` — all append-only, all
  write-once.
- **Invariant:** nothing in Observability ever mutates a row written by another context; it only
  ever receives writes (`observability.span()`, `record_metric()`, `event_bus.publish()`) and
  serves reads.
- **Files:** `models/observability.py`, `core/observability.py`, `core/event_bus.py`.

### 2.3.9 Marketplace
- **Aggregate roots:** `AgentTemplate`, `Installation`.
- **Invariant:** installing a template creates a new `Agent` (Agent Registry aggregate) plus one
  `Installation` record — the Marketplace context does not own the resulting Agent after install;
  it only records that the install happened. This is a deliberate hand-off, not a shared
  aggregate.
- **Files:** `models/marketplace.py`, `api/routers/marketplace.py`.

### 2.3.10 Context Engine — a read model, not a context
`context_engine.assemble()` fuses Memory retrieval + Knowledge retrieval + Governance's
applicable-policy list into one ranked `ContextBundle`. It deliberately owns no aggregate and no
table: it is a composed read across three other contexts' existing query functions
(`memory_engine.retrieve`, `knowledge_engine.retrieve`, a read-only `Policy` query), re-ranked by
score. Treating it as a context in its own right would create a fourth place that has to be kept
in sync with the other three; treating it as a pure function of their outputs means it can never
drift from what `runtime.execute()` actually sees, because it calls the identical functions.

### 2.3.11 Cortex & Simulator — stateless computation contexts
`cortex_engine` (forecast, optimize) and `simulator_engine` (Monte Carlo queueing) are the two
contexts with **no aggregate at all** — every call is a pure function of its input parameters,
persists nothing, and reads nothing from the database. They're included in the bounded-context
map because they're real subsystems with real API surfaces (`/cortex/*`, `/simulator/*`), not
because they own domain data. In DDD terms these are **Domain Services**: stateless operations
that don't naturally belong to any single aggregate's behavior.

## 2.4 Context map

```
                    ┌─────────────┐
                    │ Governance  │  (upstream — evaluated before
                    └──────┬──────┘   every Run; read by Context Engine)
                           │ Customer/Supplier
                           ▼
┌─────────┐        ┌─────────────┐        ┌─────────┐
│ Registry│───────▶│  Execution  │◀───────│  Tools  │
└─────────┘Customer └──────┬──────┘Customer└─────────┘
                           │ Customer
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌────────────┐
        │  Memory  │ │Knowledge │ │Context Eng.│ (composes Memory +
        └──────────┘ └──────────┘ │(read model)│  Knowledge + Governance)
                                   └────────────┘
                           │
                           ▼ (every context publishes here)
                    ┌──────────────┐
                    │Observability │  (downstream of everything)
                    └──────────────┘

Marketplace ──installs into──▶ Registry   (one-time hand-off, not shared ownership)
Cortex, Simulator — standalone Domain Services, no upstream/downstream data dependency
```

## 2.5 Domain events catalog (today)

These are the actual `event_type` strings `EventLogEntry` rows carry today — the seed of a real
event-sourcing/CQRS split in Chapter 12:

| Event | Emitted by | Meaning |
|---|---|---|
| `run.started` | Execution | A Run began governance evaluation |
| `run.blocked` | Execution | A blocking policy stopped a Run before any step ran |
| `run.pending_approval` | Execution | A Run is waiting on one or more Approvals |
| `run.completed` | Execution | A Run finished successfully |
| `workflow.paused_for_approval` | Execution (Workflow Engine) | A workflow's own `approval` node is waiting |
| `mesh.delegated` | Execution (Agent Mesh) | An `agent` node's delegated Run completed |
| `mesh.delegate_pending_approval` | Execution (Agent Mesh) | A delegated Run itself needs approval — parent workflow pauses |
| `mesh.consensus_reached` | Execution (Agent Mesh) | An `agent_vote` node picked a winner |

## 2.6 Honest gaps against strict DDD (today's MVP)

1. **No repository interfaces.** Every context's core engine takes a raw SQLAlchemy `Session`
   and queries its own (and sometimes another context's) models directly — there's no
   `AgentRepository`/`RunRepository` abstraction a context talks through. `governance.py`'s
   router, for instance, queries both `Run` and `WorkflowRun` directly to figure out which kind
   of entity an `Approval` belongs to (§2.3.7), which is a Governance-context router reaching
   into Execution's aggregates without an intermediary. Chapter 4's Go package layout introduces
   repository interfaces per context specifically to close this.
2. **One shared database schema, no per-context namespacing.** All models share one
   `Base.metadata` and one SQLite/Postgres database. Chapter 3 introduces PostgreSQL schemas
   (`identity.*`, `registry.*`, `execution.*`, ...) as real namespace boundaries.
3. **No anti-corruption layer between Execution and Governance/Registry/Tools.** `runtime.py`
   imports and calls into `governance_engine`, `tool_framework`, and queries `Agent` directly.
   This is acceptable inside a single deployable (today, everything is one FastAPI process) but
   is exactly the seam Chapter 4 splits along when these become separate services.
4. **`Agent.lifecycle_state` is a string, not a state machine with enforced transitions.**
   Nothing stops code from setting it to an invalid value; the nine valid states are documented,
   not enforced. A real state machine (or a Postgres `CHECK` constraint / enum type) is a
   Chapter 3 fix.

## 2.7 Package/module map

| Bounded context | Models | Core engine(s) | Router(s) |
|---|---|---|---|
| Identity & Access | `models/identity.py` | `security.py` | `api/routers/auth.py` |
| Agent Registry | `models/registry.py` | — | `api/routers/agents.py` |
| Execution | `models/execution.py` | `core/runtime.py`, `core/planner.py`, `core/workflow_engine.py` | `api/routers/runtime.py`, `api/routers/workflows.py` |
| Memory | `models/memory.py` | `core/memory_engine.py`, `core/embeddings.py` | `api/routers/memory.py` |
| Knowledge | `models/knowledge.py` | `core/knowledge_engine.py` | `api/routers/knowledge.py` |
| Tools & Skills | `models/tools.py` | `core/tool_framework.py`, `core/skills.py` | `api/routers/tools.py`, `api/routers/skills.py` |
| Governance | `models/governance.py` | `core/governance_engine.py` | `api/routers/governance.py` |
| Observability | `models/observability.py` | `core/observability.py`, `core/event_bus.py` | `api/routers/observability.py` |
| Marketplace | `models/marketplace.py` | — | `api/routers/marketplace.py` |
| Context Engine (read model) | — | `core/context_engine.py` | `api/routers/context.py` |
| Cortex (domain service) | — | `core/cortex_engine.py` | `api/routers/cortex.py` |
| Simulator (domain service) | — | `core/simulator_engine.py` | `api/routers/simulator.py` |

Chapter 3 takes this table and derives a real PostgreSQL schema per row that has one (nine of
the twelve contexts above own persistent state; three are pure domain services).
