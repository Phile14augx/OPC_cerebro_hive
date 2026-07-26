# Task Tracker: AgentOps HiveSwarm Execution Engine Deep Dive

## Phase 1: Core Models & SDK Updates (packages/swarm-sdk)
- `[x]` Update `DAG.ts` to include full Node State Machine (`PENDING`, `READY`, `RUNNING`, `COMPLETED`, `FAILED`, `RETRYING`, `SKIPPED`, `CANCELLED`)
- `[x]` Define `ExecutionProfile` (cpu, memory, timeout, retryPolicy)
- `[x]` Define `TaskContext` and `ExecutionState` models
- `[x]` Define structured Event taxonomy (`NODE_READY`, `TASK_SKIPPED`, etc.)

## Phase 2: State & Artifact Management (services/swarm-runtime)
- `[x]` Implement `ExecutionStateStore` (PostgreSQL/Mock backed)
- `[x]` Implement `ArtifactStore` (Object storage reference system)

## Phase 3: Resource-Aware Scheduler (services/swarm-runtime)
- `[x]` Implement `WorkerPool` with CPU/Memory capacity tracking
- `[x]` Implement `DagOrchestrator` (In-degree calculation, Ready Queue, Branch-local failures)
- `[x]` Implement Event-Driven Dispatch Loop (`dispatch()` triggers on capacity or ready tasks)

## Phase 4: Execution Engine Integration
- `[x]` Wire `DagOrchestrator`, `WorkerPool`, `ExecutionStateStore`, and `ExecutionProvider` together
- `[x]` Support Cooperative Cancellation (Cancellation Tokens)
