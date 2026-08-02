# CerebroHive — Production Readiness Review

**Version:** 1.0  
**Status:** In Progress  
**Release gate:** This document must reach ≥ 90% coverage before production launch.

For each subsystem, seven questions are evaluated. A subsystem is considered production-ready when all seven are answered **Yes** with documented evidence.

| Symbol | Meaning |
|--------|---------|
| ✅ | Designed and implemented |
| 🔬 | Tested / evidence exists |
| ❌ | Not addressed |
| 🟡 | Partially addressed |

---

## Evaluation Framework

For each subsystem, answer:

1. **Can we restore it?** — Backup exists, restore procedure is documented and tested.
2. **Can we rotate it?** — Secrets, credentials, and certificates can be rotated without downtime.
3. **Can we upgrade it?** — A procedure exists to upgrade the component with < 5 minutes downtime.
4. **Can we back it up?** — Automated backups are running, retention is configured.
5. **Can we recover it?** — A disaster scenario exists and has been exercised (RTO/RPO measured).
6. **Can we observe it?** — Metrics, logs, and alerts exist and are active.
7. **Can we audit it?** — All write operations produce an audit trail.

---

## PostgreSQL (Primary Datastore)

| Question | Status | Evidence | Notes |
|----------|--------|----------|-------|
| Can we restore it? | 🟡 | Restore procedure documented in runbook | Full restore not yet exercised end-to-end |
| Can we rotate it? | ✅ | PgBouncer credential rotation via Kubernetes Secret + rollout restart | |
| Can we upgrade it? | 🟡 | RDS minor version auto-upgrade enabled | Major version upgrade procedure not documented |
| Can we back it up? | ✅ | RDS automated daily snapshots, 30-day retention | |
| Can we recover it? | ❌ | No RTO/RPO measurement for full DB loss | **Gap** — DR exercise required |
| Can we observe it? | ✅ | pg_stat_activity dashboards, PgBouncer pool alerts | |
| Can we audit it? | 🟡 | Application-level audit logs via EventEmitter | DB-level audit log (pgaudit) not enabled |

**Owner:** Platform SRE  
**Priority gaps:** DR exercise, pgaudit, major version upgrade runbook

---

## MinIO / S3 Object Storage

| Question | Status | Evidence | Notes |
|----------|--------|----------|-------|
| Can we restore it? | ✅ | S3 versioning enabled on all buckets | |
| Can we rotate it? | ✅ | IRSA — no long-lived keys to rotate | |
| Can we upgrade it? | ✅ | MinIO Helm chart upgrade tested in staging | |
| Can we back it up? | ✅ | S3 cross-region replication to `us-west-2` | |
| Can we recover it? | 🟡 | S3 versioning allows object recovery; bucket recreation untested | |
| Can we observe it? | ✅ | MinIO metrics → Prometheus; S3 CloudWatch metrics | |
| Can we audit it? | ✅ | S3 server access logging + CloudTrail | |

**Owner:** Platform SRE  
**Priority gaps:** Full bucket-loss recovery exercise

---

## Keycloak (Identity Provider)

| Question | Status | Evidence | Notes |
|----------|--------|----------|-------|
| Can we restore it? | ❌ | No documented restore procedure | **Critical gap** — Keycloak loss = all users locked out |
| Can we rotate it? | ✅ | Client secrets rotatable via Keycloak admin API | |
| Can we upgrade it? | 🟡 | Helm upgrade tested; no zero-downtime procedure documented | |
| Can we back it up? | 🟡 | Keycloak backed by Postgres (backed up), but realm export not automated | |
| Can we recover it? | ❌ | No RTO/RPO for Keycloak loss | **Critical gap** |
| Can we observe it? | ✅ | Keycloak metrics → Prometheus; login failure alerts | |
| Can we audit it? | ✅ | Keycloak audit events to Loki | |

**Owner:** Platform SRE  
**Priority gaps:** Automated realm export, restore procedure, DR exercise  
**Action required:** Add `keycloak-realm-export` CronJob; test restore from export

---

## Grafana (Observability UI)

| Question | Status | Evidence | Notes |
|----------|--------|----------|-------|
| Can we restore it? | ✅ | All dashboards in Git (provisioned); Grafana itself is stateless | |
| Can we rotate it? | ✅ | OAuth SSO — no Grafana-native passwords in use | |
| Can we upgrade it? | ✅ | Helm upgrade; dashboards re-provisioned on restart | |
| Can we back it up? | ✅ | Dashboards stored in `infra/grafana/dashboards/` (Git = backup) | |
| Can we recover it? | ✅ | Full recovery = `helm upgrade` + ArgoCD sync | Estimated RTO: < 10 minutes |
| Can we observe it? | 🟡 | Grafana availability is observed by Prometheus, but no Grafana-is-down alert | |
| Can we audit it? | ✅ | Grafana audit log enabled in grafana.ini | |

