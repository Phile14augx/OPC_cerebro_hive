# Agent Academy Agent Registry Implementation Plan

> **STATUS: SUPERSEDED FOR WORK ASSIGNMENT — retained for historical/commercial context only. Current work must originate in `docs/portfolio/MASTER-IMPLEMENTATION-LEDGER.md`.** Fold into `KRN-005` during Wave 0.4. Do not open as a new front.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a database-backed, workspace-isolated Agent Registry vertical slice that lets authorized Studio users create, edit, publish, version, and govern canonical agents.

**Architecture:** Evolve the existing `Agent`/`AgentVersion` Prisma models, repository, `/v1/agents` API, SDK, and Studio routes. Add `AgentDraft` as the only mutable definition, a shared Zod contract package, explicit application services, transactional publication/audit/outbox behavior, and lifecycle commands.

**Tech Stack:** TypeScript, Zod, Prisma 7/PostgreSQL, Fastify 5, React 19/Next.js 16, TanStack Query, Vitest, Playwright.

## Global Constraints

- `Agent` and existing `AgentVersion` IDs remain canonical and unchanged.
- `AgentDraft` is the only mutable definition; `AgentVersion` is immutable after cutover.
- Every read and write is workspace scoped; cross-workspace and missing resources both return 404.
- Tool, capability, and knowledge declarations are metadata-only and grant no runtime permission.
- Production execution requires `PRODUCTION`; lifecycle enforcement cannot be disabled by version-resolution rollback.
- Preserve unrelated dirty-worktree changes and stage only task-owned files.

## Agent Academy delivery phases

1. **Registry foundation:** this plan—identity, drafts, immutable versions, lifecycle, RBAC, API, Studio, audit, and migration.
2. **Curriculum and governed bindings:** training scenarios, role curricula, knowledge/tool binding workflows, and import/export.
3. **Simulation and evaluation:** sandbox fixtures, reusable scenario templates, scoring rubrics, adversarial suites, and evidence.
4. **Certification and deployment:** evaluation-backed gates, shadow/supervised modes, deployment records, approvals, and rollback.
5. **AgentOps:** run telemetry, cost/latency, policy events, human corrections, feedback datasets, and monitoring.
6. **Fleet rollout:** seed and certify the 35-agent catalog, team orchestration policy, capability routing, and continuous improvement.

---

### Task 1: Canonical Agent Registry contracts

**Files:**
- Create: `packages/agent-registry-contracts/package.json`
- Create: `packages/agent-registry-contracts/tsconfig.json`
- Create: `packages/agent-registry-contracts/src/agent-definition.ts`
- Create: `packages/agent-registry-contracts/src/canonicalize.ts`
- Create: `packages/agent-registry-contracts/src/contracts.ts`
- Create: `packages/agent-registry-contracts/src/index.ts`
- Test: `packages/agent-registry-contracts/src/agent-definition.test.ts`
- Test: `packages/agent-registry-contracts/src/canonicalize.test.ts`

**Interfaces:**
- Produces: `AgentDefinitionV1`, `AgentDraftDocumentV1`, `AgentDefinitionV1Schema`, `AgentDraftDocumentV1Schema`, `validateForPublication()`, `canonicalizeAgentDefinition()`, `hashAgentDefinition()`, registry DTOs and command schemas.

- [ ] **Step 1: Write failing validation and canonicalization tests**

