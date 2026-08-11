# @cerebro/eda-storage

**Layer:** `platform`
**Governing ADRs:** [0011](../../docs/architecture/adr/)

StorageProvider contract and content-addressed blob keys.

## Boundary rules

This package's permitted dependencies are enforced by `.dependency-cruiser.js`
(rules prefixed `eda-`) and verified in CI by `pnpm run arch:check`.
Changing what this package may import requires an ADR, not a config edit.
