# Claude Tasks — Noon Assignment 2026-08-08 12:00 IST

**Audit session:** Noon | **Next check:** 3 AM tonight (2026-08-09)
**Git commits reviewed:** 0 — git reports no commits on `main`; completion assessed via file modification timestamps
**Tasks completed since last session (3 AM 2026-08-08):** None — CLAUDE-TASKS.md unchanged since 06:27 IST

---

## ⚠️ CRITICAL ESCALATION — 6th Cycle (all P0s)

C-P0-1, C-P0-2, and C-P0-3 have now been pending across **6 consecutive audit cycles** with **zero commits**. C-P0-4 (Vite baseline) completes its **1st cycle** unresolved. No code has been committed to this repository since before 2026-08-05.

| Task | Slipped cycles |
|------|---------------|
| C-P0-1: De-scope M10.1 worktree, commit, open PR | **6** |
| C-P0-2: Apply Prisma migration | **6** |
| C-P0-3a/b/c: Execute triage plan | **5 / 3 / 3** |
| C-P0-4: Fix Node/Vite/Vitest baseline | **1** |

**Minimum viable progress for today:** C-P0-3 Phase A (no code, no secrets, long overdue). This single commit would clear 700+ files from the "uncommitted" pile, prove the commit pipeline works, and unblock cycle tracking. Do this first.

---

## ✅ Completed Today (inferred from commits/file timestamps)
*None — 0 commits detected since 3 AM 2026-08-08. No file modifications in tracked directories since 06:28 IST.*

## ⚠️ Slipped Tasks (carrying forward)

| Task | Last assigned | Slipped cycles | Notes |
|------|--------------|---------------|-------|
| C-P0-1: De-scope M10.1 worktree | 2026-08-06 Noon | **6** | Mixed M10.1/M10.2 scope per CODEX-M10.1-REVIEW.md |
| C-P0-2: Apply Prisma migration | 2026-08-06 Noon | **6** | No migration SQL exists; schema has AgentExecution* tables |
| C-P0-3a: Commit audit/sprint files | 2026-08-06 Noon | **5** | No-code, lowest risk — should have been done first |
| C-P0-3b: Commit architecture docs | 2026-08-07 3 AM | **3** | Depends on Phase A |
| C-P0-3c: Commit root planning docs | 2026-08-07 3 AM | **3** | Depends on Phase A |
| C-P0-4: Fix Node/Vite/Vitest baseline | 2026-08-08 3 AM | **1** | Blocks Codex product pipeline |
| C-P1-1: Typecheck baseline | 2026-08-07 3 AM | 0 | Blocked on C-P0-1, C-P0-2 |
| C-P1-2: M10.2 provider tool-calling | 2026-08-07 3 AM | 0 | Blocked on C-P0-1 (stash recovery) |

---

## 🔴 P0 — Blockers (C-P0-1 through C-P0-4 can run in parallel)

### C-P0-3 Phase A · Commit audit/sprint coordination files — START HERE
**5 cycles — no code, no secrets, lowest risk of all tasks**

Stage and commit only these files:
```
agents/CLAUDE-TASKS.md
agents/GEMINI-TASKS.md
agents/CODEX-TASKS.md
agents/CODEX-CHANGESET-MANIFEST.md
agents/CODEX-M10.1-REVIEW.md
agents/CODEX-M10.2-TEST-PLAN.md
agents/CODEX-PRISMA-MIGRATION-REVIEW.md
agents/CURRENT-SPRINT.md
agents/M10.1-COMMIT-HANDOFF.md
agents/TRIAGE-REPORT-2026-08-06.md
agents/CerebroHive_AEOS_6Month_MegaPlan.md
CURRENT-SPRINT.md               ← confirm not a duplicate of agents/ version first
PROGRESS.md
AGENT-RUNTIME-BACKLOG.md
AGENTS.md
```

**Before staging:** Verify `legal-docs/` is in `.gitignore`:
```bash
grep "legal-docs" .gitignore
```

**Commit:**
```
chore(agents): commit audit and sprint coordination files  [C-P0-3a]
```

**Success criteria:** All listed files committed; `git status` visibly smaller; `legal-docs/` not staged.
**Complexity:** S | **Dependencies:** none — do this right now

---

### C-P0-4 · Fix Node/Vite/Vitest baseline
**1 cycle — blocks all product-slice test gating**

**Symptom:** `ERR_PACKAGE_IMPORT_NOT_DEFINED: #module-sync-enabled` from `vite@8.1.5` on Node `22.17.0`. Failing package: `@cerebro/capability-registry`.

**Quick diagnosis:**
```bash
node --version
cd packages/capability-registry
cat package.json | grep -A 20 '"imports"'
pnpm test 2>&1 | head -40
```