```ts
it('rejects conflicting allowed and prohibited actions at publication', () => {
  const result = validateForPublication(definitionWithActionConflict);
  expect(result.success).toBe(false);
  expect(result.errors[0]?.code).toBe('AGENT_DEFINITION_ACTION_CONFLICT');
});

it('hashes semantically identical unordered declarations identically', () => {
  expect(hashAgentDefinition(left)).toBe(hashAgentDefinition(right));
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `pnpm --filter @cerebro/agent-registry-contracts test`
Expected: FAIL because the package and exports do not exist.

- [ ] **Step 3: Implement strict draft/publication schemas and deterministic SHA-256 hashing**

```ts
export function validateForPublication(input: unknown): PublicationValidationResult;
export function canonicalizeAgentDefinition(input: AgentDefinitionV1): string;
export function hashAgentDefinition(input: AgentDefinitionV1): string;
```

Use typed lowercase reference syntax, explicit defaults, NFC/LF normalization, deterministic object keys, keyed sorting only for unordered collections, preserved ordered arrays, and bounded metadata constraints.

- [ ] **Step 4: Run contract tests and typecheck**

Run: `pnpm --filter @cerebro/agent-registry-contracts test && pnpm --filter @cerebro/agent-registry-contracts typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/agent-registry-contracts pnpm-lock.yaml
git commit -m "feat: add agent registry contracts"
```

### Task 2: Expand Prisma schema and migration artifacts

**Files:**
- Modify: `packages/db/prisma/schema.prisma`
- Create: `packages/db/prisma/migrations/20260811120000_agent_registry_expand/migration.sql`
- Create: `packages/db/src/agent-registry/migration-classifier.ts`
- Test: `packages/db/src/agent-registry/migration-classifier.test.ts`
- Modify: `packages/db/package.json`

**Interfaces:**
- Consumes: `AgentDefinitionV1` contract.
- Produces: `AgentLifecycleStatus`, `AgentDraftValidationStatus`, `AgentVersionPublicationSource`, expanded `Agent`, `AgentDraft`, and `AgentVersion` Prisma records; `classifyLegacyAgent()`.

- [ ] **Step 1: Write failing migration-classification tests**

```ts
expect(classifyLegacyAgent({ isActive: true, selectedVersionId: 'v1' })).toEqual({ lifecycle: 'PRODUCTION', reviewRequired: false });
expect(classifyLegacyAgent({ isActive: false, selectedVersionId: 'v1' }).reviewRequired).toBe(true);
expect(classifyLegacyAgent({ isActive: true, selectedVersionId: null }).lifecycle).toBe('DRAFT');
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `pnpm exec vitest run packages/db/src/agent-registry/migration-classifier.test.ts`
Expected: FAIL because the classifier is absent.

- [ ] **Step 3: Add the enums, additive nullable fields, draft table, composite keys, indexes, and relations**

The SQL migration must be behavior-neutral: no blanket lifecycle default/backfill, no immutability trigger, and no required constraint on unbackfilled columns.

- [ ] **Step 4: Implement deterministic classification and validate Prisma**

Run: `pnpm --filter @cerebro/db generate && pnpm exec prisma validate --schema packages/db/prisma/schema.prisma && pnpm exec vitest run packages/db/src/agent-registry/migration-classifier.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/db/prisma packages/db/src/agent-registry packages/db/package.json
git commit -m "feat: expand agent registry persistence"
```

### Task 3: Scoped repository and immutable publication persistence

**Files:**
- Modify: `packages/db/src/repositories/AgentRepository.ts`
- Create: `packages/db/src/repositories/AgentRepository.registry.test.ts`
- Modify: `packages/db/index.ts`

**Interfaces:**
- Produces: `listRegistryAgents()`, `getRegistryAgent()`, `getDraft()`, `updateDraft()`, `listVersions()`, `getVersion()`, `publishDraftTransaction()`, `transitionLifecycle()`, and `getActiveVersion()`.
- Error results: `AGENT_NOT_FOUND`, `AGENT_DRAFT_REVISION_CONFLICT`, `AGENT_DRAFT_BASE_VERSION_CONFLICT`, and publication concurrency errors.

- [ ] **Step 1: Write failing repository tests with a transaction-aware fake Prisma client**

```ts
it('does not change a stale draft update', async () => {
  await expect(repo.updateDraft('agent-1', { expectedRevision: 3, definition }, scoped)).rejects.toMatchObject({ code: 'AGENT_DRAFT_REVISION_CONFLICT' });
  expect(fake.draft.revision).toBe(4);
});

it('never returns an agent from another workspace', async () => {
  expect(await repo.getRegistryAgent('foreign', scoped)).toBeNull();
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm exec vitest run packages/db/src/repositories/AgentRepository.registry.test.ts`
Expected: FAIL because registry methods are absent.

- [ ] **Step 3: Implement focused repository methods using `options.tx` and workspace filters**

Do not expose arbitrary version updates, lifecycle setters, or unscoped ID reads. Publication creates the version, clones base runtime relations, moves the active pointer, and rebases the draft through one transaction client.

- [ ] **Step 4: Run repository tests and db typecheck**

Run: `pnpm exec vitest run packages/db/src/repositories/AgentRepository.registry.test.ts && pnpm --filter @cerebro/db typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/db/src/repositories/AgentRepository.ts packages/db/src/repositories/AgentRepository.registry.test.ts packages/db/index.ts
git commit -m "feat: add scoped agent registry repository"
```

### Task 4: RBAC, application services, publication, and lifecycle

