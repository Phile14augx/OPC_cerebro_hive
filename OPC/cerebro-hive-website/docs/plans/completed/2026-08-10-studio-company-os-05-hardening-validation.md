# Studio Company Operating System — Hardening and Full Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the complete company operating system for production and prove every approved route, workflow, security boundary, responsive mode, accessibility contract, visual target, and performance budget.

**Architecture:** Apply one permission matrix and degraded-state model across the Plan 1–4 API/UI surfaces, remove remaining fabricated shell data visible to the workspace, move heavy layout/search work off the main thread, and validate the complete system with API, unit, accessibility, performance, visual, and end-to-end gates.

**Tech Stack:** Existing Cerebro auth/workspace middleware, Fastify, Prisma, React 19, Next.js 16, React Flow, Web Workers, Vitest, Playwright, repository audit scripts, Turbo/pnpm.

## Global Constraints

- Plans 1–4 completion gates must pass before this plan begins.
- Every approved route and interaction remains in scope; this plan cannot hide failures behind disabled navigation.
- Production contains no demo fallback, random activity, fabricated top-bar notifications/workspaces, pseudo telemetry, fake health, or fake task completion.
- Permission failures reveal no entity names, counts, existence, or cross-workspace identifiers.
- Reduced motion disables particles, continuous pulses, traveling edges, and spatial transitions.
- Performance targets are: interactive under 2.5 seconds on the standard local profile, search under 100 ms after indexing, inspector under 150 ms when cached, no continuous layout task above 50 ms, 50–60 FPS for demo data, and at least 30 FPS for 500 nodes/1,500 edges.
- The feature is complete only after the full 15-step workflow and all final commands pass.
- Build test-first and commit each task independently without unrelated changes.

---

### Task 1: Enforce a Complete Permission Matrix and Remove Shell Fabrication

**Files:**
- Create: `apps/platform-api/src/modules/operating-system/permissions.ts`
- Modify: `apps/platform-api/src/modules/operating-system/operating-system.routes.ts`
- Create: `apps/platform-api/src/modules/operating-system/permissions.test.ts`
- Modify: `packages/auth/src/types/index.ts`
- Modify: `packages/auth/src/rbac/permissions.ts`
- Modify: `apps/studio/app/(platform)/app/components/Topbar.tsx`
- Modify: `apps/studio/components/providers/AuthProvider.tsx`
- Modify: `apps/studio/lib/platform/api-client.ts`
- Create: `apps/studio/features/company-operating-system/components/shell/WorkspaceStatus.tsx`
- Create: `apps/studio/features/company-operating-system/components/shell/WorkspaceStatus.test.tsx`

**Interfaces:**
- Produces: read/write/execute permission constants for graph, agents, tasks, personas, funnels, memory, inventory, activity, analytics, and commands.
- Produces: real current-user, workspace, and notification/activity state in the Studio shell.

- [ ] **Step 1: Write failing permission and no-fabrication tests**

```ts
it.each([
  ["GET", "/api/operating-system/graph", "company-os:graph_read"],
  ["POST", "/api/operating-system/commands", "company-os:commands_execute"],
  ["PATCH", `/api/operating-system/personas/${PERSONA_ID}`, "company-os:personas_write"],
  ["GET", `/api/operating-system/memory/${MEMORY_ID}`, "company-os:memory_read"],
])("requires %s %s permission %s", async (method, url, permission) => {
  const response = await app.inject({ method, url, headers: authHeadersWithout(permission) });
  expect(response.statusCode).toBe(403);
});
```

```tsx
it("shows an honest empty notification state instead of seeded events", async () => {
  server.use(emptyCurrentWorkspace, emptyActivity);
  render(<WorkspaceStatus />);
  expect(await screen.findByText("No recent activity")).toBeVisible();
  expect(screen.queryByText("HiveSwarm run completed")).toBeNull();
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm --filter @cerebro/platform-api test -- permissions.test.ts`

