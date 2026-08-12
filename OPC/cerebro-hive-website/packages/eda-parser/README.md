# @cerebro/eda-parser

**Layer:** `platform`
**Governing ADRs:** [0014](../../docs/architecture/decisions/eios-eda/)

ParserProvider host interface and WASM runtime contract.

## Boundary rules

This package's permitted dependencies are enforced by `.dependency-cruiser.js`
(rules prefixed `eda-`) and verified in CI by `pnpm run arch:check`.
Changing what this package may import requires an ADR, not a config edit.
