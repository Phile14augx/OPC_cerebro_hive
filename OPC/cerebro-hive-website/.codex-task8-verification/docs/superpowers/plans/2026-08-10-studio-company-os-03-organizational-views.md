# Studio Company Operating System — Personas, Funnels, and Hierarchy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver persistent persona management, live operational funnels, and an explorable organizational hierarchy that share the operating-system shell, data scope, graph behavior, and cross-links.

**Architecture:** Add workspace-scoped persona and funnel aggregates to Prisma and `OperatingSystemRepository`, expose them through the existing authenticated operating-system Fastify module, and compose split-pane, pipeline, and ELK hierarchy screens from the shared Plan 1 primitives.

**Tech Stack:** Prisma/PostgreSQL, Fastify, TypeScript, Next.js 16, React 19, TanStack Query, React Flow, ELK, Framer Motion, React Hook Form, Zod, Vitest, Playwright.

## Global Constraints

- Plans 1 and 2 completion gates must pass before this plan begins.
- Persona prompts and constraints are returned only by authorized persona-detail endpoints, never in the Company Brain snapshot.
- Funnel counts and movement come from persisted items and events; no random or timer-generated production motion.
- Hierarchy derives from department leaders and real `REPORTS_TO` relationships; missing hierarchy renders an honest configuration state.
- Every mutation uses workspace scope, optimistic concurrency, validation, and an idempotency key where replay is possible.
- Desktop uses the recording-inspired dense layout; mobile retains complete functionality through bottom sheets and compact controls.
- Build test-first and commit each task independently without unrelated changes.
- This plan is Plan 3 of 5; Plans 4 and 5 remain required.

---

### Task 1: Persist Personas and Persona Relationships

**Files:**
- Modify: `packages/db/prisma/schema.prisma`
- Create: `packages/db/prisma/migrations/20260810_company_operating_personas/migration.sql`
- Create: `packages/db/src/repositories/OperatingPersonaRepository.ts`
- Create: `packages/db/src/repositories/OperatingPersonaRepository.test.ts`
- Modify: `packages/db/index.ts`
- Modify: `packages/shared-types/src/domain/operating-system.ts`

**Interfaces:**
- Produces: `OperatingPersonaSummary`, `OperatingPersonaDetail`, `OperatingPersonaRelationship`, `PersonaVersionConflict`.
- Produces: repository `list`, `getById`, `create`, `update`, `archive`, and `replaceRelationships`.

- [ ] **Step 1: Write failing workspace and concurrency tests**

```ts
it("updates only when the expected version matches", async () => {
  const updated = await repository.update(PERSONA_ID, { name: "Research Lead", expectedVersion: 3 }, opts(WORKSPACE_A));
  expect(updated.version).toBe(4);
});

it("rejects a stale persona update", async () => {
  await expect(repository.update(PERSONA_ID, { name: "Stale", expectedVersion: 2 }, opts(WORKSPACE_A))).rejects.toThrow("PERSONA_VERSION_CONFLICT");
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `pnpm exec vitest run packages/db/src/repositories/OperatingPersonaRepository.test.ts`

Expected: FAIL because the persona repository and models do not exist.

- [ ] **Step 3: Add persona models**

```prisma
model OperatingPersona {
  id            String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  workspaceId   String @db.Uuid
  workspace     Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  name          String
  slug          String
  category      String
  role          String
  description   String? @db.Text
  goals         Json @default("[]")
  behaviors     Json @default("[]")
  constraints   Json @default("[]")
  capabilities  Json @default("[]")
  systemPrompt  String? @db.Text
  isActive      Boolean @default(true)
  version       Int @default(1)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  relationships OperatingPersonaRelationship[] @relation("PersonaSource")
  incomingRelationships OperatingPersonaRelationship[] @relation("PersonaTarget")
  @@unique([workspaceId, slug])
  @@index([workspaceId, isActive])
}