Expected: FAIL until every route is permission-gated.

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/components/shell/WorkspaceStatus.test.tsx`

Expected: FAIL while top-bar state remains seeded.

- [ ] **Step 3: Implement the permission matrix**

```ts
export const CompanyOsPermission = {
  GraphRead: "company-os:graph_read",
  AgentsRead: "company-os:agents_read",
  TasksRead: "company-os:tasks_read",
  TasksWrite: "company-os:tasks_write",
  CommandsExecute: "company-os:commands_execute",
  PersonasRead: "company-os:personas_read",
  PersonasWrite: "company-os:personas_write",
  PersonaPromptRead: "company-os:personas_prompt_read",
  FunnelsRead: "company-os:funnels_read",
  FunnelsWrite: "company-os:funnels_write",
  MemoryList: "company-os:memory_list",
  MemoryRead: "company-os:memory_read",
  InventoryRead: "company-os:inventory_read",
  ActivityRead: "company-os:activity_read",
  AnalyticsRead: "company-os:analytics_read",
} as const;
```

Apply `requirePermission` at route or plugin scope and retain repository workspace filters as defense in depth.

- [ ] **Step 4: Replace mock shell workspaces and notifications**

Remove `WORKSPACES` and `SEED_NOTIFICATIONS` from `Topbar.tsx`. Configure `AuthProvider` from the real current-user/workspace API, populate the switcher from accessible workspaces, validate changes server-side, and populate notifications from the operating-system activity endpoint. Empty/error states must be visible and recoverable.

- [ ] **Step 5: Run tests, typechecks, and builds**

Run: `pnpm --filter @cerebro/auth typecheck && pnpm --filter @cerebro/platform-api test -- permissions.test.ts && pnpm --filter @cerebro/platform-api build`

Expected: PASS.

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/components/shell/WorkspaceStatus.test.tsx && pnpm --filter @cerebro/studio typecheck && pnpm --filter @cerebro/studio build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/platform-api/src/modules/operating-system packages/auth/src apps/studio/app/'(platform)'/app/components/Topbar.tsx apps/studio/components/providers/AuthProvider.tsx apps/studio/lib/platform/api-client.ts apps/studio/features/company-operating-system/components/shell
git commit -m "fix(company-os): enforce permissions and real shell state"
```

### Task 2: Complete Command History, Document Drop, and Degraded-State Handling

**Files:**
- Modify: `apps/platform-api/src/modules/operating-system/OperatingCommandService.ts`
- Modify: `apps/platform-api/src/modules/operating-system/operating-system.routes.ts`
- Create: `apps/platform-api/src/modules/operating-system/command-history.routes.test.ts`
- Modify: `apps/studio/features/company-operating-system/components/command/OperatingCommandBar.tsx`
- Create: `apps/studio/features/company-operating-system/components/command/CommandHistory.tsx`
- Create: `apps/studio/features/company-operating-system/components/command/DocumentDropTarget.tsx`
- Create: `apps/studio/features/company-operating-system/components/command/DocumentDropTarget.test.tsx`
- Create: `apps/studio/features/company-operating-system/components/states/OperatingStateBoundary.tsx`
- Create: `apps/studio/features/company-operating-system/components/states/OperatingStateBoundary.test.tsx`
- Modify: `apps/studio/features/company-operating-system/data/client.ts`

**Interfaces:**
- Produces: server-command history from safe `CommandSubmitted`/task events.
- Produces: document drop through the existing Archive upload/ingestion pipeline.
- Produces: consistent loading, empty, partial, permission, disconnected, and failure handling.

- [ ] **Step 1: Write failing document and degraded-state tests**

