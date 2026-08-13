# Studio Company Operating System — Memory, Tools, Models, Activity, and Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the intelligence and operations surfaces with safe memory summaries, workspace-relevant tools/models, a live activity stream, real observability metrics, analytics, and system-health states.

**Architecture:** Extend existing memory and telemetry persistence with workspace ownership, project only tools/models reachable from workspace agents, reuse the Plan 1 event stream for activity, and replace fabricated telemetry with aggregates derived from execution and event records.

**Tech Stack:** Prisma/PostgreSQL, Fastify, TypeScript, Next.js 16, React 19, TanStack Query, React Flow, Framer Motion, Vitest, Playwright.

## Global Constraints

- Plans 1–3 completion gates must pass before this plan begins.
- Never expose raw memory payloads in graph/list responses; authorized detail uses bounded, redacted previews.
- Tools and models are visible only when assigned to a version of an agent in the verified workspace or explicitly workspace-enabled.
- Analytics, health, activity, and observability contain no fabricated percentages, latency, events, counts, or success rates.
- Missing telemetry produces honest `No data recorded` states, not zeroes that imply measurement.
- Preserve the existing `/app/analytics` URL while moving it into the shared operating-system route group.
- Build test-first and commit each task independently without unrelated changes.
- This plan is Plan 4 of 5; Plan 5 remains required.

---

### Task 1: Make Memory Workspace-Scoped and Define Safe Projections

**Files:**
- Modify: `packages/db/prisma/schema.prisma`
- Create: `packages/db/prisma/migrations/20260810_company_operating_memory_scope/migration.sql`
- Create: `packages/db/src/repositories/OperatingMemoryRepository.ts`
- Create: `packages/db/src/repositories/OperatingMemoryRepository.test.ts`
- Modify: `packages/db/index.ts`
- Modify: `packages/shared-types/src/domain/operating-system.ts`

**Interfaces:**
- Produces: `OperatingMemorySummary`, `OperatingMemoryDetail`, `OperatingMemoryCategory`.
- Produces: `list`, `getById`, and `getGraphProjection` with permission-aware previews.

- [ ] **Step 1: Write failing isolation and redaction tests**

```ts
it("does not serialize raw memory context in list results", async () => {
  const result = await repository.list(opts(WORKSPACE_A));
  expect(JSON.stringify(result)).not.toContain("customer-secret-value");
});

it("returns only memory owned by the verified workspace", async () => {
  const result = await repository.list(opts(WORKSPACE_A));
  expect(result.every((memory) => memory.workspaceId === WORKSPACE_A)).toBe(true);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm exec vitest run packages/db/src/repositories/OperatingMemoryRepository.test.ts`

Expected: FAIL because workspace-scoped memory projection does not exist.

- [ ] **Step 3: Extend memory persistence and migration**

Add to `Memory`:

```prisma
workspaceId  String   @db.Uuid
workspace    Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
agent        Agent    @relation(fields: [agentId], references: [id], onDelete: Cascade)
category     String
label        String
itemCount    Int      @default(0)
storageBytes BigInt   @default(0)
updatedAt    DateTime @updatedAt
@@index([workspaceId, category])
@@index([workspaceId, agentId])
```

Add `memories` to `Workspace` and `Agent`. The SQL migration backfills `workspaceId` from `Agent.workspaceId`, sets category to `working` for existing rows, sets label from the owning agent name, verifies no orphan `agentId`, then adds non-null constraints and foreign keys.

- [ ] **Step 4: Implement safe list/detail projection**

List returns category, label, owner, item count, storage, snapshot count, and timestamps. Detail returns snapshot metadata and a redacted preview only when `company-os:memory_read` is present. Redaction removes configured sensitive keys and truncates serialized preview to 2,000 characters.

- [ ] **Step 5: Generate Prisma and run tests**

Run: `pnpm --filter @cerebro/db generate && pnpm --filter @cerebro/db typecheck && pnpm exec vitest run packages/db/src/repositories/OperatingMemoryRepository.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/db/prisma/schema.prisma packages/db/prisma/migrations/20260810_company_operating_memory_scope/migration.sql packages/db/src/repositories/OperatingMemoryRepository.ts packages/db/src/repositories/OperatingMemoryRepository.test.ts packages/db/index.ts packages/shared-types/src/domain/operating-system.ts
git commit -m "feat(company-os): scope and project agent memory"
```

