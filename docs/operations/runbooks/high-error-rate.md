# Runbook: High Error Rate

**Alert:** `CerebroHighErrorRate`  
**Severity:** Warning (> 1% for 5 min) → Critical (> 5% for 2 min)  
**Oncall team:** Platform SRE  
**Escalation:** `#sre-incidents` → PagerDuty P1

---

## What is happening

More than the threshold percentage of HTTP requests to one or more CerebroHive services are returning 5xx responses. This directly impacts user-facing availability.

---

## Immediate response (< 5 min)

1. **Identify the affected service.**
   ```promql
   topk(5,
     sum by (service, status) (
       rate(http_requests_total{namespace=~"cerebro-.*", status=~"5.."}[5m])
     )
   )
   ```

2. **Check pod health for the failing service.**
   ```bash
   SERVICE=forge-api   # replace with service from step 1
   kubectl get pods -n cerebro-prod -l app=$SERVICE
   kubectl describe pods -n cerebro-prod -l app=$SERVICE | grep -A5 "Events:"
   ```

3. **Tail recent logs.**
   ```bash
   kubectl logs -n cerebro-prod -l app=$SERVICE --since=5m --prefix \
     | grep -E "ERROR|FATAL|panic|unhandled"
   ```

4. **Check if the error is global or endpoint-specific.**
   ```promql
   topk(10,
     sum by (http_route, status) (
       rate(http_requests_total{service="forge-api", status=~"5.."}[5m])
     )
   )
   ```

---

## Diagnosis by error type

### 500 Internal Server Error

Usually an unhandled exception. Check logs for stack traces:
```bash
kubectl logs -n cerebro-prod -l app=$SERVICE --since=10m \
  | jq -r 'select(.level == "error") | "\(.timestamp) \(.message)\n\(.stack // "")"'
```

Look for:
- Database connection failures → see [DB Connection Exhaustion runbook](./db-connection-exhaustion.md)
- Unhandled Promise rejections (Node.js)
- Memory errors → check `container_memory_working_set_bytes`

### 502 / 503 Bad Gateway

The upstream is unreachable or refusing connections:
```bash
# Check service endpoints are populated
kubectl get endpoints $SERVICE -n cerebro-prod

# Check if HPA has scaled pods to 0
kubectl get hpa -n cerebro-prod
```

If endpoints are empty: pods may be crash-looping → see [Pod CrashLoop runbook](./pod-crashloop.md).

### 504 Gateway Timeout

Downstream dependency is slow:
```bash
# Check p99 latency
kubectl exec -n cerebro-prod deploy/$SERVICE -- \
  curl -s localhost:9090/metrics | grep "http_request_duration.*quantile=\"0.99\""
```

Identify the slow dependency with distributed tracing:
- Open Grafana → Explore → Tempo
- Filter: `duration > 5s AND service.name = "$SERVICE"`

---

## Mitigation options

| Situation | Action |
|-----------|--------|
| New deployment caused the spike | `kubectl rollout undo deployment/$SERVICE -n cerebro-prod` |
| Overloaded — too many requests | Scale up: `kubectl scale deployment $SERVICE --replicas=N -n cerebro-prod` |
| Single bad pod | `kubectl delete pod <pod> -n cerebro-prod` |
| Downstream DB overloaded | Enable read replica routing, kill long-running queries |
| External API down | Verify circuit breaker is open, enable fallback/cache mode |

---

## Resolution checklist

- [ ] Error rate below 0.1% sustained for 5 minutes
- [ ] All pods in Running/Ready state
- [ ] No new alerts firing
- [ ] Root cause documented in `#sre-incidents`
- [ ] Incident ticket created if user-impacting > 5 minutes
