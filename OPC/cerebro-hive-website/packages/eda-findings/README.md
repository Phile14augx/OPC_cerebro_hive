# @cerebro/eda-findings

**Layer:** `capability`
**Governing ADRs:** [0011](../../docs/architecture/decisions/eios-eda/)

FindingRepository and canonical signature computation. Sole implementation of signature hashing.

## Boundary rules

This package's permitted dependencies are enforced by `.dependency-cruiser.js`
(rules prefixed `eda-`) and verified in CI by `pnpm run arch:check`.
Changing what this package may import requires an ADR, not a config edit.
