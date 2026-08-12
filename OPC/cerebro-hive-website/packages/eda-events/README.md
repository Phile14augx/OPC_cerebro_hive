# @cerebro/eda-events

**Layer:** `platform`
**Governing ADRs:** [0001](../../docs/architecture/decisions/eios-eda/),[0009](../../docs/architecture/decisions/eios-eda/)

Event envelope, domain event catalogue, outbox contract.

## Boundary rules

This package's permitted dependencies are enforced by `.dependency-cruiser.js`
(rules prefixed `eda-`) and verified in CI by `pnpm run arch:check`.
Changing what this package may import requires an ADR, not a config edit.
