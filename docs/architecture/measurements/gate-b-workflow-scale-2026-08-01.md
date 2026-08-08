# Gate B — Workflow History Growth Model (ADR 0009)

> **MODEL, NOT MEASUREMENT.** Computed from documented Temporal defaults and the
> stated event model below. Produces a prediction for the real Gate B run to
> confirm or refute — it does not itself satisfy Gate B.

## Assumptions

| Assumption | Value | Confidence |
|---|---|---|
| History count terminate limit | 51,200 | documented default, unverified on our cluster |
| History count warn threshold | 10,240 | documented default, unverified |
| Events per activity (base) | 3 | high — scheduled/started/completed is structural |
| Completions per workflow task | 4 | LOW — depends on concurrency and poll timing |
| Bytes per event | 512 | LOW — payload-dependent; assumes artifact refs not blobs |

The two low-confidence assumptions are the ones the real run must pin down.

## Predicted history growth, single workflow

| Activities | Activity events | Workflow-task events | Total events | % of terminate limit | Est. size | Status |
|---|---|---|---|---|---|---|
| 10 | 30 | 9 | 44 | 0.1% | 0.0 MiB | **ok** |
| 100 | 300 | 75 | 380 | 0.7% | 0.2 MiB | **ok** |
| 1,000 | 3,000 | 750 | 3,755 | 7.3% | 1.8 MiB | **ok** |
| 10,000 | 30,000 | 7,500 | 37,505 | 73.3% | 18.3 MiB | **warns** |
| 50,000 | 150,000 | 37,500 | 187,505 | 366.2% | 91.6 MiB | **TERMINATES** |

## Finding

Maximum activities in a single workflow, with 40% headroom: **8,190**.

A 50,000-activity regression **cannot run as one workflow** — the model puts it at 187,505 events, 366% of the terminate limit. Temporal would terminate the run mid-flight.

Even 10,000 activities reaches 37,505 events (73% of the limit) — inside the hard cap but past the warning threshold, with no margin for retries. A single retry storm would push it over.

This **validates the child-workflow-per-shard design** in ADR 0009 §8.3, and sharpens it:

- The parent workflow must dispatch **child workflows**, not activities, beyond ~8,190 units.
- Shard batch size should target ≤ 4,095 activities per child, leaving room for retries.
- ADR 0009's "500 concurrent children" cap is about concurrency, not history. Both caps are needed and they are not the same constraint.
- A parent coordinating N children spends ~5 events per child, so the parent tolerates far more shards than a flat workflow tolerates activities.

## What the real Gate B run must confirm

1. Actual configured limits on the deployed cluster (may differ from documented defaults).
2. Real `completionsPerWorkflowTask` under our concurrency — the highest-leverage unknown.
3. Real bytes per event with our payload shapes.
4. Whether continue-as-new is needed for long-lived parents, and at what child count.
5. Replay latency at each scale — history size drives worker memory and recovery time.

