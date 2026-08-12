# Helm Chart Reconciliation Plan

## Major update, discovered while implementing Tier 1 fixes: Set 1 cannot render at all

While porting Set 1's topology-spread behavior into Set 2's macro, checked `_helpers.tpl` for the helper it uses (`cerebro-hive.topologySpreadConstraints`) — **that helper isn't defined anywhere in this chart.** Checked the rest of the chart's `{{- define` blocks to be sure (only `_helpers.tpl` exists as a partials file; the complete list of defined templates is `cerebro-hive.name`, `.fullname`, `.chart`, `.labels`, `.selectorLabels`, `.serviceAccountName`, `.imageTag`, plus `cerebro-hive.service` defined locally in `deployments.yaml`).

Set 1 (`service.yaml`'s top block, `deployment.yaml`, `rollout.yaml`) calls at least six template names that don't exist under those names anywhere in the chart: `cerebro-hive.serviceLabels`, `cerebro-hive.serviceSelectorLabels`, `cerebro-hive.image`, `cerebro-hive.podSecurityContext`, `cerebro-hive.containerSecurityContext`, `cerebro-hive.otelEnv`. It also calls `cerebro-hive.serviceAccountName` with a different argument shape (`dict "svc" ... "cfg" ...`) than the one that's actually defined (`cerebro-hive.serviceAccountName` takes a single root context, matching how Set 2 calls it).

**This means Set 1 cannot have ever successfully deployed anything.** `helm template`/`helm install` fails on the first unresolvable `include` it hits — there's no partial success, the whole render fails. This resolves the earlier uncertainty (previously stated as "can't tell which one wins without a live render") completely: it's not close, it's not environment-dependent, Set 2 is the only one of the two that has ever been capable of working. The earlier concern about an Argo Rollout and a plain Deployment actively fighting over the same pods for `studio`/`ai-gateway` doesn't apply either — `rollout.yaml` is part of the broken set, so no Rollout object has ever been created by this chart.

Practical effect on this plan: lower risk than previously framed. Deleting Set 1 doesn't require reconciling two things that were both live — only one of them ever worked. The migration below is updated accordingly (steps are simpler; no "verify nothing regresses from the working one" caveat is needed for Set 1 itself, since it was never the working one).

Planning document only — nothing in `infra/helm/` has been touched. Written per the structure requested: canonical deployment model, canonical values schema, rollout strategy, ingress ownership, CI validation, migration plan. Builds on `audit/P0-AUTH-AUTHZ-GAP.md`'s root-cause tracing (two schemas: snake_case/`.replicaCount` in `service.yaml`+`deployment.yaml`+`rollout.yaml`, camelCase/`.replicas` in `deployments.yaml`'s macro).

## New finding while drafting this, worth surfacing before the recommendation

Neither template generation mounts `cerebro-hive-ai-secrets` onto `platform-api`'s pod. The conditional that adds that secret (`{{- if or (eq $svcName "ai-gateway") (eq $svcName "forge-api") }}`, present in both `deployment.yaml` and `rollout.yaml`) only ever fires for `ai-gateway` and `forge-api`. `platform-api` is the service that actually calls `createGateway()` in-process, and `createGateway()` reads `ANTHROPIC_API_KEY`/`OPENAI_API_KEY` directly from `process.env`, enabling a provider only if the key is present. This repo doesn't contain the secret's actual contents, so the conclusion has to stay conditional: **if `cerebro-hive-ai-secrets` is what carries those provider keys, then `platform-api` will initialize with zero enabled providers, because that secret is never mounted into its pod** — every `agentRuntimeService.execute()` call that reaches the LLM would fail with `GatewayError('No available provider', ...)`. That conditional holds regardless of which template generation wins — the gap is present in both. Worth confirming what's actually inside that secret before treating this as settled, but worth fixing either way once confirmed, rather than carrying it forward into whichever generation survives.

## 1. Canonical deployment model

Recommendation: **keep `deployments.yaml`'s macro as the structural base, and port the real maturity Set 1 has that Set 2 is missing into it.** Reasoning, not just preference:

- Set 2 is the only one of the two that covers all 11 deployed services. Standardizing on Set 1 would mean writing Deployment/Service/HPA/PDB templates for all 6 HiveSwarm services from scratch — strictly more work, rebuilding something that already exists and works.
- Set 2 is also the better-engineered of the two mechanically — one reusable named template invoked 11 times, versus Set 1's same service-dict pattern hand-copied across three separate files (`service.yaml`, `deployment.yaml`, `rollout.yaml`). Fewer places for the next drift to start.
- But Set 1 has real things Set 2 lacks, and losing them would be a regression, not a cleanup: it injects `PORT` correctly, mounts a `db-migrate` initContainer for `platform-api` (`pnpm prisma migrate deploy` — if Set 2 is genuinely what's running today, database migrations may not be running automatically at all), mounts `cerebro-hive-ai-secrets` for the services that need it (once the platform-api gap above is also fixed), and sets pod anti-affinity + topology spread constraints that Set 2 doesn't have.

Net recommendation: **one template generation, built on Set 2's coverage and structure, with Set 1's PORT injection / initContainer / secret-mounting / scheduling behavior folded in.** Not a straight "pick one file, delete the other" — the surviving file needs a few real additions first.

Those additions split cleanly into three tiers, worth sequencing rather than doing all at once:

- **Tier 1 — correctness** (changes actual application behavior, do first): PORT injection, the `platform-api` `db-migrate` initContainer, secret mounting including the `platform-api`/`cerebro-hive-ai-secrets` gap above.
- **Tier 2 — availability** (improves resilience, doesn't change semantics): pod anti-affinity, topology spread constraints, PodDisruptionBudget, autoscaling parity with what `values-production.yaml` intends.
- **Tier 3 — operational quality** (prevents the next drift, not urgent for correctness): the CI checks in §5.

## 2. Canonical values schema

Recommendation: **camelCase keys, `.replicas` field** — i.e., standardize on what `values.yaml` (base) and `values-staging.yaml` already use, since that's what the surviving template (Set 2, per above) already reads.

This means `values-production.yaml` needs a real rewrite, not a light edit: every snake_case top-level key (`platform_api`, `forge_api`, `ai_gateway`) renamed to camelCase, and every `replicaCount` field renamed to `replicas`. Worth doing carefully rather than mechanically, since this is the one values file that's actually carrying real production-tuned numbers (3 replicas, higher resource limits, wider HPA range, PDBs) that are currently dead weight — this is the fix that makes those numbers start applying to something.

## 3. Rollout strategy

This one has a real product question in it I wouldn't decide unilaterally: **is canary deployment via Argo Rollouts still wanted for `studio` and `ai-gateway`?** If yes, that capability needs to be ported into the consolidated template (as a conditional branch — Rollout instead of Deployment for those two names, matching what `rollout.yaml` already does correctly) rather than dropped. If the answer is "that was aspirational and never actually used," dropping it simplifies things further. Either way, the goal is one explicit, documented answer per service — not the current state where the answer differs depending on which of two files you read.

## 4. Ingress ownership

Two candidates here too, and they're not equivalent: the standalone `templates/ingress.yaml` (single shared Ingress, all 4 public hosts) carries the real security annotations — ModSecurity/OWASP CRS, `limit-rps`, the security headers. Set 2's per-service Ingress block (inside the `deployments.yaml` macro, fires when `$cfg.ingress.enabled`) only sets TLS + ssl-redirect, none of the WAF/rate-limit/header annotations.

Recommendation: **keep the shared `ingress.yaml` as the sole Ingress definition** (it's the one with real protections already built in) **and remove the per-service Ingress block from the macro**, rather than the other way around. Standardizing on the per-service version would mean re-adding the WAF/rate-limit/header annotations to a macro instead of one shared file — more places for them to drift out of sync later.

## 5. CI validation

Once there's one template generation, add a CI step that renders the chart against each values overlay and fails the build on:

- **Duplicate resource identity** — more than one rendered object sharing the same `(apiVersion, kind, namespace, name)`. This is exactly the class of bug this whole investigation started from; a render-and-diff check would have caught it immediately.
- **Unconsumed override keys** — any key present in `values-production.yaml`/`values-staging.yaml` that doesn't correspond to anything the base schema or template actually reads. This is what would have caught the snake_case/camelCase mismatch on day one instead of it sitting silent.
- **Missing required secrets/env** — a lightweight check that every service referencing a provider API key (`ANTHROPIC_API_KEY`, etc. — greppable from source) actually has a matching `envFrom`/`secretRef` in its rendered manifest. Would have caught the `platform-api` / `cerebro-hive-ai-secrets` gap above.
- **Runtime dependency contract check** — generalizing the point above: for each service, declare the env vars/secrets its code actually reads (`platform-api` needs `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `DATABASE_URL`; each service has its own list), then assert the rendered manifest sources every one of them from a Secret, ConfigMap, or explicit `env` entry. This is the general form of the exact bug class found here — application code assuming a dependency that the deployment template never actually injects — so it's worth building as a standing contract rather than a one-off check for this specific secret.

Mechanically: `helm template` renders fine without a live cluster, so this doesn't need cluster credentials — it can run on every PR. A short script (any language) can parse the multi-doc YAML output and check for duplicate identities; that's the highest-value, cheapest check to land first.

## 6. Migration plan

1. Freeze both template generations as-is (no further edits) until the plan below executes — avoids new drift accumulating on top of existing drift.
2. Port Set 1's missing behavior (PORT injection, `platform-api` db-migrate initContainer, secret mounting including the platform-api gap found above, anti-affinity/topology spread, optionally Rollout support pending the product answer in §3) into Set 2's macro.
3. Rewrite `values-production.yaml` to the camelCase/`.replicas` schema, preserving its actual numbers (3 replicas, resource limits, HPA range, PDBs) under the correct keys.
4. Delete `service.yaml`'s top block, `deployment.yaml`, and `rollout.yaml` (or fold Rollout support directly into the macro per §3 first, then delete). Delete the per-service Ingress block from the macro per §4.
5. Add the CI render-and-check step from §5 before merging the above, so the consolidation itself is verified rather than trusted.
6. Validate rendered manifests for every environment (`values.yaml` alone, `+values-staging.yaml`, `+values-production.yaml`) show exactly one Deployment/Service/Ingress per service, with the expected replica/resource numbers per environment.
7. Deploy to staging first, confirm behavior matches the rendered manifest (this is also the point to run the four auth-verification tests from Milestone 25.5 that were left inconclusive earlier).
8. Promote to production once staging confirms no regression, ideally via the existing canary mechanism if §3 keeps it.

## Migration log

**Step 4 executed.** Deleted `infra/helm/cerebro-hive/templates/service.yaml`, `deployment.yaml`, and `rollout.yaml`.

Reason for removal: these templates implemented a second, snake_case/`.replicaCount` schema (Set 1) that called at least six Helm helper templates (`cerebro-hive.serviceLabels`, `.serviceSelectorLabels`, `.image`, `.podSecurityContext`, `.containerSecurityContext`, `.otelEnv`) that are not defined anywhere in this chart — `helm template`/`helm install` would fail on the first unresolvable `include`, so this generation could never have rendered, let alone been deployed. The chart now has a single authoritative deployment path: the macro-based `deployments.yaml`, using the camelCase values schema (`values.yaml`, `values-staging.yaml`, the rewritten `values-production.yaml`).

Pre-deletion verification (per the explicit checklist this removal was gated on):
- No `.github/workflows` file references `deployment.yaml`, `service.yaml`, `rollout.yaml`, or the snake_case schema keys (`replicaCount`, `platform_api`, `forge_api`, `ai_gateway`) — confirmed clean.
- No documentation instructs users to use those templates.
- No tests or scripts reference them — confirmed while reading through `scripts/deploy/` in full during the deployment-architecture investigation (`audit/DEPLOYMENT-ARCHITECTURE-DISCOVERY.md`); `vps-deploy.sh` and `ssh-deploy.yml` deploy an entirely separate, non-Kubernetes system and never touch the Helm chart.

This repo has no chart-level `README.md` under `infra/helm/cerebro-hive/` and no repository-wide `CHANGELOG.md` to update alongside this change — this migration log entry is the record of the change until/unless one of those is introduced.

**New finding surfaced while verifying the deletion, not yet acted on**: `templates/hpa.yaml` and `templates/pdb.yaml` are separate top-level templates that appear to be leftovers from the same Set-1 schema generation that was just removed. They key off `.Values.platform_api`/`.Values.forge_api`/`.Values.ai_gateway` (snake_case — nonexistent in the current schema, so those three services are silently skipped) and off a per-service `$cfg.hpa.enabled` / `$cfg.pdb.enabled` field that isn't set anywhere in `values.yaml`, `values-staging.yaml`, or the rewritten `values-production.yaml` — meaning, as far as could be determined by reading the values files, these two templates currently render nothing for any service, for any environment. This wasn't part of what was approved for deletion (the three named Set 1 files), so it hasn't been touched — flagging it as a likely-dead-code finding for a follow-up decision rather than deleting unilaterally. If confirmed dead, removing them would be the same class of cleanup as this one; `deployments.yaml`'s macro already renders its own HPA (`$cfg.autoscaling`) and PDB (chart-global `podDisruptionBudget`) blocks, so nothing would be lost.

Nothing else in this plan has been executed — the rest remains a plan, per the original instruction to draft rather than implement beyond this approved step.
