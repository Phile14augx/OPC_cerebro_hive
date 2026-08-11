#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# docker-push-loop.sh — Build and push a Docker image, retrying until success
#
# Usage:
#   ./infra/scripts/docker-push-loop.sh \
#     --image ghcr.io/cerebrohive/cerebro-hive/studio \
#     --tag 1.2.3 \
#     --context . \
#     --dockerfile apps/studio/Dockerfile
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Defaults ──────────────────────────────────────────────────────────────────
IMAGE=""
TAG="latest"
CONTEXT="."
DOCKERFILE="Dockerfile"
MAX_RETRIES="${MAX_RETRIES:-5}"
PLATFORM="${PLATFORM:-linux/amd64}"
BUILD_ARGS=()

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; RESET='\033[0m'

log()     { echo -e "${BLUE}[docker-loop]${RESET} $*"; }
success() { echo -e "${GREEN}[docker-loop] ✅ $*${RESET}"; }
error()   { echo -e "${RED}[docker-loop] ❌ $*${RESET}"; }

# ── Parse flags ───────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --image)       IMAGE="$2";       shift 2 ;;
    --tag)         TAG="$2";         shift 2 ;;
    --context)     CONTEXT="$2";     shift 2 ;;
    --dockerfile)  DOCKERFILE="$2";  shift 2 ;;
    --max-retries) MAX_RETRIES="$2"; shift 2 ;;
    --platform)    PLATFORM="$2";    shift 2 ;;
    --build-arg)   BUILD_ARGS+=("--build-arg" "$2"); shift 2 ;;
    *) error "Unknown: $1"; exit 1 ;;
  esac
done

[[ -z "$IMAGE" ]] && { error "--image is required"; exit 1; }
FULL_IMAGE="${IMAGE}:${TAG}"

log "Image:    ${FULL_IMAGE}"
log "Context:  ${CONTEXT}"
log "Platform: ${PLATFORM}"
log "Retries:  ${MAX_RETRIES}"

attempt=1
while [[ "$attempt" -le "$MAX_RETRIES" ]]; do
  log "Attempt ${attempt}/${MAX_RETRIES}..."

  if [[ "$attempt" -gt 1 ]]; then
    backoff=$(( 10 * (2 ** (attempt - 2)) ))
    backoff=$(( backoff > 180 ? 180 : backoff ))
    log "Backoff: ${backoff}s..."
    sleep "$backoff"
  fi

  if docker buildx build \
      --platform "${PLATFORM}" \
      --file "${DOCKERFILE}" \
      --tag "${FULL_IMAGE}" \
      --tag "${IMAGE}:latest" \
      "${BUILD_ARGS[@]}" \
      --push \
      "${CONTEXT}" 2>&1; then
    success "Built and pushed ${FULL_IMAGE} on attempt ${attempt}"
    exit 0
  fi

  error "Build/push failed (attempt ${attempt}/${MAX_RETRIES})"
  attempt=$(( attempt + 1 ))
done

error "All ${MAX_RETRIES} attempts failed for ${FULL_IMAGE}"
exit 1
