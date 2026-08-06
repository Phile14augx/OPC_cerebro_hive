# Claude Tasks — Midday Assignment 2026-08-06 17:39 IST

**Audit session:** Midday | **Next check:** 3 AM tonight (2026-08-07)
**Git commits reviewed:** 0 commits since 3 AM
**Tasks completed since last session:** None confirmed by commit. M10.1 remains validated in its worktree but uncommitted.

---

## 🔴 P0 — Blockers (do first)

### C-P0-1 · Land the validated M10.1/M10.4 worktree

**Files:** `.agents/worktrees/feat-enterprise-agent-runtime/packages/runtime/src/execution/`, `.agents/worktrees/feat-enterprise-agent-runtime/packages/capabilities/agent-builder/src/AgentRuntimeService.ts`, `.agents/worktrees/feat-enterprise-agent-runtime/apps/platform-api/src/modules/conversations/conversations.routes.ts`, `agents/M10.1-COMMIT-HANDOFF.md`

Revalidate the worktree using the handoff document, commit the validated M10.1/M10.4 changes, push its branch, and open a PR. Do not fold unrelated main-worktree files into this commit.

**Success criteria:** PR exists; the documented runtime typecheck and agent-builder tests pass; the PR contains only M10.1/M10.4 scope.
**Complexity:** S | **Dependencies:** none

### C-P0-2 · Apply and verify the missing Prisma migration

**Files:** `packages/database/prisma/schema.prisma`, `packages/database/prisma/migrations/` (generated)

Run `pnpm prisma migrate dev --name add-missing-models-aug-06` from the database package. Inspect generated SQL before applying it; stop and escalate if it contains destructive operations. Regenerate the Prisma client and run `pnpm prisma migrate status`.

**Success criteria:** all missing `AgentExecution*` and related models have migration SQL; migration status has no pending migrations; no destructive SQL was applied.
**Complexity:** S | **Dependencies:** none

### C-P0-3 · Triage the main working tree into coherent changesets

**Files:** all paths reported by `git status --short`, with priority on `services/agent-runner/src/agent_runner/` and existing tracked modifications.

Inventory every modified/untracked path, separate intentional work from generated/noise files, and commit only coherent, reviewed changesets. Preserve uncertain work rather than deleting it; record uncertain paths in `agents/` for follow-up.

**Success criteria:** working tree is clean or each remaining path is explicitly explained; no unrelated code or secrets enter a commit.
**Complexity:** L | **Dependencies:** none

## 🟠 P1 — Critical (after P0)

### C-P1-1 · Establish and fix the runtime typecheck baseline

**Files:** `apps/platform-api/`, `packages/runtime/`, `packages/runtime-core/`, `agents/CLAUDE-TASKS.md`

Run `pnpm turbo typecheck`, capture the per-package error count, then fix errors in the runtime and platform API packages first. Append the remaining baseline by package to this file.

**Success criteria:** `apps/platform-api` and `packages/runtime` typecheck clean; remaining errors are quantified by package.
**Complexity:** L | **Dependencies:** C-P0-1 and C-P0-2

---

## How to use this file

Open this file in VS Code and work top to bottom. Include the task ID in each commit message so the 3 AM audit can detect completion.

*Written by CerebroHive Midday Audit — 2026-08-06 17:39 IST*
