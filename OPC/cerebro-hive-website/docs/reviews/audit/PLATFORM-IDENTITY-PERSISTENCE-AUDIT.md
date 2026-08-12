# `apps/studio/platform` — Identity & Persistence Audit

## Headline answer

**Postgres-backed, not in-memory, under the actual VPS deployment configuration.** The default is safe, not the dangerous one. There is one real, narrower caveat below (a ~20-second data-loss window on unclean restarts for everything *except* identity/audit), not the "everything is wiped on restart" worst case this audit was opened to rule out.

## 1. Repository binding — traced end to end

`apps/studio/platform/src/app/container.ts`, `buildPlatform()`:

```ts
let identityRepo: IdentityRepository = new InMemoryIdentityRepository();
let auditRepo: AuditRepository = new InMemoryAuditRepository();
...
if (opts.withDatabase) {
  const applied = await migrate(config.DATABASE_URL);
  db = createDb(config.DATABASE_URL);
  identityRepo = new PgIdentityRepository(db);
  auditRepo = new PgAuditRepository(db);
  snapshots = new SnapshotPersistence(config.DATABASE_URL, logger);
}
```

`identityRepo`/`auditRepo` default to in-memory, then get swapped for real Kysely/`pg`-backed implementations if and only if the caller passes `withDatabase: true`.

The caller is `apps/studio/platform/src/main.ts`, the actual process entry point:

```ts
const platform = await buildPlatform({
  withDatabase: process.env.PLATFORM_NO_DB !== "1",
  ...
});
```

**`withDatabase` defaults to `true`.** It only becomes `false` if an operator explicitly sets `PLATFORM_NO_DB=1`. That's the deciding switch.

## 2. Is that switch actually flipped to "in-memory" on the VPS?

Checked `scripts/deploy/vps-deploy.sh` directly: it provisions a real Postgres container (service `db`), and injects into the `platform` container:

```
DATABASE_URL: postgresql://cerebrohive:${PG_SUPER_PASS}@db:5432/cerebro_platform
```

`PLATFORM_NO_DB` does not appear anywhere in the script. So under the deployment this repo actually automates, `withDatabase` evaluates to `true`, and `identity`/`audit` are real Postgres repositories, not in-memory ones.

One caveat on this specific point: this is inference from source + deploy script, not a live check against the running container's actual environment (no SSH access was used or available in this pass). If you want this fully closed out, the fastest live confirmation would be checking the deployed container's env (`docker exec <platform container> env | grep PLATFORM_NO_DB`) or its startup log line — `main.ts` logs `{ port, bus, db: !!platform.db }` on boot, so the log itself states whether `db` came up true or false.

## 3. `PgIdentityRepository` — confirmed real, not a stub

Read in full (`kernel/identity/pg.ts`): genuine Kysely query builder calls (`insertInto`/`selectFrom`/`updateTable`) against `organizations`, `users`, `workspaces`, `api_keys` tables. API keys are stored as SHA-256 hashes only (`findApiKeyByHash`), never plaintext. This is a real, durable, per-write persistence layer — not a snapshot or cache.

## 4. The part that's genuinely still in-memory, unconditionally

All ~30 domain verticals (`web3`, `zerotrust`, `governance`, `memory`, `knowledge`, `guard`, `runtime`, `mesh`, `flow`, `evals`, `connect`, `hub`, `simulator`, `sphere`, `consulting`, `devops`, `mlops`, `secops`, `aiops`, `router`, `compiler`, `swarm`, `actions`, `digitalTwin`, `research`, `dataPlatform`, `hiveForge`, `cerebroStudio/Swarm/Insight/Growth/Forge`, `hiveCloud`) are constructed as `InMemory*Repository` **unconditionally** in `container.ts` — there is no `if (opts.withDatabase)` branch for any of them individually. This confirms and narrows the earlier `APPS-STUDIO-AUDIT.md` finding: it's accurate that these domains have no dedicated table-backed repository each.

What that finding missed, because the earlier pass only sampled two domain files and didn't read `container.ts` or `snapshots.ts`: **there is a real, working, whole-platform durability mechanism sitting underneath all of them.**

`kernel/persistence/snapshots.ts`'s `SnapshotPersistence`, only instantiated when `withDatabase: true`:
- On boot: creates `platform_snapshots (name text PRIMARY KEY, data jsonb, updated_at)` if missing, then restores every registered domain's full state from its last saved row.
- Every 20 seconds (`intervalMs = 20_000`, not configurable via env in the code as read): dumps every registered domain's entire in-memory state (via `.dump()` on each `Map`/array wrapper) and upserts it into `platform_snapshots`.
- On graceful shutdown (`stop()`, called from `main.ts`'s `SIGINT`/`SIGTERM` handler): does one final flush before exiting.

Every one of the ~30 domains is registered with this mechanism in `container.ts` (see the `snapshots.register(...)` block, ~30 calls). This is not a stub or aspiration — it's a complete, working implementation, and it's a reasonable engineering choice for a single-node deployment: real durability without needing 30 separate table schemas yet.

## 5. Net persistence picture (what survives a VPS restart)

| Data | Mechanism | Durability |
|---|---|---|
| Organizations, users, workspaces, API keys | `PgIdentityRepository` (real Postgres, per-write) | Full — survives any restart, including a crash |
| Audit log | `PgAuditRepository` (real Postgres, per-write) | Full — same as above |
| All ~30 domain verticals (web3, governance, workflows, memory, etc.) | In-memory + `SnapshotPersistence` (20s interval, flush-on-graceful-shutdown) | Survives a **graceful** restart (deploy, `docker compose restart`, SIGTERM) with zero loss. Survives an **unclean** crash (OOM kill, host power loss) with up to ~20 seconds of the most recent writes lost — not full ephemerality. |
| PolicyEngine's rules | Hardcoded in source (`ROLE_GRANTS`, two ABAC rules) | N/A — not runtime state, nothing to lose |

## 6. Answers to the four framing questions

1. **Repository binding**: PostgreSQL for identity/audit, by default, confirmed via both the DI code and the deploy script's env injection.
2. **Bootstrap path**: `main.ts` → `buildPlatform({ withDatabase: process.env.PLATFORM_NO_DB !== "1" })`. Single environment-variable switch, defaulting to the durable path.
3. **Persistence guarantees**: identity/audit are always durable when the DB is wired (the default). The 30 domain verticals are durable to within a 20-second window via snapshotting, not per-write — a real but bounded gap, not "everything is ephemeral."
4. **Operational impact of a VPS restart**: under the deployed configuration, API keys, identities, and workspaces are fully retained. Domain-vertical data (web3 grants, governance approvals, workflow runs, etc.) is retained except for whatever was written in the last ~20 seconds before an unclean stop.

## 7. What would make this fully closed rather than well-supported

- ~~Confirming the `db` Postgres container has a persistent volume~~ — **checked**: `vps-deploy.sh`'s compose block mounts `postgres_data:/var/lib/postgresql/data` as a named Docker volume, so the database survives container recreation/redeploy, not just in-process restarts. This closes what would otherwise have been the biggest remaining risk (durable-looking app logic sitting on top of a non-durable disk).
- Still open: live confirmation that `PLATFORM_NO_DB` isn't set on the actual running container (a log line or `docker exec ... env` check — both need real access this pass didn't have; `main.ts` logs `db: !!platform.db` on boot, so the running container's own log line would settle this immediately if you have access to it).
- Whether `snapshots.intervalMs` (20s default) is ever overridden — `SnapshotPersistence`'s constructor accepts it as a parameter but `container.ts` doesn't pass one, so 20s is what's actually in effect.
