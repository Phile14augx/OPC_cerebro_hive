# Portfolio Baseline v1.0

**Frozen:** 2026-08-15  
**Amendment rule:** do not rewrite these numbers. If evidence changes, append a dated amendment that cites PR, test command + result, or other ledger evidence. Re-scoring the whole vision is prohibited.

Headline metric going forward: **Verified Capability Throughput** (capabilities that moved ≥1 evidence level and passed the new level’s exit gate in the period). Report **Started : Verified** beside it.

This period: Verified = 0. Started must not increase the 50-product surface.

---

## Frozen numbers

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

### Declared lifecycle vs evidence (frozen)

| Declared (registry index) | Count | Evidence L7 | Evidence L4+ |
|---|---:|---:|---:|
| GA | 10 | 0 | 1 product (Studio) + Forge is declared Beta |
| Beta | 20 | 0 | 2 (Archive, Forge) |
| MVP | 18 | 0 | 0 |
| Research | 2 | 0 | 0 |

### Workspace validation (frozen)

| Slice | Count | typecheck script | lint script | test script |
|---|---:|---:|---:|---:|
| Workspace packages | 141 | 82 (58%) | 31 (22%) | 47 (33%) |
| `apps/*` | 10 | 10 | 7 | 4 |
| `packages/*` | 112 | 66 | 20 | 36 |
| `services/*` | 19 | 6 | 4 | 7 |

`packages/identity-core`: no scripts. `services/forge-api` typecheck: `exit 0`. `apps/studio`: no test script.

---

## Immediate mission

Do not increase the 50-product surface area. Move the kernel from 0 L6 capabilities to its first production-operable primitives, move Studio/Archive/Forge from L4 to L5, and make CI incapable of lying about either.

Execution order: [WAVE-0.md](./WAVE-0.md).