model OperatingPersonaRelationship {
  id        String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  sourceId  String @db.Uuid
  targetId  String @db.Uuid
  source    OperatingPersona @relation("PersonaSource", fields: [sourceId], references: [id], onDelete: Cascade)
  target    OperatingPersona @relation("PersonaTarget", fields: [targetId], references: [id], onDelete: Cascade)
  kind      String
  strength  Float @default(0.5)
  metadata  Json?
  @@unique([sourceId, targetId, kind])
}
```

Add `operatingPersonas` to `Workspace`. Constrain relationship strength to `0..1` in repository validation.

- [ ] **Step 4: Implement repository projections and optimistic updates**

List returns no `systemPrompt`. Detail returns it only when the caller has `company-os:personas_write` or `company-os:personas_prompt_read`. Update uses `updateMany({ where: { id, workspaceId, version: expectedVersion } })`, increments `version`, and returns a typed conflict on count zero.

- [ ] **Step 5: Generate Prisma and run tests**

Run: `pnpm --filter @cerebro/db generate && pnpm --filter @cerebro/db typecheck && pnpm exec vitest run packages/db/src/repositories/OperatingPersonaRepository.test.ts`

Expected: all commands pass.

- [ ] **Step 6: Commit**

```bash
git add packages/db/prisma/schema.prisma packages/db/prisma/migrations/20260810_company_operating_personas/migration.sql packages/db/src/repositories/OperatingPersonaRepository.ts packages/db/src/repositories/OperatingPersonaRepository.test.ts packages/db/index.ts packages/shared-types/src/domain/operating-system.ts
git commit -m "feat(company-os): persist personas and relationships"
```

### Task 2: Add Persona APIs and Split-Pane Persona Screens

**Files:**
- Create: `apps/platform-api/src/modules/operating-system/personaSchemas.ts`
- Create: `apps/platform-api/src/modules/operating-system/personas.routes.ts`
- Create: `apps/platform-api/src/modules/operating-system/personas.routes.test.ts`
- Modify: `apps/platform-api/src/modules/operating-system/operating-system.routes.ts`
- Create: `apps/studio/features/company-operating-system/components/personas/PersonaForm.tsx`
- Create: `apps/studio/features/company-operating-system/components/personas/PersonaRelationshipGraph.tsx`
- Create: `apps/studio/features/company-operating-system/components/personas/PersonaForm.test.tsx`
- Create: `apps/studio/features/company-operating-system/screens/PersonasScreen.tsx`
- Create: `apps/studio/features/company-operating-system/screens/PersonaDetailScreen.tsx`
- Create: `apps/studio/app/(platform)/app/(operating-system)/personas/page.tsx`
- Create: `apps/studio/app/(platform)/app/(operating-system)/personas/[id]/page.tsx`
- Modify: `apps/studio/features/company-operating-system/data/client.ts`
- Modify: `apps/studio/features/company-operating-system/data/queries.ts`

**Interfaces:**
- Produces: persona CRUD endpoints with ETag/version concurrency.
- Produces: searchable catalog and split-pane editor with relationship graph.

- [ ] **Step 1: Write failing API and form tests**

```ts
it("returns 409 for a stale If-Match version", async () => {
  const response = await app.inject({ method: "PATCH", url: `/api/operating-system/personas/${PERSONA_ID}`, headers: { ...authHeaders(), "if-match": "2" }, payload: validPersonaPatch });
  expect(response.statusCode).toBe(409);
  expect(response.json().error).toBe("PERSONA_VERSION_CONFLICT");
});
```

```tsx
it("preserves unsaved input after a version conflict", async () => {
  render(<PersonaForm persona={personaV3} />);
  await user.clear(screen.getByLabelText("Persona name"));
  await user.type(screen.getByLabelText("Persona name"), "Research Partner");
  await user.click(screen.getByRole("button", { name: "Save persona" }));
  expect(await screen.findByText("This persona changed elsewhere")).toBeVisible();
  expect(screen.getByLabelText("Persona name")).toHaveValue("Research Partner");
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm --filter @cerebro/platform-api test -- personas.routes.test.ts`

Expected: FAIL because persona routes do not exist.

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/components/personas/PersonaForm.test.tsx`

Expected: FAIL because persona UI does not exist.

- [ ] **Step 3: Implement validated persona endpoints**

Add `GET/POST /personas`, `GET/PATCH/DELETE /personas/:id`, and `PUT /personas/:id/relationships`. Use Zod/TypeBox schemas with bounded array sizes, prompt length at most 20,000 characters, relationship strength `0..1`, and authorization checks for prompt read/write.

- [ ] **Step 4: Implement catalog and detail screens**

Catalog provides search, category, role, active status, and capability filters. Detail is split pane: configuration on the left and relationship/capability graph on the right. Desktop keeps both panes; tablet makes the graph collapsible; mobile uses tabs and a bottom-sheet relationship inspector.

- [ ] **Step 5: Run tests, typechecks, and build**

Run: `pnpm --filter @cerebro/platform-api test -- personas.routes.test.ts && pnpm --filter @cerebro/platform-api build`

Expected: PASS.

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/components/personas/PersonaForm.test.tsx && pnpm --filter @cerebro/studio typecheck && pnpm --filter @cerebro/studio build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/platform-api/src/modules/operating-system apps/studio/features/company-operating-system/components/personas apps/studio/features/company-operating-system/screens/PersonasScreen.tsx apps/studio/features/company-operating-system/screens/PersonaDetailScreen.tsx apps/studio/features/company-operating-system/data apps/studio/app/'(platform)'/app/'(operating-system)'/personas
git commit -m "feat(company-os): add persona management workspace"
```

### Task 3: Persist Funnels, Stages, and Items

**Files:**
- Modify: `packages/db/prisma/schema.prisma`
- Create: `packages/db/prisma/migrations/20260810_company_operating_funnels/migration.sql`
- Create: `packages/db/src/repositories/OperatingFunnelRepository.ts`
- Create: `packages/db/src/repositories/OperatingFunnelRepository.test.ts`
- Modify: `packages/db/index.ts`
- Modify: `packages/shared-types/src/domain/operating-system.ts`

**Interfaces:**
- Produces: `OperatingFunnel`, `OperatingFunnelStage`, `OperatingFunnelItem`, and item-movement event contracts.
- Produces: atomic `moveItem(itemId, targetStageId, expectedVersion, context)`.

- [ ] **Step 1: Write failing atomic-movement tests**

```ts
it("moves an item only between stages in the same funnel and workspace", async () => {
  const moved = await repository.moveItem(ITEM_ID, TARGET_STAGE_ID, 4, opts(WORKSPACE_A));
  expect(moved.stageId).toBe(TARGET_STAGE_ID);
  expect(moved.version).toBe(5);
});

it("rejects a stage from another funnel without revealing it", async () => {
  await expect(repository.moveItem(ITEM_ID, FOREIGN_STAGE_ID, 4, opts(WORKSPACE_A))).rejects.toThrow("FUNNEL_STAGE_NOT_FOUND");
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm exec vitest run packages/db/src/repositories/OperatingFunnelRepository.test.ts`

Expected: FAIL because funnel persistence does not exist.

- [ ] **Step 3: Add funnel models**

```prisma
model OperatingFunnel {
  id          String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  workspaceId String @db.Uuid
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  name        String
  slug        String
  description String?
  isActive    Boolean @default(true)
  version     Int @default(1)
  stages      OperatingFunnelStage[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@unique([workspaceId, slug])
}

model OperatingFunnelStage {
  id        String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  funnelId  String @db.Uuid
  funnel    OperatingFunnel @relation(fields: [funnelId], references: [id], onDelete: Cascade)
  name      String
  position  Int
  color     String?
  items     OperatingFunnelItem[]
  @@unique([funnelId, position])
}

model OperatingFunnelItem {
  id          String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  stageId     String @db.Uuid
  stage       OperatingFunnelStage @relation(fields: [stageId], references: [id], onDelete: Cascade)
  title       String
  entityType  String
  entityId    String?
  value       Decimal? @db.Decimal(18, 2)
  metadata    Json?
  version     Int @default(1)
  enteredAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([stageId, enteredAt])
}
```

Add `operatingFunnels` to `Workspace`.

- [ ] **Step 4: Implement transactional movement**

Validate item, source funnel, and target stage inside one transaction; update with expected version; append an `OperatingActivityEvent` with `eventType: "FunnelItemMoved"`, the verified workspace, source stage, target stage, and safe item summary.

- [ ] **Step 5: Generate Prisma and run tests**

Run: `pnpm --filter @cerebro/db generate && pnpm --filter @cerebro/db typecheck && pnpm exec vitest run packages/db/src/repositories/OperatingFunnelRepository.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/db/prisma/schema.prisma packages/db/prisma/migrations/20260810_company_operating_funnels/migration.sql packages/db/src/repositories/OperatingFunnelRepository.ts packages/db/src/repositories/OperatingFunnelRepository.test.ts packages/db/index.ts packages/shared-types/src/domain/operating-system.ts
git commit -m "feat(company-os): persist funnels and movement"
```

### Task 4: Add Funnel APIs and Live Pipeline Screen

**Files:**
- Create: `apps/platform-api/src/modules/operating-system/funnelSchemas.ts`
- Create: `apps/platform-api/src/modules/operating-system/funnels.routes.ts`
- Create: `apps/platform-api/src/modules/operating-system/funnels.routes.test.ts`
- Modify: `apps/platform-api/src/modules/operating-system/operating-system.routes.ts`
- Create: `apps/studio/features/company-operating-system/components/funnels/FunnelPipeline.tsx`
- Create: `apps/studio/features/company-operating-system/components/funnels/FunnelStage.tsx`
- Create: `apps/studio/features/company-operating-system/components/funnels/FunnelItemInspector.tsx`
- Create: `apps/studio/features/company-operating-system/components/funnels/FunnelPipeline.test.tsx`
- Create: `apps/studio/features/company-operating-system/screens/FunnelsScreen.tsx`
- Create: `apps/studio/app/(platform)/app/(operating-system)/funnels/page.tsx`
- Modify: `apps/studio/features/company-operating-system/data/client.ts`
- Modify: `apps/studio/features/company-operating-system/data/queries.ts`

**Interfaces:**
- Produces: funnel CRUD, stage ordering, item creation/update, and atomic movement endpoints.
- Consumes: Plan 1 event stream for `FunnelItemMoved` projection.

- [ ] **Step 1: Write failing API and pipeline tests**

```tsx
it("renders stages in persisted order and updates a moved item from an event", () => {
  const { rerender } = render(<FunnelPipeline funnel={funnel} />);
  expect(stageNames()).toEqual(["Discover", "Qualify", "Execute", "Complete"]);
  rerender(<FunnelPipeline funnel={projectFunnelEvent(funnel, movedEvent)} />);
  expect(within(stage("Execute")).getByText("Audit docs")).toBeVisible();
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm --filter @cerebro/platform-api test -- funnels.routes.test.ts`

Expected: FAIL because funnel routes do not exist.

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/components/funnels/FunnelPipeline.test.tsx`

Expected: FAIL because pipeline components do not exist.

- [ ] **Step 3: Implement funnel endpoints**

Provide list/detail/create/update/archive, replace ordered stages, create/update items, and `POST /funnels/:funnelId/items/:itemId/move`. Require `If-Match` or body `expectedVersion` for updates and `Idempotency-Key` for movement.

- [ ] **Step 4: Implement live pipeline UI**

Render a dense horizontal pipeline with stage labels, real counts, items, value totals only when data exists, and bounded transition animation triggered by `FunnelItemMoved`. Selecting a stage or item opens an inspector. Keyboard movement provides Move left/right actions equivalent to drag-and-drop.

- [ ] **Step 5: Run tests and builds**

Run: `pnpm --filter @cerebro/platform-api test -- funnels.routes.test.ts && pnpm --filter @cerebro/platform-api build`

Expected: PASS.

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/components/funnels/FunnelPipeline.test.tsx && pnpm --filter @cerebro/studio typecheck && pnpm --filter @cerebro/studio build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/platform-api/src/modules/operating-system apps/studio/features/company-operating-system/components/funnels apps/studio/features/company-operating-system/screens/FunnelsScreen.tsx apps/studio/features/company-operating-system/data apps/studio/app/'(platform)'/app/'(operating-system)'/funnels
git commit -m "feat(company-os): add live funnel workspace"
```

### Task 5: Build the Agent Hierarchy from Real Reporting Relationships

**Files:**
- Modify: `packages/db/src/repositories/OperatingSystemRepository.ts`
- Modify: `apps/platform-api/src/modules/operating-system/OperatingSystemService.ts`
- Modify: `apps/platform-api/src/modules/operating-system/operating-system.routes.ts`
- Create: `apps/platform-api/src/modules/operating-system/hierarchy.routes.test.ts`
- Create: `apps/studio/features/company-operating-system/graph/hierarchyLayout.ts`
- Create: `apps/studio/features/company-operating-system/graph/hierarchyLayout.test.ts`
- Create: `apps/studio/features/company-operating-system/components/hierarchy/HierarchyCanvas.tsx`
- Create: `apps/studio/features/company-operating-system/screens/HierarchyScreen.tsx`
- Create: `apps/studio/app/(platform)/app/(operating-system)/hierarchy/page.tsx`

**Interfaces:**
- Produces: `GET /api/operating-system/hierarchy`.
- Produces: stable ELK hierarchy layout and reporting-cycle validation.

- [ ] **Step 1: Write failing cycle and root tests**

```ts
it("places the executive root before department leaders", async () => {
  const result = await layoutHierarchy(hierarchy);
  expect(node(result, "executive").y).toBeLessThan(node(result, "engineering-lead").y);
});

it("rejects reporting cycles", () => {
  expect(() => validateHierarchy(cyclicHierarchy)).toThrow("HIERARCHY_CYCLE");
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/graph/hierarchyLayout.test.ts`

Expected: FAIL because hierarchy modules do not exist.

- [ ] **Step 3: Implement the hierarchy projection and endpoint**

Use department `leaderAgentId`, `REPORTS_TO` relationships, and authorized human summaries. Return roots, nodes, edges, unassigned agents, and configuration warnings. Detect cycles server-side and return `409 HIERARCHY_INVALID` with safe node IDs.

- [ ] **Step 4: Implement hierarchy layout and screen**

Use ELK top-to-bottom tree layout with stable department ordering. Render executive, department leader, agent, and authorized human node variants; support search, department filtering, focus, inspector, expand/collapse, pan/zoom, and an accessible tree.

- [ ] **Step 5: Run tests, typecheck, and build**

Run: `pnpm --filter @cerebro/platform-api test -- hierarchy.routes.test.ts`

Expected: PASS.

Run: `pnpm --filter @cerebro/studio test:unit -- features/company-operating-system/graph/hierarchyLayout.test.ts && pnpm --filter @cerebro/studio typecheck && pnpm --filter @cerebro/studio build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/db/src/repositories/OperatingSystemRepository.ts apps/platform-api/src/modules/operating-system apps/studio/features/company-operating-system/graph/hierarchyLayout.ts apps/studio/features/company-operating-system/graph/hierarchyLayout.test.ts apps/studio/features/company-operating-system/components/hierarchy apps/studio/features/company-operating-system/screens/HierarchyScreen.tsx apps/studio/app/'(platform)'/app/'(operating-system)'/hierarchy
git commit -m "feat(company-os): add organizational hierarchy"
```

### Task 6: Verify Organizational Views End to End

**Files:**
- Create: `apps/studio/tests/e2e/company-operating-system-organization.spec.ts`
- Create: `apps/studio/tests/visual/company-operating-system/personas-funnels-hierarchy.spec.ts`
- Create: `apps/platform-api/src/modules/operating-system/organizational-isolation.test.ts`
- Create: `docs/company-operating-system/organizational-views.md`

**Interfaces:**
- Consumes: all Plan 3 routes and APIs.
- Produces: independently reviewable organizational-view evidence.

- [ ] **Step 1: Write the browser journey**

```ts
test("edit persona, inspect funnel, and select hierarchy leader", async ({ page }) => {
  await page.goto("/app/personas");
  await page.getByRole("link", { name: /Research Persona/ }).click();
  await page.getByLabel("Persona description").fill("Investigates customer and market evidence.");
  await page.getByRole("button", { name: "Save persona" }).click();
  await expect(page.getByText("Persona saved")).toBeVisible();
  await page.goto("/app/funnels");
  await page.getByRole("button", { name: /Qualify stage/ }).click();
  await expect(page.getByRole("dialog", { name: /stage inspector/i })).toBeVisible();
  await page.goto("/app/hierarchy");
  await page.getByRole("button", { name: /Department leader:/ }).first().click();
  await expect(page.getByRole("dialog", { name: /inspector/i })).toBeVisible();
});
```

- [ ] **Step 2: Add isolation and concurrency coverage**

Test cross-workspace persona/funnel IDs, stale versions, relationship replacement, stage movement, event filtering, unauthorized prompt access, and hierarchy leakage.

- [ ] **Step 3: Run Plan 3 gates**

Run:

```bash
pnpm --filter @cerebro/db generate
pnpm --filter @cerebro/db typecheck
pnpm --filter @cerebro/platform-api test -- operating-system
pnpm --filter @cerebro/platform-api build
pnpm --filter @cerebro/studio test:unit
pnpm --filter @cerebro/studio typecheck
pnpm --filter @cerebro/studio build
pnpm --filter @cerebro/studio test:e2e -- tests/e2e/company-operating-system-organization.spec.ts --project=chromium
```

Expected: every command exits 0.

- [ ] **Step 4: Document ownership and security behavior**

Document persona permissions, version conflicts, relationship validation, funnel movement/idempotency, hierarchy derivation, cycle handling, and mobile equivalents in `docs/company-operating-system/organizational-views.md`.

- [ ] **Step 5: Commit**

```bash
git add apps/studio/tests/e2e/company-operating-system-organization.spec.ts apps/studio/tests/visual/company-operating-system/personas-funnels-hierarchy.spec.ts apps/platform-api/src/modules/operating-system/organizational-isolation.test.ts docs/company-operating-system/organizational-views.md
git commit -m "test(company-os): verify organizational views"
```

## Plan 3 Completion Gate

Do not start Plan 4 until persona CRUD and conflicts are real, funnel movement persists and emits real events, hierarchy is derived from valid reporting relationships, mobile/keyboard equivalents exist, isolation tests pass, and every Task 6 command exits 0.
