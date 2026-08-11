# Codebase Structure

**Analysis Date:** 2026-08-04

## Directory Layout

```
cerebro-hive-website/
├── apps/                          # Deployable applications (workspaces)
│   ├── studio/                    # Frontend: Next.js marketing site + dashboard
│   │   ├── app/                   # Next.js App Router pages
│   │   ├── components/            # React Server/Client Components
│   │   ├── public/                # Static assets (images, fonts)
│   │   ├── scripts/               # Audit and utility scripts
│   │   └── package.json           # Next.js, React, workflow SDK, query
│   │
│   ├── platform-api/              # Backend: Fastify REST API
│   │   ├── src/
│   │   │   ├── bootstrap.ts       # Fastify setup, middleware, route registration
│   │   │   ├── server.ts          # Entry point, server start
│   │   │   ├── middleware/        # Hooks (auth, context, logging)
│   │   │   ├── modules/           # Feature routes grouped by domain
│   │   │   │   ├── agents/        # Agent API (create, list, execute, conversation)
│   │   │   │   ├── workflows/     # Workflow API
│   │   │   │   ├── runtime/       # Runtime execution API
│   │   │   │   ├── conversations/ # Agent conversations
│   │   │   │   ├── executions/    # Execution kernel API
│   │   │   │   ├── telemetry/     # Metrics and observability
│   │   │   │   └── health/        # Liveness/readiness probes
│   │   │   ├── errors/            # ErrorMapper (RFC 7807 Problem Details)
│   │   │   └── types/             # TypeBox schemas, TypeScript interfaces
│   │   └── package.json           # Fastify, TypeBox, Prisma
│   │
│   ├── forge/                     # Agent builder/development platform
│   ├── platform/                  # Enterprise platform (TBD)
│   └── pulse/                     # Analytics/metrics dashboard (TBD)
│
├── packages/                      # Reusable libraries (workspaces)
│   ├── ai-gateway/                # Unified AI provider abstraction
│   │   └── src/
│   │       ├── gateway.ts         # Main AIGateway class
│   │       ├── types.ts           # ChatRequest, ChatResponse, ProviderConfig
│   │       ├── providers/         # Provider implementations
│   │       │   ├── anthropic.provider.ts
│   │       │   ├── openai.provider.ts
│   │       │   └── base.provider.ts
│   │       ├── circuit-breaker.ts # Resilience pattern
│   │       ├── rate-limiter.ts    # Cost control
│   │       ├── cache.ts           # Response memoization
│   │       └── routing/           # Provider selection logic
│   │
│   ├── database/                  # Prisma ORM + repositories
│   │   ├── src/repositories/      # Aggregate roots (Agent, Workflow, etc.)
│   │   ├── src/transactions/      # Unit of Work pattern
│   │   ├── prisma/schema.prisma   # (symlink to root `prisma/schema.prisma`)
│   │   └── index.ts               # Prisma singleton, barrel exports
│   │
│   ├── domain/                    # Business logic & orchestration
│   │   ├── index.ts               # Orchestrators, aggregates
│   │   ├── ExecutionOrchestrator.ts
│   │   └── (execution-related types)
│   │
│   ├── runtime-core/              # Execution runtime engine
│   │   └── src/execution/
│   │       ├── kernel/            # ExecutionRuntimeKernel
│   │       ├── ExecutionStore.ts  # Execution persistence interface
│   │       └── ExecutionReplayService.ts
│   │
│   ├── core-bus/                  # Command/Event bus (CQRS dispatch)
│   │   └── src/
│   │       ├── CommandBus.ts      # Command dispatcher
│   │       └── EventBus.ts        # Event dispatcher
│   │
│   ├── auth/                      # Authentication & authorization
│   │   ├── src/
│   │   │   ├── jwt.ts             # JWT validation
│   │   │   ├── strategies/        # Auth strategies (RS256, HS256)
│   │   │   └── middleware.ts      # Express/Fastify middleware
│   │
│   ├── capabilities/              # Feature domains (sub-workspace)
│   │   ├── agent-builder/         # Agent construction & runtime
│   │   │   ├── src/
│   │   │   │   ├── AgentRuntimeService.ts
│   │   │   │   ├── services/      # Domain services
│   │   │   │   ├── ports/         # Interfaces (provider pattern)
│   │   │   │   ├── adapters/      # Implementations
│   │   │   │   └── types.ts       # Domain types
│   │   │   └── index.ts           # Barrel export
│   │   │
│   │   ├── workflow/              # Workflow orchestration
│   │   ├── knowledge/             # Knowledge graph, embeddings
│   │   ├── evaluation/            # Model evaluation, benchmarks
│   │   ├── deployment/            # Deployment management
│   │   └── memory/                # Memory engine (short/long-term)
│   │
│   ├── shared-types/              # Cross-cutting TypeScript types
│   ├── api-client/                # TypeScript SDK for platform API
│   ├── sdk/                       # Public SDK for external consumers
│   ├── workflow/                  # Workflow DSL & runtime (frontend + backend)
│   ├── agent-sdk/                 # Agent SDK for external consumers
│   │
│   ├── telemetry/                 # Observability & tracing
│   ├── telemetry-core/            # OpenTelemetry integration
│   ├── cache/                     # Cache layer (Redis backing)
│   ├── queue/                     # Message queue (NATS/BullMQ backing)
│   ├── config/                    # Configuration management
│   ├── contracts/                 # Domain contracts (types, interfaces)
│   ├── ui/                        # Shared React UI components
│   ├── tables/                    # Data table abstractions
│   ├── tokens/                    # Design tokens
│   └── (40+ others)               # Additional capability packages
│
├── services/                      # Microservices (long-running processes)
│   └── (TBD: worker services for async jobs)
│
├── app/                           # Next.js root layout (shared with apps/studio)
├── api/                           # API utilities (security, validators)
├── components/                    # Root-level shared components
├── lib/                           # Utilities and helpers
├── prisma/                        # Database schema
│   └── schema.prisma              # Prisma schema (single source of truth)
│
├── tests/                         # Integration & E2E tests
│   ├── integration/               # API integration tests
│   │   ├── vitest.config.ts       # Vitest config for integration suite
│   │   └── .env.test              # Test database URL, etc.
│   └── e2e/                       # Playwright end-to-end tests
│
├── architecture/                  # Architecture documentation
│   ├── manifesto/                 # 10-layer EIOS manifesto
│   ├── capabilities/              # Capability model registry
│   ├── reference/                 # Technical reference architectures
│   └── adrs/                      # Architectural Decision Records (ADRs)
│
├── infra/                         # Infrastructure as Code
│   ├── terraform/                 # Terraform modules (AWS, GCP, etc.)
│   ├── k8s/                       # Kubernetes manifests
│   ├── helm/                      # Helm charts
│   └── assurance/                 # Compliance & assurance automation
│
├── k8s/                           # Additional Kubernetes configs (legacy location)
├── nginx/                         # Nginx configuration
├── tools/                         # Development & tooling scripts
│   ├── arch/                      # Architecture verification tools
│   │   ├── check-architecture.mjs # Lint architecture
│   │   ├── gate-a/                # Gate A: self-tests
│   │   ├── gate-b/                # Gate B: semantics
│   │   └── gate-c/                # Gate C: controls
│   ├── harness/                   # Test harness CLI
│   └── assurance/                 # Assurance runner
│
├── scripts/                       # Monorepo automation scripts
│   ├── feature-start.mjs          # Start feature branch
│   ├── feature-finish.mjs         # Finish feature branch
│   ├── feature-complete.mjs       # Completion workflow
│   ├── repo-policy.mjs            # Repository policy enforcement
│   ├── repo-health.mjs            # Health check
│   └── check-sitemap.mjs          # Sitemap validation
│
├── .planning/                     # GSD planning outputs
│   └── codebase/                  # Codebase documentation
│       ├── ARCHITECTURE.md        # This file's sibling
│       ├── STRUCTURE.md           # This file
│       ├── STACK.md               # Technology stack
│       ├── INTEGRATIONS.md        # External integrations
│       ├── CONVENTIONS.md         # Coding conventions
│       ├── TESTING.md             # Testing patterns
│       └── CONCERNS.md            # Technical debt & issues
│
├── .github/                       # GitHub workflows & actions
│   ├── workflows/                 # CI/CD pipeline definitions
│   │   ├── build.yml              # Build, test, lint
│   │   ├── infrastructure.yml     # Infrastructure deployment
│   │   └── ci.yml                 # Primary CI workflow
│   └── modernize/                 # Modernization scripts
│
├── .claude/                       # Claude Code configuration
│   └── skills/                    # Project-specific skills (if present)
│
├── .turbo/                        # Turborepo cache
├── .next/                         # Next.js build output
├── .semgrep/                      # Semgrep security rules
├── .storybook/                    # Storybook configuration
├── node_modules/                  # Monorepo root dependencies
├── pnpm-workspace.yaml            # pnpm workspace definition
├── package.json                   # Root package.json (scripts, overrides)
├── tsconfig.json                  # Root TypeScript config
├── turbo.json                     # Turborepo config
├── .eslintrc.base.json            # Root ESLint config
├── .prettierrc                    # Prettier config
└── README.md                      # Project README
```

