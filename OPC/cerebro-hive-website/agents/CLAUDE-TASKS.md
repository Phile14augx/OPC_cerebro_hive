# Claude Tasks — Midday Assignment 2026-08-15 12:00 IST

> **STATUS: SUPERSEDED FOR WORK ASSIGNMENT — retained for historical/commercial context only. Current work must originate in `docs/portfolio/MASTER-IMPLEMENTATION-LEDGER.md`.**

**Audit session:** Noon | **Next check:** 3 AM tonight (2026-08-16)
**Git commits reviewed:** 0 — git unreachable from audit sandbox; completion assessed via file timestamps and disk inspection
**Tasks completed since last session (3 AM Aug 14):** None by commit. Significant new work found ON DISK (uncommitted): Nexarch Command Center built, agent-OS packages (kernel-core, memory-sdk, runtime-core, governance-core) created, knowledge base established, pnpm-lock.yaml updated.

---

## 🆕 Major New Work Detected Since Last Audit (uncommitted — needs commit)

| Artifact | Timestamp | Commit target |
|---------|-----------|---------------|
| `app/nexarch/` — Command Center UI (page.tsx, layout.tsx, 6 route dirs) | Aug 14 23:51 IST | nexarch-commit.sh commit 6 |
| `lib/agent-os/` — seed.ts, store.ts, types.ts | Aug 14 23:41–51 IST | nexarch-commit.sh commit 5 |
| `data/agent-os.json` (23 KB) | Aug 14 23:55 IST | nexarch-commit.sh commit 5 |
| `packages/kernel-core/` — kernel, scheduler, watchdog, lifecycle, delegation | Aug 14 IST | nexarch-commit.sh commit 1 |
| `packages/memory-sdk/` — context-engine, memory-manager | Aug 14 IST | nexarch-commit.sh commit 2 |
| `packages/runtime-core/` — mission/, task/, execution.ts | Aug 14 IST | nexarch-commit.sh commit 3 |
| `packages/governance-core/` — policy-engine, risk-engine, approval-service, budget-enforcer, audit-trail | Aug 14 IST | nexarch-commit.sh commit 4 |
| `knowledge/` — AI intelligence knowledge base (16 topic dirs, ~30+ files) | Aug 14–15 IST | nexarch-commit.sh commit 7 |
| `CEREBRO-NEXARCH-AI-INTELLIGENCE-BRIEF.md` | Aug 14 13:36 IST | nexarch-commit.sh commit 7 |
| `AI-REVOLUTION-KNOWLEDGE-BASE-BASELINE.md` | Aug 14 13:36 IST | nexarch-commit.sh commit 7 |
| `WEEKLY-CTO-TECHNOLOGY-INTELLIGENCE.md` | Aug 15 04:59 IST | nexarch-commit.sh commit 7 |
| `nexarch-commit.sh` | Aug 15 00:55 IST | ready to run |
| `pnpm-lock.yaml` updated | Aug 15 14:16 IST | nexarch-commit.sh commit 8 |

**The `nexarch-commit.sh` script is ready at repo root — run it from a local terminal to land 8 structured commits covering all of the above.**

---

## ⚠️ Slipped Tasks — ESCALATED

| Task | Slipped cycles | Status |
|------|---------------|--------|
| C-P0-1: De-scope M10.2, commit M10.1, open PR | **13** 🚨 | unstarted — CRITICAL BREACH |
| C-P0-2: Apply Prisma migration | **13** 🚨 | unstarted — CRITICAL BREACH |
| C-P0-3a: Commit audit/sprint files (Phase A) | **12** 🚨 | unstarted — may be included in nexarch-commit.sh commit 8 |
| C-P0-3b: Commit architecture docs (Phase B) | **10** | unstarted |
| C-P0-3c: Commit root planning/governance docs (Phase C) | **10** | partially done via origin/main advance |
| C-P0-3d: Typecheck and commit apps/platform/ features (Phase D) | **8** | unstarted |
| C-P0-3e: Typecheck and commit agent-sdk/ai/ai-gateway/agent-ops (Phase E) | **8** | unstarted |
| C-P0-0: Fix Vite/Node baseline regression | **8** | blocked — lockfile fix ready on disk, needs commit |
| C-P0-4: Fix shared lockfile | **3** | pnpm-lock.yaml UPDATED on disk today — just needs committing (included in nexarch commit 8) |

---

## 🔴 P0 — Blockers (do first, no other work until resolved)

### C-P0-NEXARCH · Run nexarch-commit.sh — 8 commits of completed work (NEW — HIGHEST PRIORITY)

All Nexarch Command Center work was built overnight. The commit script is ready. Run it NOW from a local terminal:

```bash
# From repo root, local terminal (not Codex sandbox)
cd "D:\{MY_PROJECTS}\{OPC_cerebro_hive}\OPC\cerebro-hive-website"
bash nexarch-commit.sh
git push origin main
```

This lands: kernel-core, memory-sdk, runtime-core, governance-core, agent-OS data layer, Nexarch UI, knowledge base, updated pnpm-lock.yaml, and sprint files.

**Complexity:** S | **Dependencies:** local terminal with git push access | **Blocks:** C-P0-4 resolution, C-P0-3a resolution (both included in commit 8)

