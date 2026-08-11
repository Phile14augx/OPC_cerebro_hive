# @cerebro/eda-temporal-worker

**Layer:** `service`
**Governing ADRs:** [0009](../../docs/architecture/adr/)

Hosts Temporal workflows and activities.

## Boundary rules

This package's permitted dependencies are enforced by `.dependency-cruiser.js`
(rules prefixed `eda-`) and verified in CI by `pnpm run arch:check`.
Changing what this package may import requires an ADR, not a config edit.
