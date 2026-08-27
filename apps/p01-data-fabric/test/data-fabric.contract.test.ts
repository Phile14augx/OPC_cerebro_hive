import assert from 'node:assert/strict';
import test from 'node:test';
import { BadRequestException } from '@nestjs/common';
import { IngestionService } from '../src/ingestion/ingestion.service';
import { IngestionController } from '../src/ingestion/ingestion.controller';
import { TransformationService } from '../src/transformation/transformation.service';
import { TransformationController } from '../src/transformation/transformation.controller';
import { FederationQueryError, FederationService } from '../src/federation/federation.service';
import { FederationController } from '../src/federation/federation.controller';
import type { IConnector } from '../src/ingestion/connectors/connector.interface';
import type { IFederationEngine } from '../src/federation/engines/federation.interface';

const connector = (label: string): IConnector & { label: string } => ({
  label, async connect() {}, async disconnect() {}, async ingest() {},
});
const engine = (outcome: unknown[] | Error): IFederationEngine => ({
  async query() { if (outcome instanceof Error) throw outcome; return outcome; },
});

test('connector registry validates, dispatches, rejects duplicates, and isolates factory failures', () => {
  const service = new IngestionService();
  service.registerConnectorFactory('memory', (config) => connector(String(config.label)));
  const created = service.createConnector({ id: 'events', type: 'memory', config: { label: 'primary' } });
  assert.equal(created.id, 'events');
  assert.equal((created.connector as IConnector & { label: string }).label, 'primary');
  assert.throws(() => service.registerConnectorFactory('memory', () => connector('x')), /already registered/i);
  assert.throws(() => service.createConnector({ id: 'x', type: 'unknown' }), /unknown connector type/i);
  let fail = true;
  service.registerConnectorFactory('flaky', () => { if (fail) throw new Error('offline'); return connector('ok'); });
  assert.throws(() => service.createConnector({ id: 'retry', type: 'flaky' }), /offline/);
  fail = false;
  assert.equal(service.createConnector({ id: 'retry', type: 'flaky' }).id, 'retry');
  assert.throws(() => service.createConnector({ id: 'retry', type: 'flaky' }), /already exists/i);
});

test('transformations apply ordered operations to a clone and persist completed state', async () => {
  const service = new TransformationService();
  const input = { user: { first: 'Ada', stale: true } };
  const job = await service.triggerJob({ id: 'job-1', input, steps: [
    { operation: 'rename', from: 'user.first', to: 'user.name' },
    { operation: 'set', path: 'user.display', value: { text: 'Ada' } },
    { operation: 'remove', path: 'user.stale' },
  ] });
  assert.deepEqual(job, { id: 'job-1', status: 'completed', result: { user: { name: 'Ada', display: { text: 'Ada' } } } });
  assert.deepEqual(input, { user: { first: 'Ada', stale: true } });
  job.result.user.display.text = 'changed';
  assert.equal(service.getJob('job-1')?.result?.user.display.text, 'Ada');
});

test('transformation failures persist failed state and leave input unchanged', async () => {
  const service = new TransformationService();
  const input = { user: { name: 'Ada' } };
  await assert.rejects(service.triggerJob({ id: 'bad', input, steps: [
    { operation: 'rename', from: 'user.missing', to: 'user.name' },
  ] }), /does not exist/i);
  assert.deepEqual(input, { user: { name: 'Ada' } });
  assert.deepEqual(service.getJob('bad'), { id: 'bad', status: 'failed', error: 'Path "user.missing" does not exist' });
});

test('federation validates SELECT/WITH and returns ordered source-tagged results', async () => {
  const service = new FederationService();
  service.registerSource('warehouse', engine([{ id: 1 }]));
  service.registerSource('lake', engine([{ id: 2 }]));
  assert.deepEqual(await service.executeQuery({ sql: 'WITH x AS (SELECT 1) SELECT * FROM x', sources: ['lake', 'warehouse'] }), {
    status: 'completed', results: [{ source: 'lake', rows: [{ id: 2 }] }, { source: 'warehouse', rows: [{ id: 1 }] }], errors: [],
  });
  await assert.rejects(service.executeQuery({ sql: 'SELECT 1', sources: ['lake', 'lake'] }), /unique/i);
  await assert.rejects(service.executeQuery({ sql: 'DELETE FROM x' }), /SELECT or WITH/i);
});

test('federation propagates partial, fail-fast, and total failures', async () => {
  const service = new FederationService();
  service.registerSource('ok', engine([{ ok: true }]));
  service.registerSource('broken', engine(new Error('offline')));
  service.registerSource('timeout', engine(new Error('timeout')));
  assert.deepEqual(await service.executeQuery({ sql: 'SELECT 1', sources: ['ok', 'broken'], failureMode: 'partial' }), {
    status: 'partial', results: [{ source: 'ok', rows: [{ ok: true }] }], errors: [{ source: 'broken', message: 'offline' }],
  });
  await assert.rejects(service.executeQuery({ sql: 'SELECT 1', sources: ['broken', 'ok'], failureMode: 'fail-fast' }),
    (error: unknown) => error instanceof FederationQueryError && error.source === 'broken');
  await assert.rejects(service.executeQuery({ sql: 'SELECT 1', sources: ['broken', 'timeout'] }),
    (error: unknown) => error instanceof AggregateError && error.errors.length === 2);
});

test('controllers perform runtime request validation', () => {
  const ingestion = new IngestionController(new IngestionService());
  const transformation = new TransformationController(new TransformationService());
  const federation = new FederationController(new FederationService());
  assert.throws(() => ingestion.createConnector(null), BadRequestException);
  assert.throws(() => ingestion.createConnector({ id: 'x' }), BadRequestException);
  assert.throws(() => transformation.triggerJob({ id: 'x', input: {}, steps: 'bad' }), BadRequestException);
  assert.throws(() => federation.executeQuery({ sql: 42 }), BadRequestException);
});