## Directory Purposes

### `apps/`
**Purpose:** Standalone, deployable applications

Each app has:
- Independent `package.json` (dependencies, build scripts)
- Own `tsconfig.json` (can override root settings)
- Own `eslint`, `prettier` configs (can extend root)
- Entry point (`src/server.ts`, `app/page.tsx`, etc.)

**Deployment:** Each app builds independently and deploys to its own environment (Vercel, AWS, etc.)

### `packages/`
**Purpose:** Reusable libraries shared across apps

**Convention:** `@cerebro/*` namespace (defined in root `package.json`)

**Types of packages:**
- **Capability packages:** `@cerebro/*-capability` (feature domains)
- **Core packages:** `@cerebro/{database,auth,ai-gateway,etc.}` (infrastructure)
- **SDK packages:** `@cerebro/{sdk,api-client,agent-sdk}` (external-facing)
- **UI packages:** `@cerebro/{ui,tables,tokens}` (design system)

**Dependency graph:** packages → packages → apps

**Caching:** Each package caches its build output (`dist/`, `.tsbuildinfo`)

### `packages/capabilities/`
**Purpose:** Nested workspace for capability-specific packages

**Structure per capability:**
```
packages/capabilities/agent-builder/
├── src/
│   ├── types.ts                  # Domain types (Agentdef, ToolDefinition, etc.)
│   ├── services/                 # Business logic
│   │   └── AgentRuntimeService.ts
│   ├── ports/                    # Interfaces (for dependency inversion)
│   │   └── ExecutionProvider.ts
│   ├── adapters/                 # Implementations
│   │   ├── AnthropicAdapter.ts
│   │   └── OpenAIAdapter.ts
│   └── errors.ts                 # Domain-specific exceptions
├── index.ts                      # Barrel export (public API only)
└── package.json
```