### Task 2: Add Memory API and Radial Memory Workspace

**Files:**
- Create: `apps/platform-api/src/modules/operating-system/memory.routes.ts`
- Create: `apps/platform-api/src/modules/operating-system/memory.routes.test.ts`
- Modify: `apps/platform-api/src/modules/operating-system/operating-system.routes.ts`
- Create: `apps/studio/features/company-operating-system/graph/memoryLayout.ts`
- Create: `apps/studio/features/company-operating-system/graph/memoryLayout.test.ts`
- Create: `apps/studio/features/company-operating-system/components/memory/MemoryCanvas.tsx`
- Create: `apps/studio/features/company-operating-system/components/memory/MemoryInspector.tsx`
- Create: `apps/studio/features/company-operating-system/screens/MemoryScreen.tsx`
- Create: `apps/studio/app/(platform)/app/(operating-system)/memory/page.tsx`
- Modify: `apps/studio/features/company-operating-system/data/client.ts`
- Modify: `apps/studio/features/company-operating-system/data/queries.ts`

**Interfaces:**
- Produces: `GET /api/operating-system/memory` and `/memory/:id`.
- Produces: category/agent filters and accessible radial memory map.

- [ ] **Step 1: Write failing permission and layout tests**

```ts
it("returns 403 when raw-preview permission is absent", async () => {
  const response = await app.inject({ method: "GET", url: `/api/operating-system/memory/${MEMORY_ID}`, headers: authHeadersWithout("company-os:memory_read") });
  expect(response.statusCode).toBe(403);
});
```

```ts
it("groups memory nodes by category around the organization core", () => {
  const result = layoutMemoryGraph(memories, viewport);
  expect(uniqueQuadrants(result.filter((node) => node.category === "semantic"))).toHaveLength(1);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm --filter @cerebro/platform-api test -- memory.routes.test.ts`

Expected: FAIL because memory routes are missing.

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/graph/memoryLayout.test.ts`

Expected: FAIL because memory layout is missing.

- [ ] **Step 3: Implement permission-aware endpoints**

List requires `company-os:memory_list`; detail preview requires `company-os:memory_read`. Unknown and cross-workspace IDs return identical 404 responses. Query filters accept category, agent ID, and updated-since timestamp with bounded page size.

- [ ] **Step 4: Implement memory workspace**

Render category clusters for working, episodic, semantic, organizational, document, and shared memory. Display real item count, storage, owner, snapshots, and last update. Selection opens the safe inspector; no raw context appears in DOM unless the authorized detail response contains a redacted preview.

- [ ] **Step 5: Run tests and builds**

Run: `pnpm --filter @cerebro/platform-api test -- memory.routes.test.ts && pnpm --filter @cerebro/platform-api build`

Expected: PASS.

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/graph/memoryLayout.test.ts && pnpm --filter @cerebro/studio typecheck && pnpm --filter @cerebro/studio build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/platform-api/src/modules/operating-system apps/studio/features/company-operating-system/graph/memoryLayout.ts apps/studio/features/company-operating-system/graph/memoryLayout.test.ts apps/studio/features/company-operating-system/components/memory apps/studio/features/company-operating-system/screens/MemoryScreen.tsx apps/studio/features/company-operating-system/data apps/studio/app/'(platform)'/app/'(operating-system)'/memory
git commit -m "feat(company-os): add memory visualization"
```

### Task 3: Project Workspace Tools and Models and Build Inventory Screens

**Files:**
- Modify: `packages/db/src/repositories/OperatingSystemRepository.ts`
- Modify: `apps/platform-api/src/modules/operating-system/OperatingSystemService.ts`
- Modify: `apps/platform-api/src/modules/operating-system/operating-system.routes.ts`
- Create: `apps/platform-api/src/modules/operating-system/inventory.routes.test.ts`
- Create: `apps/studio/features/company-operating-system/components/inventory/InventoryTable.tsx`
- Create: `apps/studio/features/company-operating-system/components/inventory/InventoryInspector.tsx`
- Create: `apps/studio/features/company-operating-system/components/inventory/InventoryTable.test.tsx`
- Create: `apps/studio/features/company-operating-system/screens/ToolsScreen.tsx`
- Create: `apps/studio/features/company-operating-system/screens/ModelsScreen.tsx`
- Create: `apps/studio/app/(platform)/app/(operating-system)/tools/page.tsx`
- Create: `apps/studio/app/(platform)/app/(operating-system)/models/page.tsx`

