# Portfolio Recovery Governance

**Effective:** 2026-08-15  
**Binds:** all agents (Claude, Codex, Gemini, Cursor) and human contributors  
**Backed by:** [MASTER-IMPLEMENTATION-LEDGER.md](./MASTER-IMPLEMENTATION-LEDGER.md)

---

## 1. No-new-plans rule

No new product, service, architecture, feature, or roadmap may be introduced unless it is first added to the Master Implementation Ledger with a dependency, priority, and completion impact.

The repository already contains a six-month Mega Plan whose stated target is 50 products + 50 services. That target is not cancelled. Its **sequencing and parallelism are**. Work is assigned from this folder, not from a new 90-page vision.

---

## 2. Definition of Done (software)

A product or kernel capability is **Done** only when all of the following are evidenced:

```text
Specification approved
+ real frontend
+ real backend
+ real persistence
+ real authentication/authorization
+ real integrations
+ real agent/model execution (if in scope)
+ unit tests
+ contract tests
+ integration tests
+ E2E tests
+ security tests
+ observability
+ deployment
+ runbook
+ acceptance evidence
```

Anything less remains `IN PROGRESS`. Declared GA/Beta/MVP is ignored. **GA = L7 only.**

A service is **delivery-ready** only when the 17 artefacts in the ledger header exist as files (not as a paragraph in a catalogue). Case study/benchmark is required for commercial GA, not for first delivery-ready.

In-memory and JSON stores are valid for caches, request-local state, ephemeral queues, tests, and development adapters. They are **not** valid as authoritative system-of-record for recovery, audit, continuation, governance, agent memory, workflow resumption, or enterprise decision history.

---

## 3. Agent pipeline and WIP limits

Agents do not start a second portfolio item in the same stream until `CLOSE`.

```text
DISCOVER → SPECIFY → IMPLEMENT → INTEGRATE → VERIFY → REVIEW → MERGE → DEPLOY → CLOSE
```

| Work type | Max active | Wave 0 meaning |
|---|---:|---|
| Platform P0 | 2 | W0.3 then W0.4 — not extra P0 features |
| Products | 3 | **Only** Studio, Archive, Forge. L4→L5 then L5→L6. No fourth product until one exits. |
| Enterprise OS | 1 | Persistence/runtime migration only |
| Personal OS | 1 | Kernel contracts/migration only. No new personal workflows. |
| Service enablement | 5 | Delivery packs (SOW, questionnaire, runbook). No new codebases. |
| Infrastructure | 1 | Only infra required by Wave 0 |
| CI / remediation | 1 | Exclusively W0.2 until fail-closed |

Do not assign “implement CerebroFinance / CerebroHR / HiveMemory / Personal OS / Marketplace” in parallel. Twin Studio stays on its existing branch and does not consume a product slot.

---

## 4. Execution waves (dependency DAG)

Sequence **dependencies**, not product numbers.

```text
Wave 0 Truth
    → Wave 1 Platform Kernel
        → Wave 2 Agentic Kernel
            → Wave 3 Intelligence/Data
                → Wave 4 Core Experience (Studio, Agent, Flow, Search, Archive, Insight, Assist, Learn, both OS profiles)
                    → Wave 5 Business Applications
                    → Wave 6 Ecosystem
                        → Wave 7 Production hardening
```

Service packs (Wave 8 factory) may run in parallel from Wave 1 at WIP 5. They must not spawn new codebases.

| Wave | Objective | Exit |
|---|---|---|
| 0 Truth | Inventory, CI that cannot skip, commits, secrets, canonical docs | Main reproducibly green; ledger is the backlog |
| 1 Platform Kernel | Tenant, identity, RBAC, DB, events, gateway, policy, audit, observability | Those P0 rows ≥ L6 |
| 2 Agentic Kernel | Registry, runtime, tools, memory, planning, workflow, eval, approval | One real autonomous task E2E |
| 3 Intelligence/Data | Data, vector, search, knowledge, semantic, analytics | Retrieval + graph E2E |
| 4 Core Experience | Studio/Agent/Flow/Search/Archive/Insight/Assist/Learn + OS profiles | Personal and enterprise workflow E2E |
| 5 Business Applications | ERP…Customer360 on the kernel | Each ≥ L6 |
| 6 Ecosystem | Exchange, marketplace, billing, license, partner, deploy, cloud, govern | Each ≥ L6 |
| 7 Hardening | Security, performance, DR, SLO, compliance, cost | Production readiness audit |

Products already in L3–L4 advance during waves 1–4 as they consume the kernel. They do not restart at Wave 5 from zero.

---

## 5. GitHub as execution control plane

