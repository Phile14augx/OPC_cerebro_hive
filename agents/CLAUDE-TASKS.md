# Claude Tasks — Midday Assignment 2026-08-10 12:00 IST

**Audit session:** Noon | **Next check:** 3 AM 2026-08-11
**Git commits reviewed:** 0 — git unreachable from audit sandbox; assessed via file modification timestamps
**Tasks completed since 3 AM audit:** None detected — no file changes since CURRENT-SPRINT.md at 03:11 IST

---

## ✅ Completed (on disk, not yet committed — carried from Aug 9 afternoon session)

- **M27 Governance Analytics** — all 6 tasks in `task.md` marked complete (Aug 9 17:42 IST):
  - Scaffold Evidence Warehouse Dimensional Schema (Fact/Dim Tables)
  - Implement NRT Projection Pipeline (ingest `EngineeringReviewPublished` events)
  - Implement Projection Validation Suite
  - Implement Trend Engine (aggregation, multi-score metrics, forecasting)
  - Implement Analytics API & Studio Dashboards (RLS enabled)
  - Implement Executive Report Generator (quarterly snapshot exporter)
- **M26.1 Architecture Review batch** — ~30 audit files, Studio planning docs, platform security routes, agent-sdk/ai/ai-gateway changes (all on disk — not committed)

---

## ⚠️ Slipped Tasks (critical — must not slip another cycle)

| Task | Slipped cycles | Status |
|------|---------------|--------|
| C-P0-1: De-scope M10.1 worktree, commit, open PR | **6** | unstarted |
| C-P0-2: Apply Prisma migration | **6** | unstarted |
| C-P0-3a: Commit audit/sprint files (Phase A) | **5** | unstarted |
| C-P0-3b: Commit architecture docs (Phase B) | **3** | unstarted |
| C-P0-3c: Commit root planning docs (Phase C) | **3** | unstarted |
| C-P0-0: Fix Vite/Node baseline regression | **1** | unstarted |

**⚠️ CRITICAL:** Six consecutive audit cycles with zero commits on the oldest P0s. Month 2–4
deliverables are at serious risk. The git working tree has grown substantially — every new feature
added without a commit makes the eventual triage harder.

---

## 🔴 P0 — Blockers (do first, no other work until resolved)

### C-P0-0 · Fix Vite/Node baseline regression (UNBLOCKS ALL CODEX PRODUCT WORK)
The `corepack pnpm test` fails before any product code runs:
```
ERR_PACKAGE_IMPORT_NOT_DEFINED: #module-sync-enabled
from vite@8.1.5 on Node 22.17.0
```
This error has appeared in three consecutive Codex cycles. The stash `4d9c2aef` contains a partial
Archive API fastify lockfile fix that was preserved before Vite regression blocked further progress.

**Investigation steps:**
1. Check Node version: `node --version` — if 22.17.0, downgrade to 22.12.0 via `.nvmrc`
2. Check `package.json engines.node` field; pin to `22.12.0` if missing
3. Check 14 vite references in `pnpm-lock.yaml` — if `vite@8.1.5` is the culprit across all, downgrade to the last known-good Vite 7.x
4. Run `corepack pnpm test` from clean `origin/main` checkout; confirm all Turbo tasks pass

**Files:**
```
.nvmrc
package.json                    ← engines.node field
pnpm-lock.yaml                  ← vite version references (14 occurrences)
packages/eda-sdk/               ← reported failing package
```

**Commit:** `fix(baseline): restore Node/Vite test baseline  [C-P0-0]`
**Success criteria:** `corepack pnpm test` exits 0 from clean checkout
**Complexity:** M | **Dependencies:** none — unblocks X-P1-3 and all Codex slices

---

### C-P0-1 · De-scope M10.1 worktree, commit M10.1, open PR
**⚠️ 6 cycles slipped — do this FIRST after C-P0-0**

The M10.1 worktree contains M10.2 provider files mixed in. Separate them:

Park these M10.2 files via `git stash` or temp branch (READ DIFF FIRST — ai-gateway was modified again on Aug 9):
```
packages/ai-gateway/src/types.ts                              ← modified Aug 9 — reconcile scope
packages/ai-gateway/src/gateway.ts                            ← modified Aug 9
packages/ai-gateway/src/providers/anthropic.provider.ts       ← modified Aug 9
packages/ai-gateway/src/providers/openai.provider.ts          ← modified Aug 9
apps/platform-api/src/modules/runtime/providers/ToolRuntimeProvider.ts
```

