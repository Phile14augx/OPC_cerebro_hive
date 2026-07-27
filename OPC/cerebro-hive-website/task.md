# Task Tracker: Production Hardening Sprint

## Phase 1: Authentication & Authorization (P0)
- `[x]` Wire `@cerebro/auth` dependency into `platform-api`
- `[x]` Fix `RequestContextMiddleware.ts` — strip header-based identity mocks
- `[x]` Implement `AuthMiddleware.ts` with strict JWT validation (issuer, audience, expiry, algorithm whitelist, JWKS)
- `[x]` Fix `bootstrap.ts` — encapsulate protected routes in auth child context, keep `/health` unauthenticated
- `[x]` Add RBAC permission evaluation layer (Authentication → Identity → Tenant → Workspace → Permissions → Handler)
- `[x]` Add CI gate: fail if any route outside `/health`,`/metrics`,`/version` is registered without AuthMiddleware

## Phase 2: Helm Reconciliation (P0 Infrastructure)
- `[x]` Port PORT injection, db-migrate initContainer, ai-secrets for platform-api into `deployments.yaml`
- `[x]` Delete dead Set 1 templates (`service.yaml` top block, `deployment.yaml`, `rollout.yaml`)
- `[x]` Rewrite `values-production.yaml` to camelCase schema
- `[x]` Fix Rust gateway hardcoded empty base URL
- `[x]` Add Service.targetPort == ContainerPort == PORT env var validation

## Phase 3: CI Deployment Validation
- `[x]` Scaffold `helm-validate.js` CI script (duplicate resources, unconsumed keys, missing secrets)
- `[x]` Verify all API keys originate from Secret refs, never literal values

## Phase 4: Runtime Correctness
- `[x]` Replace `WorkerThreadProvider` mock setTimeout with real task dispatch
- `[x]` Implement retry + dead-letter queue in `ExecutionEngine`
- `[x]` Wire or remove dead `Planner.ts`
- `[x]` Register minimum 6 policies in `PolicyEngine` (Cost, Duration, Recursion, Model, Provider, Parallelism)

## Phase 5: Observability
- `[x]` Structured request logging (requestId, tenantId, userId, traceId)
- `[x]` Expose authentication/authorization/LLM/workflow metrics endpoints
- `[x]` Verify distributed trace propagation across platform-api → gateway → swarm-runtime
