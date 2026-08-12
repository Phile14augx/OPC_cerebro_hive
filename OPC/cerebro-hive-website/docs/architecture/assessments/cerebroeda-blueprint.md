# CerebroEDA™ — Architecture Blueprint (Phase 0)

**Status:** Draft v0.1 — Reference Architecture
**Governing Documents:** `CEREBROHIVE_CONSTITUTION.md`, `PRODUCT_REGISTRY.md`, `CAPABILITY_ARCHITECTURE.md`
**Phase:** 0 — Architecture Blueprint (precedes functional specification and scaffolding)
**Owner:** Platform Architecture
**Related:** `docs/architecture/02-system-architecture.md`, `docs/architecture/adr/0001-event-driven-architecture.md`

---

## 0. How to Read This Document

This is the **reference architecture** for CerebroEDA™. Every subsequent artifact — the functional specification, the monorepo scaffold, service implementations, and the public product page — must trace back to a decision recorded here. Where this document conflicts with a downstream artifact, this document wins until amended by an ADR.

The blueprint is organised as:

| Part | Contents |
|---|---|
| I | Context — positioning, users, constraints, non-goals |
| II | Structure — C4 model, bounded contexts, service catalogue |
| III | Behaviour — event architecture, workflow engine, job execution |
| IV | Data — persistence topology, schemas, knowledge graph, artifact storage |
| V | Contracts — API surface, event envelopes, plugin SDK |
| VI | Intelligence — agent framework, retrieval, evaluation, guardrails |
| VII | Operations — deployment, CI/CD, observability, security, cost |
| VIII | Sequencing — roadmap, risk register, open decisions |

---

# PART I — CONTEXT

## 1. Positioning

CerebroEDA™ is **not** an EDA tool suite. It is an **orchestration and intelligence layer** that sits above both open-source and commercial design flows.

The distinction is load-bearing and determines nearly every architectural decision below:

| We build | We do not build |
|---|---|
| Job orchestration across tools | Place-and-route engines |
| Parsers for tool outputs (STA, DRC, LVS, coverage) | Timing analysis engines |
| A design knowledge graph | Simulators |
| AI agents that reason over design artifacts | Synthesis algorithms |
| Collaboration, review, and audit workflows | PDK development |
| A plugin surface for third-party tools | Foundry-certified signoff |

**Consequence:** CerebroEDA must never be on the critical correctness path for signoff. It advises, orchestrates, explains, and remembers. The certified tool remains the authority. This constraint is what makes the product buildable by a small team, and it must be defended architecturally (see §26, Trust Boundaries).

### 1.1 Value Hypothesis

Design teams lose more time to *navigating* their flow than to running it: finding the last known-good configuration, understanding why a regression broke, correlating a DRC cluster to an RTL change, onboarding an engineer onto a five-year-old block. These are information-retrieval and workflow problems, not algorithmic ones — and they are exactly what an AI-native platform with a persistent knowledge graph addresses.

### 1.2 Relationship to the CerebroHive Mesh

CerebroEDA is a **Cerebro Application** consuming Hive Platform services rather than reimplementing them:

| Need | Provided by | Notes |
|---|---|---|
| Identity, SSO, RBAC | `HiveIdentity` | Tenant + project scoping extends the standard model |
| LLM routing, observability | `HiveOps` | All model calls route through HiveOps; no direct provider SDKs in EDA services |
| Vector storage / semantic retrieval | `HiveVector` | Design-artifact embeddings |
| Knowledge graph substrate | `HiveKnowledge` | Design graph is a domain projection over the Hive graph model |
| Workflow orchestration primitives | `CerebroFlow` | EDA flows are CerebroFlow DAGs with EDA-specific node types |
| Agent runtime | `CerebroAgent` / `HiveAgents` | EDA agents are specialised agent definitions, not a new runtime |
| Object storage | `HiveStorage` | Artifact store backing |
| Policy, audit, compliance | `HiveGovern` | Export-control and ITAR posture |
| Compute scheduling | `HiveCompute` | Kubernetes/Slurm abstraction |
| Plugin distribution | `HiveMarketplace` | Tool adapters and agents ship as marketplace entries |

**Architectural rule:** CerebroEDA introduces *no* new infrastructure primitive that an existing Hive product already provides. Where a gap exists, the gap is filed against the Hive product, not worked around locally. This is the single most important constraint for keeping the mesh coherent at 50+ products.

## 2. Target Users

| Persona | Primary jobs | Primary surfaces |
|---|---|---|
| RTL / Design Engineer | Write and refactor RTL, close lint, understand legacy blocks | Design Workspace, Copilot, Knowledge Graph |
| Verification Engineer | Testbench authoring, coverage closure, regression triage | Regression Console, Coverage Explorer, Agents |
| Physical Design Engineer | Floorplan, congestion, timing closure iteration | Flow Runs, Layout Viewer, Timing Explorer |
| Timing / Signoff Engineer | STA correlation, constraint validation, ECO planning | Timing Explorer, Reports, Diff |
| CAD / Methodology Engineer | Own the flow, tool versions, PDK integration | Flow Editor, Plugin SDK, Admin |
| Engineering Manager | Schedule risk, block readiness, resource burn | Dashboards, Insights |
| Compliance / Export Control | Who touched what, where data lives | Audit, HiveGovern integration |

The **CAD engineer is the design partner**. They control tool adoption in every semiconductor organisation, and the plugin SDK exists primarily for them.

## 3. Constraints

### 3.1 Hard Constraints

1. **Data gravity.** GDSII, DEF, and waveform databases run to hundreds of GB. Artifacts are never pulled through application services; services exchange *references*, and compute is moved to data.
2. **Licence economics.** Commercial tool licences are scarce and expensive. The scheduler must model licence tokens as a first-class, reservable resource or it will be unusable in a real fab flow.
3. **Air-gap requirement.** A meaningful share of the market cannot send design data to a hosted service. The full platform must deploy on-premises with local model inference.
4. **Export control.** Design data is frequently ITAR/EAR-controlled. Data residency, model-call routing, and audit trails are compliance features, not enhancements.
5. **Determinism.** Flow runs must be reproducible: tool version, container digest, PDK version, constraint set, and seed are all part of run identity.
6. **Long-running jobs.** A P&R run may take 40 hours. No synchronous request path may depend on job completion; everything is event-driven with durable state.

### 3.2 Soft Constraints

- Engineers live in the terminal and in Emacs/Vim/VS Code. A web UI that demands abandoning those tools will be rejected. A CLI and an LSP-style integration are Tier-1 surfaces, not afterthoughts.
- Tool outputs are unstable text formats across versions. Parsers must be versioned, plugin-supplied, and fail soft.

## 4. Non-Goals (v1)

- Analog/custom layout editing.
- Foundry signoff certification.
- Replacing any commercial tool's compute engine.
- Real-time collaborative layout editing.
- Training foundation models on customer design data (explicitly prohibited by default policy).

---

# PART II — STRUCTURE

## 5. C4 Level 1 — System Context

```
                        ┌──────────────────────────────┐
                        │        Design Engineers      │
                        │  RTL / DV / PD / STA / CAD   │
                        └───────────────┬──────────────┘
                                        │  Web UI · CLI · IDE ext · API
                                        ▼
        ┌───────────────────────────────────────────────────────────┐
        │                      CerebroEDA™                          │
        │   Orchestration · Knowledge · AI Assistance · Audit       │
        └───┬───────────────┬───────────────┬───────────────┬───────┘
            │               │               │               │
            ▼               ▼               ▼               ▼
   ┌────────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────┐
   │ EDA Tooling    │ │ Source Ctrl│ │ Compute    │ │ CerebroHive    │
   │ OpenROAD Yosys │ │ Git/Perforce│ │ K8s/Slurm │ │ Mesh Services  │
   │ Verilator STA  │ │ Gerrit      │ │ LSF/GPU   │ │ HiveOps/Ident. │
   │ KLayout Magic  │ └────────────┘ └────────────┘ │ HiveVector/... │
   │ ngspice Xyce   │                                └────────────────┘
   │ + commercial   │        ┌────────────────┐
   │   adapters     │        │ PDK / IP       │
   └────────────────┘        │ Foundry kits   │
                             └────────────────┘
```

**External systems and the nature of each dependency:**

| System | Direction | Coupling | Failure mode |
|---|---|---|---|
| EDA tools | outbound exec | Loose — adapter plugins | Job fails, run marked failed, flow pauses |
| Git / Perforce / Gerrit | bidirectional | Webhook + polling | Ingest lags; degraded, not down |
| Compute (K8s/Slurm/LSF) | outbound submit | Adapter per backend | Jobs queue locally |
| Hive Mesh | inbound + outbound | Tight — platform substrate | Hard dependency; see §27 |
| PDK/IP vaults | read | Mounted, never copied | Flow blocked for affected projects |
| Identity provider | inbound | OIDC via HiveIdentity | Cached sessions degrade gracefully |