One parent epic per ledger ID, for example `[PROD-009] CerebroERP`, with children:

```text
*-ARCH *-DATA *-API *-AUTH *-UI *-AGENTS *-INTEGRATION
*-TEST *-SECURITY *-OBSERVABILITY *-DEPLOYMENT *-DOCS
```

Each PR references one ID or a small coherent set. **Do not** land mixed platform + CI + docs + schema + product branches.

Until GitHub epics exist, the ledger ID in the PR title is mandatory (`KRN-002`, `PROD-001`, `WAVE-0`).

---

## 6. CI as portfolio gate

### Current (exists, not fully trustworthy)

| Gate | Workflow / script | Trust |
|---|---|---|
| Typecheck + lint | `.github/workflows/ci.yml` `turbo typecheck` / `turbo lint` | Partial — turbo skips packages without scripts (59 lack typecheck, 110 lack lint) |
| repo:policy | `pnpm repo:policy` in ci.yml | Exists; does not catch `typecheck: exit 0` |
| Unit tests | `turbo test` | Partial — 94/141 packages have no test script; `apps/studio` has none |
| Build | `turbo build` | Partial |
| Secret scan | `secret-scanning.yml` | Exists |
| SBOM | `sbom.yml` | Exists |
| Trivy / CodeQL | `trivy.yml`, `codeql.yml` | Exists |
| Dependency review | `dependency-review.yml` | Exists |
| Root app typecheck | ci.yml extra step | Exists (root Next.js is not a workspace package) |

### Required merge gate (Wave 0 → Wave 7)

```text
repo-policy (reject no-op scripts)
dependency-integrity
yaml-validation
secret-scan
schema-validation
migration-validation
typecheck-all (no silent skip)
lint-all
unit-tests
contract-tests
integration-tests
route-health
e2e
security
dependency-review
SBOM
build-all
```

Then product-specific acceptance tests named by ledger ID.

A feature is not implemented if CI cannot prove it. Package classification, no-op prohibition, and `scripts/audit-workspace-contracts.mjs` are specified in [WAVE-0.md](./WAVE-0.md) W0.2 — implement there, not as dummy scripts on all 141 packages.

---

## 7. Superseded plans

**KEEP as history, stop using as assignment sources.**

| Path | Stated outcome | Action |
|---|---|---|
| `docs/plans/active/cerebrohive-aeos-6-month-mega-plan.md` | 50 products in production + 50 services | **SUPERSEDE sequencing.** Keep as commercial target only. |
| `docs/plans/active/cerebrohive-6-month-master-plan.md` | Same programme, earlier revision | **SUPERSEDE.** Use evolution log as history. |
| `docs/plans/active/master-plan-evolution-log.md` | How the plan changed | **KEEP** as history. |
| `docs/reviews/master-plan-gap-assessment.md` | Plan vs repo | **KEEP** as prior audit. Ledger supersedes its backlog. |
| `docs/plans/active/agent-runtime-backlog.md` | M10.1–M10.7 | **FOLD** into KRN-006 / PROD-037. Stop as a parallel programme. |
| `docs/plans/active/2026-08-11-agent-academy-agent-registry.md` | Agent registry slice | **FOLD** into KRN-005. No new front. |
| `docs/plans/active/2026-08-11-twin-industry-framework.md` | Twin industries | **DEFER** to Wave 5/IS packs. Twin Studio already has a slice. |
| `agents/CLAUDE-TASKS.md`, `GEMINI-TASKS.md`, `CURRENT-SPRINT.md` | Multi-agent parallel P0s | **REPLACE** with Wave 0 + WIP limits. Cycle counts (13+) are evidence the old model failed. |
| `apps/studio/lib/data/products` 12-product tree | Sphere/Pulse/X marketing OS | **DO NOT** drive engineering. Marketing only until reconciled with the 50. |
| `docs/products.md` 5-product list | Flow/Agent/Learn/ERP/OS | **SUPERSEDE** as canonical catalogue. |
| `docs/03-services/` 7-practice corpus | Parallel service taxonomy | **RECONCILE** into SA/EI/AO/SG/IS packs. Do not author a fourth taxonomy. |
| `.planning/` GSD roadmaps | Studio dashboard 8-phase programme | **FOLD** into PROD-001 Wave 4. No new GSD project. |
| Nexarch overnight programme | Command center + kernel packages | **FOLD** into OS-E-* and KRN-* after W0.3. **Do not run `nexarch-commit.sh`** — it is a mixed dump. Split per [W0.1-WORKTREE-ISOLATION.md](./W0.1-WORKTREE-ISOLATION.md). |

