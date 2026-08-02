# @cerebro/eda-sdk

**Layer:** `edge`
**Governing ADRs:** [0014](../../docs/architecture/adr/)

Typed client and plugin author SDK.

## Boundary rules

This package's permitted dependencies are enforced by `.dependency-cruiser.js`
(rules prefixed `eda-`) and verified in CI by `pnpm run arch:check`.
Changing what this package may import requires an ADR, not a config edit.
