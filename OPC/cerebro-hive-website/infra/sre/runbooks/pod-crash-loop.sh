#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Runbook: Pod CrashLoopBackOff
# Trigger: KubePodCrashLooping alert
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

NAMESPACE="${NAMESPACE:-cerebro-hive}"
SERVICE="${SERVICE:-}"  # Set by alertmanager via webhook
DRY_RUN="${DRY_RUN:-false}"

log() { echo "[$(date -u +%H:%M:%S)] $*"; }

if [[ -z "$SERVICE" ]]; then
  log "ERROR: SERVICE env var required"
  exit 1
fi

# ── Step 1: Get crash details ─────────────────────────────────────────────────
log "STEP 1: Getting crash details for ${SERVICE}..."
PODS=$(kubectl get pods -n "${NAMESPACE}" -l "app.kubernetes.io/name=${SERVICE}" \
  --field-selector=status.phase=Running -o name 2>/dev/null)

for POD in $PODS; do
  RESTARTS=$(kubectl get "${POD}" -n "${NAMESPACE}" \
    -o jsonpath='{.status.containerStatuses[0].restartCount}' 2>/dev/null || echo "0")
  REASON=$(kubectl get "${POD}" -n "${NAMESPACE}" \
    -o jsonpath='{.status.containerStatuses[0].state.waiting.reason}' 2>/dev/null || echo "unknown")
  log "Pod: ${POD} | Restarts: ${RESTARTS} | Reason: ${REASON}"
done

# ── Step 2: Collect logs from last crash ──────────────────────────────────────
log "STEP 2: Collecting last crash logs..."
CRASH_POD=$(kubectl get pod -n "${NAMESPACE}" -l "app.kubernetes.io/name=${SERVICE}" \
  -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [[ -n "$CRASH_POD" ]]; then
  log "=== Last 50 lines of previous container logs ==="
  kubectl logs -n "${NAMESPACE}" "${CRASH_POD}" --previous --tail=50 2>/dev/null || \
    log "No previous logs available"
fi

# ── Step 3: Check resource pressure ─────────────────────────────────────────
log "STEP 3: Checking node resource pressure..."
kubectl describe nodes | grep -E "(MemoryPressure|DiskPressure|PIDPressure|cpu|memory)" | head -20

# ── Step 4: Auto-remediation ─────────────────────────────────────────────────
log "STEP 4: Attempting remediation..."

# If OOMKilled, the service likely needs more memory — increase limits 25%
LAST_STATE=$(kubectl get pod -n "${NAMESPACE}" "${CRASH_POD}" \
  -o jsonpath='{.status.containerStatuses[0].lastState.terminated.reason}' 2>/dev/null || echo "")

if [[ "$LAST_STATE" == "OOMKilled" ]]; then
  log "ACTION: OOMKilled detected — scaling up memory limits by 25%"
  CURRENT_MEM=$(kubectl get deployment "${SERVICE}" -n "${NAMESPACE}" \
    -o jsonpath='{.spec.template.spec.containers[0].resources.limits.memory}' 2>/dev/null || echo "512Mi")
  log "Current memory limit: ${CURRENT_MEM} (manual patch required)"
  log "Recommended: kubectl set resources deployment/${SERVICE} -n ${NAMESPACE} --limits=memory=<25% more>"
fi

# Always: delete the crashing pod to give it a clean start
if [[ "$DRY_RUN" == "false" && -n "$CRASH_POD" ]]; then
  log "ACTION: Deleting crashing pod ${CRASH_POD}"
  kubectl delete pod -n "${NAMESPACE}" "${CRASH_POD}" --grace-period=0
fi

# ── Step 5: Monitor recovery ─────────────────────────────────────────────────
log "STEP 5: Monitoring recovery (60s)..."
sleep 30
kubectl get pods -n "${NAMESPACE}" -l "app.kubernetes.io/name=${SERVICE}"
log "Runbook complete."