Completed Studio Company OS and Twin Studio plans in `docs/plans/completed/` stay as shipped history. They do not authorise new adjacent programmes.

---

## 8. Gap report → P0 / P1 / P2 backlog

Generated from ledger gaps. This is the only backlog.

### P0 — Wave 0 (Truth)

1. Establish this ledger as the only assignment source (this folder).  
2. Commit or deliberately discard the uncommitted batches (Nexarch, M26.1 audits, lockfile, AgentExecution schema, platform security modules). Mixed 50-commit branches are forbidden — split by ledger ID.  
3. Make `turbo typecheck` / `lint` / `test` fail closed: every workspace package has a real script; ban `exit 0`.  
4. Add tests to `identity-core`, `auth`, `kernel-core`, `runtime-core`, `ai-gateway`, `llm-gateway`, `memory-service`.  
5. Rotate secrets flagged in `AUDIT-REPORT-2026-08-02` / `.env` PAT.  
6. One persistence decision: Prisma for Nexarch (replace `agent-os.json`) and replace `InMemoryExecutionRepository` / memory InMemory repos.  
7. Collapse duplicate runtimes (kernel-core vs swarm-runtime vs agent-runner vs packages/domain vs studio in-memory services) into one approved runtime.

### P0 — Wave 1 (Kernel)

KRN-001 Tenant, KRN-002 Identity, KRN-003 RBAC, KRN-004 Policy, KRN-009 Gateway (tests), KRN-012 Event bus (one bus), KRN-018 Audit, KRN-021 Observability backend.

### P0 — Wave 2 (Agentic)

KRN-005 Registry, KRN-006 Runtime (single), KRN-007/008 Tools, KRN-014 Memory durable, KRN-011 Workflow, KRN-019 Eval, KRN-020 HITL.

### P1

- PROD-001 Studio honesty: no fabricated UI; Prisma-backed studio services.  
- PROD-005 Archive tenancy + tests.  
- PROD-026 Forge: replace `typecheck: exit 0`; tests.  
- Service packs for SA-01, SA-06, EI-01, EI-03, EI-05 (SOW, questionnaire, runbook).  
- KRN-022 FinOps, KRN-023 Notifications, KRN-024 Connectors, KRN-025 Plugins, KRN-026 Billing.

### P2

- Wave 5 business applications (PROD-009–018) **after** kernel L6.  
- Wave 6 ecosystem (PROD-043–049).  
- Personal OS primitives OS-P-002–012 as profiles, not a new OS.  
- Marketplace KRN-027.

---

## 9. Recovery phases (replaces the old execution model)

| Phase | Objective | Exit |
|---|---|---|
| 0. Portfolio Forensics | This audit | 100% inventoried |
| 1. Truth Baseline | Every row evidence-rated | This ledger |
| 2. Repository Stabilisation | CI/build/schema/branch debt | Main reproducibly green |
| 3. Platform Kernel | Shared foundations | Kernel L6/L7 |
| 4. Agentic Kernel | Runtime/memory/tools/workflows | Real autonomous task E2E |
| 5. Personal OS | User profile of the runtime | Personal workflow E2E |
| 6. Enterprise OS | Governed org orchestration | Dept→enterprise E2E |
| 7. Product Waves | 50 on the kernel | 50 at L6/L7 |
| 8. Services Factory | 50 delivery packs | 50 delivery-ready |
| 9. Integration | Cross-product workflows | System E2E |
| 10. Production | Security/SRE/DR/perf | Production readiness audit |
| 11. GTM | Commercialisation | Sellable catalogue |

Phase 0–1 are done enough to execute. Phase 2 is the next mergeable work. Products do not wait until Phase 7 to exist; they ride the kernel upward.

---

## 10. Measure merged capability, not agent output

Track only ledger promotions with evidence:

```text
50 PRODUCTS     ████░░░░░░░░░░░░░░░░  3/50 at L4+   0/50 L7
50 SERVICES     ░░░░░░░░░░░░░░░░░░░░  0/50 delivery-ready
PLATFORM KERNEL ██████░░░░░░░░░░░░░░  14/27 at L3+  0/27 L6
PERSONAL OS     ███░░░░░░░░░░░░░░░░░  4/12 primitives ≥ L2
ENTERPRISE OS   ████░░░░░░░░░░░░░░░░  11/24 primitives ≥ L2
```

Sprint boards that count “files written” or “cycles assigned” are not this dashboard.

**Verified Capability Throughput** is the headline metric (see [WAVE-0.md](./WAVE-0.md)). Report Started : Verified beside it. Wave 0 engineering packages and maturity gates A–C live in that file, not in a new vision document.
