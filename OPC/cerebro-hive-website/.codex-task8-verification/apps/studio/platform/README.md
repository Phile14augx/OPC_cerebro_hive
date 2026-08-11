# CerebroHive Enterprise AI OS (`platform/`)

Domain-driven modular monolith implementing the 15 core capabilities plus the
ten Core Consulting Capabilities, on shared kernel services.

## Layout
- `src/kernel` — config, ids, errors, logging, OTel-compatible telemetry, event bus
  (NATS JetStream / Redis Streams / in-memory), RBAC+ABAC policy engine, identity
  (orgs/users/workspaces/api-keys, Postgres-backed), audit, feature flags, SQL
  migrations, snapshot persistence, Fastify API gateway (+OpenAPI at /openapi.json).
- `src/ai` — **Cerebro X™** gateway (mock/Ollama/OpenAI/Anthropic providers,
  routing/retries/fallback/cache/pricing/telemetry/prompt-registry/embeddings/
  streaming), Mixture-of-Experts router+aggregator, World Model with event
  projections, JEPA-inspired representation layer + anomaly detection.
- `src/domains` — AgentOS runtime (state machine, scheduler, checkpoints, SSE),
  Reasoning (strategy selection, planner, reasoning graph, critic/verifier,
  self-correction), Agent Mesh (+Python AgentOS bridge), Flow (compiler,
  approvals, compensation, triggers), Memory Fabric (9 tiers, compression,
  permission-aware retrieval), Knowledge Fabric (ingestion event chain,
  GraphRAG, hybrid search, citations), Context Engine, Guard (prompt firewall,
  PII/secrets, OWASP LLM mappings, rate limiting), Eval (grounding, regression),
  Observatory, Governance (approvals, compliance posture), Connect, Intelligence
  Hub, Simulator (seeded Monte Carlo), Sphere (cockpit/search/timeline),
  Consulting (10 practice areas → engagements as approval-gated workflows,
  readiness assessments → knowledge, simulator-projected roadmaps).
- `src/dev` — typed SDK client + `cerebro` CLI.
- `test/` — 40 unit + integration tests (in-memory bus, real HTTP via inject).

## Run
```bash
npm ci && npm test
DATABASE_URL=postgres://... EVENT_BUS=nats npm run dev   # full stack
PLATFORM_NO_DB=1 EVENT_BUS=memory npm run dev            # zero-dependency mode
```
Bootstrap the first organization: `POST /v1/bootstrap` → returns the API key once.

## Durability note
Identity + audit are table-backed (see `migrations/`). Domain repositories ship
with in-memory implementations persisted via JSON snapshots to Postgres every
20s (restart-safe on a single node); their repository interfaces are the seam
for table-backed implementations as scale requires — services do not change.
