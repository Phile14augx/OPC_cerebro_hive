# Technology Stack

**Analysis Date:** 2026-07-23

## Repository Shape

This is a pnpm/Turborepo monorepo (`cerebro-hive-os`) with three kinds of workspaces, declared in `pnpm-workspace.yaml` (`apps/*`, `packages/*`, `services/*`):

- **`apps/*`** — Next.js frontends. Only two are actually implemented: `apps/studio` (the main CerebroHive marketing/product site, App Router) and `apps/forge` (a smaller Next.js app, App Router). `apps/archive`, `apps/flow`, `apps/insight`, `apps/ops`, `apps/search` exist as **empty directories** (workspace placeholders for planned product frontends — not yet scaffolded).
- **`apps/studio/agentos/`** — the Python/FastAPI backend (AgentOS runtime). This is the target for the CerebroBuild capability work. It is a standalone service (its own `requirements.txt`, `Dockerfile`, `.venv`), not a pnpm workspace member, physically nested inside the `studio` Next.js app directory but operationally independent.
- **`packages/*`** — shared TypeScript libraries (`@cerebro/*` scope): `ai`, `api-client`, `auth`, `config`, `contracts`, `database`, `domain`, `events`, `icons-*` (7 icon packages), `sdk`, `search`, `storage`, `telemetry`, `ui`, `workflow`. Several (`api-client`, `search`, `storage`) are empty stubs with no `package.json` yet.
- **`services/*`** — standalone Node/TS backend services: `forge-api` (NestJS, implemented), `contentops` (implemented, content publishing pipeline). `archive-api`, `gateway-api`, `hiveops-api`, `identity-api`, `search-api` are **empty placeholder directories**.

## Languages

**Primary:**
- TypeScript 5.x — all Next.js apps (`apps/studio`, `apps/forge`) and shared `packages/*`
- Python 3.12 — AgentOS backend (`apps/studio/agentos/`), pinned via `apps/studio/agentos/Dockerfile` (`python:3.12-slim`); no `.python-version`/`pyproject.toml` present, dependency floor set by `requirements.txt` (`>=` pins, no lockfile)

**Secondary:**
- JavaScript — build/tooling scripts at repo root (`_shot*.js`, `refactor_theme.ts` is TS, `populate.py` is Python)
- SQL — Prisma schema (`packages/database/prisma/schema.prisma`), Alembic migrations under `apps/studio/agentos` (via `alembic>=1.13` dependency)

## Runtime

**Node.js:**
- Required `>=20.0.0` (`package.json` → `engines`)
- CI pins Node 20 (`.github/workflows/ci.yml`)

**Python:**
- 3.12 (Docker base image for AgentOS)
- No virtualenv lock file; dependencies resolved from `requirements.txt` floor pins at install time — **no `requirements-lock.txt`/`poetry.lock` present**, a reproducibility gap worth knowing before extending this service

**Package Manager (JS/TS):**
- pnpm 9 (`packageManager: "pnpm@9.0.0"` in root `package.json`; CI uses `pnpm/action-setup@v4` with `version: 9`)
- Lockfile: `pnpm-lock.yaml` present at root (workspace-wide)
- Note: `apps/studio` also has its own `package-lock.json` present alongside the pnpm lockfile — indicates npm was used there at some point; pnpm is the canonical manager per root config and CI.
- `services/forge-api` and other services likely install independently via workspace protocol (`workspace:*` deps observed).

**Package Manager (Python):**
- pip (`pip install -r requirements.txt`), no Poetry/uv in use.

## Monorepo Build Orchestration

**Turborepo:**
- Config: `turbo.json` (root)
- Tasks: `build` (depends on `^build`, outputs `.next/**`, `dist/**`), `lint`, `dev` (persistent, uncached), `test`, `generate` (uncached)
- `globalEnv` passthrough declared in `turbo.json`: `AI_PROVIDER`, `AI_MODEL_ID`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `FORGE_API_PORT`, `NEXT_PUBLIC_FORGE_API_URL`, `DATABASE_URL`, `REDIS_URL`, `NODE_ENV`
- Root scripts (`package.json`): `build`/`dev`/`lint`/`test` all delegate to `turbo <task>`; `format` runs `prettier --write` directly (not turbo-orchestrated)

