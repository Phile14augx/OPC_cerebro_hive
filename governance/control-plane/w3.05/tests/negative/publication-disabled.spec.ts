import { describe, it, expect, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { Publisher, PublicationDeniedError } from '../../src/publication/publisher.js';
import { FixtureAtomicReplaceAdapter } from '../fixtures/fixture-adapter.js';

describe('Disabled CAS Publisher', () => {
  it('proves live control path is never opened for write across publication test suite', async () => {
    const livePath = 'D:\\CEREBRO_PRODUCT_WORKTREES\\CONTROL\\ACTIVE_BRANCH_OWNERS.yaml';
    const writeSpy = vi.spyOn(fs.promises, 'open');
    
    const publisher = new Publisher();
    
    await expect(publisher.publish({
      targetControlPath: livePath,
      canonicalProposalBytes: '...',
      expectedPreviousSha256: 'abc...',
    })).rejects.toThrow(PublicationDeniedError);

    const liveWriteCalls = writeSpy.mock.calls.filter(call => {
      const filePath = String(call[0]);
      const flags = String(call[1] || 'r');
      return filePath.includes('ACTIVE_BRANCH_OWNERS.yaml') && (flags.includes('w') || flags.includes('+') || flags.includes('a'));
    });

    expect(liveWriteCalls).toHaveLength(0);
    writeSpy.mockRestore();
  });

  it('proves bootstrap default has no writer', () => {
    const publisher = new Publisher();
    expect(publisher.isLiveWriteCapable).toBe(false);
  });

  it('proves runtime denial gate blocks accidental calls', async () => {
    const adapter = new FixtureAtomicReplaceAdapter('test-sandbox');
    const atomicReplaceSpy = vi.spyOn(adapter, 'atomicReplace');
    const publisher = new Publisher({ writeAdapter: adapter });
    
    await expect(publisher.publish(
      { targetControlPath: 'test.yaml', canonicalProposalBytes: 'a', expectedPreviousSha256: 'a' },
      undefined
    )).rejects.toThrowError(/Missing or invalid/);
    
    expect(atomicReplaceSpy).not.toHaveBeenCalled();
  });

  it('proves production code cannot silently fall back to filesystem writes', async () => {
    const adapter = new FixtureAtomicReplaceAdapter('test-sandbox');
    vi.spyOn(adapter, 'atomicReplace').mockRejectedValue(new Error('Intentional failure'));
    
    const publisher = new Publisher({ writeAdapter: adapter });
    
    await expect(publisher.publish(
      { targetControlPath: 'test.yaml', canonicalProposalBytes: 'a', expectedPreviousSha256: 'a' },
      { isValid: true }
    )).rejects.toThrowError('Intentional failure');
  });

  it('proves publisher with injected fixture adapter succeeds in sandbox', async () => {
    const sandboxDir = path.resolve(__dirname, '../fixtures/sandbox_tmp_1');
    fs.mkdirSync(sandboxDir, { recursive: true });
    
    const targetFile = path.join(sandboxDir, 'ACTIVE_BRANCH_OWNERS.yaml');
    fs.writeFileSync(targetFile, 'initial');
    const initialSha = crypto.createHash('sha256').update('initial').digest('hex');

    const adapter = new FixtureAtomicReplaceAdapter(sandboxDir);
    const publisher = new Publisher({ writeAdapter: adapter });
    
    const result = await publisher.publish(
      { targetControlPath: targetFile, canonicalProposalBytes: 'epoch41', expectedPreviousSha256: initialSha },
      { isValid: true }
    );
    
    expect(result.receipt.replaced).toBe(true);
    expect(fs.readFileSync(targetFile, 'utf8')).toBe('epoch41');

    fs.rmSync(sandboxDir, { recursive: true, force: true });
  });
});