**Fix A — subpath imports map:** Add a `"default"` fallback to the `#module-sync-enabled` entry in `packages/capability-registry/package.json#imports`.

**Fix B — Vite resolve conditions** (if repo-wide):
```ts
// vitest.config.ts
export default defineConfig({
  resolve: {
    conditions: ['module-sync', 'module', 'browser', 'node']
  }
})
```

**Fix C — pin Node version** (immediate unblock):
Create `.nvmrc` with `22.12.0` and add `"engines": { "node": "22.12.0" }` to root `package.json`.

**Commit:**
```
fix(baseline): resolve ERR_PACKAGE_IMPORT_NOT_DEFINED vite@8/node22  [C-P0-4]
```

**Success criteria:** `corepack pnpm test` completes all 26 Turbo tasks without the `ERR_PACKAGE_IMPORT_NOT_DEFINED` error.
**Complexity:** M | **Dependencies:** none

---

### C-P0-1 · De-scope M10.1 worktree, commit, open PR
**6 cycles — CRITICAL**

**Step 1 — Park M10.2 files** (stash or temp branch `feat/m10.2-parked`):
```
packages/ai-gateway/src/types.ts
packages/ai-gateway/src/gateway.ts
packages/ai-gateway/src/providers/anthropic.provider.ts
packages/ai-gateway/src/providers/openai.provider.ts
apps/platform-api/src/modules/runtime/providers/ToolRuntimeProvider.ts
```

**Step 2 — Commit only M10.1/M10.4 scope** (per `agents/M10.1-COMMIT-HANDOFF.md`):
```
packages/runtime/src/execution/
packages/capabilities/agent-builder/src/AgentRuntimeService.ts
apps/platform-api/src/modules/conversations/conversations.routes.ts
apps/platform-api/src/bootstrap.ts
```

Run focused typecheck first:
```bash
pnpm turbo typecheck --filter=@cerebro/runtime --filter=@cerebro/agent-builder-capability --filter=platform-api
```

**Step 3 — Push branch and open PR** against `main` with `[C-P0-1]` in the title.

**Success criteria:** PR open; M10.1/M10.4 scope only; focused typecheck passes.
**Complexity:** M | **Dependencies:** none

---

### C-P0-2 · Apply and verify the Prisma migration
**6 cycles — CRITICAL**

```bash
cd packages/database
pnpm prisma migrate dev --name add-agent-execution-models-aug-08
```

**STOP and escalate if you see `DROP TABLE`, `DROP COLUMN`, or destructive `ALTER COLUMN`.**

Then verify:
```bash
pnpm prisma migrate status
pnpm prisma generate
```

**Commit:**
```
feat(db): add AgentExecution* migration — aug-08  [C-P0-2]
```

**Success criteria:** `pnpm prisma migrate status` shows no pending migrations; no destructive SQL.
**Complexity:** S | **Dependencies:** none

---

## 🟠 P1 — Critical (after all P0s have at least one commit each)

### C-P1-1 · Establish runtime typecheck baseline
**Files:** `apps/platform-api/`, `packages/runtime/`, `packages/runtime-core/`

Run `pnpm turbo typecheck` from repo root. Fix errors in `apps/platform-api` and `packages/runtime` first. Append a per-package error summary under a `## Typecheck Baseline` section in this file.

**Success criteria:** `apps/platform-api` and `packages/runtime` typecheck clean; all remaining errors quantified.
**Complexity:** L | **Dependencies:** C-P0-1, C-P0-2

---

### C-P1-2 · Implement M10.2 provider tool-calling (foundation)
**Files:** `packages/ai-gateway/src/types.ts`, `packages/ai-gateway/src/providers/anthropic.provider.ts`, `packages/ai-gateway/src/providers/openai.provider.ts`

Recover M10.2 files from stash/temp branch (created in C-P0-1). Implement tool-calling normalisation layer per `agents/CODEX-M10.2-TEST-PLAN.md`. Start with the Anthropic provider.

**Commit:** include `[C-P1-2]` in message.

**Success criteria:** Anthropic provider passes tool-call fixture from CODEX-M10.2-TEST-PLAN.md; no regression in existing provider tests.
**Complexity:** M | **Dependencies:** C-P0-1 (M10.2 files recovered from stash)

---

## How to use this file

Open in VS Code. **C-P0-3 Phase A first** — it's no-code, takes minutes, and proves the commit pipeline works. Then run C-P0-4, C-P0-2, and C-P0-1 in parallel. Include the task ID (e.g. `[C-P0-3a]`) in every commit message so the night audit can detect completion automatically.

**Priority order if you can only do one thing:** C-P0-3 Phase A. Then C-P0-4. Then C-P0-2. Then C-P0-1.

*Written by CerebroHive Noon Audit — 2026-08-08 12:00 IST*
