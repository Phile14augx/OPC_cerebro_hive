# @cerebro/eda-workflow

**Layer:** `platform`
**Governing ADRs:** [0009](../../docs/architecture/decisions/eios-eda/)

Temporal facade. THE ONLY package permitted to import @temporalio/*.

## Boundary rules

This package's permitted dependencies are enforced by `.dependency-cruiser.js`
(rules prefixed `eda-`) and verified in CI by `pnpm run arch:check`.
Changing what this package may import requires an ADR, not a config edit.
