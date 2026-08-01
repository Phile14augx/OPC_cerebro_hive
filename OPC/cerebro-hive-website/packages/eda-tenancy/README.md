# @cerebro/eda-tenancy

**Layer:** `platform`
**Governing ADRs:** [0010](../../docs/architecture/adr/)

TenantContext propagation and the tenant-scoped repository base. No query may execute without it.

## Boundary rules

This package's permitted dependencies are enforced by `.dependency-cruiser.js`
(rules prefixed `eda-`) and verified in CI by `pnpm run arch:check`.
Changing what this package may import requires an ADR, not a config edit.
