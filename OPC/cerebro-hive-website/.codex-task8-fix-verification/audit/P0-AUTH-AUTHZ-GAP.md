# P0 — Authentication & Authorization Gap Across Platform APIs

Status: **Confirmed at the repository level. Not yet verified against the live cluster.**

## Summary

`apps/platform-api` and `packages/ai-gateway` have no authentication of any kind, and the tenant-isolation code that does exist downstream of that gap is self-documented in-source as mock/demo logic, trivially bypassable by anyone who can set an HTTP header. This is worse than "authentication is missing" alone — it's authentication missing plus a look-alike authorization layer that provides no real protection.

## The gap, traced end to end

`apps/platform-api/src/middleware/RequestContextMiddleware.ts`, in full:

```ts
export function requestContextHook(request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) {
  // In a real scenario, these would come from authentication (JWTs) and API gateways.
  // We mock them here for demonstration of the architecture.
  const tenantId = (request.headers['x-tenant-id'] as string) || 'default-tenant';
  const workspaceId = (request.headers['x-workspace-id'] as string) || 'default-workspace';
  const userId = request.headers['x-user-id'] as string;
  ...
}
```

This is not an obscure edge case — it is the single function that populates `request.cerebroContext`, which every route in the API trusts as ground truth for who's asking and which tenant they belong to. The comment is explicit: this is demonstration code, not real identity resolution. `tenantId`, `workspaceId`, and `userId` are all read directly and exclusively from client-supplied headers (`x-tenant-id`, `x-workspace-id`, `x-user-id`) with no verification against anything — no JWT, no session, no signature, nothing stops a caller from setting any value they like.

Every route that does look like it enforces tenant isolation is checking that fake context against itself, not against a verified identity:

- `apps/platform-api/src/modules/agents/agents.routes.ts:69` — `if (!agent || agent.workspaceId !== workspaceId)`
- `apps/platform-api/src/modules/workflows/workflows.routes.ts:61,80` — same pattern, twice
- `apps/platform-api/src/modules/telemetry/telemetry.routes.ts:79` — same pattern
- `apps/platform-api/src/modules/conversations/conversations.routes.ts:59-65` — builds `AgentExecutionContext` (which flows into the AI Gateway call) directly from `cerebroContext.tenantId` / `cerebroContext.workspaceId` / `cerebroContext.userId`

