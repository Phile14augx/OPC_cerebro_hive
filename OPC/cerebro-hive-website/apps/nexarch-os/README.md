# Cerebro Nexarch OS

Personal operator command center for **Cerebro Nexarch** — a one-person company run by a company of agents. Architecture is adapted from [FounderOS-DEMO](https://github.com/Bennettxai/FounderOS-DEMO): repository layer, honest connector status, seeded pages that are real-ready.

Port **3410**. Operator: Philemon.

## Quick start

From `OPC/cerebro-hive-website`:

```bash
pnpm install
pnpm --filter @cerebro/nexarch-os dev
```

Open http://localhost:3410. SQLite seeds on first touch. No API keys required.

```bash
pnpm --filter @cerebro/nexarch-os test
pnpm --filter @cerebro/nexarch-os typecheck
pnpm --filter @cerebro/nexarch-os seed
```

## Contract

- Pages and API routes read through `lib/db.ts`. Never query SQLite from a view.
- Zod validates every row on the way out (`lib/schemas.ts`).
- Connectors return `connected` | `not_configured` | `error`. Never a fake green light.
- Every seeded agent has `RuntimeAgent.run()`. Dispatcher queues `PlatformJob` as **QUEUED** when Postgres is configured, or refuses `not_configured`. HiveOps never stamps SUCCEEDED unless a worker recorded it.

See [docs/operations/runbooks/nexarch-os-bootstrap.md](../../docs/operations/runbooks/nexarch-os-bootstrap.md).