**Files:**
- Modify: `packages/auth/src/rbac/permissions.ts`
- Modify: `packages/auth/src/types/index.ts`
- Create: `packages/domain/src/agents/AgentRegistryService.ts`
- Create: `packages/domain/src/agents/AgentDraftService.ts`
- Create: `packages/domain/src/agents/AgentPublicationService.ts`
- Create: `packages/domain/src/agents/AgentLifecycleService.ts`
- Create: `packages/domain/src/agents/AgentRegistryErrors.ts`
- Create: `packages/domain/src/agents/AgentRegistryServices.test.ts`
- Modify: `packages/domain/index.ts`

**Interfaces:**
- Produces capability-based create/edit/publish/transition use cases and typed result errors.
- Consumes repository methods, definition validator, UoW, audit logger, outbox publisher, and idempotency repository.

- [ ] **Step 1: Write failing service tests for role mapping, rollback, publication invalidation, and transition graph**

```ts
it('rejects publication while production', async () => {
  const result = await publication.publish(command, productionContext);
  expect(result.error?.code).toBe('AGENT_LIFECYCLE_CONFLICT');
});

it('resets certified to sandbox when a new definition is published', async () => {
  const result = await publication.publish(command, adminContext);
  expect(result.value?.lifecycle).toBe('SANDBOX');
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm --filter @cerebro/domain test -- AgentRegistryServices.test.ts`
Expected: FAIL because services and permissions are absent.

- [ ] **Step 3: Implement capability mapping and isolated application services**

Map read/create/edit/publish/certify/promote/suspend permissions to Viewer/Analyst, Developer, Admin, and Owner as specified. Keep policy outside repositories and ensure audit/outbox use the same transaction.

- [ ] **Step 4: Run service tests and typechecks**

Run: `pnpm --filter @cerebro/domain test -- AgentRegistryServices.test.ts && pnpm --filter @cerebro/domain typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/auth/src packages/domain/src/agents packages/domain/index.ts
git commit -m "feat: govern agent publication lifecycle"
```

### Task 5: Evolve `/v1/agents` API and server wiring

**Files:**
- Modify: `apps/platform-api/src/modules/agents/agents.routes.ts`
- Create: `apps/platform-api/src/modules/agents/agents.schemas.ts`
- Create: `apps/platform-api/src/modules/agents/agents.routes.test.ts`
- Modify: `apps/platform-api/src/server.ts`
- Modify: `apps/platform-api/package.json`

**Interfaces:**
- Produces list/create/detail, draft read/update, version history/detail, publish, and lifecycle endpoints.
- Consumes the four application services and contract schemas.

- [ ] **Step 1: Write failing Fastify injection tests**

```ts
it('redacts draft definition for read-only users', async () => {
  const response = await app.inject({ method: 'GET', url: '/v1/agents/a1/draft', headers: viewerHeaders });
  expect(response.statusCode).toBe(200);
  expect(response.json().data.definition).toBeUndefined();
});

it('maps stale autosave to 409', async () => {
  const response = await app.inject({ method: 'PATCH', url: '/v1/agents/a1/draft', payload: { expectedRevision: 2, definition } });
  expect(response.json().error.code).toBe('AGENT_DRAFT_REVISION_CONFLICT');
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm --filter @cerebro/platform-api test -- agents.routes.test.ts`
Expected: FAIL because registry routes are absent.

- [ ] **Step 3: Replace direct Prisma route access with service calls and typed schemas**

Preserve legacy response fields additively. Require an idempotency key for publish. Do not add generic version mutation or status patch endpoints.

- [ ] **Step 4: Run API tests and build**

Run: `pnpm --filter @cerebro/platform-api test -- agents.routes.test.ts && pnpm --filter @cerebro/platform-api build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/platform-api/src/modules/agents apps/platform-api/src/server.ts apps/platform-api/package.json
git commit -m "feat: expose agent registry API"
```

### Task 6: SDK and Studio data hooks

**Files:**
- Modify: `packages/sdk/src/clients/AgentClient.ts`
- Modify: `packages/sdk/package.json`
- Modify: `apps/studio/src/hooks/useAgent.ts`
- Create: `apps/studio/src/hooks/useAgentRegistry.ts`

**Interfaces:**
- Produces typed SDK methods `getDraft`, `updateDraft`, `listVersions`, `publishDraft`, and `transitionLifecycle`; TanStack queries/mutations with registry cache invalidation.

- [ ] **Step 1: Add compile-time contract usage and mutation tests where supported**

```ts
await client.updateDraft('a1', { expectedRevision: 4, definition });
await client.publishDraft('a1', { expectedDraftRevision: 5 }, 'idem-1');
await client.transitionLifecycle('a1', { action: 'enter_sandbox' });
```

