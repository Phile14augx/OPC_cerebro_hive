# Twin Studio Phase 1 Architecture

Twin Studio (`apps/twin-studio`, port `3401`, base path `/app`) is a modular monolith. PostgreSQL is the authoritative store. Process-local maps are not used for twin identity, current state, history, versions, proposals, or scenarios.

## Data path

```text
UI (Command Center)
  -> Next.js route handlers
    -> authenticated tenant/workspace scope
      -> Zod command validation
      -> definition policy check (proposals)
      -> TwinRepository (packages/db)
      -> Prisma models
      -> PostgreSQL
```

Current-state projection is updated only after a historical `TwinEntityState` row is written. Projection uses business-effective time, then ingestion time, and does not overwrite a newer effective observation with an older one.

## Ports

Twin Studio exclusively binds `3401` at `/app`. HivePulse (`apps/studio`) binds `3405`.

## Authentication

Production and `TWIN_STUDIO_DEV_AUTH=disabled` require a session token and `x-workspace-id` that matches a workspace the user belongs to. Local development ignores `x-workspace-id` and uses the seeded tenant/workspace only.

## Observations

- **OBSERVED**: ingested through `POST /api/twins/:id/state` from the Live state panel.
- **SIMULATED**: written only by the labeled simulator tick. This is not live telemetry.

## Ask Twin

Ask Twin calls OpenAI or Anthropic with the stored twin projection as the only evidence. Missing API keys return `LLM_UNAVAILABLE` instead of a fabricated answer. If a configured model still proposes a measurement that is not in stored state, Twin Studio rewrites the answer to an explicit evidence refusal and does not return the invented number.

## Version pipeline

`generate` (industry provider or manual clone)
  -> `TwinDefinitionSchema`
  -> `evaluateTwinDefinitionPolicy`
  -> preview proposal (`schemaValid` / `policyValid`, not live)
  -> explicit human approval (`approved: true`)
  -> serializable transaction: claim proposal, allocate version number, archive previous published version, activate new version

Unapproved generated output cannot mutate an active twin. Rejection leaves live state unchanged.

## Genericity

Factory Alpha (manufacturing motor/line) and Northstar Hospital ICU (bed/zone) are seeded through the same repository. Airport, banking, supply-chain, and other briefs use the deterministic industry generator and the same create/proposal/apply APIs. Observation simulation keys off definition variables, not `if (industry === ...)`.

## Phase 1 non-goals

Knowledge graph persistence, industrial connectors, dedicated TSDB, model registry, optimization, autonomous agents, 3D/spatial, marketplace, and multi-twin federation remain deferred. Phase 2 adds a safe in-process rule evaluator, persisted `TwinEvent` rows, and a relationship graph inferred from persisted entities. See `docs/architecture/twin-studio-phase-2.md`.

## Local commands

```bash
# from repo root, with PostgreSQL available
cp apps/twin-studio/.env.example apps/twin-studio/.env.local
# set DATABASE_URL to the same database used by packages/db
# set OPENAI_API_KEY or ANTHROPIC_API_KEY for Ask Twin

pnpm --filter @cerebro/twin-studio dev
pnpm --filter @cerebro/twin-studio test
pnpm --filter @cerebro/twin-studio typecheck
pnpm --filter @cerebro/twin-studio lint
pnpm --filter @cerebro/twin-studio verify
pnpm --filter @cerebro/twin-contracts test
pnpm test:integration   # requires TEST_DATABASE_URL
pnpm --filter @cerebro/twin-studio test:acceptance
# Playwright uses baseURL http://localhost:3401 and /app paths. It reuses a running
# Twin Studio server. Acceptance tests do not call OpenAI or Anthropic; Ask Twin
# grounding is enforced against stored evidence even if a model invents values.
```
