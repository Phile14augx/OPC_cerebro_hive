# Claude Tasks — Night Assignment 2026-08-10 03:00 IST

**Audit session:** Night (3 AM) | **Next check:** Noon 2026-08-10
**Git commits reviewed:** 0 — git unreachable from audit sandbox; assessed via file modification timestamps
**Tasks completed since last session (Noon 2026-08-09):** Significant new work on disk — not yet committed

---

## ✅ Completed Today (inferred from file timestamps — 2026-08-09 afternoon/evening)

- **M26.1 Architecture Review batch** — ~25 audit artifacts created at 17:41 IST in `audit/`:
  `EXECUTIVE-AUDIT-SUMMARY.md`, `HIVEFORGE-SLICES-1-4-GOVERNANCE-BACKLOG.md`,
  `SLICE-5-EXECUTION-LIFECYCLE-REVIEW.md`, `ARCHITECTURAL-REVIEW-UNPLANNED-VERTICAL-SLICE.md`,
  `INFRA-RECONCILIATION-PLAN.md`, `M26.1-BASELINE.md`, `M26.1-ARCHITECTURE-01 through 06.md`,
  `DEPLOYMENT-ARCHITECTURE-DISCOVERY.md`, `CREDENTIAL-PROVIDER-COLLISION-REVIEW.md`,
  `POLYGLOT-ARCHITECTURE-MAP.md`, `P0-AUTH-AUTHZ-GAP.md`, and more.
- **Studio Dashboard planning session initialized** — `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`,
  `.planning/ROADMAP.md`, `.planning/STATE.md`, `.planning/research/*.md` all updated (42 requirements
  mapped across 8 phases, Phase 1 "Schema & Navigation Foundation" ready to plan).
- **`apps/platform/CLAUDE.md` and `apps/platform/AGENTS.md` created** — project context documents for
  the Studio dashboard initiative.
- **New Studio security routes** — `apps/platform/src/app/api/security/events/route.ts`,
  `apps/platform/src/app/security/metrics/route.ts`, `apps/platform/scripts/validate-security.ts`,
  `apps/platform/middleware.ts`, `apps/platform/next.config.ts`.
- **New Studio backend-runtime features** — `apps/platform/src/features/studio/backend-runtime/cache/`,
  `governance/`, `intelligence/` modules created.
- **`packages/agent-sdk/` updated** — `CerebroAgent.ts`, `CerebroMemory.ts`, `CerebroTool.ts`, `index.ts`
  modified; `dist/` type declarations regenerated.
- **`packages/ai/` updated** — factory, providers (anthropic, openai, mock), AIService, telemetry all modified.
- **`packages/ai-gateway/` updated** — `gateway.ts`, `types.ts`, both providers, `PromptAssemblyEngine.ts`,
  `ModelRegistry.ts`, `PromptRegistry.ts`, `ModelRouter.ts`, `YamlSeeder.ts` modified.
- **`packages/agent-ops/` updated** — `memory-store.ts` and `agent-registry.ts` modified.

**None of the above is committed. The git working tree is now materially larger than at the last audit.**

---

## ⚠️ Slipped Tasks (carrying forward — critical)

| Task | Slipped cycles | Status |
|------|---------------|--------|
| C-P0-1: De-scope M10.1 worktree, commit, open PR | **5** | unstarted |
| C-P0-2: Apply Prisma migration | **5** | unstarted |
| C-P0-3a: Commit audit/sprint files (Phase A) | **4** | unstarted |
| C-P0-3b: Commit architecture docs (Phase B) | **2** | unstarted |
| C-P0-3c: Commit root planning docs (Phase C) | **2** | unstarted |

**CRITICAL NOTE:** These tasks have now missed 5 consecutive audit cycles. Month 2–4 deliverables are
at serious risk. However, significant new work (M26.1 review, Studio planning, source changes) has
also accumulated since the last audit — C-P0-3's triage scope has grown considerably.

---

## 🔴 P0 — Blockers (do first, no other work until resolved)

### C-P0-0 · Fix Vite/Node baseline regression (UNBLOCKS ALL CODEX PRODUCT WORK)
**NEW — elevated from Codex sprint board blocker #10**

The untouched `corepack pnpm test` exits 1 before any product code runs:
```
ERR_PACKAGE_IMPORT_NOT_DEFINED: #module-sync-enabled
from vite@8.1.5 on Node 22.17.0
```
This same error has appeared in three separate Codex cycles (2026-08-07 00:08, 2026-08-08, 2026-08-10
00:27). Fourteen `vite@8.1.5` references exist in mainline. The `vite: ">=6.0.0"` override is present
but the `#module-sync-enabled` subpath import is not resolving under Node 22.17.0.

**Investigation steps:**
1. Check if `vite@8.1.5` resolves `#module-sync-enabled` under Node 22.12.0 vs 22.17.0 — the pinned version `22.12.0` worked previously.
2. If the Node version is the culprit, pin Node to `22.12.0` in `.nvmrc` / `package.json engines` / Turbo CI config.
3. If it's a `vite@8.1.5` packaging defect, downgrade to the last known-good Vite 7.x version across all 14 references.
4. Re-run `corepack pnpm test` from a clean `origin/main`; confirm all 27 Turbo tasks pass.

