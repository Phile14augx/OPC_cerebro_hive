# @cerebro/eda-ui

**Layer:** `edge`
**Governing ADRs:** [0017](../../docs/architecture/adr/)

Domain UI components. No server imports.

## Boundary rules

This package's permitted dependencies are enforced by `.dependency-cruiser.js`
(rules prefixed `eda-`) and verified in CI by `pnpm run arch:check`.
Changing what this package may import requires an ADR, not a config edit.