**Interfaces:**
- Produces: `GET /api/operating-system/tools`, `/tools/:id`, `/models`, and `/models/:id`.
- Produces: searchable relationship-aware tool and model inventories.

- [ ] **Step 1: Write failing projection tests**

```ts
it("returns only tools assigned to workspace agents", async () => {
  const result = await service.listTools(contextFor(WORKSPACE_A));
  expect(result.map((tool) => tool.id)).toEqual([TOOL_ASSIGNED_TO_WORKSPACE_A]);
});

it("never returns tool endpoint credentials or handler code", async () => {
  const result = await service.getTool(TOOL_ID, contextFor(WORKSPACE_A));
  expect(JSON.stringify(result)).not.toContain("handlerCode");
  expect(JSON.stringify(result)).not.toContain("secret-token");
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm --filter @cerebro/platform-api test -- inventory.routes.test.ts`

Expected: FAIL because inventory projections and routes are missing.

- [ ] **Step 3: Implement safe inventory queries**

Tools are reached through `Agent → AgentVersion → AgentTool → ToolVersion → Tool`; models through `Agent → AgentVersion → AIModel`. Return assignment counts, agent links, category/provider, active version, supported capabilities, and real execution health if records exist. Do not return endpoints, schemas containing secrets, pricing credentials, handler code, or provider secrets.

- [ ] **Step 4: Implement inventory screens**

Use one `InventoryTable` with category-specific columns, compact technical labels, search, status/provider/category filters, relationship counts, and an inspector that links back to agents and departments. Empty states link to agent configuration rather than inventing catalog items.

- [ ] **Step 5: Run tests and build**

Run: `pnpm --filter @cerebro/platform-api test -- inventory.routes.test.ts && pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/components/inventory/InventoryTable.test.tsx && pnpm --filter @cerebro/studio build`

Expected: all commands pass.

- [ ] **Step 6: Commit**

```bash
git add packages/db/src/repositories/OperatingSystemRepository.ts apps/platform-api/src/modules/operating-system apps/studio/features/company-operating-system/components/inventory apps/studio/features/company-operating-system/screens/ToolsScreen.tsx apps/studio/features/company-operating-system/screens/ModelsScreen.tsx apps/studio/app/'(platform)'/app/'(operating-system)'/tools apps/studio/app/'(platform)'/app/'(operating-system)'/models
git commit -m "feat(company-os): add tool and model inventories"
```

### Task 4: Build the Organization-Wide Activity Stream

**Files:**
- Modify: `packages/db/src/repositories/OperatingSystemRepository.ts`
- Modify: `apps/platform-api/src/modules/operating-system/OperatingEventStream.ts`
- Modify: `apps/platform-api/src/modules/operating-system/operating-system.routes.ts`
- Create: `apps/platform-api/src/modules/operating-system/activity.routes.test.ts`
- Modify: `apps/studio/features/company-operating-system/realtime/eventProjection.ts`
- Create: `apps/studio/features/company-operating-system/components/activity/ActivityTimeline.tsx`
- Create: `apps/studio/features/company-operating-system/components/activity/ActivityTimeline.test.tsx`
- Create: `apps/studio/features/company-operating-system/screens/ActivityScreen.tsx`
- Create: `apps/studio/app/(platform)/app/(operating-system)/activity/page.tsx`

**Interfaces:**
- Produces: paginated `GET /api/operating-system/activity` plus existing SSE updates.
- Produces: filterable event timeline and entity deep links.

- [ ] **Step 1: Write failing cursor and projection tests**

```ts
it("returns events after the supplied cursor in ascending order", async () => {
  const page = await repository.listActivity({ after: EVENT_10, limit: 50 }, opts(WORKSPACE_A));
  expect(page.items.map((item) => item.id)).toEqual([EVENT_11, EVENT_12]);
});

it("deduplicates a streamed event already present in the first page", () => {
  expect(projectActivityEvent([event11], event11)).toEqual([event11]);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm --filter @cerebro/platform-api test -- activity.routes.test.ts`

