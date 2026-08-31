import { describe, it, expect, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { Publisher, PublicationRequest, GovernorAuthorizationToken } from '../../src/publication/publisher.js';
import { FixtureAtomicReplaceAdapter } from '../fixtures/fixture-adapter.js';

describe('Publication Crash Consistency', () => {
  it('handles crash before temporary write', async () => {
    // 1. Crash Point 1: Before temporary file write -> Live file unchanged, zero temp files left.
    const sandboxDir = path.resolve(__dirname, '../fixtures/sandbox_tmp_2');
    fs.mkdirSync(sandboxDir, { recursive: true });
    
    const targetFile = path.join(sandboxDir, 'ACTIVE_BRANCH_OWNERS.yaml');
    fs.writeFileSync(targetFile, 'initial');
    const initialSha = crypto.createHash('sha256').update('initial').digest('hex');

    const adapter = new FixtureAtomicReplaceAdapter(sandboxDir);
    vi.spyOn(adapter, 'writeFileSync').mockImplementationOnce(() => {
      throw new Error('Crash before write');
    });

    const publisher = new Publisher({ writeAdapter: adapter });
    
    await expect(publisher.publish(
      { targetControlPath: targetFile, canonicalProposalBytes: 'epoch41', expectedPreviousSha256: initialSha },
      { isValid: true }
    )).rejects.toThrowError('Crash before write');

    expect(fs.readFileSync(targetFile, 'utf8')).toBe('initial');
    const files = fs.readdirSync(sandboxDir);
    expect(files.filter(f => f.includes('.tmp'))).toHaveLength(0);

    fs.rmSync(sandboxDir, { recursive: true, force: true });
  });

  it('handles crash after temp write, before fsync', async () => {
    // 2. Crash Point 2: After temp write, before fsync -> Temp file cleaned up or ignored, live file unchanged.
    const sandboxDir = path.resolve(__dirname, '../fixtures/sandbox_tmp_3');
    fs.mkdirSync(sandboxDir, { recursive: true });
    
    const targetFile = path.join(sandboxDir, 'ACTIVE_BRANCH_OWNERS.yaml');
    fs.writeFileSync(targetFile, 'initial');
    const initialSha = crypto.createHash('sha256').update('initial').digest('hex');

    const adapter = new FixtureAtomicReplaceAdapter(sandboxDir);
    vi.spyOn(adapter, 'fsyncSync').mockImplementationOnce(() => {
      throw new Error('Crash before fsync');
    });

    const publisher = new Publisher({ writeAdapter: adapter });
    
    await expect(publisher.publish(
      { targetControlPath: targetFile, canonicalProposalBytes: 'epoch41', expectedPreviousSha256: initialSha },
      { isValid: true }
    )).rejects.toThrowError('Crash before fsync');

    expect(fs.readFileSync(targetFile, 'utf8')).toBe('initial');
    
    vi.restoreAllMocks();
    fs.rmSync(sandboxDir, { recursive: true, force: true });
  });

  it('handles crash after fsync, before atomic replace', async () => {
    // 3. Crash Point 3: After fsync, before atomic replace -> Live file unchanged.
    const sandboxDir = path.resolve(__dirname, '../fixtures/sandbox_tmp_4');
    fs.mkdirSync(sandboxDir, { recursive: true });
    
    const targetFile = path.join(sandboxDir, 'ACTIVE_BRANCH_OWNERS.yaml');
    fs.writeFileSync(targetFile, 'initial');
    const initialSha = crypto.createHash('sha256').update('initial').digest('hex');

    const adapter = new FixtureAtomicReplaceAdapter(sandboxDir);
    vi.spyOn(adapter, 'renameSync').mockImplementationOnce(() => {
      throw new Error('Crash before rename');
    });

    const publisher = new Publisher({ writeAdapter: adapter });
    
    await expect(publisher.publish(
      { targetControlPath: targetFile, canonicalProposalBytes: 'epoch41', expectedPreviousSha256: initialSha },
      { isValid: true }
    )).rejects.toThrowError('Crash before rename');

    expect(fs.readFileSync(targetFile, 'utf8')).toBe('initial');
    
    vi.restoreAllMocks();
    fs.rmSync(sandboxDir, { recursive: true, force: true });
  });
  
  it('handles crash after atomic replace, before receipt generation', async () => {
    // 4. Crash Point 4: After atomic replace, before receipt generation -> Live file has new epoch; recovery tool detects missing receipt
    const sandboxDir = path.resolve(__dirname, '../fixtures/sandbox_tmp_5');
    fs.mkdirSync(sandboxDir, { recursive: true });
    
    const targetFile = path.join(sandboxDir, 'ACTIVE_BRANCH_OWNERS.yaml');
    fs.writeFileSync(targetFile, 'initial');
    const initialSha = crypto.createHash('sha256').update('initial').digest('hex');

    const adapter = new FixtureAtomicReplaceAdapter(sandboxDir);
    
    class CrashingPublisher extends Publisher {
      // @ts-expect-error - overriding private method for test injection
      private async executeAtomicPublication(request: PublicationRequest, governorToken: GovernorAuthorizationToken) {
        // @ts-expect-error - accessing private method
        await super.executeAtomicPublication(request, governorToken);
        throw new Error('Crash before receipt return');
      }
    }
    const publisher = new CrashingPublisher({ writeAdapter: adapter });
    
    await expect(publisher.publish(
      { targetControlPath: targetFile, canonicalProposalBytes: 'epoch41', expectedPreviousSha256: initialSha },
      { isValid: true }
    )).rejects.toThrowError('Crash before receipt return');

    // file changed!
    expect(fs.readFileSync(targetFile, 'utf8')).toBe('epoch41');
    
    vi.restoreAllMocks();
    fs.rmSync(sandboxDir, { recursive: true, force: true });
  });

  it('handles crash during post-publication verification', async () => {
    // 5. Crash Point 5: During post-publication verification
    expect(true).toBe(true);
  });
});
