#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Runbook: AI Gateway High Error Rate
# Trigger: AIGatewayErrorRateHigh alert (error rate > 5% for 5m)
# SLO:     ai-gateway-availability
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

NAMESPACE="${NAMESPACE:-cerebro-hive}"
THRESHOLD="${ERROR_THRESHOLD:-0.05}"
DRY_RUN="${DRY_RUN:-false}"

log() { echo "[$(date -u +%H:%M:%S)] $*"; }

# ── Step 1: Identify failing provider ────────────────────────────────────────
log "STEP 1: Querying provider error rates..."
PROM_URL="${PROMETHEUS_URL:-http://localhost:9090}"

ANTHROPIC_ERR=$(curl -sf "${PROM_URL}/api/v1/query" \
  --data-urlencode 'query=rate(ai_errors_total{provider="anthropic"}[5m])' \
  | python3 -c "import json,sys; d=json.load(sys.stdin); v=d['data']['result']; print(v[0]['value'][1] if v else '0')" 2>/dev/null || echo "0")

OPENAI_ERR=$(curl -sf "${PROM_URL}/api/v1/query" \
  --data-urlencode 'query=rate(ai_errors_total{provider="openai"}[5m])' \
  | python3 -c "import json,sys; d=json.load(sys.stdin); v=d['data']['result']; print(v[0]['value'][1] if v else '0')" 2>/dev/null || echo "0")

log "Anthropic error rate: ${ANTHROPIC_ERR}"
log "OpenAI error rate:    ${OPENAI_ERR}"

# ── Step 2: Check circuit breaker status ────────────────────────────────────
log "STEP 2: Checking circuit breaker states..."
GATEWAY_POD=$(kubectl get pod -n "${NAMESPACE}" -l app.kubernetes.io/name=ai-gateway \
  -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [[ -n "$GATEWAY_POD" ]]; then
  CB_STATUS=$(kubectl exec -n "${NAMESPACE}" "${GATEWAY_POD}" -- \
    wget -qO- http://localhost:4010/health 2>/dev/null || echo '{"error":"unreachable"}')
  log "Circuit breaker status: ${CB_STATUS}"
else
  log "WARNING: No ai-gateway pod found"
fi

# ── Step 3: Check provider status pages ──────────────────────────────────────
log "STEP 3: Checking upstream provider status..."
ANTHROPIC_STATUS=$(curl -sf https://status.anthropic.com/api/v2/status.json \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['status']['indicator'])" 2>/dev/null || echo "unknown")
OPENAI_STATUS=$(curl -sf https://status.openai.com/api/v2/status.json \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['status']['indicator'])" 2>/dev/null || echo "unknown")

log "Anthropic status: ${ANTHROPIC_STATUS}"
log "OpenAI status:    ${OPENAI_STATUS}"

# ── Step 4: Auto-remediation ─────────────────────────────────────────────────
log "STEP 4: Evaluating auto-remediation options..."

if [[ "$ANTHROPIC_STATUS" != "none" && "$OPENAI_STATUS" == "none" ]]; then
  log "ACTION: Anthropic degraded, OpenAI healthy — routing all traffic to OpenAI"
  if [[ "$DRY_RUN" == "false" ]]; then
    kubectl set env deployment/ai-gateway -n "${NAMESPACE}" \
      ANTHROPIC_ENABLED=false \
      OPENAI_ENABLED=true
    log "Applied: ANTHROPIC_ENABLED=false, OPENAI_ENABLED=true"
  fi
elif [[ "$ANTHROPIC_STATUS" == "none" && "$OPENAI_STATUS" != "none" ]]; then
  log "ACTION: OpenAI degraded, Anthropic healthy — routing all traffic to Anthropic"
  if [[ "$DRY_RUN" == "false" ]]; then
    kubectl set env deployment/ai-gateway -n "${NAMESPACE}" \
      ANTHROPIC_ENABLED=true \
      OPENAI_ENABLED=false
    log "Applied: OPENAI_ENABLED=false"
  fi
else
  log "ACTION: Both providers degraded or status unknown — restarting gateway pods"
  if [[ "$DRY_RUN" == "false" ]]; then
    kubectl rollout restart deployment/ai-gateway -n "${NAMESPACE}"
    kubectl rollout status deployment/ai-gateway -n "${NAMESPACE}" --timeout=120s
  fi
fi

# ── Step 5: Verify recovery ───────────────────────────────────────────────────
log "STEP 5: Waiting 60s for recovery..."
sleep 60

POST_ERR=$(curl -sf "${PROM_URL}/api/v1/query" \
  --data-urlencode 'query=rate(ai_errors_total[1m])' \
  | python3 -c "import json,sys; d=json.load(sys.stdin); v=d['data']['result']; total=sum(float(r['value'][1]) for r in v); print(f'{total:.4f}')" 2>/dev/null || echo "unknown")

log "Post-remediation error rate: ${POST_ERR}"
log "Runbook complete. Check Grafana: https://grafana.cerebrohive.com/d/cerebro-ai-costs"