- [ ] **Step 2: Run SDK typecheck and confirm missing methods**

Run: `pnpm --filter @cerebro/sdk typecheck`
Expected: FAIL until the new methods and types exist.

- [ ] **Step 3: Implement typed SDK methods and query/mutation hooks**

Use the configured platform base URL rather than the current hard-coded localhost URL. Invalidate list/detail/draft/version queries after successful mutations.

- [ ] **Step 4: Run SDK and Studio typechecks**

Run: `pnpm --filter @cerebro/sdk typecheck && pnpm --filter @cerebro/studio typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/sdk apps/studio/src/hooks
git commit -m "feat: add agent registry client hooks"
```

### Task 7: Studio registry list and create flow

**Files:**
- Modify: `apps/studio/app/(platform)/app/agents/page.tsx`
- Create: `apps/studio/components/agent-registry/AgentRegistryList.tsx`
- Create: `apps/studio/components/agent-registry/CreateAgentDialog.tsx`
- Create: `apps/studio/components/agent-registry/LifecycleBadge.tsx`

**Interfaces:**
- Consumes registry list/create hooks.
- Produces searchable/filterable list, explicit states, and permission-aware create dialog.

- [ ] **Step 1: Write the UI against typed hooks with loading, empty, error, and lifecycle states**

```tsx
<AgentRegistryList agents={data?.data ?? []} lifecycleFilter={filter} />
<CreateAgentDialog open={creating} onOpenChange={setCreating} />
```

- [ ] **Step 2: Replace the inert Create Agent button and legacy card assumptions**

Show owner, active version, lifecycle, draft validation, and last update. Do not show fabricated tags or runtime claims.

- [ ] **Step 3: Run Studio lint/typecheck**

Run: `pnpm --filter @cerebro/studio lint -- app/'(platform)'/app/agents components/agent-registry src/hooks && pnpm --filter @cerebro/studio typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add 'apps/studio/app/(platform)/app/agents/page.tsx' apps/studio/components/agent-registry
git commit -m "feat: build Studio agent registry list"
```

### Task 8: Studio agent detail, draft editor, version history, and lifecycle actions

**Files:**
- Modify: `apps/studio/app/(platform)/app/agents/[id]/page.tsx`
- Create: `apps/studio/components/agent-registry/AgentDraftEditor.tsx`
- Create: `apps/studio/components/agent-registry/AgentVersionHistory.tsx`
- Create: `apps/studio/components/agent-registry/AgentLifecycleActions.tsx`
- Create: `apps/studio/components/agent-registry/AgentGovernanceSummary.tsx`

**Interfaces:**
- Consumes detail/draft/version/publish/lifecycle hooks.
- Produces revision-aware autosave, validation display, immutable history inspection, and permission-aware lifecycle commands.

- [ ] **Step 1: Replace the mock designer/playground with registry tabs**

Use Overview, Draft, Versions, Governance, and Lifecycle. Mark tool and knowledge declarations as descriptive metadata only.

- [ ] **Step 2: Implement debounced autosave and conflict preservation**

```ts
if (error.code === 'AGENT_DRAFT_REVISION_CONFLICT') {
  setConflict({ serverRevision: error.currentRevision, localDefinition });
}
```

Never auto-merge or discard local content. Rebase UI state from the publish response revision after success.

- [ ] **Step 3: Implement publish and lifecycle confirmations**

Disable production publication and explain the suspend, publish, certify, promote workflow. Render path-addressed validation errors beside their fields.

- [ ] **Step 4: Run Studio lint/typecheck**

Run: `pnpm --filter @cerebro/studio lint -- 'app/(platform)/app/agents/[id]/page.tsx' components/agent-registry src/hooks && pnpm --filter @cerebro/studio typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add 'apps/studio/app/(platform)/app/agents/[id]/page.tsx' apps/studio/components/agent-registry
git commit -m "feat: build governed agent detail workspace"
```

### Task 9: Runtime active-version and lifecycle compatibility

**Files:**
- Modify: `apps/platform-api/src/modules/runtime/AgentExecutionProvider.ts`
- Modify: `packages/db/src/repositories/AgentRepository.ts`
- Test: `apps/platform-api/src/modules/runtime/AgentExecutionProvider.test.ts`

**Interfaces:**
- Produces production lifecycle guard and active-pointer version resolution with observable temporary fallback.

- [ ] **Step 1: Write failing runtime compatibility tests**

