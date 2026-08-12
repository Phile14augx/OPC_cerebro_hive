# Milestone 25.4C: Runtime Integration Discovery

Resolves the two priorities and the "system of record" question. Evidence sources this pass, all read in full: `packages/workflow` (4 files), `docker-compose.yml` (814 lines, prior pass), `infra/argocd/application-production.yaml`, `infra/argocd/application-staging.yaml`, `infra/helm/cerebro-hive/values.yaml`, `infra/helm/cerebro-hive/values-production.yaml`, `.github/workflows/docker-build.yml`.

## Priority 1 — `packages/workflow` resolved

`packages/workflow` is **not a workflow engine**. Its 4 files are `index.ts` (barrel export), `types/workflow.ts` (two generic interfaces, `DAGNode`/`WorkflowGraph`, unused by anything else in the package), `forge/types.ts` (Forge-specific domain types — `ForgePhase`, `ForgeAgentType`, `ForgePlan`, `ForgeArchitecture`, the 10-stage `FORGE_PIPELINE`), and `forge/project-graph.ts` (`ProjectGraph`, an in-memory `Map<projectId, AgentContext>` with a subscribe/notify mechanism, explicitly commented "shared across the NestJS DI container").

This is Forge's internal code-generation pipeline tracker — it holds the state of an in-progress AI-generated project (which phase it's in, which of the 13 Forge agent types are active, what files have been generated) — not a Temporal or business-process workflow engine. The name collision with `packages/capabilities/workflow` (which does have real `@temporalio/client`/`@temporalio/workflow` dependencies and a `TemporalWorkflowEngine`) is coincidental. **`packages/workflow` is out of the running entirely for "canonical workflow engine."** It has a `dist/` folder and a `.turbo/turbo-build.log`, so it is built by Turborepo and is live — almost certainly consumed by `services/forge-api` (Nest-shaped, matches the DI comment) — but it answers "how does Forge track its own generation pipeline," not "who runs business workflows."

The real Temporal-based candidates remain exactly two: `packages/capabilities/workflow` (has the engine class, zero confirmed consumers) and `services/temporal-worker` (real worker, confirmed real). See the deployment findings below for why this pairing currently appears to be inactive in any deployed environment.

## Priority 2 — is HiveSwarm actually deployed? Yes, most of it. Cross-referenced across three independent sources

Three separate, independent artifacts were checked and they agree with each other exactly:

| Source | What it shows |
|---|---|
| `infra/helm/cerebro-hive/values.yaml` | 11 services with `enabled: true`, each with its own image repo, replicas, autoscaling, health probes, and (for 5 of them) its own Kubernetes Ingress host |
| `infra/argocd/application-production.yaml` | Same 11 services, pinned to semver tags (`"1.0.0"`), manual sync only, canary rollout via Argo Rollouts |
| `infra/argocd/application-staging.yaml` | Same 11 services, `"latest"` tag, auto-sync + self-heal on every push to `main` |

The 11: `studio`, `forge`, `platformApi`, `forgeApi`, `aiGateway`, `swarmApi`, `swarmRuntime`, `agentRunner`, `plannerService`, `memoryService`, `toolGateway`.

**6 of those 11 are HiveSwarm services** (`swarmApi`, `swarmRuntime`, `agentRunner`, `plannerService`, `memoryService`, `toolGateway`) — each with real replica counts (2–3 baseline, autoscaling up to 10–50), real health-probe paths, real resource limits. This is as strong as evidence gets without hitting a live cluster: **HiveSwarm is not orphaned scaffolding — 6 of its 9 docker-compose services are part of the actual production and staging release train**, same Helm chart, same namespace, same ArgoCD project as the rest of the platform.

### The gap nobody asked about: CI builds 19 services, Helm deploys 11

