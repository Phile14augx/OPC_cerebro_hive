# 0011: Canonical Artifact and Result Identity

**Decision ID:** D9 (added during ADR review)
**Gates:** Phase 1 (Thin Vertical Slice)
**Date:** 2026-08-01

## Status

Accepted

## Context

The Blueprint identifies stable result signatures as the platform's architectural cornerstone (§13.4, §26). Without them, every run is an unrelated island: regression detection is impossible, waivers must be re-triaged nightly, timing trends cannot be plotted, and the temporal retrieval that makes agent context genuinely useful (§18.3) does not exist. With them, the platform can answer the question no EDA tool answers today — *what changed, and when did this first appear?*

Because so much depends on it, identity is a platform contract, not an implementation detail. It must be specified before Phase 1 writes the first parser, because every fact ever ingested is stamped with it and a later change means reprocessing history.

The problem is that four different notions of identity are easily conflated, and conflating them produces subtle, expensive bugs:

1. **Blob identity** — are these two byte sequences the same?
2. **Artifact identity** — is this the same logical output of the same job?
3. **Finding signature** — is this the same timing path / violation / test failure as the one I saw last week, in a *different* run of a *changed* design?
4. **Reproducibility key** — would running this again produce the same result?

Only (3) is genuinely difficult. It requires deciding what "the same" means for a semantic object whose every numeric attribute is expected to change between runs — that is the entire point of tracking it.

The failure modes are asymmetric and both are bad:

- **Over-inclusive signature** (too many fields): the signature changes whenever anything changes, every run shows 100% new findings, and the feature is worthless. This is the common failure, because including a field feels safe.
- **Under-inclusive signature** (too few fields): distinct findings collapse together, waivers silently suppress real violations, and trends mix unrelated data. This is the dangerous failure, because a waiver hiding a genuine violation can reach silicon.

## Decision

**We define four distinct identity types with separate algorithms, separate versioning, and no interchangeability. Finding signatures are computed over an explicitly enumerated semantic key, exclude all measured and environmental values by construction, and are versioned with the raw source retained to permit recomputation.**

### 1. Blob identity — content hash

```
blobId = "b3:" + BLAKE3-256(bytes)
```

Pure content addressing. BLAKE3 for speed on multi-gigabyte GDS files. Enables dedup across runs, projects, and tenants at the storage layer while remaining logically isolated per tenant (ADR 0010).

### 2. Artifact identity — ULID

Artifacts are the logical role a blob plays in a job's output. Two jobs producing byte-identical GDS create two artifacts pointing at one blob. Identity is an opaque ULID; there is nothing to derive.

### 3. Finding signature — the semantic key

```
signature = "sig:" + version + ":" + BLAKE3-128(canonical_form(semantic_key))
```

**Universal exclusion rules.** No signature may include any field that is:

| Excluded category | Examples | Why |
|---|---|---|
| Measured values | slack, delay, transition, power, capacitance | These are what we track *over* the signature |
| Run metadata | run ID, job ID, timestamps, tool version, host | Signature must be stable across runs by definition |
| Positional/ordinal | line number, report rank, violation index | Report ordering is unstable across tool versions |
| Presentation | formatted strings, units, precision, whitespace | Cosmetic tool output changes must not break identity |
| Environmental | user, machine, working directory, seed | Irrelevant to semantic identity |

**Universal inclusion rules.** Every signature includes only fields that answer: *if this field changed, would an engineer say "that's a different finding" rather than "that finding changed"?*

**Per-type semantic keys:**

```
timing_path.v1     = { startpoint_canonical, endpoint_canonical,
                       path_type, corner, mode, path_group,
                       clock_launch, clock_capture }

drc_violation.v1   = { rule_id, layer,
                       cell_context_canonical,
                       location_bucket,          # see below
                       net_context_canonical }

lvs_discrepancy.v1 = { discrepancy_type, net_canonical, device_canonical }

lint_finding.v1    = { rule_id, design_unit_canonical,
                       construct_path }          # AST path, not line number

test_failure.v1    = { test_name, seed_class,
                       failure_class, assertion_id,
                       message_template }        # normalised, literals stripped

coverage_hole.v1   = { coverage_type, scope_canonical, bin_name }
```

