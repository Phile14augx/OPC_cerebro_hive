# Product Specification: CerebroEDA™

**Status:** Draft Version 0.1 (pending canonicalisation)
**Governing Document:** `PRODUCT_REGISTRY.md`
**Architecture Blueprint:** `docs/architecture/CEREBROEDA-BLUEPRINT.md`
**Phase:** 2.5 — Enterprise Product Specifications

## 1. Product Overview

**CerebroEDA™** is the AI engineering intelligence layer for semiconductor design. It orchestrates open-source and commercial EDA flows, ingests and normalises tool output into a persistent design knowledge graph, and applies grounded AI agents to the work engineers actually lose time to: regression triage, timing closure iteration, DRC root-cause analysis, and navigating designs nobody remembers building.

It is explicitly **not** an EDA tool suite. It never replaces a simulator, synthesiser, or router, and never claims signoff authority. It orchestrates, remembers, explains, and advises — the certified tool remains the authority.

* **Product Family**: Cerebro Applications
* **Category**: AI Engineering / Semiconductor Design Automation
* **Personas**: Technical (RTL Design, Verification, Physical Design, Timing/Signoff, CAD/Methodology Engineers), Engineering Management, Compliance

---

## 2. Core Workflows & User Journeys

### 2.1 Timing Regression Triage
- **The Journey**: A physical design engineer finds the nightly run has 14 new setup violations.
- **Workflow**:
  1. The overnight `FlowRun` completes; `analysis-service` ingests the OpenSTA report and emits `TimingPath` facts with stable signatures.
  2. Signature comparison against the last known-good run isolates the 14 paths that are genuinely new versus the 200 that persist.
  3. The Timing Closure agent retrieves the graph neighbourhood of each path, the intervening RTL and constraint changes, and the slack trajectory across the last 20 runs.
  4. It returns a grounded explanation — "these 11 paths share endpoint cone `u_dma/*`; the only intervening change is the clock uncertainty edit in `constraints/top.sdc:88`" — with every claim citing a report line or revision.
  5. The engineer applies or rejects the suggested ECO candidates. Nothing is written without that decision.

### 2.2 Regression Failure Clustering
- **The Journey**: A verification engineer arrives to 3,000 failing tests.
- **Workflow**:
  1. `job-service` fans the regression out as array jobs; per-test results stream back as events.
  2. Failures are clustered by stack/message signature *before* any model is invoked, collapsing 3,000 failures into ~50 distinct signatures.
  3. The Regression Triage agent reasons once per cluster, correlating each to recent commits via the knowledge graph and proposing likely owners from `AUTHORED_BY` history.
  4. Coverage databases merge through a hierarchical merge tree; the Coverage Strategist proposes stimulus for the holes that moved.

### 2.3 Legacy Block Onboarding
- **The Journey**: An engineer inherits a five-year-old block with no living author.
- **Workflow**:
  1. Semantic search over the design graph surfaces the module, its instantiation sites, its constraints, and the design decisions recorded against it.
  2. The Design Explainer produces an interface and behaviour summary, every statement linked to source lines.
  3. Impact analysis shows the blast radius of the change the engineer is contemplating — downstream instances, affected timing paths, and the tests that cover them.

### 2.4 DRC Root-Cause Analysis
- **The Journey**: A signoff run returns 500 DRC violations.
- **Workflow**:
  1. Violations are stored with native geometry and spatially clustered via a GiST index — 500 violations resolve into 6 regions.
  2. The DRC Analyst agent correlates each cluster to placement/routing context and proposes fix strategies with estimated downstream impact.
  3. Accepted waivers are recorded against violation signatures, so they persist correctly across runs instead of being re-triaged nightly.

---

## 3. High-Level Architecture

CerebroEDA is an event-driven orchestration and projection platform. Full detail in `docs/architecture/CEREBROEDA-BLUEPRINT.md`.

* **Edge**: Next.js web app, `cbeda` CLI, IDE extension — all clients of one federated GraphQL API.
* **Services**: `project`, `design`, `flow`, `job`, `analysis`, `knowledge`, `eda-ai`, `artifact`, `plugin` — seams drawn along rate-of-change and scaling profile, not entity nouns.
* **Event backbone**: Kafka via `HiveExchange`, CloudEvents 1.0 envelope extended with `tenantid`, `correlationid`, `causationid`.
* **Execution**: sandboxed runner fleet across pluggable compute backends (Kubernetes, Slurm, LSF, local) with licence tokens modelled as first-class reservable resources.
* **Data plane**: Postgres (metadata, partitioned job tables), HiveStorage/S3 (content-addressed artifacts), graph store (design knowledge), HiveVector (embeddings), OpenSearch (report/log text), Redis (locks, licence semaphores), ClickHouse (run telemetry and cost).
* **Intelligence**: `CerebroAgent` runtime with EDA-specific tools; all model calls routed through `HiveOps`; embeddings always local.

Two invariants govern the design: **Assistance never mutates** (agents emit `Suggestion` objects only), and **Knowledge is a projection, never a source of truth** (the graph is rebuildable by event replay).

---

## 4. Key Entities (Prisma Schema Impact)

* `Project`: Design project scoped to an org, bound to a technology and default PDK.
  * `id`, `orgId`, `name`, `technology`, `defaultPdkId`, `visibility`