Expected: FAIL because activity pagination is missing.

- [ ] **Step 3: Implement safe activity queries**

Query a normalized union of `ExecutionEvent` and `OperatingActivityEvent` by workspace with signed composite cursor pagination. Map event type, actor/target safe summaries, timestamp, status, task/execution link, and sanitized message. Support filters for event type, status, agent, department, task, and time range. Never expose raw event payloads or internal cursor components.

- [ ] **Step 4: Implement activity UI and live merge**

Render a compact timeline with grouped timestamps, filters, pause/resume live updates, unread count, and entity deep links. Live events merge by ID; pausing buffers at most 200 events and shows the buffered count.

- [ ] **Step 5: Run tests and build**

Run: `pnpm --filter @cerebro/platform-api test -- activity.routes.test.ts && pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/components/activity/ActivityTimeline.test.tsx && pnpm --filter @cerebro/studio build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/db/src/repositories/OperatingSystemRepository.ts apps/platform-api/src/modules/operating-system apps/studio/features/company-operating-system/realtime/eventProjection.ts apps/studio/features/company-operating-system/components/activity apps/studio/features/company-operating-system/screens/ActivityScreen.tsx apps/studio/app/'(platform)'/app/'(operating-system)'/activity
git commit -m "feat(company-os): add live organization activity"
```

### Task 5: Replace Fabricated Telemetry and Integrate Analytics, Observability, and Health

**Files:**
- Modify: `apps/platform-api/src/modules/telemetry/telemetry.routes.ts`
- Create: `apps/platform-api/src/modules/operating-system/operations.routes.ts`
- Create: `apps/platform-api/src/modules/operating-system/operations.routes.test.ts`
- Modify: `apps/platform-api/src/modules/operating-system/operating-system.routes.ts`
- Move: `apps/studio/app/(platform)/app/analytics/page.tsx` → `apps/studio/app/(platform)/app/(operating-system)/analytics/page.tsx`
- Move: `apps/studio/app/(platform)/app/analytics/[view]/page.tsx` → `apps/studio/app/(platform)/app/(operating-system)/analytics/[view]/page.tsx`
- Create: `apps/studio/features/company-operating-system/components/operations/MetricStrip.tsx`
- Create: `apps/studio/features/company-operating-system/components/operations/HealthMatrix.tsx`
- Create: `apps/studio/features/company-operating-system/components/operations/TraceTable.tsx`
- Create: `apps/studio/features/company-operating-system/components/operations/MetricStrip.test.tsx`
- Create: `apps/studio/features/company-operating-system/screens/AnalyticsScreen.tsx`

**Interfaces:**
- Produces: `GET /api/operating-system/operations/summary`, `/health`, and `/traces`.
- Replaces pseudo telemetry with nullable real aggregates.

- [ ] **Step 1: Write failing no-fabrication tests**

```ts
it("returns null rather than a fabricated average when no executions exist", async () => {
  const result = await service.getOperationsSummary(contextFor(EMPTY_WORKSPACE));
  expect(result.averageLatencyMs).toBeNull();
  expect(result.successRate).toBeNull();
  expect(result.totalExecutions).toBe(0);
});
```

```tsx
it("renders no-data copy for nullable metrics", () => {
  render(<MetricStrip metrics={{ averageLatencyMs: null, successRate: null, totalExecutions: 0 }} />);
  expect(screen.getAllByText("No data recorded")).toHaveLength(2);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm --filter @cerebro/platform-api test -- operations.routes.test.ts`

Expected: FAIL because real operations aggregation does not exist.

- [ ] **Step 3: Implement real aggregates**

Compute counts, status distribution, average/percentile duration, success rate, cost, token usage, and throughput from workspace-owned `AgentExecution` and `WorkflowExecution` rows. Trace summaries come from executions and persisted steps/events. Health derives from recent execution failures, stream connectivity, and real integration/provider checks available to the workspace; unavailable checks return `unknown`.

Remove fixed `650`, `240`, `120.50`, `0.01`, and `0.22` values from the existing telemetry overview. Preserve API compatibility by returning nullable fields where measurement is unavailable.