**Canonicalisation** is where most of the real work lives:

- **Hierarchical names**: normalise separators (`/` vs `.`), strip tool-added escaping, resolve generate-block naming variants, remove instance array index formatting differences (`u_x[3]` vs `u_x_3_`). Vendor-specific normalisation lives in the parser plugin, since only it knows its tool's conventions.
- **`location_bucket`**: DRC coordinates shift by nanometres between runs for the same underlying error. Raw coordinates would break every signature every run. We quantise to a grid (default 1µm, configurable per technology) *relative to the enclosing cell's origin* rather than absolute die coordinates, so a cell moving during placement does not orphan its violations.
- **`message_template`**: test failure messages embed addresses, cycle counts, and seeds. We strip numeric literals, hex values, and paths, keeping the message skeleton.
- **Encoding**: fields sorted by name, `field=value` joined by `\x1f`, NFC-normalised UTF-8. Explicit and boring, so that two independent implementations agree.

### 4. Reproducibility key

```
reproducibilityKey = BLAKE3-128(
  flowVersionId, revisionId, canonical(params),
  sorted(toolImageDigests), pdkId+pdkVersion, seed
)
```

Answers "has this exact computation been performed?" — powering result caching and known-good comparison. Deliberately includes tool image digests, which finding signatures deliberately exclude.

### Signature versioning

Signatures are versioned independently per finding type: `sig:timing_path.v2:abc...`.

Rules:

1. **Signature algorithms are append-only.** A version is never redefined once it has stamped persisted data.
2. **Version bumps require a migration plan** in the same PR — either lazy dual-write or a backfill job.
3. **Findings store `signature_version` alongside `signature`.** Comparison across differing versions is refused rather than silently wrong.
4. **Raw reports are retained indefinitely** for the tenant's retention window, so any historical finding can be recomputed under a new version. This is the property that makes versioning survivable and is worth the storage cost.
5. **The CI parse corpus** (Blueprint §27 R1) asserts signature stability: a fixed set of real tool reports must produce byte-identical signatures on every build. A signature change is therefore never accidental — it fails the build unless the version was bumped deliberately.

### Migration on version bump

```
v(n) introduced ──▶ dual-compute v(n-1) and v(n) on ingest
                     │
                     ├─ backfill job recomputes v(n) from retained raw reports
                     ├─ equivalence map (sig_v1 → sig_v2) built during backfill
                     ├─ waivers and history follow the map
                     └─ v(n-1) retired once backfill completes and lag = 0
```

The equivalence map is what preserves waivers across a version bump. Without it, a signature change silently un-waives every suppressed violation — which would surface as a flood of "new" violations and destroy trust in the feature. Where the map is ambiguous (one v1 signature splitting into several v2 signatures), the waiver is **not** propagated and is flagged for human re-review. Failing closed is correct: an unwaived real violation is noise; a wrongly-waived real violation reaches silicon.

### Collision handling

128-bit signature over an expected population of ~10⁷ findings per project gives a collision probability around 10⁻²⁴. Accidental collision is not a practical concern; the practical concerns are *design* collisions where the semantic key is genuinely insufficient.

Mitigations:

- Signatures are scoped by `(tenant, project, finding_type)` — never compared across projects, so the effective population is small.
- Findings persist their full semantic key in a `semantic_key` JSONB column, not just the hash. A collision is therefore *detectable*: on ingest, if an existing row shares the signature but has a different semantic key, we log a `signature.collision.detected` event, refuse the merge, and store the finding under a disambiguated signature. This costs one comparison per ingest and converts an invisible correctness failure into an alertable event.
- The same mechanism catches the far more likely case: a parser bug producing identical semantic keys for genuinely different findings.

### Forward compatibility

- Unknown finding types from third-party parsers are stored with their declared type and a signature computed over the parser-declared semantic key. Parsers declare their key fields in the plugin manifest; the platform validates that no excluded-category field name appears (a parser declaring `slack` as a key field is rejected at registration).
- New fields added to an existing semantic key require a version bump. Adding a field to the *payload* does not.
- Signature computation is implemented once in `packages/eda-domain` and is the only permitted implementation. Parsers supply the canonicalised semantic key; they never compute hashes. This prevents third-party parsers from inventing incompatible identity.

