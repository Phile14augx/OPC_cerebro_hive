# W0.2 suppression-forensics baseline

- Recorded: 2026-08-23
- Git repository root: `D:/CEREBRO_RECOVERY_RUNNER`
- Project root: `D:\CEREBRO_RECOVERY_RUNNER\OPC\cerebro-hive-website`
- Baseline SHA: `67edd7edbe69ad26cf9aa6550bc97ac1b6e308a6`
- Branch: `fix/w0-2-github-visible-ci`
- Initial working tree: clean
- `ARCH-LINT: Deferred` markers: 726
- Studio markers: 702
- Non-Studio markers: 24
- Environment observation: Git warned twice that `C:\Users\LOQ/.config/git/ignore` was inaccessible due to permission denial. No global Git configuration was changed.

The baseline commit modifies only `config/workspace-validation-classification.json`; it does not introduce an `ARCH-LINT`, ESLint-disable, TypeScript-ignore, or cast marker.

## S0 conclusion

| Scope | Directives | Active underlying diagnostics | Stale/redundant |
| --- | ---: | ---: | ---: |
| Non-Studio | 24 | 23 | 1 |
| Studio | 702 | Pending package-local no-inline probe | Pending |

Studio directive families: 316 `@typescript-eslint/no-unused-vars`, 197
`@typescript-eslint/no-explicit-any`, 58 `renders`, 51
`react/no-unescaped-entities`, 47 `@typescript-eslint/ban-ts-comment`, and
33 other directives. All 24 non-Studio directives were introduced by
`52c88890f643891c404ae063b8f4e89c4d90df7e`.

The root flat ESLint configuration ignores several workspace directories.
Forensics therefore use ESLint's installed Node entry point with
`--no-inline-config --no-ignore`; normal verification uses each workspace's
declared `pnpm --filter <workspace> lint` script.

Current certification status: **NOT CERTIFIABLE**.

## S1 verified batches

- `packages/core-bus`: removed the deferred non-null assertion directive and
  replaced the unsafe `Map.get(...)!` with an invariant guard. Package lint and
  typecheck pass.
- `packages/runtime-contracts`: replaced the two `EventUpcaster` generic
  defaults from `any` to `unknown`, removing one directive that masked two
  diagnostics. Package lint, typecheck, test (2 tests), build, and
  `@cerebro/runtime-core` typecheck pass.
- `packages/runtime-contracts`: replaced snapshot `workingMemory` and
  `context` object payload values with `Record<string, unknown>`. Package
  lint, typecheck, test (2 tests), build, and `@cerebro/runtime-core` plus
  `@cerebro/db` typechecks pass. The required global typecheck currently
  fails in unchanged baseline code at
  `packages/api-client/src/schema/generate-openapi.ts` (unknown-to-OpenAPI
  schema assignments); it is not a downstream failure from this batch.

Current marker counts: 11 non-Studio, 0 runtime-contracts, and 0 core-bus.
The next ledger refresh must recompute active diagnostics from the package
authoritative lint surfaces; one EventUpcaster directive hid two diagnostics.

## W0.2-RECERT-BLOCKER-001

- Workspace: `packages/api-client`
- Gate: `pnpm -r typecheck`
- Origin: pre-existing baseline defect
- Triggered by: full recertification
- Caused by current runtime-contracts batch: **NO**
- Status: **RESOLVED**
- Fingerprint: `src/schema/generate-openapi.ts` reports TS2345 at lines
  16–20 and TS2322 at lines 41, 58, 74, 90, and 106, all involving
  `unknown` values supplied where the OpenAPI API requires schema-compatible
  types.

This failure was excluded from attribution to the runtime-contracts batches
and tracked independently until its semantic repair was verified.

Resolution: Zod 3.25.76 and `@asteasolutions/zod-to-openapi` 7.3.4 were
compatible. The generator incorrectly passed Zod schemas to
`registerComponent('schemas', ...)`, an API for raw OpenAPI schema objects.
It now uses `registry.register(refId, zodSchema)` and the OpenAPI-boundary
`as unknown` casts were removed. Api-client lint, typecheck, 2 tests, and
build pass.

Global transition gate: `pnpm -r typecheck` completed across 141 workspace
projects with exit code 0.

## Runtime-contracts checkpoint

All 12 initial runtime-contracts directives have been removed. Dynamic event
fields now distinguish object-shaped metadata (`Record<string, unknown>`) from
arbitrary tool results (`unknown`). The final batch passed runtime-contracts
lint, typecheck, test (2 tests), build, and runtime-core typecheck.
