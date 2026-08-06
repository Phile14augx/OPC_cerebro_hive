# Codex Tasks — Midday Assignment 2026-08-06 17:39 IST

**Audit session:** Midday | **Next check:** 3 AM tonight (2026-08-07)
**Git commits reviewed:** 0 commits since 3 AM
**Mission:** provide independent validation, integration readiness, and release evidence without duplicating Claude's runtime implementation or Gemini's documentation/Python ownership.

---

## 🔴 P0 — Blockers (do first)

### X-P0-1 · Create a non-destructive changeset manifest for the dirty main worktree ✅ Complete

**Files to inspect:** `CEREBROHIVE_CONSTITUTION.md`, `MASTER-PLAN-EVOLUTION-LOG.md`, `MASTER-PLAN-GAP-ASSESSMENT.md`, `architecture/ARCHITECTURE_INDEX.md`, `infra/README.md`, `docs/09-templates/`, `agents/`, `services/agent-runner/src/agent_runner/`, plus all paths from `git status --short`.

Write `agents/CODEX-CHANGESET-MANIFEST.md` grouping every changed or untracked path into: documentation, Python agent-runner, M10/runtime worktree, generated/noise, and unknown. Do not delete, stash, stage, or commit files.

**Success criteria:** every path is assigned a proposed owner and a safe disposition; uncertain paths are explicitly preserved for Claude's C-P0-3 triage.
**Result:** `agents/CODEX-CHANGESET-MANIFEST.md` created; no working-tree files were staged, deleted, or modified outside audit artifacts.
**Complexity:** M | **Dependencies:** none

## 🟠 P1 — Critical

### X-P1-1 · Verify M10.1/M10.4 merge readiness after Claude opens the PR — BLOCKED

**Files:** the M10.1/M10.4 PR diff; `packages/runtime/src/execution/`, `packages/capabilities/agent-builder/src/AgentRuntimeService.ts`, `apps/platform-api/src/modules/conversations/conversations.routes.ts`, `agents/M10.1-COMMIT-HANDOFF.md`.

Review the PR only after C-P0-1 pushes it. Confirm it is limited to M10.1/M10.4, rerun the documented focused typecheck/tests, and write `agents/CODEX-M10.1-REVIEW.md` with pass/fail evidence and any blocking findings.

**Success criteria:** an evidence-based merge recommendation; no speculative approval; all failures link to the exact affected file and command.
**Complexity:** M | **Dependencies:** C-P0-1
**Result:** preliminary review in `agents/CODEX-M10.1-REVIEW.md` blocks merge because no PR exists and the worktree mixes M10.2 files. The focused validation attempt timed out without output and is not evidence of a pass.

### X-P1-2 · Validate the Prisma migration safety and runtime-table coverage — BLOCKED

**Files:** `packages/database/prisma/schema.prisma`, `packages/database/prisma/migrations/`, `packages/db/src/repositories/PrismaExecutionStore.ts`.

After C-P0-2 creates the migration, compare schema models and repository queries against migration SQL. Confirm every `AgentExecution*` table used at runtime is created and that the migration contains no destructive operation.

**Success criteria:** `agents/CODEX-PRISMA-MIGRATION-REVIEW.md` lists coverage for each runtime table and a clear approve/block decision.
**Complexity:** M | **Dependencies:** C-P0-2
**Result:** review artifact created; no migration SQL exists yet, so safety and coverage cannot be approved.

## 🟡 P2 — High (after P1)

### X-P2-1 · Prepare the M10.2 provider tool-calling verification matrix ✅ Complete

**Files:** `packages/ai-gateway/src/types.ts`, `packages/ai-gateway/src/providers/anthropic.provider.ts`, `packages/ai-gateway/src/providers/openai.provider.ts`, `packages/capabilities/agent-builder/src/AgentRuntimeService.ts`.

Write `agents/CODEX-M10.2-TEST-PLAN.md` defining provider-specific request/response fixtures, tool-forcing scenarios, plain-prompt regressions, and expected normalization into `toolCalls`.

**Success criteria:** Claude can implement M10.2 with an executable acceptance matrix covering both providers and error paths.
**Complexity:** S | **Dependencies:** X-P1-1
**Result:** `agents/CODEX-M10.2-TEST-PLAN.md` created with provider contract, fixture, matrix, and test requirements.

---

## How to use this file

Work in priority order. Keep Codex output limited to the stated audit/review artifacts unless a failed verification requires a narrowly scoped fix. Include the task ID in any commit message.

*Written by CerebroHive Midday Audit — 2026-08-06 17:39 IST*