---

### C-P0-3a · Commit audit/sprint coordination files (Phase A) — 12 CYCLES

**If nexarch-commit.sh commit 8 does NOT include these, run separately:**

```bash
grep -rE "(sk-|ghp_|AKIA|password\s*=)" agents/ .planning/ 2>/dev/null | grep -v ".pyc"

git add agents/TRIAGE-REPORT-2026-08-06.md
git add agents/CODEX-CHANGESET-MANIFEST.md agents/CODEX-M10.1-REVIEW.md
git add agents/CODEX-M10.2-TEST-PLAN.md agents/CODEX-PRISMA-MIGRATION-REVIEW.md
git add agents/CerebroHive_AEOS_6Month_MegaPlan.md agents/M10.1-COMMIT-HANDOFF.md
git add .planning/PROJECT.md .planning/REQUIREMENTS.md .planning/ROADMAP.md .planning/STATE.md
git add .planning/research/
git add task.md
git commit -m "docs(agents): audit coordination files, changeset manifest, Studio planning  [C-P0-3a]"
```

**Complexity:** S | **Dependencies:** none (pure docs, zero compile steps)

---

### C-P0-1 · De-scope M10.2, commit M10.1 scope, open PR — 13 CYCLES 🚨

```bash
# Read the scope separation guide first
cat agents/CODEX-M10.1-REVIEW.md

# Separate M10.2-only files from M10.1 scope
git diff --name-only | grep -E "(ai-gateway|providers)" > /tmp/m10.2-files.txt
cat /tmp/m10.2-files.txt

# Stage only M10.1 files
git add packages/runtime/src/execution/
git add packages/capabilities/agent-builder/src/AgentRuntimeService.ts
git add apps/platform-api/src/modules/conversations/conversations.routes.ts
git commit -m "feat(runtime): M10.1 agent execution lifecycle foundation  [C-P0-1]"
git push origin HEAD -u
gh pr create --title "feat(runtime): M10.1 agent execution lifecycle" --body "See agents/M10.1-COMMIT-HANDOFF.md"
```

**Complexity:** M | **Dependencies:** local terminal with git push access

---

### C-P0-2 · Apply and verify Prisma migration — 13 CYCLES 🚨

The migration SQL at `20260809144150_agent_execution_contract/migration.sql` exists on main. Apply it:

```bash
# Ensure local main is up to date first
git pull origin main

# Run migration (requires Postgres running locally)
cd packages/db
pnpm prisma migrate deploy
pnpm prisma generate

# Verify
pnpm prisma migrate status

git add packages/db/prisma/
git commit -m "feat(db): apply AgentExecution contract migration  [C-P0-2]"
git push
```

**Complexity:** M | **Dependencies:** Postgres running locally; `git pull` first

---

## 🟠 P1 — Critical (today, after P0s)

### C-P1-1 · Establish runtime typecheck baseline

After M10.1 is committed:

```bash
cd packages/runtime
pnpm tsc --noEmit 2>&1 | tee /tmp/runtime-typecheck.txt
wc -l /tmp/runtime-typecheck.txt
# Fix any errors in packages/runtime/src/execution/
git add packages/runtime/src/
git commit -m "fix(runtime): resolve typecheck errors post-M10.1  [C-P1-1]"
```

**Complexity:** M | **Dependencies:** C-P0-1

---

### C-P1-3 · Studio Phase 1 — Schema & Navigation Foundation — 4 CYCLES

```
File: apps/platform/src/features/studio/backend-runtime/
Action: Wire up Studio schema editor, route navigation skeleton, and sidebar layout.
Success: `/studio` route renders schema panel + navigation tree; no console errors.
```

```bash
cd apps/platform
pnpm tsc --noEmit
# Then implement schema panel component
```

**Complexity:** L | **Dependencies:** C-P0-3d, C-P0-2

---

## 🟡 P2 — High (today if P1 done)

### C-P2-NEXARCH · Wire Nexarch API routes to real data

Now that `app/nexarch/` and `lib/agent-os/` exist on disk:

```
File: app/api/ (created by nexarch-commit.sh)
Action: Validate the API route handlers for agents, missions, governance. Connect to Prisma/DB layer from C-P0-2.
Success: GET /api/agents returns seeded agent list; POST /api/missions creates a draft mission record.
```

**Complexity:** M | **Dependencies:** C-P0-NEXARCH (committed), C-P0-2 (Prisma done)

---

### C-P2-1 · Land Archive lockfile fix

```bash
# C-P0-4 lockfile is in nexarch commit 8 — verify it's committed
git log --oneline -5 | grep lockfile
# If not, run:
pnpm install --no-frozen-lockfile
git add pnpm-lock.yaml
git commit -m "fix(lockfile): sync pnpm-lock.yaml for new @cerebro/* packages  [C-P0-4]"
git push origin main
```

**Complexity:** S | **Dependencies:** C-P0-NEXARCH (run nexarch-commit.sh first)

---

## How to use this file
Open this file in VS Code. Work tasks top to bottom — P0 first, no exceptions. Each task has the exact file path and what to do. When you commit, use a commit message that references the task ID in brackets (e.g., `[C-P0-1]`) so the night audit can automatically detect completion.