## 6. C4 Level 2 — Containers

```
┌─────────────────────────────────────────────────────────────────────┐
│ EDGE                                                                 │
│  Next.js Web App    ·    CLI (cbeda)    ·    IDE Extension           │
└───────────────────────────────┬─────────────────────────────────────┘
                                │  HTTPS / WSS
┌───────────────────────────────▼─────────────────────────────────────┐
│ HiveGateway  —  authn, rate limit, tenant resolution, audit tap      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│ GraphQL Federation Gateway  —  schema stitching, persisted queries   │
└──┬────────┬────────┬────────┬────────┬────────┬────────┬────────────┘
   │        │        │        │        │        │        │
   ▼        ▼        ▼        ▼        ▼        ▼        ▼
┌──────┐┌──────┐┌───────┐┌───────┐┌────────┐┌───────┐┌──────────┐
│proj  ││design││flow   ││job    ││analysis││know-  ││eda-ai    │
│svc   ││svc   ││svc    ││svc    ││svc     ││ledge  ││svc       │
└──┬───┘└──┬───┘└───┬───┘└───┬───┘└───┬────┘└──┬────┘└────┬─────┘
   │       │        │        │        │        │          │
   └───────┴────────┴────────┴────────┴────────┴──────────┘
                                │
                    ┌───────────▼────────────┐
                    │  HiveExchange (Kafka)  │   event backbone
                    └───────────┬────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐     ┌──────────────────┐     ┌────────────────┐
│ Runner Fleet  │     │ Ingest Workers   │     │ Agent Runtime  │
│ (tool exec in │     │ (parse reports,  │     │ (CerebroAgent  │
│  sandboxes)   │     │  emit facts)     │     │  definitions)  │
└───────┬───────┘     └────────┬─────────┘     └───────┬────────┘
        │                      │                       │
        └──────────────────────┼───────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│ DATA PLANE                                                           │
│ Postgres (metadata) · HiveStorage/S3 (artifacts) · Neo4j (graph)     │
│ HiveVector/pgvector (embeddings) · OpenSearch (logs/reports)         │
│ Redis (cache, locks, licence tokens) · ClickHouse (run telemetry)    │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.1 Container Responsibilities

| Container | Responsibility | Scaling axis | State |
|---|---|---|---|
| Web App | UI, SSR, streaming responses | Requests | Stateless |
| CLI | Local dev loop, CI integration, artifact push/pull | n/a | Local config |
| GraphQL Gateway | Federated read model, subscriptions | Requests | Stateless |
| `project-service` | Orgs, projects, teams, PDK/IP registration, permissions | Low | Postgres |
| `design-service` | Repos, revisions, file trees, RTL module index, diffs | Repo count | Postgres + S3 |
| `flow-service` | Flow definitions, versions, DAG validation, run lifecycle | Runs | Postgres |
| `job-service` | Job dispatch, licence reservation, retries, backend adapters | Jobs/sec | Postgres + Redis |
| `analysis-service` | Timing, power, DRC/LVS, coverage domain models | Report volume | Postgres + OpenSearch |
| `knowledge-service` | Graph projection, semantic search, impact analysis | Graph size | Neo4j + Vector |
| `eda-ai-service` | Agent orchestration, prompt assembly, tool-calling, RAG | Token throughput | Redis + Postgres |
| `artifact-service` | Content-addressed artifact registry, presigned URLs, retention | Bytes | Postgres + S3 |
| `plugin-service` | Adapter registry, manifest validation, sandbox policy | Low | Postgres |
| Runner Fleet | Executes tools inside sandboxes near the data | Compute | Ephemeral |
| Ingest Workers | Parse tool output into domain facts | Report volume | Ephemeral |

**Why this decomposition:** the seams follow *rate of change* and *scaling profile*, not entity nouns. `job-service` and the runner fleet change constantly and scale with compute; `project-service` is near-static. Splitting timing/power/DRC into separate services was rejected — they share the report-ingest pipeline and the same lifecycle, so they live in `analysis-service` behind internal modules until a measured need forces separation.

## 7. Bounded Contexts (DDD)

Seven contexts. Each owns its schema; no cross-context foreign keys. Integration is by event or by published API only.

```
┌──────────────────┐        ┌──────────────────┐
│  Organisation    │        │  Design Source   │
│  ─────────────   │        │  ─────────────   │
│  Org, Team, User │        │  Repository      │
│  Project, Role   │───────▶│  Revision        │
│  PDK, IPBlock    │        │  DesignUnit      │
│  Licence pool    │        │  ModuleIndex     │
└────────┬─────────┘        └────────┬─────────┘
         │                           │
         │        ┌──────────────────▼──────────────┐
         └───────▶│  Flow Execution                 │
                  │  ───────────────                │
                  │  FlowDefinition, FlowRun        │
                  │  Stage, Job, Attempt            │
                  │  ResourceClaim, ToolInvocation  │
                  └────────┬────────────────────────┘
                           │ emits artifacts + events
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌─────────────────┐ ┌──────────────┐ ┌────────────────┐
│  Analysis       │ │  Artifact    │ │  Knowledge     │
│  ───────────    │ │  ─────────   │ │  ──────────    │
│  TimingPath     │ │  Artifact    │ │  GraphNode     │
│  DRCViolation   │ │  Blob        │ │  GraphEdge     │
│  Coverage       │ │  Retention   │ │  Embedding     │
│  PowerReport    │ │  Lineage     │ │  ImpactSet     │
└────────┬────────┘ └──────────────┘ └───────┬────────┘
         │                                    │
         └──────────────┬─────────────────────┘
                        ▼
              ┌──────────────────────┐
              │  Assistance          │
              │  ──────────────      │
              │  AgentDefinition     │
              │  AgentRun, Step      │
              │  Suggestion, Review  │
              │  Feedback, Eval      │
              └──────────────────────┘