After scoping, commit with: `feat(ai-gateway): M10.1 — provider abstraction foundation  [C-P0-1]`

Open PR against main. See `agents/CODEX-M10.1-REVIEW.md` and `agents/M10.1-COMMIT-HANDOFF.md` for full scope details.

**Success criteria:** Clean PR exists with only M10.1 scope. M10.2 files stashed or on a separate branch.
**Complexity:** M | **Dependencies:** none (but do C-P0-0 first)

---

### C-P0-2 · Apply and verify Prisma migration
**⚠️ 6 cycles slipped**

The `AgentExecution*` schema tables added in the codebase have no corresponding migration SQL.

```bash
cd apps/platform-api
pnpm prisma migrate dev --name add-agent-execution-models-aug-10
# Review the generated SQL before committing
cat prisma/migrations/*/migration.sql
# Run generate
pnpm prisma generate
```

Verify: `pnpm typecheck` passes in `apps/platform-api`. Then commit:
`feat(prisma): add AgentExecution schema migration  [C-P0-2]`

See `agents/CODEX-PRISMA-MIGRATION-REVIEW.md` for the blocking finding details.

**Success criteria:** Migration SQL exists in `prisma/migrations/`, `pnpm prisma migrate deploy` succeeds, `pnpm typecheck` green in platform-api.
**Complexity:** S | **Dependencies:** none

---

### C-P0-3a · Commit audit/sprint coordination changeset (Phase A — pure docs, lowest risk)
**⚠️ 5 cycles slipped — COMMIT THESE TODAY, THEY HAVE NO CODE**

These are pure documentation/planning files. No typecheck needed. Secrets grep, then commit:

```bash
# Secrets grep before staging
grep -rE "(sk-|ghp_|AKIA|password\s*=)" agents/ audit/ .planning/ 2>/dev/null | grep -v ".pyc"

# Stage and commit
git add agents/TRIAGE-REPORT-2026-08-06.md
git add agents/CODEX-CHANGESET-MANIFEST.md agents/CODEX-M10.1-REVIEW.md
git add agents/CODEX-M10.2-TEST-PLAN.md agents/CODEX-PRISMA-MIGRATION-REVIEW.md
git add agents/CerebroHive_AEOS_6Month_MegaPlan.md agents/M10.1-COMMIT-HANDOFF.md
git add .planning/PROJECT.md .planning/REQUIREMENTS.md .planning/ROADMAP.md .planning/STATE.md
git add .planning/research/
git commit -m "docs(agents): audit coordination files, changeset manifest, Studio planning  [C-P0-3a]"
```

**Success criteria:** All listed files committed. `git status` no longer shows them as untracked.
**Complexity:** S | **Dependencies:** none

---

### C-P0-3b · Commit architecture docs (Phase B)
**⚠️ 3 cycles slipped**

```bash
grep -rE "(sk-|ghp_|AKIA)" architecture/ docs/ 2>/dev/null
git add architecture/ARCHITECTURE_INDEX.md
git add docs/09-templates/26-one-pager-template.md docs/09-templates/27-pitch-deck-template.md
git commit -m "docs(architecture): architecture index and doc templates  [C-P0-3b]"
```

**Complexity:** S | **Dependencies:** C-P0-3a (for safety; can be parallelized)

---

### C-P0-3c · Commit root planning/governance docs (Phase C)
**⚠️ 3 cycles slipped**

```bash
grep -rE "(sk-|ghp_|AKIA)" MASTER-PLAN-EVOLUTION-LOG.md CEREBROHIVE_CONSTITUTION.md CEREBROHIVE-6-MONTH-MASTER-PLAN.md 2>/dev/null
git add MASTER-PLAN-EVOLUTION-LOG.md CEREBROHIVE_CONSTITUTION.md CEREBROHIVE-6-MONTH-MASTER-PLAN.md
git add MASTER-PLAN-GAP-ASSESSMENT.md
git commit -m "docs(governance): master plan evolution log, constitution, gap assessment  [C-P0-3c]"
```

**Complexity:** S | **Dependencies:** C-P0-3a

---

### C-P0-3d · Typecheck and commit new apps/platform/ features (Phase D — Aug 9 work)

