# Claude Tasks — Night Assignment 2026-08-08 03:00 IST

**Audit session:** Night (3 AM) | **Next check:** Noon 2026-08-08
**Git commits reviewed:** 0 — git unreachable from audit sandbox; completion assessed via file modification timestamps
**Tasks completed since last session (Noon 2026-08-07):** None confirmed — CLAUDE-TASKS.md and GEMINI-TASKS.md unchanged since 00:52 IST 2026-08-08

---

## ⚠️ CRITICAL ESCALATION — 5th Cycle + New P0 Blocker

C-P0-1, C-P0-2, and C-P0-3 have now been pending across **5 consecutive audit cycles** with **zero commits**. A new P0 blocker (C-P0-4) has been detected: the repository-wide test baseline is broken, blocking Codex's entire product delivery pipeline.

| Task | Slipped cycles |
|------|---------------|
| C-P0-1: De-scope M10.1 worktree, commit, open PR | **5** |
| C-P0-2: Apply Prisma migration | **5** |
| C-P0-3a/b/c: Execute triage plan | **4** (analysis done, execution pending) |
| C-P0-4: Fix Node/Vite/Vitest baseline | **NEW — detected 03:21 IST** |

**No P1 work until all P0s have at least one commit. C-P0-1, C-P0-2, C-P0-3, and C-P0-4 can all run in parallel.**

---

## ✅ Completed Today (inferred from commits/file timestamps)
*None — 0 commits detected since noon 2026-08-07.*

## ⚠️ Slipped Tasks (carrying forward)

| Task | Last assigned | Slipped cycles | Notes |
|------|--------------|---------------|-------|
| C-P0-1: De-scope M10.1 worktree | 2026-08-06 Noon | **5** | Mixed M10.1/M10.2 scope per CODEX-M10.1-REVIEW.md |
| C-P0-2: Apply Prisma migration | 2026-08-06 Noon | **5** | No migration SQL exists; schema has AgentExecution* tables |
| C-P0-3a: Commit audit/sprint files | 2026-08-06 Noon | **4** | No-code, lowest risk — should have been done first |
| C-P0-3b: Commit architecture docs | 2026-08-07 3 AM | **2** | Depends on Phase A |
| C-P0-3c: Commit root planning docs | 2026-08-07 3 AM | **2** | Depends on Phase A |
| C-P1-1: Typecheck baseline | 2026-08-07 3 AM | 0 | Blocked on C-P0-1, C-P0-2 |
| C-P1-2: M10.2 provider tool-calling | 2026-08-07 3 AM | 0 | Blocked on C-P0-1 (stash recovery) |

---

## 🔴 P0 — Blockers (do first — C-P0-1 through C-P0-4 can run in parallel)

### C-P0-4 · Fix Node/Vite/Vitest baseline — NEW BLOCKER
**Detected at 03:21 IST — blocks all product-slice test gating**

**Symptom:** `corepack pnpm test` exits 1 during Vitest startup with `ERR_PACKAGE_IMPORT_NOT_DEFINED: #module-sync-enabled` imported by `vite@8.1.5` on Node `22.17.0`. Turbo stops at 1/26 tasks. Failing package: `@cerebro/capability-registry`.

**Investigation steps:**
```bash
# From repo root (OPC/cerebro-hive-website)
node --version   # confirm Node 22.17.0
pnpm exec vite --version   # confirm vite@8.1.5

# Isolate the failure
cd packages/capability-registry
pnpm test 2>&1 | head -40
```

**Fix path A — Vite config (most likely):** Open `packages/capability-registry/vite.config.ts` (or `vitest.config.ts`). The `#module-sync-enabled` subpath import means the package has a `"imports"` map in `package.json` with a `#module-sync-enabled` key that Vite 8 cannot resolve. Check:
```bash
cat packages/capability-registry/package.json | jq '.imports'
```
Add or fix the subpath export to include a `"default"` fallback, or update the `resolve.conditions` in the vite config to include `"module-sync"`.

**Fix path B — Vite 8 compat:** If the issue is repo-wide (all packages), check root `vite.config.ts` or `vitest.config.ts` for missing `resolve.conditions`. Vite 8 dropped some legacy CJS conditions. The fix is typically:
```ts
// vitest.config.ts
export default defineConfig({
  resolve: {
    conditions: ['module-sync', 'module', 'browser', 'node']
  }
})
```

**Fix path C — Node/ESM alignment:** If neither A nor B resolves it, check if Node 22.17.0 changed the `#module-sync-enabled` behaviour. Pinning to `22.12.0` (the previously passing version per Codex history) via `.nvmrc` / `package.json#engines` may unblock immediately.

**Commit with:**
```
fix(baseline): resolve ERR_PACKAGE_IMPORT_NOT_DEFINED vite@8/node22 baseline  [C-P0-4]
```

