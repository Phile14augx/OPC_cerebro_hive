# Architecture Decision Records

This directory consolidates every ADR series found in the repository. They were written independently by different workstreams at different times, so **numbering is not unique across series** — that's why each series has its own subfolder rather than one flat, renumbered sequence. Renumbering was deliberately avoided: it would rewrite history without adding information, and any file could be cross-referenced by its original number elsewhere.

| Folder | Scope | Numbering |
|---|---|---|
| [`platform-core/`](./platform-core/) | Core web platform decisions (monorepo, Next.js, state, design tokens, workspace runtime) | `0001`–`0006` |
| [`event-sourcing/`](./event-sourcing/) | Why event sourcing / CQRS / lease fencing / replay determinism for the engineering-review event store | `ADR-001`–`ADR-008` |
| [`eios-eda/`](./eios-eda/) | EIOS / EDA (electronic design automation) platform decisions — workflow substrate, multi-tenancy, knowledge graph, runners | `0001`–`0017` |
| [`eios-transition/`](./eios-transition/) | The transition from the earlier 5-tier architecture to the 10-layer EIOS architecture | `ADR-000` (template), `ADR-001` |
| [`engineering-review/`](./engineering-review/) | Engineering Review subsystem decisions (advisory-only status, evidence model, contributor interface) | `ADR-001`–`ADR-007` |
| [`hiveforge/`](./hiveforge/) | HiveForge platform decisions (provider abstraction, control plane, execution runtime, security) | `ADR-020`–`ADR-052` |

## Full registry

Every ADR in the repository, by namespace-qualified ID. This is the disambiguation table — use the namespace-qualified ID (e.g. `event-sourcing/ADR-001`, not just "ADR-001") whenever citing one of these from outside its own folder, since `platform-core`, `event-sourcing`, `eios-transition`, `engineering-review`, and `hiveforge` each independently restart their own numbering.

> **Known residual ambiguity — not fixed, flagged instead:** in `platform-core/`, the *filenames* were renumbered `0001`–`0006` to avoid an on-disk collision (the original `docs/adr/` had two files both named `0001-*.md`), but the *in-document titles* of `0002-monorepo.md` through `0006-workspace-runtime.md` still read "ADR 0001" through "ADR 0005" internally (one less than their filename). The content was not rewritten to avoid silently editing history. If you're citing one of these, cite the file path, not the in-document title number.