```

### 7.1 Context Map with Integration Patterns

| Upstream → Downstream | Pattern | Contract |
|---|---|---|
| Organisation → all | Shared Kernel (tenant/project IDs only) | `TenantContext` value object |
| Design Source → Flow Execution | Customer/Supplier | `RevisionRef` — immutable commit pointer |
| Flow Execution → Analysis | Published Language (events) | `job.artifact.produced` |
| Flow Execution → Artifact | Customer/Supplier | Artifact registration API |
| Analysis → Knowledge | Published Language (events) | `analysis.fact.emitted` |
| Design Source → Knowledge | Published Language (events) | `design.index.updated` |
| Knowledge → Assistance | Open Host Service | Retrieval API (graph + vector) |
| Assistance → Design Source | Conformist | Proposes patches; never writes directly |
| Assistance → Flow Execution | Anti-Corruption Layer | Agents request runs through a policy-gated façade |

**The two rules that matter most:**

1. **Assistance never mutates.** Agents produce `Suggestion` objects. A suggestion becomes a change only when a human applies it, or when an explicitly configured autonomous policy applies it with full audit. This is what keeps AI failure modes bounded and is a precondition for enterprise adoption in this market.
2. **Knowledge is a projection, never a source of truth.** The graph can be rebuilt from scratch by replaying events. It is never written to directly by users. This makes schema evolution tractable — change the projector, replay, done.

## 8. Service Catalogue

Each service is defined by: owned aggregates, published events, consumed events, synchronous API, and SLO.

### 8.1 `project-service`

- **Aggregates:** `Organization`, `Team`, `Project`, `Membership`, `PDK`, `IPBlock`, `LicencePool`
- **Publishes:** `project.created`, `project.archived`, `pdk.registered`, `member.role.changed`
- **Consumes:** `identity.user.deprovisioned` (from HiveIdentity)
- **API:** CRUD + permission resolution (`can(subject, action, resource)`)
- **SLO:** p99 < 80ms; permission resolution cached in Redis with 60s TTL and explicit invalidation on role change

### 8.2 `design-service`

- **Aggregates:** `Repository`, `Revision`, `DesignUnit`, `FileNode`
- **Responsibilities:** VCS integration (Git, Perforce, Gerrit), shallow-clone caching, RTL structural indexing (module/port/parameter/instance extraction via Verible/Slang), semantic diff
- **Publishes:** `design.revision.ingested`, `design.index.updated`, `design.module.changed`
- **SLO:** index a 500k-line RTL tree in < 5 min; incremental reindex < 20s

**Design note:** RTL parsing uses a real frontend (Slang for SystemVerilog, Verible for style/lint) rather than regex. The module index is the anchor for the entire knowledge graph — if it is approximate, every downstream feature inherits the error. This is worth the dependency weight.

### 8.3 `flow-service`

- **Aggregates:** `FlowDefinition`, `FlowVersion`, `FlowRun`, `Stage`
- **Responsibilities:** DAG authoring and validation, parameter resolution, run lifecycle (queued → running → paused → succeeded/failed/cancelled), approval gates, run comparison
- **Publishes:** `flow.run.started`, `flow.stage.entered`, `flow.run.completed`, `flow.approval.requested`
- **Consumes:** `job.completed`, `job.failed`
- **Implementation:** flows compile to CerebroFlow DAGs; EDA-specific node types register as CerebroFlow node plugins. `flow-service` owns EDA semantics (tool version pinning, PDK binding, licence hints); CerebroFlow owns scheduling and durable state.

### 8.4 `job-service`

- **Aggregates:** `Job`, `Attempt`, `ResourceClaim`, `ToolInvocation`
- **Responsibilities:** translate a stage into concrete executions; reserve licence tokens; select a backend adapter (K8s / Slurm / LSF / local); stream logs; enforce timeouts and quotas; retry with backoff
- **Publishes:** `job.queued`, `job.started`, `job.log.chunk`, `job.artifact.produced`, `job.completed`, `job.failed`
- **SLO:** dispatch latency p99 < 2s from stage entry to backend submission

**Licence token model** — the piece most orchestration layers get wrong:

```
LicencePool { feature, totalTokens, vendorDaemon, checkoutTimeoutSec }
ResourceClaim { jobId, feature, tokens, state, acquiredAt, expiresAt }
```

Claims are acquired via a Redis-backed semaphore with a lease and a heartbeat. A dead runner's lease expires and the tokens return to the pool. Claims are *advisory* — the vendor daemon remains authoritative — but modelling them lets the scheduler avoid submitting jobs that will immediately fail on checkout, which is the actual pain: 200 queued jobs thrashing against 30 licences.

### 8.5 `analysis-service`

- **Aggregates:** `TimingReport`/`TimingPath`, `DRCRun`/`DRCViolation`, `LVSResult`, `PowerReport`, `CoverageDB`, `LintReport`
- **Responsibilities:** own the domain model for tool results; host the parser plugin registry; normalise across tool vendors; compute deltas between runs; cluster violations
- **Publishes:** `analysis.report.ingested`, `analysis.fact.emitted`, `analysis.regression.detected`
- **Consumes:** `job.artifact.produced`

**Normalisation is the core intellectual work here.** A `TimingPath` from OpenSTA and one from PrimeTime must land in the same shape so that comparison, graph projection, and agent reasoning are tool-agnostic. The canonical model is deliberately lossy-but-sufficient, with the raw report always retained and linkable.

### 8.6 `knowledge-service`

- **Aggregates:** `GraphNode`, `GraphEdge`, `Embedding`, `SavedQuery`
- **Responsibilities:** project domain events into the design graph; maintain embeddings; serve impact analysis, path queries, and hybrid (graph + vector + keyword) retrieval
- **Consumes:** everything
- **Publishes:** `knowledge.projection.lagging` (health signal)

### 8.7 `eda-ai-service`

- **Aggregates:** `AgentDefinition`, `AgentRun`, `AgentStep`, `Suggestion`, `Feedback`
- **Responsibilities:** agent orchestration, context assembly, tool-calling loop, streaming, cost/token accounting, guardrail enforcement, evaluation harness hooks
- **Depends on:** `HiveOps` (model routing), `knowledge-service` (retrieval), `CerebroAgent` (runtime)
- **Publishes:** `agent.run.started`, `agent.suggestion.created`, `agent.run.completed`

### 8.8 `artifact-service`

- **Aggregates:** `Artifact`, `Blob`, `RetentionPolicy`, `LineageEdge`
- **Responsibilities:** content-addressed storage (BLAKE3), dedup, presigned access, multipart upload, tiering (hot → warm → glacier), retention enforcement, lineage
- **Key property:** artifacts are immutable and content-addressed. Two runs producing identical GDS store one blob. Given how much of a regression suite is unchanged between runs, dedup materially changes storage economics.

### 8.9 `plugin-service`

- **Aggregates:** `Plugin`, `PluginVersion`, `Capability`, `Installation`
- **Responsibilities:** manifest validation, signature verification, capability grants, sandbox policy generation, marketplace sync with `HiveMarketplace`

---

# PART III — BEHAVIOUR

## 9. Event-Driven Architecture

Consistent with `adr/0001-event-driven-architecture.md`. Kafka via `HiveExchange`.

### 9.1 Envelope

Every event shares one envelope. This is non-negotiable — it is what makes generic audit, replay, and projection possible.

```jsonc
{
  "specversion": "1.0",
  "id": "01J8XQ...",              // ULID, unique, idempotency key
  "source": "cerebroeda/job-service",
  "type": "eda.job.completed.v1",  // domain.entity.action.version
  "subject": "job/01J8XQ...",
  "time": "2026-08-01T12:00:00Z",
  "datacontenttype": "application/json",
  "tenantid": "org_7f3",
  "traceparent": "00-4bf92f...-00f067aa0ba902b7-01",
  "correlationid": "flowrun_01J8...",
  "causationid": "01J8XP...",     // the event that caused this one
  "data": { }
}
```

CloudEvents 1.0 with three additions: `tenantid` (enforced at the broker ACL layer), `correlationid` (groups everything under one flow run), `causationid` (reconstructs the causal chain — essential when debugging why an agent proposed something).

### 9.2 Topic Design

| Topic | Partition key | Retention | Compaction |
|---|---|---|---|
| `eda.design.v1` | `repositoryId` | 90d | no |
| `eda.flow.v1` | `flowRunId` | 365d | no |
| `eda.job.v1` | `flowRunId` | 90d | no |
| `eda.job.logs.v1` | `jobId` | 7d | no |
| `eda.analysis.v1` | `projectId` | 365d | no |
| `eda.artifact.v1` | `projectId` | ∞ | no |
| `eda.agent.v1` | `agentRunId` | 365d | no |
| `eda.audit.v1` | `tenantId` | ∞ (WORM) | no |
| `eda.state.projects.v1` | `projectId` | ∞ | yes |

Partitioning by `flowRunId` for flow and job events preserves per-run ordering, which is what consumers actually need; global ordering is neither required nor affordable.

Log chunks get their own topic with short retention and aggressive compression — they are high-volume, low-value-after-ingest, and must not share a topic with events that need long retention.

### 9.3 Delivery Semantics

At-least-once, with idempotent consumers keyed on envelope `id`. Every projector maintains `(consumerGroup, eventId)` in a dedup table with a TTL exceeding the retention window of the replay scenarios we support.

Exactly-once was considered and rejected: the transactional overhead is real, and every consumer here is naturally idempotent (upserts into projections, content-addressed artifact writes).

### 9.4 Saga: Flow Run Execution

Long-running flow runs use an orchestration saga in `flow-service` with compensations:

```
FlowRun started
  │
  ├─▶ Stage: lint ──────────▶ job dispatched ──▶ completed
  │                                │
  │                                └─ failed ──▶ compensate: release claims,
  │                                              mark run failed, notify
  ├─▶ Stage: simulate (fan-out N jobs)
  │        │  partial failure policy: continue | halt | threshold
  │        └─▶ aggregate ──▶ coverage merged
  │
  ├─▶ Stage: synth ──▶ artifacts registered ──▶ analysis ingest
  │
  ├─▶ Gate: approval ──▶ blocks until human/policy decision (durable wait)
  │
  └─▶ Stage: pnr ──▶ ... ──▶ signoff ──▶ FlowRun completed
```

Compensation is mostly resource release and state marking rather than semantic rollback — you cannot un-run a synthesis. What matters is that claims are always released and the run never strands in an ambiguous state. Every stage transition is an event; the run's state is a fold over its event log, with a materialised snapshot for query performance.

## 10. Job Execution Model

```
flow-service              job-service               Runner (K8s Job / Slurm)
    │                          │                            │
    │── stage.entered ────────▶│                            │
    │                          │─ resolve tool+version      │
    │                          │─ resolve PDK mount         │
    │                          │─ acquire licence claim     │
    │                          │─ build execution spec      │
    │                          │───────── submit ──────────▶│
    │                          │                            │─ pull image (digest-pinned)
    │                          │                            │─ mount workspace (RWX)
    │                          │                            │─ mount PDK (RO)
    │                          │◀──── log stream (chunked) ─│
    │                          │                            │─ run tool
    │                          │                            │─ register artifacts
    │                          │◀──── exit + manifest ──────│
    │                          │─ release claim             │
    │◀── job.completed ────────│                            │
    │                          │── artifact.produced ──────▶ ingest workers
