# Gate A — Sandbox Overhead Measurement (ADR 0013)

**Verdict:** INCONCLUSIVE
**Criteria version:** 2 (fixed 2026-08-01, before measurement)
**Measured:** 2026-08-01T09:57:45.127Z
**Runtimes:** native (unavailable: docker, gvisor)
**Iterations:** 3 warmup + 25 measured

## Environment

| Property | Value |
|---|---|
| hostname | c857d09db23e |
| kernel | 6.8.0-124-generic |
| arch | x64 |
| cpuModel | AMD Ryzen 7 7435HS |
| cpuCount | 2 |
| totalMemGiB | 4 |
| loadAvgAtStart | 0.03, 0.03, 0.02 |
| virtualised | none |
| nodeVersion | v22.22.3 |
| capturedAt | 2026-08-01T09:57:45.127Z |

## Results

| Workload | Runtime | n | median ms | IQR | CV | ratio | 95% CI | threshold | status |
|---|---|---|---|---|---|---|---|---|---|
| startup | native | 25 | 5.9 | 5.5–6.1 | 0.103 | 1.00x | 1.00–1.00 | — | baseline |
| hdl_parse_large | native | 25 | 84.6 | 78.7–90.7 | 0.085 | 1.00x | 1.00–1.00 | — | baseline |
| lint_tool | native | 25 | 78.7 | 76.6–85.4 | 0.155 | 1.00x | 1.00–1.00 | — | baseline |
| file_tree_traversal | native | 25 | 105.4 | 103.0–111.7 | 0.099 | 1.00x | 1.00–1.00 | — | baseline |
| mixed_parse_write | native | 25 | 83.8 | 80.0–87.0 | 0.068 | 1.00x | 1.00–1.00 | — | baseline |

## Findings

- lint_tool/native: CV 0.155 exceeds 0.15. Host is too noisy for a meaningful comparison — rerun on a quiet machine.
- gVisor was not measured. Gate A cannot be satisfied without it — this run establishes a baseline only and does NOT confirm ADR 0013.

## Outcome

Inconclusive — see findings. ADR 0013 remains unvalidated.

