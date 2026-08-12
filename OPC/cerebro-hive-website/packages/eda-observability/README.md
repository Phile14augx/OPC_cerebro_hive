# @cerebro/eda-observability

**Layer:** `platform`
**Governing ADRs:** [0003](../../docs/architecture/decisions/eios-eda/)

OpenTelemetry facade. Only package importing @opentelemetry/*.

## Boundary rules

This package's permitted dependencies are enforced by `.dependency-cruiser.js`
(rules prefixed `eda-`) and verified in CI by `pnpm run arch:check`.
Changing what this package may import requires an ADR, not a config edit.
