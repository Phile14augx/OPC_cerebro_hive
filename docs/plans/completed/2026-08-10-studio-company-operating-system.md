# Studio Company Operating System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fully implement the approved CerebroHive Studio AI-company operating system across all routes, data domains, commands, realtime behavior, organizational views, intelligence operations, and quality gates.

**Architecture:** Execute five independently testable plans in dependency order. Shared contracts and persistence feed authenticated Platform API modules; Studio consumes those contracts through one feature boundary and a shared graph-centric workspace shell.

**Tech Stack:** Next.js 16, React 19, TypeScript, Fastify 5, Prisma 7/PostgreSQL, TanStack Query, React Flow 12, ELK 0.11, Framer Motion 12, Zustand 5, Zod 3, Vitest 3, Playwright 1.61.

## Global Constraints

- The approved design is `docs/superpowers/specs/2026-08-09-studio-company-operating-system-design.md`.
- All five plans are required; a passing earlier plan is not full completion.
- Preserve Studio's existing global shell and unrelated routes while applying the command-center workspace to approved routes.
- Production never silently uses demo or fabricated operational data.
- Every server operation uses verified tenant/workspace context and permission checks.
- Use existing graph/runtime/data infrastructure before adding dependencies or parallel services.
- Build test-first, pass each plan gate, and commit tasks atomically without unrelated dirty-worktree changes.

---

## Plan Suite and Dependency Order

- [ ] **Plan 1 — Foundation and Company Brain**  
  `docs/superpowers/plans/2026-08-09-studio-company-os-01-foundation-brain.md`  
  Establishes contracts, persistence, authenticated graph APIs, shared shell, radial layout, graph canvas, search/filter/focus, inspectors, commands, events, demo gating, and initial verification.

- [ ] **Plan 2 — Departments, Agents, and Tasks**  
  `docs/superpowers/plans/2026-08-09-studio-company-os-02-execution-domains.md`  
  Adds department DAGs, upgrades existing agent routes, persists operating tasks, connects commands to real execution, and delivers task steps/events/artifacts/controls.

- [ ] **Plan 3 — Personas, Funnels, and Hierarchy**  
  `docs/superpowers/plans/2026-08-10-studio-company-os-03-organizational-views.md`  
  Adds persona persistence/editing/relationships, live persisted funnels, and hierarchy derived from real leaders and reporting relationships.

- [ ] **Plan 4 — Memory, Tools, Models, Activity, and Analytics**  
  `docs/superpowers/plans/2026-08-10-studio-company-os-04-intelligence-operations.md`  
  Scopes and redacts memory, projects workspace-relevant tools/models, adds live activity, and replaces fabricated telemetry with real operations analytics and health.

- [ ] **Plan 5 — Hardening and Full Validation**  
  `docs/superpowers/plans/2026-08-10-studio-company-os-05-hardening-validation.md`  
  Completes permissions, real shell data, command history, document drop, degraded states, responsive/accessibility/reduced motion, performance, visual parity, the 15-step journey, and final reporting.

## Locked File Structure

```text
packages/shared-types/src/domain/operating-system.ts
packages/db/src/repositories/OperatingSystemRepository.ts
packages/db/src/repositories/OperatingTaskRepository.ts
packages/db/src/repositories/OperatingPersonaRepository.ts
packages/db/src/repositories/OperatingFunnelRepository.ts
packages/db/src/repositories/OperatingMemoryRepository.ts
apps/platform-api/src/modules/operating-system/
apps/studio/features/company-operating-system/
  accessibility/
  commands/
  components/
  data/
  domain/
  graph/
  realtime/
  screens/
  testing/
  workspace/
apps/studio/app/(platform)/app/(operating-system)/
apps/studio/tests/{e2e,visual,performance}/company-operating-system*
docs/company-operating-system/
```

Pages are thin route adapters. Shared contracts do not import React. Repositories own workspace-scoped persistence and safe projections. Platform API services own authorization-aware orchestration. Feature components never import Prisma or server repositories.

## Approved Route Coverage

| Route | Owning plan |
| --- | --- |
| `/app/brain` | Plan 1 |
| `/app/departments`, `/app/departments/[id]` | Plan 2 |
| `/app/agents`, `/app/agents/[id]` | Plan 2 |
| `/app/tasks`, `/app/tasks/[id]` | Plan 2 |
| `/app/personas`, `/app/personas/[id]` | Plan 3 |
| `/app/funnels` | Plan 3 |
| `/app/hierarchy` | Plan 3 |
| `/app/memory` | Plan 4 |
| `/app/tools` | Plan 4 |
| `/app/models` | Plan 4 |
| `/app/activity` | Plan 4 |
| `/app/analytics`, `/app/analytics/[view]` | Plan 4 |

## Design Requirement Coverage

| Design area | Implementation tasks |
| --- | --- |
| Product decisions, shared architecture, normalized graph | Plan 1 Tasks 1–5 |
| Company Brain visuals and interactions | Plan 1 Tasks 5–8 |
| Commands, inspectors, realtime | Plan 1 Task 7; Plan 2 Tasks 1–2; Plan 5 Task 2 |
| Departments, agents, tasks, task execution | Plan 2 Tasks 1–6 |
| Personas, funnels, hierarchy | Plan 3 Tasks 1–6 |
| Memory, tools, models, activity, analytics, health | Plan 4 Tasks 1–6 |
| Production data policy and explicit demo mode | Plan 1 Tasks 2–4; Plan 5 Tasks 1–2 |
| Security, tenant isolation, permissions, privacy | Every backend task; Plan 5 Tasks 1–2 |
| Responsive, accessibility, reduced motion | Plan 1 Tasks 6–8; Plan 3 Tasks 2/4/5; Plan 5 Task 3 |
| Performance budgets | Plan 1 Tasks 5/8; Plan 5 Task 4 |
| Visual testing and recording parity | Each plan's final task; Plan 5 Task 5 |
| Complete quality gates and implementation report | Plan 5 Task 6 |

## Execution Rules

1. Execute plans in numerical order.
2. Within a plan, execute tasks in order unless the task explicitly has no dependency on a sibling task.
3. Begin every behavior change with its listed failing test and confirm the expected failure.
4. Do not weaken assertions to accommodate implementation defects.
5. Run each task's focused gate before committing.
6. Run the plan completion gate before starting the next plan.
7. Preserve unrelated user changes and staged files.
8. Stop and diagnose unexpected test/build behavior with the systematic-debugging workflow.
9. Use the final Plan 5 gate as the only completion criterion for the full request.

