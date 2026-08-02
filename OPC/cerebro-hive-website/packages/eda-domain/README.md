# @cerebro/eda-domain

**Layer:** `domain`
**Governing ADRs:** [0011](../../docs/architecture/adr/),[0010](../../docs/architecture/adr/)

Identity value objects, tenant context, shared domain primitives. No I/O, no dependencies.

## Boundary rules

This package's permitted dependencies are enforced by `.dependency-cruiser.js`
(rules prefixed `eda-`) and verified in CI by `pnpm run arch:check`.
Changing what this package may import requires an ADR, not a config edit.
