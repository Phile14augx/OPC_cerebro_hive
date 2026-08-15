# Studio Company Operating System — Departments, Agents, and Tasks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver real department exploration, upgraded agent views, and durable task creation/execution with steps, events, controls, logs, and artifacts.

**Architecture:** Extend the Plan 1 normalized graph and authenticated operating-system API. Persist operating tasks separately from Forge project-management `Task`, delegate execution to the existing runtime, and render department DAGs with ELK through the shared operating-system shell.

**Tech Stack:** TypeScript, Prisma/PostgreSQL, Fastify, existing agent/runtime services, React 19, Next.js 16, TanStack Query, React Flow, ELK, Vitest, Playwright.

## Global Constraints

- Plan 1 completion gate must pass before this plan begins.
- Keep Forge `Task` semantics unchanged; use `OperatingTask` for organization command-center work.
- Every department, agent, task, execution, event, log, and artifact query is workspace-scoped.
- Unsupported runtime actions return explicit unavailable responses; never simulate execution or completion.
- Existing `/app/agents` and `/app/agents/[id]` URLs remain stable.
- Production task status and artifacts derive from persisted task/runtime records, never fixture timers.
- Build test-first and commit each task independently without unrelated changes.
- This plan is Plan 2 of 5; Plans 3–5 remain required.

---

### Task 1: Persist Durable Operating Tasks, Steps, and Artifacts

**Files:**
- Modify: `packages/db/prisma/schema.prisma`
- Create: `packages/db/prisma/migrations/20260809_company_operating_tasks/migration.sql`
- Create: `packages/db/src/repositories/OperatingTaskRepository.ts`
- Create: `packages/db/src/repositories/OperatingTaskRepository.test.ts`
- Modify: `packages/db/index.ts`
- Modify: `packages/shared-types/src/domain/operating-system.ts`

**Interfaces:**
- Produces: `OperatingTaskSummary`, `OperatingTaskDetail`, `OperatingTaskStep`, `OperatingTaskArtifact`.
- Produces: `OperatingTaskRepository.create`, `list`, `getById`, `transition`, `appendStep`, `appendArtifact`.

- [ ] **Step 1: Write failing repository lifecycle tests**

```ts
it("creates a queued task in the verified workspace", async () => {
  const task = await repository.create({ title: "Audit docs", targetType: "agent", targetId: AGENT_ID, input: {} }, opts(WORKSPACE_A));
  expect(task.status).toBe("QUEUED");
  expect(task.workspaceId).toBe(WORKSPACE_A);
});

it("rejects an invalid status transition", async () => {
  await expect(repository.transition(TASK_ID, "COMPLETED", opts(WORKSPACE_A))).rejects.toThrow("QUEUED cannot transition to COMPLETED");
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `pnpm exec vitest run packages/db/src/repositories/OperatingTaskRepository.test.ts`

Expected: FAIL because the repository and Prisma models do not exist.

- [ ] **Step 3: Add task persistence**

```prisma
enum OperatingTaskStatus { QUEUED RUNNING PAUSED COMPLETED FAILED CANCELLED }

model OperatingTask {
  id           String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  workspaceId  String @db.Uuid
  workspace    Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  title        String
  prompt       String? @db.Text
  status       OperatingTaskStatus @default(QUEUED)
  targetType   String
  targetId     String
  createdById  String @db.Uuid
  executionId  String? @db.Uuid
  input        Json @default("{}")
  output       Json?
  error        Json?
  version      Int @default(1)
  startedAt    DateTime?
  completedAt  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  steps        OperatingTaskStep[]
  artifacts    OperatingTaskArtifact[]
  @@index([workspaceId, status, createdAt])
  @@index([workspaceId, targetType, targetId])
}

model OperatingTaskStep {
  id          String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  taskId      String @db.Uuid
  task        OperatingTask @relation(fields: [taskId], references: [id], onDelete: Cascade)
  position    Int
  label       String
  status      OperatingTaskStatus @default(QUEUED)
  detail      String?
  startedAt   DateTime?
  completedAt DateTime?
  @@unique([taskId, position])
}

