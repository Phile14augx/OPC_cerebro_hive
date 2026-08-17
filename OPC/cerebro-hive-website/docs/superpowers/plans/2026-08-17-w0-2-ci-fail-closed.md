# W0.2 CI Fail-Closed Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Classify all 141 declared pnpm workspaces and make validation paths fail closed without modifying W0.3+ or product/runtime architecture.

**Architecture:** A deterministic Node audit engine discovers declared workspaces directly from `pnpm-workspace.yaml`, overlays reviewed classifications, and rejects validation-path false-green behavior. Fixture tests establish red-on-invalid semantics before hotspot contracts and root CI integration are changed.

**Tech Stack:** Node.js 22 ESM, pnpm 9, JSON manifests, TypeScript compiler, Jest/Vitest/tsx where already owned by each workspace, GitHub Actions.

**Spec:** `OPC/cerebro-hive-website/docs/superpowers/specs/2026-08-17-w0-2-ci-fail-closed-design.md`

## Global Constraints

- The canonical workspace count is exactly 141; pnpm’s root entry is control plane, not a workspace.
- Do not reject a semantic candidate unless it is reachable on a validation path and can create false-green success.
- Source-bearing packages require a real contract or an explicit owner/reviewed `ABSENT-BY-DESIGN` record.
- Preserve W0.1 governance; add validators to `governance-gate` only after local positive and negative proof.
- Do not modify persistence, agent-runtime, product, visual-baseline, or W0.3+ behavior.
- VCT remains 0.

---

### Task 1: Build the authoritative workspace inventory engine

**Files:**
- Create: `OPC/cerebro-hive-website/scripts/audit-workspace-contracts.mjs`
- Create: `OPC/cerebro-hive-website/config/workspace-validation-classification.json`
- Create: `OPC/cerebro-hive-website/artifacts/w0.2/workspace-validation-inventory.json`
- Modify: `OPC/cerebro-hive-website/package.json`
- Test: `OPC/cerebro-hive-website/scripts/test-audit-workspace-contracts.mjs`

**Interfaces:**
- Input: pnpm workspace declaration, package manifests, classification manifest.
- Output: JSON `{ baselineWorkspaceCount: 141, rootControlPlane: true, workspaces, controlPlane, externalDependencies, findings }`.
- CLI: `pnpm workspace:contracts` exits non-zero for unreconciled discovery or an invalid classification.

- [ ] Write fixture-based tests for four declarations: a 141-count reconciliation failure, an unclassified source-bearing package, an exception missing `owner`/`review`, and a valid reviewed `ABSENT-BY-DESIGN` entry.
- [ ] Run `node scripts/test-audit-workspace-contracts.mjs` and observe each missing implementation case fail.
- [ ] Implement declaration parsing with no shell glob expansion; discover package manifests from `apps/*`, `packages/*`, `packages/capabilities/*`, and `services/*`; reject any count other than 141.
- [ ] Add the classification manifest schema: each record has `path`, per-capability status, `rationale`, `owner`, and `review` when status is `ABSENT-BY-DESIGN`.
- [ ] Emit stable, path-sorted inventory JSON and add `workspace:contracts` plus `workspace:inventory` scripts.
- [ ] Re-run fixture tests and `pnpm workspace:contracts`; confirm inventory lists 141 workspaces and the root only under control plane.

### Task 2: Add semantic false-green analysis and contract fixtures

**Files:**
- Modify: `OPC/cerebro-hive-website/scripts/audit-workspace-contracts.mjs`
- Modify: `OPC/cerebro-hive-website/scripts/test-audit-workspace-contracts.mjs`
- Create: `OPC/cerebro-hive-website/scripts/fixtures/workspace-contracts/{valid,type-failure,test-failure,schema-failure,yaml-failure,no-op}/`

**Interfaces:**
- Input: fixture package/config files and candidate script command text.
- Output: diagnostic codes `W0C_TYPE`, `W0C_TEST`, `W0C_SCHEMA`, `W0C_YAML`, and `W0C_NOOP` with non-zero exit status.

- [ ] Write five red tests that each expect a non-zero audit result from one deliberately invalid fixture.
- [ ] Implement candidate classification: detect `exit 0`, `|| true`, `process.exit(0)`, skip echoes, and `--passWithNoTests`; flag only when a named build/test/typecheck/lint/schema/config command can succeed without validation.
- [ ] Implement real fixture validators: TypeScript compiler for type fixture, test runner for test fixture, JSON-schema parser/validator for schema fixture, YAML parser for YAML fixture, and script semantic detection for no-op fixture.
- [ ] Run each invalid fixture separately and record the expected diagnostic code; run the valid fixture and expect success.
- [ ] Confirm operational scripts outside the validation command graph are reported as candidates or external dependencies, not automatically rejected.

### Task 3: Complete reviewed classifications for all 141 workspaces