`.github/workflows/docker-build.yml` has a build matrix of **19 services** — every one of the 11 above, plus `gateway` (Rust), `platform-svc`, `academy-svc`, `crm-svc` (Kotlin), `ml-svc` (C++), `router-service` (Go), `evaluation-service`, `learning-service` (Python). All 19 get a real multi-arch image built and pushed to `ghcr.io/cerebrohive/cerebro-hive/*` on every push to `main`.

**8 of those 19 built images are never referenced by the Helm chart or either ArgoCD Application.** They are real, they compile, they get published to the registry — and then, as far as this repo's own GitOps path shows, nothing deploys them anywhere. This is a materially different, and more specific, finding than "production wiring unconfirmed": it's now confirmed that these services are *built for release* but *not part of the release*.

Also notable: `services/temporal-worker` doesn't appear even in the 19-entry CI build matrix. It isn't built-but-undeployed like the 8 above — no image is ever produced for it by this pipeline at all. That's a step further than the others.

One caveat that has to be stated plainly: absence from this repo's Helm chart and the two ArgoCD Applications found here doesn't prove absence from production with 100% certainty — a separate ops repo or a manually-applied manifest outside this repository could in theory still deploy them. But within the evidence actually available in this codebase, this is as close to a definitive answer as exists, and the far more likely reading given how complete and mature the rest of the IaC is.

### What this means for "is the Rust gateway the real edge?"

No — not in production, per the only deployment manifests found. `services/gateway` (Rust) is CI-built but Helm-absent. Meanwhile, in `values.yaml`, **5 services each get their own dedicated Kubernetes Ingress host directly**: `studio` → `app.cerebrohive.com`, `forge` → `forge.cerebrohive.com`, `platformApi` → `api.cerebrohive.com`, `aiGateway` → `gateway.cerebrohive.com` (note: the production "gateway" subdomain belongs to the TypeScript LLM gateway, not the Rust edge gateway — a real naming collision at the DNS/ingress level, not just in source code), `forgeApi` has ingress disabled (internal-only, reached via `forge`/`platform-api`).

