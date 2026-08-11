import type { Page, Request } from '@playwright/test';

const demoGraph = {
  revision: 'playwright-demo',
  generatedAt: '2026-08-11T00:00:00.000Z',
  mode: 'demo',
  nodes: [
    { id: 'company', type: 'system', label: 'Cerebro Hive', status: 'healthy', departmentId: null, detailUrl: '/app/brain/company', tags: [], health: { score: 100, lastActivityAt: null }, summary: {} },
    { id: 'department-research', type: 'department', label: 'Research', status: 'healthy', departmentId: null, detailUrl: '/app/departments/research', tags: ['research'], health: { score: 100, lastActivityAt: null }, summary: {} },
    { id: 'agent-builder', type: 'agent', label: 'Builder', status: 'running', departmentId: 'department-research', detailUrl: '/app/agents/builder', tags: ['research'], health: { score: 95, lastActivityAt: null }, summary: {} },
  ],
  edges: [
    { id: 'department-research-agent-builder', source: 'department-research', target: 'agent-builder', relationship: 'REPORTS_TO', status: 'healthy', lastActivityAt: null, intensity: 1 },
  ],
};

export async function mockCompanyOperatingSystemDemo(page: Page) {
  await page.setExtraHTTPHeaders({ Authorization: 'Bearer playwright-company-os' });
  await page.route('http://localhost:4000/api/operating-system/graph?mode=demo', async (route) => {
    assertPlatformRequest(route.request(), '/api/operating-system/graph?mode=demo');
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: demoGraph }) });
  });
  await page.route('http://localhost:4000/api/operating-system/entities/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    assertPlatformRequest(request, url.pathname);
    const [, entityType, entityId] = url.pathname.match(/\/entities\/([^/]+)\/([^/]+)$/) ?? [];
    const decodedId = entityId ? decodeURIComponent(entityId) : '';
    const node = demoGraph.nodes.find(
      (candidate) => candidate.type === entityType && candidate.id === decodedId,
    );
    if (!node) {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'ENTITY_NOT_FOUND', message: 'Unknown demo entity' }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { node, metrics: { workload: 1 }, relationships: demoGraph.edges, actions: [{ id: 'open', label: 'Open canonical record', href: node.detailUrl }] } }),
    });
  });
}

function assertPlatformRequest(
  request: Request,
  expectedPath: string,
) {
  const url = new URL(request.url());
  if (request.method() !== 'GET' || `${url.pathname}${url.search}` !== expectedPath) {
    throw new Error(`Unexpected Company OS request: ${request.method()} ${url.pathname}${url.search}`);
  }
  const headers = request.headers();
  if (headers.authorization !== 'Bearer playwright-company-os') {
    throw new Error('Company OS request is missing the authenticated browser context');
  }
  if (headers['x-workspace-id'] !== 'prod') {
    throw new Error(`Company OS request has unexpected workspace: ${headers['x-workspace-id'] ?? 'missing'}`);
  }
  if (!/^studio-/.test(headers['x-trace-id'] ?? '')) {
    throw new Error('Company OS request is missing a Studio trace ID');
  }
}