* `PDK`: A registered process design kit, mounted read-only into runners.
  * `id`, `orgId`, `name`, `version`, `mountPath`, `exportClass`, `checksum`
* `LicencePool` / `ResourceClaim`: Advisory licence token accounting via Redis-backed leases.
  * `feature`, `totalTokens`, `vendorDaemon` / `jobId`, `tokens`, `state`, `expiresAt`
* `Revision` / `DesignUnit`: Immutable VCS pointer and the structural RTL index derived from it.
  * `vcsId`, `parentIds`, `committedAt` / `kind`, `name`, `ports`, `parameters`, `instances`, `contentHash`
* `FlowRun` / `Job`: Run lifecycle and its concrete executions.
  * `flowVersionId`, `revisionId`, `status`, `reproducibilityKey` / `stageKey`, `toolRef`, `backend`, `resourceUsage`
* `TimingPath` / `DRCViolation` / `CoverageDB` / `PowerReport`: Normalised, tool-agnostic analysis facts.
  * All carry a stable `signature` enabling cross-run identity, regression detection, and waiver persistence.
* `Artifact` / `Blob` / `LineageEdge`: Content-addressed (BLAKE3) artifact registry with dedup, tiering, and provenance.
* `GraphNode` / `GraphEdge`: The design knowledge graph, including `AUTHORED_BY`, `REVIEWED_BY`, `SUPERSEDES`, `EXPLAINS` edges linking artifacts to human decisions.
* `AgentRun` / `AgentStep` / `Suggestion`: Full agent trace — prompt, retrieval set, tool calls, tokens, cost — and the non-mutating proposals produced.

---

## 5. Integrations & Dependencies

* **Upstream (Depends on)**:
  * `HiveIdentity`: SSO, SCIM, tenant and project RBAC.
  * `HiveOps`: All LLM routing, observability, and cost accounting.
  * `HiveCompute`: Kubernetes/Slurm/LSF scheduling abstraction.
  * `HiveStorage`: Object storage backing the artifact registry.
  * `HiveVector`: Embedding storage and semantic retrieval.
  * `HiveKnowledge`: Graph substrate for the design projection.
  * `HiveExchange`: Kafka event backbone.
  * `CerebroFlow`: DAG scheduling and durable run state; EDA node types register as CerebroFlow plugins.
  * `CerebroAgent` / `HiveAgents`: Agent runtime.
* **Downstream (Outputs to)**:
  * `CerebroStudio`: Human-in-the-loop review and cross-product surfacing.
  * `CerebroInsight`: Programme-level design health and schedule risk analytics.
  * `HiveGovern`: Immutable audit trail and policy enforcement.
  * `HiveMarketplace`: Distribution of tool adapters, parsers, and agents.
* **External Integrations**:
  * Open-source EDA: OpenROAD, Yosys, Verilator, OpenSTA, KLayout, Magic, ngspice, Xyce.
  * Commercial tools via CLI/file-interface adapters only (no proprietary API dependency).
  * Source control: Git, Gerrit, Perforce.
  * Compute estates: Kubernetes, Slurm, LSF.

**Architectural rule**: CerebroEDA introduces no infrastructure primitive that an existing Hive product already provides. Gaps are filed against the Hive product, not worked around locally.

---

## 6. Security & Governance Constraints

* **Signoff Boundary**: CerebroEDA never claims signoff authority. Certified tools remain authoritative; the platform advises and records. This constraint is a governance gate on every roadmap proposal, not a soft preference.
* **Non-Mutating Assistance**: Agents cannot write to repositories, delete artifacts, or modify constraints. Prohibited actions are enforced server-side per tool call, not by prompt instruction. Autonomous application is a post-v1 capability behind explicit per-project policy and restricted to reversible actions.
* **Runner Isolation**: Tool adapters are third-party code processing customer IP. Runners execute with deny-all network egress by default, read-only root filesystems, seccomp, user namespaces, no mounted service-account tokens, on dedicated node pools.
* **Plugin Sandboxing**: Parsers run as WASM with deterministic, memory-limited, no-syscall execution. Capabilities are explicitly granted per manifest; images are signature-verified at admission.
* **Prompt Injection Containment**: RTL comments, tool logs, and vendor reports are attacker-influenceable and flow into agent context. All retrieved content is structurally delimited and marked untrusted; no general-purpose execution tool exists; every agent tool is narrow, typed, and authorisation-checked on each invocation.
* **Export Control (ITAR/EAR)**: `exportClass` propagates from PDK and org through run, artifact, derived fact, and embedding. Enforcement at artifact download, model routing, cross-region replication, plugin execution, and search result filtering — filtered at the query layer, not hidden in the UI.
* **Tenant Isolation of Embeddings**: Per-tenant vector collections, never shared indices. Tenant scoping enforced at the query layer rather than in application code.
* **Air-Gap Parity**: Full functionality must be available in air-gapped deployment with local model inference. Embeddings always run locally regardless of topology.
* **Grounding Requirement**: Every agent claim carries provenance to a report line, revision, or graph node. Responses below the grounding threshold are surfaced as low-confidence with their retrieval trace exposed, never as confident answers. Agent prompt changes are versioned, reviewed, and eval-gated in CI.
* **Reproducibility & Audit**: Every run carries a `reproducibilityKey` over flow version, revision, parameters, tool digests, and PDK version. All access to export-controlled data is recorded to an immutable WORM log in `HiveGovern`.
