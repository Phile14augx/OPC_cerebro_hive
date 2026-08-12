# 0016: CerebroEDA Coverage Model and Merge Strategy

**Decision ID:** D6
**Gates:** Phase 3 (Analysis Depth)
**Date:** 2026-08-01

## Status

Accepted

## Context

Coverage closure is the dominant cost in verification, and coverage merge is the dominant bottleneck in a nightly regression (Blueprint §11). A large project produces 10,000+ coverage databases per night that must be merged into a single view before anyone can ask whether the night moved coverage forward.

Two structural problems:

1. **Merge is expensive and usually done badly.** Linear merging of 10,000 databases — the default in most homegrown flows — is O(n) sequential merges where each merge grows the accumulator. It routinely takes longer than the simulations themselves.
2. **Coverage data is vendor-locked.** Every simulator has its own database format and merge tool. The formats are proprietary, the merge tools are licensed, and cross-vendor comparison is effectively impossible.

The second problem creates a genuine strategic tension. A platform-neutral coverage model would let us reason about coverage independently of the simulator — attractive for a vendor-neutral orchestration platform. But coverage semantics are subtle (cross-coverage, ignore/illegal bins, weighted merges, exclusions), and a lossy neutral model that produces coverage numbers disagreeing with the vendor tool is worse than useless. Verification sign-off is done against the vendor's number, and any platform reporting a different one will be distrusted and abandoned.

Relevant standard: Accellera UCIS (Unified Coverage Interoperability Standard) defines a data model and API for coverage interchange. Vendor support exists but is uneven, and in practice adoption has been weaker than the standard's authors hoped.

## Decision

**Vendor-native merge remains authoritative. We orchestrate it as a hierarchical merge tree, and separately extract a normalised metrics projection for cross-run analysis, trending, and AI reasoning. The projection is never presented as a sign-off number.**

### Two-layer model

| Layer | Authority | Purpose |
|---|---|---|
| Native coverage database | Authoritative | Sign-off, vendor tool viewing, detailed hole analysis |
| Normalised projection | Advisory | Trending, cross-run delta, agent reasoning, dashboards |

This mirrors the platform's governing constraint (Blueprint §26): the certified tool remains the authority, and we orchestrate and remember. Applying the same rule to coverage keeps the product coherent — the same argument that stops us building a timing engine stops us building a coverage engine.

### Hierarchical merge

```
10,000 test coverage DBs
        │
   ┌────┴────┐  fan-in factor F = 16 (tunable per tool)
   ▼         ▼
 batch 1 ... batch 625      ← parallel vendor merge jobs
   │         │
   └────┬────┘
        ▼
    39 intermediates        ← parallel
        ▼
     3 intermediates
        ▼
    final merged DB
```

Depth is log_F(n) — four levels for 10,000 databases instead of 10,000 sequential merges. Each level is a fan of independent jobs dispatched through the normal job pipeline, so it inherits retries, licence claims, and observability without special-casing.

Design details that matter:

- **Fan-in factor is per-tool.** Merge cost is not linear in input count for every tool; F is tuned from measured data per adapter, defaulting to 16.
- **Intermediate results are cached** by the content hash of their input set. A re-run that adds 50 tests to a 10,000-test regression re-merges only the affected subtree. This is a large win for the common incremental case and falls out of content addressing (ADR 0011).
- **Merge is a flow stage**, expressed as a child workflow (ADR 0009), so partial failure is handled by the existing policy machinery rather than a bespoke aggregator.
- **Licence-aware.** Merge tools consume licences. The merge tree respects the same `ResourceClaim` model, which is precisely why naive parallel merge fails in real environments — it deadlocks against the licence pool.

### Normalised projection

Extracted from the final merged database (and optionally from intermediates) via the parser plugin interface (ADR 0014):

```
coverage_metric {
  scope_canonical      # hierarchical path, canonicalised per ADR 0011
  coverage_type        # statement|branch|toggle|fsm|expression|functional|assertion
  bin_name             # for functional coverage
  hits                 # aggregate
  goal                 # target count
  excluded             # bool, with reason
  weight
  signature            # coverage_hole.v1
}
```

Deliberately excluded from the projection: merge semantics, cross-coverage expansion, and exclusion inheritance rules. These are where vendor tools differ subtly and where a reimplementation would produce numbers that disagree with sign-off. The projection reports *what the vendor tool computed*, at a granularity useful for trending — it does not recompute anything.

### What the projection enables

- **Trending**: coverage by scope over time, which the vendor tool does not provide across runs.
- **Delta analysis**: which bins moved, which regressed, which have been static for 20 runs.
- **Hole ranking**: uncovered bins ranked by weight, code proximity to recent changes, and historical difficulty.
- **Agent reasoning**: the Coverage Strategist (Blueprint §18.2) reasons over the projection, with citations back to the native database.

