# Polyglot System Architecture Map

Companion to `ARCHITECTURE-RECON-M25.4A.md`, produced after that report's own correction (the original scanner was TypeScript/JavaScript-only and materially undercounted real services). This map covers every service where I now have at least a structural read; per-service detail lives in `docs/architecture/services/*.md` (one file per service, YAML body, as requested) rather than duplicated here.

**The single biggest finding in this pass:** there is a real, coherent, well-engineered multi-agent product called **"HiveSwarm"** spanning Python, Go, and TypeScript — `services/agent-runner` (Python, LangChain-based orchestrator with Research/Coding/Critique specialist agents), `services/planner-service` (Python, LangGraph goal-to-DAG planner), `services/swarm-api` (Go, HTTP/WebSocket API with NATS + Redis), `services/router-service` (Go, weighted agent-selection scoring), `services/tool-gateway` (Go, tool execution gateway — its own source comment calls it "the HiveSwarm tool-gateway"), and probably `services/swarm-runtime` (TypeScript). This is not scaffolding — the LangGraph planner in particular is more sophisticated than anything I found in the TypeScript `runtime-core` planners. It exists alongside, not instead of, the `apps/platform-api` + `packages/capabilities/agent-builder` single-agent-conversation system built this session — those two are probably different products (multi-agent orchestrated automation vs. simple chat agent), not competing implementations, but this needs a production-wiring check before anyone treats it as settled.

## Confidence key

- **Verified** — read actual business-logic source this pass.
- **Structural** — confirmed real framework/file layout (e.g. Spring Boot Controller/Service/Repository pattern), did not read business logic line by line.
- **Inventory** — file count and dependency data only, from the M25.4A scan; not opened this pass.

## Map

**Deployment status added by Milestone 25.4C**, cross-referenced across `infra/helm/cerebro-hive/values.yaml`, both `infra/argocd/application-{production,staging}.yaml`, and `.github/workflows/docker-build.yml`. Full evidence in `MILESTONE-25.4C-RUNTIME-INTEGRATION.md`.

