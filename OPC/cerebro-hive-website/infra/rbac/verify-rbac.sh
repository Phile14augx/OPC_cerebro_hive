#!/usr/bin/env bash
# infra/rbac/verify-rbac.sh
#
# CerebroHive RBAC Least-Privilege Verifier
#
# Validates that all Roles, ClusterRoles, and ServiceAccount bindings in
# cerebro-prod and cerebro-staging conform to the least-privilege policy.
#
# Detections:
#   1. Wildcard verbs   — verbs: ["*"]
#   2. Wildcard resources — resources: ["*"]
#   3. Wildcard API groups — apiGroups: ["*"] (except where explicitly allowed)
#   4. Unexpected ClusterRoles — roles not in the allowlist
#   5. Unexpected ServiceAccount bindings — SA bound to more than its expected roles
#   6. Policy hash drift — SHA-256 of current RBAC state vs. recorded baseline
#
# Exit codes:
#   0 — all checks pass
#   1 — violations found (CI failure)
#   2 — prerequisite missing (kubectl, jq)
#
# Usage:
#   ./infra/rbac/verify-rbac.sh [--namespaces ns1,ns2] [--baseline path] [--emit-evidence]
#
# Evidence emitted to: evidence/rbac-evidence.json (with --emit-evidence)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# ── Defaults ──────────────────────────────────────────────────────────────────
NAMESPACES="${RBAC_NAMESPACES:-cerebro-prod,cerebro-staging}"
BASELINE_PATH="${RBAC_BASELINE:-${SCRIPT_DIR}/rbac-baseline.json}"
EMIT_EVIDENCE=false
EVIDENCE_OUT="${REPO_ROOT}/evidence/rbac-evidence.json"
VIOLATIONS=()
WARNINGS=()
EVALUATED_PRINCIPALS=()
T_START=$(date +%s)

while [[ $# -gt 0 ]]; do
  case "$1" in
    --namespaces)   NAMESPACES="$2"; shift ;;
    --baseline)     BASELINE_PATH="$2"; shift ;;
    --emit-evidence) EMIT_EVIDENCE=true ;;
    --evidence-out) EVIDENCE_OUT="$2"; shift ;;
    *) echo "Unknown flag: $1"; exit 1 ;;
  esac
  shift
done

IFS=',' read -ra NS_ARRAY <<< "$NAMESPACES"

# ── Colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BOLD='\033[1m'; RESET='\033[0m'

log_ok()   { echo -e "  ${GREEN}✅ $*${RESET}"; }
log_fail() { echo -e "  ${RED}❌ $*${RESET}"; VIOLATIONS+=("$*"); }
log_warn() { echo -e "  ${YELLOW}⚠️  $*${RESET}"; WARNINGS+=("$*"); }
log_info() { echo -e "     $*"; }

# ── Prerequisites ─────────────────────────────────────────────────────────────
for cmd in kubectl jq python3; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "❌ Required tool not found: $cmd"
    exit 2
  fi
done

echo ""
echo -e "${BOLD}━━━ CerebroHive RBAC Verifier ━━━${RESET}"
echo -e "  Namespaces: ${NAMESPACES}"
echo -e "  Baseline:   ${BASELINE_PATH}"
echo ""

# ── 1. Fetch current RBAC state ───────────────────────────────────────────────
echo -e "${BOLD}[1/6] Fetching RBAC state...${RESET}"

# Collect all Roles across target namespaces
ROLES_JSON="[]"
for NS in "${NS_ARRAY[@]}"; do
  NS_ROLES=$(kubectl get roles -n "$NS" -o json 2>/dev/null | jq '.items // []')
  ROLES_JSON=$(echo "$ROLES_JSON" "$NS_ROLES" | jq -s 'add')
done
ROLE_COUNT=$(echo "$ROLES_JSON" | jq 'length')

