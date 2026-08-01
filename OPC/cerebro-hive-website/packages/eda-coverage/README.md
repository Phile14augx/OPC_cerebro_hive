# @cerebro/eda-coverage

**Layer:** `capability`
**Governing ADRs:** [0016](../../docs/architecture/adr/)

CoverageProvider contract and hierarchical merge planning.

## Boundary rules

This package's permitted dependencies are enforced by `.dependency-cruiser.js`
(rules prefixed `eda-`) and verified in CI by `pnpm run arch:check`.
Changing what this package may import requires an ADR, not a config edit.
