# @cerebro/eda-api

**Layer:** `app`
**Governing ADRs:** [0009](../../docs/architecture/decisions/eios-eda/),[0010](../../docs/architecture/decisions/eios-eda/)

GraphQL federation gateway for CerebroEDA.

## Boundary rules

This package's permitted dependencies are enforced by `.dependency-cruiser.js`
(rules prefixed `eda-`) and verified in CI by `pnpm run arch:check`.
Changing what this package may import requires an ADR, not a config edit.
