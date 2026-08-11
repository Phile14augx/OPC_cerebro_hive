#!/usr/bin/env bash
# register-evidence.sh — Record control execution into the evidence chain
#
# Called by every CI workflow that exercises an assurance control.
# Updates the live evidence index (evidence-index.json) and appends
# to the control register.
#
# v2: Adds integrity provenance to every evidence record:
#   - artifact_sha256      SHA-256 of the artifact file (if local path)
#   - descriptor_hash      SHA-256 of the evidence payload itself
#   - runner_version       register-evidence.sh version
#   - runner_sha           git SHA of this script
#   - workflow_run_url     direct link to the CI run
#   - environment_fingerprint  SHA-256 of {sha+env+control+timestamp}
#
# Signed evidence (P16): if COSIGN_EXPERIMENTAL=1 and cosign is available,
# the evidence entry file is signed with cosign keyless before being stored.
#
# Usage:
#   ./infra/assurance/register-evidence.sh \
#     --control G1 \
#     --status PASS \
#     --artifact /path/to/local-artifact.json \
#     --details "10/10 escape techniques blocked and detected"
#
# Environment variables (set by GitHub Actions automatically):
#   GITHUB_SHA, GITHUB_RUN_ID, GITHUB_RUN_NUMBER, GITHUB_WORKFLOW,
#   GITHUB_REPOSITORY, GITHUB_REF_NAME, GITHUB_ACTOR

set -euo pipefail

SCRIPT_VERSION="2.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# ── Argument parsing ──────────────────────────────────────────────────────────

CONTROL_ID=""
STATUS=""
ARTIFACT_PATH=""   # now accepts local path OR URL
DETAILS=""
ENVIRONMENT="${ASSURANCE_ENV:-${EVIDENCE_ENV:-staging}}"
DURATION_SECONDS=""
SIGN_EVIDENCE="${SIGN_EVIDENCE:-false}"  # set true to enable cosign signing

while [[ $# -gt 0 ]]; do
  case "$1" in
    --control)     CONTROL_ID="$2";       shift 2 ;;
    --status)      STATUS="$2";           shift 2 ;;
    --artifact)    ARTIFACT_PATH="$2";    shift 2 ;;
    --details)     DETAILS="$2";          shift 2 ;;
    --environment) ENVIRONMENT="$2";      shift 2 ;;
    --duration)    DURATION_SECONDS="$2"; shift 2 ;;
    --sign)        SIGN_EVIDENCE="true";  shift ;;
    *) echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

# ── Validation ────────────────────────────────────────────────────────────────

[ -z "${CONTROL_ID}" ] && { echo "ERROR: --control is required" >&2; exit 1; }
[ -z "${STATUS}" ]     && { echo "ERROR: --status is required (PASS|FAIL|SKIP|WARN)" >&2; exit 1; }

case "${STATUS}" in
  PASS|FAIL|SKIP|WARN) ;;
  *) echo "ERROR: --status must be PASS, FAIL, SKIP, or WARN (got: ${STATUS})" >&2; exit 1 ;;
esac

# ── Collect metadata ──────────────────────────────────────────────────────────

TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
GIT_SHA="${GITHUB_SHA:-$(git -C "$REPO_ROOT" rev-parse HEAD 2>/dev/null || echo unknown)}"
GIT_SHA_SHORT="${GIT_SHA:0:7}"
RUN_ID="${GITHUB_RUN_ID:-local}"
RUN_NUMBER="${GITHUB_RUN_NUMBER:-0}"
WORKFLOW="${GITHUB_WORKFLOW:-manual}"
REPOSITORY="${GITHUB_REPOSITORY:-cerebro-hive/cerebro-hive}"
BRANCH="${GITHUB_REF_NAME:-$(git -C "$REPO_ROOT" branch --show-current 2>/dev/null || echo unknown)}"
ACTOR="${GITHUB_ACTOR:-$(git -C "$REPO_ROOT" config user.name 2>/dev/null || echo unknown)}"

# Build run URL
if [ -n "${GITHUB_RUN_ID:-}" ] && [ -n "${GITHUB_REPOSITORY:-}" ]; then
  RUN_URL="https://github.com/${REPOSITORY}/actions/runs/${RUN_ID}"
else
  RUN_URL=""
fi

# ── Compute artifact SHA-256 ──────────────────────────────────────────────────

ARTIFACT_SHA256=""
ARTIFACT_URL=""

