# Per-Service Resilience & Failure-Handling Audit

Milestone 25.5 follow-up (task #41). Covers what's actually been read this session; Kotlin (platform-svc/academy-svc/crm-svc) and C++ (ml-svc) business logic remain structural-only (confirmed real framework, not read line by line) — noted honestly rather than padded out.

## Confirmed real resilience patterns

- **`packages/ai-gateway`** — real `CircuitBreaker` per provider (configurable error threshold + reset timeout), real `RateLimiter` (per org+provider), failover across providers ordered by priority (`executeWithFailover`), retryable-vs-fatal error distinction (`GatewayError.retryable`). One of the most complete resilience implementations found in the repo.
- **`services/tool-gateway`** (Go) — Redis client with retry backoff, rate limiter, graceful shutdown via signal handling.
- **`services/planner-service`** (Python/LangGraph) — real self-correction loop (fix-node retry, capped at `MAX_FIX_RETRIES = 2`), cycle detection before executing a plan.
- **`services/router-service`** (Go) — not resilience per se, but hard filters (cost/latency/proficiency ceilings) before ever selecting an agent, which is a real safety valve against routing to an overloaded or too-expensive agent.
- **`services/gateway`** (Rust) — JWT auth + rate-limiting middleware are real; one confirmed placeholder bug on the root proxy route (hardcoded empty base URL) from the original M25.4A audit, not yet fixed.

## Confirmed gaps — self-documented in the code, not inferred

- **`services/swarm-runtime`'s `ExecutionEngine`** — the DAG scheduler itself is genuinely well-built (topological dispatch, priority queue, worker-pool capacity limits, cancellation tokens, failure-cascade skipping of downstream nodes). But: the only `ExecutionProvider` actually wired in is `WorkerThreadProvider`, which simulates work with a hardcoded `setTimeout(800ms)` and throws on a magic string (`node.intent.includes('FAIL_ME')`) — a test harness, not real task dispatch. Retry policy is explicitly not implemented — the code's own comment says "Evaluate Retry Policy / For simplicity, failing immediately." Artifact storage is explicitly commented `(Mock)` at the call site.
- **`services/swarm-runtime`'s `Planner.ts`** — resolves the open "is this a redundant planner" question from the Architecture Map: it's not a competing real implementation, it's a hardcoded mock (`compile()` always returns the same fixed 3-node DAG for "Analyze Q3 spending" regardless of the actual input intent). Not even exported from the package's own `index.ts` barrel — dead code, not wired to anything.
- **`apps/platform-api`'s `PolicyEngine`** — wired into the request path but constructed with zero registered policies (see Responsibility Matrix) — no enforcement happens today, silently.
- **`services/gateway`'s root proxy route** — carried over from M25.4A, still unfixed: hardcoded placeholder instead of the captured base URL.

## Structural-only, not line-by-line verified

`services/platform-svc`, `services/academy-svc`, `services/crm-svc` (Kotlin/Spring Boot — real Controller/Service/Repository structure confirmed, business logic and any resilience annotations like `@Retryable`/circuit-breaker config not read) and `services/ml-svc` (C++/gRPC — real file structure for embeddings/scoring/recommendations, not read line by line). Recommend these as the next deep-read pass if resilience posture there matters for a specific decision — no evidence either way yet.

## Config management

Handled consistently at the platform level via the shared `cerebro-hive-config` ConfigMap (`NODE_ENV`, OTEL exporters, `LOG_LEVEL` correctly gated per environment) — see Milestone 25.5's observability section — though as traced in the Helm reconciliation work, that ConfigMap is only actually referenced by `rollout.yaml` (Set 1), not by Set 2's macro, so its actual reach depends on the same template-generation question flagged there.
