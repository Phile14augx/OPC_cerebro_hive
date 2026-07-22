# AgentOS — Enterprise Operating System for AI Workers

This is a working backend implementation of the AgentOS architecture: a runtime where every
agent has identity, memory, permissions, tools, governance, observability, and lifecycle
management. It is a separate service from the CerebroHive marketing website (`/app`,
`/components`) that lives in the rest of this repository — the website's `/products/agentos`
page describes this platform; this folder *is* the platform.

## What's actually implemented (Phase 1 MVP)

Every bounded context from the architecture spec has a real, working slice:

| System | Status |
|---|---|
| Agent Registry (identity, capabilities, lifecycle) | ✅ Full CRUD, versioned |
| Identity & Auth | ✅ API-key issuance + bearer auth dependency |
| Agent Runtime (boot → plan → execute → reflect → store) | ✅ Real state machine |
| Planner (goal → task graph → execution) | ✅ Chain-of-thought decomposition; ToT/GoT strategy hooks stubbed |
| Multi-Agent Collaboration (Agent Mesh) | ✅ Real delegation (`agent` workflow node calls another agent's full runtime, including its own governance/planning/tools) and real consensus (`agent_vote` node runs multiple agents independently, then picks the answer with highest average embedding-similarity agreement across the group, recording dissenters) |
| Context Engine | ✅ `context_engine.assemble()` fuses Memory + Knowledge retrieval into one ranked bundle plus the governance policies actually in scope for the agent; this is what the runtime's reasoning step calls (`GET /context/assemble` to preview it directly) |
| Tool Framework | ✅ Permissioned tool registry + built-in tools (filesystem, http, python_eval, web_search stub) |
| Skills | ✅ Versioned, installable skill packages |
| Knowledge System (RAG) | ✅ Chunk + embed + retrieve + cite (naive local embeddings by default, pluggable for real embedding APIs) |
| Memory Engine | ✅ Working / episodic / semantic / long-term tiers, backed by SQL + vector similarity |
| Workflow Engine | ✅ DAG executor with retries, timeouts, human approval nodes; Temporal adapter documented as the production swap-in |
| Communication Bus | ✅ In-process async pub/sub; NATS adapter documented as the production swap-in |
| Event System | ✅ Append-only event log, event-sourced |
| Observability | ✅ Structured traces + metrics tables and query API, plus `GET /observability/summary` — real latency percentiles (p50/p95/p99), error rate, cost/token totals, and a per-agent rollup computed from stored spans, not sampled; OpenTelemetry export hook |
| Governance | ✅ Policy-as-code engine (declarative YAML rules incl. numeric thresholds `>`/`<`/`>=`/`<=`), audit log now covers agent CRUD, policy creation, run blocks, and approval decisions (`GET /governance/audit-log`) |
| Cortex (decision engine) | ✅ Real least-squares forecasting (`POST /cortex/forecast`) and exact 0/1-knapsack optimization (`POST /cortex/optimize`) — provably optimal, not heuristic |
| Simulator (digital twin) | ✅ Seeded Monte Carlo queue simulation (`POST /simulator/run`) — Poisson arrivals, exponential service times, multi-trial wait/backlog/utilization stats for "what if we staffed N agents" analysis |
| Prompt Management | ✅ Versioned prompt templates with render + diff |
| LLM Gateway | ✅ Multi-provider routing (Anthropic / OpenAI / Ollama) with fallback to a deterministic mock provider so the whole system runs offline, zero API keys required |
| Human-in-the-Loop | ✅ Approval queue, pause/resume execution |
| Learning Engine | 🟡 Feedback capture + metric aggregation implemented; reward-model training is out of scope for an MVP |
| Agent Store / Marketplace | ✅ Install agent templates into the registry |
| Deployment | 🟡 Dockerfile + docker-compose for Postgres/Redis; Kubernetes/Helm manifests are the next step, not included here |

**What is intentionally *not* built** (documented so nobody mistakes the MVP for the production
target): Temporal, NATS JetStream, OpenSearch, MinIO, Keycloak, HashiCorp Vault, OPA, and
Kubernetes are all named in the target architecture as production infrastructure. This MVP
implements the *interfaces* those systems would sit behind (workflow engine, communication bus,
knowledge search, object storage, identity, secrets, policy) with lightweight equivalents
(SQLite/Postgres, in-process pub/sub, local vector similarity, API keys, env vars, YAML rules)
so the whole platform runs with **zero external infrastructure** on a laptop. Swapping in the
production tech behind each interface is the documented upgrade path, not a rewrite.

## Running it

```bash
cd agentos
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python scripts/seed.py          # creates example agents, skills, and a policy
uvicorn app.main:app --reload --port 8088
```

By default this uses SQLite (`agentos.db` in this folder) and the mock LLM provider — no
external services or API keys required. Set `DATABASE_URL` to point at Postgres, and
`ANTHROPIC_API_KEY` / `OPENAI_API_KEY` to use a real model, via `.env` (see `.env.example`).

`docker-compose.yml` brings up Postgres + Redis if you want the closer-to-production stack.

## Try it

```bash
# 1. Issue an API key
curl -s -X POST localhost:8088/auth/api-keys -d '{"owner":"phil"}' -H 'content-type: application/json'

# 2. List the seeded agents
curl -s localhost:8088/agents -H "Authorization: Bearer <key>"

# 3. Run the Research Agent against a goal
curl -s -X POST localhost:8088/runtime/execute \
  -H "Authorization: Bearer <key>" -H 'content-type: application/json' \
  -d '{"agent_slug":"research-agent","goal":"Summarize the competitive landscape for enterprise agent platforms"}'

# 4. Inspect the trace it left behind
curl -s localhost:8088/observability/traces -H "Authorization: Bearer <key>"
```

A finance-flavored goal against `finance-agent` will trip the seeded governance policy
(`require_approval: category == finance`) and come back `status: "pending_approval"` — approve
it via `POST /governance/approvals/{id}/decide` to watch the run resume.

## Layout

```
agentos/
├── app/
│   ├── main.py            FastAPI app + router mounting
│   ├── config.py          Settings (env-driven)
│   ├── db.py               SQLAlchemy engine/session
│   ├── security.py         API-key auth
│   ├── models/             SQLAlchemy models, one file per bounded context
│   ├── core/                the actual engines (runtime, planner, memory, tools,
│   │                        skills, knowledge, workflow, governance, LLM gateway,
│   │                        event bus, observability)
│   └── api/routers/        thin FastAPI routers over app/core
├── agents_store/            YAML agent definitions (the "Agent Store")
├── scripts/seed.py          demo data
└── tests/                   pytest smoke tests (run fully offline via the mock LLM)
```

## Roadmap to production

1. Swap SQLite → Postgres 17 + pgvector for real similarity search at scale.
2. Swap the in-process communication/event bus → NATS JetStream.
3. Swap the DAG workflow executor → Temporal (the node model here maps directly onto
   Temporal activities/workflows).
4. Swap API-key auth → Keycloak/OIDC + JWT + RBAC/ABAC.
5. Swap the YAML policy engine → Open Policy Agent (OPA), same rule shapes.
6. Add OpenSearch for hybrid lexical+semantic search alongside pgvector.
7. Add MinIO for object storage (documents, artifacts) instead of local disk.
8. Containerize each bounded context as its own service behind the API gateway; deploy via
   Kubernetes + Helm + Argo CD.
