# Deployment Architecture Discovery

## Why this document exists

Every finding in `audit/P0-AUTH-AUTHZ-GAP.md` and `audit/INFRA-RECONCILIATION-PLAN.md` was produced under the working assumption that Kubernetes/Helm/ArgoCD is *the* production deployment. That assumption broke while doing the final pre-deletion verification pass on the Helm cleanup: `scripts/deploy/vps-deploy.sh` and its trigger workflow (`.github/workflows/ssh-deploy.yml`) revealed a second, independently real, independently wired production pipeline. This document maps both, so future work can be scoped to the right one instead of assuming there's only one.

**Bottom line, stated up front:** both pipelines are real. They are not competing implementations of the same system — they deploy almost entirely disjoint sets of services to two different domains, on two very different cadences. Nothing in the Helm-consolidation work needs to be undone; it still applies to the system it was scoped to. What changes is the "orphaned" conclusion about `apps/studio/platform`, and the framing of how much of this repo's total surface area the Helm/K8s investigation actually covered.

## 1. Environment inventory

| Environment | Deployment mechanism | Trigger | Domain(s) |
|---|---|---|---|
| VPS production | `docker compose` + PM2 + Nginx + Certbot, driven by `scripts/deploy/vps-deploy.sh` | Every push to `main` (`ssh-deploy.yml`, unconditional, no test gate in the workflow itself) | `cerebropchive.org` |
| K8s staging | Helm chart `infra/helm/cerebro-hive`, ArgoCD application `cerebro-hive-staging` | Twice-weekly cron (Tue/Thu 10:00 UTC) or manual dispatch, gated on full test suite + policy gate (`release-train.yml`) | `staging.cerebrohive.com`, `api-staging.cerebrohive.com` |
| K8s production | Same Helm chart, ArgoCD application `cerebro-hive-production`, Argo Rollouts canary (5%→25%→50%→100%) | Merge of the release-train's auto-generated release PR into `main` | `app.cerebrohive.com`, `api.cerebrohive.com` (implied by staging naming) |
| Local development | Not yet investigated in this pass | — | — |

Confirmed by reading `.github/workflows/ssh-deploy.yml`, `docker-build.yml`, `release-train.yml`, and `argocd-sync-retry.yml` directly — these are live, wired GitHub Actions workflows, not aspirational docs.

## 2. What each pipeline actually deploys

**VPS (`cerebropchive.org`)**, per `vps-deploy.sh`:
- Root-level Next.js app (the one `app/` — the same app the earlier SEO/AEO work this session targeted), built with `npm run build`, run under PM2 in standalone mode, migrated with `npx prisma migrate deploy` against a local Postgres.
- `apps/studio/platform` — the "CerebroHive Enterprise AI OS" (~30 domain verticals: web3, zerotrust, hiveops, digitaltwin, etc.) — built into a Docker container, exposed on port 8090, reverse-proxied by Nginx at `/platform-api/`.
- `apps/studio/agentos` — a standalone Python/FastAPI service, not previously audited — built into a Docker container, exposed on port 8088, reverse-proxied at `/agentos/`.
- Backing services in the same docker-compose stack: Postgres+pgvector, Redis, NATS.

**K8s (`cerebrohive.com`)**, per `docker-build.yml`'s build matrix (19 services) and the Helm chart's `deployments.yaml`:
- `apps/platform-api` (the Fastify app patched with JWT/RBAC this session), `apps/forge`, `services/forge-api`, `packages/ai-gateway`, `apps/studio` (the Next.js frontend, built as a separate image named `studio` — distinct from `apps/studio/platform`), and the full HiveSwarm service set (`swarm-api`, `swarm-runtime`, `agent-runner`, `planner-service`, `memory-service`, `router-service`, `tool-gateway`, `gateway`, plus `evaluation-service`, `learning-service`, `academy-svc`, `crm-svc`, `platform-svc`, `ml-svc`).
- Notably: `apps/studio/platform` and `apps/studio/agentos` do **not** appear in this build matrix at all. They are VPS-only.

This is a clean split, not an overlap. The only name collision is cosmetic: the VPS's Nginx path is labeled `/platform-api/` but it points at `apps/studio/platform`, a different codebase from the K8s system's `apps/platform-api` (Fastify 5 vs Fastify 4, different `package.json`, no shared code confirmed).

## 3. `apps/studio/platform`'s own authentication model

Given it's real and deployed, its auth posture matters on its own terms — it doesn't inherit anything from the JWT/RBAC work done on `apps/platform-api` this session, and shouldn't be assumed equivalent. Read `kernel/gateway/server.ts`, `kernel/identity/identity.ts`, `kernel/identity/pg.ts`, and `kernel/policy/policy.ts` directly. Findings:

