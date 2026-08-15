# Executive Audit Summary

This is the single entry point for the Milestone 25.4–25.5 audit and the deployment-architecture investigation that followed it. It summarizes findings across all the individual audit documents in this folder; read those for full evidence and reasoning. Where a conclusion was revised mid-audit, that's called out explicitly rather than silently updated — the audit trail is intentionally kept, not overwritten.

## Architecture: two independent, real deployment systems

The repository contains **two separate, actively-deployed production systems**, not one system with competing implementations. This was the single biggest correction made during the audit (see `DEPLOYMENT-ARCHITECTURE-DISCOVERY.md`).

**VPS deployment** — `cerebropchive.org`:
- Mechanism: `scripts/deploy/vps-deploy.sh`, triggered by `.github/workflows/ssh-deploy.yml` on every push to `main`.
- Stack: `docker compose` (Postgres+pgvector, Redis, NATS) + PM2 (Next.js) + Nginx + Certbot, all on one Hostinger VPS.
- Serves: the root Next.js website, `apps/studio/platform` (the "Enterprise AI OS," proxied at `/platform-api/`), `apps/studio/agentos` (proxied at `/agentos/`).

**Kubernetes deployment** — `cerebrohive.com`:
- Mechanism: Helm chart (`infra/helm/cerebro-hive`) + ArgoCD, deployed via `.github/workflows/docker-build.yml` (image builds) and `release-train.yml` (test suite → staging → canary production rollout), on a Tue/Thu cron or manual dispatch.
- Serves: `apps/platform-api`, `apps/forge`, `services/forge-api`, `packages/ai-gateway`, the `studio` Next.js frontend (a separate image from `apps/studio/platform`), and the full HiveSwarm service set.

The only naming collision between the two is cosmetic: the VPS's Nginx path is labeled `/platform-api/` but proxies to `apps/studio/platform`, a different codebase from the K8s system's `apps/platform-api`.

## Authentication: two independent, both-real auth models

- **`apps/platform-api`** (K8s/`cerebrohive.com`): previously had a self-documented mock — tenant/user identity was spoofable via client-controlled headers (`x-tenant-id`, etc.), and RBAC permissions defined in `@cerebro/auth` were never actually invoked anywhere. Fixed this session: real Keycloak-JWT verification (`requireAuthHook`), a real workspace-ownership check against the database (`WorkspaceRepository.getWorkspaceById`, previously built but never called), and RBAC permission gates wired onto the most sensitive routes (agent creation, workflow execution, telemetry read, conversation/chat). See `P0-AUTH-AUTHZ-GAP.md`.
- **`apps/studio/platform`** (VPS/`cerebropchive.org`): has its own, independent, real auth model — Bearer API-key auth (SHA-256-hashed keys, never stored in plaintext) plus a genuine RBAC+ABAC `PolicyEngine` enforcing tenant and workspace isolation on every request via a Fastify `onRequest` hook. This was not built or modified this session — it already existed and works. See `PLATFORM-IDENTITY-PERSISTENCE-AUDIT.md` §3.
- **`apps/studio/agentos`** (VPS, Python/FastAPI): its own API-key auth (`AGENTOS_ADMIN_SECRET`-gated key issuance), documented as a Phase-1 MVP with Keycloak/OIDC swap-in named as the future upgrade path, not yet done.

These three are not layered or dependent on each other — each service has to be evaluated on its own auth posture, which this audit did separately for each.

## Persistence

- **`apps/platform-api`**: standard Postgres via Prisma — no findings requiring escalation.
- **`apps/studio/platform`**: identity/users/workspaces/API keys and the audit log are Postgres-backed via `PgIdentityRepository`/`PgAuditRepository`, active by default (`withDatabase: process.env.PLATFORM_NO_DB !== "1"`) and confirmed wired correctly in the VPS deploy script's env injection. The ~30 domain verticals (web3, governance, workflows, etc.) are in-memory at the code level but sit under a real `SnapshotPersistence` mechanism — restores on boot, flushes every 20 seconds, and does one final flush on graceful shutdown — giving them durability with a bounded (~20s) data-loss window on an unclean crash, not full ephemerality. Postgres itself uses a named Docker volume, so this survives container recreation. See `PLATFORM-IDENTITY-PERSISTENCE-AUDIT.md`.
- **`apps/studio/agentos`**: SQLite locally, Postgres in the VPS deployment (a dedicated `agentos` role/database inside the same shared Postgres container), per `DEPLOY.md` and `vps-deploy.sh`.

## Infrastructure: Helm consolidation

