# Studio Company Operating System — Foundation and Company Brain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the shared operating-system foundation and a production-integrated `/app/brain` experience with real graph data, explicit demo mode, graph interaction, inspectors, commands, and live activity.

**Architecture:** Add shared contracts in `@cerebro/shared-types`, tenant-scoped persistence and aggregation in `@cerebro/db`, authenticated endpoints in `apps/platform-api`, and a feature-bounded React Flow workspace in `apps/studio`. Keep the existing Studio shell and add a nested edge-to-edge operating-system layout only for designated routes.

**Tech Stack:** Next.js 16, React 19, TypeScript, Fastify 5, Prisma 7/PostgreSQL, TanStack Query, `@xyflow/react` 12, ELK 0.11, Framer Motion 12, Zustand 5, Zod 3, Vitest 3, Testing Library, Playwright 1.61.

## Global Constraints

- Target application is `apps/studio`; backend aggregation belongs to the existing `apps/platform-api` protected route group.
- Preserve Studio authentication, tenancy, top bar, sidebar, and unrelated routes.
- Production never silently falls back to demo or fabricated operational data.
- Demo mode requires a non-production runtime and an explicit flag and must display `DEMO DATA`.
- Use React Flow, deterministic layout functions, ELK, and Framer Motion already installed; do not add Three.js or WebGL.
- Keep graph entities authorization-safe: never expose secrets, prompts, document contents, raw memory contents, credentials, or handler code.
- Every API query and mutation must use verified `RequestContext.tenantId` and a workspace validated by `WorkspaceAccessMiddleware`.
- Build test-first and commit each task independently without including unrelated dirty-worktree changes.
- This plan is Plan 1 of 5. Plans 2–5 remain required before the full feature is complete.

---

### Task 1: Add Operating-System Contracts and Unit-Test Configuration

**Files:**
- Create: `packages/shared-types/src/domain/operating-system.ts`
- Modify: `packages/shared-types/src/index.ts`
- Create: `apps/studio/vitest.unit.config.ts`
- Create: `apps/studio/vitest.setup.ts`
- Modify: `apps/studio/package.json`
- Modify: `pnpm-lock.yaml`
- Create: `apps/studio/features/company-operating-system/domain/contracts.test.ts`

**Interfaces:**
- Produces: `OperatingNode`, `OperatingEdge`, `OperatingGraphSnapshot`, `OperatingCommand`, `OperatingEvent`, `EntityDetail`, `DemoMode`.
- Produces: `isOperatingNodeType(value: unknown): value is OperatingNodeType`.
- Consumes: no feature-local interfaces.

- [ ] **Step 1: Write the failing contract test**

```ts
import { describe, expect, it } from "vitest";
import { isOperatingNodeType } from "@cerebro/shared-types";

describe("operating-system contracts", () => {
  it("accepts only supported graph node categories", () => {
    expect(isOperatingNodeType("agent")).toBe(true);
    expect(isOperatingNodeType("memory")).toBe(true);
    expect(isOperatingNodeType("dashboard-card")).toBe(false);
    expect(isOperatingNodeType(null)).toBe(false);
  });
});
```

- [ ] **Step 2: Add a dedicated Studio unit-test project and verify the test fails**

```ts
// apps/studio/vitest.unit.config.ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
  test: {
    environment: "jsdom",
    include: ["features/**/*.test.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

Add `"test:unit": "vitest run --config vitest.unit.config.ts"` to Studio scripts.

Declare Studio-local test dependencies so pnpm strict resolution does not rely on the workspace root:

```bash
pnpm --filter @cerebro/studio add -D vitest@3.2.4 jsdom@26.1.0 @testing-library/react@16.3.2 @testing-library/jest-dom@6.9.1
```

Create `apps/studio/vitest.setup.ts` with:

```ts
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());
```

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/domain/contracts.test.ts`

Expected: FAIL because `isOperatingNodeType` is not exported.

- [ ] **Step 3: Implement the shared contracts**

