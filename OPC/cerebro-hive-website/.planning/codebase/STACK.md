# Technology Stack

**Analysis Date:** 2026-08-04

## Languages

**Primary:**
- TypeScript 5.6.0+ - Used across all packages, apps, and services
- JavaScript/Node.js - Runtime scripts and configuration files

**Secondary:**
- Go - Gateway, swarm runtime, tool gateway, memory service, router service (defined in .env.example)
- Python - Planner service, learning service, evaluation service (defined in .env.example)
- Rust - API Gateway (defined in .env.example)
- Java - Platform SVC, Academy SVC, CRM SVC (defined in .env.example)
- C++ - ML gRPC service (defined in .env.example)

## Runtime

**Environment:**
- Node.js >= 22.0.0 (as specified in root `package.json` engines)
- Platform: Docker/Kubernetes deployment capable (multi-stage builds, standalone output)

**Package Manager:**
- pnpm >= 9.0.0, currently 9.15.0
- Lockfile: `pnpm-lock.yaml` present
- Workspace managed via `pnpm-workspace.yaml`

## Frameworks

**Core Frontend:**
- Next.js 16.2.10 - Server-side rendering, static generation, API routes
- React 19.2.4 - UI framework for all frontend applications

**Backend APIs:**
- Fastify 4.26.2 - Lightweight HTTP server (`@cerebro/platform-api`)
- NestJS 10.0.0 - Full-featured backend framework for forge-api and other services
- Express 4.19.2 - Used in auth middleware

**Workflow & Orchestration:**
- Temporal.io 1.24.2 - Workflow engine (temporal-ui 2.27.1, @temporalio/client 1.11.7)
- NATS JetStream 2.10 - Event bus and message streaming

**ORM & Database:**
- Prisma 5.22.0 - Database ORM and migration tool
- PostgreSQL 16 (pgvector extension) - Primary relational database

**Testing:**
- Vitest 3.2.4+ - Unit/integration testing
- Jest 29.7.0 - Testing framework (forge-api, other NestJS services)
- Playwright 1.61.1+ - End-to-end testing (studio app)

**Build & Task Running:**
- Turbo 2.0.0 - Monorepo build orchestration with task caching
- TypeScript 5.6.0 - Type checking and compilation

**Frontend UI & Visualization:**
- React Three Fiber 9.6.1 - 3D graphics with Three.js
- XYFlow 12.11.2 - Workflow/DAG visualization
- Framer Motion 12.42.2 - Animation library
- React Query (@tanstack/react-query 5.101.4) - Server state management
- Zustand 5.0.14 - Client state management
- Radix UI 1.6.6 - Headless component library
- Tailwind CSS 4.0+ - Utility-first CSS framework
- Monaco Editor 4.7.0 - Code editor component
- Lucide React 1.25.0 - Icon library

**Code Quality & Formatting:**
- ESLint 9.0.0 - Linting with TypeScript support (@typescript-eslint/eslint-plugin 8.0.0)
- Prettier 3.0.0 - Code formatter with import organization plugin
- Dependency Cruiser 18.1.0 - Architecture validation and circular dependency detection

## Key Dependencies

**Critical:**
- @anthropic-ai/sdk 0.30.0 - Anthropic Claude LLM API client
- openai 4.75.0 - OpenAI API client for GPT models
- @prisma/client 5.22.0 - Database client generated from schema
- fastify 4.26.2 - Backend HTTP server
- next 16.2.10 - Next.js framework (frontend SSR)

**AI & Gateway:**
- @cerebro/ai-gateway (workspace) - Internal AI provider abstraction layer
- @cerebro/ai (workspace) - AI service implementations
- @cerebro/agent-builder-capability (workspace) - Agent creation and management

**Infrastructure & Messaging:**
- ioredis 5.11.1 - Redis client for caching and job queues
- bullmq 5.80.9 - Job queue library using Redis backend
- nats 2.29.3 - NATS client for JetStream event bus
- @temporalio/client 1.11.7 - Temporal workflow client

**Authentication & Security:**
- jose 6.2.3 - JWT token handling
- bcryptjs 3.0.3 - Password hashing
- @cerebro/auth (workspace) - Custom auth service with Keycloak integration

**Client & API:**
- @octokit/rest 22.0.1 - GitHub API client for webhook integration
- @octokit/webhooks-methods 6.0.0 - GitHub webhook verification
- aws-amplify 6.19.0 - AWS Amplify for auth and cloud services
- @vercel/functions 3.7.5 - Vercel serverless functions support

**Data & Serialization:**
- zod 3.25.76 - TypeScript-first schema validation
- gray-matter 4.0.3 - YAML frontmatter parsing for MDX

**Utility Libraries:**
- uuid 11.0.5 - UUID generation
- date-fns 4.4.0 - Date manipulation
- class-validator 0.14.0 - Decorator-based validation
- class-transformer 0.5.1 - Object transformation

## Configuration

**Environment:**
- Primary: `.env` file (containing DATABASE_URL, REDIS_URL, API keys)
- Example: `.env.example` documents all required variables
- Development: Optional `.env.local` or `.env.development`
- Testing: `.env.test` for test environment (referenced in root package.json)
- Build-time: `NEXT_PUBLIC_*` variables inlined into frontend bundle

**Build Configuration:**
- `turbo.json` - Turbo monorepo task configuration
- `tsconfig.base.json` - Shared TypeScript configuration
- `tsconfig.json` - Root TypeScript configuration
- `tsconfig.nextjs.json` - Next.js specific TypeScript config
- `next.config.ts` - Next.js build configuration with static export support
- `postcss.config.mjs` - PostCSS configuration for Tailwind
- `.eslintrc.base.json` - Base ESLint configuration
- `.eslintrc.eda.json` - EDA-specific linting rules
- `.prettierrc.json` - Prettier formatting configuration
- `.prettierignore` - Prettier ignore patterns

**Development Containers:**
- `docker-compose.yml` - Full local stack with 20+ services

## Platform Requirements

**Development:**
- Node.js 22.0.0 or higher
- pnpm 9.0.0 or higher
- Docker & Docker Compose (for local database, cache, services)
- Recommended: VS Code with TypeScript support, ESLint extension

**Production:**
- Deployment target: Docker/Kubernetes
- Container runtime: Linux-based (Node.js 22+)
- Services: PostgreSQL 16+, Redis 7+, NATS 2.10+, Temporal, Keycloak, OpenSearch, MinIO
- CDN-ready frontend (Next.js standalone/static output modes)

**Database:**
- PostgreSQL 16 with pgvector extension (embeddings) and pgcrypto extensions
- Connection pooling via Prisma
- Schema migrations with Prisma Migrate

**Message Queue & Events:**
- Redis 7+ for job queues (BullMQ)
- NATS 2.10+ with JetStream for event streaming

**Observability Stack (Optional):**
- OpenTelemetry Collector 0.96.0
- Prometheus 2.50.1
- Grafana
- Loki (log aggregation)
- Tempo (distributed tracing)

---

*Stack analysis: 2026-08-04*
