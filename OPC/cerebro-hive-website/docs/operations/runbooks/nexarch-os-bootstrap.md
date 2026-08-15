# Runbook — Nexarch OS local bootstrap

Personal operator OS for Cerebro Nexarch. Lives at `apps/nexarch-os`, port **3410**.

## Start

1. From `OPC/cerebro-hive-website`: `pnpm install`.
2. Optional: copy `apps/nexarch-os/.env.example` to `apps/nexarch-os/.env.local`. Leave keys empty unless you want a live connector.
3. `pnpm --filter @cerebro/nexarch-os dev`
4. Open http://localhost:3410. SQLite file: `apps/nexarch-os/data/nexarch-os.db` (gitignored). Seeded on first touch.

## Commands

| Command | What |
|---|---|
| `pnpm --filter @cerebro/nexarch-os dev` | Next.js on :3410 |
| `pnpm --filter @cerebro/nexarch-os test` | Node test runner (in-memory SQLite) |
| `pnpm --filter @cerebro/nexarch-os typecheck` | `tsc --noEmit` |
| `pnpm --filter @cerebro/nexarch-os seed` | Idempotent re-seed (`force` via deleting the db file first) |
| `pnpm --filter @cerebro/nexarch-os build` | Production build |

## Demo script (day 15)

1. Console `/` — pulse row, connection strip (all `not_configured` unless env is set), agent list, knowledge core.
2. Org `/org` — Philemon → Nexarch → seven pillars → workers. Broadcast a message.
3. Agents `/agents` — Run Conductor, then Dispatcher (must refuse, not fake SUCCEEDED).
4. Comms `/comms` — open Northwind Health thread. Reply marks local status; IMAP stays `not_configured`.
5. Brain `/brain` — query `execution plane`. Promote a claim to a fact.

## Add an agent

1. Add a row in `lib/seed.ts` `AGENTS` with a stable `id`.
2. Add a matching `RuntimeAgent` in `lib/agents/nexarch.ts` with `run()`.
3. `tests/seed.test.ts` fails if seed and runtime ids drift.
4. New data also needs a repo method + Zod schema + test.

## Hive deep links

Defaults: Studio `http://localhost:3401/app`, Forge tools `/app/forge/projects`, Archive `/app/archive`, platform-api `:3406/health`, forge-api `:4005/health`. If those services are down, Connections shows `error`, not connected.

## Prisma / Hive control plane (day 16+)

SQLite remains the operator store. Pages still go through `lib/db.ts`. The Hive plane is a repo-level adapter in `lib/hive.ts`.

| Nexarch | Hive | When |
|---|---|---|
| `hive_jobs` | `PlatformJob` INSERT **QUEUED** | `DATABASE_URL` + `NEXARCH_WORKSPACE_ID` |
| Dispatcher | `scripts/agent-dispatch.mjs --dry-run` | `NEXARCH_DISPATCH_DRY_RUN=1` |
| Brain query | `Embedding.vector <=>` then grep | `DATABASE_URL` + `OPENAI_API_KEY` |
| Claim promote | `Memory` + `MemorySnapshot` | `NEXARCH_PRISMA_AGENT_ID` |
| GitHub inbox | `GET /notifications` upsert | `GITHUB_TOKEN` |

Never stamps `SUCCEEDED` from Nexarch OS. Empty env stays `not_configured`. Live connector probes run on `/integrations`.

Do not rewrite pages. Swap adapters, keep Zod outbound validation.

Never commit `.env.local` or `data/*.db`.
