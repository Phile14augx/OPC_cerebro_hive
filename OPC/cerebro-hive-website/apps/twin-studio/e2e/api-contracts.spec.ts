import { expect, test, type APIRequestContext } from '@playwright/test';

const FOREIGN_WORKSPACE = '00000000-0000-4000-8000-999999999999';
const FOREIGN_TWIN_ID = 'b5e05524-2e6a-4a23-bb44-6e606d64265d';

async function json(request: APIRequestContext, path: string, init?: Parameters<APIRequestContext['fetch']>[1]) {
  const response = await request.fetch(path, init);
  const body = (await response.json().catch(() => ({}))) as {
    data?: Record<string, unknown> | Record<string, unknown>[];
    error?: { code?: string; message?: string };
  };
  return { status: response.status(), body };
}

test.describe('Twin Studio Playwright API contracts', () => {
  test('gate 2: local auth ignores a foreign workspace header', async ({ request }) => {
    const without = await json(request, '/app/api/twins');
    const withHeader = await json(request, '/app/api/twins', {
      headers: { 'x-workspace-id': FOREIGN_WORKSPACE },
    });
    expect(without.status).toBe(200);
    expect(withHeader.status).toBe(200);
    const left = ((without.body.data as Array<{ id: string }>) ?? []).map((twin) => twin.id).sort();
    const right = ((withHeader.body.data as Array<{ id: string }>) ?? []).map((twin) => twin.id).sort();
    expect(right).toEqual(left);
  });

  test('gate 5: Ask Twin without keys is LLM_UNAVAILABLE', async ({ request }) => {
    const twins = await json(request, '/app/api/twins');
    const factory = ((twins.body.data as Array<{ id: string; name: string }>) ?? []).find(
      (twin) => twin.name === 'Factory Alpha',
    );
    expect(factory).toBeTruthy();
    const asked = await json(request, `/app/api/twins/${factory!.id}/ask`, {
      method: 'POST',
      data: { prompt: 'What is Motor-07 vibration?' },
    });
    expect(asked.status).toBe(503);
    expect(asked.body.error?.code).toBe('LLM_UNAVAILABLE');
  });

  test('gate 8: foreign twin id is 404 TWIN_NOT_FOUND', async ({ request }) => {
    const missing = await json(request, `/app/api/twins/${FOREIGN_TWIN_ID}`);
    expect(missing.status).toBe(404);
    expect(missing.body.error?.code).toBe('TWIN_NOT_FOUND');
    expect(missing.body.data).toBeUndefined();
  });

  test('gate 10: invalid JSON ingest is 400 VALIDATION_ERROR', async ({ request }) => {
    const twins = await json(request, '/app/api/twins');
    const factory = ((twins.body.data as Array<{ id: string; name: string }>) ?? []).find(
      (twin) => twin.name === 'Factory Alpha',
    );
    const response = await request.fetch(`/app/api/twins/${factory!.id}/state`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      data: '{not json',
    });
    const body = (await response.json()) as { error?: { code?: string; message?: string } };
    expect(response.status()).toBe(400);
    expect(body.error?.code).toBe('VALIDATION_ERROR');
    expect(body.error?.message).toMatch(/valid JSON|invalid fields/i);
  });

  test('phase 2: graph and events endpoints are tenant-scoped and persisted', async ({ request }) => {
    const twins = await json(request, '/app/api/twins');
    const factory = ((twins.body.data as Array<{ id: string; name: string }>) ?? []).find(
      (twin) => twin.name === 'Factory Alpha',
    );
    expect(factory).toBeTruthy();
    const graph = await json(request, `/app/api/twins/${factory!.id}/graph`);
    expect(graph.status).toBe(200);
    const edges = ((graph.body.data as { edges?: Array<{ type: string; fromKey: string; toKey: string }> })?.edges ?? []);
    expect(edges.some((edge) => edge.type === 'installed-on' && edge.fromKey === 'motor-07' && edge.toKey === 'line-a')).toBe(
      true,
    );
    const events = await json(request, `/app/api/twins/${factory!.id}/events`);
    expect(events.status).toBe(200);
    expect(Array.isArray(events.body.data)).toBe(true);
    const missing = await json(request, `/app/api/twins/${FOREIGN_TWIN_ID}/events`);
    expect(missing.status).toBe(404);
    expect(missing.body.error?.code).toBe('TWIN_NOT_FOUND');
  });
});