### `prisma/`
**Purpose:** Single source of truth for database schema

**File:** `schema.prisma`

**Commands:**
```bash
pnpm run prisma:generate    # Generate @prisma/client
pnpm run prisma:migrate     # Run migrations
```

### `tests/`
**Purpose:** Shared test configuration and suites

**Subdirectories:**
- `integration/` — API tests (need live database)
- `e2e/` — Playwright tests (need live server)

**Running:**
```bash
pnpm run test                    # Unit tests (each package)
pnpm run test:integration        # Integration tests
pnpm run test:e2e                # E2E tests (requires `pnpm run dev`)
```

### `architecture/`
**Purpose:** Architecture governance documents

**Usage:** Reference when making architectural decisions

### `infra/`
**Purpose:** Infrastructure as Code

**Deployment targets:** AWS, GCP, Kubernetes, etc.

### `tools/`
**Purpose:** Monorepo automation and verification

**Key tools:**
- `arch/check-architecture.mjs` — Verify architecture boundaries
- `harness/cli.mjs` — Run test harness
- `assurance/runner.mjs` — Run compliance checks

### `.planning/codebase/`
**Purpose:** GSD (Generative Software Development) planning outputs

**Contents:** 
- ARCHITECTURE.md — System design
- STRUCTURE.md — File layout and naming
- STACK.md — Technology dependencies
- INTEGRATIONS.md — External service contracts
- CONVENTIONS.md — Coding standards
- TESTING.md — Test patterns
- CONCERNS.md — Technical debt & issues

## Key File Locations

### Entry Points

**Frontend:**
- `apps/studio/package.json` — `"dev": "next dev"`
- `apps/studio/app/page.tsx` — Home page (hero → sections)
- `apps/studio/app/(platform)/` — Platform routes (dashboard, builder, etc.)

**Backend:**
- `apps/platform-api/package.json` — `"dev": "tsx watch src/server.ts"`
- `apps/platform-api/src/server.ts` — Starts Fastify server on port 3000
- `apps/platform-api/src/bootstrap.ts` — Wires dependencies, registers routes

### Configuration

