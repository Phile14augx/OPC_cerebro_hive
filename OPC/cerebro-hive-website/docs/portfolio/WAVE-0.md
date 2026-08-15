# Wave 0 — Engineering Stabilization Release

**Ledger IDs:** `W0.1` … `W0.5`  
**Baseline:** Portfolio Baseline v1.0 (frozen 2026-08-15)  
**Rule:** execute strictly in order. Do not start W0.N+1 until W0.N exit is evidenced.

Do not increase the 50-product surface. Move the kernel toward its first L6 primitives, move Studio/Archive/Forge from L4 toward L5, and make CI incapable of lying about either.

The 2026-08-15 Perceptronic Knowledge Graph contract is **architecturally frozen at L3**. Do not implement `KRN-015` / `KRN-KG-*` runtime, and do not extend that specification, during Wave 0. Wave-1 window opens after W0.3.

---

## W0.1 — Repository truth and scope isolation

**Ledger:** `KRN-SCOPE-001`  
**Objective:** Get outstanding work into intelligible ledger-scoped branches. Land this folder as the operational constitution. Mark historical plans superseded for assignment. Do not delete them.

**Exit:**
- `docs/portfolio/` is the assignment source
- historical plans carry the superseded banner
- no mixed uncommitted dump is treated as a shippable unit
- each remaining dirty path is mapped to a ledger ID and a target branch (see [W0.1-WORKTREE-ISOLATION.md](./W0.1-WORKTREE-ISOLATION.md))

Branch/PR naming:

```text
KRN-CI-001        CI fail-closed
KRN-PERSIST-001   Runtime persistence
KRN-AGENT-001     Canonical agent runtime
EOS-CORE-001      Enterprise OS persistence adaptation
POS-CORE-001      Personal OS persistence adaptation
PROD-001-*        Studio
PROD-005-*        Archive
PROD-026-*        Forge
```

A branch must not mix unrelated Nexarch + CI + runtime + product + docs work.

---

## W0.2 — CI fail-closed

**Ledger:** `KRN-CI-001`  
**WIP slot:** CI / remediation (exclusive until this package closes)  
**Do not start until W0.1 has exited.**

Classify every workspace package as exactly one of:

```text
SOURCE_PACKAGE
GENERATED_PACKAGE
CONFIG_PACKAGE
DOCS_PACKAGE
META_PACKAGE
```

A `SOURCE_PACKAGE` must have real `typecheck`, `lint`, `test`, and `build` as applicable. Missing required command = CI failure. No-op command = CI failure.

As applicable (enforced by `scripts/audit-workspace-contracts.mjs`):

- `typecheck` — required when `tsconfig.json` exists
- `lint` — required when an ESLint config already exists in the package
- `test` — required when test files exist (`*.test.*` / `*.spec.*`). A test-runner config with zero tests does not force a dummy script
- `build` — required when the package is actually built (Next/Vite app, or `main` / `types` / `exports` point at `dist/`)

Do not add dummy scripts (`exit 0`, `true`, `echo no tests`) to go green. Missing tests on a SOURCE package without test files is N/A, not a silent skip of existing tests.

Prohibited:

```json
"typecheck": "exit 0"
"test": "echo no tests"
"lint": "true"
"build": "exit 0"
```

`forge-api` fails until typecheck is real. `identity-core` fails until it has appropriate scripts. `apps/studio` cannot move to L5 without a test contract.

Implement `scripts/audit-workspace-contracts.mjs` emitting:

```text
PACKAGE  TYPE  TYPECHECK  LINT  TEST  BUILD  EXEMPTION  EXEMPTION_REASON  EXPIRY
```

Exemptions are machine-readable and explicit, never silent skips. Dummy scripts for all 141 packages are not the fix.

**Exit:** validation cannot silently skip real source code. YAML/workflow validation and dependency integrity are in the merge gate.

**GitHub-visible check (do not change branch protection in this wave):** nested `OPC/cerebro-hive-website/.github/workflows` is not loaded by GitHub. Canonical workflow is `.github/workflows/website-ci.yml`. Job to require later:

```text
Website CI / workspace-contracts
```

That job runs `pnpm repo:policy` (`scripts/audit-workspace-contracts.mjs`). Nested `ci.yml` is a pointer only.

---

## W0.3 — Durable kernel persistence

