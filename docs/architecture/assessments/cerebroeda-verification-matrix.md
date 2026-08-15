# CerebroEDA — Architecture Verification Matrix

**Status:** Active
**Governing Documents:** `CEREBROEDA-BLUEPRINT.md`, `adr/0009`–`adr/0017`
**Enforced by:** `tools/arch/check-architecture.mjs` (fails CI if an ADR has no row here)

An architectural decision that exists only as a document decays. This matrix pairs every CerebroEDA ADR with a mechanism that makes it enforceable and a test that proves the mechanism works.

The column that matters most is **Proof of enforcement** — the test that fails when the rule is violated. A rule with no failing test is a rule that passes vacuously, which is worse than no rule because it creates false confidence.

---

## 1. Enforcement Matrix

| ADR | Decision | Enforcement mechanism | Proof of enforcement | Status |
|---|---|---|---|---|
| **0009** (D4) | Temporal behind `eda-workflow` façade | `dep-cruiser: eda-temporal-containment`; ESLint `no-restricted-imports` | `tools/arch/fixtures/violations/temporal-import` must be rejected | Enforced |
| **0009** (D4) | Tool exit ≠ activity failure | `classify()` in `eda-workflow`; single decision point | `gate-b/semantics-test.mjs` — 15 checks incl. exit 137, exhaustive infra union, no exit code leaking to retry | **Enforced** |
| **0009** (D4) | History budget for fan-out | Two caps: 500 concurrent children, ~4,000 activities per child | `gate-b/history-model.mjs` (model); cluster confirmation pending | Model only |
| **0010** (D7) | Forced RLS on every tenant table | `gate-c/schema.sql`; policy wraps `current_setting` in `(SELECT …)` to defeat generic plan caching | `gate-c/probes.mjs` — 8 postgres probes incl. prepared-statement plan cache, connection reuse, rollback residue | Harness ready, INCONCLUSIVE until CI run |
| **0010** (D7) | No query without verified context | `VerifiedTenantContext` is unforgeable outside `eda-tenancy`; `TenantScopedRepository` takes it in the constructor | Type-level: repository construction without context does not compile | Enforced (types) |
| **0010** (D7) | Probes are not vacuous | `gate-c/broken-variants.sql` — 4 deliberately broken schemas | `gate-c/verify-controls.mjs` runs BEFORE real probes; a probe passing against a broken schema fails CI | Harness ready |
| **0010** (D7) | Raw DB clients confined to `eda-tenancy` | `dep-cruiser: eda-db-access-via-tenancy-only` | `fixtures/violations/raw-pg-import` must be rejected | Enforced |
| **0010** (D7) | Vector isolation is physical, not filtered | Collection-per-tenant; no filter-based API exposed | `gate-c` vector probes: adversarial neighbour, under-filled top-k, score-only inference | Pending vector service |
| **0011** (D9) | Distinct identity types | Branded types in `eda-domain`; ESLint bans raw `string` id aliases | Type-level: passing `ArtifactId` where `BlobId` expected does not compile | Enforced |
| **0011** (D9) | Excluded fields never in signatures | `EXCLUDED_KEY_FIELDS` checked in `canonicalForm`; parser manifests validated at registration | Unit test asserts `ExcludedFieldError` for each category | Enforced |
| **0011** (D9) | Signature stability | CI parse corpus re-parses fixed reports, asserts byte-identical signatures | `pnpm run corpus:signatures` — any drift fails the build | Pending Phase 1 parsers |
| **0011** (D9) | No cross-version comparison | `assertComparable` throws on version mismatch | Unit test | Enforced |
| **0012** (D1) | Graph SQL confined to `eda-knowledge` | `dep-cruiser: eda-graph-sql-containment`; graph API expressed in graph terms | `fixtures/violations/graph-internal-import` must be rejected | Enforced |
| **0012** (D1) | Migration triggers are measured | Quarterly benchmark recording T1–T5 against the reference SoC | `tools/arch/graph-benchmark.mjs`, results committed to `docs/architecture/measurements/` | Pending Phase 4 |
| **0013** (D2) | gVisor default | `SandboxPolicy.runtime` required on every `ExecutionSpec`; admission control rejects unlisted runtimes | Gate A benchmark; policy test that a runc spec is refused outside single-tenant | Pending Gate A |
| **0013** (D2) | Deny-all egress default | `SandboxPolicy.network` defaults `'none'`; exceptions are typed and enumerated | NetworkPolicy conformance test in staging | Pending Phase 1 |
| **0013** (D2) | No credentials on runners | `serviceAccountToken: false` is a literal type, not a boolean | Type-level: cannot be set true | Enforced (types) |
| **0014** (D3) | Parsers are WASM-sandboxed | `ParserRuntime` union; container variant requires justification + approver | Malicious-parser corpus: attempts at fs/network/infinite-loop must be contained | Pending Phase 1 |
| **0014** (D3) | Parsers cannot compute identity | Host computes hashes; `Fact.semanticKey` carries fields only | `dep-cruiser: eda-signature-single-implementation` | Enforced |
| **0014** (D3) | Resource bounds | `DEFAULT_PARSER_LIMITS` with fuel metering | Corpus test: runaway parser terminates within limits | Pending Phase 1 |
| **0015** (D5) | Slang + Verible split | `LanguageFrontend` interface; index worker owns both | HDL fixture suite: parameterised modules must resolve widths | Pending Phase 1 |
| **0015** (D5) | Syntactic degrades gracefully | Facts carry elaboration provenance | Fixture: non-compiling RTL still yields syntactic facts | Pending Phase 1 |
| **0016** (D6) | Vendor-native merge is authoritative | `CoverageProvider` exposes no merge implementation of our own | Golden dataset: tree-merge totals must equal linear-merge totals exactly | Pending Phase 3 |
| **0017** (D8) | No web waveform viewer | `eda-ui` boundary rule; strip renderer limits are constants, not config | `dep-cruiser: eda-ui-is-client-only`; limits asserted in unit test | Enforced (partial) |
| **0003** | OTel facade | `dep-cruiser: eda-otel-containment` | `fixtures/violations/otel-import` must be rejected | Enforced |
| **0001** | Event envelope uniformity | `EventEnvelope` type required by `Outbox` | Type-level | Enforced |

