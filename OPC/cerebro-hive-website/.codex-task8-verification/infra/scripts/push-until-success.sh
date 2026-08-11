#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# push-until-success.sh — Git push retry loop with exponential backoff
#
# Keeps trying `git push` until it succeeds, then monitors CI until green.
# Gives up after MAX_PUSH_RETRIES failed pushes or MAX_CI_WAIT seconds.
#
# Usage:
#   ./infra/scripts/push-until-success.sh
#   ./infra/scripts/push-until-success.sh --branch main --remote origin
#   ./infra/scripts/push-until-success.sh --max-retries 10 --no-ci-wait
#
# Requirements: git, curl, gh (GitHub CLI — optional, for CI status polling)
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Config (override with flags) ──────────────────────────────────────────────
REMOTE="${REMOTE:-origin}"
BRANCH="${BRANCH:-$(git rev-parse --abbrev-ref HEAD)}"
MAX_PUSH_RETRIES="${MAX_PUSH_RETRIES:-10}"
MAX_CI_WAIT="${MAX_CI_WAIT:-600}"     # seconds to wait for CI to complete
WAIT_CI="${WAIT_CI:-true}"            # set to false to skip CI polling

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
RESET='\033[0m'

log()     { echo -e "${BLUE}[push-loop]${RESET} $*"; }
success() { echo -e "${GREEN}[push-loop] ✅ $*${RESET}"; }
warn()    { echo -e "${YELLOW}[push-loop] ⚠️  $*${RESET}"; }
error()   { echo -e "${RED}[push-loop] ❌ $*${RESET}"; }
header()  { echo -e "\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"; echo -e "${BOLD} $*${RESET}"; echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"; }

# ── Parse flags ───────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch)     BRANCH="$2";          shift 2 ;;
    --remote)     REMOTE="$2";          shift 2 ;;
    --max-retries) MAX_PUSH_RETRIES="$2"; shift 2 ;;
    --no-ci-wait) WAIT_CI="false";      shift 1 ;;
    --ci-timeout) MAX_CI_WAIT="$2";     shift 2 ;;
    -h|--help)
      echo "Usage: $0 [--branch BRANCH] [--remote REMOTE] [--max-retries N] [--no-ci-wait] [--ci-timeout SECONDS]"
      exit 0
      ;;
    *) error "Unknown flag: $1"; exit 1 ;;
  esac
done

# ── Pre-flight checks ─────────────────────────────────────────────────────────
header "CerebroHive — Push Until Success"
log "Remote:      ${REMOTE}"
log "Branch:      ${BRANCH}"
log "Max retries: ${MAX_PUSH_RETRIES}"
log "Wait for CI: ${WAIT_CI}"

if ! git rev-parse --is-inside-work-tree &>/dev/null; then
  error "Not inside a git repository."
  exit 1
fi

UNCOMMITTED=$(git status --porcelain)
if [[ -n "$UNCOMMITTED" ]]; then
  warn "You have uncommitted changes. Stash or commit them first."
  git status --short
  read -r -p "Continue anyway? [y/N] " reply
  [[ "$reply" =~ ^[Yy]$ ]] || exit 1
fi

# ── Push loop ─────────────────────────────────────────────────────────────────
header "Phase 1 — Git Push Loop"
attempt=1
push_succeeded=false

while [[ "$attempt" -le "$MAX_PUSH_RETRIES" ]]; do
  log "Push attempt ${attempt}/${MAX_PUSH_RETRIES}..."

  # Exponential backoff: 0s, 5s, 10s, 20s, 40s, 80s, ...
  if [[ "$attempt" -gt 1 ]]; then
    backoff=$(( 5 * (2 ** (attempt - 2)) ))
    # Cap backoff at 120s
    backoff=$(( backoff > 120 ? 120 : backoff ))
    log "Waiting ${backoff}s before retry (exponential backoff)..."
    sleep "$backoff"
  fi

  # Try to pull + rebase before pushing to resolve conflicts
  if [[ "$attempt" -gt 1 ]]; then
    log "Pulling latest from ${REMOTE}/${BRANCH} before retry..."
    git pull --rebase "${REMOTE}" "${BRANCH}" 2>&1 || {
      warn "Pull/rebase failed — you may need to resolve conflicts manually."
    }
  fi

  # Attempt push
  if git push "${REMOTE}" "${BRANCH}" 2>&1; then
    success "Push succeeded on attempt ${attempt}!"
    push_succeeded=true
    PUSHED_SHA=$(git rev-parse HEAD)
    break
  else
    PUSH_EXIT=$?
    error "Push failed (exit ${PUSH_EXIT}) on attempt ${attempt}/${MAX_PUSH_RETRIES}"

    if [[ "$attempt" -lt "$MAX_PUSH_RETRIES" ]]; then
      log "Will retry ($(( MAX_PUSH_RETRIES - attempt )) attempts remaining)..."
    fi
  fi

  attempt=$(( attempt + 1 ))