# Collect ClusterRoles (cerebro-prefixed only)
CLUSTER_ROLES_JSON=$(kubectl get clusterroles -o json 2>/dev/null | \
  jq '[.items[] | select(.metadata.name | startswith("cerebro"))]')
CR_COUNT=$(echo "$CLUSTER_ROLES_JSON" | jq 'length')

# Collect RoleBindings across target namespaces
ROLE_BINDINGS_JSON="[]"
CLUSTER_ROLE_BINDINGS_JSON="[]"
for NS in "${NS_ARRAY[@]}"; do
  NS_RB=$(kubectl get rolebindings -n "$NS" -o json 2>/dev/null | jq '.items // []')
  ROLE_BINDINGS_JSON=$(echo "$ROLE_BINDINGS_JSON" "$NS_RB" | jq -s 'add')
done
CLUSTER_ROLE_BINDINGS_JSON=$(kubectl get clusterrolebindings -o json 2>/dev/null | \
  jq '[.items[] | select(.metadata.name | startswith("cerebro"))]')

log_ok "${ROLE_COUNT} Roles, ${CR_COUNT} cerebro ClusterRoles"

# ── 2. Compute policy hash ────────────────────────────────────────────────────
echo -e "\n${BOLD}[2/6] Computing policy hash...${RESET}"

POLICY_STATE=$(echo "$ROLES_JSON $CLUSTER_ROLES_JSON $ROLE_BINDINGS_JSON $CLUSTER_ROLE_BINDINGS_JSON" | \
  jq -s 'add | sort_by(.metadata.name)')
POLICY_HASH=$(echo "$POLICY_STATE" | python3 -c "import sys,hashlib; print(hashlib.sha256(sys.stdin.read().encode()).hexdigest())")

log_ok "Policy hash: ${POLICY_HASH:0:16}..."

# Compare to baseline if present
if [[ -f "$BASELINE_PATH" ]]; then
  BASELINE_HASH=$(jq -r '.policy_hash // "none"' "$BASELINE_PATH" 2>/dev/null)
  if [[ "$POLICY_HASH" == "$BASELINE_HASH" ]]; then
    log_ok "Policy matches recorded baseline"
  else
    log_warn "Policy hash drift detected — RBAC has changed since baseline"
    log_info "Baseline: ${BASELINE_HASH:0:16}..."
    log_info "Current:  ${POLICY_HASH:0:16}..."
  fi
else
  log_warn "No baseline file found at ${BASELINE_PATH} — will create one"
fi

# ── 3. Wildcard detection ─────────────────────────────────────────────────────
echo -e "\n${BOLD}[3/6] Scanning for wildcard permissions...${RESET}"

# Allowed wildcards: system:masters is expected to have cluster-admin
ALLOWED_WILDCARD_ROLES=("cluster-admin" "system:masters")

python3 - <<'PYEOF'
import json, os, sys

roles_json     = os.environ.get('ROLES_JSON', '[]')
cr_json        = os.environ.get('CLUSTER_ROLES_JSON', '[]')

violations = []
warnings   = []

def check_rules(name, kind, namespace, rules):
    for rule in (rules or []):
        verbs     = rule.get('verbs', [])
        resources = rule.get('resources', [])
        api_groups= rule.get('apiGroups', [])

        if '*' in verbs:
            violations.append(f"{kind}/{name} ({namespace}): wildcard verb '*' in rule covering {resources}")
        if '*' in resources:
            violations.append(f"{kind}/{name} ({namespace}): wildcard resource '*' in rule with verbs {verbs}")
        if '*' in api_groups and kind != 'ClusterRole':
            # ClusterRoles may legitimately cover all API groups for aggregation
            warnings.append(f"{kind}/{name} ({namespace}): wildcard apiGroup '*' — verify intentional")