**Owner:** Platform SRE  
**Priority gaps:** Add `CerebroGrafanaDown` probe + alert

---

## Loki (Log Aggregation)

| Question | Status | Evidence | Notes |
|----------|--------|----------|-------|
| Can we restore it? | 🟡 | Loki chunks in S3; rehydration from S3 not tested | |
| Can we rotate it? | ✅ | IRSA auth to S3; no static credentials | |
| Can we upgrade it? | 🟡 | Helm upgrade tested; memberlist gossip ring restart procedure not documented | |
| Can we back it up? | ✅ | S3 stores all log chunks; cross-region replication | |
| Can we recover it? | ❌ | Loki loss = log gap during downtime (acceptable); restore from S3 untested | |
| Can we observe it? | ✅ | Loki component metrics → Prometheus | |
| Can we audit it? | N/A | Loki is the audit system | |

**Owner:** Platform SRE  
**Retention:** 30 days hot (S3 Infrequent Access); compliance requirements TBD  
**Priority gaps:** Chunk rehydration runbook and exercise

---

## Tempo (Distributed Tracing)

| Question | Status | Evidence | Notes |
|----------|--------|----------|-------|
| Can we restore it? | 🟡 | Trace blocks in S3; reingestion not supported (by design) | Historical traces not recoverable after loss |
| Can we rotate it? | ✅ | IRSA auth; no static credentials | |
| Can we upgrade it? | 🟡 | Helm upgrade procedure not documented | |
| Can we back it up? | ✅ | S3 stores all trace blocks | |
| Can we recover it? | 🟡 | Forward-only recovery: new traces captured after restart | Loss of in-flight traces during downtime is accepted |
| Can we observe it? | ✅ | Tempo component metrics → Prometheus | |
| Can we audit it? | N/A | Tempo is a tracing system, not a business data store | |

**Owner:** Platform SRE  
**Retention:** 72 hours hot; 30 days cold (S3)  
**Priority gaps:** Upgrade runbook

---

## Thanos (Long-term Metrics)

| Question | Status | Evidence | Notes |
|----------|--------|----------|-------|
| Can we restore it? | 🟡 | Blocks in S3; Thanos store-gateway rehydrates on restart | |
| Can we rotate it? | ✅ | IRSA auth; no static credentials | |
| Can we upgrade it? | 🟡 | Upgrade procedure not documented; compactor must be stopped first | |
| Can we back it up? | ✅ | S3 with cross-region replication; blocks are immutable | |
| Can we recover it? | 🟡 | Store-gateway loss: metric queries degrade to 2h window until restart | Compactor loss: blocks accumulate, no data loss |
| Can we observe it? | ✅ | Thanos component metrics → Prometheus (PodMonitor configured) | |
| Can we audit it? | N/A | Read-only query path | |

**Owner:** Platform SRE  
**Retention:** 1 year raw; 2 years 5m; 5 years 1h  
**Priority gaps:** Upgrade runbook (especially: stop compactor first, then upgrade sidecar)

---

## ArgoCD (GitOps Controller)

| Question | Status | Evidence | Notes |
|----------|--------|----------|-------|
| Can we restore it? | ✅ | ArgoCD state is derived from Git; full restore = fresh install + app-of-apps sync | |
| Can we rotate it? | ✅ | ArgoCD admin password rotatable; repo credentials via Kubernetes Secrets | |
| Can we upgrade it? | ✅ | ArgoCD upgrade documented (apply new install manifests) | |
| Can we back it up? | ✅ | All desired state is in Git (Git is the backup) | |
| Can we recover it? | ✅ | RTO: < 30 minutes (reinstall + sync); RPO: zero (state is in Git) | |
| Can we observe it? | ✅ | ArgoCD metrics → Prometheus; out-of-sync alerts configured | |
| Can we audit it? | ✅ | ArgoCD audit log; GitHub commit history is the authoritative audit trail | |

**Owner:** Platform SRE  
**Notes:** ArgoCD is the lowest-risk subsystem for DR. Git is the source of truth.

---

## NATS (Message Broker)

| Question | Status | Evidence | Notes |
|----------|--------|----------|-------|
| Can we restore it? | 🟡 | JetStream streams backed by Persistent Volume; restore from PV snapshot | |
| Can we rotate it? | ✅ | NKey-based auth; keys rotatable | |
| Can we upgrade it? | 🟡 | Rolling upgrade procedure for NATS cluster not documented | |
| Can we back it up? | 🟡 | PV snapshots scheduled; JetStream file storage on gp3 | |
| Can we recover it? | ❌ | Full NATS cluster loss scenario not exercised | **Gap** — messages in flight would be lost |
| Can we observe it? | ✅ | NATS server metrics → Prometheus; JetStream consumer lag alerts | |
| Can we audit it? | 🟡 | Message audit trail via application logs; not at broker level | |