**Root configs:**
- `package.json` — Monorepo scripts, dependencies, overrides
- `pnpm-workspace.yaml` — Workspace definitions (`apps/*`, `packages/*`, etc.)
- `turbo.json` — Build task definitions, caching policy
- `tsconfig.json` — Root TypeScript settings

**App-specific configs:**
- `apps/studio/next.config.js` — Next.js build config
- `apps/platform-api/tsconfig.json` — TypeScript overrides for API
- `packages/*/package.json` — Per-package dependencies

**Linting & formatting:**
- `.eslintrc.base.json` — Root ESLint rules
- `.prettierrc` — Prettier formatting rules
- `.gitignore` — Files to exclude from git

### Core Logic

**Agent execution:**
- `packages/capabilities/agent-builder/src/services/AgentRuntimeService.ts` — Agent loop
- `packages/ai-gateway/src/gateway.ts` — LLM call routing

**API routes:**
- `apps/platform-api/src/modules/agents/agents.routes.ts` — Agent CRUD
- `apps/platform-api/src/modules/runtime/runtime.routes.ts` — Execution API
- `apps/platform-api/src/modules/conversations/conversations.routes.ts` — Chat API

**Database:**
- `packages/database/src/repositories/AgentRepository.ts` — Agent queries
- `packages/database/src/repositories/WorkspaceRepository.ts` — Tenant isolation
- `packages/database/index.ts` — Prisma singleton

**Middleware:**
- `apps/platform-api/src/middleware/AuthMiddleware.ts` — JWT validation
- `apps/platform-api/src/middleware/WorkspaceAccessMiddleware.ts` — Tenant gating
- `apps/platform-api/src/middleware/RequestContextMiddleware.ts` — Trace ID setup

### Testing

**Test configs:**
- `tests/integration/vitest.config.ts` — Integration test runner
- `.env.test` — Test database URL (in root; see .gitignore)

**Sample test files:**
- `packages/*/src/**/*.test.ts` — Unit tests (co-located)
- `tests/integration/**/*.test.ts` — API integration tests

## Naming Conventions

### Files

**Source files:**
- Service classes: `MyService.ts` (PascalCase)
- Utility functions: `helpers.ts`, `utils.ts` (camelCase)
- Constants: `CONSTANTS.ts` (SCREAMING_SNAKE_CASE for exports)
- Tests: `MyService.test.ts`, `MyService.spec.ts`
- Types: `types.ts`, `contracts.ts`

**Directories:**
- Feature directories: camelCase (`src/modules/agents/`)
- Shared directories: lowercase plural (`src/repositories/`, `src/adapters/`)
- Test directories: match source structure (`src/` → `tests/`)

### Imports

**Path aliases (configured in tsconfig.json per app):**
- `@/` — App root (apps/studio)
- `@cerebro/*` — Workspace packages (pnpm)

**Organization (enforced by ESLint):**
1. External packages (`react`, `lodash`, etc.)
2. Workspace packages (`@cerebro/*`)
3. Relative imports (`./`, `../`)

### Functions & Variables

**Naming:**
- Functions: `camelCase` (`executeAgent`, `fetchUser`)
- Constants: `SCREAMING_SNAKE_CASE` (module-level only)
- Variables: `camelCase` (`agentId`, `workspaceId`)
- Classes/Types: `PascalCase` (`AgentRepository`, `ExecutionState`)
- Interfaces: `PascalCase`, no `I` prefix (`AIProvider`, not `IAIProvider`)

**Prefixes for getters/setters:**
- `get*()` — Retrieve (e.g., `getAgent()`)
- `find*()` — Search with filter (e.g., `findByWorkspaceId()`)
- `list*()` — Return collection (e.g., `listAgents()`)
- `is*()`, `has*()` — Boolean checks (e.g., `isActive()`, `hasAccess()`)

## Where to Add New Code

### New Feature (Multi-layer)

**Example: Add a new Knowledgebase management capability**

1. **Domain model:**
   - Create `packages/capabilities/knowledge/src/types.ts` — Define `Knowledgebase`, `Document` types
   - Create `packages/database/src/repositories/KnowledgeRepository.ts` — Data access

2. **Business logic:**
   - Create `packages/capabilities/knowledge/src/services/KnowledgeService.ts` — Orchestration
   - Create `packages/capabilities/knowledge/index.ts` — Export public API

3. **API routes:**
   - Create `apps/platform-api/src/modules/knowledge/knowledge.routes.ts` — REST endpoints
   - Register in `apps/platform-api/src/bootstrap.ts` line ~130