- The Helm chart contained two incompatible template generations. Set 1 (`service.yaml`, `deployment.yaml`, `rollout.yaml`, snake_case values schema) called at least six Helm helper templates that don't exist anywhere in the chart — it could never have rendered, let alone deployed. Set 2 (`deployments.yaml`'s reusable macro, camelCase schema) is the only one that has ever worked, and is the only one covering all 11 K8s-deployed services.
- Ported Set 1's real advantages into Set 2 before removing it: `PORT` injection, a `platform-api` database-migration initContainer, and closing a secret-mounting gap (`cerebro-hive-ai-secrets` was never mounted onto `platform-api`, the service that actually constructs the AI Gateway client).
- Rewrote `values-production.yaml` from the dead snake_case/`.replicaCount` schema to the live camelCase/`.replicas` schema, preserving the original tuned numbers.
- Deleted `service.yaml`, `deployment.yaml`, `rollout.yaml` after explicit verification: no CI workflow, documentation, test, or script referenced them (confirmed while reading `scripts/deploy/` in full for the deployment-architecture investigation). Migration rationale logged in `INFRA-RECONCILIATION-PLAN.md`.
- **New finding, not yet acted on**: `templates/hpa.yaml` and `templates/pdb.yaml` appear to be further leftovers of the same dead Set-1 schema — they key off snake_case value names and a per-service `.hpa`/`.pdb` field that no values file in the repo populates. Verified by reading all three values files (base, staging, production) rather than an actual `helm template` render (no working `helm` binary was available in the sandbox — attempts to fetch one were blocked by network restrictions). Held pending an actual render-based confirmation before deletion, per instruction not to delete by analogy alone.

## Documentation: AgentOS deployment consistency

- `apps/studio/agentos/DEPLOY.md` previously described deploying AgentOS standalone (Railway/Render/Fly + a Vercel-hosted website) — a real, working option, but not what actually runs. `vps-deploy.sh` (wired into live CI via `ssh-deploy.yml`, triggered on every push to `main`) is what's actually authoritative.
- The two didn't substantively conflict — every configuration fact (env var names, port-injection behavior, optional-LLM-key fallback, the admin-secret gate) matched. The divergence was topology only. `DEPLOY.md` has been rewritten this session to lead with the VPS path as authoritative and demote Railway/Render/Fly to a clearly-labeled alternative.
- `app/main.py`'s docstring described a `/api/platform`, `/api/archive`, etc. domain-module namespace that isn't actually wired up by any `include_router` call in that file — only the legacy AgentOS v1 routers and a finance module are registered. Docstring rewritten this session to describe the actually-registered routes, with the domain-module namespace reframed explicitly as planned, not current.
- The VPS deploy script's AgentOS health check was informational only (`|| true`) — a deploy could report success even if the AgentOS container never came up. Strengthened this session into a real gate: retries `GET /health` for up to 90 seconds, fails the deploy (`exit 1`, with the container's last 50 log lines) if it never returns HTTP 200.

## Remaining operational checks (not resolvable from repository inspection alone)

1. **`PLATFORM_NO_DB` on the live VPS.** Repository evidence (the deploy script, `main.ts`'s default, and the absence of any override) strongly indicates `apps/studio/platform` is running with its Postgres-backed identity/audit repositories, not the in-memory fallback. This is inference from source and deploy scripts, not a live check. Confirming it requires either the running container's own startup log line (`db: true`) or `docker exec <platform container> env | grep PLATFORM_NO_DB` on the VPS — both need real access this audit didn't have.
2. **`hpa.yaml`/`pdb.yaml` render confirmation.** Textually verified dead (no values file populates the fields they key off), not confirmed via an actual `helm template` execution. Worth a real render pass (in an environment with a working `helm` binary) before deleting, per the same evidentiary standard used for the Set 1 deletion.

## Recommended follow-up work, roughly in priority order

1. Confirm `PLATFORM_NO_DB` on the live VPS (closes the one remaining runtime-verification gap).
2. Render-confirm and then remove `hpa.yaml`/`pdb.yaml` if they're genuinely dead in every supported values configuration.
3. Build the CI "Helm Contract Validation" checks already scoped in `INFRA-RECONCILIATION-PLAN.md` §5: duplicate resource identities, unconsumed override keys, missing required secrets/env per service.
4. Consider whether the `apps/studio/platform` 20-second snapshot interval is acceptable for the domains where losing that window of writes would matter, or whether specific domains warrant write-through persistence sooner than the rest.
5. Apply the same "retry + fail the deploy" pattern now used for AgentOS's health check to the `platform` (port 8090) and `next` (port 3000) checks in `vps-deploy.sh`, which are still informational-only.

## Audit documents index

- `DEPLOYMENT-ARCHITECTURE-DISCOVERY.md` — the VPS-vs-Kubernetes split, environment inventory, revised conclusions.
- `P0-AUTH-AUTHZ-GAP.md` — `apps/platform-api`'s auth/authz gap and remediation.
- `INFRA-RECONCILIATION-PLAN.md` — Helm chart consolidation plan and migration log.
- `PLATFORM-IDENTITY-PERSISTENCE-AUDIT.md` — `apps/studio/platform`'s identity repository binding and persistence model.
- `AGENTOS-DEPLOYMENT-CONSISTENCY-AUDIT.md` — `DEPLOY.md` vs `vps-deploy.sh` consistency matrix.
- `APPS-STUDIO-AUDIT.md` — original `apps/studio` audit; its "orphaned" conclusion for `apps/studio/platform` is superseded by `DEPLOYMENT-ARCHITECTURE-DISCOVERY.md`, noted there rather than edited out of the original.
- `RESPONSIBILITY-MATRIX.md`, `RESILIENCE-AUDIT.md` — earlier Milestone 25.4/25.5 findings (PolicyEngine/event-bus canonical implementations, resilience-pattern inventory), unaffected by the later deployment-architecture work.
