# Runbook: SLO Burn Rate

**Alert:** `CerebroSLOErrorBudgetBurning` / `CerebroSLOErrorBudgetCritical`  
**Severity:** Warning (6× burn) → Critical (14× burn)  
**Oncall team:** Platform SRE  
**Escalation:** `#sre-incidents` → PagerDuty P1

---

## What is happening

The platform's error budget is being consumed faster than the SLO allows. A 14× burn rate on the 1-hour window means the **entire 30-day error budget will be exhausted in ~2 hours** if left unresolved.

| Window | Threshold | Meaning |
|--------|-----------|---------|
| 1h     | > 14×     | Critical — page now |
| 6h     | > 6×      | Warning — investigate |
| 24h    | > 3×      | Slow burn — ticket |

---

## Immediate response (< 5 min)

1. **Check the SLO dashboard.**
   ```
   https://grafana.cerebrohive.com/d/cerebro-slo
   ```
   Identify which SLI is burning: availability or latency.

2. **Check active alerts in Alertmanager.**
   ```bash
   curl -s https://alertmanager.cerebrohive.com/api/v2/alerts \
     | jq '.[] | select(.labels.alertname | startswith("Cerebro")) | {alert: .labels.alertname, service: .labels.service, value: .annotations.summary}'
   ```

3. **Get recent error rate by service.**
   ```promql
   sum by (service) (
     rate(http_requests_total{namespace=~"cerebro-.*", status=~"5.."}[5m])
   ) / sum by (service) (
     rate(http_requests_total{namespace=~"cerebro-.*"}[5m])
   )
   ```

4. **Check recent deployments** — a deployment in the last 30 minutes is the most common root cause.
   ```bash
   kubectl get events -n cerebro-prod --sort-by='.lastTimestamp' | tail -30
   kubectl rollout history deployment -n cerebro-prod
   ```

---

## Diagnosis

### Is it a new deployment?

```bash
# List recent rollouts
kubectl get replicasets -n cerebro-prod \
  --sort-by='.metadata.creationTimestamp' -o wide | tail -10
```

If a ReplicaSet was created in the last 30 minutes and error rate spiked at the same time → rollback:

```bash
kubectl rollout undo deployment/<name> -n cerebro-prod
kubectl rollout status deployment/<name> -n cerebro-prod
```

### Is it a dependency (database, cache, external API)?

```bash
# DB latency
kubectl exec -n cerebro-prod deploy/forge-api -- \
  psql $DATABASE_URL -c "SELECT query, calls, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Redis
kubectl exec -n cerebro-prod deploy/forge-api -- \
  redis-cli -u $REDIS_URL info stats | grep -E "rejected_connections|keyspace_hits|keyspace_misses"
```

### Is it traffic spike / overload?

```promql
# Request rate vs. baseline
sum(rate(http_requests_total{namespace="cerebro-prod"}[5m]))
  / sum(rate(http_requests_total{namespace="cerebro-prod"}[5m] offset 1d))
```

If >2× baseline, consider enabling rate limiting or scaling HPA:
```bash
kubectl scale deployment forge-api --replicas=8 -n cerebro-prod
```

### Is it a single noisy pod?

```bash
kubectl top pods -n cerebro-prod --sort-by=cpu | head -20
kubectl logs -n cerebro-prod -l app=forge-api --since=10m | grep -c "ERROR"
```

Delete misbehaving pod (it will reschedule):
```bash
kubectl delete pod <pod-name> -n cerebro-prod
```

---

## Resolution checklist

- [ ] Root cause identified and documented in the incident channel
- [ ] Error rate below 0.1% for 5+ minutes
- [ ] Burn rate back below 1× on the 1h window
- [ ] No new P0/P1 alerts firing
- [ ] Grafana SLO dashboard shows error budget stabilizing
- [ ] Postmortem scheduled if > 30 min burn at critical level

---

## Post-incident

1. File a postmortem in Notion: `CerebroHive > Postmortems`
2. Update this runbook with any new diagnosis steps discovered
3. If the root cause was a deployment: add a canary step to the CI pipeline for the affected service