**Files:**
```
.nvmrc
package.json                     ← check engines.node
pnpm-lock.yaml                   ← vite version references
packages/eda-sdk/ (failed package)
```

**Commit with:** `fix(baseline): restore Node/Vite test baseline  [C-P0-0]`

**Success criteria:** `corepack pnpm test` exits 0 from untouched `origin/main` checkout.
**Complexity:** M | **Dependencies:** none — this unblocks X-P1-3 and every other Codex slice

---

### C-P0-1 · De-scope M10.1 worktree, commit M10.1, open PR
**Slipped 5 cycles — CRITICAL. Instructions unchanged from prior audits.**

Park these M10.2 files via `git stash` or temp branch:
```
packages/ai-gateway/src/types.ts        ← ALSO modified in new work — reconcile carefully
packages/ai-gateway/src/gateway.ts      ← ALSO modified in new work
packages/ai-gateway/src/providers/anthropic.provider.ts  ← ALSO modified
packages/ai-gateway/src/providers/openai.provider.ts     ← ALSO modified
apps/platform-api/src/modules/runtime/providers/ToolRuntimeProvider.ts
```

**⚠️ Note:** `packages/ai-gateway/` was modified again since last audit (new work). Before stashing,
read the current diff to determine whether the new changes are M10.1/M10.4 or M10.2 scope, or entirely
new work. Do not overwrite or lose the new source changes.

Then commit only M10.1/M10.4 scope per `agents/M10.1-COMMIT-HANDOFF.md`. Run:
```bash
pnpm turbo typecheck --filter=@cerebro/runtime --filter=@cerebro/agent-builder-capability --filter=platform-api
```
Push branch and open PR with `[C-P0-1]` in the title.

**Success criteria:** PR open; M10.1/M10.4 scope only; focused typecheck passes.
**Complexity:** M | **Dependencies:** none

---

### C-P0-2 · Apply and verify the Prisma migration
**Slipped 5 cycles — CRITICAL. Instructions unchanged.**

```bash
cd packages/database
pnpm prisma migrate dev --name add-agent-execution-models-aug-10
```
Stop and escalate on any `DROP TABLE`, `DROP COLUMN`, or destructive `ALTER COLUMN`. Then:
```bash
pnpm prisma migrate status
pnpm prisma generate
```
Commit: `feat(db): add AgentExecution* migration  [C-P0-2]`

**Success criteria:** No pending migrations; no destructive SQL.
**Complexity:** S | **Dependencies:** none

---

### C-P0-3 · Execute triage — commit the accumulated safe changesets
**Analysis done; execution slipped 4 cycles. Scope has GROWN since last audit.**

The working tree now contains both the previously-inventoried files AND the new Aug 9 work.
Work through in safety order:

**Phase A — Audit/Sprint coordination (no code, no secrets):**
```
agents/CLAUDE-TASKS.md, GEMINI-TASKS.md, CODEX-TASKS.md
agents/CODEX-CHANGESET-MANIFEST.md, CODEX-M10.1-REVIEW.md
agents/CODEX-M10.2-TEST-PLAN.md, CODEX-PRISMA-MIGRATION-REVIEW.md
agents/CURRENT-SPRINT.md, M10.1-COMMIT-HANDOFF.md
agents/TRIAGE-REPORT-2026-08-06.md
agents/CerebroHive_AEOS_6Month_MegaPlan.md
PROGRESS.md, AGENT-RUNTIME-BACKLOG.md, AGENTS.md
audit/*.md (new M26.1 review batch — ~25 files, all docs)
.planning/PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md
.planning/research/*.md
.planning/codebase/*.md (if changed since last commit)
```
**Verify `.gitignore` has `legal-docs/` before staging anything.**

**Phase B — Architecture docs:**
```
architecture/*.md, architecture/**/*.md
```

**Phase C — Root planning docs:**
Run `grep -r "sk-" --include="*.md"` first, then commit:
`CEREBROHIVE_CONSTITUTION.md`, `CEREBROHIVE-6-MONTH-MASTER-PLAN.md`, `MASTER-PLAN-*.md`

**Phase D — NEW: Studio platform new features (apps/platform):**
```
apps/platform/CLAUDE.md
apps/platform/AGENTS.md
apps/platform/README.md
apps/platform/middleware.ts
apps/platform/next.config.ts
apps/platform/scripts/validate-security.ts
apps/platform/src/app/api/security/events/route.ts
apps/platform/src/app/security/metrics/route.ts
apps/platform/src/features/studio/backend-runtime/**
```
Run `pnpm turbo typecheck --filter=platform` before committing.
Commit: `feat(platform): Studio backend-runtime security + governance modules  [C-P0-3d]`

