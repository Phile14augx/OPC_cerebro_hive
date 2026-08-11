# `services/platform-api` — Orphaned Tree Classification

**Status:** Classification complete. No implementation, deletion, or archival action taken — per scope, this document records findings and a recommendation only.

**Origin:** surfaced during the HiveForge Slice 4 provider inventory (`packages/domain-model/README.md`), which noted `services/platform-api` (distinct from `apps/platform-api`) is a source tree with no `package.json` at all. This document is the dedicated follow-up.

## What is actually there

`services/platform-api/` contains only a `src/` directory: `app.ts`, `server.ts`, a `middleware/request-logger.ts`, and 14 route files (`admin.ts`, `agents.ts`, `ai.ts`, `api-keys.ts`, `auth.ts`, `billing.ts`, `evaluations.ts`, `health.ts`, `knowledge.ts`, `models.ts`, `orgs.ts`, `prompts.ts`, `traces.ts`, `workflows.ts`) — roughly 2,150 lines. There is **no `package.json`, no `tsconfig.json`, no `Dockerfile`, no test file, no lockfile** anywhere in the tree.

It is an Express application (`express`, `helmet`, `cors`, `compression`, `express-rate-limit`), importing `@cerebro/config`, `@cerebro/auth`, `@cerebro/errors`, `@cerebro/db`, and `@cerebro/queue` (NATS) — all five of which are real, existing packages in this monorepo, not fictional references.

## Is it wired into the build system? No — confirmed structurally, not assumed

The root `pnpm-workspace.yaml` globs `services/*` as a workspace package location. A package under `services/*` is only recognized as a pnpm workspace member if it has a `package.json`. `services/platform-api` has none, so:

- It cannot be `pnpm install`'d, linked, built via Turborepo, or run via any repo-wide script.
- Its imports (`@cerebro/config`, etc.) could never actually resolve at install time — there is no `node_modules` symlink for them to resolve through, because pnpm never registered this directory as a package.

This is not unique to `platform-api` — **20 of the 34 directories under `services/`** have no `package.json` (`academy-svc`, `agent-runner`, `archive-api`, `crm-svc`, `evaluation-service`, `gateway`, `gateway-api`, `hiveops-api`, `identity-api`, `knowledge-ops`, `learning-service`, `ml-svc`, `planner-service`, `platform-api`, `platform-svc`, `router-service`, `search-api`, `swarm-api`, `temporal-worker`, `tool-gateway` — counted directly, `platform-api` among them). This is a repository-wide scaffolding pattern, not a `platform-api`-specific anomaly, and is consistent with the scale of scaffold/prototype code this repository's earlier audits (`audit/scaffold-ranking.md`, `audit/orphan-candidates.md`, the M25.4A recon) already documented elsewhere. Those earlier audits' package-consumer tables did not catch this directory specifically, because their tooling enumerated pnpm workspace members (which requires a `package.json`) rather than raw directory listings — this is a genuinely new finding, not a re-confirmation of an old one.

## Does the code even compile against its own declared imports? No — checked directly

Most of the imports resolve to real, existing exports: `requireAuth`/`requirePermission`/`requireOrgAccess` (`@cerebro/auth`), `getPlatformApiConfig` (`@cerebro/config`), `asyncHandler`/`ValidationError`/`ConflictError` (`@cerebro/errors`), `queue.connect`/`queue.disconnect` (`@cerebro/queue`), and `userRepository`/`apiKeyRepository`/`auditRepository`/`prisma` (`@cerebro/db`) are all real.

But `routes/orgs.ts` imports `orgRepository` from `@cerebro/db` — **this does not exist**. `@cerebro/db/src/repositories/` contains `agent`, `audit`, `evaluation`, `knowledge`, `prompt`, `user`, and `workflow` repositories only; there is no `org.repository.ts` and no `orgRepository` export anywhere in the package (checked directly, not inferred from a name search miss). Since `app.ts` unconditionally mounts `orgsRouter`, the application as written would fail to import/compile even if it were wired into the workspace today. This rules out "recently working, just disconnected" — it was never in a runnable state as committed.

## Is this a duplicate of `apps/platform-api`?

