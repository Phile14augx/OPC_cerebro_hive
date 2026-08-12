# @cerebro/eda-execution-worker

**Layer:** `service`
**Governing ADRs:** [0013](../../docs/architecture/decisions/eios-eda/)

Dispatches jobs to compute backends inside sandboxes.

## Boundary rules

This package's permitted dependencies are enforced by `.dependency-cruiser.js`
(rules prefixed `eda-`) and verified in CI by `pnpm run arch:check`.
Changing what this package may import requires an ADR, not a config edit.
