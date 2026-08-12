# Enterprise Validation Harness — Assessment and Proposal

**Status:** Proposal
**Relates to:** `CEREBROEDA-VERIFICATION-MATRIX.md`, `CEREBROHIVE_CONSTITUTION.md`, `PRODUCT_REGISTRY.md`, `CEREBROEDA-PHASE-P0.9-VALIDATION-READINESS.md`
**Implemented so far:** `tools/harness/kernel.mjs` + three registered cases

---

## 1. Assessment

The proposal is right about the important thing: **Gate A should not be a one-off.** The pattern it establishes — criteria fixed before measurement, measurement separated from judgement, verdict wired to a specific ADR, evidence recorded — is reusable and should be a permanent capability.

Two aspects of the proposal as scoped would cause problems, and both are worth stating plainly before building.

### 1.1 The scope is a multi-year platform programme

Ten harness domains across 51 products is not a tool; it is a platform team's roadmap. Building it now would repeat the exact error the phasing discipline was created to prevent.

The Blueprint moved the AI layer from Phase 4 to Phase 5 on the grounds that agents are only as good as the normalised data beneath them, and that building AI first produces a demo rather than a product. The same logic applies here. A RAG harness before there is a RAG pipeline, an agent harness before there are agents, and a knowledge-graph harness before there is a graph would all measure hypothetical systems. The measurements would be written against imagined interfaces and would need rewriting when the real ones land.

There is also a direct conflict with risk **R9 — scope creep away from the differentiator**, which the Blueprint names as one of two existential risks. A validation platform is a genuinely interesting engineering problem, and that is precisely what makes it dangerous to start now: it is more tractable and more immediately satisfying than securing a design partner (R10) or shipping the Phase 1 slice.

### 1.2 Roughly half of it already exists

The repository already contains capability that the proposed EVH would duplicate:

| Proposed EVH component | Existing capability |
|---|---|
| AI benchmark harness (§3) | `packages/evaluation-sdk`, `services/evaluation-api`, `services/evaluation-service`, `.github/workflows/llmops-eval-gate.yml` |
| Agent harness (§4) | `services/evaluation-service`, `HiveEvaluation` (registry #42) |
| RAG harness (§5) | `HiveVector` (#31), `HiveSemantic` (#30), evaluation-service |
| Security harness (§9) | `packages/hiveshield-policy`, `packages/policy-core`, `.github/workflows/security-codeql.yml`, `policy-gate.yml`, `.semgrep/`, `.gitleaks.toml` |
| Benchmark engine (§1) | `.github/workflows/load-test.yml`, `lighthouse-ci.yml`, `HiveObservatory` (#32) |
| Infrastructure harness (§10) | `HiveObservatory` (#32), `HiveOps` (#34) |
| Conformance testing | `.github/workflows/hiveforge-conformance.yml` |
| Dashboards (§Dashboard) | `HiveObservatory` (#32), `CerebroInsight` (#6) |

Building a parallel EVH would violate the architectural rule applied throughout this work — *CerebroEDA introduces no infrastructure primitive that an existing Hive product already provides* (Blueprint §1.2). That rule is why we adopted CerebroFlow for authoring rather than building a second flow editor, and why we route model calls through HiveOps rather than importing provider SDKs. It applies here with equal force.

`HiveEvaluation` is the mesh's evaluation product. If continuous AI and agent validation needs to be stronger, that is a capability gap to file against `HiveEvaluation` — not a reason to grow a competing implementation inside `tools/`.

---

## 2. Proposal

**Build the kernel now. Add domain cases as their phases arrive. Absorb rather than duplicate what already exists.**

### 2.1 What has been built

`tools/harness/` — approximately 200 lines, no domain knowledge:

```
tools/harness/
  kernel.mjs              case protocol, criteria loading, verdict, evidence recording
  cli.mjs                 list | run | gate
  cases/
    index.mjs             registry
    gate-a-sandbox-overhead.mjs   ADR 0013 — wraps the existing Gate A harness
    gate-b-workflow-scale.mjs     ADR 0009 — PENDING, needs Temporal
    gate-c-tenant-isolation.mjs   ADR 0010 — PENDING, needs data plane
    criteria/*.json               thresholds, each dated and fingerprinted
```

The kernel owns the protocol and nothing else. It does not know what Docker, an LLM, or a vector store is. Domain knowledge lives in cases.

Properties that came directly from Gate A and are worth keeping:

- **Criteria are dated and fingerprinted.** Every evidence record stamps the hash of the criteria file used. Moving a threshold after seeing results is visible in the record rather than discoverable only from git history.
- **Measurement is separate from judgement.** A measurement step cannot be tuned toward a desired verdict.
- **Failure routes to a decision.** Each case declares which ADRs it validates, so a red result names the decision to reopen instead of filling a dashboard.
- **PENDING is a first-class verdict.** An unimplemented case is visible in `harness list` with the phase it waits on. Absent-and-forgotten is the normal failure of validation plans.
- **INCONCLUSIVE does not block CI.** A missing runtime is an environment problem, not a design defect. Conflating the two trains people to ignore the gate.

### 2.2 Sequencing

Cases arrive with the phase that makes them meaningful:

| Phase | Cases added | Rationale |
|---|---|---|
| 1 | Gate A (sandbox), Gate B (workflow), Gate C (isolation) | The three ADRs resting on unmeasured assumptions |
| 1 | Signature stability corpus | ADR 0011 — cornerstone; already specified in the matrix |
| 2 | Flow reproducibility, licence-broker contention | Phase 2 introduces multi-stage flows and real licence pressure |
| 3 | Coverage merge equivalence, parser fragility corpus | Phase 3 introduces merge and the bulk of parsers |
| 4 | Graph traversal benchmark (ADR 0012 triggers T1–T5) | The trigger review needs numbers, not judgements |
| 5 | Agent grounding and eval gates | **Delegate to `HiveEvaluation`** — do not build here |
| 6 | Chaos, multi-tenant scale, release certification | Enterprise hardening |

### 2.3 What we deliberately do not build

| Not building | Instead |
|---|---|
| LLM benchmark harness | File requirements against `HiveEvaluation`; consume via `evaluation-sdk` |
| Agent harness | Same — `evaluation-service` already owns agent scoring |
| Security scanning harness | Existing CodeQL, semgrep, gitleaks, policy-gate workflows |
| Dashboards and historical trends | `HiveObservatory`; the harness emits records, it does not render them |
| A `cerebro harness` global CLI | Deferred until more than one product has cases. A cross-product CLI over one product's cases is premature generalisation |

The last row is the one most likely to be argued. A global CLI is cheap to add later and expensive to retrofit meaning into — the interface should be shaped by two or three real consumers, not by one plus imagination.

---

## 3. If the EVH is wanted as a product

There is a defensible version of the full proposal: not `tools/harness`, but a **product in the registry**, owned, staffed, and phased like any other.

That framing forces the right questions. Which persona uses it? What is the commercial rationale? Which Hive products does it depend on rather than duplicate? What is its Phase 1?

If that is the intent, the correct next step is a product specification and a registry entry — `HiveValidate` or an extension of `HiveEvaluation`'s scope — not a `tools/` directory that grows into a platform without ever having been costed.

**Recommendation:** keep the kernel in `tools/` while it serves CerebroEDA's gates. Revisit productisation when a second product registers cases against it. That is the point at which shared infrastructure is demonstrated rather than assumed.

---

## 4. Current state

```
$ node tools/harness/cli.mjs list

  gate-a-sandbox-overhead        ADR 0013  pending (phase 1)
  gate-b-workflow-scale          ADR 0009  pending (phase 1)
  gate-c-tenant-isolation        ADR 0010  pending (phase 1)
```

Gate A is implemented and self-tested (12 cases, including seven negative controls proving the gate fails when it should). It reports INCONCLUSIVE on any host without `runsc`, which is correct: **ADR 0013 remains unvalidated until it runs on infrastructure with gVisor installed.**

Gates B and C are registered as PENDING with their criteria already fixed, so the thresholds cannot be set after the results are known.
