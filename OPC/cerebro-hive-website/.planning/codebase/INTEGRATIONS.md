# External Integrations

**Analysis Date:** 2026-07-23

## Overview

This monorepo has **three separate backend surfaces**, each with its own integration footprint:

1. **AgentOS** (`apps/studio/agentos/`, Python/FastAPI) — the AI agent runtime. Ships "zero external infrastructure required" by default (SQLite + mock LLM); production integrations (Postgres, NATS, OpenSearch, MinIO, Keycloak) are wired but **optional/conditional** on env vars.
2. **CerebroHive Platform kernel** (`apps/studio/platform/`, Fastify/TS) — a separate domain-driven modular monolith living inside the `studio` Next.js app directory, with its own connector framework for external system integration (`src/domains/connect/connect.ts`) and its own Postgres/Redis/NATS wiring.
3. **forge-api** (`services/forge-api/`, NestJS) — CerebroForge's backend, using the shared `packages/database` Prisma schema.

Plus the Next.js frontends (`apps/studio`, `apps/forge`) call these backends directly and also integrate a few external SaaS APIs themselves (GitHub).

## APIs & External Services

**LLM Providers (AgentOS — `app/core/cerebro_x/`):**
- Anthropic — `providers/anthropic.py`, SDK `anthropic>=0.34`, env `ANTHROPIC_API_KEY`
- OpenAI — `providers/openai.py`, SDK `openai>=1.52`, env `OPENAI_API_KEY`
- Google Gemini — `providers/gemini.py`, SDK `google-genai>=0.2.0`, env `GOOGLE_API_KEY`
- Ollama (local/self-hosted) — `providers/ollama.py`, env `OLLAMA_BASE_URL` (default `http://localhost:11434`)
- Mock provider — `providers/mock.py`, deterministic offline fallback, always appended last in the chain
- Routing: `app/core/cerebro_x/gateway.py` (`CerebroXGateway`) builds a fallback chain in priority order OpenAI → Anthropic → Gemini → Ollama → Mock, based on which API keys are configured; `app/core/cerebro_x/router.py` (`ProviderRouter`) executes the chain

**LLM Providers (Next.js frontend — `apps/studio`):**
- Vercel AI SDK (`ai` 7.x) + `@ai-sdk/openai` — used for in-app AI features distinct from the AgentOS backend

**Content publishing (`services/contentops`):**
- Anthropic (`@anthropic-ai/sdk`) — content transformation/generation
- LinkedIn — OAuth publishing target, `src/auth/linkedin-oauth.ts`, `src/publishers/linkedin.ts`, `src/auth/token-manager.ts`; setup documented in `services/contentops/CREDENTIALS_SETUP.md`; script entry `pnpm auth:linkedin` (`tsx src/auth/linkedin-oauth.ts`)

**Developer tools (dev/CI):**
- GitHub REST API — `apps/studio/lib/github/client.ts` (`Octokit` from `@octokit/rest`, auth via `GITHUB_PAT` env var); used to label/comment on issues with PM-agent analysis (`updateIssueWithPMAnalysis`)
- GitHub Webhooks — signature verification via `@octokit/webhooks-methods` `verify()` in the same file, secret from `GITHUB_WEBHOOK_SECRET`

**Generic connector framework (`apps/studio/platform/src/domains/connect/connect.ts`):**
Pluggable `Connector` interface (`descriptor` + `invoke()`) with categories `chat | dev | crm | erp | cloud | storage | generic` and auth modes `none | token | oauth`. Implemented connectors:
- `webhookConnector` — generic outbound webhook POST (fetch, 10s timeout)
- `restConnector` — generic parameterized REST calls against a configured `baseUrl` + bearer token (15s timeout)
- `githubConnector` — GitHub REST (`repo.get`, `issues.list`) via `https://api.github.com`, bearer token from connector config
- This is the extension point for adding new SaaS integrations (chat/CRM/ERP/cloud) — new connectors register here, not as ad-hoc fetch calls elsewhere

