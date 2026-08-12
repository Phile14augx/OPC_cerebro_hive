# 0009: CerebroEDA Workflow Substrate

**Decision ID:** D4
**Gates:** Phase 2 (Flow Platform)
**Date:** 2026-08-01

## Status

Accepted

## Context

CerebroEDA flow runs are long-lived, expensive, and partially irreversible. A physical design run may execute for 40 hours across a dozen stages, consume scarce licence tokens, produce hundreds of gigabytes of artifacts, and block on a human approval gate for a working day. The substrate that carries this state determines the shape of `flow-service`, `job-service`, the event contracts between them, and the failure semantics the whole product inherits.

The requirements that discriminate between candidates:

1. **Durable execution.** A control-plane restart mid-run must not lose the run. Recovery is not "retry the workflow" — the 12-hour synthesis that already completed must not re-run.
2. **Durable waits.** Approval gates and licence backpressure mean a run may sit idle for hours or days holding no compute. Timers must survive process death.
3. **Dynamic fan-out.** A regression stage expands to 10,000 jobs whose count is known only at runtime, with configurable partial-failure policy (continue / halt / threshold).
4. **Idempotency.** At-least-once event delivery means every step may be attempted more than once. The substrate must make idempotent step execution the default path, not something each service hand-rolls.
5. **Compensation, not rollback.** You cannot un-run synthesis. Compensation here means releasing licence claims, marking state unambiguously, and notifying — never semantic undo.
6. **Inspectability.** A CAD engineer debugging a stuck run must see exactly which step is waiting on what. Opaque orchestration state is a support burden that scales with customers.
7. **Air-gap deployability.** Anything requiring a hosted control service is disqualified outright (Blueprint §3.1).
8. **Mesh coherence.** The Constitution requires that CerebroEDA introduce no infrastructure primitive an existing Hive product already provides (Blueprint §1.2).

Requirement 8 is in tension with requirements 1–4. `CerebroFlow` is the mesh's orchestration product, but it was designed for business process automation — minute-scale DAGs over business entities, not day-scale DAGs over compute jobs with resource reservations.

## Decision

**We adopt Temporal as the durable execution engine, wrapped behind a `packages/workflow` façade, and register CerebroEDA flows as a CerebroFlow execution provider rather than reimplementing CerebroFlow's authoring surface.**

Three layers, with a strict division of responsibility:

```
┌─────────────────────────────────────────────────────────┐
│ CerebroFlow                                             │
│   Flow authoring UI, versioning, catalogue, permissions │
│   Registers "eda.*" node types via the node plugin API  │
└───────────────────────────┬─────────────────────────────┘
                            │ compiles to
┌───────────────────────────▼─────────────────────────────┐
│ flow-service  —  EDA semantics                          │
│   Tool version pinning · PDK binding · licence hints    │
│   Stage graph validation · reproducibility key          │
└───────────────────────────┬─────────────────────────────┘
                            │ executes via packages/workflow
┌───────────────────────────▼─────────────────────────────┐
│ Temporal  —  durable execution                          │
│   Event-sourced state · durable timers · signals        │
│   Activity retries · heartbeats · child workflows       │
└─────────────────────────────────────────────────────────┘
```

- **CerebroFlow owns authoring.** Users compose EDA flows in the same surface they compose every other CerebroHive workflow. We do not build a second flow editor. This satisfies requirement 8 where it actually matters — the user-facing primitive.
- **Temporal owns execution.** Durable state, timers, retries, and signals are solved problems and we will not solve them again in application code.
- **`flow-service` owns the EDA domain.** Nothing about licences, PDKs, or tool digests leaks into either layer above or below.

### Execution semantics

