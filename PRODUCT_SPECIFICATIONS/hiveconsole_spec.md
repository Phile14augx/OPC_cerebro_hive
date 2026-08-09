# Product Specification: HiveConsole™

**Status:** Canonical Version 1.0  
**Governing Document:** `PRODUCT_REGISTRY.md`  
**Architectural Tier:** Tier 2 — Platform  
**Security Classification:** Tier 2 — Business Critical

---

## 1. Product Overview

**HiveConsole™** is the unified operations and administration portal for the entire CerebroHive Intelligence Mesh. Platform administrators, tenant administrators, AI engineers, data engineers, and security teams all use HiveConsole as their operational control plane — one place to configure, monitor, deploy, and govern every aspect of the platform.

HiveConsole has no business logic of its own. It is a comprehensive UI layer over the management APIs of every platform product.

---

## 2. Console Modules

### 2.1 Platform Overview (Home)
- Real-time platform health dashboard: status of all Tier 0–3 services (up/degraded/down).
- Active incident banner: any ongoing incidents with links to runbooks.
- Key metrics at a glance: API requests/sec, active agents, token consumption today, active tenants.
- Recent events feed: platform deployments, configuration changes, security events.

### 2.2 Tenant Management
- Tenant directory: all tenants with status, plan tier, usage, and primary contact.
- Tenant provisioning: create new tenants with plan assignment, resource quotas, and initial admin user.
- Tenant configuration: per-tenant settings (allowed models, feature flags, data residency region, rate limits).
- Tenant usage dashboard: compute hours, storage consumed, token spend, API calls — current month vs. quota.
- Tenant audit log: all administrative actions performed within a tenant.

### 2.3 Identity & Access (HiveIdentity UI)
- User directory: all users with status, roles, last login.
- Role management: create and assign RBAC roles, view effective permissions.
- Service account management: create, rotate credentials, view last-used.
- Agent token management: view active agent tokens, scope definitions, revoke tokens.
- SSO configuration: configure SAML/OIDC identity providers per tenant.
- MFA enforcement: enable/disable MFA requirements by user or group.
- Access review: periodic access certification workflow — managers confirm their team's access is still needed.

### 2.4 Security (HiveShield UI)
- Threat dashboard: blocked requests, DLP violations, anomalous agent behavior — last 24 hours.
- AI Firewall configuration: configure injection detection thresholds, custom block rules.
- DLP policy management: define sensitive data patterns, configure output scanner dispositions.
- Red team results: latest automated red team report with findings and remediation status.
- Agent behavioral baselines: view per-agent behavior baselines; approve or reject anomaly alerts.
- Security event log: full searchable log of all security events.

### 2.5 Data Platform (HiveData + HiveLake UI)
- Pipeline catalog: all ingestion pipelines — status, last run, next run, data quality score.
- Pipeline run history: per-pipeline run logs, quality check results, row counts.
- Data catalog browser: search and browse all datasets. View schema, lineage, quality scores, ownership.
- Data quality dashboard: fleet-wide quality score trend, datasets below threshold.
- Data contracts: view all contracts, producer/consumer mappings, recent violations.
- Lineage explorer: interactive lineage graph — trace data from source to consumer visually.

### 2.6 Vector Operations (HiveVector UI)
- Collection browser: all vector collections — namespace, size (vector count), index type, engine (pgvector/Qdrant).
- Collection metrics: QPS, latency P99, recall score per collection.
- Recall monitoring: recall benchmark history, alert history.
- Index management: trigger manual index rebuild, view compaction status.
- Collection snapshots: create, list, and restore snapshots.

### 2.7 Model Registry (HiveModels UI)
- Model catalog: all registered models — provider, version, deployment status, performance metrics.
- Deployment management: deploy/undeploy model versions, configure routing (A/B, canary).
- Usage analytics: per-model token consumption, cost, latency — by tenant and use case.
- Evaluation results: latest HiveEvaluation scores per model version.
- Fine-tuning jobs: submit, monitor, and compare fine-tuning experiment results.

### 2.8 Agent Operations (HiveAgents UI)
- Active agents: real-time view of all running agent tasks — status, duration, resource consumption.
- Agent registry: all defined agents — their system prompt, tool manifest, memory config, scope.
- Task history: searchable history of all completed agent tasks with full trace.
- Agent performance: task success rate, average duration, tool call frequency per agent.
- Human-in-the-loop queue: pending agent escalations awaiting human approval.

### 2.9 Governance (HiveGovern UI)
- Policy library: all OPA policies — version, status (active/dry-run/disabled), last modified.
- Policy evaluation log: recent policy decisions (allow/deny) with request context.
- Audit log explorer: full-text search over the immutable audit trail.
- Compliance dashboard: current compliance posture per framework — surfaced from CerebroCompliance.
- Data residency map: which data lives in which region — compliance with data residency policies.

### 2.10 Observability (HiveObservatory UI)
- Service map: live service dependency graph with health indicators.
- Dashboard gallery: pre-built dashboards for each platform product.
- Alert management: view and manage alert rules, silence windows, routing.
- Distributed trace explorer: search traces by service, latency, error, tenant.
- Log explorer: full-text search over structured logs.
- SLO dashboard: error budget consumption per service.

### 2.11 Compute & Infrastructure (HiveCompute UI)
- Cluster overview: nodes, GPUs, utilization.
- Job queue: pending, running, and completed workload jobs.
- Resource quotas: per-tenant compute quotas, current utilization.
- FinOps dashboard: compute cost by tenant, workload type, and product.
- Spot savings: realized spot instance savings vs. on-demand baseline.

---

## 3. Access Control
HiveConsole itself enforces strict RBAC:

| Role | Access |
|---|---|
| Platform Admin | Full access to all modules across all tenants |
| Tenant Admin | Full access within their tenant only |
| Security Admin | HiveShield, HiveGovern, HiveIdentity modules |
| Data Engineer | HiveData, HiveLake, HiveAnalytics modules |
| AI Engineer | HiveModels, HiveAgents, HiveVector, HiveEvaluation modules |
| Compliance Officer | HiveGovern, CerebroCompliance read-only |
| Read Only | View all dashboards and logs; no write actions |

All actions taken in HiveConsole are logged to HiveGovern (who did what, when).

---

## 4. Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js 14 + React |
| UI Components | shadcn/ui + Radix primitives |
| Charts / Visualization | Recharts + D3.js (complex graphs) |
| State Management | Zustand |
| API | Aggregates management APIs of all platform products |
| Auth | HiveIdentity SSO (OIDC) |
| Real-time Updates | WebSocket (live dashboards, agent status) |

---

## 5. SLAs

| Metric | Target |
|---|---|
| Console page load (P99) | <2 seconds |
| Real-time dashboard refresh | <5 seconds |
| Console availability | 99.9% |
| Action audit log write latency | <5 seconds |

---

## 6. Roadmap

| Milestone | Timeline |
|---|---|
| AI Operations assistant (NL queries over platform state: "which tenants are near quota?") | Q1 2027 |
| Change management workflow (propose config change → review → approval → deploy) | Q1 2027 |
| Mobile companion app (alert notifications, incident response, key metrics) | Q2 2027 |
| Customizable home dashboard (drag-and-drop widget layout per user) | Q2 2027 |
