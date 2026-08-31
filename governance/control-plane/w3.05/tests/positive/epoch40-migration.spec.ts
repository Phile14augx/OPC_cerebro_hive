import { describe, it, expect } from 'vitest';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs/promises';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.join(__dirname, '..', 'fixtures', 'epoch40');

describe('Epoch 40 Migration Fixture', () => {
  it('should capture only approved/redacted evidence', async () => {
    const liveControlPath = path.join(FIXTURE_DIR, 'live-control.yaml');
    const content = await fs.readFile(liveControlPath, 'utf8');
    expect(content).toContain('epoch: 40');
    expect(content).toContain('supersedes_epoch: 39');
    expect(content).not.toContain('secret');
  });

  it('should mark fixture authority explicitly', async () => {
    const dummyRegistryPath = path.join(FIXTURE_DIR, 'registries', 'dummy.json');
    const dummyEvidencePath = path.join(FIXTURE_DIR, 'evidence', 'dummy.json');
    const liveControlPath = path.join(FIXTURE_DIR, 'live-control.yaml');
    const readmePath = path.join(FIXTURE_DIR, 'README.md');

    const [reg, ev, lc, readme] = await Promise.all([
      fs.readFile(dummyRegistryPath, 'utf8'),
      fs.readFile(dummyEvidencePath, 'utf8'),
      fs.readFile(liveControlPath, 'utf8'),
      fs.readFile(readmePath, 'utf8')
    ]);

    expect(JSON.parse(reg).authority).toBe('NON_AUTHORITATIVE_TEST_FIXTURE');
    expect(JSON.parse(ev).authority).toBe('NON_AUTHORITATIVE_TEST_FIXTURE');
    expect(lc).toContain('authority: NON_AUTHORITATIVE_TEST_FIXTURE');
    expect(readme).toContain('Authority: NON_AUTHORITATIVE_TEST_FIXTURE');
    expect(readme).toContain('Source digest:');
    expect(readme).toContain('Redaction:');
    expect(readme).toContain('Freshness:');
  });

  it('should assert migration produces no write lanes', async () => {
    const liveControlPath = path.join(FIXTURE_DIR, 'live-control.yaml');
    const content = await fs.readFile(liveControlPath, 'utf8');
    
    // Check that pending handoffs and external dirt remain blocking
    expect(content).toContain('handoffs: pending');
    expect(content).toContain('external_dirt: active');
    expect(content).toContain('lock: unresolved');
    expect(content).toContain('attestation_gap: true');
  });
});