**Ledger:** `KRN-PERSIST-001` (+ `EOS-CORE-001` adapter, `POS-CORE-001` adapter)  
**Do not start until W0.2 has exited.**

In-memory state is valid for caches, request-local state, ephemeral queues, tests, and development adapters.

In-memory / JSON is **not** valid as authoritative system-of-record for recovery, audit, continuation, governance, agent memory, workflow resumption, or enterprise decision history.

Replace authoritative uses of `data/agent-os.json`, process-local maps, and JSON file stores with Prisma repositories, in this order:

```text
Agent → AgentVersion → AgentExecution → ExecutionStep/Trace
  → ToolExecution → Memory → Plan → Workflow execution
  → Approval → Audit evidence
```

**Restart recovery test (required):**

1. Create agent  
2. Publish version  
3. Start execution  
4. Persist state  
5. Kill process  
6. Restart services  
7. Retrieve execution  
8. Resume/inspect execution  
9. Retrieve memory  
10. Verify audit trail  

Until that passes, Enterprise Agentic OS cannot credibly exceed L3/L4. JSON persistence is prohibited in production.

---

## W0.4 — One agent runtime

**Ledger:** `KRN-AGENT-001`  
**Do not start until W0.3 has exited.**

Select one canonical execution path (prefer an existing package over a new `packages/agent-runtime` unless no current package can own the contract). All products consume it:

```text
Personal OS, Studio, Forge, Enterprise OS, Flow, Archive agents, future ERP agents
        → Canonical Agent Runtime
```

Exactly one: execution lifecycle, agent state model, agent version model, tool invocation protocol, memory contract, trace contract, policy enforcement point, evaluation lifecycle.

Migration rule (no big-bang delete):

```text
ACTIVE → LEGACY_ADAPTER → consumers migrate → contract parity tests pass → remove
```

**Exit:** competing implementations inventoried; legacy adapter established; at least one real E2E agent migrated; policy + tool + memory + telemetry travel the canonical path.

---

## W0.5 — Baseline verification

**Ledger:** `KRN-VERIFY-001`  
**Do not start until W0.4 has exited.**

Wave 0 is not complete because code was written. It closes when repository, CI, persistence, and runtime exit lists in this file are all true, plus break tests:

```text
introduce TS error              → CI FAIL
remove test implementation      → CI FAIL
break Prisma schema             → CI FAIL
introduce invalid YAML          → CI FAIL
use prohibited no-op script     → CI FAIL
```

Then revert each.

---

## WIP interpretation (Wave 0)

| Slot | Meaning now |
|---|---|
| Products (3) | **Only** Studio, Archive, Forge. Goal L4→L5 then L5→L6. No fourth product until one exits. |
| Enterprise OS (1) | Persistence/runtime migration only. No new enterprise feature surface. |
| Personal OS (1) | Contracts and migration to the shared kernel only. No new personal workflows. |
| Services (5) | SOW, questionnaire, pricing, acceptance, runbooks. No new service codebases. |
| Infrastructure (1) | Only required infra for W0. |
| CI (1) | Exclusively W0.2 until fail-closed. |
| Platform P0 (2) | W0.3 persistence and W0.4 runtime, in that order, not in parallel with extra P0s. |

---

## Maturity gates (after Wave 0)

Do not target “50 products.”

**Gate A — kernel**

```text
14/27 L3+  →  20/27 L3+
1/27 L4+   →  8/27 L4+
0/27 L6    →  3/27 L6
```

First L6 candidates: Identity, Persistence, LLM Gateway (or Identity, LLM Gateway, Agent Runtime if dependency analysis prefers that set).

**Gate B — L4 products**

```text
Studio   L4 → L5
Archive  L4 → L5
Forge    L4 → L5
```

**Gate C — one OS vertical slice**

```text
Identity → Agent Registry → Agent Runtime → Model Gateway
  → Tool → Memory → Policy → Persistent Execution → Audit → Evaluation
```

One workflow through all of those is the next product-quality goal.

---

## Headline metric

**Verified Capability Throughput** = number of ledger capabilities that moved upward ≥1 evidence level and passed the new level’s exit gate during the reporting period.

Report beside it: **Started : Verified**.

This period (Wave 0 open): Verified = 0. Optimise for Verified, not Started.
