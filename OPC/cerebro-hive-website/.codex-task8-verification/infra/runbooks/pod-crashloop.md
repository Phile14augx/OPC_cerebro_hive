# Runbook: Pod CrashLoopBackOff

**Alert:** `CerebroPodCrashLooping`  
**Severity:** Warning (restarts > 5 in 15 min) → Critical (restarts > 15 in 15 min)  
**Oncall team:** Platform SRE  
**Escalation:** `#sre-incidents` → PagerDuty P1 if production service is degraded

---

## What is happening

One or more pods are repeatedly crashing and being restarted by Kubernetes. A pod in `CrashLoopBackOff` means the container's main process is exiting non-zero, Kubernetes restarts it, and the backoff timer grows exponentially (10s → 20s → 40s … up to 5 minutes between restarts).

---

## Immediate response (< 5 min)

1. **Identify crashing pods.**
   ```bash
   kubectl get pods -n cerebro-prod --field-selector=status.phase!=Running \
     | grep -v Completed

   # Or, list by restart count
   kubectl get pods -n cerebro-prod \
     -o=custom-columns='NAME:.metadata.name,RESTARTS:.status.containerStatuses[0].restartCount,STATUS:.status.phase' \
     | sort -k2 -rn | head -20
   ```

2. **Check the exit reason.**
   ```bash
   POD=<pod-name>
   kubectl describe pod $POD -n cerebro-prod | grep -A10 "Last State:"
   # Look for: Exit Code, Reason (OOMKilled, Error, etc.)
   ```

3. **Read the crash logs from the previous container.**
   ```bash
   kubectl logs $POD -n cerebro-prod --previous
   # If multi-container pod, specify:
   kubectl logs $POD -n cerebro-prod -c <container-name> --previous
   ```

---

## Diagnosis by exit code

| Exit Code | Likely Cause | Action |
|-----------|--------------|--------|
| `137` / Reason `OOMKilled` | Container hit memory limit | Increase limit or fix memory leak |
| `1` | App startup crash | Check logs for config/env var errors |
| `0` | Process exited cleanly but shouldn't | Check liveness probe config, or app logic |
| `2` | Misuse / fatal error | Check for missing config files |
| `143` | SIGTERM timeout | Increase `terminationGracePeriodSeconds` |

### OOMKilled

```bash
# See memory limit vs. usage history
kubectl top pods -n cerebro-prod | grep $POD
kubectl get pod $POD -n cerebro-prod -o jsonpath='{.spec.containers[*].resources}'

# Temporary fix: increase memory limit
kubectl set resources deployment <name> -n cerebro-prod \
  --limits=memory=2Gi --requests=memory=1Gi
```

Identify leak long-term via Pyroscope continuous profiling or `node --inspect`.

### Startup failure (exit 1)

Most common causes:
- Missing or wrong environment variable
- Database not reachable at startup
- Secret not mounted

```bash
# Check all env vars are injected
kubectl exec $POD -n cerebro-prod -- env | sort

# Check Secret/ConfigMap mounts
kubectl describe pod $POD -n cerebro-prod | grep -A5 "Environment\|Volumes\|Mounts"
```

---

## Mitigation

If the service is degraded and pods won't stay up:

1. **Scale up replicas** to spread traffic across healthy pods while crashing ones are diagnosed:
   ```bash
   kubectl scale deployment <name> --replicas=6 -n cerebro-prod
   ```

2. **Force a rollback** if the crash started after a deployment:
   ```bash
   kubectl rollout history deployment/<name> -n cerebro-prod
   kubectl rollout undo deployment/<name> -n cerebro-prod
   ```

3. **Pin crashing pod to 0 replicas** as last resort (drops that service):
   ```bash
   kubectl scale deployment <name> --replicas=0 -n cerebro-prod
   # Restore when root cause is fixed:
   kubectl scale deployment <name> --replicas=3 -n cerebro-prod
   ```

---

## Resolution checklist

- [ ] All pods `Running` and `1/1 Ready`
- [ ] Restart count stable (no new restarts for 10 min)
- [ ] Root cause identified and fixed (or ticket filed)
- [ ] Memory limits updated if OOMKilled
- [ ] Missing secrets/config documented and corrected
- [ ] `#sre-incidents` updated with RCA summary