model OperatingTaskArtifact {
  id          String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  taskId      String @db.Uuid
  task        OperatingTask @relation(fields: [taskId], references: [id], onDelete: Cascade)
  name        String
  mediaType   String
  uri         String
  sizeBytes   BigInt?
  metadata    Json?
  createdAt   DateTime @default(now())
  @@index([taskId, createdAt])
}
```

Add `operatingTasks` to `Workspace`. Store artifact references only; content remains in the existing document/object-storage pipeline.

- [ ] **Step 4: Implement allowed transitions and optimistic concurrency**

```ts
const ALLOWED: Record<OperatingTaskStatus, OperatingTaskStatus[]> = {
  QUEUED: ["RUNNING", "CANCELLED"],
  RUNNING: ["PAUSED", "COMPLETED", "FAILED", "CANCELLED"],
  PAUSED: ["RUNNING", "CANCELLED"],
  COMPLETED: [],
  FAILED: ["QUEUED"],
  CANCELLED: ["QUEUED"],
};
```

`transition` must update with `{ id, workspaceId, version }`, increment `version`, and throw a conflict if no row was updated.

- [ ] **Step 5: Generate Prisma and run tests**

Run: `pnpm --filter @cerebro/db generate && pnpm --filter @cerebro/db typecheck`

Expected: both succeed.

Run: `pnpm exec vitest run packages/db/src/repositories/OperatingTaskRepository.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/db/prisma/schema.prisma packages/db/prisma/migrations/20260809_company_operating_tasks/migration.sql packages/db/src/repositories/OperatingTaskRepository.ts packages/db/src/repositories/OperatingTaskRepository.test.ts packages/db/index.ts packages/shared-types/src/domain/operating-system.ts
git commit -m "feat(company-os): persist operating tasks"
```

### Task 2: Connect Commands to Durable Tasks and the Existing Runtime

**Files:**
- Modify: `apps/platform-api/src/modules/operating-system/OperatingCommandService.ts`
- Create: `apps/platform-api/src/modules/operating-system/OperatingTaskService.ts`
- Modify: `apps/platform-api/src/modules/operating-system/operating-system.routes.ts`
- Create: `apps/platform-api/src/modules/operating-system/tasks.routes.test.ts`
- Modify: `apps/platform-api/src/bootstrap.ts`
- Modify: `apps/platform-api/src/server.ts`

**Interfaces:**
- Produces: task list/detail endpoints and pause/cancel/retry actions.
- Consumes: `OperatingTaskRepository`, existing agent runtime/execution services, verified request context.

- [ ] **Step 1: Write failing API lifecycle and authorization tests**

```ts
it("creates a task and dispatches a supported agent execution", async () => {
  const response = await app.inject({ method: "POST", url: "/api/operating-system/commands", headers: authHeaders(), payload: { kind: "create-task", title: "Audit docs", targetType: "agent", targetId: AGENT_ID, input: {} } });
  expect(response.statusCode).toBe(202);
  expect(response.json().data.status).toBe("QUEUED");
});