**Owner:** Platform SRE  
**Priority gaps:** Full cluster loss DR exercise; rolling upgrade runbook; broker-level audit

---

## AI Gateway (Inference Router)

| Question | Status | Evidence | Notes |
|----------|--------|----------|-------|
| Can we restore it? | ✅ | Stateless; restore = pod reschedule (< 60s) | |
| Can we rotate it? | ✅ | Provider API keys stored as Kubernetes Secrets; rotation via `kubectl create secret` + rollout | |
| Can we upgrade it? | ✅ | Rolling deployment strategy; zero-downtime upgrade | |
| Can we back it up? | N/A | Stateless; no persistent data | |
| Can we recover it? | ✅ | RTO: < 2 minutes (pod rescheduling); no data to recover | |
| Can we observe it? | ✅ | Full AI telemetry via InstrumentedAIProvider; dashboards, cost alerts, latency SLO | |
| Can we audit it? | ✅ | Every inference request logged with workspace_id, model, token counts | |

**Owner:** AI Platform team  
**Notes:** Highest observability coverage of any subsystem.

---

## Secrets Management

| Question | Status | Evidence | Notes |
|----------|--------|----------|-------|
| Can we restore it? | 🟡 | Kubernetes Secrets backed by etcd; no external secrets manager | **Gap** — consider AWS Secrets Manager + External Secrets Operator |
| Can we rotate it? | 🟡 | Manual rotation via `kubectl create secret` + rollout | Rotation not automated |
| Can we upgrade it? | ✅ | No upgrade needed (Kubernetes native) | |
| Can we back it up? | 🟡 | etcd backup covers Secrets; no independent secret backup | |
| Can we recover it? | 🟡 | Recovery tied to etcd restore; not independently exercised | |
| Can we observe it? | 🟡 | No secrets access auditing currently enabled | |
| Can we audit it? | ❌ | No audit trail for secret reads (only writes via etcd audit) | **Gap** |

**Owner:** Platform SRE  
**Action required:** Evaluate External Secrets Operator + AWS Secrets Manager for rotation automation and audit trail

---

## Summary Scorecard

| Subsystem | Restore | Rotate | Upgrade | Backup | Recover | Observe | Audit | Score |
|-----------|---------|--------|---------|--------|---------|---------|-------|-------|
| PostgreSQL | 🟡 | ✅ | 🟡 | ✅ | ❌ | ✅ | 🟡 | 4/7 |
| MinIO/S3 | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | ✅ | 6.5/7 |
| Keycloak | ❌ | ✅ | 🟡 | 🟡 | ❌ | ✅ | ✅ | 3.5/7 |
| Grafana | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | 6.5/7 |
| Loki | 🟡 | ✅ | 🟡 | ✅ | ❌ | ✅ | N/A | 4/6 |
| Tempo | 🟡 | ✅ | 🟡 | ✅ | 🟡 | ✅ | N/A | 4/6 |
| Thanos | 🟡 | ✅ | 🟡 | ✅ | 🟡 | ✅ | N/A | 4/6 |
| ArgoCD | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 7/7 |
| NATS | 🟡 | ✅ | 🟡 | 🟡 | ❌ | ✅ | 🟡 | 3.5/7 |
| AI Gateway | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | ✅ | 7/7 |
| Secrets | 🟡 | 🟡 | ✅ | 🟡 | 🟡 | 🟡 | ❌ | 2.5/7 |

**Overall PRR score: 54.5 / 77 = 70.8%**

---

## Critical gaps before production launch

These must reach ✅ before launch:

1. **Keycloak backup and restore** — Automated realm export CronJob + documented restore procedure + exercise. Keycloak loss = total auth outage.
2. **PostgreSQL DR exercise** — Measure RTO/RPO for full DB loss. Minimum: restore from RDS snapshot to a fresh instance.
3. **NATS cluster loss DR** — Exercise full cluster loss; measure how many in-flight messages are lost; document acceptable loss window.
4. **Secrets audit trail** — Enable Kubernetes audit policy for Secret reads; evaluate External Secrets Operator.

---

## Next actions

| Action | Owner | Target |
|--------|-------|--------|
| Keycloak realm export CronJob | Platform SRE | Sprint N |
| Keycloak restore runbook + exercise | Platform SRE | Sprint N |
| Postgres full restore exercise (RTO/RPO) | Platform SRE | Sprint N |
| NATS rolling upgrade runbook | Platform SRE | Sprint N+1 |
| NATS DR exercise | Platform SRE | Sprint N+1 |
| External Secrets Operator evaluation | Platform SRE | Sprint N+1 |
| Grafana availability probe + alert | Platform SRE | Sprint N |
| pgaudit enablement on RDS | DBA | Sprint N+1 |