| Concern | Decision |
|---|---|
| Workflow granularity | One Temporal workflow per `FlowRun`; one child workflow per stage; one activity per `Job` dispatch |
| Determinism | Workflow code contains no I/O, no clocks, no randomness — all side effects are activities |
| Job dispatch | Activity submits to the compute backend and returns immediately; completion arrives by signal, not polling |
| Long-running jobs | Async activity completion — the activity token is stored with the `Job` row and completed by the event consumer on `job.completed` |
| Retries | Activity-level exponential backoff for *transient* failures only; tool failures are domain outcomes, not activity failures |
| Fan-out | Child workflow per shard batch. TWO independent caps: ≤500 concurrent children (throughput) and ≤4,000 activities per child (history budget — see Gate B finding below). Batches sized by historical runtime (Blueprint §11) |
| Approval gates | `workflow.await()` on a signal with an optional timeout — zero compute held while waiting |
| Licence backpressure | Activity acquires a `ResourceClaim` with a lease; heartbeat renews it; workflow retries acquisition with jitter |
| Cancellation | Cooperative — cancellation scope releases claims and cancels backend jobs before completing |
| Idempotency | Activity ID derived from `(flowRunId, stageKey, shardIndex, attempt)`; all activity side effects upsert on that key |

### History budget (Gate B finding, 2026-08-01)

The event-budget model (`tools/arch/gate-b/history-model.mjs`) produced a constraint that was not obvious when this ADR was written:

| Activities in one workflow | Predicted events | Status |
|---|---|---|
| 1,000 | 3,755 | ok |
| 10,000 | 37,505 | past the 10,240 warning threshold, 73% of the terminate limit |
| 50,000 | 187,505 | **exceeds the 51,200 terminate limit by 3.7x** |

A 50,000-job regression therefore **cannot** execute as a single workflow — Temporal would terminate the run mid-flight. Even 10,000 sits above the warning threshold with no margin for retries.

This validates the child-workflow decision and adds a second, independent cap. The "500 concurrent children" limit is about *throughput*; the ~4,000-activities-per-child limit is about *history size*. They constrain different things and both are required. Conflating them would produce a design that passes at 5,000 jobs and terminates at 20,000.

Note this is a **model**, not a measurement: it assumes documented Temporal defaults and a pessimistic workflow-task coalescing ratio. Confirming it against the deployed cluster is item 1 of the real Gate B run.

### The failure/outcome distinction

This is the most easily botched part and deserves stating explicitly: **a tool exiting non-zero is not an activity failure.** `openroad` returning exit code 1 because the design does not route is a legitimate domain *outcome* — the activity succeeded in running the tool. Activity failure is reserved for infrastructure faults: the backend was unreachable, the pod was evicted, the submission was rejected.

Conflating the two produces the worst possible behaviour: Temporal retries a 40-hour deterministic failure five times with backoff, burning six days of compute to reach the same answer.

## Alternatives Considered

**CerebroFlow alone (for execution as well as authoring).**
Rejected. CerebroFlow's durable-state model targets minute-scale business processes. Day-scale runs with async external completion, resource leases, and 10,000-way dynamic fan-out would require rebuilding Temporal's feature set inside it. The right resolution is to file the gap upstream (see Open Questions) rather than either fork CerebroFlow's semantics or degrade CerebroEDA's. Note that we still use CerebroFlow for authoring — the rejection is narrow.

**Argo Workflows.**
Genuinely tempting: Kubernetes-native, DAG semantics, mature, and CNCF-governed. Rejected on three counts. Durable waits are modelled as suspended pods or CRD state and are awkward for multi-day human approval. Workflow state lives in etcd via CRDs, which does not scale to a year of run history and forces an archival sidecar. Most decisively, it binds the workflow engine to Kubernetes, while the Blueprint requires Slurm and LSF backends as first-class — an Argo-based control plane driving a Slurm farm is an impedance mismatch we would pay for continuously.

**Hand-rolled saga on Postgres + Kafka.**
Rejected. Feasible — this is roughly what the original blueprint sketch implied — but it means building durable timers, retry state machines, cancellation propagation, replay-safe determinism, and an execution history viewer. That is 6–9 months of work reproducing a solved problem, and every one of those subsystems is a source of subtle correctness bugs that surface only in production at 3am.

**AWS Step Functions / cloud-native orchestrators.**
Rejected immediately on requirement 7. Air-gap and on-prem are mandatory topologies.

**Cadence.**
Temporal's predecessor. Rejected — smaller ecosystem, less active development, and Temporal is the direct successor with a migration path *from* Cadence, not to it.

