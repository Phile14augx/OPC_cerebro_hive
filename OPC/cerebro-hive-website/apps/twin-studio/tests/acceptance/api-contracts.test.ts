import { randomUUID } from 'node:crypto';
import { beforeAll, describe, expect, it } from 'vitest';
import { BASE_URL, loadTwinStudioEnv } from './env';

loadTwinStudioEnv();

const API = `${BASE_URL}/app/api`;
const FOREIGN_WORKSPACE = '00000000-0000-4000-8000-999999999999';
const FOREIGN_TWIN_ID = 'b5e05524-2e6a-4a23-bb44-6e606d64265d';

type Json = Record<string, unknown>;

async function json(path: string, init?: RequestInit) {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });
  const body = (await response.json().catch(() => ({}))) as {
    data?: Json | Json[];
    error?: { code?: string; message?: string };
  };
  return { status: response.status, body };
}

async function serverAvailable() {
  try {
    const response = await fetch(`${API}/twins`);
    return response.status < 500;
  } catch {
    return false;
  }
}

const live = await serverAvailable();

describe.skipIf(!live)('Twin Studio API acceptance', () => {
  let factoryId = '';
  let motorId = '';
  let createdId = '';

  beforeAll(async () => {
    const twins = await json('/twins');
    const list = (twins.body.data as Json[]) ?? [];
    const factory = list.find((twin) => twin['name'] === 'Factory Alpha');
    expect(factory).toBeTruthy();
    factoryId = String(factory!['id']);
    const detail = await json(`/twins/${factoryId}`);
    const entities = (detail.body.data as Json)['entities'] as Json[];
    motorId = String(entities.find((entity) => entity['key'] === 'motor-07')?.['id'] ?? '');
    expect(motorId).toBeTruthy();
  });

  it('gate 2: local auth ignores a foreign x-workspace-id header', async () => {
    const without = await json('/twins');
    const withHeader = await json('/twins', { headers: { 'x-workspace-id': FOREIGN_WORKSPACE } });
    expect(without.status).toBe(200);
    expect(withHeader.status).toBe(200);
    const left = ((without.body.data as Json[]) ?? []).map((twin) => twin['id']).sort();
    const right = ((withHeader.body.data as Json[]) ?? []).map((twin) => twin['id']).sort();
    expect(right).toEqual(left);
    expect(left.length).toBeGreaterThan(0);
  });

  it('gate 3: created twins persist by id after reload', async () => {
    const name = `Acceptance API ${Date.now()}`;
    const created = await json('/twins', {
      method: 'POST',
      body: JSON.stringify({ name, type: 'GENERIC' }),
    });
    expect(created.status).toBe(201);
    createdId = String((created.body.data as Json)['id']);
    const editedName = `${name} Edited`;
    const patched = await json(`/twins/${createdId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: editedName }),
    });
    expect(patched.status).toBe(200);
    const reloaded = await json(`/twins/${createdId}`);
    expect(reloaded.status).toBe(200);
    expect((reloaded.body.data as Json)['id']).toBe(createdId);
    expect((reloaded.body.data as Json)['name']).toBe(editedName);
  });

  it('gate 5: Ask Twin without an LLM key returns 503 LLM_UNAVAILABLE', async () => {
    const asked = await json(`/twins/${factoryId}/ask`, {
      method: 'POST',
      body: JSON.stringify({ prompt: 'What is Motor-07 vibration?' }),
    });
    expect(asked.status).toBe(503);
    expect(asked.body.error?.code).toBe('LLM_UNAVAILABLE');
    expect(asked.body.data).toBeUndefined();
  });

  it('gate 6 and 7: OBSERVED ingest stays observed after a SIMULATED tick', async () => {
    const now = new Date().toISOString();
    const ingested = await json(`/twins/${factoryId}/state`, {
      method: 'POST',
      body: JSON.stringify({
        entityId: motorId,
        state: { vibration: 3.4, sourceMarker: 'acceptance-api' },
        provenance: {
          source: 'acceptance-api-sensor',
          classification: 'OBSERVED',
          observedAt: now,
          effectiveAt: now,
          ingestedAt: now,
          confidence: 1,
          quality: 1,
          evidenceIds: ['acceptance-api-sensor'],
        },
      }),
    });
    expect(ingested.status).toBe(201);
    const historyRow = (ingested.body.data as Json)['history'] as Json;
    expect(historyRow['classification']).toBe('OBSERVED');
    expect(historyRow['source']).toBe('acceptance-api-sensor');
    const simulated = await json(`/twins/${factoryId}/simulator`, {
      method: 'POST',
      body: JSON.stringify({ tick: 1 }),
    });
    expect(simulated.status).toBe(200);
    const history = await json(`/twins/${factoryId}/state?entityId=${encodeURIComponent(motorId)}`);
    const rows = (history.body.data as Json[]) ?? [];
    expect(rows.some((row) => row['classification'] === 'OBSERVED' && row['source'] === 'acceptance-api-sensor')).toBe(
      true,
    );
    expect(
      rows.some(
        (row) => row['classification'] === 'SIMULATED' && String(row['source']).includes('twin-observation-simulator'),
      ),
    ).toBe(true);
    const latestSimulated = rows.find((row) => row['classification'] === 'SIMULATED');
    expect(latestSimulated).toBeTruthy();
    expect((latestSimulated!['state'] as Json)['sourceMarker']).toBeUndefined();
    expect((latestSimulated!['state'] as Json)['vibration']).toBeTypeOf('number');
  });

  it('gate 8: a foreign-tenant twin is 404 TWIN_NOT_FOUND', async () => {
    const missing = await json(`/twins/${randomUUID()}`);
    expect(missing.status).toBe(404);
    expect(missing.body.error?.code).toBe('TWIN_NOT_FOUND');
    const foreign = await json(`/twins/${FOREIGN_TWIN_ID}`);
    expect(foreign.status).toBe(404);
    expect(foreign.body.error?.code).toBe('TWIN_NOT_FOUND');
    expect(foreign.body.data).toBeUndefined();
  });

  it('gate 9: reject leaves the live version unchanged, apply increments, re-apply is 409', async () => {
    const hospitalList = await json('/twins');
    const hospital = ((hospitalList.body.data as Json[]) ?? []).find((twin) => twin['name'] === 'Northstar Hospital ICU');
    expect(hospital).toBeTruthy();
    const hospitalId = String(hospital!['id']);
    const current = await json(`/twins/${hospitalId}`);
    const liveBefore = Number(((current.body.data as Json)['activeVersion'] as Json)['versionNumber']);
    const definition = ((current.body.data as Json)['activeVersion'] as Json)['definition'] as Json;
    const now = new Date().toISOString();
    const provenance = {
      source: 'acceptance-api',
      classification: 'INFERRED',
      observedAt: now,
      effectiveAt: now,
      ingestedAt: now,
      confidence: 0.9,
      quality: 1,
      evidenceIds: ['acceptance-api'],
    };
    const first = await json(`/twins/${hospitalId}/versions`, {
      method: 'POST',
      body: JSON.stringify({
        definition: {
          ...definition,
          rules: [...((definition['rules'] as Json[]) ?? []), { key: `reject-${Date.now()}`, expression: 'occupancy == true' }],
        },
        provenance,
      }),
    });
    expect(first.status).toBe(201);
    const rejected = await json(`/twins/${hospitalId}/versions`, {
      method: 'POST',
      body: JSON.stringify({ action: 'REJECT', proposalId: (first.body.data as Json)['id'], reason: 'acceptance' }),
    });
    expect(rejected.status).toBe(200);
    const afterReject = await json(`/twins/${hospitalId}`);
    expect(Number(((afterReject.body.data as Json)['activeVersion'] as Json)['versionNumber'])).toBe(liveBefore);
    const second = await json(`/twins/${hospitalId}/versions`, {
      method: 'POST',
      body: JSON.stringify({
        definition: {
          ...definition,
          rules: [...((definition['rules'] as Json[]) ?? []), { key: `apply-${Date.now()}`, expression: 'oxygen-flow > 9' }],
        },
        provenance,
      }),
    });
    expect(second.status).toBe(201);
    const applied = await json(`/twins/${hospitalId}/versions`, {
      method: 'POST',
      body: JSON.stringify({ action: 'APPLY', proposalId: (second.body.data as Json)['id'], approved: true }),
    });
    expect(applied.status).toBe(200);
    expect((applied.body.data as Json)['versionNumber']).toBe(liveBefore + 1);
    const replay = await json(`/twins/${hospitalId}/versions`, {
      method: 'POST',
      body: JSON.stringify({ action: 'APPLY', proposalId: (second.body.data as Json)['id'], approved: true }),
    });
    expect(replay.status).toBe(409);
    expect(replay.body.error?.code).toBe('PROPOSAL_NOT_FOUND_OR_ALREADY_APPLIED');
  });
});
