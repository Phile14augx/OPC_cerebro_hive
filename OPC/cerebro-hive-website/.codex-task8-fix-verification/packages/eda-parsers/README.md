# @cerebro/eda-parsers

**Layer:** `capability`
**Governing ADRs:** [0014](../../docs/architecture/adr/0014-eda-parser-runtime.md) (parser runtime), [0011](../../docs/architecture/adr/0011-eda-canonical-artifact-identity.md) (semantic keys)

First-party report parsers. Each converts tool output into canonical domain facts
with canonicalised semantic keys; the host computes signatures (ADR 0011), never
the parser.

Currently TypeScript. ADR 0014 requires WASM for third-party parsers and prefers
it for first-party ones; porting these is a Phase 1 follow-up. The `ParserProvider`
contract is identical either way, so the port is a build change.

## Boundary rules

Enforced by `.dependency-cruiser.js` (rules prefixed `eda-`) and verified in CI by
`pnpm run arch:check`. Changing what this package may import requires an ADR.
