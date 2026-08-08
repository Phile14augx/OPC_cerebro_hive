# Claude Tasks — Midday Assignment 2026-08-07 12:00 IST

**Audit session:** Noon | **Next check:** 3 AM tonight
**Git commits reviewed:** 0 — git unreachable from audit sandbox; completion assessed via file modification timestamps
**Tasks completed since last session (3 AM):** None confirmed — task files unchanged, no new artifacts detected

---

## ⚠️ CRITICAL ESCALATION — 4th Cycle

C-P0-1, C-P0-2, and C-P0-3 have now been pending across **4 consecutive audit cycles** (Noon Aug-06 → 3 AM Aug-07 → Noon Aug-07) with **zero commits**. This constitutes a delivery risk for the Month 2–4 plan. These tasks are unchanged from the 3 AM assignment. There is nothing new to plan — the work must simply be executed.

| Task | Slipped cycles |
|------|---------------|
| C-P0-1: De-scope M10.1 worktree, commit, open PR | **4** |
| C-P0-2: Apply Prisma migration | **4** |
| C-P0-3a/b/c: Execute triage plan | **3** (analysis done) |

**No P1 work until all three P0s have at least one commit.**

---

## 🔴 P0 — Blockers (do first, can run in parallel)

### C-P0-1 · De-scope M10.1 worktree then commit and push PR
**Slipped 4 cycles — CRITICAL**

**Context:** Codex's review (`agents/CODEX-M10.1-REVIEW.md`) found that the worktree mixes M10.1/M10.4 runtime files with M10.2 provider-tool files. The PR cannot be opened until scope is separated.

**Step 1 — Park M10.2 files (do not delete):**
```
packages/ai-gateway/src/types.ts
packages/ai-gateway/src/gateway.ts
packages/ai-gateway/src/providers/anthropic.provider.ts
packages/ai-gateway/src/providers/openai.provider.ts
apps/platform-api/src/modules/runtime/providers/ToolRuntimeProvider.ts
```
Use `git stash` or a temporary branch to park these before committing M10.1.

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
**Slipped 4 cycles — CRITICAL**

**Files:** `packages/database/prisma/schema.prisma`, `packages/database/prisma/migrations/` (to be generated)

From the `packages/database` directory:
```bash
pnpm prisma migrate dev --name add-agent-execution-models-aug-07
```
**Stop and escalate if you see any `DROP TABLE`, `DROP COLUMN`, or destructive `ALTER COLUMN`.** Then verify:
```bash
pnpm prisma migrate status
pnpm prisma generate
```

Commit with message:
```
feat(db): add AgentExecution* migration — aug-07  [C-P0-2]
```

**Success criteria:** `pnpm prisma migrate status` shows no pending migrations; no destructive SQL.
**Complexity:** S | **Dependencies:** none

---

### C-P0-3 · Execute the triage plan — commit the safe changesets
**Analysis done (TRIAGE-REPORT-2026-08-06.md exists); execution pending 3 cycles**

Work through changesets in safety order. Each phase can be committed independently.

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
Verify `.gitignore` has `legal-docs/` before staging anything. Use the pre-written commit message from the TRIAGE-REPORT.

**Phase B — Architecture docs:**
Commit `architecture/` paths under `docs/architecture-update`.

**Phase C — Root planning docs:**
Run `grep -r "sk-" --include="*.md"` to confirm no secrets, then commit:
`CEREBROHIVE_CONSTITUTION.md`, `CEREBROHIVE-6-MONTH-MASTER-PLAN.md`, `MASTER-PLAN-*.md`

Defer to Gemini: `docs/**`, `services/agent-runner/`, `infra/` (G-P0-1 / G-P1-1 territory).

**Success criteria:** Audit, architecture, and root planning files committed; `git status` visibly smaller.
**Complexity:** L | **Dependencies:** none (parallel with C-P0-1, C-P0-2)

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

Open in VS Code. Work P0s in parallel where possible — C-P0-1, C-P0-2, and Phase A of C-P0-3 can all start simultaneously. Include the task ID (e.g. `[C-P0-1]`) in every commit message so the night audit can automatically detect completion.

*Written by CerebroHive Noon Audit — 2026-08-07 12:00 IST*
