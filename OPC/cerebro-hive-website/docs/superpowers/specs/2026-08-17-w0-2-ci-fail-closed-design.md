# W0.2 CI Fail-Closed Hardening

## Goal

Make validation claims in the CerebroHive pnpm/Turborepo graph truthful: a command succeeds only after it executes the validation it names and that validation passes. Verified Capability Throughput remains zero; this work changes confidence in evidence, not product capability.

## Baseline and boundary

- `87ad57fa` is the known-good W0.1 control-plane baseline.
- The canonical workspace population is the 141 package manifests reached by `OPC/cerebro-hive-website/pnpm-workspace.yaml`.
- pnpm’s 142nd entry is the monorepo root. It is a control-plane asset and is never counted as a workspace for W0.2 classification.
- Root `.github/workflows/governance-gate.yml` is the active GitHub CI topology. Nested `.github` trees are repository content unless a root workflow invokes them.
- W0.3, W0.4, W0.5, product work, runtime architecture, and UI work are excluded.

## Populations

The audit emits three machine-readable populations:

1. `workspaces`: every one of the 141 declared workspace packages, including path, package name, source/test/config evidence, declared validation scripts, classifications, rationale, and owner/review record.
2. `controlPlane`: root package scripts, pnpm/Turbo configuration, root GitHub workflows, shared validators, Docker/Make and other assets that can affect workspace validation.
3. `externalDependencies`: non-workspace directories or tools reached by either of the first two populations. They are recorded separately and never inflate the workspace count.

## Contract classifications

Each workspace has an independent classification for build, typecheck, test, lint, schema, configuration/YAML, and generated-code validation where applicable:

- `REAL`: the named command executes the relevant validator and propagates failure.
- `ABSENT-BY-DESIGN`: no contract is required; the manifest supplies an explicit rationale plus owner/review record.
- `BROKEN`: a contract exists but cannot establish correctness.
- `PLACEHOLDER`: a named validation command has no meaningful validation.
- `FALSE-GREEN`: a validation path can turn a failed or unverifiable condition into success.
- `NOT-APPLICABLE`: the validator cannot apply to this package; evidence identifies why.

Missing validation is never implicitly acceptable. A source-bearing workspace may use `ABSENT-BY-DESIGN` only with its explicit manifest record.

## Semantic false-green policy

`exit 0`, `|| true`, `process.exit(0)`, skip messages, and `--passWithNoTests` are candidates, not violations by themselves. The audit rejects a candidate only if it is reachable from a validation contract and can cause a claimed validation to succeed without establishing correctness. Operational scripts, cleanup steps, intentionally optional telemetry, and non-validation control flow remain permitted when classified and excluded with a rationale.

## Architecture

One Node audit engine replaces the current ad-hoc workspace discovery. It parses the pnpm workspace declaration, independently discovers package manifests, reads package scripts, records source/test/config evidence, and writes a deterministic JSON inventory. An explicit classification manifest overlays human-reviewed exceptions; the engine fails if the 141-workspace baseline does not reconcile, a source-bearing package lacks a classification, an exception lacks required justification, or a validation-path false-green candidate is not authorized.

The audit engine has fixture-based tests. Fixtures deliberately contain an invalid TypeScript contract, failing test command, malformed JSON-schema/YAML input, and an `exit 0` validation script. Each fixture must make the audit return non-zero. Passing fixtures demonstrate that a real typecheck/test/schema/config contract is recognized.

Root CI integration is delayed until the audit and all negative controls pass locally. Then `governance-gate` invokes the audit with its committed inventory and manifest. A failing audit must fail the required `governance-gate` check.

## Confirmed repair targets

- `services/forge-api`: replace `typecheck: exit 0`; remove test success that tolerates no tests; ensure its compiler and tests fail on invalid input.
- `packages/identity-core`: add a fail-closed validation contract or an explicit source-bearing exception that has owner/review evidence. The intended outcome is a real typecheck and test contract, not an implicit exception.
- `apps/studio`: add canonical `test` that executes existing meaningful behavior without generating visual baselines.
- `apps/twin-studio`: preserve its current real test contract unless a targeted audit proves it false-green.

## Verification

1. Audit reconciles exactly 141 workspaces and keeps the root outside that count.
2. All 141 records have every applicable validation category classified and justified.
3. Audit fixture negative controls return non-zero for type, test, schema, YAML/config, and no-op failures.
4. `forge-api`, `identity-core`, Studio, and Twin Studio contract checks are run locally with expected pass/fail evidence.
5. The audit, relevant typechecks, tests, lint, schema/config checks, and governance contract pass locally before a PR is opened.
6. The PR’s required `governance-gate` is green; a controlled invalid audit fixture is red and merge-blocked.

## Non-goals

- Raising evidence levels or VCT.
- Rebuilding runtime persistence or agent runtime.
- Snapshot generation or visual-regression baseline work.
- Broad dependency upgrades.
- Deleting non-workspace directories merely because they are not in pnpm.
