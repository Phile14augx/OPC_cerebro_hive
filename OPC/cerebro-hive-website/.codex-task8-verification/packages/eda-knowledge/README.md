# @cerebro/eda-knowledge

**Layer:** `capability`
**Governing ADRs:** [0012](../../docs/architecture/adr/)

GraphReader/GraphWriter contracts. Sole owner of graph SQL.

## Boundary rules

This package's permitted dependencies are enforced by `.dependency-cruiser.js`
(rules prefixed `eda-`) and verified in CI by `pnpm run arch:check`.
Changing what this package may import requires an ADR, not a config edit.