if [ -n "${ARTIFACT_PATH}" ]; then
  if [ -f "${ARTIFACT_PATH}" ]; then
    # Local file: compute SHA-256 of the artifact content
    if command -v sha256sum &>/dev/null; then
      ARTIFACT_SHA256=$(sha256sum "${ARTIFACT_PATH}" | awk '{print $1}')
    elif command -v shasum &>/dev/null; then
      ARTIFACT_SHA256=$(shasum -a 256 "${ARTIFACT_PATH}" | awk '{print $1}')
    else
      ARTIFACT_SHA256=$(python3 -c "
import hashlib, sys
with open('${ARTIFACT_PATH}','rb') as f:
    print(hashlib.sha256(f.read()).hexdigest())")
    fi
    ARTIFACT_URL="${ARTIFACT_PATH}"
  else
    # URL or non-existent path — store as-is
    ARTIFACT_URL="${ARTIFACT_PATH}"
  fi
fi

# ── Compute runner SHA (this script's own hash) ───────────────────────────────

RUNNER_SHA=""
if [ -f "${SCRIPT_DIR}/register-evidence.sh" ]; then
  if command -v sha256sum &>/dev/null; then
    RUNNER_SHA=$(sha256sum "${SCRIPT_DIR}/register-evidence.sh" | awk '{print $1}')
  elif command -v shasum &>/dev/null; then
    RUNNER_SHA=$(shasum -a 256 "${SCRIPT_DIR}/register-evidence.sh" | awk '{print $1}')
  else
    RUNNER_SHA=$(python3 -c "
import hashlib
with open('${SCRIPT_DIR}/register-evidence.sh','rb') as f:
    print(hashlib.sha256(f.read()).hexdigest())")
  fi
fi

# ── Write evidence entry (without descriptor_hash first) ─────────────────────

ENTRY_FILE="evidence-entry-${CONTROL_ID}-${RUN_NUMBER}.json"

python3 - <<PYEOF
import json, hashlib

entry = {
    "control_id":   "${CONTROL_ID}",
    "status":       "${STATUS}",
    "timestamp":    "${TIMESTAMP}",
    "git_sha":      "${GIT_SHA}",
    "git_sha_short":"${GIT_SHA_SHORT}",
    "branch":       "${BRANCH}",
    "environment":  "${ENVIRONMENT}",
    "run_id":       "${RUN_ID}",
    "run_number":   "${RUN_NUMBER}",
    "workflow":     "${WORKFLOW}",
    "actor":        "${ACTOR}",
    "artifact":     "${ARTIFACT_URL}",
    "artifact_sha256": "${ARTIFACT_SHA256}",
    "details":      """${DETAILS}""",
    "duration_seconds": ${DURATION_SECONDS:-null},
    "run_url":      "${RUN_URL}",
    "provenance": {
        "runner_version": "${SCRIPT_VERSION}",
        "runner_sha":     "${RUNNER_SHA}",
        "schema_version": "2.0",
    },
}

# Descriptor hash: SHA-256 of the stable portion of the record
# (excludes descriptor_hash itself — includes everything else)
descriptor_payload = json.dumps({
    k: v for k, v in entry.items()
    if k not in ("provenance",)
}, sort_keys=True)
descriptor_hash = hashlib.sha256(descriptor_payload.encode()).hexdigest()
entry["provenance"]["descriptor_hash"] = descriptor_hash

# Environment fingerprint: SHA-256 of {sha|env|control|timestamp}
env_fp_src = f"${GIT_SHA}|${ENVIRONMENT}|${CONTROL_ID}|${TIMESTAMP}"
env_fingerprint = hashlib.sha256(env_fp_src.encode()).hexdigest()
entry["provenance"]["environment_fingerprint"] = env_fingerprint

with open("${ENTRY_FILE}", "w") as f:
    json.dump(entry, f, indent=2)

print(f"✅ Evidence entry written: ${ENTRY_FILE}")
print(f"   Control:    {entry['control_id']}")
print(f"   Status:     {entry['status']}")
print(f"   SHA:        {entry['git_sha_short']}")
print(f"   Descriptor: {descriptor_hash[:16]}...")
if "${ARTIFACT_SHA256}":
    print(f"   Artifact:   ${ARTIFACT_SHA256[:16]}...")
PYEOF

# ── Cosign signing (P16) ──────────────────────────────────────────────────────

COSIGN_SIG_REF=""
if [[ "${SIGN_EVIDENCE}" == "true" ]] && command -v cosign &>/dev/null; then
  SIG_FILE="${ENTRY_FILE}.sig"

  if [[ -n "${COSIGN_EXPERIMENTAL:-}" ]]; then
    # Keyless OIDC-based signing (CI environment)
    cosign sign-blob \
      --yes \
      --output-signature "${SIG_FILE}" \
      "${ENTRY_FILE}" 2>/dev/null && {
      COSIGN_SIG_REF="${SIG_FILE}"
      echo "  🔏 Signed with cosign keyless: ${SIG_FILE}"
    } || echo "  ⚠️  cosign signing failed (non-fatal)"
  fi
fi

# ── Append to evidence index ──────────────────────────────────────────────────

INDEX_FILE="evidence-index.json"

python3 - <<PYEOF
import json, os, hashlib
from datetime import datetime, timezone

entry_file = "${ENTRY_FILE}"
index_file = "${INDEX_FILE}"

with open(entry_file) as f:
    entry = json.load(f)

# Load or create the index
if os.path.exists(index_file):
    with open(index_file) as f:
        index = json.load(f)
else:
    index = {
        "schema_version": "2.0",
        "generated_at":   "${TIMESTAMP}",
        "repository":     "${REPOSITORY}",
        "entries": [],
    }

# Remove stale entry for this control+environment (keep only latest)
index["entries"] = [
    e for e in index["entries"]
    if not (e["control_id"] == entry["control_id"] and e["environment"] == entry["environment"])
]

index["entries"].append(entry)
index["generated_at"]   = "${TIMESTAMP}"
index["schema_version"] = "2.0"
index["total_controls"] = len(set(e["control_id"] for e in index["entries"]))
index["passing"]        = sum(1 for e in index["entries"] if e["status"] == "PASS")
index["failing"]        = sum(1 for e in index["entries"] if e["status"] == "FAIL")

# Index-level integrity hash: SHA-256 over all descriptor_hashes
descriptor_hashes = sorted(
    e.get("provenance", {}).get("descriptor_hash", "") for e in index["entries"]
)
index["index_integrity_hash"] = hashlib.sha256(
    json.dumps(descriptor_hashes, sort_keys=True).encode()
).hexdigest()

with open(index_file, "w") as f:
    json.dump(index, f, indent=2)

print(f"✅ Evidence index updated: {index_file}")
print(f"   Total controls: {index['total_controls']}")
print(f"   Passing: {index['passing']}  Failing: {index['failing']}")
print(f"   Index integrity: {index['index_integrity_hash'][:16]}...")
PYEOF

# ── Output for GitHub Actions ─────────────────────────────────────────────────

if [ -n "${GITHUB_OUTPUT:-}" ]; then
  echo "entry_file=${ENTRY_FILE}"     >> "${GITHUB_OUTPUT}"
  echo "control_status=${STATUS}"     >> "${GITHUB_OUTPUT}"
  echo "artifact_sha=${ARTIFACT_SHA256:-}" >> "${GITHUB_OUTPUT}"
fi

# ── Write to step summary ─────────────────────────────────────────────────────

if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  case "${STATUS}" in
    PASS) ICON="✅" ;; FAIL) ICON="❌" ;; WARN) ICON="⚠️" ;; SKIP) ICON="⏭️" ;;
  esac

  DESCRIPTOR_HASH=$(python3 -c "
import json
with open('${ENTRY_FILE}') as f:
    e = json.load(f)
print(e.get('provenance',{}).get('descriptor_hash','?')[:16] + '...')
" 2>/dev/null || echo "?")

  cat >> "${GITHUB_STEP_SUMMARY}" <<MD

### ${ICON} Evidence Recorded — ${CONTROL_ID}

| Field | Value |
|-------|-------|
| Control | \`${CONTROL_ID}\` |
| Status | **${STATUS}** |
| Timestamp | \`${TIMESTAMP}\` |
| Git SHA | \`${GIT_SHA_SHORT}\` |
| Branch | \`${BRANCH}\` |
| Environment | \`${ENVIRONMENT}\` |
| Workflow | ${WORKFLOW} |
| Run | ${RUN_URL:-local} |
| Artifact | ${ARTIFACT_URL:-none} |
| Artifact SHA-256 | \`${ARTIFACT_SHA256:-—}\` |
| Descriptor hash | \`${DESCRIPTOR_HASH}\` |
| Runner version | v${SCRIPT_VERSION} |
| Details | ${DETAILS:-—} |
MD
fi

echo ""
echo "Evidence registration complete: ${CONTROL_ID} → ${STATUS}"
