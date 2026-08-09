# Phase P0.9 — Validation Environment Readiness Assessment

**Status:** Open — blocked on environment provisioning, not on implementation
**Governing documents:** `CEREBROEDA-VERIFICATION-MATRIX.md` (§3, Validation Gates), `CEREBROHIVE-VALIDATION-HARNESS.md`
**Relates to:** ADR 0010, ADR 0011, ADR 0013, ADR 0014

---

## Executive Summary

The architecture verification framework is **implementation complete** but **not yet fully certified**. Three validation gates require external runtime environments that are intentionally absent from the current development workstation. No implementation defects have been identified during this assessment — every remaining gap is environment-dependent and was already anticipated in the verification matrix (`Harness ready, INCONCLUSIVE until CI run` / `Pending Phase 1 parsers`).

| | |
|---|---|
| Implementation | **Complete** |
| Validation | **Partially complete** |
| Certification | **Blocked by environment** |
| Architecture soundness | **No issues identified** |

---

## 1. Validation Status

| Component | Status | Blocking reason | Design issue? |
|---|---|---|---|
| Gate A — Sandbox verification (ADR 0013) | INCONCLUSIVE | Requires a `runsc` (gVisor) runtime | No |
| Gate C — Database verification (ADR 0010) | INCONCLUSIVE | Requires a live PostgreSQL instance (`DATABASE_URL`) | No |
| Parser / OpenSTA corpus validation (ADR 0011, 0014) | PENDING | Production-representative corpus does not exist yet | No |

---

## 2. Gate A — ADR 0013 Sandbox Verification

**Location:** `tools/arch/gate-a/`

The harness's internal self-test suite has run to completion:

- 12 validation checks executed
- Positive-path verification completed
- 7 negative-control scenarios executed, all producing the expected failure
- Harness integrity confirmed by `pnpm gate-a:self-test`

**Result:** `INCONCLUSIVE` — the host running this assessment has no `runsc` (gVisor) runtime installed. This is expected, correct behavior: the harness intentionally refuses to certify sandbox isolation without a genuine gVisor runtime, and no workaround is permitted.

**Certification requirement:** ADR 0013 is validated only once Gate A is executed on a gVisor-enabled runtime and reports `PASS`.

**Required environment:** Docker + gVisor (`runsc`).

**Required evidence to close:**
- Sandbox isolation verified
- Syscall restrictions verified
- All 7 negative controls still fail as expected on the real runtime
- ADR 0013 status updated to **Validated** in the verification matrix

---

## 3. Gate C — ADR 0010 Database Verification

**Location:** `tools/arch/gate-c/`

Implemented: the probe harness, migration verification, the broken-schema self-test (`broken-variants.sql` + `verify-controls.mjs`), and the RLS integrity checks.

**Result:** `INCONCLUSIVE` — `DATABASE_URL` is not configured in this environment. The harness intentionally refuses certification without a real database; SQLite or mocked databases are not accepted substitutes, because the probes specifically target Postgres RLS/prepared-statement plan-cache behavior that a mock cannot reproduce.

**Required environment:** a fresh PostgreSQL instance with `DATABASE_URL` set.

**Required evidence to close:**
- Schema creation passes
- Migration ordering passes
- Rollback validation passes
- Broken-schema detection passes (`gate-c/verify-controls.mjs` runs before real probes — a probe passing against a deliberately broken schema must fail CI)
- Constraint / RLS integrity verified
- ADR 0010's Gate C row updated to **Validated** in the verification matrix

---

## 4. Parser Validation — ADR 0011 / ADR 0014

Architecture is implemented (branded identity types, `EXCLUDED_KEY_FIELDS`, `ParserRuntime` union, `DEFAULT_PARSER_LIMITS`). Production validation is deferred because no representative OpenSTA corpus exists yet. Already tracked in the verification matrix as `Pending Phase 1 parsers`.

**Required corpus composition:**
- Valid OpenSTA scripts (happy path)
- Malformed scripts
- Vendor-specific syntax variants
- Unsupported commands
- Corrupted input
- Nested `include` files
- Edge-case timing constructs

**Required evidence to close:**
- Parser stability across the full corpus
- Deterministic output (byte-identical signatures on re-parse — `pnpm corpus:signatures`)
- Signature stability (ADR 0011)
- Sandbox safety under fuel metering — runaway/malicious inputs contained (ADR 0014)
- Reproducible parsing across runs

Only once these pass does ADR 0011 and ADR 0014 move from `Pending Phase 1 parsers` to **Validated**.

---

## 5. Validation Readiness Matrix

| Validation area | Harness ready | Environment ready | Certification |
|---|---|---|---|
| Gate A | Yes | No | Blocked |
| Gate C | Yes | No | Blocked |
| Parser corpus | Yes (mechanism) | No (corpus) | Blocked |

---

## 6. Working Tree Note

At the time of this assessment, the shared working tree on `main` carried substantial uncommitted changes (source files, package manifests, staged deletions) from concurrent development activity — consistent with the documented multi-session behavior on this repo. No cleanup, rebase, or commit was attempted against that state as part of this assessment, to avoid interfering with unrelated in-flight work. See the repo-structure memory for the standing convention (isolate work in a worktree rather than the shared root).

---

## 7. Risk Assessment

| Risk | Level | Mitigation |
|---|---|---|
| Missing PostgreSQL | Low | Provision a local/CI container; mechanical, no design change needed |
| Missing gVisor runtime | Low | Run Gate A on a `runsc`-enabled runner; mechanical |
| Missing parser corpus | Medium | Requires sourcing/building representative OpenSTA samples during Phase 1 — the only item with real lead time |
| Architecture correctness | None identified | All harness self-tests, including negative controls, pass |

---

## 8. Recommended Execution Order

1. **Milestone V1 — Gate C certification.** Provision PostgreSQL, run Gate C, close ADR 0010's database validation.
2. **Milestone V2 — Gate A certification.** Provision a gVisor-enabled runner, run Gate A, close ADR 0013.
3. **Milestone V3 — Parser qualification.** Build the production OpenSTA corpus, then run parser regression → signature verification → sandbox verification, closing ADR 0011 and ADR 0014.

V1 and V2 are pure infrastructure provisioning with no lead time beyond setup. V3 has the longest lead time because the corpus itself must be sourced or constructed.

---

## 9. Release Readiness Assessment

| Area | Status |
|---|---|
| Architecture implementation | Complete |
| Internal harness verification | Complete |
| Self-test coverage | Complete |
| Negative-control validation | Complete |
| Environmental prerequisites | Pending |
| ADR certification | Pending environment |
| Production readiness | Awaiting infrastructure validation |

---

## 10. Acceptance Criteria

This phase is closed when all of the following hold:

- [ ] Gate A passes on a gVisor-enabled (`runsc`) runtime and ADR 0013 is marked **Validated** in the verification matrix.
- [ ] Gate C passes against a live PostgreSQL instance via `DATABASE_URL`, including migration, rollback, integrity, and broken-schema tests.
- [ ] A representative OpenSTA parser corpus exists and parser regression, signature stability (ADR 0011), and sandbox safety (ADR 0014) tests all pass against it.
- [ ] `CEREBROEDA-VERIFICATION-MATRIX.md` reflects all three gates as **Enforced**, not Pending/Harness-ready.
- [ ] `CEREBROHIVE-VALIDATION-HARNESS.md` is updated with final execution evidence, environment details, timestamps, and artifact references (`docs/architecture/measurements/`).
- [ ] All evidence (logs, reports, CI artifacts, ADR status updates) is archived and linked from the project documentation for auditability.