**Files:**
- Modify: `OPC/cerebro-hive-website/config/workspace-validation-classification.json`
- Modify: `OPC/cerebro-hive-website/artifacts/w0.2/workspace-validation-inventory.json`
- Create: `OPC/cerebro-hive-website/docs/portfolio/W0.2-VALIDATION-EXCEPTIONS.md`

**Interfaces:**
- Every inventory workspace record has classifications for build, test, typecheck, lint, schema, configuration/YAML, and generated-code validation.
- `ABSENT-BY-DESIGN` records include exact rationale, owner, review reference, and source-bearing status.

- [ ] Generate the raw inventory and group all packages by source presence, scripts, test files, config/schema evidence, and false-green candidates.
- [ ] Classify packages with real existing commands as `REAL` only after direct command inspection; classify no-source package categories as `NOT-APPLICABLE` or reviewed `ABSENT-BY-DESIGN`.
- [ ] For each source-bearing missing contract, add a real repair task or a manifest exception with explicit owner/review; do not use a blanket category exception.
- [ ] Document all exceptions in `W0.2-VALIDATION-EXCEPTIONS.md`, including why a command is absent and what would make it applicable later.
- [ ] Run `pnpm workspace:contracts` and assert all 141 entries are present with no implicit or unreviewed absence.

### Task 4: Repair confirmed hotspot contracts

**Files:**
- Modify: `OPC/cerebro-hive-website/services/forge-api/package.json`
- Create/modify: `OPC/cerebro-hive-website/services/forge-api` test/config files required for real typecheck and test execution
- Modify: `OPC/cerebro-hive-website/packages/identity-core/package.json`
- Create/modify: `OPC/cerebro-hive-website/packages/identity-core` TypeScript/test configuration and focused tests
- Modify: `OPC/cerebro-hive-website/apps/studio/package.json`
- Verify: `OPC/cerebro-hive-website/apps/twin-studio/package.json` and existing tests

**Interfaces:**
- `@cerebro/forge-api`: `typecheck` invokes `tsc` over its production config and `test` fails when its real tests fail.
- `@cerebro/identity-core`: typecheck/test return non-zero when source or prerequisites cannot be validated.
- `@cerebro/studio`: canonical `test` executes meaningful existing tests; no snapshot generation is introduced.

- [ ] Write a focused failing test or compile fixture for forge-api that proves `exit 0` cannot remain.
- [ ] Replace forge-api’s unconditional typecheck and no-test-tolerant test commands with real compiler/test commands; run both success and deliberate-failure cases.
- [ ] Write identity-core tests that exercise an existing public module and fail when required source/config cannot load.
- [ ] Add fail-closed identity-core typecheck/test scripts and minimal configuration; run success and deliberate failure cases.
- [ ] Add Studio’s canonical `test` script by invoking existing stable non-visual tests; run it locally.
- [ ] Run Twin Studio’s existing test command and preserve it unchanged unless it demonstrates a real false-green path.
- [ ] Update the classifications and inventory evidence for all four hotspots.

### Task 5: Wire proven contracts into root CI and governance

**Files:**
- Modify: `.github/workflows/governance-gate.yml`
- Modify: `OPC/cerebro-hive-website/package.json`
- Modify: `OPC/cerebro-hive-website/turbo.json` only if the audit proves an omitted required dependency edge
- Test: `OPC/cerebro-hive-website/scripts/test-governance-gate-contract.mjs`

**Interfaces:**
- `governance-gate` runs `pnpm workspace:contracts` after install and before declaring success.
- Any fixture or classification failure returns non-zero through GitHub Actions.

- [ ] Extend the governance workflow contract test with a failing expectation for a missing `pnpm workspace:contracts` step.
- [ ] Run it red, add the exact fail-closed workflow step with no `continue-on-error` or `|| true`, and run it green.
- [ ] Run local governance contract, audit, hotspot typechecks/tests, lint, schema/config fixture suite, and required build checks sequentially; record exit codes.
- [ ] Inspect Turbo filters, dependency edges, and root scripts; add only proven missing edges and verify a dependent failure propagates.
- [ ] Do not push until all deterministic local checks pass and every fixture negative control has been observed red.

### Task 6: Publish and verify the single W0.2 PR

**Files:**
- Verify only: Task 1–5 files, pull-request evidence, and live `governance-gate` status

- [ ] Review `git diff --check` and a file allowlist; reject unrelated runtime/product/W0.3+ paths.
- [ ] Commit narrow, auditable units: audit engine/fixtures, classification inventory, hotspot contracts, CI integration, documentation.
- [ ] Push one normal protected PR from the W0.2 branch; do not bypass W0.1 governance.
- [ ] Record GitHub results for `governance-gate` and all required W0.2 checks.
- [ ] If any negative control is not demonstrably red-on-invalid, keep W0.2 open and do not report completion.