```

### 10.1 Execution Spec

The unit of reproducibility. Two runs with identical specs must produce identical results (modulo documented tool nondeterminism, which is captured in `seed`).

```yaml
executionSpec:
  toolRef:      { name: openroad, version: "2.0.1", imageDigest: "sha256:..." }
  pdkRef:       { name: sky130A, version: "1.0.457", mount: /pdk, readOnly: true }
  workspace:    { volumeClaim: ws-01J8XQ, path: /work }
  inputs:       [ { artifactId: art_..., path: /work/in/design.def } ]
  command:      ["openroad", "-exit", "/work/scripts/pnr.tcl"]
  env:          { OPENROAD_THREADS: "16" }
  resources:    { cpu: "16", memory: "64Gi", gpu: 0, ephemeralStorage: "500Gi" }
  licences:     [ { feature: "pnr_core", tokens: 1 } ]
  timeoutSec:   172800
  seed:         42
  outputs:      [ { glob: "/work/out/**", classify: auto } ]
  sandbox:      { network: none, userNs: true, seccomp: strict, readOnlyRoot: true }
```

`sandbox.network: none` is the default for tool execution. Design tools have no legitimate need for network egress, and denying it by default removes an entire exfiltration class. Adapters that genuinely need network (licence daemon access) declare it explicitly and are granted a narrow egress policy to the daemon host only.

### 10.2 Backend Adapters

One interface, several implementations, because customers will not change their compute estate for us:

```typescript
interface ComputeBackend {
  submit(spec: ExecutionSpec): Promise<BackendJobRef>;
  status(ref: BackendJobRef): Promise<JobStatus>;
  logs(ref: BackendJobRef, opts: LogOpts): AsyncIterable<LogChunk>;
  cancel(ref: BackendJobRef): Promise<void>;
  capabilities(): BackendCapabilities;   // gpu, maxWalltime, volumes, arrays
}
```

Implementations: `KubernetesBackend` (default), `SlurmBackend` (REST or `sbatch` over SSH), `LSFBackend`, `LocalBackend` (dev). Array-job support is declared via `capabilities()` so regression fan-out can use native array jobs where available instead of N discrete submissions.

## 11. Regression and Fan-Out

Verification regressions are the highest-volume workload: 10k+ simulations per night.

```
RegressionPlan ──▶ TestList (generated | curated | risk-ranked)
       │
       ├─▶ shard into batches (bin-packed by historical runtime)
       ├─▶ submit as array jobs
       ├─▶ stream per-test results
       ├─▶ merge coverage DBs (hierarchical merge tree, not linear)
       └─▶ triage: cluster failures by signature → group → assign
