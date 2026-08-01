# CerebroEDA — Repository Scaffold

**Status:** Phase 0 complete
**Governing:** `CEREBROEDA-BLUEPRINT.md` Appendix B, `CEREBROEDA-VERIFICATION-MATRIX.md`

Structural only. Interfaces and boundaries, no business logic — the scaffold exists to make the ADRs enforceable before there is code to unwind.

## Layout

```
packages/
  eda-domain          domain      identity value objects, tenant context, semantic key
  eda-events          platform    CloudEvents envelope, outbox
  eda-tenancy         platform    VerifiedTenantContext, TenantScopedTransaction
  eda-observability   platform    OTel facade (sole @opentelemetry importer)
  eda-storage         platform    StorageProvider, presigned access
  eda-workflow        platform    Temporal facade (sole @temporalio importer)
  eda-execution       platform    ExecutionProvider, SandboxPolicy, LicenceBroker
  eda-parser          platform    ParserProvider, WASM host contract, limits
  eda-security        platform    capability grants, export-class enforcement
  eda-artifacts       capability  ArtifactRepository, blob registry, lineage
  eda-findings        capability  signature computation (sole implementation)
  eda-knowledge       capability  GraphReader/Writer (sole owner of graph SQL)
  eda-coverage        capability  CoverageProvider, merge planning
  eda-sdk             edge        typed client, plugin author SDK
  eda-ui              edge        domain UI components
services/
  eda-temporal-worker · eda-execution-worker · eda-parser-worker · eda-rtl-index-worker
apps/
  eda-portal · eda-api
```

## Layering

`domain ← platform ← capability ← edge ← service ← app`. Dependencies point inward only; enforced by `checkLayering` in `tools/arch/check-architecture.mjs`.

`eda-domain` depends on nothing and performs no I/O.

## Commands

| Command | Checks |
|---|---|
| `pnpm arch:check` | layers, ADR references, README coverage, matrix coverage, dead packages |
| `pnpm arch:boundaries` | import rules (dependency-cruiser) |
| `pnpm arch:verify-rules` | that the boundary rules actually reject known violations |
| `EDA_PHASE=n pnpm arch:check` | expires scaffold exemptions for phase ≤ n |

## Scaffold exemptions

Unwired packages declare `cerebroEda.scaffoldUntilPhase`. The exemption expires when `EDA_PHASE` reaches that phase, at which point CI fails until the package is wired or deleted. This is deliberate: "temporary" scaffolding that never expires is how dead packages accumulate.

## What is deliberately absent

No business logic, no database schemas, no Temporal workflow implementations, no parsers. Those arrive in Phase 1 after Gates A–C validate the assumptions they would otherwise be built on.
