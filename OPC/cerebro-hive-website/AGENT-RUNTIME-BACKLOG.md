# Enterprise Agent Runtime — Phased Implementation Backlog

This document operationalizes the "Milestone 10/10" north-star architecture as a program of independently
shippable milestones (M10.1–M10.7), grounded directly in the current state of this repository. It supersedes
the single-milestone/10-epic framing: that document stays useful as the long-term architectural target, but
execution should follow the phases below.

**Guiding principle:** prefer finishing scaffolds over creating new abstractions. Before adding any new
package or file, ask: (1) does this capability already exist? (2) is it partially implemented? (3) can it be
completed with integration rather than new code? (4) would creating something new duplicate an existing
subsystem? Every "concrete files to modify" list below was chosen to answer those questions in favor of reuse.

---

## Program-Level Inventory

| Capability | Status | Evidence | Action |
|---|---|---|---|
| AI Gateway | Production | `packages/ai-gateway/src/gateway.ts` — real Anthropic/OpenAI SDK calls, circuit breaker, rate limiter, cache, cost tracking | Reuse |
| Telemetry | Implemented | `AIGateway` already calls `telemetry.recordAIRequest` / `withAISpan` / `getAIMetrics` | Integrate |
| Streaming | Implemented | `AIGateway.stream()` already yields real `StreamChunk`s from providers | Integrate (later phase) |
| Prompt Library | Production | `packages/ai/src/forge/prompts.ts` — 13 full agent personas (pm, architect, frontend, backend, qa, security, devops, etc.) | Reuse |
| Policy Engine | Scaffolded | `PolicyEngine` already instantiated in `apps/platform-api/src/server.ts`; `Policy` model in schema.prisma; `packages/policy`, `packages/policy-core` reserved | Complete |
| Conversation / Memory / RAG data model | **Modeled, not wired** | `schema.prisma` already defines `AgentConversation`, `AgentMessage`, `AgentExecution`, `Memory`, `MemorySnapshot`, `Document`, `DocumentVersion`, `Chunk`, `Embedding` (pgvector `vector(1536)`), `VectorIndex` — live via the `20260719202458_talent_os_architecture` migration | Build repositories + wire. **Do not re-model.** |
| Swarm Runtime | Real state machine, mocked work | `services/swarm-runtime/ExecutionEngine.ts` — real DAG dispatch, dependency resolution, failure cascades; `AgentRegistry.ts` — real capability matching. `Planner.ts` returns a **hardcoded** DAG regardless of input. | Connect to real execution; rebuild Planner only |
| SDK | Empty shell | `packages/sdk` — no dependencies, placeholder only. Already a dependency of `apps/studio`. | Build last |

Caution: the `stage2_sessions` migration also created `AssessmentSession` / `SessionTelemetryBatch` tables.
These belong to a different feature area (talent assessment), not agent conversations — don't confuse them
with `AgentConversation` in Phase M10.4.

---

## M10.1 — Real Agent Execution <!-- status: pending -->

**Depends on:** nothing (this is the foundation).

**Objective:** one agent, one real model call, end to end, over HTTP, with no mocked components anywhere in
the path.

**Existing components to reuse:**
- `AIGateway.chat()` / `createGateway()` — `packages/ai-gateway/src/gateway.ts` (reads `ANTHROPIC_API_KEY` /
  `OPENAI_API_KEY` from env; already production-shaped).
- `AgentExecutionContext` — `packages/domain/src/context/AgentExecutionContext.ts` (already has `modelId`,
  `memory.conversationHistory`, `tokenBudget`, `cancellationToken`, `executionMode`).
- `AgentRepository.getLatestVersion()` — `packages/database/src/repositories/AgentRepository.ts` (already
  returns `modelId` + `instructions` + `tools`/`prompts`/`capabilities` relations).
- `FORGE_SYSTEM_PROMPTS` — `packages/ai/src/forge/prompts.ts` (use the `pm` persona as the first agent).

**Concrete files to modify:**
1. `packages/capabilities/agent-builder/package.json` — add `"@cerebro/ai-gateway": "workspace:*"`.
2. `packages/capabilities/agent-builder/src/AgentRuntimeService.ts` — replace the hardcoded `invokeModel()`
   (currently returns a canned string or a fake `calculate` tool call) with a real `AIGateway.chat({ messages,
   model: context.modelId })` call.
