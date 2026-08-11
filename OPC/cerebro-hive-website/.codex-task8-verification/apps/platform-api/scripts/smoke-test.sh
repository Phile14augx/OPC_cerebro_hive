#!/usr/bin/env bash
# M25 Epic 1 — End-to-End Runtime Validation smoke test.
#
# Exercises the real HTTP path: create an agent (with a runnable version) ->
# start a conversation -> send it a message -> confirm a real, non-mocked
# response comes back through AIGateway-LLM.
#
# Prerequisites (see RUNTIME-VALIDATION-CHECKLIST.md at the repo root):
#   - `pnpm install` has succeeded and `pnpm typecheck` passes
#   - Postgres is running and migrated (DATABASE_URL set)
#   - ANTHROPIC_API_KEY or OPENAI_API_KEY is set in the environment the
#     server runs with
#   - `pnpm --filter @cerebro/platform-api dev` is running (default: port 3406)
#
# Usage: BASE_URL=http://localhost:3406 ./scripts/smoke-test.sh

set -euo pipefail
BASE_URL="${BASE_URL:-http://localhost:3406}"
WORKSPACE_HEADER='x-workspace-id: smoke-test-workspace'
TENANT_HEADER='x-tenant-id: smoke-test-tenant'

echo "== 1. Create agent (POST /api/v1/agents) =="
CREATE_RESPONSE=$(curl -sS -X POST "$BASE_URL/api/v1/agents" \
  -H 'Content-Type: application/json' \
  -H "$WORKSPACE_HEADER" \
  -H "$TENANT_HEADER" \
  -d '{
    "name": "Smoke Test PM Agent",
    "modelId": "claude-sonnet-4-6",
    "instructions": "You are a concise, helpful product manager agent."
  }')
echo "$CREATE_RESPONSE"

AGENT_ID=$(echo "$CREATE_RESPONSE" | node -e "
let d = '';
process.stdin.on('data', c => d += c);
process.stdin.on('end', () => {
  try { console.log(JSON.parse(d).data.id); } catch { process.exit(1); }
});
")
if [ -z "$AGENT_ID" ]; then
  echo "FAIL: could not create agent / parse agent id from response above." >&2
  exit 1
fi
echo "Created agent: $AGENT_ID"

echo "== 2. Start conversation (POST /api/v1/conversations) =="
curl -sS -X POST "$BASE_URL/api/v1/conversations" \
  -H 'Content-Type: application/json' \
  -H "$WORKSPACE_HEADER" \
  -H "$TENANT_HEADER" \
  -d "{\"agentId\": \"$AGENT_ID\"}"
echo

echo "== 3. Send message — real model call happens here =="
MESSAGE_RESPONSE=$(curl -sS -X POST "$BASE_URL/api/v1/conversations/$AGENT_ID/messages" \
  -H 'Content-Type: application/json' \
  -H "$WORKSPACE_HEADER" \
  -H "$TENANT_HEADER" \
  -d '{"message": "In one sentence, what is your role?"}')
echo "$MESSAGE_RESPONSE"

if echo "$MESSAGE_RESPONSE" | grep -q "This is a mock LLM response"; then
  echo "FAIL: got the MockLLMProvider response — AIGateway-LLM is not resolving as the real provider (check priority/health in RuntimeRegistry)." >&2
  exit 1
fi

if echo "$MESSAGE_RESPONSE" | grep -q '"status":"completed"'; then
  echo "PASS: received a completed response. Read it above and confirm by eye that it's not canned."
else
  echo "FAIL: response did not report status:\"completed\"." >&2
  exit 1
fi
