import { LiveControlWriteAdapter, AtomicReplaceResult } from '../../src/publication/publisher.js';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as crypto from 'node:crypto';

export class FixtureAtomicReplaceAdapter implements LiveControlWriteAdapter {
  public readonly capability = 'FIXTURE_ONLY' as const;
  public readonly isLiveCapable = true as const;

  constructor(private readonly allowedDirectoryPrefix: string) {}
  
  // Public for spying in tests
  public writeFileSync(tmpPath: string, bytes: Buffer | string) {
    fs.writeFileSync(tmpPath, bytes);
  }
  public fsyncSync(fd: number) {
    fs.fsyncSync(fd);
  }
  public renameSync(tmpPath: string, targetPath: string) {
    fs.renameSync(tmpPath, targetPath);
  }
  public openSync(tmpPath: string, flags: string) {
    return fs.openSync(tmpPath, flags);
  }
  public closeSync(fd: number) {
    fs.closeSync(fd);
  }

  public async atomicReplace(
    targetPath: string,
    candidateBytes: Buffer | string,
    expectedPreviousSha256: string
  ): Promise<AtomicReplaceResult> {
    const resolvedTarget = path.resolve(targetPath);
    const resolvedPrefix = path.resolve(this.allowedDirectoryPrefix);

    if (!resolvedTarget.startsWith(resolvedPrefix)) {
      throw new Error(`SECURITY VIOLATION: Fixture adapter attempted write outside sandbox: ` + targetPath);
    }

    const tmpPath = resolvedTarget + '.tmp.' + crypto.randomUUID();
    const bytes = Buffer.isBuffer(candidateBytes) ? candidateBytes : Buffer.from(candidateBytes);

    let currentBytes: Buffer | null = null;
    try {
      currentBytes = fs.readFileSync(resolvedTarget);
    } catch {
      // ignore
    }
    const currentSha256 = currentBytes ? crypto.createHash('sha256').update(currentBytes).digest('hex') : '';
    if (expectedPreviousSha256 && currentSha256 && currentSha256 !== expectedPreviousSha256) {
      throw new Error('CAS check failed');
    }

    this.writeFileSync(tmpPath, bytes);
    // sync to disk
    const fd = this.openSync(tmpPath, 'r+');
    this.fsyncSync(fd);
    this.closeSync(fd);

    this.renameSync(tmpPath, resolvedTarget);

    return {
      replaced: true,
      targetPath: resolvedTarget,
      bytesWritten: bytes.length,
      resultingSha256: crypto.createHash('sha256').update(bytes).digest('hex'),
      timestampUtc: new Date().toISOString()
    };
  }
}
