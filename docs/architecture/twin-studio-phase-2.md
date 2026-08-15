# Twin Studio Phase 2 Architecture

Twin Studio Phase 2 adds a safe rule engine, persisted rule events, and a relationship graph. PostgreSQL remains the source of truth. Connectors, a time-series database, forecasting, optimization, 3D, and autonomous agents are still out of scope.

## Data path

```text
UI (Command Center Graph / Events)
  -> GET /app/api/twins/:id/graph
  -> GET /app/api/twins/:id/events
    -> authenticated tenant/workspace scope
      -> TwinRepository
        -> Prisma TwinEvent / TwinEntity / TwinVersion.definition
        -> PostgreSQL
```

State writes still go through `POST /state` and `POST /simulator`. After a current-state projection is updated, `TwinRepository.syncRuleEvents` evaluates the active definition rules against each entity's persisted current state.

## Rule engine

Rules already stored on twin definitions (for example `vibration > 6.5 && temperature > 76`) are evaluated by a recursive-descent parser in `@cerebro/twin-domain`. The evaluator does not call `eval`, `Function`, or any other code execution path.

Supported syntax:

- identifiers (`vibration`, `turnover-minutes`)
- numbers, booleans, and quoted strings
- `>`, `<`, `>=`, `<=`, `==`, `!=`
- `&&`, `||`, and parentheses

Kebab-case rule variables resolve against camelCase state keys. A missing measurement makes the comparison false. Invalid expressions do not fire and do not crash ingest.

## Events

`TwinEvent` rows are tenant/workspace/twin/entity scoped. A rule becoming true creates one `OPEN` event for `(twinId, entityId, ruleKey)`. A later state write that makes the same rule false marks that row `CLEARED`. Duplicate open events are prevented by a partial unique index.

Event numbers and messages come from the persisted entity state that triggered the rule, with provenance pointing at the current-state row used as evidence.

## Graph

`GET /graph` does not invent a stored graph. Nodes are persisted `TwinEntity` rows. Edges are inferred only when:

1. the active definition declares a relationship type, and
2. a persisted entity attribute value equals another persisted entity key, and
3. those entities' types match the relationship `from` / `to`.

Factory Alpha therefore shows `motor-07 → line-a` as `installed-on` because Motor-07's stored `line` attribute is `line-a`. No attribute match means no edge.

## Phase 2 non-goals

Industrial connectors, dedicated TSDB, predictive models, optimization, 3D/spatial, autonomous agents, and multi-twin federation remain deferred. Graph and Events tabs either render persisted or inferred Postgres data or show an explicit empty state.

## Local commands

```bash
# from repo root, with PostgreSQL available
pnpm --filter @cerebro/db generate
# apply packages/db/prisma/migrations/20260815133000_twin_studio_events

pnpm --filter @cerebro/twin-domain test
pnpm --filter @cerebro/twin-studio test
pnpm --filter @cerebro/twin-studio typecheck
pnpm --filter @cerebro/twin-studio lint
pnpm --filter @cerebro/twin-studio verify
pnpm --filter @cerebro/twin-studio test:acceptance
```