4. **Frontend:**
   - Create `apps/studio/app/(platform)/knowledge/` — Dashboard pages
   - Create `apps/studio/components/knowledge/` — UI components

5. **Tests:**
   - Create `packages/capabilities/knowledge/src/**/*.test.ts` — Unit tests
   - Create `tests/integration/knowledge.test.ts` — API tests
   - Create `tests/e2e/knowledge.spec.ts` — Playwright E2E tests

### New Component/Module

**Example: Add a React component for agent configuration**

1. **Create file:** `apps/studio/components/agents/AgentConfigForm.tsx`
2. **Imports:** Use path alias `import { Button } from '@/components/ui'`
3. **Export:** Default or named
4. **Tests:** Co-locate as `AgentConfigForm.test.tsx`

### Shared Utilities

**Example: Add a formatting helper used by multiple packages**

1. **Create package:** `packages/common-utils/` (or use existing `packages/lib/`)
2. **Add function:** `src/format.ts` → `export function formatWorkspaceId(id: string): string`
3. **Export:** In `index.ts`
4. **Add dependency:** In consuming package's `package.json`: `"@cerebro/common-utils": "workspace:*"`

### New API Endpoint

**Example: Add `POST /api/v1/agents/{id}/fork`**

1. **Route handler:** Add to `apps/platform-api/src/modules/agents/agents.routes.ts`
2. **TypeBox schema:** Define request/response in same file
3. **Middleware:** Use existing `requireAuthHook`, `requireWorkspaceAccessHook`
4. **Handler logic:**
   - Call repository to fetch agent
   - Validate permission
   - Call domain service
   - Return result or error

**Pattern:**
```typescript
server.post<{ Params: { id: string } }>(
  '/:id/fork',
  { schema: { params: Type.Object({ id: Type.String() }) } },
  async (request, reply) => {
    const { id } = request.params;
    const { tenantId, workspaceId } = request.cerebroContext;
    
    const agent = await agentRepository.getByIdAndWorkspaceId(id, workspaceId);
    if (!agent) return reply.code(404).send({ /* error */ });
    
    const forked = await agentService.fork(agent);
    return reply.code(201).send(forked);
  }
);
```

### New Package

**When to create a new package:**
- Code is reused by 2+ apps
- Code is domain-specific (agent, workflow, knowledge)
- Code is a cross-cutting concern (telemetry, cache, queue)

**Steps:**
1. Create `packages/my-package/`
2. Create `packages/my-package/src/` with source files
3. Create `packages/my-package/index.ts` — barrel export
4. Create `packages/my-package/package.json`:
   ```json
   {
     "name": "@cerebro/my-package",
     "version": "1.0.0",
     "private": true,
     "main": "./src/index.ts",
     "types": "./src/index.ts",
     "dependencies": { /* workspace packages */ },
     "devDependencies": { "typescript": "^5" }
   }
   ```
5. Run `pnpm install` to update `pnpm-lock.yaml`
6. Update workspaces that depend on it: `"@cerebro/my-package": "workspace:*"`

## Special Directories

### `.next/`
**Purpose:** Next.js build output
**Generated:** Yes (via `next build`)
**Committed:** No (in .gitignore)
**Cleared:** `pnpm run clean:build`

### `.turbo/`
**Purpose:** Turborepo task cache
**Generated:** Yes (via `turbo build`, etc.)
**Committed:** No (in .gitignore)
**Cleared:** `pnpm run clean:build` or `turbo prune`

### `node_modules/`
**Purpose:** Monorepo dependencies
**Generated:** Yes (via `pnpm install`)
**Committed:** No (in .gitignore)
**Reinstalled:** `pnpm install --frozen-lockfile` (CI)

### `.pnpm-store/`
**Purpose:** pnpm package store (hard links)
**Generated:** Yes (via `pnpm install`)
**Committed:** No (in .gitignore)
**Preserved:** Across installs for speed

### `prisma/`
**Purpose:** Database schema and migrations
**Generated:** No (manually created)
**Committed:** Yes (schema.prisma, migration files)
**Schema location:** `prisma/schema.prisma` (single truth)

### `dist/` and `build/`
**Purpose:** Package/app build outputs
**Generated:** Yes (via `turbo build`)
**Committed:** No (in .gitignore)
**Outputs defined:** In `turbo.json` (each task)

---

*Structure analysis: 2026-08-04*