| Service | Language | Framework | Protocol | Reached via | Confidence | Deployed? | Status |
|---|---|---|---|---|---|---|---|
| `services/gateway` | Rust | Axum | HTTP (edge) | Public internet (assumed) | Verified | **CI-built, Helm-absent** | Real, mostly working; one confirmed placeholder bug on the `/` proxy route; production Ingress appears to bypass it entirely |
| `packages/ai-gateway` | TypeScript | none | in-process | imported by platform-api | Verified | **Confirmed — prod + staging** | Real, built/verified this session. Owns the `gateway.cerebrohive.com` ingress host in production |
| `apps/platform-api` | TypeScript | Fastify | HTTP | `services/gateway` `/api/v1/{workflows,agents,knowledge}` | Verified | **Confirmed — prod + staging** | Real, built/verified this session. Own direct ingress at `api.cerebrohive.com` |
| `services/forge-api` | TypeScript | unread (Nest-shaped) | HTTP | `services/gateway` `/api/v1/forge` | Inventory | **Confirmed — prod + staging** | 48 files, low scaffold-hit density; internal-only (no public ingress), paired with `apps/forge` at `forge.cerebrohive.com` |
| `services/platform-svc` | Kotlin | Spring Boot | HTTP | `services/gateway` `/api/v1/platform` | Structural | **CI-built, Helm-absent** | Real Spring service, logic unread |
| `services/academy-svc` | Kotlin | Spring Boot | HTTP | `services/gateway` `/api/v1/academy` | Structural | **CI-built, Helm-absent** | Real Spring service, logic unread |
| `services/crm-svc` | Kotlin | Spring Boot | HTTP | `services/gateway` `/api/v1/crm` | Structural | **CI-built, Helm-absent** | Real Spring service, logic unread |
| `services/tool-gateway` | Go | Gin | HTTP :8940 | Not found in `services/gateway`'s route table | Verified | **Confirmed — prod + staging** | Real, well-built; serves HiveSwarm (agent-runner/planner-service), not platform-api |
| `services/temporal-worker` | TypeScript | @temporalio/worker | Temporal gRPC | Temporal server (internal) | Verified | **Not even in the CI build matrix** | Real Temporal worker; likely pairs with `packages/capabilities/workflow`, but neither has a confirmed consumer or deploy path |
| `services/agent-runner` | Python | LangChain (implied) | unread | Not found in `services/gateway`'s route table | Verified | **Confirmed — prod + staging** | Real, mature multi-agent orchestrator ("HiveSwarm") |
| `services/planner-service` | Python | LangGraph | unread | Not found in `services/gateway`'s route table | Verified | **Confirmed — prod + staging** | Real, sophisticated goal-to-DAG planner ("HiveSwarm") |
| `services/swarm-api` | Go | unread + NATS + Redis | HTTP + WebSocket | Not found in `services/gateway`'s route table | Structural | **Confirmed — prod + staging** | Real, substantial ("HiveSwarm"); other HiveSwarm services depend on it |
| `services/swarm-runtime` | TypeScript | unread | unread | depends_on `swarm-api`; also talks to Temporal directly (docker-compose) | Inventory | **Confirmed — prod + staging** | Deployed but source still unread — relationship to `planner-service`'s own planning logic unresolved |
| `services/router-service` | Go | unread | HTTP | Not found in `services/gateway`'s route table | Verified | **CI-built, Helm-absent** | Real, weighted agent-selection scorer ("HiveSwarm") — same undeployed status as the Rust gateway |
| `services/memory-service` | Python | unread | HTTP :8930 | Not found in `services/gateway`'s route table | Inventory | **Confirmed — prod + staging** | Deployed, source unread |
| `services/evaluation-service` | Python | unread | HTTP :8922 | Not found in `services/gateway`'s route table | Inventory | **CI-built, Helm-absent** | Real, undeployed |
| `services/learning-service` | Python | unread | HTTP :8950 | Not found in `services/gateway`'s route table | Inventory | **CI-built, Helm-absent** | Real, undeployed |
| `services/ml-svc` | C++ | gRPC | gRPC | unread | Structural | **CI-built, Helm-absent** | Real: embeddings, lead scoring, recommendations, pgvector |
| `packages/capabilities/agent-builder` | TypeScript | none | in-process | imported by platform-api | Verified | n/a (library) | Real, built/verified this session |
| `apps/studio` | TypeScript | Next.js | HTTP | direct ingress `app.cerebrohive.com` | Inventory | **Confirmed — prod + staging** | Highest scaffold-hit count in the repo (421/1,163 files), still unaudited in detail — but confirmed live in production, raising the stakes on that audit |
| `apps/forge` | TypeScript | Next.js | HTTP | direct ingress `forge.cerebrohive.com` | Inventory | **Confirmed — prod + staging** | Frontend half of Forge, paired with `services/forge-api` |

## What's still genuinely unknown

- Whether the 8 CI-built-but-Helm-absent services (`gateway`, the Kotlin trio, `ml-svc`, `router-service`, `evaluation-service`, `learning-service`) deploy through some mechanism outside this repo, or simply aren't deployed anywhere yet. The repo's own IaC has no evidence either way beyond "not part of this Helm chart."
- Business logic for the 3 Kotlin services and the C++ ml-svc — confirmed real structure, not read line by line.
- `services/swarm-runtime` (TypeScript)'s actual relationship to `services/planner-service` — same product, different layer, or a fourth independent planner implementation. Confirmed deployed either way; just unread.
- Everything under `apps/studio` (1,163 files, now confirmed live in production) and the 10 unexamined `apps/platform/src/features/studio/*` subdirectories.
- Health/observability endpoints for everything except `services/gateway` and `packages/ai-gateway`.
- Ownership — nothing in this repo has a CODEOWNERS file or documented team ownership that I've found.
- Whether HiveSwarm and the Platform Runtime are meant to eventually call each other — see the "system of record" conclusion in `RESPONSIBILITY-MATRIX.md` / `MILESTONE-25.4C-RUNTIME-INTEGRATION.md`.
