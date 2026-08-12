# apps/studio Audit (task #35)

`apps/studio` splits into two entirely separate things that the original M25.4A scan's "1,163 files / 421 scaffold hits" figure didn't distinguish between. Confirmed via file counts (excluding `node_modules`/`.next`/`.turbo`/`dist`):

| Area | Real source files | What it is |
|---|---|---|
| `app/` + `components/` + `lib/` + `src/` | 356 + 433 + 235 + 20 = 1,044 | The actual Next.js frontend — roughly matches the original scan's 1,163, this is what that finding was about |
| `platform/` | 123 | A completely separate backend package, `@cerebrohive/platform`, not counted by the original scan at all |
| `stories/`, `tests/`, `types/` | 23 + 8 + 1 | Storybook / tests / shared types, minor |

Confirmed live in production per Milestone 25.4C (Helm/CI trace) — whatever ships as the `studio` image is `apps/studio/Dockerfile`, so this carries real production stakes, not just repo hygiene.

## The bigger finding: `apps/studio/platform` — a second, undiscovered backend

`platform/package.json`: `"@cerebrohive/platform"`, described as **"CerebroHive Enterprise AI Operating System — domain-driven modular monolith."** Real dependencies: Fastify 5, BullMQ, ioredis, Kysely, NATS, pg, pino, zod. Real scripts: `dev`/`build`/`start`/`migrate`/`openapi`/`cli`. This is not a stub — it's set up to run as its own server.

Its `src/domains/` directory declares **~30 domain verticals**: actions, aiops, cerebroforge, cerebrogrowth, cerebroinsight, cerebrostudio, cerebroswarm, compiler, connect, consulting, context, dataplatform, devops, digitaltwin, evaluation, flow, governance, guard, hivecloud, hiveforge, **hiveops** (the only one with a full DDD layering — api/application/contracts/domain/infrastructure/workers), hub, knowledge, memory, mesh, mlops, observatory, reasoning, research, runtime, secops, simulator, sphere, swarm, web3, zerotrust — plus an `ai/` module (chains/graph/moe/representation/router/world/x) and a `kernel/` (config/context/errors/events/flags/gateway/governance-audit/identity/ids/logging/persistence/policy/telemetry/util).

Only 123 real source files exist across all of that — most domains have exactly **one file**. Read two of them in full (`web3`, `zerotrust`) as a representative sample:

Both are genuinely well-written, not empty stubs: real TypeScript interfaces, a consistent repository/service/policy-check/event-publish pattern shared across the whole codebase, and specific, sensible engineering — `web3`'s `accountLookup` makes a real `fetch`-based JSON-RPC call to actual public chain endpoints (`eth_getBalance`/`eth_gasPrice`/`eth_getTransactionCount`) with a deterministic offline fallback if the call fails; `zerotrust` implements a genuinely sound deny-by-default tool-grant model with short-lived scoped capability tokens and risk-tiered MCP server approval. These read like careful design work, not filler.

But: both persist through `InMemoryWeb3Repository` / `InMemoryZeroTrustRepository` — plain in-memory `Map`s, not the `pg`/`kysely` dependencies the package actually declares. Checked whether this is representative or just these two samples: **zero files anywhere under `platform/src/domains` reference `kysely`, `new Pool`, or `pg.`** — not one of the ~30 domains has a real database-backed repository, despite the package depending on both a Postgres driver and a query builder. Also checked `hiveops` specifically (the most structurally mature domain, with its own `infrastructure/persistence` directory) — that directory exists but is **empty**, no files in it at all.

Also checked whether anything actually calls this backend: **zero references** to it anywhere in `apps/studio`'s own Next.js frontend (`app/`, `components/`, `lib/`) — no base URL, no import, nothing. And it doesn't appear in `.github/workflows/docker-build.yml`'s build matrix or the Helm chart's service list at all — a tier further removed from production than even the CI-built-but-Helm-absent services found in Milestone 25.4C (those at least get a container image built).

**Conclusion**: `apps/studio/platform` is a real, coherent, surprisingly well-engineered single-codebase simulation of a full "enterprise AI operating system" — broad, consistent, thoughtfully designed — but entirely in-memory, completely disconnected from the rest of the platform, and not part of any build or deploy pipeline. It reads like something built to demonstrate architectural breadth rather than to run in production. Worth a direct question to whoever built it about whether any of these ~30 domains are meant to become real, or whether this was always meant as a design exercise / pitch artifact.

## The frontend (`app/`, `components/`, `lib/`, `src/`) — not re-audited in detail this pass

This is the part the original M25.4A scan's 421-scaffold-hit figure was actually describing. Given it's confirmed live in production (Milestone 25.4C), and given the 1,044 real files here are far too many to read individually in this pass, this wasn't re-verified beyond the original scan's pattern-matching. Recommend a targeted follow-up rather than a blanket read: sample the highest-traffic routes first (whatever's linked from the main nav / gets the most production traffic, which isn't knowable from the repo alone) rather than reading top-to-bottom.

## Net for task #35

The `platform/` discovery is the highest-value finding this pass — a previously-uncounted, structurally significant, fully-orphaned second backend inside a production frontend app. The frontend's own scaffold density from the original scan stands as previously reported; re-verifying it file-by-file wasn't completed given the volume, and is the honest gap in this task rather than something to claim as done.