it("does not reveal another workspace task", async () => {
  const response = await app.inject({ method: "GET", url: `/api/operating-system/tasks/${OTHER_TASK_ID}`, headers: authHeaders(WORKSPACE_A) });
  expect(response.statusCode).toBe(404);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm --filter @cerebro/platform-api test -- tasks.routes.test.ts`

Expected: FAIL because task service routes are missing.

- [ ] **Step 3: Implement task dispatch**

Create the task first, append initial steps, dispatch through the existing agent runtime when `targetType === "agent"`, persist `executionId`, and return `202`. Department targets resolve to the configured leader agent; workflow targets execute only when a real workflow runtime is available, otherwise return `409 TARGET_NOT_EXECUTABLE` before creating a task.

- [ ] **Step 4: Implement list/detail and actions**

Add:

```text
GET  /api/operating-system/tasks
GET  /api/operating-system/tasks/:id
POST /api/operating-system/tasks/:id/pause
POST /api/operating-system/tasks/:id/cancel
POST /api/operating-system/tasks/:id/retry
```

Require `Idempotency-Key` for mutations. Return `409 INVALID_TASK_TRANSITION` for invalid lifecycle changes. Map runtime events to task steps and task terminal states transactionally.

- [ ] **Step 5: Run API tests and build**

Run: `pnpm --filter @cerebro/platform-api test -- tasks.routes.test.ts && pnpm --filter @cerebro/platform-api build`

Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add apps/platform-api/src/modules/operating-system apps/platform-api/src/bootstrap.ts apps/platform-api/src/server.ts
git commit -m "feat(company-os): dispatch durable operating tasks"
```

### Task 3: Add Department APIs and ELK Department Graphs

**Files:**
- Modify: `packages/db/src/repositories/OperatingSystemRepository.ts`
- Modify: `apps/platform-api/src/modules/operating-system/OperatingSystemService.ts`
- Modify: `apps/platform-api/src/modules/operating-system/operating-system.routes.ts`
- Create: `apps/platform-api/src/modules/operating-system/departments.routes.test.ts`
- Create: `apps/studio/features/company-operating-system/graph/elkLayout.ts`
- Create: `apps/studio/features/company-operating-system/graph/elkLayout.test.ts`
- Create: `apps/studio/features/company-operating-system/screens/DepartmentsScreen.tsx`
- Create: `apps/studio/features/company-operating-system/screens/DepartmentDetailScreen.tsx`
- Create: `apps/studio/app/(platform)/app/(operating-system)/departments/page.tsx`
- Create: `apps/studio/app/(platform)/app/(operating-system)/departments/[id]/page.tsx`

**Interfaces:**
- Produces: `GET /api/operating-system/departments` and `/departments/:id`.
- Produces: `layoutDepartmentGraph(snapshot): Promise<PositionedOperatingNode[]>`.

- [ ] **Step 1: Write failing ELK and API tests**

```ts
it("places dependencies before their consumers", async () => {
  const layout = await layoutDepartmentGraph(engineeringSnapshot);
  expect(node(layout, "data-source-repo").x).toBeLessThan(node(layout, "agent-builder").x);
});
```

API tests must assert unknown and cross-workspace department IDs return identical 404 responses.

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/graph/elkLayout.test.ts`

Expected: FAIL because `elkLayout` is missing.

- [ ] **Step 3: Implement department projections and endpoints**

Return department summaries with real counts and a focused graph containing the department, its agents, assigned tools/models, connected data/memory/workflows, and only relationships whose endpoints are included.

- [ ] **Step 4: Implement the ELK layout and screens**

Use `elk.algorithm=layered`, `elk.direction=RIGHT`, stable node ordering, and fixed category-specific sizes. The list screen shows cross-department links and honest empty states. Detail reuses the Plan 1 graph toolbar, search, inspector, event projection, and accessible entity tree.

- [ ] **Step 5: Run tests and typecheck**

Run: `pnpm --filter @cerebro/platform-api test -- departments.routes.test.ts`

Expected: PASS.

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/graph/elkLayout.test.ts && pnpm --filter @cerebro/studio typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/db/src/repositories/OperatingSystemRepository.ts apps/platform-api/src/modules/operating-system apps/studio/features/company-operating-system/graph/elkLayout.ts apps/studio/features/company-operating-system/graph/elkLayout.test.ts apps/studio/features/company-operating-system/screens/DepartmentsScreen.tsx apps/studio/features/company-operating-system/screens/DepartmentDetailScreen.tsx apps/studio/app/'(platform)'/app/'(operating-system)'/departments
git commit -m "feat(company-os): add department graph exploration"
```

### Task 4: Upgrade Existing Agent Routes into the Operating-System Workspace

**Files:**
- Move: `apps/studio/app/(platform)/app/agents/page.tsx` → `apps/studio/app/(platform)/app/(operating-system)/agents/page.tsx`
- Move: `apps/studio/app/(platform)/app/agents/[id]/page.tsx` → `apps/studio/app/(platform)/app/(operating-system)/agents/[id]/page.tsx`
- Create: `apps/studio/features/company-operating-system/screens/AgentsScreen.tsx`
- Create: `apps/studio/features/company-operating-system/screens/AgentDetailScreen.tsx`
- Create: `apps/studio/features/company-operating-system/screens/AgentDetailScreen.test.tsx`
- Modify: `apps/studio/features/company-operating-system/data/client.ts`
- Modify: `apps/studio/features/company-operating-system/data/queries.ts`

**Interfaces:**
- Consumes: existing `/api/v1/agents` plus operating-system entity detail and task APIs.
- Produces: stable existing URLs with shared graph/detail behavior.

- [ ] **Step 1: Write failing agent-detail tests**

```tsx
it("shows real execution metrics and relationships", async () => {
  render(<AgentDetailScreen agentId={AGENT_ID} />);
  expect(await screen.findByText("Tasks completed")).toBeVisible();
  expect(screen.getByRole("link", { name: "Open department" })).toHaveAttribute("href", `/app/departments/${DEPARTMENT_ID}`);
});

it("renders an honest no-activity state", async () => {
  server.use(agentDetailWithoutRuns);
  render(<AgentDetailScreen agentId={AGENT_ID} />);
  expect(await screen.findByText("No executions recorded for this agent")).toBeVisible();
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/screens/AgentDetailScreen.test.tsx`

Expected: FAIL because the screen is missing.

- [ ] **Step 3: Implement agent list and detail**

The list provides search, department/status filters, current workload, and graph focus links. Detail provides status, active version/model, capabilities, tools, department, relationships, recent tasks, execution metrics computed from real records, memory summary, and `Run agent`/`Create task` actions gated by API capability.

- [ ] **Step 4: Move route adapters without changing URLs**

Move only the route files into the `(operating-system)` route group and keep route params and metadata intact. Each page renders the new screen and preserves not-found behavior.

- [ ] **Step 5: Run tests, route smoke tests, and build**

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/screens/AgentDetailScreen.test.tsx`

Expected: PASS.

Run: `pnpm --filter @cerebro/studio build`

Expected: `/app/agents` and `/app/agents/[id]` are emitted exactly once.

- [ ] **Step 6: Commit**

```bash
git add apps/studio/app/'(platform)'/app/agents apps/studio/app/'(platform)'/app/'(operating-system)'/agents apps/studio/features/company-operating-system/screens/AgentsScreen.tsx apps/studio/features/company-operating-system/screens/AgentDetailScreen.tsx apps/studio/features/company-operating-system/screens/AgentDetailScreen.test.tsx apps/studio/features/company-operating-system/data
git commit -m "feat(company-os): integrate agent catalog and detail"
```

### Task 5: Build Task Queue, Task Detail, Execution Timeline, and Controls

**Files:**
- Create: `apps/studio/features/company-operating-system/components/tasks/TaskStatusChip.tsx`
- Create: `apps/studio/features/company-operating-system/components/tasks/TaskExecutionTimeline.tsx`
- Create: `apps/studio/features/company-operating-system/components/tasks/TaskArtifacts.tsx`
- Create: `apps/studio/features/company-operating-system/components/tasks/TaskControls.tsx`
- Create: `apps/studio/features/company-operating-system/components/tasks/TaskExecutionTimeline.test.tsx`
- Create: `apps/studio/features/company-operating-system/screens/TasksScreen.tsx`
- Create: `apps/studio/features/company-operating-system/screens/TaskDetailScreen.tsx`
- Create: `apps/studio/app/(platform)/app/(operating-system)/tasks/page.tsx`
- Create: `apps/studio/app/(platform)/app/(operating-system)/tasks/[id]/page.tsx`
- Modify: `apps/studio/features/company-operating-system/data/client.ts`
- Modify: `apps/studio/features/company-operating-system/data/queries.ts`

**Interfaces:**
- Consumes: Task 2 endpoints and Plan 1 event stream.
- Produces: durable task management screens and mutation controls.

- [ ] **Step 1: Write failing timeline and action tests**

```tsx
it("orders steps and identifies the active step", () => {
  render(<TaskExecutionTimeline steps={unsortedSteps} />);
  expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Scan", "Validate", "Report"]);
  expect(screen.getByText("Validate").closest("li")).toHaveAttribute("data-status", "RUNNING");
});

it("does not show pause for a completed task", () => {
  render(<TaskControls task={completedTask} />);
  expect(screen.queryByRole("button", { name: "Pause task" })).toBeNull();
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/components/tasks/TaskExecutionTimeline.test.tsx`

Expected: FAIL because task components do not exist.

- [ ] **Step 3: Implement queue and detail screens**

Queue filters by lifecycle, department, target, and date and shows real title, owner, target, status, duration, and artifact count. Detail displays description/input summary, ordered steps, append-only event activity, sanitized log messages, artifact links, timestamps, and error details.

- [ ] **Step 4: Implement mutation controls**

Pause is available only for `RUNNING`, cancel for `QUEUED|RUNNING|PAUSED`, and retry for `FAILED|CANCELLED`. Generate one idempotency key per user action and reuse it across network retries. Confirm cancellation when progress exists.

- [ ] **Step 5: Connect graph task activity**

Task creation selects the task node, pulses the target relationship, and opens `TaskInspector`. Terminal events update the graph projection and detail cache without a full graph rebuild.

- [ ] **Step 6: Run tests and build**

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/components/tasks/TaskExecutionTimeline.test.tsx && pnpm --filter @cerebro/studio typecheck && pnpm --filter @cerebro/studio build`

Expected: all commands pass.

- [ ] **Step 7: Commit**

```bash
git add apps/studio/features/company-operating-system/components/tasks apps/studio/features/company-operating-system/screens/TasksScreen.tsx apps/studio/features/company-operating-system/screens/TaskDetailScreen.tsx apps/studio/features/company-operating-system/data apps/studio/app/'(platform)'/app/'(operating-system)'/tasks
git commit -m "feat(company-os): add operating task workspace"
```

### Task 6: Verify Departments, Agents, and Tasks End to End

**Files:**
- Create: `apps/studio/tests/e2e/company-operating-system-execution.spec.ts`
- Create: `apps/studio/tests/visual/company-operating-system/departments-agents-tasks.spec.ts`
- Create: `apps/platform-api/src/modules/operating-system/tenant-isolation.test.ts`
- Create: `docs/company-operating-system/execution-domains.md`

**Interfaces:**
- Consumes: every Plan 2 route and API.
- Produces: independently reviewable execution-domain verification.

- [ ] **Step 1: Write the browser journey**

```ts
test("department to agent to task execution", async ({ page }) => {
  await page.goto("/app/departments");
  await page.getByRole("link", { name: /Engineering/ }).click();
  await page.getByRole("button", { name: /Agent:/ }).first().dblclick();
  await page.getByRole("button", { name: "Create task" }).click();
  await page.getByLabel("Task title").fill("Audit customer documentation");
  await page.getByRole("button", { name: "Run task" }).click();
  await expect(page.getByText(/Queued|Running/)).toBeVisible();
  await page.getByRole("link", { name: "Open task" }).click();
  await expect(page.getByRole("heading", { name: "Audit customer documentation" })).toBeVisible();
});
```

- [ ] **Step 2: Add two-workspace API tests**

Cover list, detail, command target, mutation, artifact, department graph, and agent detail. Assert unauthorized IDs always return the same 404/403 shape as unknown IDs.

- [ ] **Step 3: Run Plan 2 gates**

Run:

```bash
pnpm --filter @cerebro/db generate
pnpm --filter @cerebro/db typecheck
pnpm --filter @cerebro/platform-api test -- operating-system
pnpm --filter @cerebro/platform-api build
pnpm --filter @cerebro/studio test:unit
pnpm --filter @cerebro/studio typecheck
pnpm --filter @cerebro/studio build
pnpm --filter @cerebro/studio test:e2e -- tests/e2e/company-operating-system-execution.spec.ts --project=chromium
```

Expected: every command exits 0.

- [ ] **Step 4: Document lifecycle and failure behavior**

Document supported targets, lifecycle transitions, idempotency, runtime unavailability, event-to-task mapping, artifact safety, and recovery in `docs/company-operating-system/execution-domains.md`.

- [ ] **Step 5: Commit**

```bash
git add apps/studio/tests/e2e/company-operating-system-execution.spec.ts apps/studio/tests/visual/company-operating-system/departments-agents-tasks.spec.ts apps/platform-api/src/modules/operating-system/tenant-isolation.test.ts docs/company-operating-system/execution-domains.md
git commit -m "test(company-os): verify execution domains"
```

## Plan 2 Completion Gate

Do not start Plan 3 until department graphs use live scoped data, existing agent URLs are preserved, task lifecycle controls operate on durable records, task events update graph and detail state, two-workspace isolation passes, and every Task 6 command exits 0.