```tsx
it("rejects unsupported files before upload", async () => {
  render(<DocumentDropTarget onUploaded={vi.fn()} />);
  await user.upload(screen.getByLabelText("Drop documents"), new File(["x"], "script.exe", { type: "application/octet-stream" }));
  expect(await screen.findByText("Supported files: PDF, TXT, and Markdown")).toBeVisible();
});

it("preserves graph interaction when the event stream disconnects", () => {
  render(<OperatingStateBoundary graph={snapshot} streamState="disconnected"><CompanyBrainCanvas snapshot={snapshot} /></OperatingStateBoundary>);
  expect(screen.getByText("Live updates disconnected")).toBeVisible();
  expect(screen.getByRole("button", { name: "Fit graph" })).toBeEnabled();
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/components/command/DocumentDropTarget.test.tsx features/company-operating-system/components/states/OperatingStateBoundary.test.tsx`

Expected: FAIL because the components are missing.

- [ ] **Step 3: Implement command history**

Server commands append a sanitized `CommandSubmitted` event and link to the resulting task/execution. `GET /api/operating-system/commands/history` returns cursor-paginated safe summaries. Local navigation commands retain the most recent 50 entries in workspace-keyed browser storage and are labeled `Local`.

- [ ] **Step 4: Implement document drop using Archive**

Accept PDF, TXT, and Markdown within the existing upload size limit. Upload through the existing Archive API, wait for the persisted document identifier, then include `{ documentIds: string[] }` in the validated command input. Display per-file queued/uploading/processing/ready/failed states. Do not store file contents in command history, graph metadata, or logs.

- [ ] **Step 5: Apply the shared degraded-state boundary to every route**

For each route, explicitly distinguish initial loading, refetching, empty, partial source failure, permission denied, event-stream disconnected, not found, validation conflict, and fatal error. Partial failures render healthy source data plus a named unavailable-source notice; production errors never activate demo mode.

- [ ] **Step 6: Run tests and builds**

Run: `pnpm --filter @cerebro/platform-api test -- command-history.routes.test.ts && pnpm --filter @cerebro/platform-api build`

Expected: PASS.

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/components/command/DocumentDropTarget.test.tsx features/company-operating-system/components/states/OperatingStateBoundary.test.tsx && pnpm --filter @cerebro/studio build`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/platform-api/src/modules/operating-system apps/studio/features/company-operating-system/components/command apps/studio/features/company-operating-system/components/states apps/studio/features/company-operating-system/data/client.ts
git commit -m "feat(company-os): complete commands uploads and degraded states"
```

### Task 3: Complete Responsive, Keyboard, Screen-Reader, and Reduced-Motion Behavior

**Files:**
- Create: `apps/studio/features/company-operating-system/accessibility/spatialNavigation.ts`
- Create: `apps/studio/features/company-operating-system/accessibility/spatialNavigation.test.ts`
- Create: `apps/studio/features/company-operating-system/accessibility/OperatingAnnouncements.tsx`
- Modify: `apps/studio/features/company-operating-system/components/shell/OperatingSystemShell.tsx`
- Modify: `apps/studio/features/company-operating-system/components/graph/CompanyBrainCanvas.tsx`
- Modify: `apps/studio/features/company-operating-system/components/graph/AccessibleEntityTree.tsx`
- Modify: `apps/studio/features/company-operating-system/components/inspector/EntityInspector.tsx`
- Modify: `apps/studio/app/theme/motion.css`
- Create: `apps/studio/tests/e2e/company-operating-system-accessibility.spec.ts`

**Interfaces:**
- Produces: spatial arrow-key navigation, focus restoration, live announcements, bottom-sheet mobile inspectors, and reduced-motion parity.

- [ ] **Step 1: Write failing spatial-navigation tests**

```ts
it("moves to the nearest node to the right", () => {
  expect(findSpatialNeighbor(nodes, "agent-a", "right")?.id).toBe("agent-b");
});

it("returns null when no node exists in the requested direction", () => {
  expect(findSpatialNeighbor(nodes, "rightmost", "right")).toBeNull();
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/accessibility/spatialNavigation.test.ts`