**Status legend:** *Enforced* — mechanism exists and its failure is proven. *Enforced (types)* — compile-time only, no runtime test yet. *Pending* — mechanism designed, awaiting the phase that implements it.

---

## 2. Structural Checks

Run by `pnpm run arch:check` on every PR:

| Check | Prevents |
|---|---|
| Every eda workspace declares `cerebroEda.layer` and `cerebroEda.adr` | Packages appearing with no recorded justification |
| Declared ADRs exist on disk | Rot as ADRs are renumbered or superseded |
| Layering: dependencies point inward only | Gradual inversion of the dependency graph |
| README names governing ADRs | Reasoning becoming unfindable from the code |
| Every EDA ADR has a row in this matrix | Decisions that are documentation rather than architecture |
| Dead package detection | Accumulation of unused packages obscuring the real graph |

---

## 2.1 Evidence Provenance Model (Contract)

Status reporting is generated, never transcribed. `pnpm harness:status` derives from artifacts; `--json` is the machine-readable contract.

Every reported field carries provenance:

| Provenance | Meaning | Examples |
|---|---|---|
| `observed` | Discovered live by executing a check or probing the environment | dependency availability, self-test counts |
| `derived` | Computed from a recorded artifact | matrix rows, history model, probe module, SQL variant count |
| `declared` | Authored, because it cannot be inferred | which runtime a gate needs, which script self-verifies it |

`declared` is the category to keep minimal. All declared fields live in one `WIRING` block in `tools/harness/status.mjs`.

### Invariants

These are **design invariants, not incidental checks**. They preserve the evidence-driven property of the system, and each has been demonstrated to fail when violated (`tools/harness/self-test.mjs`, enforced in CI).

| # | Invariant | Prevents |
|---|---|---|
| 1 | `declared <= gateCount` | Manually authored evidence growing independently of the gate model |
| 2 | Every declared field originates from `WIRING_SOURCE` | Hand-authored evidence reintroduced elsewhere while the count stays legal |
| 3 | Every established finding carries `provenance` and `from` | Unattributed evidence entering silently |

Invariants 1 and 2 are complementary rather than redundant: an injected field from another module trips both, while a field with no provenance at all trips only 3. All three were verified by deliberate violation, not by observing a passing run.

### Why this exists

The status table was hand-transcribed twice and drifted both times — once conflating "no measurement exists" with "a measurement exists but was too noisy", once reporting infrastructure as provisioned when it was only provisionable. The first generated version then repeated the error with a hand-typed `established` map claiming 16 checks where the test had 15. Deriving the value corrected it on first execution.

**Rule for contributors:** if a number about the system appears in documentation, it should be derived from the artifact that produces it, or it will eventually be wrong.

---

## 3. Validation Gates