```ts
export const OPERATING_NODE_TYPES = [
  "department", "agent", "tool", "model", "skill", "data-source",
  "memory", "workflow", "task", "output", "human", "system", "integration",
] as const;

export type OperatingNodeType = (typeof OPERATING_NODE_TYPES)[number];
export type OperatingStatus = "healthy" | "idle" | "running" | "degraded" | "failed" | "offline";
export type OperatingRelationship =
  | "REPORTS_TO" | "COLLABORATES_WITH" | "USES" | "DELEGATES_TO"
  | "READS_FROM" | "WRITES_TO" | "SHARES_MEMORY_WITH" | "TRIGGERS"
  | "DEPENDS_ON" | "PRODUCES";

export interface OperatingNode {
  id: string;
  type: OperatingNodeType;
  label: string;
  status: OperatingStatus;
  departmentId: string | null;
  detailUrl: string;
  tags: string[];
  health: { score: number | null; lastActivityAt: string | null };
  summary: Record<string, string | number | boolean | null>;
}

export interface OperatingEdge {
  id: string;
  source: string;
  target: string;
  relationship: OperatingRelationship;
  status: OperatingStatus;
  lastActivityAt: string | null;
  intensity: number;
}

export interface OperatingGraphSnapshot {
  revision: string;
  generatedAt: string;
  mode: "live" | "demo";
  nodes: OperatingNode[];
  edges: OperatingEdge[];
}

export type DemoMode = "live" | "demo";

export interface OperatingCommand {
  id: string;
  kind: "local" | "create-task" | "execute-agent";
  text: string;
  targetType: OperatingNodeType | null;
  targetId: string | null;
  state: "parsing" | "validating" | "dispatched" | "running" | "completed" | "failed" | "cancelled";
}

export interface OperatingEvent {
  id: string;
  type: string;
  workspaceId: string;
  entityType: OperatingNodeType | "command" | "funnel-item";
  entityId: string;
  occurredAt: string;
  status: OperatingStatus;
  summary: Record<string, string | number | boolean | null>;
}

export interface EntityDetail {
  node: OperatingNode;
  metrics: Record<string, number | null>;
  relationships: OperatingEdge[];
  actions: Array<{ id: string; label: string; href?: string }>;
}

export function isOperatingNodeType(value: unknown): value is OperatingNodeType {
  return typeof value === "string" && (OPERATING_NODE_TYPES as readonly string[]).includes(value);
}
```

Define the remaining command, event, entity-detail, and demo-mode interfaces in the same file and export it from `packages/shared-types/src/index.ts`.

- [ ] **Step 4: Run the contract test and typechecks**

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/domain/contracts.test.ts`

Expected: PASS.

Run: `pnpm typecheck:root && pnpm --filter @cerebro/studio typecheck`

Expected: both commands exit 0.

- [ ] **Step 5: Commit**

```bash
git add packages/shared-types/src/domain/operating-system.ts packages/shared-types/src/index.ts apps/studio/vitest.unit.config.ts apps/studio/vitest.setup.ts apps/studio/package.json apps/studio/features/company-operating-system/domain/contracts.test.ts pnpm-lock.yaml
git commit -m "feat(company-os): add shared graph contracts"
```

### Task 2: Add Tenant-Scoped Department and Relationship Persistence

**Files:**
- Modify: `packages/db/prisma/schema.prisma`
- Create: `packages/db/prisma/migrations/20260809_company_operating_system_foundation/migration.sql`
- Create: `packages/db/src/repositories/OperatingSystemRepository.ts`
- Modify: `packages/db/index.ts`
- Create: `packages/db/src/repositories/OperatingSystemRepository.test.ts`

**Interfaces:**
- Consumes: `RequestContext` from `packages/db/src/repositories/context.ts`.
- Produces: `OperatingSystemRepository.getGraphSnapshot(options: IRepositoryOptions): Promise<OperatingGraphSnapshot>`.
- Produces: `OperatingSystemRepository.getEntityDetail(type: OperatingNodeType, id: string, options: IRepositoryOptions): Promise<EntityDetail | null>`.

- [ ] **Step 1: Write repository tests for workspace isolation and safe projection**

```ts
it("never returns an agent from another workspace", async () => {
  const snapshot = await repository.getGraphSnapshot(opts("workspace-a"));
  expect(snapshot.nodes.some((node) => node.id === "agent-workspace-b")).toBe(false);
});