```ts
it('refuses a suspended agent before resolving a provider', async () => {
  const result = await provider.execute(suspendedExecution);
  expect(result).toMatchObject({ outcome: 'failed', reason: expect.stringContaining('not executable') });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm --filter @cerebro/platform-api test -- AgentExecutionProvider.test.ts`
Expected: FAIL because lifecycle is not enforced.

- [ ] **Step 3: Implement lifecycle-first resolution and active-pointer fallback instrumentation**

Fallback may select legacy highest version only while the migration flag is enabled. Lifecycle enforcement remains unconditional after activation.

- [ ] **Step 4: Run runtime and API tests**

Run: `pnpm --filter @cerebro/platform-api test -- AgentExecutionProvider.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/platform-api/src/modules/runtime packages/db/src/repositories/AgentRepository.ts
git commit -m "feat: enforce governed agent execution"
```

### Task 10: Backfill runner, constraint migration, and release evidence

**Files:**
- Create: `packages/db/src/agent-registry/backfill.ts`
- Create: `packages/db/src/agent-registry/backfill.test.ts`
- Create: `packages/db/prisma/migrations/20260811130000_agent_registry_constraints/migration.sql`
- Modify: `packages/db/package.json`
- Create: `docs/agent-registry/migration-runbook.md`

**Interfaces:**
- Produces dry-run/apply backfill, durable keyset checkpoints, before/after manifest, verification queries, constraints, and version immutability guard.

- [ ] **Step 1: Write failing idempotency/parity tests**

```ts
await runBackfill(fakeDb, { mode: 'apply', batchSize: 2 });
const second = await runBackfill(fakeDb, { mode: 'apply', batchSize: 2 });
expect(second.changed).toBe(0);
expect(fakeDb.agents.every(a => a.activeVersionId === legacyResolve(a))).toBe(true);
```

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm exec vitest run packages/db/src/agent-registry/backfill.test.ts`
Expected: FAIL because the runner is absent.

- [ ] **Step 3: Implement cursor-based backfill, manifest, verification, and post-backfill constraints**

Install the update guard only in the constraint migration. The runbook includes preflight, review disposition, dry run, apply, verify, cutover, fallback monitoring, and rollback commands.

- [ ] **Step 4: Run db tests, Prisma validation, and typecheck**

Run: `pnpm exec vitest run packages/db/src/agent-registry/backfill.test.ts && pnpm exec prisma validate --schema packages/db/prisma/schema.prisma && pnpm --filter @cerebro/db typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/db/src/agent-registry packages/db/prisma/migrations packages/db/package.json docs/agent-registry
git commit -m "feat: add agent registry migration cutover"
```

### Task 11: End-to-end verification and documentation sync

**Files:**
- Create: `apps/studio/e2e/agent-registry.spec.ts`
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-08-11-agent-academy-agent-registry-design.md` only if implementation evidence requires a factual correction

**Interfaces:**
- Verifies the complete vertical slice and records the supported operational boundary.

- [ ] **Step 1: Add the browser flow**

```ts
test('create, edit, publish, certify and promote an agent', async ({ page }) => {
  await page.goto('/app/agents');
  await page.getByRole('button', { name: 'Create agent' }).click();
  await page.getByLabel('Name').fill('Finance Analyst');
  await page.getByRole('button', { name: 'Create draft' }).click();
  await expect(page.getByText('Draft saved')).toBeVisible();
});
```

- [ ] **Step 2: Run focused suites**

Run: `pnpm --filter @cerebro/agent-registry-contracts test && pnpm --filter @cerebro/domain test && pnpm --filter @cerebro/platform-api test`
Expected: PASS.

- [ ] **Step 3: Run typechecks and production builds**

Run: `pnpm --filter @cerebro/agent-registry-contracts typecheck && pnpm --filter @cerebro/db typecheck && pnpm --filter @cerebro/domain typecheck && pnpm --filter @cerebro/sdk typecheck && pnpm --filter @cerebro/platform-api build && pnpm --filter @cerebro/studio typecheck`
Expected: PASS.

- [ ] **Step 4: Run the focused E2E test against the configured test stack**

Run: `pnpm --filter @cerebro/studio test:e2e -- e2e/agent-registry.spec.ts`
Expected: PASS when PostgreSQL, platform-api, and Studio test services are available; otherwise record the exact external-service blocker and retain passing component/API evidence.

- [ ] **Step 5: Commit**

```bash
git add apps/studio/e2e/agent-registry.spec.ts README.md docs/superpowers/specs/2026-08-11-agent-academy-agent-registry-design.md
git commit -m "test: verify agent registry vertical slice"
```
