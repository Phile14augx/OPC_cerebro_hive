# CerebroEDA — Phase 1 Spine

**Status:** Execution half complete, verified by execution
**Governing ADRs:** 0009 (workflow), 0011 (identity), 0013 (isolation), 0014 (parsers)
**Verified:** `services/eda-parser-worker/test/spine.e2e.ts` — 15 checks, all passing

---

## 1. What is built

```
RTL / tool inputs
      ↓
ExecutionProvider  ─── LocalExecutionProvider (real child processes)
      ↓
outcome vs infrastructure  ─── classify() from eda-workflow
      ↓
artifact collection (content-addressed)
      ↓
ParserProvider  ─── OpenStaTimingParser (streaming, pull-based)
      ↓
semantic keys  ─── canonicalised, measured values excluded
      ↓
SignatureComputer  ─── timing_path.v1
      ↓
run-over-run comparison  ─── new / persisting / regressed / resolved
```

| Component | Package | State |
|---|---|---|
| `LocalExecutionProvider` | `eda-execution` | Real: spawns processes, streams logs, collects outputs |
| `classify()` | `eda-workflow` | Enforced, 15 semantics checks |
| `OpenStaTimingParser` | `eda-parsers` | Real streaming parser, TypeScript |
| `CanonicalSignatureComputer` | `eda-findings` | Real, pluggable digest |
| `runIngest` / `compareRuns` | `eda-parser-worker` | Real, backend-agnostic |

## 2. What the end-to-end test proves

Two runs of the same design: one path regressed by 200ps, one path unchanged, one path new, tool exiting non-zero on the second run.

**The property everything downstream depends on:** the regressed path kept an identical signature across both runs despite its slack moving from +120ps to −80ps. It was reported as *persisting and regressed*, not as one resolved plus one new finding. Without that, every run reports 100% new findings and trend analysis, waiver persistence, and temporal retrieval for agents are all impossible.

Also verified:

- A non-zero tool exit is a **domain outcome**, and its reports are still ingested — a failed run's timing data is exactly what an engineer needs to debug the failure.
- A missing binary is an **infrastructure failure**, classified separately and never confused with an outcome.
- `LocalExecutionProvider` **refuses** a job declaring `gvisor`, rather than silently running it unisolated. A misconfiguration fails loudly at submission (ADR 0013).
- No signature collisions; signatures carry type and version.

## 3. Known deviations

| Deviation | ADR | Status |
|---|---|---|
| Digest is SHA-256 truncated to 128 bits, not BLAKE3 | 0011 | Node has no built-in BLAKE3 and this build adds no runtime dependencies. The `Digest` interface makes the swap a constructor argument. Because the algorithm participates in identity, switching requires a version bump and equivalence map like any other identity change. |
| Parsers are TypeScript, not WASM | 0014 | The `ParserProvider` contract is identical either way, so the port is a build change rather than a redesign. Required before third-party parsers are accepted. |
| No isolation on the local backend | 0013 | Deliberate and loud: the constructor requires `acknowledgeNoIsolation: true`, and the backend reports `sandboxRuntimes: []` so a scheduler cannot route a sandboxed job to it. |

Each deviation is narrow, recorded, and structurally reversible. None of them is load-bearing for the property the spine exists to prove.

## 4. What is NOT built

Persistence (repository layer), API, UI, real Yosys/OpenSTA adapters, Temporal wiring, Docker/gVisor execution. The pipeline is backend-agnostic by construction, so those are additions rather than rewrites.

## 5. Honest limits

The parser has been exercised against synthetic OpenSTA reports written to match the documented format — not against output from a real OpenSTA binary. Real reports carry vendor quirks, version drift, and edge cases this fixture does not contain. **The canonicalisation rules are the least-validated part of the spine** and should be re-checked against genuine tool output before anyone relies on cross-run identity in anger. That is the first thing to do when a real toolchain is available, and it is the ADR 0011 R1 risk (parser fragility) in its concrete form.