3. `apps/platform-api/package.json` — add `"@cerebro/ai-gateway": "workspace:*"` (not currently a dependency).
4. `apps/platform-api/src/server.ts` — construct `createGateway()`, construct an empty `ToolRegistry` /
   `ToolRuntime` (needed to satisfy `AgentRuntimeService`'s constructor even with zero tools registered),
   construct `AgentRuntimeService`, and make it available to the conversations routes.
5. `apps/platform-api/src/modules/conversations/conversations.routes.ts` — both handlers are currently
   100% hardcoded. `POST /:id/messages` must load the agent + version via `AgentRepository`, build an
   `AgentExecutionContext` in memory (no DB persistence yet), call `agentRuntimeService.execute()`, and
   return the real result.

**Files to leave untouched:** `packages/ai` (still consumed by `apps/studio` / `apps/forge` — leave as the
simpler parallel layer, don't merge yet); `services/swarm-runtime/*` (M10.6); `packages/capabilities/memory`,
`workflow`, `evaluation`, `deployment` (later phases); `schema.prisma` (no migration needed for this phase).

**Explicitly deferred:** tools, memory, persistence, multi-agent, SDK, streaming (the gateway already
supports it, but wiring it through the Conversation API is deferred to keep this phase minimal).

**Definition of Done:** a `POST /conversations/:id/messages` call with a real `agentId` returns a response
whose content came from a live Anthropic or OpenAI completion — verifiable via the response's `model` /
`durationMs` fields, or by revoking the API key and observing a real failure instead of the old canned string.

**Integration tests required before moving on:**
- Hit the real route and assert the response is not the literal old mock string, and that the gateway's
  telemetry hook fired.
- Assert an invalid/missing `agentId` fails cleanly instead of silently falling through to a mock response.

---

## M10.2 — Provider Tool Calling <!-- status: pending -->

**Depends on:** M10.1.

**Objective:** `ChatRequest` / `ChatResponse` in `@cerebro/ai-gateway` support real tool calling for
Anthropic + OpenAI only, through one interface — no provider-specific branching outside the gateway.

**Existing components to reuse:**
- `packages/ai-gateway/src/providers/anthropic.provider.ts`, `openai.provider.ts`, `base.provider.ts` — extend
  these; don't create new provider classes.
- `packages/ai-gateway/src/types.ts` — the single place the shared request/response shape lives; this is
  where `tools` / `toolChoice` / `toolCalls` get added.
- `AgentExecutionContext.availableTools` — already shaped as `{ name, description, version, executionMode,
  schema }`, i.e. already close to what each provider's native tool schema needs.

**Concrete files to modify:**
1. `packages/ai-gateway/src/types.ts` — add `tools?: ToolDefinition[]` and `toolChoice?: ...` to
   `ChatRequest`; add `toolCalls?: ToolCall[]` to `ChatResponse`.
2. `packages/ai-gateway/src/providers/anthropic.provider.ts` — translate `tools` into Anthropic's `tool_use`
   format; parse `tool_use` blocks back into `toolCalls`.
3. `packages/ai-gateway/src/providers/openai.provider.ts` — same, using OpenAI's function-calling /
   `tool_calls` format.
4. `packages/capabilities/agent-builder/src/AgentRuntimeService.ts` — pass `context.availableTools` as
   `tools` on the request; read `response.toolCalls` instead of the old fake `needsTool`/`toolName` shape.

**Files to leave untouched:** `gateway.ts`'s orchestration logic (caching / circuit breaker / rate limiting
don't need to change, only the payload shape flowing through them); `services/swarm-runtime` (M10.6).

**Explicitly deferred:** Gemini and local-model tool calling (local models have materially weaker, less
consistent tool-calling support and would need a prompt-based fallback — separate effort); actually executing
the tool call (that's M10.3 — this phase only gets a structured `toolCalls` array back, it doesn't act on it).

**Definition of Done:** a tool-forcing prompt (e.g. "what's 2+2, use the calculator tool") returns a
structured, correctly-shaped `toolCalls` array from both Anthropic and OpenAI through the identical
`ChatResponse` shape.

**Integration tests required before moving on:**
- One test per provider asserting a tool-forcing prompt yields a non-empty, correctly-shaped `toolCalls`.
- One regression test asserting a normal prompt still returns plain `content` with no `toolCalls` (M10.1's
  path must not break).

---

## M10.3 — Tool Runtime <!-- status: pending -->

**Depends on:** M10.2.

**Objective:** close the loop — a requested tool call actually executes, and the result goes back to the
model for a final answer.

**Existing components to reuse:**
- `packages/capabilities/agent-builder/src/tools/ToolRegistry.ts` — real in-memory register / getMetadata /
  getExecutor, already implemented.
- `packages/capabilities/agent-builder/src/tools/ToolRuntime.ts` — `executeSync` is already implemented and
  real.
- `Tool` / `ToolVersion` / `ToolCategory` / `AgentTool` models already exist in `schema.prisma`, and
  `ToolRepository.ts` already exists in `packages/database/src/repositories` — the tool catalog is already
  modeled and has a repository.

**Concrete files to modify:**
1. `packages/capabilities/agent-builder/src/AgentRuntimeService.ts` — replace the current "always final
   answer" behavior with the real branch: when `response.toolCalls` is non-empty, call
   `toolRuntime.executeTool(...)`, push the result into `messages`, loop again (the surrounding `while` loop
   already exists — the mocked `invokeModel` was the only thing short-circuiting it).
2. `apps/platform-api/src/server.ts` — register at least one real, trivial tool (e.g. calculator or an HTTP
   fetch) via `ToolRegistry.register()` at startup, so there's something real to invoke.

**Files to leave untouched:** `ToolRuntime.executeAsync` (still mocked — see deferred); `schema.prisma`'s
tool tables (already modeled, no migration needed for a first sync tool).

**Explicitly deferred:** approval-required tools, retries/backoff policy, sandboxed execution of untrusted
code (that's an isolation-infrastructure project, not application code — scope separately), async tool
execution.

**Definition of Done:** the same tool-forcing prompt from M10.2 now returns a final natural-language answer
that incorporates the real tool's real output, observable end to end from the HTTP route.

**Integration tests required before moving on:**
- Full round trip test: prompt → tool call → real execution → second model call → final answer, against the
  one registered tool.
- `maxIterations` cutoff in `AgentRuntimeService` still throws cleanly if a tool loops without resolving.

---

## M10.4 — Conversation Persistence <!-- status: pending -->

**Depends on:** M10.1 (can proceed in parallel with M10.2/M10.3 if useful).

**Objective:** conversations and messages survive across requests and process restarts.

**Existing components to reuse — this phase is lighter than it looks:** `AgentConversation` and
`AgentMessage` are **already fully modeled** in `schema.prisma` (`messages` relation, `memory` and
`artifacts` Json fields on the conversation, `role` / `content` / `toolInvocations` / `metadata` on
messages), and the table already exists in the database via the `20260719202458_talent_os_architecture`
migration. This phase is pure repository-and-wiring work, not schema design.

**Concrete files to modify:**
1. `packages/database/src/repositories/AgentConversationRepository.ts` (new — follow the exact pattern of
   the existing `AgentRepository.ts` / `ProjectRepository.ts`): create conversation, append message, load
   conversation with message history.
2. Wherever repositories are currently exported (mirror however `AgentRepository` is exported today) — export
   the new repository the same way.
3. `apps/platform-api/src/server.ts` — construct `AgentConversationRepository`, pass it into the conversation
   route composition.
4. `apps/platform-api/src/modules/conversations/conversations.routes.ts` — `POST /` creates a real
   `AgentConversation` row instead of a random string id; `POST /:id/messages` loads prior messages into
   `AgentExecutionContext.memory.conversationHistory`, and persists both the user message and the assistant's
   reply as `AgentMessage` rows after `AgentRuntimeService.execute()` returns.

**Files to leave untouched:** `schema.prisma` (no migration needed — tables already exist); `Memory` /
`MemorySnapshot` models (M10.5); the unrelated `AssessmentSession` / `SessionTelemetryBatch` tables (different
feature area — don't touch, don't reuse).

**Explicitly deferred:** semantic/vector memory, summarization, token-window trimming (raw history replay
only for now).

**Definition of Done:** two sequential `POST /:id/messages` calls to the same conversation id show the second
response is aware of the first exchange, and both messages are visible via a direct DB query after a process
restart.

**Integration tests required before moving on:**
- Conversation-continuity test: ask a question, then "what did I just ask?" — the answer must be correct.
- Persistence test: assert message rows exist with correct `role` / `content` after a request completes.

---

## M10.5 — Memory <!-- status: pending -->

**Depends on:** M10.4.

**Objective:** long- and cross-conversation memory via retrieval, not just raw history replay.

**Existing components to reuse:** `Memory` / `MemorySnapshot` models already in `schema.prisma`; the entire
RAG data layer — `Document` → `DocumentVersion` → `Chunk` → `Embedding` (with a pgvector `vector(1536)`
column already declared) → `VectorIndex` — is already modeled and live; `packages/capabilities/memory` already
exists (depends on `@cerebro/domain`) as the intended home for this logic, currently empty;
`packages/capabilities/knowledge` similarly reserved for the document/ingestion side.

**Concrete files to modify:**
1. `packages/database/src/repositories/MemoryRepository.ts`, `EmbeddingRepository.ts` (new, following the
   existing repository pattern).
2. `packages/capabilities/memory/src/*` (currently ~empty) — implement summarization + retrieval here, in
   the package already reserved for it, rather than a new package.
3. An embeddings client (new, small — likely lives in `packages/ai-gateway` alongside the chat providers,
   since `Embedding.model` already anticipates recording which embedding model produced a vector).
4. `AgentRuntimeService.ts` — before calling the gateway, retrieve relevant chunks and fold them into the
   prompt (prompt assembly step).

**Files to leave untouched:** `Chunk` / `Embedding` / `VectorIndex` schema (already correctly modeled — this
phase fills them, it doesn't redesign them).

**Explicitly deferred:** automatic summarization scheduling / background jobs, cross-tenant knowledge
sharing, anything beyond single-workspace retrieval.

**Definition of Done:** a conversation long enough to exceed a reasonable raw-history window still answers
correctly about something said much earlier, via retrieved context rather than full transcript replay.

**Integration tests required before moving on:**
- Retrieval-accuracy test: seed known facts, confirm they're retrieved for a relevant query and not for an
  irrelevant one.
- Regression test: M10.4's raw-history path still works when retrieval finds nothing relevant.

---

## M10.6 — Multi-Agent Runtime <!-- status: pending -->

**Depends on:** M10.3 (tool-using single agent should be solid first).

**Objective:** orchestrate multiple specialized agents — using the existing prompt library — on real work,
not the current mocked work.

**Existing components to reuse:** `services/swarm-runtime/src/ExecutionEngine.ts` — a genuinely real DAG
dispatch/state machine (`PENDING → READY → RUNNING → COMPLETED/FAILED/CANCELLED/SKIPPED`, dependency
resolution, failure cascades, worker-pool capacity checks) — reuse as-is, do not rebuild;
`services/swarm-runtime/src/AgentRegistry.ts` — real capability matching (`allocateBestAgent` by
skills/reliability/cost) — reuse as-is; `FORGE_SYSTEM_PROMPTS` (13 personas) as the agent catalog behind the
registry.

**Concrete files to modify:**
1. `services/swarm-runtime/src/ExecutionEngine.ts` — replace `WorkerThreadProvider` (currently just
   `await new Promise(r => setTimeout(r, 800))` — literally simulated work) with a real `ExecutionProvider`
   that calls `AgentRuntimeService.execute()` per node, using `AgentRegistry.allocateBestAgent()` to select
   the persona.
2. `services/swarm-runtime/src/Planner.ts` — `PlannerService.compile()` currently returns a **hardcoded
   3-node DAG regardless of input intent** (a fixed "Analyze Q3 spending" fixture). This needs a real
   implementation — most consistent with the rest of the architecture, this itself should be an
   `AIGateway.chat()` call (a planner-persona prompt that emits a DAG), not hand-written graph logic.

**Files to leave untouched:** `ExecutionStateStore.ts` / `WorkerPool.ts` (state machine plumbing already
works); `AgentRegistry.ts` (reuse as-is).

**Explicitly deferred:** cross-agent memory sharing beyond what M10.5 already provides, dynamic re-planning
mid-execution, human-in-the-loop approval gates on the DAG itself (distinct from M10.3's per-tool approvals).

**Definition of Done:** a single natural-language intent produces a *different*, appropriate DAG each time
(not the fixed Q3-spending fixture), and each node's output came from a real model call through a real
persona.

**Integration tests required before moving on:**
- Two different input intents must produce two different DAG shapes (proves the planner isn't still
  hardcoded).
- End-to-end swarm run: node outputs must be non-identical/non-canned across nodes.

---

## M10.7 — SDK <!-- status: pending -->

**Depends on:** M10.1–M10.6 substantially complete (SDKs freeze interfaces — build last on purpose).

**Objective:** one stable public interface (`new AgentRuntime().run({ agent, input, memory, tools, stream })`)
that Studio / HiveOps / Copilot consume, with no provider- or package-specific imports leaking upward.

**Existing components to reuse:** `packages/sdk` exists only as an empty package shell (no dependencies,
placeholder `src/index.ts`) but is **already a declared dependency of `apps/studio`** — the consumer wiring is
already there; the package itself is genuinely greenfield.

**Concrete files to modify:** `packages/sdk/src/index.ts` (build the facade here); `packages/sdk/package.json`
(add real dependencies on everything it wraps).

**Files to leave untouched:** everything the SDK wraps, by design — if building the SDK requires changing
M10.1–M10.6 internals, that's a signal an earlier phase's interface wasn't actually stable yet.

**Explicitly deferred:** nothing — this phase is intentionally last and should be small if M10.1–M10.6 are
genuinely done.

**Definition of Done:** `apps/studio` can run any agent type with memory/tools/streaming toggled by flags
through one SDK call, with zero provider-specific or internal-package imports in Studio's own code.

**Integration tests required before moving on:** a consumer-side test exercising only the SDK's public
surface (from `apps/studio` or a throwaway script) — no reaching into internals.

---

## How to use this document

Work top to bottom; do not start a phase until the previous one's Definition of Done and integration tests
pass for real (not against a mock). When a phase's "existing components to reuse" turns out to be less real
than documented here, that's new information — update this file rather than silently absorbing the gap into
the next phase's scope.
