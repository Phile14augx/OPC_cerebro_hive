# Cerebro Nexarch — Agentic Operating System Architecture

## Overview

Cerebro Nexarch treats **Agent** as a first-class platform primitive.
An agent is not `prompt + model + tools`.
It is a full computational entity with an operating identity, lifecycle,
resource budget, capability set, delegation rights, memory access, audit
trail, and runtime state — analogous to how a traditional operating system
treats a process.

```
                    HUMAN CONTROL PLANE
                           │
                           ▼
                CEREBRO NEXARCH
            AGENTIC OPERATING SYSTEM
                           │
  ┌────────────────────────┼─────────────────────────┐
  │                        │                         │
  ▼                        ▼                         ▼
Agent Kernel           Scheduler              Policy Engine
  │                        │                         │
  ├──────────────┬──────────┴────────┬───────────────┤
  ▼              ▼                   ▼               ▼
Memory        Model Gateway      Tool Gateway     Event Bus
  │              │                   │               │
  ▼              ▼                   ▼               ▼
Knowledge      Models            MCP/APIs        Agent IPC

           OBSERVABILITY PLANE
    Traces • Audit • Cost • Metrics • Lineage
```

---

## Core Abstractions

### Agent as OS Primitive

| OS Concept        | Agentic OS Equivalent          |
|-------------------|-------------------------------|
| Process           | AgentInstance (ACB)            |
| PCB               | AgentControlBlock              |
| Program/Executable| AgentDefinition                |
| Process Table     | Agent Registry                 |
| Scheduler         | Mission/Task Scheduler         |
| IPC               | Agent Message Bus (NATS/events)|
| Memory            | Hierarchical Agent Memory      |
| Device Driver     | Tool Gateway Adapter           |
| Filesystem        | Agent Artifact Store           |
| System Call       | Governed Tool Invocation       |
| Kernel            | Agent Kernel                   |
| ACL               | Capability-Based Permissions   |
| Audit Log         | Immutable AuditEvent trail     |

---

## Packages

### `packages/kernel-core`
The authoritative control plane for agent lifecycle.

- `AgentDefinition` — immutable blueprint (class)
- `AgentControlBlock` — mutable runtime instance (PCB equivalent)
- `lifecycle.ts` — complete state machine with validated transitions
- `kernel.ts` — `HiveKernel` registers definitions, spawns ACBs, routes events
- `scheduler.ts` — `AgentScheduler` priority queue with dependency resolution
- `delegation.ts` — `DelegationManager` scoped parent→child delegation with bounded budgets
- `watchdog.ts` — heartbeat monitor, runaway-loop detection, auto-quarantine

### `packages/runtime-core`
Domain models for the execution layer.

- `Mission` — business-level objective with event log
- `Task` — executable unit within a mission (dependency DAG)
- `ExecutionRun` — one attempt to complete a task (model/tool invocation records)

### `packages/governance-core`
Policy, budget, and approval enforcement.

- `PolicyEngine` — ALLOW / DENY / REQUIRE_APPROVAL / RATE_LIMIT / QUARANTINE
- `BudgetEnforcer` — token + cost + time limits with WARN / THROTTLE / DENY
- `ApprovalService` — human-in-the-loop approval workflow
- `AuditTrail` — append-only event records
- `RiskEngine` — dynamic risk scoring per action

### `packages/memory-sdk`
Hierarchical agent memory.

- L0 — Active context (current model window)
- L1 — Working memory (mission/task state)
- L2 — Episodic memory (past executions)
- L3 — Semantic memory (facts, knowledge)
- L4 — Procedural memory (skills, patterns)
- L5 — Organizational memory (institutional knowledge)
- L6 — Archive (compliance retention)

---

## Agent Lifecycle State Machine

```
REGISTERED
    ↓
INITIALIZING ──→ FAILED
    ↓
READY
    ↓
QUEUED
    ↓
RUNNING ──→ WAITING ──┐
    │   ──→ PAUSED ───┤──→ RUNNING
    │   ──→ BLOCKED ──┘
    ↓
COMPLETED

Failure: RUNNING → FAILED → RETRYING → RUNNING
Admin:   RUNNING → SUSPENDED
         ANY     → TERMINATED
         ANY     → QUARANTINED
```

---

## API Surface

```
/api/nexarch/agents          GET, POST
/api/nexarch/agents/:id      GET, PATCH, DELETE
/api/nexarch/agents/:id/lifecycle  POST (start/pause/resume/terminate/quarantine)

/api/nexarch/missions        GET, POST
/api/nexarch/missions/:id    GET, PATCH, POST (action)
/api/nexarch/missions/:id/events  GET, POST

/api/nexarch/tasks           GET, POST
/api/nexarch/tasks/:id       GET, PATCH

/api/nexarch/approvals       GET, POST
/api/nexarch/approvals/:id/action  POST (approve/reject)

/api/nexarch/tools           GET
/api/nexarch/policies        GET, PATCH

/api/nexarch/events          GET (audit trail)
/api/nexarch/metrics         GET (aggregated stats)
/api/nexarch/stream          GET (SSE real-time feed)
```

---

## Data Persistence

The development tier uses a JSON file store at `data/agent-os.json`,
mirroring the existing `data/db.json` pattern.  All Next.js API routes
under `/api/nexarch/` are tagged `force-dynamic` and use the same
`withLock` write-serialisation pattern as `lib/db.ts`.

Production upgrade path: replace `lib/agent-os/store.ts` with a
Prisma-backed adapter against the existing PostgreSQL instance.

---

## Tool Gateway

```
Agent
  ↓
Tool Gateway (lib/agent-os/store.ts → tools collection)
  ↓ permission check
  ↓ policy check          ← governance-core/PolicyEngine
  ↓ schema validation
  ↓ rate limit check
  ↓ credential broker
  ↓ execution
  ↓ result validation
  ↓ audit record          ← lib/agent-os/store.ts recordAudit()
Result
```

---

## Security Model

- **Capability-based**: `email.send`, `crm.customer.read`, etc.
- **Delegation-scoped**: child agents inherit a bounded subset of parent capabilities
- **Tenant-isolated**: all entities carry `tenantId` — queries must filter by tenant
- **Budget-bounded**: every execution has token + cost + time ceilings
- **Policy-enforced**: high-risk actions require approval or are denied outright
- **Auditable**: every sensitive action appends an `AuditEvent` record

---

## Command Center UI

Mounted at `/nexarch/` in the existing Next.js application:

| Route                          | View                        |
|--------------------------------|-----------------------------|
| `/nexarch`                     | Command Center dashboard    |
| `/nexarch/agents`              | Agent Registry              |
| `/nexarch/agents/:id`          | Agent detail + lifecycle    |
| `/nexarch/missions`            | Mission Control             |
| `/nexarch/missions/:id`        | Mission timeline + tasks    |
| `/nexarch/approvals`           | Approval inbox              |
| `/nexarch/topology`            | Live React Flow graph       |
| `/nexarch/governance`          | Policies + budgets          |
| `/nexarch/observability`       | Metrics + audit trail       |
