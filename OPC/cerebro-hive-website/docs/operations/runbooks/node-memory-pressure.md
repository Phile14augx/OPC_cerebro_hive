# Runbook: Node Memory Pressure

**Alert:** `CerebroNodeMemoryPressure`  
**Severity:** Warning (> 85% used) → Critical (> 95% used)  
**Oncall team:** Platform SRE  
**Escalation:** `#sre-incidents` → PagerDuty P1 (node at risk of OOM eviction)

---

## What is happening

A Kubernetes node's memory utilization has exceeded safe operating levels. At 95%+, the Linux kernel's OOM killer may start terminating processes, including kubelet or container runtimes, causing uncontrolled pod evictions and node instability.

---

## Immediate response (< 5 min)

1. **Identify the pressured node.**
   ```bash
   kubectl top nodes | sort -k5 -rn
   kubectl describe node <node-name> | grep -A10 "Conditions:"
   # Look for: MemoryPressure=True
   ```

2. **See which pods are using the most memory on the node.**
   ```bash
   kubectl top pods -A --sort-by=memory \
     | awk '$8 > 500' | head -20
   # Filter by node:
   kubectl get pods -A -o wide | grep <node-name> \
     | awk '{print $1, $2}' | while read ns pod; do
       kubectl top pod $pod -n $ns 2>/dev/null
     done
   ```

3. **Check if OOM events have already occurred.**
   ```bash
   kubectl get events -A | grep -i oom | sort -k1 | tail -20
   dmesg | grep -i "oom\|killed process" 2>/dev/null || \
     kubectl debug node/<node-name> -it --image=ubuntu -- dmesg | grep -i oom
   ```

---

## Diagnosis

### Is this a single pod memory leak?

Identify the pod growing over time:
```promql
topk(5,
  sum by (pod, namespace) (
    container_memory_working_set_bytes{node="<node-name>", container!=""}
  )
)
```

If one pod is orders of magnitude larger than peers → likely leak:
```bash
# Heap snapshot for Node.js (if process supports it)
kubectl exec <pod> -n <namespace> -- kill -USR2 1
kubectl cp <pod>:/tmp/heapdump-*.json ./heapdump.json -n <namespace>
```

Temporary fix: delete the pod (it restarts with fresh memory):
```bash
kubectl delete pod <pod> -n <namespace>
```

Permanent fix: set a proper memory limit and fix the leak.

### Is node memory genuinely undersized for the workload?

```bash
# Check allocatable vs. requested across all pods on the node
kubectl describe node <node-name> \
  | grep -A40 "Allocated resources:"
```

If `Requests` are within limits but actual usage exceeds them, pods are using more than requested (memory requests are not enforced by the scheduler). Set tighter limits or increase node pool size.

### Cache pressure (not a leak — OS page cache)

Linux uses free memory for page cache. `free -h` showing low "available" (not "free") is usually harmless. However, when applications start hitting `MemoryPressure`:

```bash
# Force cache drop on the node (last resort — brief performance impact)
kubectl debug node/<node-name> -it --image=ubuntu -- \
  bash -c "sync; echo 3 > /proc/sys/vm/drop_caches"
```

---

## Mitigation

| Situation | Action |
|-----------|--------|
| Single leaky pod | Delete pod; fix memory limit; file bug |
| Node genuinely too small | Drain + cordon node, provision larger instance |
| Too many pods scheduled | Taint node `NoSchedule`, let scheduler redistribute |
| Waiting for cluster autoscaler | Manually add a node if CA is too slow |

### Drain and cordon the node (safe pod migration)

```bash
# Cordon (stop new scheduling)
kubectl cordon <node-name>

# Drain (evict existing pods gracefully)
kubectl drain <node-name> \
  --ignore-daemonsets \
  --delete-emptydir-data \
  --grace-period=60

# Terminate the node (via AWS/GCP console or CLI)
# The cluster autoscaler will provision a replacement.
```

---

## Resolution checklist

- [ ] Node memory below 80% for 10 minutes
- [ ] No `MemoryPressure=True` condition on any node
- [ ] No OOM events in the last 30 minutes
- [ ] Leaking pod fixed (limit added / memory bug filed)
- [ ] Node pool autoscaling verified working
- [ ] PodDisruptionBudgets confirmed — drain didn't violate PDBs