Expected: FAIL because accessibility helpers do not exist.

- [ ] **Step 3: Implement keyboard and focus contracts**

Implement `/` search, Enter activate, Shift+Enter multi-select, arrow spatial navigation, Escape overlay→focus→selection dismissal, Tab through toolbar/command/inspector, and focus restoration to the originating node. Accessible entity tree actions must perform the same selection, focus, and inspector operations as the canvas.

- [ ] **Step 4: Implement announcements and responsive presentation**

Announce selection, command lifecycle, task lifecycle, stream connection, errors, and item movement through polite live regions. Desktop uses right inspectors; tablet uses floating panels; mobile uses full-height graph, compact command bar, bottom navigation, and modal bottom sheets. Limit labels by zoom and focus rather than CSS clipping.

- [ ] **Step 5: Implement reduced-motion parity**

Use the existing motion accessibility utility and CSS media query. Disable core particles, continuous pulses, traveling edges, animated layout transitions, and funnel travel; replace them with opacity changes no longer than 150 ms. Functional state and announcements remain identical.

- [ ] **Step 6: Write and run keyboard/mobile/reduced-motion browser tests**

```ts
test("keyboard-only user can inspect an agent", async ({ page }) => {
  await page.goto("/app/brain?mode=demo&motion=reduced");
  await page.keyboard.press("/");
  await page.keyboard.type("builder");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: /agent inspector/i })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: /agent inspector/i })).toBeHidden();
});
```

