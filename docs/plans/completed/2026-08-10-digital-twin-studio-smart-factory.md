# Digital Twin Studio Smart Factory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a tenant-scoped, end-to-end Smart Factory digital-twin MVP in a new Next.js application.

**Architecture:** `apps/twin-studio` is a modular monolith that calls typed contracts and domain ports. PostgreSQL/Prisma adapters provide durable data while local telemetry, event-bus, simulator, and deterministic AI adapters implement the MVP behind replaceable interfaces.

**Tech Stack:** Next.js 15, React, TypeScript, Prisma 7/PostgreSQL, Zod, Vitest, workspace packages.

## Global Constraints

- Preserve unrelated dirty-worktree changes; only stage files created for the current task.
- Scope every repository and endpoint by `tenantId` and `workspaceId`.
- Use TDD: each behavior starts with a focused failing Vitest test.
- AI creates proposals only; mutations require validation, authorization, preview, and an explicit command.
- Label all factory operational data and results `SIMULATED`; scenario runs must never mutate live state.
- A visible primary action must work end-to-end or explicitly state that it is unavailable.

---

## Planned file structure

- `packages/twin-contracts/src/*`: Zod DTOs, commands, events, provenance, and structured API errors.
- `packages/twin-domain/src/*`: aggregate invariants and ports.
- `packages/db/prisma/schema.prisma`: tenant-scoped Twin Studio models and indexes.
- `packages/db/src/twin-studio/*`: Prisma repositories and atomic services.
- `apps/twin-studio/*`: app configuration, routes, bounded modules, and screens.
- `apps/twin-studio/tests/*`: unit/API/UI behavior tests.

### Task 1: Establish contracts and domain ports

**Files:**
- Create: `packages/twin-contracts/package.json`, `packages/twin-contracts/src/index.ts`, `packages/twin-contracts/src/provenance.ts`, `packages/twin-contracts/src/twin-definition.ts`, `packages/twin-contracts/src/commands.ts`, `packages/twin-contracts/src/events.ts`
- Create: `packages/twin-domain/package.json`, `packages/twin-domain/src/index.ts`, `packages/twin-domain/src/ports.ts`, `packages/twin-domain/src/twin-version.ts`
- Test: `packages/twin-contracts/src/twin-definition.test.ts`, `packages/twin-domain/src/twin-version.test.ts`

**Interfaces:**
- Produces `TwinDefinitionSchema`, `ProvenanceSchema`, `CreateTwinCommandSchema`, `UpdateEntityStateCommandSchema`, `EntityStateUpdatedSchema`, and ports `TelemetryStore`, `EventBus`, `SimulationEngine`, `AIProvider`, `KnowledgeStore`, `ObjectStore`.

- [ ] **Step 1: Write failing contract tests**

```ts
it('rejects a twin definition with an entity relationship to an unknown type', () => {
  expect(() => TwinDefinitionSchema.parse({ entityTypes: [{ key: 'motor' }], relationshipTypes: [{ from: 'motor', to: 'line' }] })).toThrow();
});

it('requires provenance classification and temporal fields for an observation', () => {
  expect(() => ProvenanceSchema.parse({ source: 'factory-simulator' })).toThrow();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @cerebro/twin-contracts test -- twin-definition.test.ts`

Expected: FAIL because the package and schemas do not exist.

- [ ] **Step 3: Implement minimal schemas and ports**

```ts
export const ProvenanceSchema = z.object({
  source: z.string().min(1), classification: z.enum(['OBSERVED', 'INFERRED', 'PREDICTED', 'SIMULATED']),
  observedAt: z.coerce.date(), effectiveAt: z.coerce.date(), ingestedAt: z.coerce.date(),
  confidence: z.number().min(0).max(1).optional(), quality: z.number().min(0).max(1).optional(),
});
```

Validate relationship endpoints against declared type keys with `superRefine`. Define port method signatures but no infrastructure implementation.

- [ ] **Step 4: Run package tests and typecheck**

Run: `pnpm --filter @cerebro/twin-contracts test && pnpm --filter @cerebro/twin-domain typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/twin-contracts packages/twin-domain
git commit -m "feat: add digital twin contracts and ports"
```

