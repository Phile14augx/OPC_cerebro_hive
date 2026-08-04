# External Integrations

**Analysis Date:** 2026-08-04

## APIs & External Services

**Large Language Models:**
- Anthropic Claude API - Primary AI provider via `@anthropic-ai/sdk 0.30.0`
  - Used in: `packages/ai-gateway`, `services/forge-api`, `apps/studio`
  - Models: claude-sonnet-4-6 (configurable via `AI_MODEL_ID` env var)
  - Auth: `ANTHROPIC_API_KEY` environment variable

- OpenAI API - Secondary AI provider via `openai 4.75.0`
  - Used in: `packages/ai-gateway`, `apps/studio` (@ai-sdk/openai 4.0.16)
  - Models: gpt-4o (configurable)
  - Auth: `OPENAI_API_KEY` environment variable

**Development & CI/CD:**
- GitHub API - Octokit integration via `@octokit/rest 22.0.1`
  - Features: Webhook verification (`@octokit/webhooks-methods 6.0.0`)
  - Used in: `apps/studio` for GitHub integration capabilities
  - Auth: `GITHUB_TOKEN` environment variable

- Vercel Functions - Serverless deployment via `@vercel/functions 3.7.5`
  - Used in: `apps/studio` for edge function capabilities

**Cloud Platforms:**
- AWS - Services accessed via `aws-amplify 6.19.0`
  - Auth: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` environment variables
  - Used for: Cloud infrastructure, potentially S3 (though MinIO is primary S3-compatible storage)

- Vercel - Implicit via Next.js deployment target

## Data Storage

**Relational Database:**
- PostgreSQL 16 (pgvector edition)
  - Connection: `DATABASE_URL` env var (format: postgresql://user:password@host:port/database)
  - Client: Prisma 5.22.0 (`@prisma/client`)
  - Extensions: pgvector (for embeddings), pgcrypto
  - Schema: `packages/database/prisma/schema.prisma`
  - Migrations: Prisma Migrate via `pnpm prisma:migrate`
  - Image: `pgvector/pgvector:pg16` (docker-compose)

**Cache & Session Store:**
- Redis 7+ (docker-compose: redis:7-alpine)
  - Connection: `REDIS_URL` env var (format: redis://:password@host:port)
  - Client: ioredis 5.11.1
  - Usage: Job queue backend (BullMQ), session storage, cache layer
  - Auth: `REDIS_PASSWORD` environment variable (default: redispassword123)

**Search Engine:**
- OpenSearch 2.12.0 (docker-compose)
  - Endpoint: http://localhost:9200
  - Dashboard: OpenSearch Dashboards 2.12.0 at :5601
  - Auth: Basic auth with admin/password
  - Usage: Full-text search, analytics

**File Storage:**
- MinIO (S3-compatible) - docker-compose: minio/minio:latest
  - Endpoint: http://localhost:9000 (API), :9001 (Console)
  - Credentials: MINIO_ACCESS_KEY, MINIO_SECRET_KEY env vars
  - Usage: Object storage for assets, documents, models
  - Local filesystem fallback in development

## Authentication & Identity

**Auth Provider:**
- Keycloak 24.0 (OIDC/OAuth2)
  - Connection: `KEYCLOAK_URL` env var (http://localhost:8080)
  - Realm: `KEYCLOAK_REALM` (default: "cerebro")
  - Client ID: `KEYCLOAK_CLIENT_ID` (default: "cerebro-gateway")
  - Web Client: `KEYCLOAK_CLIENT_ID` for frontend (default: "cerebro-web")
  - Admin: `KEYCLOAK_ADMIN` and `KEYCLOAK_ADMIN_PASSWORD` env vars
  - Database: Backed by PostgreSQL (shared db instance)
  - Docker image: quay.io/keycloak/keycloak:24.0

**JWT Token Handling:**
- jose 6.2.3 - Token creation and verification in auth service
- Implementation: `packages/auth` with server and React exports
- Secret: `NEXTAUTH_SECRET` environment variable (NextAuth.js legacy support)

**Session Management:**
- Session data stored in database via Prisma ORM
- Session model: User and Session tables in database schema

## Monitoring & Observability

**Tracing & Metrics:**
- OpenTelemetry Collector 0.96.0 (optional observability profile)
  - Config: `infra/docker/otel/otel-collector-config.yaml`
  - Endpoints: OTLP gRPC (:4317), OTLP HTTP (:4318), Prometheus (:8889)
  - Env vars: `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_SERVICE_NAME`, `OTEL_RESOURCE_ATTRIBUTES`, `OTEL_TRACES_SAMPLER`, `OTEL_TRACES_SAMPLER_ARG`

**Metrics:**
- Prometheus 2.50.1 (optional, requires "obs" profile)
  - Used for: Metrics scraping and storage

**Logs:**
- Loki (optional, requires "obs" profile)
  - Log aggregation and querying via Grafana

**Distributed Tracing:**
- Tempo (optional, requires "obs" profile)
  - Trace storage and visualization

**Dashboards:**
- Grafana (optional, requires "obs" profile)
  - Unified monitoring dashboard

**Error Tracking:**
- Sentry (referenced in turbo.json via `NEXT_PUBLIC_SENTRY_DSN`)
  - Frontend error tracking for web applications
  - Optional integration for error reporting

**Feature Flags:**
- Flagd (referenced in turbo.json via `NEXT_PUBLIC_FLAGD_URL`)
  - Feature flag management service

**Analytics:**
- PostHog (referenced in turbo.json via `NEXT_PUBLIC_POSTHOG_KEY`)
  - Product analytics and session recording

## Message Bus & Events

**Event Streaming:**
- NATS JetStream 2.10
  - Server: docker-compose: nats:2.10-alpine
  - Port: 4222 (client connections), 8222 (monitoring HTTP)
  - Client: nats 2.29.3
  - Usage: Event bus, pub/sub messaging, durable streams
  - Features: Jetstream enabled for persistent queues

**Job Queue:**
- BullMQ 5.80.9 with Redis backend
  - Used in: `apps/studio`, various services
  - Storage: Redis (shared REDIS_URL)
  - Concurrent job processing

## Workflow & Orchestration

**Workflow Engine:**
- Temporal.io 1.24.2 (docker-compose: temporalio/auto-setup:1.24.2)
  - Server: localhost:7233
  - UI: Temporal UI 2.27.1 at localhost:8081
  - Database: PostgreSQL (shared db instance)
  - Client: @temporalio/client 1.11.7
  - Configuration: `TEMPORAL_HOST` env var (localhost:7233)
  - Worker concurrency: `WORKER_CONCURRENCY` env var (default: 20)

**Durable Execution:**
- Implementation: `packages/runtime-core/src/execution/`
  - ExecutionManager - Orchestrates execution flow
  - ExecutionReplayService - Handles deterministic replay
  - ExecutionIdempotencyGuard - Ensures idempotent operations
  - ExecutionOutbox - Transactional outbox for event publishing

## CI/CD & Deployment

**Hosting:**
- Docker/Kubernetes deployment
  - Standalone Next.js output: `output: "standalone"` in next.config.ts
  - Multi-stage builds for minimal container size
  - Dockerfile: `Dockerfile.web` and service-specific Dockerfiles

**GitHub Actions (CI):**
- Workflows: `.github/workflows/` directory
- Infrastructure automation: `infrastructure.yml`
- Build pipeline: `ci.yml` (including TypeScript, ESLint, Trivy security scanning)

**Environment Configuration:**
- `STATIC_EXPORT=true` - GitHub Pages static deployment (no server, no API routes)
- `GITHUB_ACTIONS=true` - CI detection
- `IS_FTP_DEPLOY` - FTP deployment detection
- `NODE_ENV` - Development/production mode

## External Tool Integrations

**Installed but Configurable:**
- Jira - Credentials via `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_KEY` env vars
- Slack - Bot token via `SLACK_BOT_TOKEN` env var
- Serper (Search API) - Key via `SERPER_API_KEY` env var

**Internal Service URLs (Service Mesh):**
- Platform Service (Java): `PLATFORM_SVC_URL` (http://localhost:8081)
- Academy Service (Java): `ACADEMY_SVC_URL` (http://localhost:8082)
- CRM Service (Java): `CRM_SVC_URL` (http://localhost:8083)
- ML gRPC Service (C++): `ML_SVC_GRPC_URL` (http://localhost:50051)

## Webhooks & Callbacks

**Incoming:**
- GitHub Webhooks - Verified via @octokit/webhooks-methods
  - Used in: `apps/studio` for GitHub integration
  - Handler: Webhook verification and processing endpoints

**Outgoing:**
- Domain Event Publishing - Via ExecutionOutbox and OutboxPublisher
  - Transactional outbox pattern for reliability
  - Event storage: Database (Prisma ORM)
  - Event bus: NATS JetStream for async consumption

**API Gateway:**
- Rust Gateway (planned, referenced in .env.example)
  - Host: `GATEWAY_HOST` env var (0.0.0.0)
  - Port: `GATEWAY_PORT` env var (8900)
  - Rate limiting: `RATE_LIMIT_RPS` (100), `RATE_LIMIT_BURST` (200)
  - CORS: `ALLOWED_ORIGINS` env var

## Multi-Provider AI Gateway

**Architecture:**
- Location: `packages/ai-gateway/`
- Main interface: `createGateway()` function
- Providers implemented: Anthropic, OpenAI
- Provider registry: Selectable via `AI_PROVIDER` env var ("anthropic" | "openai" | "mock")
- Features:
  - Circuit breaker pattern for resilience
  - Rate limiting
  - Response caching
  - Tool calling support (standardized format)
  - Stream handling
  - Cost calculation and token estimation

**Configuration:**
- Primary provider: `AI_PROVIDER` env var
- Model selection: `AI_MODEL_ID` env var
- Fallback: Mock provider for testing/offline mode

---

*Integration audit: 2026-08-04*