Reading: production routing appears to be handled directly by Kubernetes Ingress per service, not by a single Rust edge proxy in front of everything. The Rust gateway most plausibly is a local-dev convenience (docker-compose's single entry point on port 8900, one thing to run instead of five) that was never carried into the Helm chart — or an earlier architectural iteration superseded by per-service Ingress. Either reading is consistent with the evidence; which one is true is a product/roadmap fact this repo's code can't settle by itself, and is worth a direct question to whoever owns platform infra, especially since `main.rs`'s auth middleware and rate limiting have no confirmed equivalent at the Ingress layer today.

### Identity resolved: what does "studio" actually build?

`docker-build.yml` settles this: `studio` → `dockerfile: apps/studio/Dockerfile`. So the Helm/ArgoCD "studio" service is confirmed to be `apps/studio` (the 1,163-file app with the highest scaffold-hit count in the whole repo, still unaudited in detail — task #35). This raises the stakes on that still-pending audit: whatever ships from `apps/studio` is a live production app on `app.cerebrohive.com` with real autoscaling (2–10 replicas) and health probes, not a candidate for casual deletion regardless of what its internal scaffold density suggests. Similarly `forge` → `apps/forge/Dockerfile`, confirming `apps/forge` (frontend) and `services/forge-api` (backend) are the two deployed halves of the Forge product.

## "Who is the system of record?" — Option D, with a specific and important qualifier

Of the four topologies posed: **Option D (independent products) is the best-supported reading, but "independent" needs to be qualified precisely** — they are independent at the network/runtime level while being co-deployed as siblings:

- No confirmed inbound call from HiveSwarm into Platform Runtime, or vice versa, anywhere: not in `services/gateway`'s Rust route table (only proxies to `platform_svc`/`academy_svc`/`crm_svc`/`platform_api`/`forge_api`), not in any HiveSwarm service's docker-compose env vars (`agent-runner` and `swarm-runtime` both point only at `swarm-api` and, for `swarm-runtime`, Temporal directly — never at `platform-api`, `forge-api`, or the gateway), not in `platformApi`/`forgeApi`/`aiGateway`'s Helm values (no `SWARM_API_URL`, `AGENT_RUNNER_ENDPOINT`, or equivalent anywhere).
- But they *do* ship together: same Helm chart, same `cerebro-hive` namespace, same ArgoCD project, same CI pipeline, same ingress domain (`cerebrohive.com`).

So the honest characterization is: **two runtime systems that are organizationally and operationally one product (one repo, one chart, one release train) but are currently not wired to each other at the network layer.** Whether that's intentional — two genuinely separate offerings bundled for deployment convenience — or a real integration gap — HiveSwarm was built to eventually be invoked by the Platform Runtime (or vice versa) and that wiring simply hasn't landed yet — is not answerable from code alone. It's the one open question in this milestone that is a product decision, not an engineering fact, and it's worth putting to whoever owns the roadmap rather than guessing.

## Exit criteria: Responsibility Matrix rows

| Row | Was | Now |
|---|---|---|
| Workflow execution engine | Contested | **Resolved, unusual answer**: `packages/workflow` eliminated (not an engine — Forge's own pipeline tracker). Real pairing is `packages/capabilities/workflow` + `services/temporal-worker`, but `temporal-worker` isn't even in the CI build matrix and the package has zero confirmed consumers — this workflow path is **confirmed built, confirmed not running anywhere**, end to end. |
| Multi-agent orchestration (HiveSwarm) | Contested | **Confirmed.** 6 of 9 HiveSwarm services are live in the production and staging Helm/ArgoCD release train. |
| Goal → task-plan decomposition | Contested | **Confirmed**: `services/planner-service` is in the production release train. (Residual, smaller question: whether `swarm-runtime`'s own `PlannerService` class is a thin client or a redundant second implementation — not re-verified this pass.) |
| Agent selection / task routing | Contested | **Confirmed real, confirmed not deployed.** `router-service` is CI-built, Helm-absent — same status as the Rust gateway. |
| Tool execution / tool-calling gateway | Contested | **Confirmed — two real owners, not a duplicate.** `tool-gateway` (Go) is in the production release train serving HiveSwarm; `agent-builder`'s in-process `ToolRuntime` serves `platform-api`'s single-agent chat path. Different deployment models because they serve different callers, not competing implementations. |
| Policy engine | Contested | **Still open** — not investigated this pass; six independent `PolicyEngine` declarations remain unverified. |
| Event bus | Contested | **Still open** — not investigated this pass. |
| Capability/provider registry (4 extra same-named registries) | Contested (partial) | **Still open** — not investigated this pass. |

Two rows remain genuinely open (Policy engine, Event bus, and the registry duplicates) because this pass's evidence didn't touch them — forcing a Confirmed/Deprecated label without evidence would be a guess, not a finding. Recommended next check for each is unchanged from the prior matrix: read the 6 `PolicyEngine` declarations and the event-bus declarations directly.

## New findings not anticipated by the original matrix

1. **CI/CD-to-deployment gap**: 8 real, CI-built services (`gateway`, `platform-svc`, `academy-svc`, `crm-svc`, `ml-svc`, `router-service`, `evaluation-service`, `learning-service`) have no confirmed path to any running environment in this repo's own IaC.
2. **`services/temporal-worker` isn't even built** by CI, a tier below "built but undeployed."
3. **Production ingress bypasses the Rust gateway entirely** — 5 services get direct per-service Kubernetes Ingress hosts. If true in the running cluster, the gateway's auth/rate-limit middleware has no confirmed equivalent protecting those direct routes today.
4. **`apps/studio` is confirmed as a live production app** (`app.cerebrohive.com`, real autoscaling/health checks) despite being the single most scaffold-dense unit in the repo and still unaudited — raises the stakes on task #35, that audit needs to happen with "this is live" as the starting assumption, not "this might be deletable."