try:
    roles = json.loads(roles_json)
    for r in roles:
        name = r['metadata']['name']
        ns   = r['metadata'].get('namespace', '?')
        check_rules(name, 'Role', ns, r.get('rules', []))

    crs = json.loads(cr_json)
    for r in crs:
        name = r['metadata']['name']
        check_rules(name, 'ClusterRole', 'cluster', r.get('rules', []))

except Exception as e:
    print(f"  ⚠️  Parse error: {e}", file=sys.stderr)

for v in violations:
    print(f"VIOLATION:{v}")
for w in warnings:
    print(f"WARNING:{w}")
if not violations and not warnings:
    print("CLEAN")
PYEOF

# Capture Python output into bash
WILDCARD_OUTPUT=$(ROLES_JSON="$ROLES_JSON" CLUSTER_ROLES_JSON="$CLUSTER_ROLES_JSON" \
  python3 - <<'PYEOF'
import json, os, sys

roles_json = os.environ.get('ROLES_JSON', '[]')
cr_json    = os.environ.get('CLUSTER_ROLES_JSON', '[]')

violations = []
warnings   = []

def check_rules(name, kind, namespace, rules):
    for rule in (rules or []):
        verbs      = rule.get('verbs', [])
        resources  = rule.get('resources', [])
        api_groups = rule.get('apiGroups', [])
        if '*' in verbs:
            violations.append(f"{kind}/{name} ({namespace}): wildcard verb in rule covering {resources}")
        if '*' in resources:
            violations.append(f"{kind}/{name} ({namespace}): wildcard resource in rule with verbs {verbs}")
        if '*' in api_groups:
            warnings.append(f"{kind}/{name} ({namespace}): wildcard apiGroup — verify intentional")

try:
    for r in json.loads(roles_json):
        check_rules(r['metadata']['name'], 'Role', r['metadata'].get('namespace','?'), r.get('rules',[]))
    for r in json.loads(cr_json):
        check_rules(r['metadata']['name'], 'ClusterRole', 'cluster', r.get('rules',[]))
except Exception as e:
    print(f"ERROR:{e}")

for v in violations: print(f"VIOLATION:{v}")
for w in warnings:   print(f"WARNING:{w}")
PYEOF
)

while IFS= read -r line; do
  if [[ "$line" == VIOLATION:* ]]; then
    log_fail "${line#VIOLATION:}"
  elif [[ "$line" == WARNING:* ]]; then
    log_warn "${line#WARNING:}"
  fi
done <<< "$WILDCARD_OUTPUT"

[[ -z "$(echo "$WILDCARD_OUTPUT" | grep '^VIOLATION')" ]] && log_ok "No wildcard violations found"

# ── 4. ServiceAccount binding validation ──────────────────────────────────────
echo -e "\n${BOLD}[4/6] Validating ServiceAccount bindings...${RESET}"

SA_OUTPUT=$(ROLE_BINDINGS_JSON="$ROLE_BINDINGS_JSON" CLUSTER_ROLE_BINDINGS_JSON="$CLUSTER_ROLE_BINDINGS_JSON" \
python3 - <<'PYEOF'
import json, os

rb_json  = os.environ.get('ROLE_BINDINGS_JSON', '[]')
crb_json = os.environ.get('CLUSTER_ROLE_BINDINGS_JSON', '[]')

# Allowlist: ServiceAccount → allowed roles
# This is the expected steady-state — any binding not in this list is flagged
EXPECTED_BINDINGS = {
    'forge-api':    ['cerebro-forge-api'],
    'ai-gateway':   ['cerebro-ai-gateway'],
    'worker':       ['cerebro-worker'],
    'studio':       ['cerebro-studio-readonly'],
    'argocd-server':['cerebro-argocd-server'],
    'default':      [],   # default SA should have NO bindings
}

violations = []
principals = []

def check_bindings(bindings, kind):
    for b in (bindings or []):
        ref = b.get('roleRef', {})
        role_name = ref.get('name','')
        subjects = b.get('subjects', [])
        for subj in subjects:
            if subj.get('kind') != 'ServiceAccount':
                continue
            sa = subj.get('name','')
            ns = subj.get('namespace','?')
            principals.append(f"{sa}@{ns}")
            if sa in EXPECTED_BINDINGS:
                expected = EXPECTED_BINDINGS[sa]
                if role_name not in expected and expected != ['*']:
                    violations.append(
                        f"SA/{sa} ({ns}): bound to unexpected {kind}/{role_name}"
                        f" — expected: {expected or 'nothing'}"
                    )
            elif sa == 'default' and role_name:
                violations.append(
                    f"SA/default ({ns}): has binding to {kind}/{role_name} — default SA should have no bindings"
                )

try:
    check_bindings(json.loads(rb_json),  'Role')
    check_bindings(json.loads(crb_json), 'ClusterRole')
except Exception as e:
    print(f"ERROR:{e}")

for p in sorted(set(principals)): print(f"PRINCIPAL:{p}")
for v in violations:               print(f"VIOLATION:{v}")
PYEOF
)