```bash
cd apps/platform
pnpm typecheck 2>&1 | head -50
# Fix any type errors in:
#   src/app/api/security/events/route.ts
#   src/app/security/metrics/route.ts
#   src/features/studio/backend-runtime/cache/
#   src/features/studio/backend-runtime/governance/
#   src/features/studio/backend-runtime/intelligence/
#   middleware.ts
#   next.config.ts
# Once clean:
git add apps/platform/CLAUDE.md apps/platform/AGENTS.md apps/platform/middleware.ts apps/platform/next.config.ts
git add apps/platform/src/
git add apps/platform/scripts/validate-security.ts
git commit -m "feat(platform): Studio security routes, backend-runtime cache/governance/intelligence  [C-P0-3d]"
```

**Complexity:** M | **Dependencies:** C-P0-1 scope separation (ensure ai-gateway files in correct commit)

---

### C-P0-3e · Typecheck and commit agent-sdk / ai / ai-gateway / agent-ops updates (Phase E)

```bash
# Run typecheck across affected packages
pnpm --filter "@cerebro/agent-sdk" typecheck
pnpm --filter "@cerebro/ai" typecheck
pnpm --filter "@cerebro/ai-gateway" typecheck
pnpm --filter "@cerebro/agent-ops" typecheck

# Fix errors, then commit (after C-P0-1 scope separation — ai-gateway files go in M10.1 or M10.2 PR):
git add packages/agent-sdk/src/CerebroAgent.ts packages/agent-sdk/src/CerebroMemory.ts
git add packages/agent-sdk/src/CerebroTool.ts packages/agent-sdk/src/index.ts
git add packages/agent-sdk/dist/
git add packages/ai/src/
git add packages/agent-ops/src/memory-store.ts packages/agent-ops/src/agent-registry.ts
git commit -m "feat(packages): agent-sdk, ai, agent-ops Aug 9 updates  [C-P0-3e]"
```

**Note:** `packages/ai-gateway/` files should go in C-P0-1 (M10.1 PR) or C-P1-2 (M10.2), not here.

**Complexity:** M | **Dependencies:** C-P0-1

---

## 🟠 P1 — Critical (today)

### C-P1-1 · Establish runtime typecheck baseline
After C-P0-1 and C-P0-2 land:
```bash
pnpm typecheck 2>&1 | tee /tmp/typecheck-baseline.txt | tail -20
# Document error count as the new baseline
```
**Complexity:** S | **Dependencies:** C-P0-1, C-P0-2

### C-P1-2 · M10.2 provider tool-calling foundation
After M10.2 files are separated from M10.1 scope (C-P0-1), implement the tool-calling contract:
- `packages/ai-gateway/src/types.ts` — define `ToolCallRequest` / `ToolCallResponse` interfaces
- `packages/ai-gateway/src/providers/anthropic.provider.ts` — implement tool-calling
- `packages/ai-gateway/src/providers/openai.provider.ts` — implement tool-calling
- Add tests per `agents/CODEX-M10.2-TEST-PLAN.md`

**Complexity:** L | **Dependencies:** C-P0-1

### C-P1-3 · Studio Phase 1 — Schema & Navigation Foundation
Read `apps/platform/CLAUDE.md` and `.planning/ROADMAP.md` first. Phase 1 requirements:
- Define Prisma schema extensions for Studio entities
- Implement `apps/platform/src/app/(studio)/` navigation shell
- Wire up sidebar nav with correct route segments per `.planning/REQUIREMENTS.md` Phase 1 items

**Complexity:** L | **Dependencies:** C-P0-3d, C-P0-2

---

## 🟡 P2 — High (today if P1 done)

### C-P2-1 · Land Archive API lockfile fix
The Codex stash `4d9c2aef` contains a fastify lockfile fix for the Archive API. After C-P0-0:
```bash
git stash show 4d9c2aef
git stash apply 4d9c2aef
# Verify, then commit
git commit -m "fix(archive-api): fastify lockfile fix  [C-P2-1]"
```
**Complexity:** S | **Dependencies:** C-P0-0

---

## How to use this file
Open this file in VS Code. Each task has exact file paths and what to do.
When you commit, include the task ID in the commit message (e.g., `[C-P0-3a]`) so the
night audit can automatically detect completion.