## Data Storage

**Databases:**
- **PostgreSQL** (primary, production target across all three backends):
  - AgentOS: `DATABASE_URL` (defaults to `sqlite:///./agentos.db` locally; `app/db.py` auto-normalizes Heroku/Railway-style `postgres://` URLs to `postgresql+psycopg2://`); root `docker-compose.yml` uses `pgvector/pgvector:pg16` image (vector search extension) on port `5433:5432`; AgentOS's own `docker-compose.yml` (inside `agentos/`) uses plain `postgres:17-alpine` on `5432:5432` — **two different compose files define Postgres differently; do not run both simultaneously without adjusting ports**
  - Platform kernel (`apps/studio/platform`): `pg` (node-postgres) + `kysely` (typed SQL query builder) — separate connection path from Prisma
  - Shared schema (`packages/database/prisma/schema.prisma`): `datasource db { provider = "postgresql", extensions = [pgvector, pgcrypto] }` — 114 Prisma models covering `Tenant`, `Workspace`, `User`, `TenantMember`, `Role`/`Permission`, `APIKey`, `Session`, `AuditLog`, `FeatureFlag`, `Environment`, `Agent`/`AgentVersion`/`AgentCapability`, `Tool`/`ToolVersion`, `PromptTemplate`, `KnowledgeSource`/`KnowledgeCollection`, `Memory`/`MemorySnapshot`, `AgentExecution`, `AgentConversation`/`AgentMessage`, `Workflow`/`WorkflowVersion`/`WorkflowNode`/`WorkflowEdge`/`WorkflowExecution`/`WorkflowRun`, `Trigger`, `Schedule`, `Event`, and more
  - ORM/Client: Prisma Client 5.22 (`@prisma/client`) for `forge-api` and `packages/database`/`packages/domain`; SQLAlchemy 2.x for AgentOS; `pg`+`kysely` for the platform kernel — **three different DB access layers against related but separately-defined schemas**, worth reconciling before CerebroBuild adds new persistent state

- **SQLite** — AgentOS local-dev default (`agentos.db`, `test_agentos.db` files present in `apps/studio/agentos/`), zero-config offline mode

**Vector/Similarity Search:**
- `pgvector` extension enabled in both the root Postgres image and the Prisma schema — used for embeddings/similarity search (Memory Engine, Knowledge/RAG retrieval)
- AgentOS also supports naive local (in-process) embedding similarity when no pgvector-backed store is configured (per `agentos/README.md`)

**File Storage:**
- MinIO (S3-compatible object storage) — `apps/studio/agentos/app/core/storage/file_service.py`, client via `minio>=7.2`; configured through `MINIO_ENDPOINT`/`MINIO_ACCESS_KEY`/`MINIO_SECRET_KEY`/`MINIO_SECURE` settings; also provisioned in root `docker-compose.yml` (ports `9000` S3 API / `9001` console); **not required for local dev** — this is the production swap-in for local disk

