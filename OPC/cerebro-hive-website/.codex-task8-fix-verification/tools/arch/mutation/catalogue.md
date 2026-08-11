# Mutation catalogue — proving the invariant suite is not vacuous

**Status:** COMPLETE — all 15 mutants killed, 28 checks passing (see `docs/architecture/measurements/mutation-2026-08-03.md`)
**Purpose:** demonstrate that a wrong implementation is *rejected*, not merely that a right one passes.

---

## Why this exists

Every safeguard in this project has been validated by deliberate violation — boundary rules, gate criteria, harness invariants. The invariant suite (`packages/eda-findings/test/invariants.ts`) is the one significant check that has only ever been observed passing.

That matters more than it sounds. The parser property tests would pass against a signature function that returned a constant, because a constant satisfies "whitespace change → same signature" perfectly. Three of the ten property assertions are negative controls precisely to catch that, but the argument is theoretical until a constant-returning mutant is actually run and observed to fail.

**Until this catalogue executes, "property-based parser testing" is not proven — it is designed.**

---

## Mutants

Each mutation is a single, surgical change to production code. Every one must cause **at least one named check to fail**. A mutation that survives is a hole in the suite, and the response is a new assertion, never a weaker mutant.

| # | Mutation | Target | Must be caught by |
|---|---|---|---|
| M1 | Drop `endpoint` from the semantic key | `opensta-timing.ts` | `endpoint change → DIFFERENT signature`; `assertKeyMatchesContract` |
| M2 | Drop `path_type` from the semantic key | `opensta-timing.ts` | `path type change → DIFFERENT signature` |
| M3 | Drop `corner` from the semantic key | `opensta-timing.ts` | `corner change → DIFFERENT signature` |
| M4 | Return a constant signature | `signature-computer.ts` | all three negative controls |
| M5 | Include `slackPs` in the semantic key | `opensta-timing.ts` | `slack change → same signature`; `ExcludedFieldError` |
| M6 | Skip hierarchy canonicalisation | `opensta-timing.ts` | `hierarchy alias → same signature`; `escaped hierarchy → same signature` |
| M7 | Skip NFC normalisation in `canonicalForm` | `signature.ts` | `decomposed and precomposed Unicode hierarchy → same signature (M7 fixture)` |
| M8 | Remove `version` increment on update | `sqlite-finding-repository.ts` | `stale write rejected by version check` |
| M9 | Drop the version predicate from `updatePayload`'s WHERE | `sqlite-finding-repository.ts` | `stale write rejected by version check` |
| M10 | Update `first_seen_run` on conflict | `sqlite-finding-repository.ts` | `first_seen preserved across updates` |
| M11 | Insert instead of update when signature exists | `sqlite-finding-repository.ts` | `exactly one row for a repeated signature` |
| M12 | Report `updated` instead of `reopened` | `sqlite-finding-repository.ts` | `a returning finding is reopened, not re-inserted` |
| M13 | Ignore `org_id` in the WHERE clause | `sqlite-finding-repository.ts` | `tenant A never observes tenant B values` |
| M14 | Make `markResolved` a no-op | `sqlite-finding-repository.ts` | `resolved leaves the open list` |
| M15 | Sort semantic key by value instead of field | `signature.ts` | `canonical form sorts by field name not value (M15 fixture)` |

## Known gaps, stated before running

Two mutants are predicted to **survive**, and recording that prediction now is the point — a catalogue written after seeing results proves nothing.

- **M7 (NFC normalisation)** — no fixture contains a decomposed Unicode sequence, so removing normalisation changes nothing observable. Real designs from non-ASCII toolchains would expose it. Needs a fixture with a combining-character hierarchy name.
- **M15 (sort order)** — the current fixtures have field names and values that happen to sort compatibly. A fixture where the two orderings differ is required.

Both gaps are in `signature.ts`, the module with the strongest claim to correctness and the weakest direct coverage. That is a predictable and uncomfortable place for holes to be.

---

## Method

```
for each mutant:
    apply single-line change to production source
    run: pnpm test:invariants
    expect: non-zero exit, with the named check failing
    revert
```

A mutant that produces a *different* failure than predicted is also a finding: it means the suite catches the bug for the wrong reason, and the reasoning recorded here is wrong somewhere.

Results belong in `docs/architecture/measurements/mutation-<date>.md`, with survivors listed first.

---

## Acceptance

- Every mutant M1–M6 and M8–M14 must be killed. ✓
- M7 and M15 are expected survivors; each must be killed by a new fixture before this catalogue is considered complete. ✓
- A surviving mutant is never resolved by deleting the mutant.

**All criteria met. Catalogue closed 2026-08-03.**

Deviations from predictions: M8 was an unexpected survivor (gap in version
coverage via `recordRun`); a new invariant was added and M8 re-run to confirm
the kill. M7 and M15 fixtures were added during the same session. The ``
Unit Separator in `canonicalForm`'s join was discovered when diagnosing the M15
expected-value mismatch — it is an intentional collision-prevention feature of
the canonical encoding and is now documented in the fixture comment.