**Phase E — NEW: agent-sdk / ai / ai-gateway / agent-ops source updates:**
```
packages/agent-sdk/src/**
packages/ai/src/**
packages/ai-gateway/src/**    ← but EXCLUDE the M10.2 files stashed in C-P0-1
packages/agent-ops/src/**
```
Run `pnpm turbo typecheck --filter=@cerebro/agent-sdk --filter=@cerebro/ai --filter=@cerebro/agent-ops`
Commit: `feat(packages): agent-sdk, ai-gateway, ai, agent-ops updates  [C-P0-3e]`

**Success criteria:** All audit, planning, and safe code committed; `git status` substantially smaller.
**Complexity:** XL | **Dependencies:** C-P0-1 must separate ai-gateway scope before Phase E

---

## 🟠 P1 — Critical (start once at least one P0 has a commit)

### C-P1-3 · Execute Studio Phase 1 — Schema & Navigation Foundation (PLAN first)
**NEW task. Platform dashboard functional program, Phase 1 of 8.**

The `.planning/STATE.md` shows Phase 1 is "ready to plan." The 42 requirements are in
`.planning/REQUIREMENTS.md`. Phase 1 scope per `.planning/ROADMAP.md`:
1. Every one of 99 Studio sidebar nav destinations renders a real page or honest placeholder — no 404s
2. 9 CerebroForge items with a real `forge-api` controller wired to actual functionality
3. All non-functional destinations use a single registry-driven `PlaceholderPage` component
4. Governance/TalentOS/Explore schema gaps confirmed (exists/stub/absent)
5. `archive-worker` / `archive-api` BullMQ major version reconciled

**Files to focus on:**
```
apps/platform/src/app/             ← nav routing
apps/platform/src/components/      ← PlaceholderPage component
apps/forge/ (forge-api integration) ← CerebroForge wiring
apps/platform/CLAUDE.md            ← read this first for project context
apps/platform/AGENTS.md            ← agent guidance
.planning/REQUIREMENTS.md          ← requirements list
.planning/ROADMAP.md               ← phase breakdown
```

Start by reading `apps/platform/CLAUDE.md` and `.planning/ROADMAP.md` thoroughly.
Use the GSD workflow (plan first, then implement step by step).
Commit each plan step with `[C-P1-3]` in the message.

**Success criteria:** Phase 1 success criteria in `.planning/ROADMAP.md` are all TRUE.
**Complexity:** L | **Dependencies:** C-P0-3d (platform files committed and clean)

---

### C-P1-1 · Establish runtime typecheck baseline
**Slipped 0 new cycles (blocked on P0s) — now relevant given new source changes.**

New changes to `packages/ai-gateway/`, `packages/ai/`, `packages/agent-sdk/` make this urgent.
Run `pnpm turbo typecheck` from repo root. Fix errors in `apps/platform-api` and `packages/runtime`
first. Quantify the full error backlog.

**Success criteria:** `apps/platform-api` and `packages/runtime` clean; all errors enumerated.
**Complexity:** L | **Dependencies:** C-P0-1, C-P0-2

---

## 🟡 P2 — High (if P1 done or in parallel)

### C-P2-1 · Land the Archive lockfile fix
**NEW — Codex stash `4d9c2aef` contains the two-file plan/lock change.**

Codex preserved the Archive API fastify lockfile synchronization in stash `4d9c2aef` before cleaning up
the worktree. This fix is prerequisite for X-P1-3 (HiveCloud FinOps). After C-P0-0 resolves the Vite
baseline, recover and apply this stash:
```bash
git stash show 4d9c2aef
git stash apply 4d9c2aef
# verify: corepack pnpm install --frozen-lockfile
# commit: fix(archive-api): sync fastify plugin lockfile  [C-P2-1]
```
**Success criteria:** `pnpm install --frozen-lockfile` passes; Archive API packages install cleanly.
**Complexity:** S | **Dependencies:** C-P0-0 (Vite baseline restored first)

---

### C-P1-2 · Implement M10.2 provider tool-calling (foundation)
**Slipped 0 new cycles — still blocked on C-P0-1.**

Recover M10.2 files from the stash created in C-P0-1. Implement tool-calling normalisation layer per
`agents/CODEX-M10.2-TEST-PLAN.md`. Start with the Anthropic provider.
Commit: `feat(ai-gateway): M10.2 provider tool-calling foundation  [C-P1-2]`

**Success criteria:** Anthropic provider passes tool-call fixture; no regression in existing tests.
**Complexity:** M | **Dependencies:** C-P0-1

---

## How to use this file
Open in VS Code. The P0 tasks can run in parallel: C-P0-0 (Vite baseline) + C-P0-1 (M10.1 PR) +
C-P0-2 (Prisma migration) + Phases A-C of C-P0-3. C-P0-3 Phase D and E depend on C-P0-1 scope
separation being done first.

Include the task ID (e.g. `[C-P0-0]`) in every commit message so audits detect completion automatically.

*Written by CerebroHive Night Audit — 2026-08-10 03:00 IST*
