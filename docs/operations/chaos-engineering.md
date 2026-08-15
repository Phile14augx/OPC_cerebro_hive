# CerebroHive Chaos Engineering

Chaos experiments validate that the platform meets its operational objectives under real failure conditions — not just in steady state. They are the runtime counterpart to design-time architectural controls.

---

## Safety controls

**Before running any experiment:**

1. **Staging only.** All experiments target `cerebro-staging`. The `cerebro-chaos` namespace is labelled for Chaos Mesh injection; `cerebro-prod` is never targeted.
2. **Steady-state check.** The `chaos.yml` workflow verifies no critical alerts are already firing before applying experiments. If the cluster is unhealthy, the run aborts.
3. **Environment gate.** Manual workflow dispatch requires approval from the `chaos-staging` GitHub Environment.
4. **Auto-cleanup.** The cleanup job runs `if: always()` — chaos experiments are removed even if the run fails.
5. **Concurrency lock.** `concurrency: chaos-engineering` prevents two chaos runs from interfering with each other.
6. **Duration caps.** Every experiment has an explicit `duration` field. Chaos Mesh auto-reverts when the duration expires.

**Rollback:**
```bash
# Remove all chaos objects immediately
kubectl delete podchaos,networkchaos,httpchaos,stresschaos,iochaos,dnschaos \
  --all -n cerebro-chaos
```

---

## Experiment index

| Stage | File | Fault | Blast Radius | Duration |
|-------|------|-------|-------------|----------|
| 1 | `stage1-workload/pod-kill-forge-api.yaml` | Pod kill | Low | 5m |
| 1 | `stage1-workload/pod-kill-ai-gateway.yaml` | Pod kill + container kill | Medium | 3m |
| 1 | `stage1-workload/pod-kill-ingress.yaml` | Pod kill + pod failure | High | 2m |
| 2 | `stage2-infrastructure/node-cpu-stress.yaml` | CPU saturation (90%) | Medium | 5m |
| 2 | `stage2-infrastructure/node-memory-pressure.yaml` | Memory fill → OOMKill | Medium | 10m |
| 2 | `stage2-infrastructure/disk-fill.yaml` | ENOSPC + I/O latency | Low | 5m |
| 3 | `stage3-dependencies/postgres-failure.yaml` | Postgres pod kill + partition | High | 3m |
| 3 | `stage3-dependencies/redis-failure.yaml` | Redis pod kill + failure | Medium | 3m |
| 3 | `stage3-dependencies/nats-failure.yaml` | NATS pod kill + cluster partition | Medium | 3m |
| 4 | `stage4-network/network-latency.yaml` | 200ms latency (API→DB + broad) | Medium | 10m |
| 4 | `stage4-network/packet-loss-and-partition.yaml` | 20% loss + corruption + partition | High | 5m |
| 4 | `stage4-network/dns-failure.yaml` | DNS SERVFAIL + random IP | High | 3m |
| 5 | `stage5-ai/provider-rate-limit.yaml` | 429 on Anthropic + OpenAI | High | 5m |
| 5 | `stage5-ai/provider-5xx-and-slow-streaming.yaml` | 529 + 15s delay + mid-stream abort | High | 5m |
| 5 | `stage5-ai/embedding-and-budget-exhaustion.yaml` | Embedding failure + budget exhaust | Medium | 5m |

---

## Blast radius definitions

| Level | Meaning |
|-------|---------|
| **Low** | Single pod or single I/O path affected. No user-visible impact expected. |
| **Medium** | One service degraded. Some requests fail; others are served by healthy replicas. |
| **High** | User-facing impact expected. Alerts should fire. SLO budget consumed during the window. |

---

## What each stage validates

### Stage 1 — Workload failures
- Kubernetes pod restart and HPA recovery
- Synthetic probe detection sensitivity (probe fires within 1 interval)
- SLO burn rate stays below warning threshold (< 6×) during pod churn

### Stage 2 — Infrastructure failures
- HPA scale-out under CPU pressure
- OOMKill → restart loop → CrashLoop alert (exercise pod-crashloop runbook)
- I/O failure surfaces as application error (not silent hang)

### Stage 3 — Dependency failures
- Connection pool behavior under postgres unavailability (cl_waiting grows; runbook diagnosis accurate)
- Redis cache-miss fallback to DB (no 500s from cache operations)
- NATS reconnection and JetStream message replay after broker restart

### Stage 4 — Network failures
- Latency SLO burn: 200ms inter-service latency triggers latency burn-rate alert
- Retry logic under packet loss (exponential backoff, not retry storm)
- Circuit breaker opens on partition between forge-api and ai-gateway
- DNS re-resolution behavior (hardcoded IPs vs. per-connection resolve)

### Stage 5 — AI-specific failures
- Provider rate limit (429) → circuit breaker open → fallback provider route
- Provider 5xx → retry with backoff → structured 503 to user (not 500)
- Slow streaming → read timeout fires (not indefinite hang)
- Mid-stream abort → partial response discarded, not surfaced as complete
- Embedding failure → RAG fallback → `withVectorSearchTelemetry` records failure
- Budget exhaustion → hard limit returns 429 → `CerebroAICostBudgetCritical` fires

---

## Running manually

```bash
# Run a specific stage
gh workflow run chaos.yml \
  -f stage=stage5-ai \
  -f dry_run=false

# Dry run to validate manifests without applying
gh workflow run chaos.yml \
  -f stage=stage1-workload \
  -f dry_run=true

# Run a single experiment
gh workflow run chaos.yml \
  -f stage=stage5-ai \
  -f experiment=provider-rate-limit \
  -f dry_run=false
```

---

## Integration with the control assurance framework

| Architectural Control | Static break test | Runtime chaos experiment |
|-----------------------|-------------------|--------------------------|
| G3 Row-Level Security | Disable RLS, verify cross-tenant data leak | Connection churn under postgres-failure.yaml |
| G1 Sandbox Isolation | Remove RuntimeClass, verify escape | Kill sandbox nodes during workload (stage 1) |
| SLO Availability | Inject 5xx in test | pod-kill-forge-api.yaml + SLO burn rate alert |
| SLO Latency | Inject latency in test | network-latency.yaml + latency SLO burn alert |
| ArgoCD GitOps | Commit manifest drift | argocd-out-of-sync runbook drill |
| AI Provider Resilience | Mock failure in unit test | provider-5xx-and-slow-streaming.yaml |
| Budget Controls | Set low budget in test | embedding-and-budget-exhaustion.yaml |

---

## Tooling

- **Chaos Mesh** (CNCF): https://chaos-mesh.org/
- **Install:**
  ```bash
  helm install chaos-mesh chaos-mesh/chaos-mesh \
    -n chaos-testing --create-namespace \
    --set chaosDaemon.runtime=containerd \
    --set chaosDaemon.socketPath=/run/containerd/containerd.sock
  ```
- **Dashboard:** `kubectl port-forward svc/chaos-dashboard -n chaos-testing 2333:2333`