**No — materially different, not a duplicate.** Four concrete differences:

1. **Framework:** `services/platform-api` is Express; `apps/platform-api` is Fastify (`fastify`, `@fastify/swagger`, `@fastify/type-provider-typebox`).
2. **Route surface:** `services/platform-api` covers `auth`, `orgs`, `workflows`, `agents`, `knowledge`, `ai`, `billing`, `api-keys`, `admin`, `prompts`, `evaluations`, `traces`, `models` — a broad, SaaS-platform-shaped surface (organization/member management, billing, API key issuance, admin). `apps/platform-api` covers `agents`, `workflows`, `conversations`, `runtime`, `telemetry`, `health` — an agent-runtime-shaped surface, with real, working `AgentRuntimeService`/`ToolRuntime`/provider-registry wiring built out across this session's earlier engineering work (Epics 1-4).
3. **No overlap in what's actually implemented:** `apps/platform-api` has no `orgs`/`billing`/`api-keys`/`admin` modules at all today — `services/platform-api`'s coverage of those concerns is not redundant with anything that currently exists in the active service.
4. **Data layer:** `apps/platform-api` depends on `@cerebro/database` (note: singular vs. `@cerebro/db` — a different package name, worth noting as its own minor naming inconsistency, not investigated further here) and `@cerebro/domain`; `services/platform-api` depends on `@cerebro/db` and calls Prisma directly via `server.ts`.

## Classification

**Abandoned/incomplete parallel implementation — not a future vertical slice plan, not dead weight in the trivial sense, and not a duplicate.** The code is substantive and not merely scaffolded stubs — `routes/orgs.ts`, for instance, has real validation, permission checks, and audit-log recording on every mutating endpoint, not placeholder handlers. But it was never wired into the workspace (no `package.json`), never buildable, and — per the missing `orgRepository` — never actually compiled successfully even in isolation. There is no forward-looking document (HiveForge or otherwise) that references this tree as a planned future slice. It reads as a genuine, substantial work-in-progress attempt at a broader "platform API" (organizations, billing, API keys, admin) that was set aside before being finished or connected, most likely superseded in direction by the Fastify-based, modular `apps/platform-api` that has since received the repository's real ongoing engineering investment.

## Recommendation

**Archive, don't adopt, don't silently delete.**

- **Don't adopt as-is:** wiring it into the workspace today would require adding a `package.json`, fixing the `orgRepository` import, reconciling the `@cerebro/db` vs. `@cerebro/database` split, and deciding whether the repo wants two different HTTP frameworks (Express and Fastify) for two platform APIs — none of that is a small change, and none of it was asked for here.
- **Don't delete outright:** the `orgs`/`billing`/`api-keys`/`admin` route logic is a real, usable reference for whichever future slice eventually implements HiveForge's Business Platform (Phase 5 — Organization, BillingAccount, quota/API-key concerns already specified at the architecture level in `hiveforge/05-BUSINESS-PLATFORM.md`) inside `apps/platform-api`'s Fastify module structure. Deleting it would throw away legitimate design reference material for no benefit, since it isn't costing anything by sitting unbuilt (pnpm never touches it).
- **Concretely:** move `services/platform-api` under a clearly-labeled `archive/` or `_unwired/` location (or, at minimum, add a short `NOTES.md` inside the existing directory) stating plainly that this tree is not a pnpm workspace member, does not compile as committed (missing `orgRepository`), and is retained only as design reference for a future Business Platform slice — not as a service anyone should attempt to run or extend directly.
- This recommendation intentionally mirrors the broader pattern already flagged above (17 similar `services/*` directories with no `package.json`) — a repository-wide governance decision about how to handle all of them consistently is a separate, larger exercise than this single-tree classification, and is not undertaken here.

## What this does not decide

Whether the broader 17-directory `services/*` scaffold pattern gets a repository-wide policy (archive all, delete all, evaluate each individually) is a separate governance question, out of scope for this review. Whether HiveForge's future Business Platform slice actually reuses any of this route logic, or is written fresh against `apps/platform-api`'s Fastify/module conventions, is a future implementation decision, not resolved here.

## Implementation changes made

None. Per scope, this is a classification-and-recommendation document only.
