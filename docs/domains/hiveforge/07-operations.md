# HiveForge Masterplan — Phase 7: Operations

**Status:** Proposed, per Phase 6 approval. Governing principle, per your framing: Security defines what is permitted; Operations ensures the platform remains healthy, observable, resilient, and economically sustainable. This phase introduces no new authorization or governance concepts — it operationalizes Phases 0–6, and is checked against them below rather than assumed consistent.

**Evidence-status note, made explicit rather than left blurred:** your example telemetry/SLO targets mix two different evidence statuses. `Orchestrator`, `Contributors`, and `API Gateway` (via AWS API Gateway/Lambda) are **Verified** — they're `packages/engineering-review`'s real, frozen `M26.2-3` baseline (`ADR-006`, `ADR-007`), not HiveForge constructs. `AIGovernanceEngine`, `HumanApprovalWorkflow`, and `SecureAIGateway` (your "AI Gateway" — see naming note below) are **Planned** — HiveForge/HiveShield components from Phases 0–6, not yet built. This document covers both, tagged accordingly, rather than implying the Planned components are as real as the Verified service — consistent with Phase 0 principle #8.

**Naming note:** your "AI Gateway" (§4, §5, §8) is `SecureAIGateway`, fixed in `ADR-030` (`06-SECURITY.md` §5) — not a new or differently-named component. Used as `SecureAIGateway` throughout below to avoid a fourth name for the same thing.

## 1. Objectives

Primary goals, unchanged from your framing: end-to-end observability, operational excellence, reliability engineering, platform resilience, cost optimization, incident response, capacity management, business continuity.

## 2. Operational architecture

```
                           Operations Plane
┌─────────────────────────────────────────────────────────────┐
│ Operational Dashboard                                       │
├─────────────────────────────────────────────────────────────┤
│ Observability                                                │
│ Reliability                                                  │
│ Incident Response                                             │
│ Capacity Management                                           │
│ FinOps                                                         │
│ Backup & Disaster Recovery                                      │
│ Multi-region Operations                                          │
│ Operational Automation                                             │
│ Runbooks                                                             │
│ Service Health                                                        │
└─────────────────────────────────────────────────────────────┘
```

An operations *plane*, not a runtime layer — it observes and acts on the Control Plane (`03-CONTROL-PLANE.md`), Provider Framework (`04-PROVIDER-FRAMEWORK.md`), and Security Fabric (`06-SECURITY.md`); it does not sit inside the request path those describe.

## 3. Service health model

```
Health
│
├── Liveness
├── Readiness
├── Startup
├── Dependency Health
├── Database Health
├── Queue Health
├── AI Provider Health
├── Cache Health
├── Storage Health
└── External Service Health
```

States: `Healthy`, `Degraded`, `Unavailable`, `Maintenance`. This is a standardized *contract* every capability service (`HiveCompute`, `HiveStorage`, ..., `HiveDatabase`) and control-plane component (`HiveGateway`, `SecureAIGateway`) exposes — not a per-service reinvention. `Degraded`/`Unavailable` here are distinct from, but should be kept consistent with, the `Resource` lifecycle's own `Degraded`/`Failed` states (`01-DOMAIN-MODEL.md` §3) — a service reporting `Unavailable` and a `Resource` in `Degraded` are different aggregates' health, not the same signal duplicated.

## 4. Observability architecture

Four pillars:

| Pillar | Purpose |
|---|---|
| Metrics | Quantitative health |
| Logs | Event history |
| Traces | Distributed request flow |
| Events | Domain and operational signals |

"Events" here means both `ADR-024`'s Domain Events and Integration Events (`03-CONTROL-PLANE.md` §5) fed into observability as a read-only consumer — Observability does not introduce a third event category, it's a consumer of the two that already exist, plus `SecurityEvents` (`06-SECURITY.md` §12).

Telemetry coverage, with evidence status per the note above:

| Target | Status |
|---|---|
| API Gateway (AWS, per `ADR-006`) | Verified |
| Orchestrator (`EngineeringReviewOrchestrator`) | Verified |
| Contributors (`ContributorRegistry`, per `ADR-007`) | Verified |
| `SecureAIGateway` | Planned |
| `AIGovernanceEngine` | Planned |
| `HumanApprovalWorkflow` | Planned |
| Event Bus (SNS, per `ADR-006`; `ADR-024` generally) | Verified (SNS) / Planned (HiveForge event bus) |
| Queues | Planned |
| Storage (S3, per `ADR-006`) | Verified |
| Databases (DynamoDB, per `ADR-006`; `HiveDatabase`) | Verified (DynamoDB) / Planned (`HiveDatabase`) |

