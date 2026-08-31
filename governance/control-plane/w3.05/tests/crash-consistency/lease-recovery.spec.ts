import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs/promises';
import { LeaseStore } from '../../src/runtime/lease-store.js';
import type { RunManifest } from '../../src/types.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const TMP_DIR = path.join(__dirname, '..', '..', 'tmp-crash');

function createManifest(overrides: Partial<RunManifest> = {}): RunManifest {
  return {
    schema_version: '1',
    control_plane_version: '1',
    validator_version: '1',
    source_commit: '1',
    run_id: 'run1',
    execution_id: 'ex1',
    actor_id: 'CODEX_B1',
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
    redaction_result: 'r',
    ...overrides
  } as RunManifest;
}

describe('LeaseStore Crash Consistency and Recovery', () => {
  let store: LeaseStore;

  beforeAll(async () => {
    await fs.rm(TMP_DIR, { recursive: true, force: true });
    await fs.mkdir(TMP_DIR, { recursive: true });
    store = new LeaseStore(TMP_DIR, 500); // short TTL for expiry tests
  });

  afterAll(async () => {
    await fs.rm(TMP_DIR, { recursive: true, force: true });
  });

  it('handles expiry and reassignment', async () => {
    const resId = 'res-expiry';
    const m1 = createManifest({ actor_id: 'CODEX_B1', object_ids: [resId] });
    const lease1 = await store.acquire(resId, m1, 100); // 100ms TTL

    // Immediately try to reassign, should fail
    const m2 = createManifest({ actor_id: 'CODEX_B2', object_ids: [resId] });
    await expect(store.acquire(resId, m2)).rejects.toThrow(/MULTIPLE_WRITERS/);

    // Wait for expiry
    await new Promise(r => setTimeout(r, 150));
    
    // Now CODEX_B2 can acquire it
    const lease2 = await store.acquire(resId, m2);
    expect(lease2.fencing_token).toBeGreaterThan(lease1.fencing_token);
  });

  it('rejects token regression (stale token)', async () => {
    const resId = 'res-stale';
    const m1 = createManifest({ object_ids: [resId] });
    const lease1 = await store.acquire(resId, m1);

    await expect(store.renew(resId, lease1.fencing_token - 1)).rejects.toThrow(/FENCING_TOKEN_STALE/);
  });

  it('handles missing store gracefully', async () => {
    const resId = 'res-missing';
    const m1 = createManifest({ object_ids: [resId] });
    // First acquire will create the missing store directory implicitly
    const lease = await store.acquire(resId, m1);
    expect(lease).toBeDefined();
  });

  it('handles malformed state', async () => {
    const resId = 'res-malformed';
    const m1 = createManifest({ object_ids: [resId] });
    await store.acquire(resId, m1);

    // Corrupt the file
    const safeName = resId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const leaseFile = path.join(TMP_DIR, safeName, 'lease.json');
    await fs.writeFile(leaseFile, '{ invalid json');

    await expect(store.acquire(resId, m1)).rejects.toThrow(/LEASE_CORRUPT/);
  });

  it('rejects epoch/hash change', async () => {
    const resId = 'res-epoch';
    const m1 = createManifest({ object_ids: [resId] });
    await store.acquire(resId, m1);

    // Another run tries to acquire with changed epoch
    const m2 = createManifest({ actor_id: 'CODEX_B1', object_ids: [resId], live_epoch: 2 });
    await expect(store.acquire(resId, m2)).rejects.toThrow(/CONTROL_CHANGED/);
  });

  it('recovers from owner crash (orphaned lock)', async () => {
    const resId = 'res-crash';
    const m1 = createManifest({ object_ids: [resId] });
    
    // Create an orphaned mutex lock directory
    const safeName = resId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const lockDir = path.join(TMP_DIR, safeName);
    await fs.mkdir(lockDir, { recursive: true });
    const lockFile = path.join(lockDir, 'mutex.lock.d');
    await fs.mkdir(lockFile);

    // Mutate modification time to be in the past (simulate old lock)
    const past = new Date(Date.now() - 6000);
    await fs.utimes(lockFile, past, past);

    // Should successfully acquire because the lock is older than 5s
    const lease = await store.acquire(resId, m1);
    expect(lease).toBeDefined();
  });

  it('rejects negative TTL', async () => {
    const resId = 'res-neg-ttl';
    const m1 = createManifest({ object_ids: [resId] });
    await expect(store.acquire(resId, m1, -100)).rejects.toThrow(/INVALID_TTL/);
  });

  it('rejects lease acquisition when clock shifts backwards', async () => {
    const resId = 'res-clock-back';
    const m1 = createManifest({ object_ids: [resId] });
    await store.acquire(resId, m1);

    // Mock Date.now() to return a time in the past
    const originalDateNow = Date.now;
    Date.now = () => originalDateNow() - 10000;

    try {
      // Trying to acquire or renew when clock has shifted backwards
      await expect(store.acquire(resId, m1)).rejects.toThrow(/CLOCK_ROLLBACK/);
    } finally {
      Date.now = originalDateNow;
    }
  });

  it('rejects lease renewal when clock shifts backwards', async () => {
    const resId = 'res-clock-back-renew';
    const m1 = createManifest({ object_ids: [resId] });
    const lease = await store.acquire(resId, m1);

    // Mock Date.now() to return a time in the past
    const originalDateNow = Date.now;
    Date.now = () => originalDateNow() - 10000;

    try {
      await expect(store.renew(resId, lease.fencing_token)).rejects.toThrow(/CLOCK_ROLLBACK/);
    } finally {
      Date.now = originalDateNow;
    }
  });
});