Three ADRs rest on unmeasured assumptions. Each has a gate that must run before the phase depending on it, and each has a pre-committed condition that reopens the ADR. The point of writing the reopening condition down now is that it is much harder to argue away later.

**Current readiness status (environment-blocked, not implementation-blocked):** see `CEREBROEDA-PHASE-P0.9-VALIDATION-READINESS.md` for the full assessment, exit criteria, and recommended execution order for closing Gate A, Gate C, and the parser corpus.

### Gate A — gVisor overhead (ADR 0013)

**Question:** what does gVisor actually cost on EDA I/O profiles? Published benchmarks do not cover this workload.

| Workload | Measured on | Comparison |
|---|---|---|
| Parser-heavy (large report ingest) | native, runc, gVisor, Kata | wall-clock, syscall count |
| Filesystem-heavy (synthesis scratch I/O) | same | wall-clock, IOPS |
| CPU-heavy (STA) | same | wall-clock |
| Mixed (full reference flow) | same | wall-clock, peak RSS |

**Reopens ADR 0013 if:** any per-workload threshold in `tools/arch/gate-a/criteria.json` is exceeded. Thresholds live only in that file — restating them here would create a second source of truth that eventually disagrees with itself.

**Run:** `node tools/harness/cli.mjs run gate-a-sandbox-overhead --phase 1`
**Self-test:** `node tools/arch/gate-a/self-test.mjs` (12 checks, 7 negative controls)

### Gate B — Temporal at regression scale (ADR 0009)

**Question:** does the execution model hold at fan-out scale?

Prototype at 50, 500, 5,000 and 10,000 jobs, measuring scheduling latency, workflow history growth, async completion under load, and deterministic replay after a worker restart.

**Must specifically confirm:** a non-zero tool exit is recorded as a domain `outcome` and is *not* retried, while an evicted pod *is*. This is the failure mode ADR 0009 names as most easily botched.

**Already established (no cluster needed):** `gate-b/semantics-test.mjs` validates the classification exhaustively — 16 checks including exit 137 (OOM-killed tool) classified as outcome, every member of the `InfraFailure` union handled, and no exit code able to leak into a retry path.

**Model finding:** `gate-b/history-model.mjs` predicts a 50,000-activity single workflow exceeds Temporal's terminate limit by 3.7x, and that 10,000 sits at 73% with no retry margin. ADR 0009 amended with a second cap (~4,000 activities per child) as a result.

**Still requires a cluster:** scheduling throughput, real history growth, async completion under load, replay after worker restart.

**Reopens ADR 0009 if:** history growth forces continue-as-new more often than once per 1,000 jobs, or dispatch p99 exceeds the 2s SLO at 10,000 jobs.

**Run:** `node tools/harness/cli.mjs run gate-b-workflow-scale --phase 1` (INCONCLUSIVE without `TEMPORAL_ADDRESS`)

### Gate C — Tenant isolation, adversarially (ADR 0010)

**Question:** can the isolation model actually be broken?

Adversarial, not happy-path. Each attempt must fail:

| Attempt | Target |
|---|---|
| Query tenant B's rows with tenant A's session | RLS |
| Query with `app.current_org` unset | RLS + connection middleware |
| Reuse a pooled connection carrying stale settings | Pool release hook |
| Presign tenant B's blob under tenant A's context | Storage provider |
| Retrieve tenant B's chunks using adversarially near-identical embeddings | Vector isolation |
| Reach tenant B's workspace volume from a tenant A runner | NetworkPolicy + namespace |
| Escalate via a mounted service account token | Pod security |
| Read an ITAR artifact without clearance | Export-class policy |

The embedding test matters more than it looks: the naive version, using dissimilar vectors, passes even when isolation is completely broken.

**Reopens ADR 0010 if:** any attempt succeeds.

**Script:** `tools/arch/gate-c-isolation.test.ts` — runs against ephemeral infrastructure in CI.

---

## 4. Review Obligations

| Obligation | Cadence | Owner | Records to |
|---|---|---|---|
| D1 graph store trigger review (T1–T5) | Quarterly | Platform Arch | `docs/architecture/measurements/graph-*.md` |
| Gate A re-measurement on runtime upgrade | Per gVisor/Kata bump | Security | `measurements/sandbox-*.md` |
| Parser corpus expansion | Per parser PR | Whoever ships the parser | corpus fixtures |
| Matrix review — are "Pending" rows still pending for a good reason? | Per phase exit | Platform Arch | this file |

The last row is the one most likely to be skipped and the one that matters most: "Pending" is acceptable while the phase has not arrived, and is technical debt the moment it has.