**CI Pipeline (`.github/workflows/ci.yml`):**
1. Checkout → pnpm 9 setup → Node 20 setup (pnpm-cached)
2. `pnpm install --frozen-lockfile`
3. `pnpm --filter @cerebro/database exec prisma generate`
4. `pnpm --filter @cerebro/studio exec tsc --noEmit` (type check, studio only)
5. `pnpm run lint || true` (non-blocking)
6. `pnpm run build` (with `IS_FTP_DEPLOY=true`)
7. Upload build artifacts

Other workflows present: `deployment-status.yml`, `ftp-deploy.yml`, `pr-automation.yml`, `security-scan.yml`, `ssh-deploy.yml` (deployment/security automation, not build-critical).

## Frameworks

**Core (Frontend — `apps/studio`):**
- Next.js 16.2.10 (App Router) — `apps/studio/package.json`
- React 19.2.4 / React DOM 19.2.4
- Tailwind CSS 4 (`@tailwindcss/postcss`)
- Framer Motion 12, GSAP 3.15, Lenis (scroll), Three.js + `@react-three/fiber`/`drei`/`postprocessing` (3D)
- `@xyflow/react` + `dagre`/`elkjs` (flow/graph diagrams — likely used for workflow visualization)
- `@monaco-editor/react` (code editor)
- Vercel AI SDK (`ai` 7.x, `@ai-sdk/openai`)

