#!/usr/bin/env bash
# nexarch-commit.sh — Creates 8 structured commits for the Nexarch Command Center
# Run from repo root: bash nexarch-commit.sh
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

echo "=== Nexarch Commit Script ==="
echo "Working from: $REPO_ROOT"
echo ""

# ── Commit 1: Core agent-OS packages ─────────────────────────────────────────
echo "[1/8] feat(kernel-core): bootstrap agent kernel with scheduler, watchdog, and lifecycle"
git add \
  packages/kernel-core/package.json \
  packages/kernel-core/src/index.ts \
  packages/kernel-core/src/kernel.ts \
  packages/kernel-core/src/scheduler.ts \
  packages/kernel-core/src/watchdog.ts \
  packages/kernel-core/src/lifecycle.ts \
  packages/kernel-core/src/delegation.ts \
  packages/kernel-core/src/types.ts \
  packages/kernel-core/tsconfig.json
git commit -m "feat(kernel-core): bootstrap agent kernel with scheduler, watchdog, and lifecycle

Introduces the @cerebro/kernel-core package providing the foundational
agent execution primitives: kernel orchestration, task scheduling,
watchdog health monitoring, lifecycle management, and delegation chains."

# ── Commit 2: Memory SDK ──────────────────────────────────────────────────────
echo "[2/8] feat(memory-sdk): add context engine and memory manager"
git add \
  packages/memory-sdk/package.json \
  packages/memory-sdk/src/index.ts \
  packages/memory-sdk/src/context-engine.ts \
  packages/memory-sdk/src/memory-manager.ts \
  packages/memory-sdk/src/types.ts \
  packages/memory-sdk/tsconfig.json
git commit -m "feat(memory-sdk): add context engine and memory manager

Adds @cerebro/memory-sdk with context window management and persistent
memory operations. Enables agents to maintain state across task
boundaries and retrieve relevant historical context."

# ── Commit 3: Runtime core ────────────────────────────────────────────────────
echo "[3/8] feat(runtime-core): add mission and task execution runtime"
git add \
  packages/runtime-core/package.json \
  packages/runtime-core/src/index.ts \
  packages/runtime-core/src/execution/execution.ts \
  packages/runtime-core/src/mission/ \
  packages/runtime-core/src/task/ \
  packages/runtime-core/tsconfig.json
git commit -m "feat(runtime-core): add mission and task execution runtime

Adds @cerebro/runtime-core with durable mission orchestration and
hierarchical task execution. Provides the execution substrate for
multi-step agent workflows with retry and checkpoint support."

# ── Commit 4: Governance core ─────────────────────────────────────────────────
echo "[4/8] feat(governance-core): add policy engine, risk scoring, and approval service"
git add \
  packages/governance-core/package.json \
  packages/governance-core/src/index.ts \
  packages/governance-core/src/policy-engine.ts \
  packages/governance-core/src/risk-engine.ts \
  packages/governance-core/src/approval-service.ts \
  packages/governance-core/src/budget-enforcer.ts \
  packages/governance-core/src/audit-trail.ts \
  packages/governance-core/src/types.ts \
  packages/governance-core/tsconfig.json
git commit -m "feat(governance-core): add policy engine, risk scoring, and approval service

Adds @cerebro/governance-core implementing enterprise-grade agent
governance: policy evaluation, risk scoring, human-in-the-loop
approval workflows, budget enforcement, and immutable audit trails."

# ── Commit 5: Agent OS data layer and API routes ──────────────────────────────
echo "[5/8] feat(agent-os): add data layer and API routes for agent registry"
git add \
  data/agent-os.json \
  app/api/ \
  lib/agent-os/
git commit -m "feat(agent-os): add data layer and API routes for agent registry

Introduces the agent-OS data model (agent-os.json), REST API routes
for agent CRUD and mission management, and the lib/agent-os client
utilities used by the Command Center UI."

# ── Commit 6: Nexarch Command Center UI ──────────────────────────────────────
echo "[6/8] feat(nexarch): add Command Center UI with six operational sections"
git add app/nexarch/
git commit -m "feat(nexarch): add Command Center UI with six operational sections

Adds the /nexarch route — Cerebro's agentic OS Command Center.
Six sections: Agents, Missions, Governance, Topology, Observability,
and Approvals. Built on Next.js App Router with real-time agent status,
mission progress tracking, and governance approval queues."

# ── Commit 7: Docs and knowledge base ────────────────────────────────────────
echo "[7/8] docs(agentic-os): add architecture docs and AI intelligence knowledge base"
git add \
  docs/agentic-os/ \
  knowledge/ \
  CEREBRO-NEXARCH-AI-INTELLIGENCE-BRIEF.md \
  AI-REVOLUTION-KNOWLEDGE-BASE-BASELINE.md \
  WEEKLY-CTO-TECHNOLOGY-INTELLIGENCE.md \
  PHASE-2-3-EXECUTION-PROMPT.md
git commit -m "docs(agentic-os): add architecture docs and AI intelligence knowledge base

Documents the Cerebro Nexarch agentic OS architecture and bootstrap
edition of the AI Intelligence Brief. Establishes the knowledge
base baseline and CTO weekly intelligence report template."

# ── Commit 8: Agent task files, progress, and pnpm lock ──────────────────────
echo "[8/8] chore: update sprint tasks, progress log, package manifests, and lock file"
git add \
  PROGRESS.md \
  agents/CLAUDE-TASKS.md \
  agents/CODEX-TASKS.md \
  agents/CURRENT-SPRINT.md \
  agents/GEMINI-TASKS.md \
  pnpm-lock.yaml
git commit -m "chore: update sprint tasks, progress log, package manifests, and lock file

Marks nexarch Command Center and agent-OS bootstrap as complete in
PROGRESS.md. Updates agent task queues and sprint board. Syncs
pnpm-lock.yaml for new @cerebro/* packages."

echo ""
echo "All 8 commits created successfully."
echo ""
git log --oneline -8