**Success criteria:** `corepack pnpm test` completes all 26 Turbo tasks without the `ERR_PACKAGE_IMPORT_NOT_DEFINED` error; no existing tests newly failing.
**Complexity:** M | **Dependencies:** none

---

### C-P0-1 · De-scope M10.1 worktree, commit, open PR
**Slipped 5 cycles — CRITICAL**

**Step 1 — Park M10.2 files:**
```
packages/ai-gateway/src/types.ts
packages/ai-gateway/src/gateway.ts
packages/ai-gateway/src/providers/anthropic.provider.ts
packages/ai-gateway/src/providers/openai.provider.ts
apps/platform-api/src/modules/runtime/providers/ToolRuntimeProvider.ts
```
Use `git stash` or a temp branch `feat/m10.2-parked`.

**Step 2 — Commit only M10.1/M10.4 scope** per `agents/M10.1-COMMIT-HANDOFF.md`:
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

**Step 3 — Push branch and open PR** against `main`. Include `[C-P0-1]` in the PR title.

**Success criteria:** PR open; contains only M10.1/M10.4 scope; focused typecheck passes.
**Complexity:** M | **Dependencies:** none

---

### C-P0-2 · Apply and verify the Prisma migration
**Slipped 5 cycles — CRITICAL**

**Files:** `packages/database/prisma/schema.prisma`, `packages/database/prisma/migrations/` (to be generated)

```bash
cd packages/database
pnpm prisma migrate dev --name add-agent-execution-models-aug-08
```
**Stop and escalate if you see `DROP TABLE`, `DROP COLUMN`, or destructive `ALTER COLUMN`.** Then verify:
```bash
pnpm prisma migrate status
pnpm prisma generate
```

Commit:
```
feat(db): add AgentExecution* migration — aug-08  [C-P0-2]
```

**Success criteria:** `pnpm prisma migrate status` shows no pending migrations; no destructive SQL.
**Complexity:** S | **Dependencies:** none

---

### C-P0-3 · Execute the triage plan — commit the safe changesets
**Analysis done (TRIAGE-REPORT-2026-08-06.md); execution pending 4 cycles**

**Phase A — Audit/Sprint coordination (no code, no secrets — start here):**
```
agents/CLAUDE-TASKS.md, GEMINI-TASKS.md, CODEX-TASKS.md
agents/CODEX-CHANGESET-MANIFEST.md, CODEX-M10.1-REVIEW.md
agents/CODEX-M10.2-TEST-PLAN.md, CODEX-PRISMA-MIGRATION-REVIEW.md
agents/CURRENT-SPRINT.md, M10.1-COMMIT-HANDOFF.md
agents/TRIAGE-REPORT-2026-08-06.md
agents/CerebroHive_AEOS_6Month_MegaPlan.md
CURRENT-SPRINT.md (root — confirm not duplicate of agents/ version)
PROGRESS.md, AGENT-RUNTIME-BACKLOG.md, AGENTS.md
```
Verify `.gitignore` has `legal-docs/` before staging anything. Use the pre-written commit message from TRIAGE-REPORT.

**Phase B — Architecture docs:**
Commit `architecture/` paths under `docs/architecture-update`.

**Phase C — Root planning docs:**
Run `grep -r "sk-" --include="*.md"` to confirm no secrets, then commit:
`CEREBROHIVE_CONSTITUTION.md`, `CEREBROHIVE-6-MONTH-MASTER-PLAN.md`, `MASTER-PLAN-*.md`

Defer to Gemini: `docs/**`, `services/agent-runner/`, `infra/` (G-P0-1 / G-P1-1 territory).

**Success criteria:** Audit, architecture, and root planning files committed; `git status` visibly smaller.
**Complexity:** L | **Dependencies:** none (parallel with C-P0-1, C-P0-2, C-P0-4)

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

Recover M10.2 files from the stash/temp branch created in C-P0-1. Implement the tool-calling normalisation layer per `agents/CODEX-M10.2-TEST-PLAN.md`. Start with the Anthropic provider.

Commit with `[C-P1-2]` in the message.

**Success criteria:** Anthropic provider passes the tool-call fixture from CODEX-M10.2-TEST-PLAN.md; no regression in existing provider tests.
**Complexity:** M | **Dependencies:** C-P0-1 (M10.2 files recovered from stash)

---

## How to use this file

Open in VS Code. C-P0-1, C-P0-2, C-P0-3 Phase A, and C-P0-4 can all start in parallel — each is independent. Include the task ID (e.g. `[C-P0-4]`) in every commit message so the noon audit can detect completion automatically.

**Priority order if you can only do one thing:** C-P0-3 Phase A (no code, no risk, long overdue). Then C-P0-4 (unblocks Codex pipeline). Then C-P0-2 (migration). Then C-P0-1 (PR).

*Written by CerebroHive Night Audit — 2026-08-08 03:00 IST*
