import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs/promises';
import { fork } from 'child_process';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const TMP_DIR = path.join(__dirname, '..', '..', 'tmp-concurrency');

describe('LeaseStore Concurrency', () => {
  beforeAll(async () => {
    await fs.rm(TMP_DIR, { recursive: true, force: true });
    await fs.mkdir(TMP_DIR, { recursive: true });
  });

  afterAll(async () => {
    await fs.rm(TMP_DIR, { recursive: true, force: true });
  });

  it('exactly one child acquires the lease, other receives MULTIPLE_WRITERS', async () => {
    const script = path.join(__dirname, 'worker.ts');
    
    // Create the worker script
    const workerCode = `
import { LeaseStore } from '../../src/runtime/lease-store.js';

const store = new LeaseStore('${TMP_DIR.replace(/\\/g, '\\\\')}', 5000);
const manifest = {
  schema_version: '1',
  control_plane_version: '1',
  validator_version: '1',
  source_commit: '1',
  run_id: 'run1',
  execution_id: 'ex1',
  actor_id: process.argv[2],
  access_mode: 'rw',
  live_control_path: 'a',
  live_control_sha256: 'sha123',
  live_epoch: 1,
  parser_version: '1',
  repository_id: 'repo1',
  object_ids: ['res1'],
  tree_ids: [],
  refs: [],
  registry_digests: [],
  gate_results: [],
  reason_codes: [],
  planned_mutations: [],
  publication_target: 't',
  redaction_result: 'r'
};

async function run() {
  try {
    const lease = await store.acquire('res1', manifest);
    if (process.send) {
      process.send({ status: 'acquired', token: lease.fencing_token });
    }
  } catch (err: any) {
    if (process.send) {
      process.send({ status: 'error', code: err.code });
    }
  }
}
run();
    `;
    await fs.writeFile(script, workerCode);

    const runWorker = (actorId: string) => {
      return new Promise((resolve) => {
        const child = fork(script, [actorId], {
          execArgv: ['--import', 'tsx']
        });
        child.on('message', (msg) => resolve(msg));
      });
    };

    const results = await Promise.all([
      runWorker('CODEX_B1'),
      runWorker('CODEX_B2'),
      runWorker('CODEX_B3')
    ]);
    
    const acquired = results.filter((r: unknown) => (r as {status: string}).status === 'acquired');
    const errors = results.filter((r: unknown) => (r as {status: string}).status === 'error');

    expect(acquired.length).toBe(1);
    expect(errors.length).toBe(2);
    expect(errors.every((e: unknown) => (e as {code: string}).code === 'MULTIPLE_WRITERS')).toBe(true);

    await fs.unlink(script);
  });
});
