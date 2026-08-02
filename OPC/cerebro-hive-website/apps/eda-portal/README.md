# @cerebro/eda-portal

**Layer:** `app`
**Governing ADRs:** [0017](../../docs/architecture/adr/)

CerebroEDA web portal (Next.js). Presentation only.

## Boundary rules

This package's permitted dependencies are enforced by `.dependency-cruiser.js`
(rules prefixed `eda-`) and verified in CI by `pnpm run arch:check`.
Changing what this package may import requires an ADR, not a config edit.
