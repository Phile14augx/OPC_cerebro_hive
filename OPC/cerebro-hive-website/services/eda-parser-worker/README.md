# @cerebro/eda-parser-worker

**Layer:** `service`
**Governing ADRs:** [0014](../../docs/architecture/decisions/eios-eda/)

Runs WASM parsers over tool output and emits facts.

## Boundary rules

This package's permitted dependencies are enforced by `.dependency-cruiser.js`
(rules prefixed `eda-`) and verified in CI by `pnpm run arch:check`.
Changing what this package may import requires an ADR, not a config edit.
