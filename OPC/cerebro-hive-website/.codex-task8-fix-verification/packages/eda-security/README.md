# @cerebro/eda-security

**Layer:** `platform`
**Governing ADRs:** [0013](../../docs/architecture/adr/),[0010](../../docs/architecture/adr/)

Capability grants, sandbox policy generation, export-class enforcement.

## Boundary rules

This package's permitted dependencies are enforced by `.dependency-cruiser.js`
(rules prefixed `eda-`) and verified in CI by `pnpm run arch:check`.
Changing what this package may import requires an ADR, not a config edit.