Run: `pnpm --filter @cerebro/studio test:e2e -- tests/e2e/company-operating-system-accessibility.spec.ts --project=chromium`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/studio/features/company-operating-system/accessibility apps/studio/features/company-operating-system/components apps/studio/app/theme/motion.css apps/studio/tests/e2e/company-operating-system-accessibility.spec.ts
git commit -m "feat(company-os): complete accessible responsive behavior"
```

### Task 4: Meet Graph Search, Layout, and Rendering Performance Budgets

**Files:**
- Create: `apps/studio/features/company-operating-system/graph/layout.worker.ts`
- Create: `apps/studio/features/company-operating-system/graph/useLayoutWorker.ts`
- Modify: `apps/studio/features/company-operating-system/graph/searchIndex.ts`
- Create: `apps/studio/features/company-operating-system/graph/searchIndex.test.ts`
- Modify: `apps/studio/features/company-operating-system/graph/toReactFlow.ts`
- Modify: `apps/studio/features/company-operating-system/components/graph/CompanyBrainCanvas.tsx`
- Create: `apps/studio/features/company-operating-system/testing/stressGraph.ts`
- Create: `apps/studio/tests/performance/company-operating-system.perf.spec.ts`

**Interfaces:**
- Produces: cancellable worker layout requests keyed by graph revision and viewport.
- Produces: indexed search and incremental graph event patches for 500 nodes/1,500 edges.

- [ ] **Step 1: Write failing deterministic stress tests**

```ts
it("builds and queries a 500-node search index within budget", () => {
  const graph = createStressGraph({ nodes: 500, edges: 1500, seed: 42 });
  const index = buildSearchIndex(graph.nodes);
  const started = performance.now();
  const result = index.search("research agent");
  expect(performance.now() - started).toBeLessThan(100);
  expect(result.length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run tests and record baseline failure**

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/graph/searchIndex.test.ts`

Expected: FAIL until the stress index and bounded query implementation exist.

- [ ] **Step 3: Move large layouts to a cancellable worker**

For graphs above 120 nodes, send serializable nodes/edges and layout mode to `layout.worker.ts`. Include `requestId` and graph revision; discard stale replies. Keep small layouts synchronous to avoid worker overhead. Chunk any pre-layout normalization that exceeds 50 ms.

- [ ] **Step 4: Implement indexed search and incremental patches**

Normalize lowercased label, type, department, tags, and safe summary terms once per graph revision. Search uses token intersection plus prefix fallback. Event projection patches affected node/edge data by ID and preserves React Flow object identity for unaffected elements.

- [ ] **Step 5: Apply progressive rendering**

Hide non-focused outer labels below configured zoom, enable minimap only above 120 visible nodes, disable unnecessary edge animation above 400 visible edges, and virtualize non-graph tables. Preserve all data in the accessible tree with collapsed groups.

- [ ] **Step 6: Run performance tests**

Run: `pnpm --filter @cerebro/studio test:e2e -- tests/performance/company-operating-system.perf.spec.ts --project=chromium`

Expected: interactive under 2.5 seconds, search under 100 ms, cached inspector under 150 ms, demo 50–60 FPS, stress graph at least 30 FPS, and no continuous layout long task above 50 ms.

- [ ] **Step 7: Commit**

```bash
git add apps/studio/features/company-operating-system/graph apps/studio/features/company-operating-system/components/graph/CompanyBrainCanvas.tsx apps/studio/features/company-operating-system/testing/stressGraph.ts apps/studio/tests/performance/company-operating-system.perf.spec.ts
git commit -m "perf(company-os): meet graph performance budgets"
```

### Task 5: Add Complete Visual Coverage and the Approved 15-Step Journey

**Files:**
- Modify: `apps/studio/playwright.config.ts`
- Create: `apps/studio/tests/e2e/company-operating-system-full-journey.spec.ts`
- Create: `apps/studio/tests/visual/company-operating-system/all-routes.spec.ts`
- Create: `apps/studio/tests/visual/company-operating-system/recording-parity.spec.ts`
- Create: `apps/studio/tests/visual/company-operating-system/__snapshots__/` generated baselines

**Interfaces:**
- Consumes: every approved route and workflow from Plans 1–4.
- Produces: complete acceptance and visual regression evidence.

- [ ] **Step 1: Expand Playwright matching without dropping current tests**

Set `testMatch` to:

```ts
testMatch: ["**/visual/**/*.spec.ts", "**/e2e/**/*.spec.ts", "**/performance/**/*.spec.ts"],
```

Add named desktop projects for 1920×1080, 1600×900, and 1440×900 while retaining Chromium, Firefox, WebKit, Pixel 5, and iPhone 12 coverage.

- [ ] **Step 2: Write the complete 15-step journey**

The test must perform, not merely assert links for:

```text
1. Open Company Brain.
2. Pan the graph.
3. Zoom into a department.
4. Select an agent.
5. Open its inspector.
6. Create a task.
7. Observe a real task/graph event.
8. Inspect task steps and artifacts.
9. Navigate to Personas.
10. Edit and persist a persona.
11. Navigate to Funnel.
12. Inspect a persisted pipeline stage.
13. Navigate to Hierarchy.
14. Select a department leader.
15. Return to Company Brain and verify focus/filter state restoration.
```

Use seeded test database records through test setup, not demo-mode client timers. Wait on API responses and persisted events rather than arbitrary timeouts.

- [ ] **Step 3: Add visual route matrix**

Capture brain, departments, department detail, agents, agent detail, tasks, task detail, personas, persona detail, funnels, hierarchy, memory, tools, models, activity, and analytics at three desktop sizes plus tablet/mobile representative sizes. Capture live-empty, demo-populated, inspector-open, filter-open, error, and reduced-motion states.

- [ ] **Step 4: Add recording-parity assertions**

Assert graph dominance, visible left navigation, compact command bar, subtle grid, hairline panels, department accents, centered core, translucent inspector, restrained radii/shadows, and progressive labels using stable data attributes and screenshots.

- [ ] **Step 5: Generate and review baselines, then run browser matrix**

Run: `pnpm --filter @cerebro/studio test:e2e -- tests/visual/company-operating-system --project=desktop-1440`

Expected: reviewed baselines are generated once, then pass unchanged.

Run: `pnpm --filter @cerebro/studio test:e2e -- tests/e2e/company-operating-system-full-journey.spec.ts --project=chromium`

Expected: all 15 steps pass.

- [ ] **Step 6: Commit**

```bash
git add apps/studio/playwright.config.ts apps/studio/tests/e2e/company-operating-system-full-journey.spec.ts apps/studio/tests/visual/company-operating-system apps/studio/tests/performance
git commit -m "test(company-os): add full journey and visual matrix"
```

### Task 6: Run Final Quality Gates and Publish the Implementation Report

**Files:**
- Create: `docs/company-operating-system/IMPLEMENTATION-REPORT.md`
- Modify: `docs/company-operating-system/foundation-and-brain.md`
- Modify: `docs/company-operating-system/execution-domains.md`
- Modify: `docs/company-operating-system/organizational-views.md`
- Modify: `docs/company-operating-system/intelligence-operations.md`

**Interfaces:**
- Consumes: the complete five-plan implementation.
- Produces: final routes, data model, graph engine, realtime, files, dependency, and test evidence.

- [ ] **Step 1: Run generated/schema validation**

Run:

```bash
pnpm --filter @cerebro/db generate
pnpm --filter @cerebro/db typecheck
pnpm prisma:validate
```

Expected: every command exits 0.

- [ ] **Step 2: Run backend tests and build**

Run:

```bash
pnpm --filter @cerebro/platform-api test
pnpm --filter @cerebro/platform-api build
```

Expected: every command exits 0 with no operating-system test skips.

- [ ] **Step 3: Run Studio unit, lint, typecheck, and production build**

Run:

```bash
pnpm --filter @cerebro/studio test:unit
pnpm --filter @cerebro/studio lint
pnpm --filter @cerebro/studio typecheck
pnpm --filter @cerebro/studio build
```

Expected: every command exits 0.

- [ ] **Step 4: Run browser, accessibility, visual, and performance gates**

Run:

```bash
pnpm --filter @cerebro/studio test:e2e -- tests/e2e/company-operating-system-full-journey.spec.ts --project=chromium
pnpm --filter @cerebro/studio test:e2e -- tests/e2e/company-operating-system-accessibility.spec.ts --project=chromium
pnpm --filter @cerebro/studio test:e2e -- tests/visual/company-operating-system --project=desktop-1440
pnpm --filter @cerebro/studio test:e2e -- tests/performance/company-operating-system.perf.spec.ts --project=chromium
pnpm --filter @cerebro/studio audit:enterprise
```

Expected: every command exits 0 and all performance assertions meet the specified values.

- [ ] **Step 5: Run repository-wide affected gates**

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected: every command exits 0. If an unrelated pre-existing failure remains, record its exact command, file, and evidence without weakening the company-operating-system gates.

- [ ] **Step 6: Write the final implementation report**

`IMPLEMENTATION-REPORT.md` must include:

- architecture and data flow;
- every implemented route;
- persistent entities and migrations;
- React Flow/ELK/layout responsibilities;
- realtime event and polling behavior;
- live versus demo rules;
- major files and dependencies;
- security and privacy controls;
- install, lint, typecheck, unit, integration, E2E, visual, accessibility, performance, build, and runtime results with commands and dates;
- known out-of-scope items only if they were explicitly excluded by the approved design.

- [ ] **Step 7: Commit documentation and final fixes**

```bash
git add docs/company-operating-system
git commit -m "docs(company-os): publish implementation evidence"
```

If verification exposes an implementation defect, return to the owning task, add a focused regression test, commit the narrow fix there, rerun the affected gate, and only then commit this report.

## Plan 5 Completion Gate

The company operating system is complete only when all 16 approved routes work, every production screen uses real or honest empty data, tenant/permission/privacy tests pass, document drop and command history work, responsive/accessibility/reduced-motion contracts pass, performance budgets pass, all 15 journey steps pass, visual parity is reviewed, and every applicable Task 6 command exits 0.