**Caching / Queues:**
- Redis — used by:
  - `apps/studio` (`ioredis`, `bullmq`) — job queues
  - `apps/studio/platform` (`ioredis`, `bullmq`) — job queues in the platform kernel
  - AgentOS `Settings.redis_url`/`redis_password` (declared in config but not clearly wired into a router yet — check `app/core/` for actual usage before assuming it's active)
  - Root `docker-compose.yml` provisions `redis:7-alpine` with password auth (`REDIS_PASSWORD`)

## Event Bus / Messaging

**NATS JetStream:**
- AgentOS: `app/core/nats/bus.py` (`NATSEventBus`), client `nats-py>=2.7`; connected conditionally in `app/main.py` lifespan **only if `NATS_URL` is set** — falls back to in-process async pub/sub (`app/core/event_bus.py`) otherwise
- Platform kernel (`apps/studio/platform`): `nats` npm package 2.29.3, used directly (`src/kernel/events/events.ts` defines `Subjects`/`EventBus`)
- `packages/events`: dedicated shared TS package wrapping `nats` 2.29.3, depends on `@cerebro/database` and a referenced-but-unresolved `@cerebro/core-bus` package (not found under `packages/` — verify before relying on `@cerebro/events`)
- Root `docker-compose.yml` provisions `nats:2.10-alpine` with `--jetstream` (ports `4222` client / `8222` monitoring)

**Search (OpenSearch):**
- AgentOS: `app/core/search/hybrid_search.py`, client `opensearch-py>=2.7`, configured via `OPENSEARCH_URL`/`OPENSEARCH_USER`/`OPENSEARCH_PASSWORD` — optional, for hybrid lexical+semantic search alongside pgvector
- Root `docker-compose.yml` provisions `opensearchproject/opensearch:2.12.0` + `opensearch-dashboards:2.12.0` (ports `9200` API, `9600` perf, `5601` dashboards)
- `packages/search` exists as an empty placeholder (no `package.json` yet)

## Authentication & Identity

**AgentOS (`apps/studio/agentos`):**
- Primary/default: **API-key bearer auth** — `app/security.py` (`get_current_api_key`), keys minted via `POST /auth/api-keys`, stored in `APIKey` SQLAlchemy model (`app/models/identity.py`), scoped to an `Organization` (multi-tenant)
- Key issuance gate: `require_admin_secret` — no-op if `AGENTOS_ADMIN_SECRET` unset (local dev), else requires `X-Admin-Secret` header matching the configured secret (`hmac.compare_digest`)
- Production swap-in path (partially implemented): **Keycloak OIDC** — `app/platform/auth/keycloak.py` (`PlatformUser` class), validates Bearer JWTs against Keycloak's JWKS endpoint, extracts `roles`/`org_id`/`user_id` claims; falls back to API-key auth when `KEYCLOAK_URL` is unset; settings: `keycloak_url`, `keycloak_realm` (default `cerebrohive`), `keycloak_client_id` (default `cerebrohive-platform`), `keycloak_client_secret`
- JWT signing/validation libs: `pyjwt[crypto]>=2.9`, `cryptography>=43.0`
- Root `docker-compose.yml` provisions `quay.io/keycloak/keycloak:24.0` (dev mode, backed by the shared Postgres `keycloak` schema)

**Next.js frontend (`apps/studio`):**
- Root `.env.example` declares `NEXTAUTH_SECRET`/`NEXTAUTH_URL` (NextAuth/Auth.js pattern), though no `next-auth` dependency was found in `apps/studio/package.json` — verify whether this env var is legacy/unused or auth is implemented via `packages/auth` instead
- `packages/auth` (`@cerebro/auth`) — custom React auth package: `src/contexts/AuthContext.tsx`, `src/providers/MockAuthProvider.tsx`, `src/hooks/`, `src/interfaces/` — suggests a provider-pattern auth abstraction with a mock implementation for dev/tests; only React as a runtime dependency, no SDK for a specific identity provider bundled here
- `bcryptjs` present in `apps/studio` dependencies — password hashing, implying at least one credentials-based auth path exists somewhere in the app

**Platform kernel (`apps/studio/platform`):**
- `src/kernel/identity/` module present (not deep-dived) — likely mirrors the AgentOS API-key/JWT pattern for this separate Fastify service

## Governance / Policy

- AgentOS: YAML-based policy-as-code engine (`app/core/governance_engine.py`), rule file path via `AGENTOS_POLICY_FILE` (default `./agentos_policies.yaml`); documented production swap-in is **Open Policy Agent (OPA)** — not yet integrated, same rule shapes planned
- Audit logging: `GET /governance/audit-log` (AgentOS), `AuditLog` Prisma model (shared schema)

## Monitoring & Observability

**Tracing/Metrics:**
- OpenTelemetry — AgentOS (`opentelemetry-api`/`sdk>=1.27`, `opentelemetry-instrumentation-fastapi`) and `packages/telemetry` (`@opentelemetry/sdk-node`, `auto-instrumentations-node`, `exporter-trace-otlp-grpc`) — OTLP gRPC export target is environment-configured, no specific vendor (e.g., Honeycomb/Datadog) hardcoded in code inspected
- AgentOS also has its own structured trace/metric tables + query API (`app/core/observability.py`, `GET /observability/summary` — p50/p95/p99 latency, error rate, cost/token totals) — self-hosted observability independent of OTel export
- Platform kernel: `pino` (structured JSON logging) + `src/kernel/telemetry/`

**Error Tracking:**
- No Sentry/Bugsnag/Rollbar dependency found in any `package.json` or `requirements.txt` inspected — not currently integrated

**Logs:**
- AgentOS: Python `logging` module, `configure_logging()` in `app/middleware.py`; `AccessLogMiddleware` for request logging
- Platform kernel / contentops: `pino` / `winston` respectively (structured JSON loggers)

## CI/CD & Deployment

**Hosting:**
- Website (`apps/studio`, likely `apps/forge`): **Vercel** (`vercel.json` — `framework: nextjs`, env `NEXT_PUBLIC_API_URL` placeholder "TO_BE_PROVIDED_BY_VERCEL_DASHBOARD"); note `vercel.json` uses `npm run build`/`npm install`, diverging from the pnpm/Turborepo path used elsewhere
- Alternate/secondary deploy paths present via GitHub Actions: `.github/workflows/ftp-deploy.yml` and `ssh-deploy.yml` — suggests a traditional VPS/shared-hosting deployment target in addition to (or instead of) Vercel for some environment
- AgentOS backend: standalone Dockerized deploy, documented for **Railway**, **Render**, and **Fly.io** in `apps/studio/agentos/DEPLOY.md` — each needs `DATABASE_URL` (managed Postgres), `AGENTOS_ADMIN_SECRET`, `AGENTOS_ALLOWED_ORIGINS`, optional `ANTHROPIC_API_KEY`
- `services/forge-api`: containerized (`services/forge-api/Dockerfile`), referenced in root `docker-compose.yml` on port `4005`

**CI Pipeline:**
- GitHub Actions (`.github/workflows/ci.yml`) — pnpm install, Prisma generate, `tsc --noEmit` (studio only), lint (non-blocking), build, upload artifacts
- `.github/workflows/security-scan.yml` — present, not inspected in depth; likely runs `gitleaks` given `.gitleaks.toml` at repo root
- `.github/workflows/deployment-status.yml`, `pr-automation.yml` — deployment/PR automation, not build-critical
- `.pre-commit-config.yaml` present at root — pre-commit hooks configured (likely includes secret scanning given `.gitleaks.toml`)

## Environment Configuration

**Root site (`.env` / `.env.example`):**
`DATABASE_URL`, `REDIS_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `AI_PROVIDER`, `AI_MODEL_ID`, `FORGE_API_PORT`, `NEXT_PUBLIC_FORGE_API_URL`, `FORGE_DEFAULT_WORKSPACE_ID`

**AgentOS (`apps/studio/agentos/.env` / `.env.example`):**
`DATABASE_URL`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `OLLAMA_BASE_URL`, `AGENTOS_JWT_SECRET`, `AGENTOS_ADMIN_SECRET`, `AGENTOS_ALLOWED_ORIGINS`, `AGENTOS_POLICY_FILE`
Additional settings supported by `app/config.py` but not documented in `.env.example` (undocumented but functional): `GOOGLE_API_KEY`, `KEYCLOAK_URL`/`KEYCLOAK_REALM`/`KEYCLOAK_CLIENT_ID`/`KEYCLOAK_CLIENT_SECRET`, `NATS_URL`, `MINIO_ENDPOINT`/`MINIO_ACCESS_KEY`/`MINIO_SECRET_KEY`/`MINIO_SECURE`, `OPENSEARCH_URL`/`OPENSEARCH_USER`/`OPENSEARCH_PASSWORD`, `REDIS_URL`/`REDIS_PASSWORD`, `AGENT_STORE_DIR`, `AGENTOS_ENVIRONMENT`, `AGENTOS_MAX_BODY_BYTES`, `AGENTOS_REQUEST_TIMEOUT_SECONDS`

**Root Docker Compose stack env vars:** `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB`, `REDIS_PASSWORD`, `OPENSEARCH_PASSWORD`, `MINIO_ACCESS_KEY`/`MINIO_SECRET_KEY`, `KEYCLOAK_ADMIN`/`KEYCLOAK_ADMIN_PASSWORD`, `PGADMIN_DEFAULT_EMAIL`/`PGADMIN_DEFAULT_PASSWORD`, `AI_PROVIDER`, `AI_MODEL_ID`

**GitHub integration:** `GITHUB_PAT`, `GITHUB_WEBHOOK_SECRET` (used in `apps/studio/lib/github/client.ts`)

**contentops:** LinkedIn OAuth credentials — see `services/contentops/CREDENTIALS_SETUP.md` for the specific variable names (not enumerated here; file not read in this pass)

**Secrets location:**
- `.env` files exist at repo root and inside `apps/studio/agentos/` (both git-ignored per standard convention; contents not read for this analysis)
- `.gitleaks.toml` (root) + `.pre-commit-config.yaml` indicate secret-scanning is part of the local dev workflow — treat any new integration credentials accordingly (never commit real keys, always add new secret patterns to `.gitleaks.toml` if introducing a new provider)
- No dedicated secrets-manager (Vault, AWS Secrets Manager) integration found in code — all secrets currently flow through plain env vars

## Webhooks & Callbacks

**Incoming:**
- GitHub webhooks — signature-verified via `verifyWebhookSignature()` in `apps/studio/lib/github/client.ts` (uses `@octokit/webhooks-methods`); the actual receiving route handler was not located in this pass — search `apps/studio/app/api/` for the webhook endpoint before building on it
- LinkedIn OAuth callback — `services/contentops/src/auth/linkedin-oauth.ts` implements the OAuth flow (token exchange), implying a callback URL is registered with LinkedIn's developer console

**Outgoing:**
- `webhookConnector` (`apps/studio/platform/src/domains/connect/connect.ts`) — generic outbound webhook dispatch (POST JSON to any configured URL) is a first-class primitive in the platform kernel's connector framework — this is likely the mechanism CerebroBuild should use/extend for any new outbound integration rather than writing bespoke `fetch()` calls
- GitHub — outbound issue comments/labels via Octokit (`updateIssueWithPMAnalysis` in `lib/github/client.ts`)

## Notes for CerebroBuild

- AgentOS's external integrations are **all optional and conditionally wired** (env-var-gated) — new CerebroBuild code should follow the same pattern (check `settings.<x>_url` before connecting, degrade gracefully) rather than assuming Postgres/NATS/OpenSearch/MinIO/Keycloak are present.
- There is no payment/billing provider (Stripe, etc.) integrated anywhere in the codebase — `app/platform/billing/` and the Prisma `billingPlan` field on `Tenant` are stubs/placeholders only.
- Three independent database access layers exist (SQLAlchemy in AgentOS, Prisma in `forge-api`/`packages/database`, `pg`+`kysely` in the platform kernel) against conceptually overlapping schemas — confirm which one (if any) CerebroBuild should extend, since AgentOS's SQLAlchemy models and the Prisma schema are **not** the same source of truth.
- The generic `Connector` framework in `apps/studio/platform/src/domains/connect/connect.ts` is the established extension point for wiring any new third-party service (chat/CRM/ERP/cloud/storage) into the platform kernel — prefer extending this over ad-hoc HTTP client code.

---

*Integration audit: 2026-07-23*
