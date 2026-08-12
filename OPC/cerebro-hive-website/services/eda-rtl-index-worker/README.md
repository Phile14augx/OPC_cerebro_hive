# @cerebro/eda-rtl-index-worker

**Layer:** `service`
**Governing ADRs:** [0015](../../docs/architecture/decisions/eios-eda/)

Slang/Verible structural indexing (Node shim around the C++ worker).

## Boundary rules

This package's permitted dependencies are enforced by `.dependency-cruiser.js`
(rules prefixed `eda-`) and verified in CI by `pnpm run arch:check`.
Changing what this package may import requires an ADR, not a config edit.