- **Authentication**: Bearer API-key, not JWT/Keycloak. Keys are generated as `chk_<48 hex chars>`, stored only as SHA-256 hashes (`findApiKeyByHash`), never in plaintext. A Fastify `onRequest` hook enforces this on every route except an explicit small public allowlist (`/health`, `/ready`, `/openapi.json`, `/v1/bootstrap`, `/docs`, and inbound webhook paths). This is a real, functioning gate — not a stub.
- **Authorization**: a genuine RBAC+ABAC `PolicyEngine` — role→permission grants (`system`/`owner`/`admin`/`operator`/`developer`/`analyst`/`viewer`, each mapped to a real permission list spanning all ~30 domains) plus two ABAC rules enforced ahead of role checks: tenant isolation (a principal can't touch another organization's resources unless it holds the `system` role) and workspace scoping. This is materially more complete than the RBAC wiring gap found earlier in `apps/platform-api`.
- **Persistence**: `kernel/identity` has two implementations — `in-memory.ts` and `pg.ts` (a real Kysely-backed Postgres repository, confirmed by reading it: real `insertInto`/`selectFrom` calls against `organizations`/`users`/`workspaces`/`api_keys` tables). **Open question, not yet resolved**: which one `app/container.ts` actually wires up in the VPS-deployed configuration. This matters — if it's `in-memory.ts` in production, every API key and org would be wiped on container restart, which would be a real operational finding. Not yet checked; flagged as the next concrete thing to verify before treating this system's data durability as settled.
- This is a separate finding from the earlier one about the ~30 domain verticals (`platform/src/domains/*`) persisting via in-memory `Map`s only — that finding still stands and is a different layer (business logic) from the kernel's identity/policy layer covered here.

## 4. A loose end in the repo's own docs, worth flagging rather than resolving by assumption

`apps/studio/agentos/DEPLOY.md` describes deploying AgentOS as a **standalone service to Railway, Render, or Fly.io**, paired with the website hosted on **Vercel**, using `AGENTOS_ALLOWED_ORIGINS=https://cerebrohive.com`. This is a different deployment story than what `vps-deploy.sh` actually does (build agentos into the same docker-compose stack as everything else, on one Hostinger VPS, serving `cerebropchive.org`). Both can't be the live configuration simultaneously. This reads like either superseded documentation from an earlier deployment plan, or an alternate path that was written but never adopted. Not resolved in this pass — worth a direct question to confirm which (if either) reflects what's actually running today, rather than guessing.

## 5. Revisions to earlier conclusions

- **Changed**: `audit/APPS-STUDIO-AUDIT.md`'s conclusion that `apps/studio/platform` is "orphaned... not part of any build or deploy pipeline" is **wrong** and should be corrected. It is built and deployed by `vps-deploy.sh` on every push to `main`. The rest of that audit's findings about the ~30 domain verticals using in-memory storage only still stand — that's a real gap independent of the deploy-pipeline question.
- **Unchanged, scope clarified**: "The repository's Helm chart contains a non-renderable legacy template generation" — still true, still applies to the K8s/`cerebrohive.com` system specifically.
- **Unchanged, scope clarified**: "`apps/platform-api` lacked JWT verification / RBAC / workspace ownership checks" — still true, and this codebase is confirmed to be part of the real, actively-deployed K8s pipeline (it's in `docker-build.yml`'s matrix and ArgoCD's canary rollout target), not a dead or aspirational one. The session's remediation work on it was not wasted effort.
- **New, scoped correctly now**: "This is the production API serving `cerebropchive.org`" is **false** for `apps/platform-api` — that domain is served by `apps/studio/platform` and the root Next.js app instead, over a completely different auth model (API keys, not JWT).

## 6. Net effect on the paused Helm deletion

The Helm-cleanup rationale doesn't change: Set 1 (`service.yaml`/`deployment.yaml`/`rollout.yaml`) still can't render at all, and Set 2 (`deployments.yaml`'s macro) is still the only one that has ever worked, for the `cerebrohive.com`/K8s system specifically. That system is confirmed real and gated by an actual tested, canary-rolled-out release pipeline — arguably a stronger reason to finish consolidating it cleanly, not a weaker one. The thing that changed is scope, not correctness: this Helm work only ever covered one of two real production systems, and should be described that way going forward rather than as "the deployment architecture."

## 7. Recommended next steps, in order

1. Confirm which `IdentityRepository` implementation (`pg.ts` vs `in-memory.ts`) `apps/studio/platform`'s `app/container.ts` actually constructs — this is the one open question with real data-durability stakes.
2. Resolve the `agentos/DEPLOY.md` vs `vps-deploy.sh` discrepancy directly with you rather than by inference.
3. Correct `audit/APPS-STUDIO-AUDIT.md`'s "orphaned" claim.
4. Resume the Helm Set 1 deletion — Phase 1 verification (CI/docs/scripts reference check) was clean for `.github/workflows`; the `docs/`/`scripts/` portion should be re-run now that `scripts/deploy/` is known to exist and has been read in full (it does not reference `service.yaml`/`deployment.yaml`/`rollout.yaml` or the snake_case schema keys — confirmed while reading it for this investigation).
5. Build the CI "Helm Contract Validation" checks already requested, scoped explicitly to the K8s system.