## Alternatives Considered

**Tool-provided IDs.** Some tools emit violation IDs. Rejected: unstable across versions, absent in most tools, not comparable across vendors, and often just report ordinals.

**Full-content hash of the finding record.** Rejected — this is the over-inclusive failure mode in its purest form. Every slack change produces a new identity, and the feature is worthless.

**Fuzzy/ML-based matching.** Rejected as the primary mechanism. Non-deterministic, unexplainable, and unauditable — the wrong properties for something that gates waivers. It has a legitimate secondary role: suggesting that finding X is "probably the successor of" retired finding Y after a refactor, presented to a human. That is a Phase 5 assistance feature layered *on top of* deterministic signatures, never a replacement.

**Location-based identity for DRC (absolute coordinates).** Rejected: coordinates shift every run. Cell-relative bucketing preserves stability through placement changes, which is the dominant source of coordinate drift.

**Path-node-sequence hash for timing paths.** Tempting, since it captures the actual path. Rejected: any logic restructuring changes the node sequence while an engineer would still call it the same path (same startpoint, same endpoint, same corner). Endpoint-based identity matches engineer intuition, which is the standard the feature is judged against.

## Consequences

**Positive**

- Longitudinal analysis becomes a primitive rather than a feature: trends, regressions, first-appearance, and waiver persistence all fall out of one decision.
- Temporal retrieval for agents (Blueprint §18.3) is enabled — the highest-leverage context source.
- Deterministic and explainable. An engineer can be shown exactly why two findings are considered the same.
- Collisions are detectable rather than silent.
- Parser correctness becomes testable via the signature-stability corpus.

**Negative**

- Canonicalisation is genuinely hard and tool-specific. Expect to iterate through several versions per tool in the first year. The versioning and backfill machinery exists precisely because we expect this.
- Retaining raw reports indefinitely costs storage. Partially offset by content-addressed dedup and tiering.
- The `semantic_key` JSONB column adds meaningful storage on high-cardinality tables like `drc_violations`. Accepted for collision detection and debuggability; revisit with compression if it becomes material.
- Version bumps are operationally heavy. This is intentional friction — it should be hard to change identity.

## Migration Strategy

Greenfield: adopted before the first parser is written in Phase 1.

**Phase 1 scope**: `timing_path.v1` and `lint_finding.v1` only. DRC bucketing (`drc_violation.v1`) needs real layout data to calibrate the grid size and is deferred to Phase 3, where DRC ingest lands.

**Ongoing**: every parser PR must add its report to the CI signature-stability corpus. A parser without corpus coverage is not merged.

## Open Questions

1. **DRC bucket size per technology.** 1µm is a guess. Needs calibration against real runs at 5nm and at 130nm, where the correct value almost certainly differs by orders of magnitude.
2. **Cross-project signature reuse.** Should an IP block instantiated in two projects share finding signatures? Would enable "this violation is known in the IP" but crosses a project isolation boundary (ADR 0010). Currently no; revisit if IP-level analysis becomes a Phase 7 requirement.
3. **Hierarchical name canonicalisation across vendors.** Whether one universal canonicaliser is achievable or whether it must remain per-parser. Current position: per-parser, with a shared utility library — but this may produce inconsistency between two parsers for the same tool family.
4. **Retention vs. recomputation.** Indefinite raw-report retention is expensive. Is there a point after which findings become immutable and raw reports can be dropped, accepting that they can never be re-versioned? Proposed: retain raw for 2 years, then freeze signatures. Not yet decided.
5. **Signature for coverage holes.** `bin_name` stability across testbench refactors is unverified and may prove to be the weakest key in the set.

## Related ADRs

- 0009: CerebroEDA Workflow Substrate — `reproducibilityKey` in run identity
- 0010: CerebroEDA Multi-Tenancy and Data Isolation — signature scoping
- 0014: CerebroEDA Parser Runtime — where canonicalisation executes
