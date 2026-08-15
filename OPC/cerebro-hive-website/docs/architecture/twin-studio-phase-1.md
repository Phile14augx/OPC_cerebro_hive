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

Ask Twin calls OpenAI or Anthropic with the stored twin projection as the only evidence. Missing API keys return `LLM_UNAVAILABLE` instead of a fabricated answer.

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

Knowledge graph, event engine, dedicated TSDB, industrial connectors, model registry, optimization, autonomous agents, 3D/spatial, marketplace, and multi-twin federation are intentionally deferred. UI controls either execute the Phase 1 pipeline or are labeled preview-only.

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
# Playwright uses baseURL http://localhost:3401/app and will reuse a running
# Twin Studio server. Acceptance tests mock LLM HTTP in unit coverage and do
# not call OpenAI or Anthropic. Live Ask Twin grounding still needs a provider key.
```