Coverage holes carry signatures (`coverage_hole.v1`, ADR 0011), so "this bin has been uncovered for 40 runs" is answerable — the kind of longitudinal question that motivates the whole identity design and that no vendor tool answers.

### UCIS

We consume UCIS where a tool exports it, since it is a better-structured input than parsing text reports. We do not require it, do not merge in UCIS form, and do not treat it as our canonical model. It is one supported input format among several, handled by a parser plugin like any other.

## Alternatives Considered

**Platform-neutral canonical coverage model with our own merge.**
Rejected, though it is the more ambitious and initially more attractive option. Benefits: vendor independence, cross-simulator comparison, no merge licence cost. Fatal problems: coverage merge semantics are subtle and vendor-specific (exclusion inheritance, cross-coverage bin expansion, weighted goals, illegal-bin handling), our numbers would differ from sign-off numbers in ways that are hard to explain, and reimplementing merge is squarely the scope creep of risk R9. A verification manager comparing our coverage figure to their simulator's and finding a discrepancy will stop using the platform that day.

**Linear vendor merge (status quo in most flows).**
Rejected. Simple and correct but far too slow. It is the specific pain we are addressing, and orchestrating it better is a concrete, demonstrable Phase 3 win.

**UCIS as the canonical internal model.**
Rejected as canonical, accepted as an input. The standard is well-designed, but vendor support is inconsistent, some implementations are lossy, and adopting it as canonical would mean our fidelity is capped by the weakest vendor exporter. It also would not solve merge, since merging in UCIS form means implementing merge semantics ourselves — the rejected alternative above, wearing a standard's name.

**Store only aggregate percentages.**
Rejected. Cheap, and useless for hole analysis, ranking, or agent reasoning. Per-bin granularity is what makes the projection worth having.

**Sampling / probabilistic merge.**
Rejected. Statistically defensible for trending, indefensible for a verification audience who will reasonably ask why the number moves when nothing changed.

## Consequences

**Positive**

- Sign-off numbers always match the vendor tool, because they are the vendor tool's numbers. No trust erosion.
- Merge wall-clock drops from O(n) to O(log n) — a concrete, measurable improvement teams feel immediately.
- Intermediate caching makes incremental regressions substantially cheaper.
- Cross-run trending and hole longevity become available, which no vendor tool provides.
- The AI layer gets structured coverage data with stable identity.
- Merge orchestration reuses the existing job pipeline rather than introducing a bespoke aggregator.

**Negative**

- Dependent on vendor merge tools and their licences. If merge licences are scarce, the merge tree's parallelism is capped and the improvement is bounded by licence count rather than by compute.
- Two representations of coverage (native and projection) can diverge if extraction is buggy. Mitigated by asserting that projection totals reconcile with the vendor's reported totals, alerting on mismatch, and treating any mismatch as a parser defect.
- Per-bin projection for a large SoC is a lot of rows. Partitioned and retention-managed like other analysis tables.
- Cross-simulator comparison remains impossible. Accepted — it is a niche need, and honestly reporting the limitation is better than a misleading approximation.

**Neutral**

- Fan-in tuning per tool is ongoing operational work rather than a one-time setting.

## Migration Strategy

Phase 3, alongside regression fan-out — the two are naturally coupled since fan-out creates the merge problem.

**Sequence:**

1. Merge tree orchestration for one open-source simulator (Verilator/covered) to validate the tree, caching, and failure policy.
2. Projection extraction and `coverage_hole.v1` signatures.
3. Trending and delta UI.
4. Commercial simulator adapters, each contributing measured fan-in tuning.

**Validation gate:** merged coverage totals from the tree must exactly equal totals from a linear merge of the same inputs, asserted on every adapter in CI. A merge tree that produces different results from sequential merge is a correctness bug, and coverage merge is not always perfectly associative in practice — this must be verified per tool, not assumed.

## Open Questions

1. **Merge associativity per tool.** Assumed but not verified for every simulator. Exclusion inheritance and cross-coverage expansion may not be order-independent. The validation gate will surface this; the response if a tool fails is unresolved (likely: fall back to linear merge for that tool and document it).
2. **Optimal fan-in.** Depends on per-tool merge cost curves, which are unmeasured.
3. **Exclusion and waiver handling.** Coverage exclusions are managed in vendor-specific files. Should the platform manage them (with the same signature-based persistence as DRC waivers) or defer to existing customer flows? Managing them is more valuable and more invasive.
4. **Assertion coverage.** Sits between coverage and verification results. Whether it belongs in this model or alongside test results is unresolved.
5. **Formal verification results.** Formal coverage has different semantics (proven / bounded-proven / unreachable) that this model does not represent. Out of scope for Phase 3; needs its own model if formal becomes a supported flow.

## Related ADRs

- 0009: CerebroEDA Workflow Substrate — merge tree as child workflows
- 0011: Canonical Artifact and Result Identity — `coverage_hole.v1` signatures, intermediate caching
- 0014: CerebroEDA Parser Runtime — coverage extraction as parser plugins