## Consequences

**Positive**

- Durable execution, timers, retries, and cancellation are inherited rather than authored. Phase 2 delivery is materially faster.
- Temporal's Web UI gives CAD engineers per-step execution history for free, satisfying requirement 6 on day one.
- Async activity completion is the natural model for long-running external jobs — no polling loops, no orphaned state.
- Self-hostable and air-gap compatible.
- Workflow code is ordinary TypeScript, testable with a time-skipping test environment. Multi-day flows are testable in milliseconds in CI.

**Negative**

- One more stateful system to operate: Temporal server plus its own Postgres or Cassandra. Mitigated by running Temporal's Postgres persistence on the same managed Postgres estate.
- The determinism constraint is a real cognitive burden. Non-deterministic workflow code fails at replay, often long after the change that caused it. Mitigated by lint rules, code review checklist, and replay tests against recorded histories in CI.
- Versioning long-running workflows requires discipline. A run started under v1 that is still executing when v2 deploys must be patched explicitly.
- Partial tension with the mesh-coherence rule. We accept this consciously, scoped to execution only, and file the capability gap against CerebroFlow.

**Neutral**

- Temporal's event history becomes a second source of run truth alongside our Kafka event log. We resolve this by treating Temporal history as an *implementation detail* of execution and our own `eda.flow.*` events as the published contract. Nothing outside `flow-service` reads Temporal history programmatically.

## Migration Strategy

**Adoption.** `packages/workflow` exposes `defineFlow`, `defineActivity`, and `FlowClient` — a narrow façade over the Temporal SDK. Services never import `@temporalio/*` directly; this is enforced by `.dependency-cruiser.js`. The façade is not an abstraction layer pretending Temporal is swappable; it is a seam that keeps the blast radius of a future change measurable.

**Workflow versioning.** Every workflow declares a version constant. Breaking changes use Temporal's patching API for in-flight runs, with patches removed once no v1 runs remain. A `flow_runs.workflow_version` column makes "what is still running on the old version" a single query.

**If we must leave Temporal.** The exit cost is bounded by three properties, each of which is a deliberate design constraint rather than a happy accident: (1) all durable state we care about is mirrored into our own Postgres tables and Kafka events — Temporal is not the system of record for anything a user can see; (2) activities are thin, calling into service APIs that exist independently; (3) the façade is the only import site. A migration would rewrite orchestration control flow, not domain logic.

**Rollout.** Phase 1 uses Temporal for the single linear flow. Phase 2 introduces child workflows and fan-out. The Slurm and LSF backends are exercised in staging before any customer deployment, since async activity completion across an SSH-submitted job is the highest-risk integration in this design.

## Open Questions

1. **CerebroFlow capability gap.** Should durable long-running execution become a CerebroFlow capability, with CerebroEDA the first consumer? If so, CerebroFlow may itself adopt Temporal, and this ADR becomes the reference implementation rather than an exception. Filed as a platform architecture question; decision not required before Phase 2.
2. **Temporal namespace strategy.** Namespace-per-tenant gives clean isolation and per-tenant retention but multiplies operational surface at scale. Deferred to ADR 0010 (multi-tenancy), which owns the isolation model.
3. **Persistence backend.** Postgres is correct at expected volume. Cassandra is Temporal's recommendation above roughly 1,000 workflows/second — far beyond our projected load. Revisit only on measurement.
4. **Search attributes.** Which run metadata should be Temporal search attributes versus queried from our own Postgres? Current position: none — our Postgres is the query surface. Revisit if operators need Temporal-native run search.
5. **Retention.** Temporal history retention (default 30 days) versus our own 365-day run retention. These need explicit alignment so operators are not surprised when execution history disappears while the run record persists.

## Related ADRs

- 0001: Event-Driven Architecture — the event backbone this substrate publishes to
- 0010: CerebroEDA Multi-Tenancy and Data Isolation — owns namespace and RLS strategy
- 0011: Canonical Artifact and Result Identity — `reproducibilityKey` construction
- 0013: CerebroEDA Runner Isolation — the sandbox activities dispatch into