done

if [[ "$push_succeeded" != "true" ]]; then
  error "All ${MAX_PUSH_RETRIES} push attempts failed."
  error "Manual intervention required. Check connectivity, credentials, and remote status."
  exit 1
fi

# ── CI Polling loop ───────────────────────────────────────────────────────────
if [[ "$WAIT_CI" != "true" ]]; then
  success "Push complete. CI polling skipped (--no-ci-wait)."
  exit 0
fi

if ! command -v gh &>/dev/null; then
  warn "GitHub CLI (gh) not found — skipping CI status polling."
  warn "Install: https://cli.github.com"
  success "Push completed. Check CI manually."
  exit 0
fi

header "Phase 2 — CI Status Polling"
log "SHA: ${PUSHED_SHA}"
log "Waiting up to ${MAX_CI_WAIT}s for CI to complete..."

elapsed=0
poll_interval=15
ci_result="unknown"

while [[ "$elapsed" -lt "$MAX_CI_WAIT" ]]; do
  sleep "$poll_interval"
  elapsed=$(( elapsed + poll_interval ))

  # Get the latest run for this SHA
  RUN_STATUS=$(gh run list \
    --branch "${BRANCH}" \
    --commit "${PUSHED_SHA}" \
    --limit 1 \
    --json status,conclusion,name,url \
    2>/dev/null || echo "[]")

  if [[ "$RUN_STATUS" == "[]" ]] || [[ -z "$RUN_STATUS" ]]; then
    log "[${elapsed}s] Waiting for CI to start..."
    continue
  fi

  STATUS=$(echo "$RUN_STATUS"     | jq -r '.[0].status // "unknown"')
  CONCLUSION=$(echo "$RUN_STATUS" | jq -r '.[0].conclusion // "pending"')
  RUN_NAME=$(echo "$RUN_STATUS"   | jq -r '.[0].name // "CI"')
  RUN_URL=$(echo "$RUN_STATUS"    | jq -r '.[0].url // ""')

  log "[${elapsed}s] ${RUN_NAME}: ${STATUS} / ${CONCLUSION}"

  if [[ "$STATUS" == "completed" ]]; then
    ci_result="$CONCLUSION"
    break
  fi
done

# ── Final verdict ─────────────────────────────────────────────────────────────
header "Result"

case "$ci_result" in
  success)
    success "🎉 CI passed! Branch '${BRANCH}' is green."
    success "Run: ${RUN_URL}"
    echo ""
    echo -e "  ${GREEN}Next steps:${RESET}"
    echo "  • ArgoCD staging will auto-sync within ~2 minutes"
    echo "  • Release train runs Tue/Thu 10:00 UTC for production"
    echo "  • Monitor: https://grafana.cerebrohive.com"
    ;;
  failure)
    error "CI failed on SHA ${PUSHED_SHA:0:7}."
    error "The deploy-watchdog will auto-retry the failed jobs."
    error "Run:  ${RUN_URL}"
    echo ""
    echo -e "  ${YELLOW}Manual retry:${RESET}"
    echo "  gh run rerun --failed"
    exit 1
    ;;
  unknown)
    warn "CI did not complete within ${MAX_CI_WAIT}s."
    warn "Check manually: gh run list --branch ${BRANCH}"
    exit 1
    ;;
  *)
    warn "CI result: ${ci_result}. Check: ${RUN_URL}"
    exit 1
    ;;
esac
