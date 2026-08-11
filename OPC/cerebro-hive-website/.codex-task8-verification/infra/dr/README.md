# CerebroHive — Disaster Recovery

This directory contains DR playbooks, exercise scripts, and RTO/RPO evidence. DR exercises are distinct from chaos experiments: chaos tests that individual components fail gracefully; DR validates that the platform can recover from catastrophic loss.

---

## Playbook index

| Scenario | Playbook | RTO Target | RPO Target | Exercised |
|----------|----------|-----------|-----------|-----------|
| Entire cluster loss | [cluster-loss.md](playbooks/cluster-loss.md) | ≤ 4 hours | ≤ 1 hour | ❌ |
| Keycloak loss | [keycloak-loss.md](playbooks/keycloak-loss.md) | ≤ 30 min | ≤ 24 hours | ❌ |
| S3 bucket loss | [s3-bucket-loss.md](playbooks/s3-bucket-loss.md) | ≤ 2 hours | ~0 (CRR) | ❌ |
| NATS cluster loss | [nats-loss.md](playbooks/nats-loss.md) | ≤ 20 min | ≤ 5 min | ❌ |
| Postgres loss | → see [runbooks/db-connection-exhaustion.md](../runbooks/db-connection-exhaustion.md) + [cluster-loss.md](playbooks/cluster-loss.md) Step 4 | ≤ 2 hours | ≤ 1 hour | ❌ |
| Prometheus loss | Fresh pod, starts collecting from T=0; historical data served by Thanos | ≤ 5 min | N/A (Thanos) | ✅ (auto-heals) |
| Grafana loss | All dashboards in Git; `helm upgrade` restores | ≤ 10 min | N/A (Git) | ✅ (auto-heals) |

---

## Executive RTO/RPO summary

These are **targets**. Actual measured values will be recorded after DR exercises.

| Subsystem | RTO Target | RPO Target | Recovery method |
|-----------|-----------|-----------|-----------------|
| Entire platform | 4 hours | 1 hour | Terraform + RDS restore |
| Authentication (Keycloak) | 30 min | 24 hours | Realm export restore |
| Database (Postgres) | 2 hours | 1 hour | RDS snapshot restore |
| Message broker (NATS) | 20 min | 5 min | Helm redeploy + stream recreate |
| Object storage (S3) | 30 min | ~0 | CRR replica promotion |
| Metrics (Prometheus) | 5 min | 0 (Thanos) | Pod reschedule |
| Logs (Loki) | 30 min | ~0 (S3) | CRR + pod reschedule |
| Traces (Tempo) | 10 min | 72 hours | Pod reschedule (blocks in S3) |
| Long-term metrics (Thanos) | 30 min | ~0 (S3) | Store-gateway reschedule |
| GitOps (ArgoCD) | 20 min | 0 (Git) | Helm install + app-of-apps |
| AI Gateway | 2 min | 0 (stateless) | Pod reschedule |

---

## DR exercise schedule

| Exercise | Frequency | Next scheduled |
|----------|-----------|----------------|
| Keycloak realm restore | Quarterly | Sprint N |
| Postgres restore from snapshot | Quarterly | Sprint N |
| NATS full redeploy | Semi-annual | Sprint N+2 |
| S3 CRR failover | Annual | Sprint N+4 |
| Full cluster loss (tabletop) | Annual | Sprint N+4 |
| Full cluster loss (live) | Every 18 months | TBD |

---

## How to run a DR exercise

1. Notify the team in `#sre-incidents` that a DR exercise is beginning
2. Pick the playbook and identify the exercise scope (tabletop vs. live)
3. Run steps in the playbook against **staging**, not production, for the first exercise
4. Record actual RTO/RPO in the Results section of the playbook
5. File any gaps discovered as P1 tickets
6. Update this README with the exercise date and outcomes

---

## DR exercise results log

| Date | Exercise | RTO Achieved | RPO Achieved | Outcome | Notes |
|------|----------|-------------|-------------|---------|-------|
| — | — | — | — | Not yet exercised | — |

---

## Key dependencies for DR

| Dependency | Location | Access needed |
|------------|----------|---------------|
| Terraform state | `s3://cerebro-terraform-state` | AWS AdministratorAccess |
| Helm charts | `github.com/cerebro-hive/cerebro-hive` | GitHub read access |
| RDS snapshots | AWS RDS console | RDS RestoreDBInstanceFromDBSnapshot |
| Keycloak realm export | `s3://cerebro-backups/keycloak/` | S3 GetObject |
| DNS | AWS Route 53 hosted zone | Route53 ChangeResourceRecordSets |
| PagerDuty | https://cerebrohive.pagerduty.com | Account access |
