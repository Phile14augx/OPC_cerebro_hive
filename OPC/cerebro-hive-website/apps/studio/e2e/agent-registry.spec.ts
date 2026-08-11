import { expect, test } from '@playwright/test';
import type { AgentDefinitionV1, AgentLifecycleStatus, AgentRegistryRecordDto, AgentVersionDto } from '@cerebro/agent-registry-contracts';

const definition: AgentDefinitionV1 = {
  schemaVersion: 1,
  purpose: 'Analyze approved finance records',
  businessFunction: 'Finance',
  responsibilities: ['Analyze approved records'],
  expectedOutputs: ['A sourced finance summary'],
  systemInstructions: 'Use only approved financial data.',
  modelConfig: { providerRef: 'provider:openai', modelRef: 'model:gpt-5', temperature: 0.2, maxTokens: 4096 },
  capabilities: [], allowedActions: [], prohibitedActions: [], escalationRules: [],
  securityLevel: 'CONFIDENTIAL', toolPermissions: [], knowledgeSources: [],
};

test('create, edit, publish, inspect and govern an agent', async ({ page }) => {
  let revision = 1;
  let lifecycleStatus: AgentLifecycleStatus = 'DRAFT';
  let activeVersion: AgentVersionDto | null = null;
  let agents: AgentRegistryRecordDto[] = [];
  let draftDefinition = definition;

  await page.route('**/api/v1/agents**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const reply = (data: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ success: true, data }) });

    if (path.endsWith('/api/v1/agents') && request.method() === 'GET') return reply(agents);
    if (path.endsWith('/api/v1/agents') && request.method() === 'POST') {
      const body = request.postDataJSON();
      agents = [{ id: 'agent-1', workspaceId: 'workspace-1', name: body.name, description: body.description ?? null, lifecycleStatus, ownerId: 'user-1', activeVersionId: null, activeVersion: null, draft: { id: 'draft-1', agentId: 'agent-1', baseVersionId: null, revision, validationStatus: 'UNVALIDATED', validationErrors: [], updatedBy: 'user-1', updatedAt: new Date().toISOString() }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
      return reply(agents[0], 201);
    }
    if (path.endsWith('/draft') && request.method() === 'GET') return reply({ ...agents[0]!.draft, definition: draftDefinition, revision });
    if (path.endsWith('/draft') && request.method() === 'PATCH') { revision += 1; draftDefinition = request.postDataJSON().definition; agents[0]!.draft!.revision = revision; return reply({ ...agents[0]!.draft, definition: draftDefinition, revision }); }
    if (path.endsWith('/versions') && request.method() === 'GET') return reply(activeVersion ? [activeVersion] : []);
    if (path.endsWith('/publish') && request.method() === 'POST') {
      activeVersion = { id: 'version-1', agentId: 'agent-1', version: 1, definition: draftDefinition, definitionHash: 'sha256-demo', publishedBy: 'admin-1', publishedAt: new Date().toISOString() };
      revision += 1; agents[0] = { ...agents[0]!, activeVersionId: activeVersion.id, activeVersion, draft: { ...agents[0]!.draft!, revision, baseVersionId: activeVersion.id } };
      return reply({ agent: agents[0], version: activeVersion, draft: agents[0]!.draft }, 201);
    }
    if (path.endsWith('/lifecycle') && request.method() === 'POST') { lifecycleStatus = 'SANDBOX'; agents[0]!.lifecycleStatus = lifecycleStatus; return reply(agents[0]); }
    if (path.endsWith('/agent-1') && request.method() === 'GET') return reply(agents[0]);
    return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ success: false }) });
  });

  await page.goto('/app/agents', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Create agent' }).click();
  await page.getByLabel('Name').fill('Finance Analyst');
  await page.getByLabel('Description').fill('Governed financial analysis');
  await page.getByRole('button', { name: 'Create draft' }).click();
  await expect(page.getByRole('heading', { name: 'Finance Analyst' })).toBeVisible();

  await page.getByRole('button', { name: /^draft$/i }).click();
  const editor = page.getByLabel('Agent definition JSON');
  await editor.fill(JSON.stringify({ ...definition, purpose: 'Analyze governed finance records' }, null, 2));
  await expect(page.getByText(/optimistic revision 2/)).toBeVisible({ timeout: 5_000 });

  await page.getByRole('button', { name: 'Publish version' }).click();
  await expect(page.getByText('Version 1')).toBeVisible();
  await page.getByRole('button', { name: /^lifecycle$/i }).click();
  await page.getByRole('button', { name: 'Move to sandbox' }).click();
  await expect(page.locator('header').getByText('SANDBOX', { exact: true })).toBeVisible();
});