## 5. SLO/SLI framework

Defined at the **capability** level, not per-service, per your framing — a capability's SLO is what a customer/consumer experiences, regardless of which internal service handles a given request.

**AI Review** (maps to the Verified `packages/engineering-review` capability, not a HiveForge construct): availability 99.9%; latency P95 < 10s; review completion success 99%.

**API Gateway** (`HiveGateway`, `ADR-021`, once built — Planned; the AWS API Gateway instance backing `packages/engineering-review` today is Verified but scoped to that one service, not HiveForge-wide): availability 99.95%; latency P95 < 200ms.

**`SecureAIGateway`** (Planned, `ADR-030`): provider success rate >99%; fallback success 100%.

## ADR-034 — Service Level Objectives & Error Budget Policy

Written as `hiveforge/adr/ADR-034-service-level-objectives-and-error-budget-policy.md`.

## 6. Alerting model

```
P0  Platform unavailable
P1  Critical functionality degraded
P2  Performance degradation
P3  Warnings
P4  Informational
```

Every alert carries: routing, owner, runbook link (§14), escalation path, suppression policy. An alert whose severity would trigger `Human Approval` (`06-SECURITY.md` §14/§1) for the corrective action routes through `HumanApprovalWorkflow`, not a separate ops-only approval path — reusing the platform capability `ADR-028`'s amendment established, exactly as that amendment intended.

## 7. Incident management

```
Detect → Classify → Assign → Mitigate → Recover → Root Cause Analysis → Postmortem → Action Items
```

Postmortems emphasize learning over blame. Every incident record is itself an `Operation` (`01-DOMAIN-MODEL.md` §2) on whatever `Resource` or capability it concerned — not a separate, parallel incident-record aggregate — consistent with the append-only evidence/audit-trail principle already established for `Operation` throughout this masterplan (`ADR-006`, `06-SECURITY.md` §15).

## ADR-035 — Incident Management & Operational Response

Written as `hiveforge/adr/ADR-035-incident-management-and-operational-response.md`. Captures severity, ownership, communication, escalation, RCA, follow-up tracking.

## 8. Operational dashboard

A read surface (`03-CONTROL-PLANE.md` §3a — queries only, same discipline as the Enterprise Security Dashboard) over:

- **Platform:** uptime, deployments, active incidents, service map.
- **AI:** active agents, `SecureAIGateway` provider health, prompt throughput, `HumanApprovalWorkflow` queue, policy violations (sourced from `AIGovernanceEngine`).
- **Security:** reuses `06-SECURITY.md` §16's Enterprise Security Dashboard outputs directly — this document does not define a second security dashboard, per your explicit instruction to avoid duplication.
- **Cost:** model spend, infrastructure, storage, network, cache, cost trends — sourced from the Usage Ledger (§12, below), not a parallel cost-tracking pipeline.
- **Reliability:** SLO compliance, error budgets, latency, availability (§5, `ADR-034`).

## 9. Backup & disaster recovery

RPO/RTO kept distinct:

| System | RPO | RTO |
|---|---|---|
| Metadata | 15 min | 1 hr |
| Audit | 5 min | 30 min |
| Object Storage | 1 hr | 4 hr |