### Task 2: Persist versioned, tenant-scoped twins

**Files:**
- Modify: `packages/db/prisma/schema.prisma`
- Create: `packages/db/prisma/migrations/<timestamp>_twin_studio_foundation/migration.sql`
- Create: `packages/db/src/twin-studio/twin-repository.ts`, `packages/db/src/twin-studio/twin-repository.test.ts`
- Modify: `packages/db/index.ts`, `packages/db/package.json`

**Interfaces:**
- Consumes `CreateTwinCommand` and `TwinDefinition` from `@cerebro/twin-contracts`.
- Produces `TwinRepository.create(input)`, `getById(scope, twinId)`, and `publishVersion(scope, twinId, versionId)`.

- [ ] **Step 1: Write failing repository tests**

```ts
it('does not return a twin outside the caller tenant and workspace scope', async () => {
  await repository.create(factory.scopeA, factory.command);
  await expect(repository.getById(factory.scopeB, factory.twinId)).resolves.toBeNull();
});

it('publishes exactly one immutable active version per twin', async () => {
  const result = await repository.publishVersion(factory.scopeA, factory.twinId, factory.versionId);
  expect(result.status).toBe('PUBLISHED');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @cerebro/db test -- twin-repository.test.ts`

Expected: FAIL because Twin Studio models/repository do not exist.

- [ ] **Step 3: Add models and repository implementation**

Add `DigitalTwin`, `TwinVersion`, `TwinEntityType`, `TwinEntity`, `TwinRelationshipType`, `TwinRelationship`, `TwinVariable`, `TwinAuditEvent`, and `TwinSnapshot`. Reference existing `Tenant` and `Workspace`; use unique `(twinId, versionNumber)`, indexes beginning with `tenantId, workspaceId`, and transactionally write the audit event with each create/publish action.

- [ ] **Step 4: Generate, migrate, and run tests**

Run: `pnpm --filter @cerebro/db generate && pnpm --filter @cerebro/db migrate:dev && pnpm --filter @cerebro/db test -- twin-repository.test.ts`

Expected: migration applies and tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/db
git commit -m "feat(db): persist versioned digital twins"
```

### Task 3: Implement local live operations and Smart Factory simulation

**Files:**
- Create: `apps/twin-studio/modules/state/state-service.ts`, `apps/twin-studio/modules/telemetry/postgres-telemetry-store.ts`, `apps/twin-studio/modules/operations/rule-engine.ts`
- Create: `apps/twin-studio/modules/demo-factory/factory-definition.ts`, `apps/twin-studio/modules/demo-factory/factory-simulator.ts`
- Create: `apps/twin-studio/modules/simulation/snapshot-simulation-engine.ts`
- Test: `apps/twin-studio/modules/demo-factory/factory-simulator.test.ts`, `apps/twin-studio/modules/simulation/snapshot-simulation-engine.test.ts`

**Interfaces:**
- Consumes `TelemetryStore`, `EventBus`, `SimulationEngine`, `EntityStateUpdated`.
- Produces `FactorySimulator.tick(at)`, `RuleEngine.evaluate(observation)`, and `SnapshotSimulationEngine.run(request)`.

- [ ] **Step 1: Write failing simulation tests**

```ts
it('emits a simulated Motor-07 anomaly and alert after the configured threshold', async () => {
  const output = await simulator.tick(new Date('2026-08-10T12:00:00Z'));
  expect(output.alerts).toContainEqual(expect.objectContaining({ entityKey: 'motor-07', status: 'OPEN', classification: 'SIMULATED' }));
});