**Core (Frontend — `apps/forge`):**
- Next.js ^14.0.0 (older major than `studio`'s Next 16 — version drift between apps)
- React ^18.2.0 (also older than `studio`'s React 19)
- Tailwind CSS ^3.0.0 (older major than `studio`'s Tailwind 4)
- Depends on workspace packages `@cerebro/ui`, `@cerebro/auth`

**Core (Backend — AgentOS, `apps/studio/agentos`):**
- FastAPI `>=0.115` — main web framework, modular-monolith style (see `app/main.py`)
- Uvicorn `[standard] >=0.32` — ASGI server
- SQLAlchemy `>=2.0` (ORM, declarative `Base` in `app/db.py`), Alembic `>=1.13` (migrations)
- Pydantic `>=2.9` + `pydantic-settings >=2.5` — request/response schemas and env-driven `Settings` (`app/config.py`)
- `slowapi >=0.1.9` — rate limiting (`app/rate_limit.py`)

**Backend — `services/forge-api` (NestJS):**
- NestJS 10 (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/swagger`, `@nestjs/config`, `@nestjs/event-emitter`)
- Prisma Client 5.22 (schema shared from `packages/database/prisma/schema.prisma`)
- `class-validator`/`class-transformer`, RxJS
- Depends on workspace packages `@cerebro/ai`, `@cerebro/database`, `@cerebro/workflow`

**Backend — `services/contentops`:**
- Plain TS/Node (`tsx` runtime, no framework) — Markdown-to-platform publishing pipeline
- `@anthropic-ai/sdk`, `chokidar` (file watch), `marked`, `node-cron`, `winston` (logging), `gray-matter`, `p-retry`

**Testing:**
- Frontend (`apps/studio`): Playwright (`@playwright/test`, `playwright.config.ts`), Vitest (`vitest.config.ts`, `vitest.shims.d.ts`) — both configured
- Backend (AgentOS): pytest `>=8.3` + `pytest-asyncio >=0.24`, tests under `apps/studio/agentos/tests/` (runs fully offline via mock LLM provider per README)
- `services/forge-api`: Jest (`test`/`test:watch` scripts)

**Build/Dev tooling:**
- ESLint 9 (flat config, `eslint.config.mjs` in `apps/studio`), `eslint-config-next` 16.2.10
- Prettier (root `format` script covers `**/*.{ts,tsx,md}`)
- Storybook (`.storybook/` at root)
- `ts-morph` (AST tooling, likely for the `audit:enterprise` scripts in `apps/studio`)
- `cross-env`, `@next/bundle-analyzer` (`analyze` script)

## Key Dependencies

**Critical (AgentOS / Python):**
- `anthropic >=0.34`, `openai >=1.52`, `google-genai >=0.2.0` — multi-provider LLM clients wired through `app/core/cerebro_x/gateway.py` (`CerebroXGateway`), with `tenacity >=9.0` for retries and `numpy >=1.26` for embedding math
- `pyjwt[crypto] >=2.9` + `cryptography >=43.0` — JWT validation, positioned for Keycloak JWKS verification (`app/platform/auth/keycloak.py`)
- `httpx >=0.27` — outbound HTTP (also used for async `TestClient` in tests)
- `pyyaml >=6.0` — governance policy files (YAML rule engine)
- `nats-py >=2.7` — NATS JetStream client (`app/core/nats/bus.py`), connected conditionally in `app/main.py` lifespan if `NATS_URL` is set
- `opensearch-py >=2.7` — OpenSearch client (`app/core/search/hybrid_search.py`)
- `minio >=7.2` — MinIO S3-compatible object storage client (`app/core/storage/file_service.py`)
- `opentelemetry-api`/`sdk >=1.27` + `opentelemetry-instrumentation-fastapi` — tracing/metrics export hooks

**Critical (JS/TS):**
- `zod` — schema validation, used across `apps/studio`, `packages/contracts`
- `@prisma/client` 5.22 — ORM client, shared schema at `packages/database/prisma/schema.prisma` (PostgreSQL + `pgvector`/`pgcrypto` extensions)
- `bullmq` + `ioredis` (in `apps/studio`) — Redis-backed job queues
- `jose` — JWT handling in `apps/studio` (frontend-side)
- `@octokit/rest`, `@octokit/webhooks-methods` — GitHub API + webhook signature verification (in `apps/studio`)

**Infrastructure packages:**
- `@cerebro/telemetry` — OpenTelemetry wrapper (`@opentelemetry/sdk-node`, auto-instrumentations, OTLP gRPC exporter)
- `@cerebro/events` — NATS-based event package (`nats` 2.29.3), depends on `@cerebro/core-bus` (referenced but not found as a top-level package — likely an unresolved/renamed dependency, worth checking before relying on it)
- `@cerebro/database` — Prisma client wrapper, single source of schema truth for all TS services
- `@cerebro/domain` — depends on `@cerebro/database` + Prisma client directly (domain/outbox layer per recent commits)

## Configuration

**Environment:**
- Root `.env` (present, not read — contains secrets) and `.env.example` (template) define: `DATABASE_URL`, `REDIS_URL`, `NEXTAUTH_SECRET`/`NEXTAUTH_URL`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `AI_PROVIDER`, `AI_MODEL_ID`, `FORGE_API_PORT`, `NEXT_PUBLIC_FORGE_API_URL`, `FORGE_DEFAULT_WORKSPACE_ID`
- AgentOS has its own `.env`/`.env.example` inside `apps/studio/agentos/` (separate env surface from the root site): `DATABASE_URL`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `OLLAMA_BASE_URL`, `AGENTOS_JWT_SECRET`, `AGENTOS_ADMIN_SECRET`, `AGENTOS_ALLOWED_ORIGINS`, `AGENTOS_POLICY_FILE`
- AgentOS `app/config.py` (`Settings` class, `pydantic-settings`) additionally exposes (not all in `.env.example` — supported but undocumented there): `keycloak_url`/`keycloak_realm`/`keycloak_client_id`/`keycloak_client_secret`, `nats_url`, `minio_endpoint`/`minio_access_key`/`minio_secret_key`/`minio_secure`, `opensearch_url`/`opensearch_user`/`opensearch_password`, `redis_url`/`redis_password`, `agent_store_dir`, `agentos_environment`, `agentos_max_body_bytes`, `agentos_request_timeout_seconds`
- `.env` files exist at repo root and inside `apps/studio/agentos/` — contents not read per policy; treat as containing live secrets

**Build:**
- `apps/studio/next.config.ts`, `apps/forge/next.config.mjs` — per-app Next.js config
- `apps/studio/tailwind.config.ts` (Tailwind 4), `apps/forge/tailwind.config.ts` (Tailwind 3)
- `apps/studio/tsconfig.json`, root has multiple `.tsbuildinfo` artifacts (`tsconfig.tsbuildinfo`, `tsconfig.scoped3.tsbuildinfo`, `tsconfig.scoped4.tsbuildinfo`, `tsconfig.sitemap.json`) suggesting scoped/partial type-check passes are used, likely for the `audit:enterprise` tooling
- `vercel.json` — Next.js framework, `npm run build`/`npm install` as build/install commands (note: this diverges from the pnpm-based root scripts; Vercel deploy path may bypass Turborepo orchestration)
- AgentOS: `apps/studio/agentos/Dockerfile` (Python 3.12-slim base), `apps/studio/agentos/docker-compose.yml` (Postgres 17 + Redis + agentos service, standalone from root compose)

## Platform Requirements

**Development:**
- Node.js >=20, pnpm 9
- Python 3.12 + virtualenv for AgentOS (`python3 -m venv .venv`)
- AgentOS runs fully offline by default: SQLite (`agentos.db`) + mock LLM provider, zero external services/API keys required
- Root `docker-compose.yml` brings up the full "production-like" local stack: Postgres+pgvector, Redis, NATS JetStream, OpenSearch + Dashboards, MinIO, Keycloak, pgAdmin, and `forge-api`

**Production:**
- Website (`apps/studio` and likely `apps/forge`): deployed via Vercel (`vercel.json`, `NEXT_PUBLIC_API_URL` env var placeholder) — also has FTP/SSH deploy GitHub Actions workflows (`ftp-deploy.yml`, `ssh-deploy.yml`), suggesting a secondary/alternate hosting target beyond Vercel
- AgentOS backend: deployed as a standalone Dockerized service — `apps/studio/agentos/DEPLOY.md` documents Railway, Render, and Fly.io as supported targets, each needing `DATABASE_URL` (managed Postgres), `AGENTOS_ADMIN_SECRET`, `AGENTOS_ALLOWED_ORIGINS`, and optionally `ANTHROPIC_API_KEY`
- `services/forge-api`: containerized via `services/forge-api/Dockerfile`, orchestrated in root `docker-compose.yml` on port 4005, depends on Postgres + Redis health checks

## Notes for CerebroBuild (layering on `apps/studio/agentos`)

- The AgentOS backend is a **single FastAPI modular monolith** (`app/main.py`), not microservices — new capability code should live under a new `app/<domain>/` module (following the pattern of `app/finance/`, `app/archive/`, `app/platform/`) with its own `router.py`, `models.py`, and be wired into `app/main.py`'s `include_router` calls plus `app/db.py`'s `init_db()` model imports.
- The `app/core/capabilities/registry.py` module (`CapabilityRegistry`, `CapabilityMetadata`) already implements a lightweight IoC-container pattern for capability registration/health/versioning — check this before building a parallel registry for CerebroBuild.
- Production infra (NATS, OpenSearch, MinIO, Keycloak, OPA, Temporal, Kubernetes) is **interface-stubbed, not deployed** in the MVP — `app/config.py` settings for these exist and are wired conditionally (e.g., NATS only connects if `nats_url` is set in `app/main.py` lifespan), but the default local/dev path uses SQLite + in-process pub/sub + mock LLM with zero external dependencies.
- LLM access should go through `app/core/cerebro_x/gateway.py` (`CerebroXGateway.complete`/`acomplete`), which already handles the OpenAI → Anthropic → Gemini → Ollama → Mock fallback chain — do not call provider SDKs directly from new capability code.

---

*Stack analysis: 2026-07-23*