it("does not project instructions or tool handler code", async () => {
  const snapshot = await repository.getGraphSnapshot(opts("workspace-a"));
  expect(JSON.stringify(snapshot)).not.toContain("system prompt secret");
  expect(JSON.stringify(snapshot)).not.toContain("handlerCode");
});
```

Use a typed fake Prisma client injected through `IRepositoryOptions.transaction` so the test does not require a database.

- [ ] **Step 2: Run the repository test and verify it fails**

Run: `pnpm exec vitest run packages/db/src/repositories/OperatingSystemRepository.test.ts`

Expected: FAIL because `OperatingSystemRepository` and schema relations do not exist.

- [ ] **Step 3: Add the minimum persistence models**

Add these models and relations, using UUID workspace IDs and cascade deletion:

```prisma
model OperatingDepartment {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  workspaceId   String   @db.Uuid
  workspace     Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  name          String
  slug          String
  description   String?
  theme         String
  leaderAgentId String?  @db.Uuid
  metadata      Json?
  agents        Agent[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@unique([workspaceId, slug])
  @@index([workspaceId])
}

model OperatingGraphRelationship {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  workspaceId    String   @db.Uuid
  workspace      Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  sourceType     String
  sourceId       String
  targetType     String
  targetId       String
  relationship   String
  status         String   @default("healthy")
  metadata       Json?
  lastActivityAt DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  @@unique([workspaceId, sourceType, sourceId, targetType, targetId, relationship])
  @@index([workspaceId, sourceId])
  @@index([workspaceId, targetId])
}

model OperatingActivityEvent {
  id          BigInt   @id @default(autoincrement())
  workspaceId String   @db.Uuid
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  eventType   String
  entityType  String
  entityId    String
  actorId     String?
  status      String
  summary     Json
  occurredAt  DateTime @default(now())
  @@index([workspaceId, id])
  @@index([workspaceId, eventType, occurredAt])
}
```

Add `operatingDepartments`, `operatingRelationships`, and `operatingActivityEvents` relations to `Workspace`. Add nullable `departmentId`, `department OperatingDepartment?`, and an index to `Agent`; validate the referenced department belongs to the same workspace in the repository and service layer.

- [ ] **Step 4: Implement the repository projection**

```ts
export class OperatingSystemRepository extends BaseRepository {
  async getGraphSnapshot(options: IRepositoryOptions): Promise<OperatingGraphSnapshot> {
    const db = this.getClient(options);
    const { workspaceId } = this.workspaceFilter(options.context);
    const [departments, agents, workflows, relationships] = await Promise.all([
      db.operatingDepartment.findMany({ where: { workspaceId } }),
      db.agent.findMany({ where: { workspaceId }, include: { versions: { take: 1, orderBy: { version: "desc" }, include: { tools: { include: { toolVersion: { include: { tool: true } } } }, model: true } } } }),
      db.workflow.findMany({ where: { workspaceId }, include: { versions: { take: 1, orderBy: { version: "desc" } } } }),
      db.operatingGraphRelationship.findMany({ where: { workspaceId } }),
    ]);
    return projectOperatingGraph({ workspaceId, departments, agents, workflows, relationships });
  }
}
```

Keep `projectOperatingGraph` private to the repository module and map only the safe summary fields from the shared contract.

- [ ] **Step 5: Generate Prisma, run tests, and validate the schema**

Run: `pnpm --filter @cerebro/db generate`

Expected: Prisma client generation succeeds.

Run: `pnpm --filter @cerebro/db typecheck && pnpm exec vitest run packages/db/src/repositories/OperatingSystemRepository.test.ts`

Expected: typecheck and tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/db/prisma/schema.prisma packages/db/prisma/migrations/20260809_company_operating_system_foundation/migration.sql packages/db/src/repositories/OperatingSystemRepository.ts packages/db/src/repositories/OperatingSystemRepository.test.ts packages/db/index.ts
git commit -m "feat(company-os): persist departments and graph relationships"
```

### Task 3: Expose Authenticated Graph and Entity APIs with Explicit Demo Mode

**Files:**
- Create: `apps/platform-api/src/modules/operating-system/OperatingSystemService.ts`
- Create: `apps/platform-api/src/modules/operating-system/demoGraph.ts`
- Create: `apps/platform-api/src/modules/operating-system/operating-system.routes.ts`
- Create: `apps/platform-api/src/modules/operating-system/operating-system.routes.test.ts`
- Modify: `apps/platform-api/src/bootstrap.ts`
- Modify: `apps/platform-api/src/server.ts`

**Interfaces:**
- Consumes: `OperatingSystemRepository.getGraphSnapshot()` and `getEntityDetail()`.
- Produces: `GET /api/operating-system/graph?mode=live|demo`.
- Produces: `GET /api/operating-system/entities/:type/:id`.

- [ ] **Step 1: Write route injection tests**

```ts
it("rejects demo mode in production", async () => {
  process.env.NODE_ENV = "production";
  const response = await app.inject({ method: "GET", url: "/api/operating-system/graph?mode=demo", headers: authHeaders() });
  expect(response.statusCode).toBe(403);
  expect(response.json().error).toBe("DEMO_MODE_DISABLED");
});

it("returns a live snapshot for the verified workspace", async () => {
  const response = await app.inject({ method: "GET", url: "/api/operating-system/graph", headers: authHeaders("workspace-a") });
  expect(response.statusCode).toBe(200);
  expect(response.json().data.mode).toBe("live");
});
```

- [ ] **Step 2: Run the route test and verify it fails**

Run: `pnpm --filter @cerebro/platform-api test -- operating-system.routes.test.ts`

Expected: FAIL because the route plugin is not registered.

- [ ] **Step 3: Implement the service and demo gate**

```ts
export class OperatingSystemService {
  constructor(private readonly repository: OperatingSystemRepository) {}

  getSnapshot(context: RequestContext, mode: DemoMode = "live") {
    if (mode === "demo") {
      if (process.env.NODE_ENV === "production" || process.env.CEREBRO_COMPANY_OS_DEMO !== "enabled") {
        throw new DemoModeDisabledError();
      }
      return Promise.resolve(createDemoGraphSnapshot());
    }
    return this.repository.getGraphSnapshot({ context });
  }
}
```

The demo snapshot must contain all supported node categories needed for visual validation, stable IDs, semantic edges, and `mode: "demo"`. It must not be imported by the live repository.

- [ ] **Step 4: Register protected routes**

Register the plugin inside the existing authenticated and workspace-validated `protectedApi` block:

```ts
protectedApi.register(operatingSystemRoutes, {
  prefix: "/api/operating-system",
  operatingSystemService: deps.operatingSystemService,
});
```

Add `operatingSystemService` to `BootstrapDeps` and instantiate it in `apps/platform-api/src/server.ts` with `OperatingSystemRepository`.

- [ ] **Step 5: Run API tests and typecheck**

Run: `pnpm --filter @cerebro/platform-api test -- operating-system.routes.test.ts`

Expected: PASS.

Run: `pnpm --filter @cerebro/platform-api build`

Expected: TypeScript build succeeds.

- [ ] **Step 6: Commit**

```bash
git add apps/platform-api/src/modules/operating-system apps/platform-api/src/bootstrap.ts apps/platform-api/src/server.ts
git commit -m "feat(company-os): expose graph snapshot API"
```

### Task 4: Add the Studio Data Client, Navigation Entry, and Workspace Shell

**Files:**
- Create: `apps/studio/features/company-operating-system/data/client.ts`
- Create: `apps/studio/features/company-operating-system/data/queries.ts`
- Create: `apps/studio/features/company-operating-system/components/shell/OperatingSystemShell.tsx`
- Create: `apps/studio/features/company-operating-system/components/shell/OperatingSystemShell.test.tsx`
- Create: `apps/studio/app/(platform)/app/(operating-system)/layout.tsx`
- Create: `apps/studio/app/(platform)/app/(operating-system)/brain/page.tsx`
- Modify: `apps/studio/app/(platform)/app/navigation/index.ts`
- Modify: `apps/studio/app/(platform)/app/components/PlatformLayoutClient.tsx`
- Modify: `apps/studio/app/theme/colors.css`
- Modify: `apps/studio/app/theme/motion.css`
- Modify: `apps/studio/lib/platform/api-client.ts`

**Interfaces:**
- Consumes: graph and entity endpoints from Task 3.
- Produces: `operatingSystemClient.getGraph(mode)` and `getEntityDetail(type, id)`.
- Produces: edge-to-edge `OperatingSystemShell` and `/app/brain` route.

- [ ] **Step 1: Write shell and data-client tests**

```tsx
it("labels explicit demo data", () => {
  render(<OperatingSystemShell mode="demo"><div>Graph</div></OperatingSystemShell>);
  expect(screen.getByText("DEMO DATA")).toBeVisible();
});

it("does not label live data as demo", () => {
  render(<OperatingSystemShell mode="live"><div>Graph</div></OperatingSystemShell>);
  expect(screen.queryByText("DEMO DATA")).toBeNull();
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/components/shell/OperatingSystemShell.test.tsx`

Expected: FAIL because the shell does not exist.

- [ ] **Step 3: Implement the typed client and queries**

```ts
export const operatingSystemClient = {
  getGraph(mode: DemoMode = "live") {
    return platformRequest<{ data: OperatingGraphSnapshot }>(`/api/operating-system/graph?mode=${mode}`);
  },
  getEntityDetail(type: OperatingNodeType, id: string) {
    return platformRequest<{ data: EntityDetail }>(`/api/operating-system/entities/${type}/${encodeURIComponent(id)}`);
  },
};

export function useOperatingGraph(mode: DemoMode) {
  return useQuery({ queryKey: ["company-os", "graph", mode], queryFn: () => operatingSystemClient.getGraph(mode), staleTime: 15_000 });
}
```

Export the existing core request function from `apps/studio/lib/platform/api-client.ts` as `platformRequest`, and extend its runtime context configuration to always send the validated `X-Workspace-ID` selected by Studio.

- [ ] **Step 4: Implement the nested shell and route-aware outer spacing**

`OperatingSystemShell` renders a command/header slot, main visualization slot, inspector portal, live-status strip, and mobile bottom navigation. Add route detection in `PlatformLayoutClient` for the 16 approved operating-system routes so its `<main>` uses `p-0 overflow-hidden`; other routes retain existing padding and scrolling.

Add the Company Brain navigation item:

```ts
{ title: "Company Brain", href: "/app/brain", icon: BrainCircuit }
```

Add CSS variables prefixed `--company-os-*` for canvas, grid, panel, border, text, department accents, success, warning, and failure. Do not hardcode page-local hex colors.

- [ ] **Step 5: Run tests, typecheck, and a route smoke build**

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/components/shell/OperatingSystemShell.test.tsx`

Expected: PASS.

Run: `pnpm --filter @cerebro/studio typecheck && pnpm --filter @cerebro/studio build`

Expected: both commands succeed and `/app/brain` is emitted.

- [ ] **Step 6: Commit**

```bash
git add apps/studio/features/company-operating-system/data apps/studio/features/company-operating-system/components/shell apps/studio/app/'(platform)'/app/'(operating-system)' apps/studio/app/'(platform)'/app/navigation/index.ts apps/studio/app/'(platform)'/app/components/PlatformLayoutClient.tsx apps/studio/app/theme/colors.css apps/studio/app/theme/motion.css apps/studio/lib/platform/api-client.ts
git commit -m "feat(company-os): add Studio operating-system workspace"
```

### Task 5: Implement Deterministic Radial Layout and Workspace State

**Files:**
- Create: `apps/studio/features/company-operating-system/graph/radialLayout.ts`
- Create: `apps/studio/features/company-operating-system/graph/toReactFlow.ts`
- Create: `apps/studio/features/company-operating-system/graph/searchIndex.ts`
- Create: `apps/studio/features/company-operating-system/graph/radialLayout.test.ts`
- Create: `apps/studio/features/company-operating-system/workspace/store.ts`
- Create: `apps/studio/features/company-operating-system/workspace/urlState.ts`
- Create: `apps/studio/features/company-operating-system/workspace/store.test.ts`

**Interfaces:**
- Produces: `layoutCompanyBrain(snapshot, options): PositionedOperatingNode[]`.
- Produces: `toReactFlowGraph(snapshot, positions): { nodes: Node[]; edges: Edge[] }`.
- Produces: `useOperatingWorkspaceStore` and serializable `OperatingWorkspaceUrlState`.

- [ ] **Step 1: Write failing stability and state tests**

```ts
it("returns stable positions for identical snapshots", () => {
  expect(layoutCompanyBrain(snapshot, { width: 1200, height: 800 }))
    .toEqual(layoutCompanyBrain(snapshot, { width: 1200, height: 800 }));
});

it("places departments closer to the core than agents", () => {
  const result = layoutCompanyBrain(snapshot, { width: 1200, height: 800 });
  expect(distance(resultById(result, "department-tech"))).toBeLessThan(distance(resultById(result, "agent-builder")));
});

it("escape clears the inspector before clearing focus", () => {
  const store = createOperatingWorkspaceStore({ selectedId: "agent-a", inspectorId: "agent-a", focusId: "department-tech" });
  store.getState().dismissTopLayer();
  expect(store.getState().inspectorId).toBeNull();
  expect(store.getState().focusId).toBe("department-tech");
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/graph/radialLayout.test.ts features/company-operating-system/workspace/store.test.ts`

Expected: FAIL because layout and store modules do not exist.

- [ ] **Step 3: Implement deterministic layout and conversion**

Use sorted stable IDs, a center core node, the first ring for departments, department-owned arcs for agents, and bounded outer rings for resources. Clamp ring spacing for small viewports. Do not call `Math.random()`.

```ts
export function layoutCompanyBrain(snapshot: OperatingGraphSnapshot, viewport: BrainViewport): PositionedOperatingNode[] {
  const center = { x: viewport.width / 2, y: viewport.height / 2 };
  const departments = snapshot.nodes.filter((node) => node.type === "department").sort(byStableId);
  return [positionCore(snapshot, center), ...positionDepartments(departments, center, viewport), ...positionDepartmentChildren(snapshot, departments, center, viewport)];
}
```

`toReactFlowGraph` maps each category to its custom node type and maps `OperatingRelationship` to the animated semantic edge type without losing the original entity IDs.

- [ ] **Step 4: Implement workspace and URL state**

State must include `selectedIds`, `inspectorId`, `focusId`, `query`, `nodeTypes`, `departments`, `relationships`, `labelsVisible`, `edgesVisible`, and `fullscreen`. Implement `serializeWorkspaceState()` and `parseWorkspaceState()` with Zod validation; invalid URL values return safe defaults.

- [ ] **Step 5: Run unit tests**

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/graph/radialLayout.test.ts features/company-operating-system/workspace/store.test.ts`

Expected: PASS with no snapshot instability.

- [ ] **Step 6: Commit**

```bash
git add apps/studio/features/company-operating-system/graph apps/studio/features/company-operating-system/workspace
git commit -m "feat(company-os): add stable graph layout and workspace state"
```

### Task 6: Build the Company Brain Canvas, Nodes, Edges, Search, and Toolbar

**Files:**
- Create: `apps/studio/features/company-operating-system/components/graph/CompanyBrainCanvas.tsx`
- Create: `apps/studio/features/company-operating-system/components/graph/CompanyCoreNode.tsx`
- Create: `apps/studio/features/company-operating-system/components/graph/DepartmentNode.tsx`
- Create: `apps/studio/features/company-operating-system/components/graph/EntityNode.tsx`
- Create: `apps/studio/features/company-operating-system/components/graph/SemanticEdge.tsx`
- Create: `apps/studio/features/company-operating-system/components/graph/GraphToolbar.tsx`
- Create: `apps/studio/features/company-operating-system/components/graph/GraphSearch.tsx`
- Create: `apps/studio/features/company-operating-system/components/graph/AccessibleEntityTree.tsx`
- Create: `apps/studio/features/company-operating-system/components/graph/CompanyBrainCanvas.test.tsx`
- Create: `apps/studio/features/company-operating-system/components/states/BrainInitialReveal.tsx`
- Create: `apps/studio/features/company-operating-system/components/states/OperatingErrorState.tsx`
- Create: `apps/studio/features/company-operating-system/components/states/OperatingEmptyState.tsx`
- Create: `apps/studio/features/company-operating-system/components/states/OperatingStates.test.tsx`
- Create: `apps/studio/features/company-operating-system/screens/CompanyBrainScreen.tsx`
- Modify: `apps/studio/app/(platform)/app/(operating-system)/brain/page.tsx`

**Interfaces:**
- Consumes: `useOperatingGraph`, `layoutCompanyBrain`, `toReactFlowGraph`, `useOperatingWorkspaceStore`.
- Produces: complete interactive brain visualization and equivalent accessible entity tree.

- [ ] **Step 1: Write failing interaction tests**

```tsx
it("selects a node and highlights its connected edges", async () => {
  render(<CompanyBrainCanvas snapshot={snapshot} />);
  await user.click(screen.getByRole("button", { name: "Agent: Builder" }));
  expect(screen.getByTestId("edge-agent-builder-uses-tool-code")).toHaveAttribute("data-highlighted", "true");
});

it("filters nodes through graph search", async () => {
  render(<CompanyBrainCanvas snapshot={snapshot} />);
  await user.type(screen.getByRole("searchbox", { name: "Search company brain" }), "research");
  expect(screen.getByRole("button", { name: "Department: Research" })).toBeVisible();
  expect(screen.queryByRole("button", { name: "Department: Sales" })).toBeNull();
});
```

- [ ] **Step 2: Run the interaction test and verify failure**

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/components/graph/CompanyBrainCanvas.test.tsx`

Expected: FAIL because graph components do not exist.

- [ ] **Step 3: Implement custom nodes and semantic edges**

Register React Flow node types `companyCore`, `department`, and `entity`; register edge type `semantic`. Use CSS variables and `data-status`, `data-selected`, and `data-highlighted` attributes. Company core animation must stop when `prefers-reduced-motion` is true.

- [ ] **Step 4: Implement canvas controls and interactions**

Wire pan, zoom, fit, center, fullscreen, multi-select, hover preview, click selection, Shift-click, double-click focus/detail, labels toggle, edges toggle, category filter, department filter, relationship filter, and `/` search focus. Show a minimap only when visible nodes exceed 120.

Render `AccessibleEntityTree` as the non-spatial equivalent with the same selection and inspector actions.

- [ ] **Step 5: Implement loading, empty, permission, and error states**

`CompanyBrainScreen` must branch explicitly:

```tsx
if (query.isPending) return <BrainInitialReveal />;
if (query.isError) return <OperatingErrorState error={query.error} onRetry={() => query.refetch()} />;
if (query.data.data.nodes.length === 0) return <OperatingEmptyState entity="organization graph" actionHref="/app/agents" />;
return <CompanyBrainCanvas snapshot={query.data.data} />;
```

`BrainInitialReveal` follows the approved one-session sequence: grid at 100 ms, navigation/context at 200 ms, core at 300 ms, department edges at 400 ms, departments at 500–800 ms, and agent ring at 800–1200 ms. Store a session-scoped completion flag so refetches use a non-blocking update indicator instead of replaying the sequence.

- [ ] **Step 6: Run tests, typecheck, and build**

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/components/graph/CompanyBrainCanvas.test.tsx`

Expected: PASS.

Run: `pnpm --filter @cerebro/studio typecheck && pnpm --filter @cerebro/studio build`

Expected: both succeed.

- [ ] **Step 7: Commit**

```bash
git add apps/studio/features/company-operating-system/components/graph apps/studio/features/company-operating-system/components/states apps/studio/features/company-operating-system/screens/CompanyBrainScreen.tsx apps/studio/app/'(platform)'/app/'(operating-system)'/brain/page.tsx
git commit -m "feat(company-os): build interactive company brain"
```

### Task 7: Add Inspectors, Commands, Task Dispatch, and Live Graph Events

**Files:**
- Create: `apps/platform-api/src/modules/operating-system/commandSchemas.ts`
- Create: `apps/platform-api/src/modules/operating-system/OperatingCommandService.ts`
- Create: `apps/platform-api/src/modules/operating-system/OperatingEventStream.ts`
- Modify: `apps/platform-api/src/modules/operating-system/operating-system.routes.ts`
- Create: `apps/platform-api/src/modules/operating-system/commands.test.ts`
- Create: `apps/studio/features/company-operating-system/commands/parseLocalCommand.ts`
- Create: `apps/studio/features/company-operating-system/commands/parseLocalCommand.test.ts`
- Create: `apps/studio/features/company-operating-system/realtime/eventProjection.ts`
- Create: `apps/studio/features/company-operating-system/realtime/eventProjection.test.ts`
- Create: `apps/studio/features/company-operating-system/realtime/useOperatingEvents.ts`
- Create: `apps/studio/features/company-operating-system/components/command/OperatingCommandBar.tsx`
- Create: `apps/studio/features/company-operating-system/components/command/OperatingCommandBar.test.tsx`
- Create: `apps/studio/features/company-operating-system/components/inspector/EntityInspector.tsx`
- Create: `apps/studio/features/company-operating-system/components/inspector/EntityInspector.test.tsx`
- Create: `apps/studio/features/company-operating-system/components/inspector/TaskInspector.tsx`
- Modify: `apps/studio/features/company-operating-system/screens/CompanyBrainScreen.tsx`

**Interfaces:**
- Produces: `POST /api/operating-system/commands`.
- Produces: `GET /api/operating-system/events?cursor=<id>` as SSE.
- Produces: local command parser for `focus`, `show`, `hide`, `find`, and `open`.

- [ ] **Step 1: Write failing parser, command, and event tests**

```ts
expect(parseLocalCommand("focus research")).toEqual({ kind: "focus", target: "research" });
expect(parseLocalCommand("create a task to audit docs")).toBeNull();
```

```ts
it("rejects a server command outside the allowlist", async () => {
  const response = await app.inject({ method: "POST", url: "/api/operating-system/commands", headers: authHeaders(), payload: { text: "delete production" } });
  expect(response.statusCode).toBe(422);
  expect(response.json().error).toBe("UNSUPPORTED_COMMAND");
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/commands/parseLocalCommand.test.ts`

Expected: FAIL because the parser does not exist.

Run: `pnpm --filter @cerebro/platform-api test -- commands.test.ts`

Expected: FAIL because command routes do not exist.

- [ ] **Step 3: Implement local command parsing and UI state**

Local commands must be deterministic token parsing, not an LLM call. Server submission occurs only when the local parser returns `null`. The command bar displays parsing, validation, dispatch, running, completed, failed, and cancelled states and retains failed input.

- [ ] **Step 4: Implement the server allowlist and dispatcher**

```ts
import { Type, type Static } from "@sinclair/typebox";

export const ServerCommandSchema = Type.Union([
  Type.Object({
    kind: Type.Literal("create-task"),
    title: Type.String({ minLength: 3, maxLength: 240 }),
    targetType: Type.Union([Type.Literal("agent"), Type.Literal("department"), Type.Literal("workflow")]),
    targetId: Type.String({ format: "uuid" }),
    input: Type.Record(Type.String(), Type.Unknown()),
  }),
  Type.Object({
    kind: Type.Literal("execute-agent"),
    targetId: Type.String({ format: "uuid" }),
    input: Type.Record(Type.String(), Type.Unknown()),
  }),
]);

export type ServerCommand = Static<typeof ServerCommandSchema>;
```

Resolve targets inside the verified workspace before dispatch. `execute-agent` delegates to the existing runtime service. `create-task` returns a durable task identifier defined in Plan 2; until Plan 2 lands, keep the route feature-flagged and return `501 TASK_PERSISTENCE_NOT_INSTALLED` rather than simulating success.

- [ ] **Step 5: Implement SSE and polling-compatible projections**

Stream a normalized union of authorized `ExecutionEvent` and `OperatingActivityEvent` rows for the verified workspace with `id`, `event`, and JSON `data` fields. Use a signed composite cursor containing source, timestamp, and source ID; send a heartbeat every 15 seconds. `useOperatingEvents` uses authenticated `fetch()` streaming, reconnects with exponential backoff capped at 30 seconds, and falls back to graph refetch every 15 seconds after three failed stream attempts.

- [ ] **Step 6: Implement entity and task inspectors**

Clicking a node loads safe entity detail and renders name, type, status, department, capabilities, metrics, relationships, current workload, and canonical action links. The inspector is a right overlay on desktop, floating panel on tablet, and bottom sheet on mobile. Focus returns to the selected node when it closes.

- [ ] **Step 7: Run focused tests and builds**

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/commands/parseLocalCommand.test.ts features/company-operating-system/realtime/eventProjection.test.ts features/company-operating-system/components/command/OperatingCommandBar.test.tsx features/company-operating-system/components/inspector/EntityInspector.test.tsx`

Expected: PASS.

Run: `pnpm --filter @cerebro/platform-api test -- operating-system && pnpm --filter @cerebro/platform-api build`

Expected: API tests and build pass.

- [ ] **Step 8: Commit**

```bash
git add apps/platform-api/src/modules/operating-system apps/studio/features/company-operating-system/commands apps/studio/features/company-operating-system/realtime apps/studio/features/company-operating-system/components/command apps/studio/features/company-operating-system/components/inspector apps/studio/features/company-operating-system/screens/CompanyBrainScreen.tsx
git commit -m "feat(company-os): add commands inspectors and live events"
```

### Task 8: Verify the Foundation and Company Brain Slice

**Files:**
- Create: `apps/studio/tests/visual/company-operating-system/brain.spec.ts`
- Create: `apps/studio/tests/e2e/company-operating-system-brain.spec.ts`
- Create: `apps/studio/tests/performance/company-brain.perf.spec.ts`
- Modify: `apps/studio/playwright.config.ts`
- Create: `docs/company-operating-system/foundation-and-brain.md`

**Interfaces:**
- Consumes: all Plan 1 routes and components.
- Produces: visual, interaction, and performance evidence for the first independently shippable slice.

- [ ] **Step 1: Write failing browser tests**

```ts
test("brain search, focus, select, and inspector", async ({ page }) => {
  await page.goto("/app/brain?mode=demo");
  await expect(page.getByText("DEMO DATA")).toBeVisible();
  await page.getByRole("searchbox", { name: "Search company brain" }).fill("Research");
  await page.getByRole("button", { name: "Department: Research" }).dblclick();
  await page.getByRole("button", { name: /Agent:/ }).first().click();
  await expect(page.getByRole("dialog", { name: /inspector/i })).toBeVisible();
});
```

Add desktop screenshots at 1920×1080, 1600×900, and 1440×900 plus tablet and mobile projects. Disable only continuous motion through the app's reduced-motion flag; do not delete dynamic elements from the DOM.

Update the initial Playwright matcher so Plans 1–4 can run their focused company-operating-system specs before Plan 5 broadens the complete matrix:

```ts
testMatch: [
  "**/visual/**/*.spec.ts",
  "**/e2e/company-operating-system*.spec.ts",
  "**/performance/company-*.perf.spec.ts",
],
```

- [ ] **Step 2: Run the browser test and capture any failures**

Run: `pnpm --filter @cerebro/studio test:e2e -- tests/e2e/company-operating-system-brain.spec.ts --project=chromium`

Expected: PASS after prior tasks; any failure is an implementation defect and must be fixed before continuing.

- [ ] **Step 3: Add the performance assertion**

Measure initial interactive state and pan/zoom frame samples against demo data. Assert initial interaction under 2.5 seconds on the standard local profile and no long task above 50 ms during deterministic layout.

- [ ] **Step 4: Run the complete Plan 1 gate**

Run:

```bash
pnpm typecheck:root
pnpm --filter @cerebro/db generate
pnpm --filter @cerebro/db typecheck
pnpm --filter @cerebro/platform-api test -- operating-system
pnpm --filter @cerebro/platform-api build
pnpm --filter @cerebro/studio test:unit
pnpm --filter @cerebro/studio typecheck
pnpm --filter @cerebro/studio build
pnpm --filter @cerebro/studio test:e2e -- tests/e2e/company-operating-system-brain.spec.ts --project=chromium
pnpm --filter @cerebro/studio test:e2e -- tests/visual/company-operating-system/brain.spec.ts --project=chromium
pnpm --filter @cerebro/studio test:e2e -- tests/performance/company-brain.perf.spec.ts --project=chromium
```

Expected: every command exits 0.

- [ ] **Step 5: Document the live/demo configuration and API contracts**

Document `NEXT_PUBLIC_API_URL`, `CEREBRO_COMPANY_OS_DEMO=enabled`, required auth/workspace headers, demo restrictions, graph endpoint, event cursor behavior, and recovery behavior in `docs/company-operating-system/foundation-and-brain.md`.

- [ ] **Step 6: Commit**

```bash
git add apps/studio/tests/visual/company-operating-system/brain.spec.ts apps/studio/tests/e2e/company-operating-system-brain.spec.ts apps/studio/tests/performance/company-brain.perf.spec.ts apps/studio/playwright.config.ts docs/company-operating-system/foundation-and-brain.md
git commit -m "test(company-os): verify foundation and company brain"
```

## Plan 1 Completion Gate

Do not start Plan 2 until `/app/brain` works against live empty/data states, explicit demo mode passes visual validation, graph interactions and inspectors pass, protected APIs reject cross-workspace access, and all Task 8 commands exit 0.
