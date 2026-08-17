# W0.2 Task 3 P1A Typecheck Repair Plan

## Goal

Replace the 55 queued `BROKEN` typecheck contracts with independently
executable, package-local TypeScript validation without weakening compiler
semantics or changing runtime/product architecture.

## Baseline

- Main commit: `75eb5b1d2a496ee0454a873e901e3d89accc9f46`
- Typecheck defects: 55
- Total repair surface: 329
- `FALSE-GREEN`: 0
- Approved `ABSENT-BY-DESIGN`: 2
- Rejected build exceptions retained as `REPAIR`: 68
- VCT: 0

## Execution

1. Add a fixture that derives the 55 targets from the baseline repair queue and
   rejects missing scripts, missing effective package-local configs, zero-source
   compilation, and non-compiler commands. Prove it red.
2. Repair Cohort 1 (the seven `typecheck:missing-script` targets), including a
   package-level config for `packages/plugins`. Run each declared contract and
   keep the fixture red for the remaining targets.
3. Repair Cohort 2 (package/core/SDK targets missing config and script). Select
   the closest proven package-family config, explicitly cover production source,
   and resolve genuine compiler errors without suppressions or weaker settings.
4. Repair Cohort 3 (service targets missing config and script) using the
   equivalent service-family discipline.
5. Add a negative control that introduces an isolated semantic TypeScript error
   into a representative repaired workspace and proves its declared command
   exits non-zero after dependency preparation.
6. Execute all 55 contracts successfully, then regenerate inventory,
   classification, findings, triage, and repair queue. Preserve exception
   evidence.
7. Reconcile the expected end state: zero typecheck defects, 274 repairs,
   `FALSE-GREEN=0`, two approved build exceptions, 68 rejected build repairs,
   and intentionally non-green real audit.
8. Run the complete W0.2 fixture suite and inspect the diff. Do not commit or
   push.

## Scope exclusions

- Test, build, and lint repair tranches
- `governance-gate` wiring or changes
- Runtime/product architecture
- W0.3 and later waves