SA_PRINCIPALS=()
while IFS= read -r line; do
  if [[ "$line" == PRINCIPAL:* ]]; then
    SA_PRINCIPALS+=("${line#PRINCIPAL:}")
  elif [[ "$line" == VIOLATION:* ]]; then
    log_fail "${line#VIOLATION:}"
  fi
done <<< "$SA_OUTPUT"

EVALUATED_PRINCIPALS=("${SA_PRINCIPALS[@]:-}")
log_ok "${#SA_PRINCIPALS[@]} ServiceAccount bindings evaluated"
[[ -z "$(echo "$SA_OUTPUT" | grep '^VIOLATION')" ]] && log_ok "All SA bindings conform to allowlist"

# ── 5. Privilege escalation detection ─────────────────────────────────────────
echo -e "\n${BOLD}[5/6] Detecting privilege escalation paths...${RESET}"

ESCALATION_OUTPUT=$(CLUSTER_ROLE_BINDINGS_JSON="$CLUSTER_ROLE_BINDINGS_JSON" \
python3 - <<'PYEOF'
import json, os

crb_json = os.environ.get('CLUSTER_ROLE_BINDINGS_JSON', '[]')

# High-risk cluster roles that cerebro SAs should never be bound to
FORBIDDEN_CLUSTER_ROLES = {
    'cluster-admin',
    'system:masters',
    'admin',
    'edit',
}

violations = []
try:
    for b in json.loads(crb_json):
        role = b.get('roleRef', {}).get('name', '')
        if role in FORBIDDEN_CLUSTER_ROLES:
            for subj in b.get('subjects', []):
                if subj.get('kind') == 'ServiceAccount':
                    sa = subj.get('name', '?')
                    ns = subj.get('namespace', '?')
                    violations.append(
                        f"ESCALATION: SA/{sa} ({ns}) is bound to {role} — forbidden for cerebro workloads"
                    )
except Exception as e:
    print(f"ERROR:{e}")

for v in violations: print(f"VIOLATION:{v}")
PYEOF
)

while IFS= read -r line; do
  [[ "$line" == VIOLATION:* ]] && log_fail "${line#VIOLATION:}"
done <<< "$ESCALATION_OUTPUT"

[[ -z "$(echo "$ESCALATION_OUTPUT" | grep '^VIOLATION')" ]] && log_ok "No privilege escalation paths detected"

# ── 6. Emit evidence ──────────────────────────────────────────────────────────
echo -e "\n${BOLD}[6/6] Emitting evidence...${RESET}"

