# Cerebro Portfolio Completion Control Plane

**Status:** Portfolio Baseline v1.0 — **frozen** 2026-08-15  
**Scope:** `OPC/cerebro-hive-website` (Phile14augx/OPC_cerebro_hive)  
**Mode:** Portfolio recovery — not a new implementation programme  
**Re-audit rule:** do not re-score the vision unless merge evidence changes a ledger row.

This folder is the operational constitution. Work assignment originates here. Older product/service registries and mega-plans remain in the tree for catalog and commercial context; they are non-operational for sequencing.

| Artifact | Role |
|---|---|
| [BASELINE-v1.0.md](./BASELINE-v1.0.md) | Frozen five-number snapshot. Amend only with dated evidence, never by re-auditing the vision. |
| [MASTER-IMPLEMENTATION-LEDGER.md](./MASTER-IMPLEMENTATION-LEDGER.md) | One row per product, service, kernel capability, and OS capability. Evidence level is the only completion field. |
| [GOVERNANCE.md](./GOVERNANCE.md) | No-new-plans, Definition of Done, WIP limits, superseded plans. |
| [WAVE-0.md](./WAVE-0.md) | Engineering stabilization release: W0.1 → W0.5, gates A–C, Verified Capability Throughput. |
| [W0.1-WORKTREE-ISOLATION.md](./W0.1-WORKTREE-ISOLATION.md) | Current dirty-tree map by ledger ID. |

Declared GA/Beta/MVP labels in `docs/architecture/product-registry.md` are **not** engineering evidence. Nothing is GA unless it reaches **L7**.

---

## Freeze

> No new product, service, architecture, feature or roadmap may be introduced unless it is first added to the Master Implementation Ledger and assigned a dependency, priority and completion impact.

The five numbers below are Baseline v1.0. Wave 0 of [WAVE-0.md](./WAVE-0.md) is the only authorised engineering stream until W0.5 exits.

---

## Headline metric

**Verified Capability Throughput** = ledger rows that moved up ≥1 evidence level and passed that level’s exit gate in the reporting period.

This period: **Verified = 0**. Started : Verified is not yet a useful ratio because Wave 0 has not closed a gate. Optimise for Verified, not Started.

Canonical frozen copy: [BASELINE-v1.0.md](./BASELINE-v1.0.md).

---

## The five numbers (2026-08-15)

Mechanical inventory of workspace `package.json` scripts, specs, apps, services, and persistence. Conservative: in-memory stores, JSON file stores, marketing pages, and governed simulations are not L4+.

```text
50 products:
0 production     (L7)
0 verified       (L5)
3 integrated     (L4)   Studio, Archive, Forge
12 functional    (L3)
21 scaffolded    (L2)
14 spec-only     (L1)

50 services:
0 delivery-ready
10 partially ready   (marketing page + catalog metadata)
40 documentation-only

Platform kernel:
0/27 L6–L7 complete
1/27 L4+             LLM Gateway
14/27 L3+ functional
12/27 L1–L2

Personal OS:
4/12 primitives ≥ L2
0/1 personal workflow E2E

Enterprise Agentic OS:
11/24 primitives ≥ L2
4/24 ≥ L3
persistence = JSON file (ADR-002) — not production
```

### Declared lifecycle vs evidence

| Declared (registry index) | Count | Evidence L7 | Evidence L4+ |
|---|---:|---:|---:|
| GA | 10 | 0 | 2 (Studio, plus Gateway as kernel not product-GA) |
| Beta | 20 | 0 | 1 (Archive) |
| MVP | 18 | 0 | 0 |
| Research | 2 | 0 | 0 |

HiveForge is evidence L4 and declared Beta. That is the honest direction: implementation can outrun a label, and a GA label can outrun implementation.

---

## Repo shape that the ledger is scored against

| Slice | Count | typecheck script | lint script | test script |
|---|---:|---:|---:|---:|
| Workspace packages | 141 | 82 (58%) | 31 (22%) | 47 (33%) |
| `apps/*` | 10 | 10 | 7 | 4 |
| `packages/*` | 112 | 66 | 20 | 36 |
| `services/*` | 19 | 6 | 4 | 7 |

Historical audit (2026-08-02, 129 packages): typecheck 24, lint 25, tests 41. Script *coverage* improved for typecheck; lint and tests did not. Turbo still skips packages without scripts. `packages/identity-core` has **no scripts**. `services/forge-api` `typecheck` is `exit 0`.

---

## Architecture used for sequencing

```text
                     CEREBRO NEXARCH
                           │
                 ┌─────────┴─────────┐
                 │  PLATFORM KERNEL  │
                 └─────────┬─────────┘
                           │
       ┌───────────────────┼────────────────────┐
       │                   │                    │
 PERSONALISED OS    ENTERPRISE AGENTIC OS   DEVELOPER PLATFORM
       │                   │                    │
       └──────────────┬────┴─────────────┬──────┘
                      │                  │
               50 PRODUCTS        Shared Capabilities
                      │
                50 SERVICES
```

Do not engineer 102 separate systems. Complete the kernel, then compose.

---

## What to do next

Execute [WAVE-0.md](./WAVE-0.md) in order. W0.1 is isolation and this constitution. W0.2 is CI fail-closed. Do not open ERP/HR/Finance/Marketplace/Personal OS implementation fronts. Product WIP is Studio, Archive, and Forge only.