- [ ] **Step 4: Implement analytics and health views**

Move existing analytics route adapters into the operating-system route group without changing URLs. Render Overview, Traces, Health, and Costs views from real endpoints. Use compact metrics, real time ranges, trace links, empty states, and no implied trend when fewer than two comparable periods exist.

- [ ] **Step 5: Run tests, typecheck, and build**

Run: `pnpm --filter @cerebro/platform-api test -- operations.routes.test.ts && pnpm --filter @cerebro/platform-api build`

Expected: PASS.

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/components/operations/MetricStrip.test.tsx && pnpm --filter @cerebro/studio typecheck && pnpm --filter @cerebro/studio build`

Expected: `/app/analytics` routes are emitted once and all commands pass.

- [ ] **Step 6: Commit**

```bash
git add apps/platform-api/src/modules/telemetry/telemetry.routes.ts apps/platform-api/src/modules/operating-system apps/studio/app/'(platform)'/app/analytics apps/studio/app/'(platform)'/app/'(operating-system)'/analytics apps/studio/features/company-operating-system/components/operations apps/studio/features/company-operating-system/screens/AnalyticsScreen.tsx
git commit -m "feat(company-os): add real operations analytics"
```

### Task 6: Verify Intelligence and Operations End to End

**Files:**
- Create: `apps/studio/tests/e2e/company-operating-system-intelligence.spec.ts`
- Create: `apps/studio/tests/visual/company-operating-system/intelligence-operations.spec.ts`
- Create: `apps/platform-api/src/modules/operating-system/intelligence-isolation.test.ts`
- Create: `docs/company-operating-system/intelligence-operations.md`

**Interfaces:**
- Consumes: every Plan 4 route and endpoint.
- Produces: independently reviewable intelligence/operations evidence.

- [ ] **Step 1: Write the browser journey**

```ts
test("inspect memory, tool, model, activity, and analytics", async ({ page }) => {
  await page.goto("/app/memory");
  await page.getByRole("button", { name: /Semantic memory/ }).first().click();
  await expect(page.getByRole("dialog", { name: /memory inspector/i })).toBeVisible();
  await page.goto("/app/tools");
  await page.getByRole("row").nth(1).click();
  await expect(page.getByRole("dialog", { name: /tool inspector/i })).toBeVisible();
  await page.goto("/app/activity");
  await expect(page.getByRole("feed")).toBeVisible();
  await page.goto("/app/analytics");
  await expect(page.getByRole("heading", { name: "Operations analytics" })).toBeVisible();
});
```

- [ ] **Step 2: Add privacy and isolation coverage**

Test memory list/detail permissions, raw-payload redaction, cross-workspace event cursors, unassigned tool/model exclusion, trace ownership, and empty telemetry nullability.

- [ ] **Step 3: Run Plan 4 gates**

Run:

```bash
pnpm --filter @cerebro/db generate
pnpm --filter @cerebro/db typecheck
pnpm --filter @cerebro/platform-api test -- operating-system
pnpm --filter @cerebro/platform-api build
pnpm --filter @cerebro/studio test:unit
pnpm --filter @cerebro/studio typecheck
pnpm --filter @cerebro/studio build
pnpm --filter @cerebro/studio test:e2e -- tests/e2e/company-operating-system-intelligence.spec.ts --project=chromium
```

Expected: every command exits 0.

- [ ] **Step 4: Document privacy, telemetry, and health semantics**

Document memory redaction, tool/model reachability, event cursor rules, nullable metrics, health `unknown` semantics, and remaining operational data owners in `docs/company-operating-system/intelligence-operations.md`.

- [ ] **Step 5: Commit**

```bash
git add apps/studio/tests/e2e/company-operating-system-intelligence.spec.ts apps/studio/tests/visual/company-operating-system/intelligence-operations.spec.ts apps/platform-api/src/modules/operating-system/intelligence-isolation.test.ts docs/company-operating-system/intelligence-operations.md
git commit -m "test(company-os): verify intelligence operations"
```

## Plan 4 Completion Gate

Do not start Plan 5 until memory is workspace-scoped and redacted, tool/model visibility is relationship-scoped, activity uses real events, analytics contains no fixed or pseudo values, health uses real/unknown states, privacy tests pass, and every Task 6 command exits 0.