These targets apply to HiveForge's own control-plane data; a customer's `HiveStorage`/`HiveDatabase` Resources carry their own RPO/RTO as a Policy-configurable attribute (a customer's backup/DR requirements are theirs to set, per the same non-interpretive stance `06-SECURITY.md` §7 took on Tags), not a platform-wide constant imposed on customer data.

## ADR-036 — Business Continuity & Disaster Recovery

Written as `hiveforge/adr/ADR-036-business-continuity-and-disaster-recovery.md`. Defines backup policy, restore testing, DR testing, failover, regional recovery.

## 10. Multi-region operations

Documents four patterns — active-active, active-passive, pilot light, warm standby — selected per workload criticality, not a single platform-wide choice. Interacts directly with `ADR-026`'s (amended, `06-SECURITY.md` §1) infrastructure-isolation decision: a dedicated-account Tenant choosing multi-region operates its own regional footprint; a logically-isolated Tenant shares HiveForge's regional topology. This document does not re-decide isolation, it notes the dependency.

## 11. Capacity management

Tracked: CPU, memory, GPU, token throughput, queue depth, storage growth, search index growth, knowledge graph growth. Forecasting-driven, not reactive — feeds `Entitlement`/`Quota` (`05-BUSINESS-PLATFORM.md` §3) planning rather than duplicating that mechanism; capacity management answers "will we have enough," Entitlement/Quota answers "how much is any one customer allowed."

## 12. FinOps

Cost categories tracked separately: infrastructure, AI, storage, search, network, data transfer, per-tenant, per-workspace, per-agent, per-review. **All sourced from the existing Usage Ledger pipeline** (`05-BUSINESS-PLATFORM.md` §4: `ProviderExecutor → UsageRecorded → Normalization → Usage Ledger → Aggregation → Billing API`) — FinOps is an *internal cost-optimization consumer* of that same ledger, not a second metering pipeline. The distinction from `05-BUSINESS-PLATFORM.md`'s Billing API: Billing API answers "what do we charge the customer" (customer-facing, Phase 0 §8 pricing still deferred); FinOps answers "what does it cost us to run this" (internal, no pricing dependency, can proceed regardless of Phase 0 §8's deferred status).

## ADR-037 — Operational Cost Governance (FinOps)

Written as `hiveforge/adr/ADR-037-operational-cost-governance-finops.md`. Focuses on budgets, forecasting, chargeback/showback, optimization — all reading the Usage Ledger, none redefining it.

## 13. Operational automation

Automated: backup verification, certificate renewal (feeds `KeyManagementService` rotation, `06-SECURITY.md` §6), scaling, cache invalidation, dependency health checks, synthetic transactions, housekeeping.

## 14. Runbooks

Every critical capability documents: symptoms, detection, immediate actions, diagnostics, recovery, verification, escalation, rollback. Linked from alerts (§6) where possible.

## 15. Operational readiness checklist

Before a service reaches Production: architecture approved; security review complete; threat model documented; observability implemented; SLOs defined; alerts configured; runbooks available; backup tested; DR tested; cost monitoring enabled; `HumanApprovalWorkflow` integrated (if required); AI Evidence & Provenance integrated where applicable (per `06-SECURITY.md` §15's roadmap note — an integration point, not a claim that capability exists yet); ownership assigned.

## 16. Architectural principles

1. Observability by default — every component emits metrics, logs, traces, events.
2. Operate from objectives — SLOs drive operational decisions.
3. Automate repetitive operations — prefer automation over manual intervention.
4. Design for recovery — recovery is a first-class capability.
5. Operational transparency — dashboards reflect system state in real time.
6. Continuous improvement — incidents produce architectural and operational improvements.

## 17. Architectural impact

Per the standing governance rule:

**ADRs created:** `ADR-034` (SLOs & Error Budget Policy), `ADR-035` (Incident Management & Operational Response), `ADR-036` (Business Continuity & Disaster Recovery), `ADR-037` (Operational Cost Governance/FinOps).

**ADRs amended:** none. This phase operationalizes Phases 0–6 without reopening any of their decisions — the one place it could have (multi-region vs. `ADR-026`'s isolation choice, §10) is recorded as a dependency, not a re-decision.

**Existing specifications requiring updates:** none required immediately. `05-BUSINESS-PLATFORM.md` §4 (Usage Ledger) is referenced, not modified — FinOps is a new consumer of an existing pipeline, which needed no schema change to support it.

**Future phases depending on these decisions:**
- Phase 8 (Roadmap) sequences when Operational Readiness (§15) actually gates a Production launch — this phase fixes the checklist, not the rollout order.
- Any future capability-graduation decision (e.g., `SecureAIGateway` independence, `06-SECURITY.md` §5's revisit trigger) inherits this phase's Service Health contract (§3) and SLO framework (§5) as what "ready to graduate" would be measured against.

**Assumptions remaining open:**
- SLO numeric targets (§5) are illustrative, not commercially committed — real targets depend on Phase 0 §9 (success metrics, still deferred) and real operational data neither exists yet.
- Multi-region pattern selection (§10) per workload is not fixed here — depends on Phase 0 §7 (target customers, still deferred).
- FinOps chargeback/showback (`ADR-037`) is an internal cost-governance mechanism; it does not commit to exposing per-tenant cost data externally — that remains a Billing API (`05-BUSINESS-PLATFORM.md` §6) and Phase 0 §8 pricing decision, separate from this phase.