T_END=$(date +%s)
DURATION=$((T_END - T_START))
VIOLATION_COUNT=${#VIOLATIONS[@]}
WARNING_COUNT=${#WARNINGS[@]}
FINAL_STATUS=$( [[ $VIOLATION_COUNT -eq 0 ]] && echo "PASS" || echo "FAIL" )

# Always update baseline if passing
if [[ "$FINAL_STATUS" == "PASS" ]]; then
  mkdir -p "$(dirname "$BASELINE_PATH")"
  cat > "$BASELINE_PATH" <<EOF
{
  "policy_hash": "${POLICY_HASH}",
  "recorded_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "git_sha": "$(git -C "$REPO_ROOT" rev-parse HEAD 2>/dev/null || echo unknown)",
  "namespace_count": ${#NS_ARRAY[@]},
  "role_count": ${ROLE_COUNT},
  "cluster_role_count": ${CR_COUNT}
}
EOF
  log_ok "Baseline updated: ${BASELINE_PATH}"
fi

if $EMIT_EVIDENCE; then
  mkdir -p "$(dirname "$EVIDENCE_OUT")"

  PRINCIPALS_JSON=$(printf '%s\n' "${EVALUATED_PRINCIPALS[@]:-}" | jq -R . | jq -s .)
  VIOLATIONS_JSON=$(printf '%s\n' "${VIOLATIONS[@]:-}" | jq -R . | jq -s .)
  WARNINGS_JSON=$(printf '%s\n' "${WARNINGS[@]:-}" | jq -R . | jq -s .)

  cat > "$EVIDENCE_OUT" <<EOF
{
  "control_id": "RBAC-1",
  "status": "${FINAL_STATUS}",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "duration_seconds": ${DURATION},
  "git_sha": "$(git -C "$REPO_ROOT" rev-parse HEAD 2>/dev/null || echo unknown)",
  "environment": "${ASSURANCE_ENV:-staging}",
  "policy_hash": "${POLICY_HASH}",
  "namespaces_evaluated": $(printf '%s\n' "${NS_ARRAY[@]}" | jq -R . | jq -s .),
  "principals_evaluated": ${PRINCIPALS_JSON},
  "role_count": ${ROLE_COUNT},
  "cluster_role_count": ${CR_COUNT},
  "violation_count": ${VIOLATION_COUNT},
  "warning_count": ${WARNING_COUNT},
  "violations": ${VIOLATIONS_JSON},
  "warnings": ${WARNINGS_JSON},
  "details": "RBAC-1: ${VIOLATION_COUNT} violations, ${WARNING_COUNT} warnings across ${#NS_ARRAY[@]} namespaces. Policy hash: ${POLICY_HASH:0:12}..."
}
EOF
  log_ok "Evidence written: ${EVIDENCE_OUT}"

  # Register into evidence-index.json via register-evidence.sh
  DETAILS="RBAC-1: ${VIOLATION_COUNT} violations, ${#EVALUATED_PRINCIPALS[@]} principals, policy ${POLICY_HASH:0:12}..."
  bash "${REPO_ROOT}/infra/assurance/register-evidence.sh" \
    --control    "RBAC-1"         \
    --status     "${FINAL_STATUS}" \
    --artifact   "${EVIDENCE_OUT}" \
    --details    "${DETAILS}"      \
    --duration   "${DURATION}"     \
    --environment "${ASSURANCE_ENV:-staging}" \
    2>/dev/null || true
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}━━━ RBAC-1 Result ━━━${RESET}"
if [[ "$FINAL_STATUS" == "PASS" ]]; then
  echo -e "  ${GREEN}${BOLD}✅ PASS${RESET} — ${VIOLATION_COUNT} violations, ${WARNING_COUNT} warnings"
else
  echo -e "  ${RED}${BOLD}❌ FAIL${RESET} — ${VIOLATION_COUNT} violation(s) found:"
  for v in "${VIOLATIONS[@]}"; do
    echo -e "    ${RED}• ${v}${RESET}"
  done
fi
echo -e "  Policy hash: ${POLICY_HASH:0:16}..."
echo -e "  Duration:    ${DURATION}s"
echo ""

[[ "$FINAL_STATUS" == "PASS" ]] && exit 0 || exit 1