```

Two decisions worth stating: coverage merges use a **hierarchical merge tree** (log-depth) because linear merging of 10k databases is the actual bottleneck in most verification flows; and failure triage clusters by **stack/message signature** before any AI is applied, so that the expensive reasoning runs once per cluster rather than once per failure. AI is applied to the ~50 distinct signatures, not the 3,000 failures.

---

# PART IV — DATA

## 12. Persistence Topology

| Store | Purpose | Rationale |
|---|---|---|
| PostgreSQL 16 | Transactional metadata, per-service schemas | Correctness, familiarity, partitioning for time-series tables |
| HiveStorage (S3/MinIO) | Artifacts, blobs, logs archive | Data gravity; content-addressed |
| Neo4j (or Memgraph) | Design knowledge graph | Variable-depth traversal is the query pattern; recursive CTEs do not scale to it |
| pgvector via HiveVector | Embeddings | Colocated with metadata for hybrid filtering |
| OpenSearch | Report full-text, log search | Text search over unstructured tool output |
| Redis | Cache, distributed locks, licence semaphores, streams | Latency-sensitive coordination |
| ClickHouse | Run telemetry, resource/cost analytics | Column-store for high-cardinality time series |

**On the graph database:** this is the decision most likely to be contested, and it deserves an ADR of its own. The argument for a dedicated graph store is that the core queries — "which timing paths traverse a net driven by this module across three levels of hierarchy", "what is the blast radius of changing this parameter" — are unbounded-depth traversals over a graph with tens of millions of nodes for a large SoC. The argument against is operational cost and one more system to run. The proposed resolution: start with Postgres + recursive CTEs behind the `knowledge-service` API, measure, and swap the implementation when traversal depth or latency demands it. The API boundary makes this a contained change — which is precisely why the boundary exists.

## 13. Core Schemas

### 13.1 Organisation Context

```sql
CREATE TABLE organizations (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  data_region   TEXT NOT NULL,            -- residency enforcement
  export_class  TEXT NOT NULL DEFAULT 'none',  -- none | ear | itar
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projects (
  id            TEXT PRIMARY KEY,
  org_id        TEXT NOT NULL REFERENCES organizations(id),
  name          TEXT NOT NULL,
  technology    TEXT,                     -- e.g. "sky130", "tsmc-n5"
  default_pdk_id TEXT,
  visibility    TEXT NOT NULL DEFAULT 'private',
  archived_at   TIMESTAMPTZ,
  UNIQUE (org_id, name)
);

CREATE TABLE pdks (
  id            TEXT PRIMARY KEY,
  org_id        TEXT NOT NULL REFERENCES organizations(id),
  name          TEXT NOT NULL,
  version       TEXT NOT NULL,
  vendor        TEXT,
  mount_path    TEXT NOT NULL,
  export_class  TEXT NOT NULL DEFAULT 'none',
  checksum      TEXT,
  UNIQUE (org_id, name, version)
);

CREATE TABLE licence_pools (
  id            TEXT PRIMARY KEY,
  org_id        TEXT NOT NULL REFERENCES organizations(id),
  feature       TEXT NOT NULL,
  total_tokens  INT  NOT NULL,
  vendor_daemon TEXT,
  UNIQUE (org_id, feature)
);
```

`export_class` on both org and PDK, propagating to every derived artifact, is what makes export-control enforcement mechanical rather than procedural.

### 13.2 Design Source Context

```sql
CREATE TABLE repositories (
  id            TEXT PRIMARY KEY,
  project_id    TEXT NOT NULL,
  vcs           TEXT NOT NULL,            -- git | perforce | gerrit
  url           TEXT NOT NULL,
  default_ref   TEXT NOT NULL DEFAULT 'main',
  credential_id TEXT
);

CREATE TABLE revisions (
  id            TEXT PRIMARY KEY,
  repository_id TEXT NOT NULL REFERENCES repositories(id),
  vcs_id        TEXT NOT NULL,            -- sha / changelist
  parent_ids    TEXT[] NOT NULL DEFAULT '{}',
  author        TEXT,
  message       TEXT,
  committed_at  TIMESTAMPTZ NOT NULL,
  indexed_at    TIMESTAMPTZ,
  UNIQUE (repository_id, vcs_id)
);

CREATE TABLE design_units (
  id            TEXT PRIMARY KEY,
  revision_id   TEXT NOT NULL REFERENCES revisions(id),
  kind          TEXT NOT NULL,            -- module | package | interface | class
  name          TEXT NOT NULL,
  language      TEXT NOT NULL,            -- verilog | systemverilog | vhdl | chisel
  file_path     TEXT NOT NULL,
  line_start    INT, line_end INT,
  parameters    JSONB NOT NULL DEFAULT '[]',
  ports         JSONB NOT NULL DEFAULT '[]',
  instances     JSONB NOT NULL DEFAULT '[]',
  content_hash  TEXT NOT NULL
);
CREATE INDEX ON design_units (revision_id, name);
CREATE INDEX ON design_units USING GIN (ports jsonb_path_ops);
```

`content_hash` per design unit enables incremental reindexing: on a new revision, only units whose hash changed are reparsed and reprojected. On a typical commit that is 3 files out of 4,000.

### 13.3 Flow Execution Context

```sql
CREATE TABLE flow_runs (
  id             TEXT PRIMARY KEY,
  project_id     TEXT NOT NULL,
  flow_version_id TEXT NOT NULL,
  revision_id    TEXT NOT NULL,
  triggered_by   TEXT NOT NULL,           -- user | webhook | schedule | agent
  trigger_ref    TEXT,
  status         TEXT NOT NULL,           -- queued|running|paused|succeeded|failed|cancelled
  params         JSONB NOT NULL DEFAULT '{}',
  started_at     TIMESTAMPTZ,
  ended_at       TIMESTAMPTZ,
  reproducibility_key TEXT NOT NULL       -- hash(flowVersion, revision, params, toolset, pdk)
);

CREATE TABLE jobs (
  id             TEXT PRIMARY KEY,
  flow_run_id    TEXT NOT NULL REFERENCES flow_runs(id),
  stage_key      TEXT NOT NULL,
  shard_index    INT NOT NULL DEFAULT 0,
  tool_ref       JSONB NOT NULL,
  status         TEXT NOT NULL,
  attempt        INT  NOT NULL DEFAULT 1,
  backend        TEXT NOT NULL,
  backend_ref    TEXT,
  exit_code      INT,
  resource_usage JSONB,
  queued_at TIMESTAMPTZ, started_at TIMESTAMPTZ, ended_at TIMESTAMPTZ
) PARTITION BY RANGE (queued_at);
```

`jobs` is partitioned monthly from day one. At 10k jobs/night a single table becomes a maintenance problem within a year, and retrofitting partitioning onto a live table is far more painful than starting with it.

`reproducibility_key` makes "has anyone run exactly this before?" a single indexed lookup — which powers both result caching and the "what changed since the last good run" comparison that dominates debugging.

### 13.4 Analysis Context

```sql
CREATE TABLE timing_paths (
  id             TEXT PRIMARY KEY,
  report_id      TEXT NOT NULL,
  corner         TEXT NOT NULL,           -- ss_125c_1v62 etc.
  mode           TEXT NOT NULL,           -- func | scan | ...
  path_group     TEXT,
  slack_ps       BIGINT NOT NULL,
  required_ps    BIGINT, arrival_ps BIGINT,
  startpoint     TEXT NOT NULL,
  endpoint       TEXT NOT NULL,
  path_type      TEXT NOT NULL,           -- setup | hold
  logic_depth    INT,
  fanout_max     INT,
  nodes          JSONB NOT NULL,          -- ordered pin/net traversal
  signature      TEXT NOT NULL            -- stable id across runs
);
CREATE INDEX ON timing_paths (report_id, slack_ps);
CREATE INDEX ON timing_paths (signature);

CREATE TABLE drc_violations (
  id             TEXT PRIMARY KEY,
  drc_run_id     TEXT NOT NULL,
  rule           TEXT NOT NULL,
  layer          TEXT,
  severity       TEXT NOT NULL,
  bbox           BOX,                     -- native geometry for spatial clustering
  cell_context   TEXT,
  net_context    TEXT,
  signature      TEXT NOT NULL,
  cluster_id     TEXT
);
CREATE INDEX ON drc_violations USING GIST (bbox);
CREATE INDEX ON drc_violations (drc_run_id, rule);
```

Two things carry disproportionate weight here.

**`signature`** — a stable hash over the semantically identifying fields (for a timing path: startpoint, endpoint, corner, mode; for a DRC violation: rule, layer, normalised location, cell context). Signatures are what make "this violation is the same one as yesterday" answerable, which in turn makes regression detection, suppression/waiver tracking, and "when did this first appear" possible. Without stable signatures, every run is an unrelated island and the platform's central promise — memory across runs — collapses.

**`bbox` as native geometry with a GiST index** — DRC clustering is fundamentally a spatial problem. 500 violations in one region usually share one root cause. Spatial indexing turns clustering from an O(n²) application-layer job into an indexed query.

### 13.5 Artifact Context

```sql
CREATE TABLE artifacts (
  id            TEXT PRIMARY KEY,
  project_id    TEXT NOT NULL,
  job_id        TEXT,
  kind          TEXT NOT NULL,            -- rtl|netlist|def|lef|gds|lib|spef|sdc|vcd|fsdb|report|coverage|log
  logical_path  TEXT NOT NULL,
  blob_id       TEXT NOT NULL REFERENCES blobs(id),
  metadata      JSONB NOT NULL DEFAULT '{}',
  export_class  TEXT NOT NULL DEFAULT 'none',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE blobs (
  id            TEXT PRIMARY KEY,         -- blake3 content hash
  size_bytes    BIGINT NOT NULL,
  storage_uri   TEXT NOT NULL,
  compression   TEXT,
  tier          TEXT NOT NULL DEFAULT 'hot',
  ref_count     INT  NOT NULL DEFAULT 0,
  last_read_at  TIMESTAMPTZ
);

CREATE TABLE lineage_edges (
  from_artifact TEXT NOT NULL,
  to_artifact   TEXT NOT NULL,
  via_job       TEXT NOT NULL,
  PRIMARY KEY (from_artifact, to_artifact, via_job)
);
```

Lineage is what answers "which GDS did this RTL commit produce, and which STA report covers it" — the question every tape-out review asks and that no one can currently answer without a spreadsheet.

## 14. Knowledge Graph

### 14.1 Node and Edge Types

```
Nodes:  Project · Revision · Module · Instance · Port · Net · Clock ·
        Constraint · Cell · Pin · TimingPath · Violation · Report ·
        Test · CoverageGoal · Artifact · FlowRun · Person · Decision · Document

Edges:  INSTANTIATES · CONNECTS_TO · DRIVEN_BY · CLOCKED_BY · CONSTRAINED_BY ·
        TRAVERSES · VIOLATES · PRODUCED_BY · DERIVED_FROM · COVERS ·
        AUTHORED_BY · REVIEWED_BY · SUPERSEDES · REFERENCES · EXPLAINS
```

The last four edge types are the differentiated ones. `AUTHORED_BY`, `REVIEWED_BY`, `SUPERSEDES`, and `EXPLAINS` connect *design artifacts to human decisions and documents*. Any tool can tell you a module instantiates another module. Almost none can tell you who decided the clock ratio was 3:2, when, and why — despite that being the single most expensive piece of knowledge to lose when someone leaves the team.

### 14.2 Projection Pipeline

```
domain events ──▶ projector (per node type) ──▶ graph upsert ──▶ embedding queue
                        │                                             │
                        └─ idempotent by (eventId, projectorVersion)   ▼
                                                             embed text-bearing
                                                             nodes → HiveVector
```

Projector versions are recorded per node. Bumping a projector's version triggers a targeted rebuild of the nodes it owns, replayed from the event log — no downtime, no full rebuild.

### 14.3 Queries the Graph Must Serve

These are the acceptance criteria for the graph design; if a proposed schema cannot serve these efficiently, it is the wrong schema.

1. **Impact analysis** — "What is affected if I change parameter `WIDTH` on module `fifo`?" → traverse `INSTANTIATES*` downward, `CONNECTS_TO` laterally, then `TRAVERSES` into affected timing paths and `COVERS` into affected tests.
2. **Root-cause correlation** — "Which RTL change introduced this timing violation?" → path signature → path nodes → cells → modules → revisions between last-good and current.
3. **Semantic search** — "Where do we handle async reset domain crossing?" → hybrid vector + graph filter scoped to project.
4. **Reuse discovery** — "Have we built a UART with these characteristics before?" → embedding similarity over module summaries, filtered by port-count/parameter shape.
5. **Provenance** — "What produced this GDS?" → `DERIVED_FROM*` to source revisions.
6. **Ownership** — "Who should review a change to this block?" → `AUTHORED_BY` + `REVIEWED_BY` weighted by recency.

---

# PART V — CONTRACTS

## 15. API Surface

Three tiers, deliberately:

| Tier | Protocol | Consumer | Rationale |
|---|---|---|---|
| Public API | GraphQL (federated) | Web app, IDE ext, third parties | Client-shaped queries; one round trip for composite views |
| Streaming | WSS (GraphQL subscriptions) + SSE | Logs, run status, agent tokens | Push semantics for long-running work |
| Internal | gRPC (protobuf, in `proto/`) | Service-to-service | Typed, fast, schema-evolvable |
| Bulk | REST + presigned URLs | Artifact up/download, CLI | Byte-range, resumable, CDN-friendly |

GraphQL for the public surface, gRPC internally, REST only for bytes. Forcing 200GB GDS transfers through GraphQL would be an obvious error; forcing the UI to make eleven REST calls to render a run page is a subtler one.

### 15.1 Federated Schema Sketch

```graphql
type Project {
  id: ID!
  name: String!
  technology: String
  repositories: [Repository!]!
  flows: [FlowDefinition!]!
  runs(filter: RunFilter, page: PageInput): RunConnection!
  health: ProjectHealth!            # resolved by analysis-service
  knowledge: KnowledgeScope!        # resolved by knowledge-service
}

type FlowRun {
  id: ID!
  status: RunStatus!
  revision: Revision!
  stages: [Stage!]!
  jobs(filter: JobFilter): [Job!]!
  artifacts: [Artifact!]!
  comparison(to: ID!): RunComparison!
  reproducibilityKey: String!
}

type TimingPath {
  signature: String!
  slackPs: BigInt!
  corner: String!
  startpoint: PinRef!
  endpoint: PinRef!
  nodes: [PathNode!]!
  history(limit: Int = 20): [TimingPathPoint!]!   # same signature over time
  explanation: Suggestion                          # lazily generated, cached
}

type Mutation {
  startFlowRun(input: StartFlowRunInput!): FlowRun!
  cancelFlowRun(id: ID!): FlowRun!
  approveGate(runId: ID!, stageKey: String!, note: String): Stage!
  applySuggestion(id: ID!, target: ApplyTarget!): AppliedChange!
  waiveViolation(signature: String!, reason: String!, expiresAt: DateTime): Waiver!
}

type Subscription {
  jobLogs(jobId: ID!, fromOffset: Int): LogChunk!
  runStatus(runId: ID!): FlowRun!
  agentStream(agentRunId: ID!): AgentEvent!
}
```

`TimingPath.history` deserves note: because paths have stable signatures, the API can return the slack trajectory of *this specific path* across the last 20 runs. That single field turns a static report into a trend, and it is only possible because of the signature decision in §13.4.

### 15.2 API Conventions

- Cursor pagination everywhere; no offset pagination on any table that grows.
- Persisted queries in production; ad-hoc queries rejected at the gateway (kills a whole class of DoS and makes cost attribution possible).
- Depth and complexity limits enforced at the gateway.
- All mutations idempotent via a client-supplied `Idempotency-Key`.
- Errors carry stable machine-readable codes, never prose-only.

## 16. Plugin SDK

The plugin surface determines whether CerebroEDA can support tools we have never seen — which, given the state of the commercial EDA market, is a precondition for viability.

### 16.1 Extension Points

| Type | Contract | Sandbox |
|---|---|---|
| `tool-adapter` | Wrap an executable: build command, declare resources/licences, classify outputs | Container, no network |
| `parser` | Report text → canonical domain facts | WASM (preferred) or container |
| `viewer` | Render an artifact type in the UI | iframe, postMessage, CSP-locked |
| `flow-node` | New DAG node type with schema and executor | Container |
| `agent` | Agent definition, tools, prompts, eval set | Agent runtime sandbox |
| `vcs` | Source control backend | Container, scoped egress |
| `compute-backend` | Job submission backend | Container, scoped egress |
| `pdk-provider` | PDK discovery and mounting | Container, read-only |

### 16.2 Manifest

```yaml
apiVersion: cerebroeda.plugin/v1
kind: Plugin
metadata:
  name: openroad-adapter
  version: 1.4.0
  publisher: cerebrohive
spec:
  provides:
    - type: tool-adapter
      id: openroad
      toolVersions: [">=2.0.0 <3.0.0"]
      entrypoint: adapter.wasm
    - type: parser
      id: openroad-drc
      consumes: ["text/openroad-drc"]
      emits: ["eda.fact.drc.v1"]
      entrypoint: parsers/drc.wasm
  capabilities:                       # least privilege, explicitly granted
    - artifact:read
    - fact:emit
  resources:
    memoryMi: 512
    timeoutSec: 300
  compatibility:
    platform: ">=1.0.0"
```

### 16.3 Parser Contract

```typescript
export interface Parser {
  readonly id: string;
  canParse(input: ParseInput): Confidence;         // 0..1, cheap sniff
  parse(input: ParseInput, ctx: ParseContext): AsyncIterable<Fact>;
}

export interface Fact {
  type: string;                 // "timing.path" | "drc.violation" | ...
  payload: Record<string, unknown>;
  sourceRef: { line?: number; byteOffset?: number };
  confidence: number;
}
```

Three properties make this contract work in the face of tool output that changes between minor versions:

- **Streaming.** A 4GB STA report must never be loaded into memory.
- **`confidence` and `canParse`.** Multiple parsers may claim a file; the registry picks the highest confidence and records the choice.
- **`sourceRef`.** Every derived fact points back to the exact line of raw output that produced it. This is essential for trust — when an agent says "your worst path is X", the engineer can click through to the literal report line. It is also how parser bugs get found.

WASM is preferred for parsers because it gives deterministic, memory-limited, no-syscall execution of third-party code processing untrusted text — the right trade for the highest-volume, most-exposed extension point.

## 17. CLI and IDE

```bash
cbeda login
cbeda project use my-soc
cbeda run start --flow pnr --rev HEAD --param corner=ss
cbeda run watch  <runId>
cbeda run diff   <runA> <runB>
cbeda artifact pull <artifactId> --to ./out
cbeda ask "why did the setup path to u_fifo/data_reg regress?"
cbeda agent run timing-closure --run <runId>
```

The CLI is a first-class client of the same GraphQL API — no privileged back door. It is also the CI integration surface: a GitHub Action or Jenkins step is a thin wrapper over `cbeda run start --wait`.

---

# PART VI — INTELLIGENCE

## 18. Agent Framework

Agents are `CerebroAgent` definitions with EDA-specific tools and retrieval. `eda-ai-service` orchestrates; it does not implement a runtime.

### 18.1 Agent Anatomy

```yaml
agent:
  id: timing-closure-engineer
  model: { router: hiveops, policy: "reasoning-heavy", fallback: "local-llama-70b" }
  systemPrompt: prompts/timing-closure.md
  retrieval:
    - { source: knowledge-graph, scope: project, maxNodes: 200 }
    - { source: vector, collection: design-docs, topK: 12 }
    - { source: structured, query: worst-paths, limit: 50 }
  tools:
    - get_timing_path
    - compare_runs
    - get_module_source
    - get_constraint
    - simulate_eco          # gated: requires approval
    - propose_patch         # produces Suggestion, never writes
  guardrails:
    maxSteps: 25
    maxTokens: 400000
    maxCostUsd: 5.00
    requireCitations: true
    prohibitedActions: [write_repository, delete_artifact, modify_constraint]
  evaluation:
    suite: evals/timing-closure/
    gate: { minScore: 0.75, minGrounding: 0.9 }
```

### 18.2 Agent Roster (v1)

| Agent | Input | Output | Autonomy |
|---|---|---|---|
| Design Explainer | Module, revision | Structured explanation with citations | Read-only |
| Lint Triage | Lint report | Clustered issues, ranked fixes | Suggestion |
| Regression Triage | Failed test set | Failure clusters, likely causes, owners | Suggestion |
| Timing Closure | STA report, run | Path analysis, ECO candidates | Suggestion |
| DRC Analyst | DRC run | Spatial clusters, root causes, fix strategies | Suggestion |
| Coverage Strategist | Coverage DB | Hole analysis, stimulus proposals | Suggestion |
| Documentation | Revision diff | Interface docs, changelog, review notes | Suggestion |
| Flow Doctor | Failed run | Failure classification, config fix | Suggestion + retry (gated) |

**Every agent is suggestion-only in v1.** Autonomous application is a v2 capability behind explicit per-project policy, and even then only for reversible actions. In a domain where a mistake costs a $3M mask set, the burden of proof for autonomy is extremely high, and the product will be judged on the first bad autonomous action, not the hundredth good one.

### 18.3 Context Assembly

Context quality dominates model choice for this domain. The pipeline:

```
question + anchor (run/module/path/violation)
   │
   ├─▶ structural retrieval   — graph neighbourhood of the anchor, depth-limited
   ├─▶ semantic retrieval     — vector search over docs, comments, prior decisions
   ├─▶ temporal retrieval     — same signature/entity in previous N runs
   ├─▶ lexical retrieval      — OpenSearch over raw reports for exact identifiers
   │
   ├─▶ rerank (cross-encoder) → budget allocation by section
   └─▶ assemble with explicit provenance markers per chunk
```

**Temporal retrieval is the differentiator.** "This path had 40ps slack last week and −120ps now, and the only intervening change was a clock constraint edit" is a far more useful context than any amount of static report text. It is available only because of stable signatures and a persistent event log — the architecture makes the AI good, not the other way round.

### 18.4 Grounding and Citations

Every claim in an agent response carries a provenance reference:

```json
{
  "claim": "The worst setup path violates by 120ps at the ss corner.",
  "citations": [
    { "type": "timing_path", "id": "tp_01J8...", "reportLine": 4471 }
  ]
}
```

Responses failing the grounding threshold are not shown as answers; they are shown as low-confidence with the retrieval trace exposed. Silent hallucination in this domain destroys trust permanently, and a visibly uncertain answer is strictly better than a confidently wrong one.

### 18.5 Evaluation

Agents ship with eval suites and are gated in CI. Every eval case is drawn from real (anonymised or synthetic) design data.

| Dimension | Method | Gate |
|---|---|---|
| Correctness | Golden answers on fixed designs | ≥ 0.75 |
| Grounding | Citation validity check (automated) | ≥ 0.90 |
| Regression | Prior-version comparison | no drop > 5% |
| Cost | Tokens per resolved task | budget |
| Latency | p95 to first token / to completion | SLO |

Agent prompt changes are code changes: reviewed, versioned, eval-gated, and rolled out behind flags. Treating prompts as configuration rather than code is how AI products silently degrade.

## 19. Model Strategy

| Workload | Model class | Deployment |
|---|---|---|
| Copilot chat | Frontier reasoning | Hosted via HiveOps, or local 70B for air-gap |
| Report summarisation | Mid-tier | Hosted or local |
| Classification/clustering | Small fine-tuned or embedding | Local |
| Code/RTL generation | Frontier code model | Hosted; air-gap uses local code model |
| Embeddings | Domain-adapted embedding model | Always local |

**Embeddings are always local** — they are cheap to run, high-volume, and would otherwise mean shipping the entire design corpus to a third party, which most target customers cannot permit. Model routing is a `HiveOps` concern; `eda-ai-service` expresses intent (`reasoning-heavy`, `cheap-bulk`) rather than naming providers, so air-gapped deployments swap routing policy without code changes.

---

# PART VII — OPERATIONS

## 20. Deployment Topologies

| Topology | Target | Notes |
|---|---|---|
| SaaS multi-tenant | Startups, small teams | Shared control plane, isolated data plane per tenant |
| Dedicated VPC | Mid-market | Single-tenant, customer cloud account |
| On-prem / hybrid | Large semiconductor | Control plane on-prem, compute on existing farm |
| Air-gapped | Defence, ITAR | Full local stack, local models, offline plugin bundles |

Air-gapped must be designed in from the start. Retrofitting it means removing every implicit call to a hosted service, which in practice is never done cleanly.

### 20.1 Kubernetes Layout

```
namespace: cerebroeda-system     control plane services, gateway
namespace: cerebroeda-data       stateful sets (or external managed)
namespace: cerebroeda-runners    job execution, resource-quota'd, NetworkPolicy deny-all egress
namespace: cerebroeda-agents     agent runtime, separate quota and egress policy
```

Runners are hard-isolated: dedicated node pools, deny-all egress by default, no service-account token mounting, seccomp and read-only root filesystems. A tool adapter is third-party code processing customer IP; it gets the least privilege the platform can give it.

### 20.2 Environments

`dev` (ephemeral per-PR namespaces) → `staging` (production-shaped, synthetic designs) → `prod` (progressive rollout).

Staging carries a real open-source SoC (e.g. an OpenTitan-class design) running nightly through the full flow. Synthetic 10-module test designs do not surface the problems that appear at real scale, and those problems are the ones that matter.

## 21. CI/CD

```
PR opened
 ├─ lint · typecheck · unit tests · dependency-cruiser boundary check
 ├─ contract tests (protobuf compat, GraphQL schema diff)
 ├─ agent eval suite (changed agents only)
 ├─ security: semgrep · gitleaks · SBOM · image scan
 ├─ ephemeral env + e2e smoke (a real flow run on a tiny design)
 └─ preview URL

merge to main
 ├─ build + sign images (cosign), publish SBOM
 ├─ deploy staging
 ├─ nightly full-flow regression on reference SoC
 └─ progressive prod rollout (canary 5% → 25% → 100%, auto-rollback on SLO breach)
```

Schema and protobuf compatibility checks are blocking. In a federated GraphQL system with independently deployed services, a breaking schema change that reaches main is an outage waiting for a deploy.

## 22. Observability

Per `adr/0003-opentelemetry-facade.md` — OTel throughout.

| Signal | Store | Key content |
|---|---|---|
| Traces | Tempo/Jaeger | Full path: UI → gateway → service → job dispatch → runner |
| Metrics | Prometheus | RED per service; queue depth; licence utilisation; token spend |
| Logs | Loki + OpenSearch | Structured app logs; tool output separately in OpenSearch |
| Run telemetry | ClickHouse | Per-job resource usage, cost attribution, tool runtime trends |
| Agent traces | Postgres + ClickHouse | Full step trace: prompt, retrieval set, tool calls, tokens, cost |

### 22.1 SLOs

| Service | SLI | Target |
|---|---|---|
| GraphQL gateway | Availability | 99.9% |
| Job dispatch | Stage-entry → submitted, p99 | < 2s |
| Log streaming | Emit → visible, p95 | < 3s |
| Report ingest | Artifact → queryable, p95 | < 60s (per GB) |
| Knowledge projection | Event → graph, p95 | < 30s |
| Copilot | Time to first token, p95 | < 2.5s |

### 22.2 Domain Alerts

Beyond infrastructure alerting, these are the signals that indicate the *product* is failing even when the infrastructure is green:

- Licence pool saturated > 30 min (jobs are silently starving)
- Knowledge projection lag > 5 min (agents are reasoning on stale state)
- Parser confidence dropped below threshold for a tool version (a tool upgrade broke ingest)
- Agent grounding score below gate in production (quality regression)
- Job failure rate by tool exceeding baseline (an adapter or tool version is broken)

## 23. Security Architecture

### 23.1 Layers

| Layer | Control |
|---|---|
| Identity | OIDC via HiveIdentity; SCIM provisioning; hardware MFA for admin |
| Authorisation | ReBAC — org → project → resource, with tool-level and PDK-level grants |
| Network | mTLS service mesh; deny-all default NetworkPolicy; runner egress blocked |
| Data at rest | Envelope encryption; per-tenant KMS keys; customer-managed keys for enterprise |
| Data in transit | TLS 1.3 everywhere, including internal |
| Secrets | Vault/External Secrets; no secrets in env for runners — mounted, short-lived |
| Supply chain | Signed images, SBOM, pinned digests, admission control on signature |
| Sandboxing | gVisor/Kata for runners; seccomp; user namespaces; read-only root |
| Audit | Immutable WORM log to HiveGovern; every read of controlled data recorded |

### 23.2 Threat Model (selected)

| Threat | Mitigation |
|---|---|
| Malicious plugin exfiltrates design data | WASM/container sandbox, deny-all egress, capability grants, signature verification |
| Prompt injection via tool output or RTL comments | Retrieved content is untrusted-tagged; tool-calling restricted to declared allowlist; no shell tool exists |
| Cross-tenant leakage via embeddings | Per-tenant vector collections, never shared indices; tenant ID enforced at query layer, not application layer |
| Design data leaving jurisdiction via model call | Routing policy enforced in HiveOps by `data_region` + `export_class`; hosted models denied for controlled data |
| Insider bulk artifact download | Rate limiting, anomaly detection on egress volume, WORM audit |
| Supply chain compromise of tool image | Digest pinning, signature admission, SBOM diffing |

**Prompt injection deserves emphasis.** RTL comments, tool logs, and vendor reports are all attacker-influenceable in a supply-chain scenario and all flow directly into agent context. Mitigations: retrieved content is always structurally delimited and marked untrusted; agents have no general-purpose execution tool; every tool is narrow, typed, and authorisation-checked server-side on each call — never trusting that the model "should not" have called it.

### 23.3 Export Control

`export_class` propagates: PDK → project → run → artifact → derived fact → embedding. Enforcement points: artifact download, model routing, cross-region replication, plugin execution, and search results. A user without the relevant clearance does not see controlled results in search — the results are filtered at the query layer, not hidden in the UI.

## 24. Cost Model

Three cost centres, each independently attributable and capped:

| Centre | Driver | Control |
|---|---|---|
| Compute | Job CPU-hours | Per-project quota, priority classes, spot for retryable stages |
| Storage | Artifact bytes | Dedup, tiering, retention policy, per-project budget alerts |
| Inference | Tokens | Per-agent budget, caching, model routing by task complexity |

Every job and agent run carries a cost attribution tag. "Which project spent the compute budget" must be answerable from ClickHouse in one query — otherwise cost control becomes a quarterly forensic exercise.

---

# PART VIII — SEQUENCING

## 25. Roadmap

Restructured from the original eight-phase plan around one principle: **each phase must be independently useful.** A platform that is only valuable at Phase 8 will not survive to Phase 8.

### Phase 0 — Blueprint (this document)
Architecture, ADRs for contested decisions, contract sketches.

### Phase 1 — Thin Vertical Slice
One flow, end to end, on one open-source design. Ingest RTL → run Yosys + OpenSTA on Kubernetes → parse STA → show worst paths in the UI with history.
**Why:** proves the artifact/job/parse/present chain — the platform's spine. Everything else is breadth over this depth.
**Exit:** an engineer runs a real flow and sees real timing data they would otherwise have read from a text file.

### Phase 2 — Flow Platform
Flow authoring, multi-stage DAGs, full OpenROAD flow, artifact lineage, run comparison, licence-aware scheduling, CLI.
**Exit:** a team replaces a hand-rolled Makefile flow with CerebroEDA.

### Phase 3 — Analysis Depth
DRC/LVS ingest and spatial clustering, coverage merge, regression fan-out and triage, waivers, trend dashboards.
**Exit:** nightly regressions run here, and triage takes less time than before.

### Phase 4 — Knowledge Layer
Design graph, impact analysis, semantic search, provenance, decision capture.
**Exit:** an engineer answers a cross-block question in minutes instead of a day.

### Phase 5 — AI Layer
Copilot, explainer, triage agents, timing/DRC agents, grounding, eval harness.
**Why here, not earlier:** agents are only as good as the graph and normalised analysis data beneath them. Building AI before Phase 3–4 produces a demo, not a product. This is the single most important sequencing decision in the plan, and it inverts the instinct to lead with AI.

### Phase 6 — Enterprise
Multi-tenancy hardening, air-gap deployment, export control, SSO/SCIM, audit, cost management, on-prem installer.
**Exit:** first regulated-customer deployment.

### Phase 7 — Ecosystem
Plugin SDK GA, commercial tool adapters, marketplace, IP catalogue, agent marketplace, partner programme.

### 25.1 Deferred Deliberately

Layout editing, analog flows, custom silicon compilers, autonomous ECO application, foundry certification. Each is a product in its own right.

## 26. Trust Boundaries — Restated

Because it is the decision most likely to erode under commercial pressure:

1. CerebroEDA **never** claims signoff authority.
2. Agents **never** mutate design data without human application.
3. Derived facts **always** link to raw source output.
4. Confidence is **always** exposed, never smoothed away.

Each of these will at some point look like an obstacle to a demo or a deal. They are the product's defensibility. A platform that engineers trust to be honest about uncertainty is a platform they will let near a tape-out.

## 27. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Parser fragility across tool versions | High | High | Plugin parsers, confidence scoring, version pinning, nightly parse-corpus regression |
| R2 | Knowledge graph scale on large SoC | Medium | High | Start Postgres, API boundary enables swap, hierarchical partitioning, lazy expansion |
| R3 | AI outputs not trusted by engineers | High | Critical | Grounding gates, citations, suggestion-only, visible confidence, eval transparency |
| R4 | Commercial tool vendors restrict integration | Medium | High | Open-source-first strategy; adapters use documented CLI/file interfaces only |
| R5 | Air-gap requirement discovered late | Medium | High | Design in from Phase 0; local model path validated by Phase 5 |
| R6 | Licence modelling insufficient for real fabs | Medium | High | Early design-partner validation with a real licence estate |
| R7 | Hive mesh dependency instability | Medium | Medium | Version-pinned contracts, anti-corruption layers, defined degraded modes |
| R8 | Storage cost from artifact retention | High | Medium | Content addressing, dedup, tiering, aggressive default retention |
| R9 | Scope creep toward building EDA algorithms | High | Critical | §1 and §26 as governance gates on every roadmap proposal |
| R10 | Design-partner access (real designs are secret) | High | High | Open-source silicon first; anonymisation tooling; on-prem-first evaluation offering |

R9 and R10 are the existential ones. R9 kills the company slowly by diluting focus into problems with billion-dollar incumbents. R10 kills it quickly: without real designs to build against, every assumption in this document is untested. Securing one design partner with real silicon should precede Phase 2.

## 28. Architectural Decisions (Resolved)

All decisions identified in the Phase 0 review are recorded as ADRs in `docs/architecture/adr/`. Each ADR carries its own Open Questions section; those are the live items, not the decisions themselves.

| # | Decision | Resolution | ADR | Gates |
|---|---|---|---|---|
| D4 | Workflow substrate | Temporal for durable execution, CerebroFlow for authoring | [0009](../decisions/eios-eda/0009-eda-workflow-substrate.md) | Phase 2 |
| D7 | Multi-tenancy | Shared DB + forced RLS; physical isolation in storage/vector/compute | [0010](../decisions/eios-eda/0010-eda-multi-tenancy-and-isolation.md) | Phase 2, 6 |
| D9 | Artifact & result identity | Four identity types; versioned semantic-key signatures | [0011](../decisions/eios-eda/0011-eda-canonical-artifact-identity.md) | Phase 1 |
| D1 | Graph store | Postgres + recursive CTE, with measured migration triggers | [0012](../decisions/eios-eda/0012-eda-knowledge-graph-store.md) | Phase 4 |
| D2 | Runner isolation | gVisor default, Kata for Enterprise, runc only for signed first-party | [0013](../decisions/eios-eda/0013-eda-runner-isolation.md) | Phase 1 |
| D3 | Parser runtime | WASM via Wasmtime; quarantined container escape hatch | [0014](../decisions/eios-eda/0014-eda-parser-runtime.md) | Phase 1, 7 |
| D5 | RTL frontend | Slang for elaboration, Verible for lint/CST — both | [0015](../decisions/eios-eda/0015-eda-rtl-frontend.md) | Phase 1 |
| D6 | Coverage merge | Vendor-native merge in a hierarchical tree + normalised projection | [0016](../decisions/eios-eda/0016-eda-coverage-model.md) | Phase 3 |
| D8 | Waveform strategy | Handoff + bounded strips + signal extraction; no web viewer | [0017](../decisions/eios-eda/0017-eda-waveform-strategy.md) | Phase 3 |

D9 was added during ADR review: the Blueprint treats stable result signatures as a cornerstone (§13.4, §26) but had left the algorithm unspecified, which is not survivable given that every fact ever ingested is stamped with it.

### 28.1 Decisions with Standing Review Obligations

Three decisions are explicitly provisional and carry pre-committed re-evaluation criteria, so that revisiting them is evidence-driven rather than a recurring debate:

- **D1 (graph store)** — quarterly trigger review against measured thresholds T1–T5 in ADR 0012. The review must record numbers, not judgements.
- **D2 (runner isolation)** — gVisor's overhead on real EDA I/O profiles is unmeasured; Phase 1 must produce the figure, and a large enough delta reopens the ADR.
- **D8 (waveform strategy)** — re-evaluate at Phase 4 if Surfer's remote-data protocol matures. Any widening of the strip renderer toward interactivity requires a superseding ADR.

---

## Appendix A — Canonical Event Catalogue (v1)

```
eda.design.repository.connected.v1
eda.design.revision.ingested.v1
eda.design.index.updated.v1
eda.design.module.changed.v1

eda.flow.definition.published.v1
eda.flow.run.started.v1
eda.flow.stage.entered.v1
eda.flow.gate.requested.v1
eda.flow.gate.decided.v1
eda.flow.run.completed.v1

eda.job.queued.v1
eda.job.started.v1
eda.job.log.chunk.v1
eda.job.artifact.produced.v1
eda.job.completed.v1
eda.job.failed.v1

eda.analysis.report.ingested.v1
eda.analysis.fact.emitted.v1
eda.analysis.regression.detected.v1
eda.analysis.violation.waived.v1

eda.artifact.registered.v1
eda.artifact.tiered.v1
eda.artifact.expired.v1

eda.knowledge.projection.completed.v1
eda.knowledge.projection.lagging.v1

eda.agent.run.started.v1
eda.agent.step.completed.v1
eda.agent.suggestion.created.v1
eda.agent.suggestion.applied.v1
eda.agent.run.completed.v1

eda.audit.access.recorded.v1
eda.audit.policy.violated.v1
```

## Appendix B — Repository Layout (Phase 2 target)

```
apps/
  eda-web/                 Next.js app
  eda-cli/                 cbeda
  eda-docs/                product + SDK documentation
packages/
  eda-ui/                  domain UI components (viewers, explorers)
  eda-sdk/                 typed client, generated from GraphQL + proto
  eda-domain/              shared value objects, event schemas
  eda-parsers/             first-party parsers (WASM)
  eda-agents/              agent definitions, prompts, eval suites
services/
  project-service/
  design-service/
  flow-service/
  job-service/
  analysis-service/
  knowledge-service/
  eda-ai-service/
  artifact-service/
  plugin-service/
  ingest-worker/
  runner-agent/
proto/eda/                 protobuf contracts
infra/
  kubernetes/  helm/  terraform/  docker/
docs/
  architecture/  adr/  sdk/
```

This layout follows `adr/0008-monorepo-packaging-strategy.md` and slots into the existing `apps/`, `packages/`, `services/`, `infra/`, `proto/` structure rather than introducing a parallel convention.

---

*End of Phase 0 blueprint. Next artifact: functional specification (`PRODUCT_SPECIFICATIONS/cerebroeda_spec.md`) and ADRs D1–D8.*