None of this is a bug in the ownership-check logic itself — `agent.workspaceId !== workspaceId` is a perfectly correct check, *if* `workspaceId` were trustworthy. It isn't. Set `x-workspace-id: <any-other-tenant's-id>` on a request and every one of these checks passes. There is no privilege escalation required — it's the default, intended read path for this middleware.

## Impact

- Anyone can read or act on any tenant's agents, workflows, and telemetry by guessing or enumerating workspace IDs (which are likely not secret — they may well be visible in URLs, exports, or error messages elsewhere).
- The same fake context is what gets attached to `AgentExecutionContext` and passed into `AgentRuntimeService.execute()`, which calls through to `packages/ai-gateway` — so LLM execution itself inherits an unverified tenant identity. Cost/quota tracking keyed on `tenantId`/`workspaceId` (if any exists in ai-gateway) would be equally meaningless, since the caller controls the value being tracked against.
- Combined with the previously confirmed finding — `platform-api` and `ai-gateway` have zero authentication dependency at all — there isn't even a first gate to get past. This isn't "authorization is weak," it's "there is no identity, and the tenant-scoping code was written expecting one to show up later."

## Open question not yet resolved

`packages/ai-gateway` is reached two ways: in-process from `platform-api` (inheriting whatever context `platform-api` built, fake or not), and directly via its own Kubernetes ingress at `gateway.cerebrohive.com` (confirmed in Milestone 25.5). The direct path wouldn't go through `platform-api`'s middleware at all — meaning it may not even have the *fake* tenant context, just raw unauthenticated access to the configured LLM providers. `ai-gateway`'s own standalone server entrypoint (as opposed to the library code already read) hasn't been checked yet to confirm what, if anything, gates that path.

## Recommended acceptance criteria (adopting the prior assessment, unchanged)

- Shared authentication middleware across all externally exposed services (or each service independently verifies JWTs if a shared gateway can't be guaranteed to sit in front of all traffic — defense in depth, not one or the other).
- JWT verification on every public endpoint, using the existing `@cerebro/auth` package (`safeVerifyJWT`) that `forge-api` already uses correctly — no need to invent a second auth mechanism.
- Tenant context sourced from the verified JWT payload (`org_id`/`org_role`, per `CerebroJWTPayload`), never from a client-supplied header, in `platform-api` and anywhere else that currently reads `x-tenant-id`/`x-workspace-id`/`x-user-id` directly.
- RBAC/ABAC enforcement layered on top of authentication (role → permission → resource ownership), not conflated with it.
- Service-to-service identity (mTLS or signed service tokens) for the intra-cluster calls the NetworkPolicy currently allows by pod label alone.
- Audit logging for authenticated requests, keyed on the verified identity, not the current `traceId`/`correlationId` alone.
- Integration tests covering authenticated, unauthenticated, cross-tenant, and unauthorized access — the same four scenarios proposed for live verification, replayed as a permanent regression suite once fixed.

## Remediation implemented for `platform-api`

`@cerebro/auth` turned out to already contain everything the recommended stack asked for: real Keycloak-JWKS JWT verification (`packages/auth/src/jwt/verify.ts`, using `jose`), a full RBAC permission system (`packages/auth/src/rbac/permissions.ts` — 5 org roles, ~28 fine-grained permissions, already built), and a reference Express middleware (`packages/auth/src/middleware/express.ts`) showing the intended `requireAuth`/`requireRole`/`requirePermission`/`requireOrgAccess` pattern. None of it was unused because it was incomplete — it was unused because `platform-api` never depended on the package at all. This was a wiring gap, not a missing-capability gap.

Changes made (code only, not deployed):

- `apps/platform-api/package.json` — added `@cerebro/auth` as a dependency.
- `apps/platform-api/src/middleware/AuthMiddleware.ts` (new) — `requireAuthHook`, a Fastify `preHandler` mirroring `forge-api`'s `JwtGuard`: extracts the Bearer token, calls `safeVerifyJWT`, returns 401 on missing/invalid/expired tokens, and on success overwrites `request.cerebroContext.tenantId`/`userId`/`roles`/`permissions` with values read from the verified JWT (`org_id`, `sub`, realm/client roles, `isSystemAdmin`) instead of client headers.
- `apps/platform-api/src/middleware/RequestContextMiddleware.ts` — stripped the header-based `tenantId`/`userId` mock. Still sets `traceId`/`correlationId` from headers (fine — tracing IDs aren't a security boundary) and a placeholder `tenantId: 'unauthenticated'` that `requireAuthHook` overwrites on every protected route.
- `apps/platform-api/src/bootstrap.ts` — restructured route registration so the auth hook applies to a properly encapsulated Fastify child context wrapping `agents`/`workflows`/`telemetry`/`runtime`/`conversations`, while `healthRoutes` stays registered outside it. This matters mechanically, not just cosmetically: Fastify hooks added at the root instance cascade to everything, so health checks would have started requiring a JWT too and Kubernetes would never mark the pod Ready.
- `apps/platform-api/src/server.ts` — also fixed a hardcoded `port: 3000` that ignored the `PORT` env var the Helm chart injects (`platformApi.port: 4000`). Found while working in this file for the auth fix; see the new deployment-consistency finding below for why this matters independently of auth.

**What's still a known gap, not silently treated as solved**: `workspaceId` has no equivalent JWT claim (the token proves org membership, not which workspace inside that org), so it's still read from a header in `RequestContextMiddleware.ts`. Every route's existing `resource.workspaceId !== workspaceId` check is real and correct, but nothing yet confirms the authenticated tenant actually owns the workspace named in that header — closing that needs a workspace-to-tenant ownership lookup in the database layer that hasn't been added. Flagged in-code and here rather than left implicit.

**Not yet touched**: `ai-gateway` — see the new finding below, it changes what "add auth to it" even means. RBAC/permission enforcement beyond authentication (the `PERMISSION_MAP`/`hasPermission` machinery already exists in `@cerebro/auth` and isn't yet called from any `platform-api` route). Audit logging tied to verified identity (`AuditLogger` is already constructed in `server.ts` and passed into `AgentApplicationService`, but hasn't been checked for whether it's actually invoked anywhere, or what identity it logs). Integration tests for the four scenarios (authenticated / unauthenticated / invalid token / cross-tenant).

## New finding: two independent reasons the live services may not actually be reachable, regardless of auth

**`apps/platform-api`'s server had a hardcoded port that ignored its own injected config.** `infra/helm/cerebro-hive/templates/deployment.yaml` injects a `PORT` env var set to `.Values.platformApi.port` (4000), and the Deployment's `containerPort` and the Service's target port are both driven from that same value. `server.ts` called `server.listen({ port: 3000, ... })` as a literal, never reading `process.env.PORT`. If the Kubernetes Service and readiness probe target port 4000 while the process only ever listens on 3000, the pod would fail readiness checks indefinitely and the Service would have no healthy endpoints — regardless of what auth code does or doesn't exist. Fixed above as part of the same pass.

**`packages/ai-gateway` has no HTTP server anywhere in its source.** `src/index.ts` (the file `packages/ai-gateway/Dockerfile`'s `CMD ["node", "dist/index.js"]` actually runs as the container's main process) is a pure barrel export — `AIGateway`, `createGateway`, types, `CircuitBreaker`, `RateLimiter`, `ResponseCache`, `ModelRouter`, `ModelRegistry`. No file in `packages/ai-gateway/src` calls `.listen()`, constructs an Express/Fastify app, or otherwise binds a port. `gateway.ts`'s `AIGateway` class only exposes `chat()`/`stream()`/`getHealth()`/`destroy()` as plain async methods meant to be called in-process — which is exactly how `apps/platform-api/src/server.ts` actually uses it (`const aiGateway = createGateway();`, no network call). As currently coded, running the `ai-gateway` container's entrypoint would execute some import/export statements and exit — there is nothing to keep the process alive, so the standalone Kubernetes deployment (its own pod, its own ingress at `gateway.cerebrohive.com`/`gateway.staging.cerebrohive.com`) should be permanently failing to come up, independent of the missing auth. **This reframes the earlier finding**: the auth gap in `ai-gateway` is real as written, but "write JWT middleware for `ai-gateway`'s server" isn't a well-defined task yet, because there is no server to add it to — that would mean building one from scratch, which is a bigger change than porting `forge-api`'s pattern, and it's not yet clear whether the standalone deployment is meant to exist at all versus being vestigial infrastructure around a package whose only confirmed real consumer is in-process.

## Investigation requested before building anything for ai-gateway — answered, and it surfaced a bigger problem

Went through the five questions in order. The answer to "why does ai-gateway have no server" turned out to be the smallest part of a larger discovery: **this Helm chart defines the same services twice, in two incompatible ways, and both render unconditionally (or near-unconditionally) into the same release.**

1. **What process runs in the ai-gateway deployment?** `node dist/index.js`, compiled from `packages/ai-gateway/src/index.ts` — confirmed (again) to be a pure barrel export. No HTTP server anywhere in the package's 14 source files. Not a worker with a hidden event loop either — nothing calls `createGateway()` or constructs `AIGateway` inside `index.ts` itself, so not even the class's internals run.

2. **What Kubernetes Service targets it?** Two, both named `ai-gateway`, from two different template files:
   - `templates/service.yaml` — a bare Service, keyed off a snake_case values dict (`.Values.ai_gateway`), covering exactly 5 services: studio, forge, platform-api, forge-api, ai-gateway. Port comes from `$cfg.port`.
   - `templates/deployments.yaml` — despite the filename, this is actually a reusable macro (`cerebro-hive.service`) that renders a full Deployment + Service + HPA + PDB + Ingress, keyed off the camelCase values (`.Values.aiGateway`, matching `values.yaml`'s actual structure), invoked explicitly for **all 11 deployed services** including the HiveSwarm ones. Its Service is `port: 80, targetPort: http`.
   
   Both are unconditional (Set 2 has no feature-flag gating at all). Same resource kind, same name, same namespace, same chart, same release — that's two Service objects with the same identity being defined by the same `helm install`.

3. **What does the Deployment execute, and via which template?** Also duplicated:
   - `templates/deployment.yaml` — snake_case, 5 services, gated on `not .Values.rollouts.enabled`. This one **does** inject a `PORT` env var and matches its own `containerPort`/probes to it — internally consistent, and notably more mature (a `db-migrate` initContainer for platform-api, a second secret mount for ai-gateway/forge-api, topology spread constraints, pod anti-affinity).
   - `templates/deployments.yaml`'s macro — camelCase, 11 services, **not** gated on `rollouts.enabled` at all, and does **not** inject any `PORT` env var — it only sets `NODE_ENV` plus whatever's in the per-service custom `env` map.
   
   `values-production.yaml` sets `rollouts.enabled: true`, which turns off `deployment.yaml` in production (a `rollout.yaml` Argo Rollout presumably takes over for whichever services it covers — not yet read). But nothing turns off `deployments.yaml`'s macro-based Deployment. So in production specifically, there's a real possibility of an Argo Rollout AND a plain Deployment both trying to own pods labeled `app.kubernetes.io/name: platform-api` (or `ai-gateway`, `studio`, `forge`, `forge-api`) at the same time.
   
   This also means my platform-api port fix (reading `process.env.PORT`) is correct against `deployment.yaml`'s env injection, but if `deployments.yaml`'s macro is the version that actually wins in the live cluster, no `PORT` is ever injected there, so the app would still fall back to its hardcoded default — same bug, different cause. I can't tell from the repo alone which template "wins" in an actual `kubectl apply` — that depends on Helm's rendering order and how the cluster reconciles two objects with identical identity, and I don't have `helm` available in this sandbox to render the chart and check directly (confirmed absent, didn't try to install it mid-investigation).

4. **Why does Ingress route to `gateway.cerebrohive.com`? Real backend or vestigial?** Also duplicated, a third way: the standalone shared `templates/ingress.yaml` (already documented in Milestone 25.5) routes `gateway.{domain}` to the `ai-gateway` Service. Separately, `deployments.yaml`'s per-service macro *also* creates its own Ingress for `ai-gateway` (name: `ai-gateway`, since `aiGateway.ingress.enabled: true` in `values.yaml`) at the same host. Two different Ingress objects, two different names, same hostname. Whether nginx-ingress-controller handles that gracefully or produces undefined routing behavior isn't something I can determine from source.

5. **Is platform-api already the authenticated frontend for ai-gateway?** No — checked its actual routes (just edited `bootstrap.ts`/`server.ts` for the auth fix, so this is current, not inferred): there is no route proxying to a separate ai-gateway network address anywhere. `ai-gateway` is only ever used as an in-process import (`createGateway()`, called directly, no HTTP hop). platform-api isn't "in front of" ai-gateway in any network sense — it's the only confirmed real caller of its code.

**Answer to the actual question**: this isn't cleanly Possibility A, B, or C — it's a chart that seems to have been rewritten once (probably migrating toward the newer camelCase/macro style to cover the newer HiveSwarm services) without the older snake_case files being removed. Building a real server for ai-gateway would be solving the wrong layer of the problem right now; the more urgent question is which of these two competing template generations is the one actually governing the live cluster, and whether the old one (`service.yaml` + `deployment.yaml`) is meant to be deleted. That's a repo-cleanup/DevOps question I'd want confirmed rather than guessed at, given how much of production's actual behavior depends on the answer.

## Root cause nailed down precisely — `rollout.yaml` read, `helm` unavailable so traced by hand instead

`helm` isn't installed in this sandbox (checked `command -v helm`, `apt-cache policy helm` — no candidate; didn't try a raw curl-based installer, that's outside what this environment's tooling rules allow me to reach for unilaterally) so this was resolved by carefully reading every relevant file rather than rendering the chart. That turned out to nail the mechanism precisely enough that a render would mostly have confirmed it, not revealed something new.

`templates/rollout.yaml`: creates Argo `Rollout` objects (replacing plain Deployments) plus the canary/stable Service pairs Argo Rollouts' nginx traffic-splitting needs — but **only for `studio` and `ai-gateway`** (`$rolloutServices := dict "studio" .Values.studio "ai-gateway" .Values.ai_gateway` — snake_case key for ai-gateway, same convention as `deployment.yaml`/`service.yaml`). It's gated on `.Values.rollouts.enabled`, and reads `$cfg.replicaCount` (not `$cfg.replicas`).

Cross-referencing all four values files against both template generations' exact field names settles it:

| | Set 1 (`service.yaml` top + `deployment.yaml` + `rollout.yaml`) | Set 2 (`deployments.yaml` macro) |
|---|---|---|
| Keys read | `platform_api`, `forge_api`, `ai_gateway` (snake_case) | `platformApi`, `forgeApi`, `aiGateway` (camelCase) |
| Replica field | `.replicaCount` | `.replicas` |
| Gated by `rollouts.enabled`? | Yes — `deployment.yaml` off when true, `rollout.yaml` on when true (2 services only) | No — always renders, all 11 services |
| Matches `values.yaml` (base) / `values-staging.yaml`? | No — those use `platformApi`/`forgeApi`/`aiGateway` + `.replicas` | Yes, exactly |
| Matches `values-production.yaml`? | Yes, exactly — `platform_api`/`forge_api`/`ai_gateway` + `.replicaCount` | No |

**This means `values-production.yaml`'s tuned overrides for `platform-api` and `forge-api` — 3 replicas instead of 2, higher CPU/memory requests and limits, wider HPA range, a PodDisruptionBudget — never reach anything.** The only template that reads those snake_case keys (`deployment.yaml`) is switched off in production (`rollouts.enabled: true`), and `rollout.yaml` doesn't cover those two services. Meanwhile Set 2's macro *is* active for them (it's unconditional), but it only reads the camelCase keys, so it only ever sees `values.yaml`'s base numbers (2 replicas, lower resource limits) — the same figures staging uses, not the production-tuned ones. If this matches the live cluster, `platform-api` and `forge-api` in production are running under-provisioned relative to what whoever wrote `values-production.yaml` clearly intended, silently, with no error to surface it.

`studio` and `ai-gateway` (single-word keys, no case ambiguity) get a different, more acute problem: `values-production.yaml`'s overrides for them *do* reach Set 1's `rollout.yaml` correctly (3 replicas, production resources, canary strategy) — but Set 2's macro is still separately, unconditionally creating a plain `Deployment` for both of them too, at base/staging sizing. In production that's not silent drift, it's two different controllers (an Argo `Rollout` and a plain `Deployment`) likely both reconciling toward the same pod-label selector at the same time.

**Given this, the resource-identity duplication isn't uniform across all 5 originally-shared services — it's worse for `studio`/`ai-gateway` (active dual-controller conflict) and different-but-still-broken for `platform-api`/`forge-api` (production tuning silently discarded, base/staging sizing running instead). `forge` is likely fine either way since neither its values differ meaningfully between the two schemas nor does it appear in `rollout.yaml` at all.**

## On pausing implementation changes

Fair concern in general, and I'm not making any further Helm/deployment-config changes until this is sorted — but worth being precise about what was actually touched already, since "the live template might differ from the one you fixed" doesn't apply the same way to both of the earlier code changes:

The **auth fix** (`AuthMiddleware.ts`, `bootstrap.ts`, `RequestContextMiddleware.ts`) is application source, not deployment config. It changes what the Node process does once a request reaches it — that's true no matter which Deployment/Rollout started that container or which port it's listening on. There's no version of this Helm confusion that makes the JWT check not apply once the process is running.

The **port fix** (`server.ts` reading `process.env.PORT`) is the one actually entangled with this mess, but it was written defensively for exactly this kind of uncertainty: `Number(process.env.PORT) || 3000`. If Set 1 (which injects `PORT`) is what's running, it now binds to the right port. If Set 2 (which injects no `PORT` at all) is what's running, `process.env.PORT` is `undefined`, and the code falls back to the same `3000` it always used — identical behavior to before the fix. Either way the change can't make anything worse than it already was; it just stops being wrong in the one scenario where it matters.

So: nothing so far needs to be unwound. Nothing further will be touched on the infra side until the duplicate-template question has an owner and a decision.

## Live verification attempt — inconclusive, not skipped

Per the go-ahead to test staging, attempted a plain unauthenticated fetch against `https://api.staging.cerebrohive.com/health` and `https://gateway.staging.cerebrohive.com/health` (real staging hostnames, confirmed from `values-staging.yaml`: `global.domain: staging.cerebrohive.com`). Both returned no content of any kind — no error, no status, nothing legible. That's consistent with either domain simply not existing/resolving, or with the two deployment bugs just found (platform-api's port mismatch, ai-gateway having no server at all) meaning nothing is actually listening — can't distinguish between those from this signal alone. Per this session's tooling rules, a failed/empty web fetch isn't a case to route around with a raw HTTP client from the shell — so the more surgical tests (invalid JWT header, cross-tenant JWT) weren't attempted at all; they'd need a real HTTP client with custom-header support, which isn't something to reach for here, plus actual test credentials for the cross-tenant case that only exist in Phil's own identity provider. If confirming live behavior still matters, that's best run by whoever has direct, tooled access to the cluster (`kubectl port-forward` + `curl`, or from inside the VPC).
