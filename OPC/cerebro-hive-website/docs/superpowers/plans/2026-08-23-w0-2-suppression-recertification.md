# W0.2 Suppression Recertification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish whether W0.2 can be certified without inline lint-suppression laundering, and repair only validated active diagnostics.

**Architecture:** Treat ESLint with inline configuration disabled as the authoritative suppression probe. Preserve the existing workspace classifier as downstream validation only; store forensic findings in auditable evidence files and repair small non-Studio scopes before coherent Studio patterns.

**Tech Stack:** pnpm 9, ESLint 9, TypeScript, Turbo, Node.js scripts.

**Spec:** User-approved W0.2 Integrity / Recertification and suppression-forensics instructions, 2026-08-23.

## Global Constraints

- Work from `D:\CEREBRO_RECOVERY_RUNNER`; run project validation from `OPC\cerebro-hive-website`.
- Do not change the workspace classifier, ESLint or TypeScript strictness to make gates pass.
- No `as any`, `unknown as T`, `@ts-ignore`, broad disables, skipped tests, unconditional-success scripts, or unrelated changes.
- Keep `RESIDUAL-E2E-001` separate from standard W0.2 validation.

---

### Task 1: Freeze and collect suppression evidence

**Files:**
- Create: `docs/w0-2-evidence/2026-08-23-suppression-baseline.md`
- Create: `docs/w0-2-evidence/2026-08-23-suppression-ledger.json`

- [ ] Record baseline SHA, branch, clean status, marker totals, and global-ignore warning.
- [ ] Run no-inline-config JSON lint probes for Studio and runtime contracts.
- [ ] Run normal lint with unused-directive reporting.
- [ ] Correlate every ARCH-LINT marker with an active/stale/redundant ESLint outcome and its provenance commit.

### Task 2: Repair non-Studio active suppressions

**Files:**
- Modify only marker-bearing files in `packages/runtime-contracts`, `services/governance-api`, and the seven remaining non-Studio locations, as supported by the ledger.

- [ ] For each active marker, reproduce the diagnostic without inline configuration.
- [ ] Inspect public consumers before exported runtime-contract changes.
- [ ] Apply a semantic repair and remove the marker; remove stale markers directly.
- [ ] Run package lint, typecheck, test/build contracts and immediate consumer typechecks.

### Task 3: Remediate Studio by coherent diagnostic family

**Files:**
- Modify only Studio marker-bearing files grouped by shared diagnostic pattern.

- [ ] Partition markers into stale directives, unused/dead-code, internal typing, React boundaries, API/data boundaries, and difficult architecture.
- [ ] For each family, make the smallest semantic change, then run Studio lint, typecheck, standard test, and build.
- [ ] Record any genuine external exception with rule, scope, limitation, owner, review date, and follow-up reference.

### Task 4: Recertify

**Files:**
- Modify: `docs/w0-2-evidence/2026-08-23-suppression-ledger.json`
- Create: `docs/w0-2-evidence/2026-08-23-recertification-report.md`

- [ ] Run `pnpm -r lint`, `pnpm -r typecheck`, `pnpm -r test`, `pnpm -r build`, and applicable schema/config validation.
- [ ] Run the classifier and inventory; record build, test, typecheck, lint, and schema/config counts.
- [ ] Re-run suppression searches, inspect the diff and working tree, and issue only the certification status justified by the evidence.