it('writes scenario results to a fork without changing live state', async () => {
  await engine.run({ snapshotId: 'snap-1', failureEntityKey: 'motor-07' });
  expect(await liveState.get('motor-07')).toEqual(before);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @cerebro/twin-studio test -- factory-simulator.test.ts snapshot-simulation-engine.test.ts`

Expected: FAIL because simulator and snapshot engine do not exist.

- [ ] **Step 3: Implement deterministic local adapters**

Seed Factory Alpha, production lines, Motor-07, temperature/vibration/power variables, and threshold rule. Use a deterministic tick counter to generate the rising Motor-07 signal. Persist every generated value with `SIMULATED` provenance, create events/alerts through the event port, and serialize only a snapshot copy to scenario execution.

- [ ] **Step 4: Run targeted tests**

Run: `pnpm --filter @cerebro/twin-studio test -- factory-simulator.test.ts snapshot-simulation-engine.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/twin-studio/modules packages/db/prisma/schema.prisma
git commit -m "feat: add simulated factory live operations"
```

### Task 4: Create the Twin Studio application and typed APIs

**Files:**
- Create: `apps/twin-studio/package.json`, `apps/twin-studio/next.config.ts`, `apps/twin-studio/tsconfig.json`, `apps/twin-studio/app/layout.tsx`, `apps/twin-studio/app/page.tsx`
- Create: `apps/twin-studio/app/api/twins/route.ts`, `apps/twin-studio/app/api/twins/[twinId]/route.ts`, `apps/twin-studio/app/api/twins/[twinId]/simulator/route.ts`, `apps/twin-studio/app/api/twins/[twinId]/scenarios/route.ts`
- Create: `apps/twin-studio/lib/request-scope.ts`, `apps/twin-studio/lib/api-response.ts`
- Test: `apps/twin-studio/app/api/twins/route.test.ts`, `apps/twin-studio/app/api/twins/[twinId]/scenarios/route.test.ts`

**Interfaces:**
- Consumes contract Zod schemas and application services.
- Produces structured `{ error: { code, message, traceId } }` errors, never unscoped data.

- [ ] **Step 1: Write failing API tests**

```ts
it('returns 400 with a structured error for an invalid twin definition', async () => {
  const response = await POST(new Request('http://test/api/twins', { method: 'POST', body: '{}' }));
  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
});

it('returns 403 rather than a scenario for a different workspace', async () => {
  expect((await POST(otherWorkspaceRequest)).status).toBe(403);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @cerebro/twin-studio test -- route.test.ts`

Expected: FAIL because the application and routes do not exist.

- [ ] **Step 3: Implement app shell, scope extraction, routes, and error boundary**

Derive request scope from the repository’s established authentication/session adapter; if no authenticated adapter is available in this app, return `503 AUTHENTICATION_UNAVAILABLE` rather than inventing a user identity. Routes validate body schemas, invoke scoped services, and return contract DTOs. Add usable loading and error views.

- [ ] **Step 4: Run API tests and app checks**

Run: `pnpm --filter @cerebro/twin-studio test && pnpm --filter @cerebro/twin-studio typecheck && pnpm --filter @cerebro/twin-studio lint`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/twin-studio
git commit -m "feat: add twin studio APIs and app shell"
```

### Task 5: Build the working command-center experience

**Files:**
- Create: `apps/twin-studio/app/twins/page.tsx`, `apps/twin-studio/app/twins/[twinId]/page.tsx`
- Create: `apps/twin-studio/features/twins/twin-list.tsx`, `apps/twin-studio/features/command-center/command-center.tsx`, `apps/twin-studio/features/command-center/live-state-panel.tsx`, `apps/twin-studio/features/command-center/graph-panel.tsx`, `apps/twin-studio/features/command-center/events-panel.tsx`, `apps/twin-studio/features/command-center/scenario-panel.tsx`
- Test: `apps/twin-studio/features/command-center/command-center.test.tsx`

**Interfaces:**
- Consumes typed `/api/twins` responses and simulator/scenario endpoints.
- Produces a functional list, command center tabs, live state, graph, events, and scenario controls.

- [ ] **Step 1: Write failing UI tests**

```tsx
it('starts simulation and presents only SIMULATED operational data', async () => {
  render(<CommandCenter twin={factoryTwin} />);
  await userEvent.click(screen.getByRole('button', { name: /start simulation/i }));
  expect(await screen.findByText(/simulated/i)).toBeVisible();
});

it('opens the Motor-07 alert evidence without a dead control', async () => {
  render(<CommandCenter twin={factoryTwin} />);
  await userEvent.click(screen.getByRole('button', { name: /view evidence for motor-07/i }));
  expect(await screen.findByText(/rising vibration/i)).toBeVisible();
});
```

- [ ] **Step 2: Run UI tests to verify they fail**

Run: `pnpm --filter @cerebro/twin-studio test -- command-center.test.tsx`

Expected: FAIL because command-center components do not exist.

- [ ] **Step 3: Implement responsive command-center panels**

Render active version, health dimensions, sync status, alerts, tabbed real views, loading/error/empty states, and only actions backed by Task 4 routes. Make graph nodes/edges accessible textual content in addition to visual rendering. Render a direct unavailable message for deferred capabilities.

- [ ] **Step 4: Run UI tests, lint, and build**

Run: `pnpm --filter @cerebro/twin-studio test && pnpm --filter @cerebro/twin-studio lint && pnpm --filter @cerebro/twin-studio build`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/twin-studio
git commit -m "feat: add digital twin command center"
```

### Task 6: Add provenance-backed Ask Twin and final verification

**Files:**
- Create: `apps/twin-studio/modules/intelligence/deterministic-ai-provider.ts`, `apps/twin-studio/modules/intelligence/ask-twin-service.ts`, `apps/twin-studio/app/api/twins/[twinId]/ask/route.ts`, `apps/twin-studio/features/command-center/ask-twin-panel.tsx`
- Test: `apps/twin-studio/modules/intelligence/ask-twin-service.test.ts`, `apps/twin-studio/app/api/twins/[twinId]/ask/route.test.ts`, `apps/twin-studio/features/command-center/ask-twin-panel.test.tsx`
- Modify: `apps/twin-studio/features/command-center/command-center.tsx`

**Interfaces:**
- Consumes `AIProvider`, live state/events/alerts, and `RecommendationEvidence`.
- Produces `AskTwinAnswer` with answer, recommendation, provenance/evidence, and `sourceKind`.

- [ ] **Step 1: Write failing Ask Twin tests**

```ts
it('explains Motor-07 risk with telemetry, rule, confidence, and simulated provenance', async () => {
  const answer = await service.answer(scope, twinId, 'Explain what is happening.');
  expect(answer.evidence).toEqual(expect.arrayContaining([expect.objectContaining({ source: 'factory-simulator', classification: 'SIMULATED' })]));
  expect(answer.recommendation.reason).toMatch(/bearing failure/i);
});

it('returns provider unavailable instead of fabricating an external AI answer', async () => {
  await expect(unconfiguredService.answer(scope, twinId, 'Create a maintenance agent')).rejects.toMatchObject({ code: 'AI_PROVIDER_UNAVAILABLE' });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @cerebro/twin-studio test -- ask-twin-service.test.ts`

Expected: FAIL because the service/provider do not exist.

- [ ] **Step 3: Implement the deterministic provider and Ask Twin panel**

For the supported anomaly prompt, build the explanation exclusively from stored telemetry, event, rule, and scenario data. Return a structured recommendation containing reason, confidence, generated time, provider, and evidence. For commands/high-impact operations return a validated preview proposal, never execute it. Render provenance in the panel.

- [ ] **Step 4: Run targeted and repository verification**

Run: `pnpm --filter @cerebro/twin-studio test && pnpm --filter @cerebro/twin-studio typecheck && pnpm --filter @cerebro/twin-studio lint && pnpm prisma:validate && pnpm typecheck`

Expected: PASS with no dead route or unscoped repository access introduced.

- [ ] **Step 5: Commit**

```bash
git add apps/twin-studio packages/twin-contracts packages/twin-domain packages/db
git commit -m "feat: add provenance-backed ask twin"
```

## Self-review

- Spec coverage: Tasks 1-2 cover contracts, versioned TDL, tenant isolation, database, commands/events, and ports; Task 3 covers state/telemetry/events/rules/simulation; Tasks 4-5 cover APIs and UI; Task 6 covers AI/provenance and final validation.
- Scope: external connectors, distributed service extraction, predictive ML, optimization, and 3D remain explicitly deferred.
- Consistency: `TwinDefinitionSchema`, scope, provenance, local ports, snapshot simulation, and `AskTwinAnswer` are introduced before consumers.
- Placeholder scan: no deferred implementation is represented as a primary working feature.
