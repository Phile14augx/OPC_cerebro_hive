# Roadmap

**Status:** Living document. Evidence-grounded — every entry below cites the code, test, ADR, or CI run that supports it. No entry describes work that hasn't actually happened or been formally proposed.

## 1. Purpose

### Scope
Tracks the engineering state of this repository: what's implemented and verified, what's actively in progress, what's outstanding, and what's explicitly not yet defined. This is not a product feature roadmap — see `docs/products.md`, `docs/product-registry.md`, and `docs/ENTERPRISE-VISION.md` for that, with the caveat noted in Section 5 below.

### Source-of-truth policy
This document is authoritative for engineering phase/status tracking going forward. It supersedes informal phase references (e.g. "Phase 9," "Phase 10," "AF-1"–"AF-5") that were discussed in AI chat sessions but never committed to this repository — a repo-wide search on 2026-08-01 found no `ROADMAP.md`, no phase specification files, and no `.planning/` roadmap content predating this document. If such a plan exists, it lives outside this repository (another session's context, or an external tool) and should be reconciled into this file, not treated as authoritative on its own.

### Evidence requirements
Every entry in Sections 2–4 must cite at least one of: a file path, a test name/result, an ADR, a merged commit, or a CI run. Entries without evidence belong in Section 5, not above it.

### Status labels

| Status | Meaning |
|---|---|
| **Verified** | Backed by code, tests, ADRs, or merged design documents |
| **In Progress** | Active work with repository evidence (real code, real failing/passing tests) |
| **Blocked** | Awaiting a prerequisite or unresolved issue — the blocker is itself cited as evidence |
| **Unrecovered** | Referenced historically (e.g. in conversation) but no canonical source currently exists in this repository |
| **Proposed** | Discussed or drafted, not yet approved |
| **Draft** | Under active design, not yet proposed for approval |
| **Deprecated** | Superseded or abandoned |

"Canonical" is not used as a status label in this document — see `docs/architecture/SPECIFICATION-GOVERNANCE-FINDING.md` for why that label was previously applied without an approval process and what that caused.

## 2. Current State

### CI/CD pipeline
**Status:** Verified (partial — see Section 4 for known-failing jobs)
**Evidence:**
- `.github/workflows/ci.yml` — `Type Check`, `Lint & Format`, `Build — studio`, `Build — forge-api` all pass as of run `30662121774` (2026-07-31).
- Commits `081100f`, `a20baf4`, `5ab11fb`, `56cc01e`, `8a1966f`, `f3b156c`, `e13c60c` — sequence of real, individually-verified CI fixes (lockfile path, `--if-present` flag ordering, `IS_FTP_DEPLOY` build-mode alignment, `domain-model` tsconfig, `forge-api` dependency/export bugs, lockfile drift, dual Prisma-client generation).
- `Deploy to VPS via SSH` — passing as of the same date; this is confirmed to be the live production deployment path.

### HiveForge capability architecture
**Status:** Verified (inventory), Proposed (several individual capabilities)
**Evidence:** `docs/architecture/HIVEFORGE-IMPLEMENTATION-RECONCILIATION.md` — full evidence-based audit of all 8 approved `hiveforge/` capabilities against actual repository state. Summary: HiveIdentity and HiveShield have real, tested library code; HiveGateway has a real, adopted AI-gateway implementation; HiveCompute/Storage/Network exist only as a governed simulation layer (`hivecloud.ts`), not real provisioning; HiveDatabase and HiveConsole have no implementation beyond a vocabulary enum.

### HiveShield PolicyEngine (ADR-038)
**Status:** Verified (implementation), not yet adopted
**Evidence:** `packages/policy-core`, `packages/hiveshield-policy` — 16/16 tests passing (commit `082d7d5`). Implements ADR-038 rules 1–4 (deny-precedence, narrow-never-widen, top-down accumulation, outcome precedence). Rule 5 (shared algorithm with `AIGovernanceEngine`) explicitly deferred — see `docs/architecture/AIGOVERNANCEENGINE-SCOPE-ASSESSMENT.md`. Not wired into any app or service route yet.

### Monorepo packaging architecture
**Status:** Proposed (ADR filed, no decision made)
**Evidence:** `docs/architecture/adr/0008-monorepo-packaging-strategy.md` — documents two independently-confirmed failures (Turbopack in `apps/forge`, plain `tsc` in `apps/platform-api`) caused by shared packages exposing raw TypeScript/TSX source via `package.json` `"main"`. Decision between built-artifact (`dist/`) and source-first consumption is explicitly not made in that ADR.

### Branch protection / ruleset governance
**Status:** Verified (audit), Outstanding (implementation)
**Evidence:** `docs/architecture/RULESET-RECONCILIATION-ASSESSMENT.md` — full audit of the `Main Production Protection` ruleset. 4 of 10 required status-check contexts confirmed real and correctly named (Category A); 6 need explicit disposition (Categories B/C), including the `required_deployments: [github-pages]` rule, confirmed unsatisfiable since GitHub Pages is disabled for this repository. No ruleset changes have been applied.

## 3. In-Flight Work

### Execution Lifecycle
**Status:** In Progress (owned by a separate, concurrently-active session — see Section 1's source-of-truth note)
**Evidence:**
- Real code: `packages/domain/src/execution/*` (`ExecutionApplicationService`, `ExecutionOrchestrator`, `ExecutionRepository`, `ExecutionScheduler`, `ExecutionLease`, `OutboxRelayExecutionEventSink`, and others).
- Real ADRs: `hiveforge/adr/ADR-039` through `ADR-049` (execution persistence/replay, control semantics, reliability/ownership, runtime providers, scheduler, workers, event delivery).
- Known failing test (as of CI run `30662121774`, 2026-07-31): `src/services/__tests__/ExecutionApplicationService.test.ts` — `TypeError: this.executionRepo.load is not a function`. A mock/interface mismatch, not yet fixed.
- Known failing job: `Integration Tests` — `prisma migrate deploy` fails against the test database; root cause not yet investigated.

**Confidence:** High that this work is real and active; low on completion timeline, since ownership sits outside this document's authoring context.

### Monorepo packaging decision (ADR 0008)
**Status:** Proposed (matches the ADR's own status; not yet approved)
**Evidence:** See Section 2. Directly blocks `Build — forge` and `Build — platform-api` in CI.

### Ruleset reconciliation (governance)
**Status:** In Progress (evidence complete, implementation not started)
**Evidence:** See Section 2. `docs/architecture/RULESET-RECONCILIATION-ASSESSMENT.md` Section 8 defines the single-PATCH reconciliation still to be applied.

## 4. Outstanding Work

Items directly supported by failing CI, open findings, or explicit prior deferral. No speculative items.

| Item | Evidence | Status |
|---|---|---|
| `Unit Tests` CI job failing | `this.executionRepo.load is not a function`, run `30662121774` | Blocked — owned by Execution Lifecycle work (Section 3) |
| `Integration Tests` CI job failing | `prisma migrate deploy` failure, run `30662121774` | Blocked — root cause not yet investigated |
| `Build — forge` CI job failing | Turbopack `.js`→`.ts` resolution, 62 errors | Blocked on ADR 0008 |
| `Build — platform-api` CI job failing | `tsc` JSX/module resolution errors from `@cerebro/auth` | Blocked on ADR 0008 |
| Ruleset required-context reconciliation | `RULESET-RECONCILIATION-ASSESSMENT.md` Categories A–C | In Progress — evidence complete, patch not applied |
| Hostinger/cPanel FTP deploy failing | `Error: Client is closed because Server sent FIN packet unexpectedly` | Blocked — infrastructure-side, not yet investigated |
| `packages/db` vs `packages/database` duplication | Two separate Prisma-wrapping packages, `ci.yml` now generates both as a workaround (commit `e13c60c`) | Blocked — pending an ownership/consolidation ADR |
| `HierarchicalPolicyEngine` not wired to any consumer | `packages/hiveshield-policy` has no importers outside its own tests | Proposed — not yet scheduled |
| 6 pre-existing duplicate `PolicyEngine` implementations | Found during PolicyEngine investigation; adoption status not rechecked | Proposed — not yet scheduled |

## 5. Future Work

Intentionally unscoped. Nothing below has an implementation plan, approved specification, or committed timeline in this repository.

- **HiveCompute / HiveStorage / HiveNetwork real provisioning** (vs. the current governed-simulation layer) — *Draft at best*; no ADR, no spec.
- **HiveDatabase / HiveConsole** — *Unscoped*; no implementation of any kind beyond a vocabulary enum (`docs/architecture/HIVEFORGE-IMPLEMENTATION-RECONCILIATION.md`).
- **`AIGovernanceEngine` platform implementation** (ADR-029's ten-submodule design, vs. the current `packages/engineering-review`-local simulation) — *Proposed as an alternative, not decided*; left open in `docs/architecture/AIGOVERNANCEENGINE-SCOPE-ASSESSMENT.md`.
- **The 44 non-real-product specs in `PRODUCT_SPECIFICATIONS/`** and the 50-product `docs/product-registry.md` vision — *Deprecated in effect*; `docs/architecture/SPECIFICATION-GOVERNANCE-FINDING.md` found these were mass-produced without a real product decision behind them. Not roadmap-ready.
- **"Phase 10" / "AF-1 through AF-5"** — **Unrecovered**. Referenced in conversation, not found anywhere in this repository as of 2026-08-01. Requires recovery from its original source (see Section 1) or a fresh ADR/spec if the original plan cannot be recovered.

Any of the above becomes roadmap-ready (moves to Section 2/3) only once it has a real ADR, specification, or merged implementation to cite as evidence — not before.

## Appendix: Evidence Index

- `docs/architecture/SPECIFICATION-GOVERNANCE-FINDING.md`
- `docs/architecture/HIVEFORGE-IMPLEMENTATION-RECONCILIATION.md`
- `docs/architecture/AIGOVERNANCEENGINE-SCOPE-ASSESSMENT.md`
- `docs/architecture/RULESET-RECONCILIATION-ASSESSMENT.md`
- `docs/architecture/adr/0008-monorepo-packaging-strategy.md`
- `hiveforge/adr/ADR-038-policy-inheritance-precedence-and-conflict-resolution.md`
- `hiveforge/adr/ADR-039` through `ADR-049` (execution lifecycle series)
- Commits: `081100f`, `a20baf4`, `5ab11fb`, `9a383a6`, `56cc01e`, `8a1966f`, `f3b156c`, `e13c60c`
- CI run `30662121774` (2026-07-31) — last full verification run referenced throughout this document