| Namespace-qualified ID | Title (as written in the document) |
|---|---|
| `platform-core/0001` (`0001-enterprise-state-management.md`) | ADR 0001: Enterprise State Management Architecture |
| `platform-core/0002` (`0002-monorepo.md`) | ADR 0001: Monorepo Package Boundaries *(in-doc title says 0001 — see ambiguity note above)* |
| `platform-core/0003` (`0003-nextjs.md`) | ADR 0002: Stable Next.js Adoption *(in-doc title says 0002)* |
| `platform-core/0004` (`0004-state.md`) | ADR 0003: Enterprise State Management *(in-doc title says 0003)* |
| `platform-core/0005` (`0005-design-tokens.md`) | ADR 0004: Design Token Pipeline *(in-doc title says 0004)* |
| `platform-core/0006` (`0006-workspace-runtime.md`) | ADR 0005: Workspace Runtime Capabilities *(in-doc title says 0005)* |
| `event-sourcing/ADR-001` | Why Event Sourcing? |
| `event-sourcing/ADR-002` | Why Lease Fencing? |
| `event-sourcing/ADR-003` | Why CQRS? |
| `event-sourcing/ADR-004` | Replay Determinism Rules |
| `event-sourcing/ADR-005` | Snapshot Strategy |
| `event-sourcing/ADR-006` | Projection Consistency Model |
| `event-sourcing/ADR-007` | Plugin Architecture |
| `event-sourcing/ADR-008` | Archive Strategy |
| `eios-eda/0001` | Event-Driven Architecture |
| `eios-eda/0002` | Relational Graph Modeling |
| `eios-eda/0003` | OpenTelemetry Facade |
| `eios-eda/0004` | Dynamic Navigation Registry |
| `eios-eda/0005` | Kernel Lifecycle Management |
| `eios-eda/0006` | Capability Discovery |
| `eios-eda/0007` | Runtime Lifecycle Contract |
| `eios-eda/0008` | Monorepo Packaging Strategy (Source-First vs. Built-Artifact Consumption) |
| `eios-eda/0009` | CerebroEDA Workflow Substrate |
| `eios-eda/0010` | CerebroEDA Multi-Tenancy and Data Isolation |
| `eios-eda/0011` | Canonical Artifact and Result Identity |
| `eios-eda/0012` | CerebroEDA Knowledge Graph Store |
| `eios-eda/0013` | CerebroEDA Runner Isolation |
| `eios-eda/0014` | CerebroEDA Parser Runtime |
| `eios-eda/0015` | CerebroEDA RTL Frontend |
| `eios-eda/0016` | CerebroEDA Coverage Model and Merge Strategy |
| `eios-eda/0017` | CerebroEDA Waveform Strategy |
| `eios-transition/ADR-000` | Architecture Decision Record Template |
| `eios-transition/ADR-001` | Transition to Enterprise Intelligence Operating System (EIOS) |
| `engineering-review/ADR-001` | Engineering Review is advisory and never authorizes publication |
| `engineering-review/ADR-002` | The existing `CanPublishWorkflow` policy remains the sole authorization authority |
| `engineering-review/ADR-003` | Evidence is the primary artifact; findings and recommendations are derived from it |
| `engineering-review/ADR-004` | Engineering Review is integrated into the workflow publication lifecycle, not the CI/CD release lifecycle |
| `engineering-review/ADR-005` | The review framework is extensible through append-only contributors |
| `engineering-review/ADR-006` | Persistence, eventing, and transport layer adopted from the discovered vertical slice |
| `engineering-review/ADR-007` | Canonical contributor interface; migration path for the M26.4 stub contributors |
| `hiveforge/ADR-020` | Provider Abstraction Layer |
| `hiveforge/ADR-021` | HiveGateway as the platform control plane |
| `hiveforge/ADR-022` | Resource lifecycle state machine |
| `hiveforge/ADR-023` | Identity and credential escrow |
| `hiveforge/ADR-024` | Event-driven platform architecture |
| `hiveforge/ADR-025` | Billing and metering model |
| `hiveforge/ADR-026` | Multi-tenant isolation strategy |
| `hiveforge/ADR-027` | Failure handling and retry classification |
| `hiveforge/ADR-028` | Zero Trust identity, ABAC authorization, and the human-approval decision outcome |
| `hiveforge/ADR-029` | AI agent identity and the AIGovernanceEngine |
| `hiveforge/ADR-030` | Secure prompt gateway and secure AI gateway |
| `hiveforge/ADR-031` | Secrets management and data classification |
| `hiveforge/ADR-032` | Runtime, supply chain, and CI/CD security |
| `hiveforge/ADR-033` | Infrastructure security, detection platform, and AI Security Operations Center |
| `hiveforge/ADR-034` | Service Level Objectives and error budget policy |
| `hiveforge/ADR-035` | Incident management and operational response |
| `hiveforge/ADR-036` | Business continuity and disaster recovery |
| `hiveforge/ADR-037` | Operational cost governance (FinOps) |
| `hiveforge/ADR-038` | Policy inheritance precedence and conflict resolution |
| `hiveforge/ADR-039` | Canonical Execution aggregate |
| `hiveforge/ADR-040` | Execution lifecycle state machine |
| `hiveforge/ADR-041` | Standalone production orchestrator |
| `hiveforge/ADR-042` | Standalone execution persistence, checkpointing, and replay |
| `hiveforge/ADR-043` | Adopt `packages/events` as the Execution event-delivery foundation |
| `hiveforge/ADR-044` | Execution Control Semantics — Authorization, Cancellation, Timeout (Phase 9f-1) |
| `hiveforge/ADR-045` | Execution Reliability & Ownership — Retry, Idempotency, Leases, Failure Classification (Phase 9f-2) |
| `hiveforge/ADR-046` | Execution Runtime Providers — Postgres Leases/Idempotency, NATS Event Delivery (Phase 9g-1) |
| `hiveforge/ADR-047` | Execution Scheduler — Delayed Runs, Proactive Timeout, Retry Scheduling (Phase 9g-2) |
| `hiveforge/ADR-048` | Execution Workers — Lease Heartbeat, Cooperative Cancellation Delegation (Phase 9g-3) |
| `hiveforge/ADR-049` | Execution Event Delivery — Transactional Outbox, Relay, Subscriber Reuse (Phase 9g-4) |
| `hiveforge/ADR-050` | Execution Observability — Tracing, Metrics, Structured Logging Contracts (Phase 9g-5) |
| `hiveforge/ADR-051` | End-to-End Verification Strategy (Phase 9g-6) |
| `hiveforge/ADR-052` | Execution Runtime Live Integration — First Real Caller (Phase 10.1/10.2) |

## Adding a new ADR

Pick the folder that matches the subsystem the decision belongs to, or create a new folder if it's a genuinely new subsystem. Use the next free number in that folder's sequence. Follow the standard ADR shape: status, context, decision, consequences.

## Origin

These folders were consolidated from (previously) `docs/adr/`, `docs/architecture/adr/`, `audit/adr/`, `hiveforge/adr/`, and `architecture/adrs/` during the August 2026 documentation reorganization. `docs/adr/README.md` and `docs/decisions/README.md` are left as redirect stubs in case anything still links to the old paths.
