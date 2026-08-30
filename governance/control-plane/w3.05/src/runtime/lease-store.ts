import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { LeaseStoreError, ILeaseStore } from './lease-types.js';
import { enforceLease, Lease } from '../lease.js';
import type { RunManifest } from '../types.js';

export class LeaseStore implements ILeaseStore {
  private baseDir: string;
  private defaultTtlMs: number;

  constructor(baseDir = 'D:\\CEREBRO_CONTROL_RUNTIME\\w3.05', defaultTtlMs = 10000) {
    this.baseDir = baseDir;
    this.defaultTtlMs = defaultTtlMs;
  }

  private getResourceDir(resourceId: string): string {
    // Canonical resource directories
    const safeName = resourceId.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(this.baseDir, safeName);
  }

  private async acquireMutex(resourceDir: string): Promise<{lockDir: string, id: string}> {
    const lockDir = path.join(resourceDir, 'mutex.lock.d');
    await fs.mkdir(resourceDir, { recursive: true });
    
    let attempts = 0;
    while (attempts < 100) {
      const myId = crypto.randomBytes(16).toString('hex');
      let acquired = false;

      try {
        await fs.mkdir(lockDir);
        acquired = true;
      } catch (err: unknown) {
        if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw err;
        
        try {
          const files = await fs.readdir(lockDir);
          const ownerFiles = files.filter(f => f.startsWith('owner-'));
          
          if (ownerFiles.length > 0) {
            const ownerFile = ownerFiles[0];
            const ownerPath = path.join(lockDir, ownerFile);
            const stats = await fs.stat(ownerPath);
            const elapsed = Date.now() - stats.mtimeMs;
            if (elapsed > 5000 || elapsed < 0) { // 5s mutex timeout or backward clock shift
              try {
                await fs.unlink(ownerPath);
                await fs.rmdir(lockDir).catch(() => {});
              } catch {
                // Another process unlinked it.
              }
            }
          } else {
            const stats = await fs.stat(lockDir);
            const elapsed = Date.now() - stats.mtimeMs;
            if (elapsed > 5000 || elapsed < 0) {
              await fs.rmdir(lockDir).catch(() => {});
            }
          }
        } catch (innerErr: unknown) {
          if ((innerErr as NodeJS.ErrnoException).code !== 'ENOENT') throw innerErr;
        }
      }

      if (acquired) {
        try {
          await fs.writeFile(path.join(lockDir, `owner-${myId}.json`), JSON.stringify({ pid: process.pid, time: Date.now() }));
          return { lockDir, id: myId };
        } catch {
          await fs.rmdir(lockDir).catch(() => {});
        }
      }

      await new Promise(r => setTimeout(r, 50));
      attempts++;
    }
    throw new LeaseStoreError('MULTIPLE_WRITERS', 'Failed to acquire mutex lock');
  }

  private async releaseMutex(mutex: {lockDir: string, id: string}): Promise<void> {
    try {
      await fs.unlink(path.join(mutex.lockDir, `owner-${mutex.id}.json`));
      await fs.rmdir(mutex.lockDir).catch(() => {});
    } catch {
      // If we cannot unlink our owner file, our lock was broken and taken over.
    }
  }

  private async readCurrentLease(resourceDir: string): Promise<Lease | null> {
    const leaseFile = path.join(resourceDir, 'lease.json');
    try {
      const content = await fs.readFile(leaseFile, 'utf8');
      return JSON.parse(content) as Lease;
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw new LeaseStoreError('LEASE_CORRUPT', 'Failed to parse lease state');
    }
  }

  private async writeLease(resourceDir: string, lease: Lease): Promise<void> {
    const tmpFile = path.join(resourceDir, `lease-${crypto.randomBytes(4).toString('hex')}.tmp`);
    const leaseFile = path.join(resourceDir, 'lease.json');
    await fs.writeFile(tmpFile, JSON.stringify(lease, null, 2), 'utf8');
    await fs.rename(tmpFile, leaseFile);
  }

  public async acquire(resourceId: string, manifest: RunManifest, ttlMs: number = this.defaultTtlMs): Promise<Lease> {
    if (ttlMs < 0) {
      throw new LeaseStoreError('INVALID_TTL', 'Negative TTL detected');
    }

    // Narrowing-only semantics
    if (!manifest.object_ids.includes(resourceId) && !manifest.tree_ids.includes(resourceId) && manifest.repository_id !== resourceId) {
      throw new LeaseStoreError('SCOPE_OVERLAP', 'Resource not present in authorization');
    }

    const resourceDir = this.getResourceDir(resourceId);
    const mutex = await this.acquireMutex(resourceDir);

    try {
      const currentLease = await this.readCurrentLease(resourceDir);
      const currentTime = new Date().toISOString();
      const expiresAt = new Date(Date.now() + ttlMs).toISOString();

      if (currentLease) {
        if (currentLease.live_epoch !== manifest.live_epoch || currentLease.live_control_sha256 !== manifest.live_control_sha256) {
          throw new LeaseStoreError('CONTROL_CHANGED', 'Epoch or hash does not match current active lease');
        }
        if (Date.now() < new Date(currentLease.renewed_at).getTime()) {
          throw new LeaseStoreError('CLOCK_ROLLBACK', 'System clock is older than lease renewal time');
        }
      }
      const nextFencingToken = currentLease ? currentLease.fencing_token + 1 : 1;
      
      const proposedLease: Lease = {
        resource_id: resourceId,
        live_epoch: manifest.live_epoch,
        live_control_sha256: manifest.live_control_sha256,
        owner_agent_id: manifest.actor_id,
        run_id: manifest.run_id,
        issued_at: currentTime,
        renewed_at: currentTime,
        expires_at: expiresAt,
        fencing_token: nextFencingToken,
        process_liveness: process.pid,
        previous_lease_digest: currentLease ? crypto.createHash('sha256').update(JSON.stringify(currentLease)).digest('hex') : ''
      };

      const result = enforceLease({
        current_lease: currentLease,
        proposed_lease: proposedLease,
        current_time: currentTime,
        live_epoch: manifest.live_epoch,
        live_control_sha256: manifest.live_control_sha256
      });

      if (!result.valid) {
        throw new LeaseStoreError(result.finding!.code, result.finding!.message);
      }

      await this.writeLease(resourceDir, proposedLease);
      return proposedLease;
    } finally {
      await this.releaseMutex(mutex);
    }
  }

  public async renew(resourceId: string, fencingToken: number, ttlMs: number = this.defaultTtlMs): Promise<Lease> {
    if (ttlMs < 0) {
      throw new LeaseStoreError('INVALID_TTL', 'Negative TTL detected');
    }

    const resourceDir = this.getResourceDir(resourceId);
    const mutex = await this.acquireMutex(resourceDir);

    try {
      const currentLease = await this.readCurrentLease(resourceDir);
      if (!currentLease) {
        throw new LeaseStoreError('LEASE_MISSING', 'No active lease found to renew');
      }

      if (currentLease.fencing_token !== fencingToken) {
        throw new LeaseStoreError('FENCING_TOKEN_STALE', 'Token mismatch during renewal');
      }

      if (Date.now() < new Date(currentLease.renewed_at).getTime()) {
        throw new LeaseStoreError('CLOCK_ROLLBACK', 'System clock is older than lease renewal time');
      }

      const currentTime = new Date().toISOString();
      const expiresAt = new Date(Date.now() + ttlMs).toISOString();

      const proposedLease: Lease = {
        ...currentLease,
        renewed_at: currentTime,
        expires_at: expiresAt,
        fencing_token: currentLease.fencing_token + 1,
        process_liveness: process.pid,
        previous_lease_digest: crypto.createHash('sha256').update(JSON.stringify(currentLease)).digest('hex')
      };

      const result = enforceLease({
        current_lease: currentLease,
        proposed_lease: proposedLease,
        current_time: currentTime,
        live_epoch: currentLease.live_epoch,
        live_control_sha256: currentLease.live_control_sha256
      });

      if (!result.valid) {
        throw new LeaseStoreError(result.finding!.code, result.finding!.message);
      }

      await this.writeLease(resourceDir, proposedLease);
      return proposedLease;
    } finally {
      await this.releaseMutex(mutex);
    }
  }

  public async release(resourceId: string, fencingToken: number): Promise<void> {
    const resourceDir = this.getResourceDir(resourceId);
    const mutex = await this.acquireMutex(resourceDir);

    try {
      const currentLease = await this.readCurrentLease(resourceDir);
      if (!currentLease) {
        return; // Already released or expired and replaced
      }

      if (currentLease.fencing_token !== fencingToken) {
        throw new LeaseStoreError('FENCING_TOKEN_STALE', 'Token mismatch during release');
      }

      // To release, we just expire it immediately. 
      // Or we can delete the lease file.
      const leaseFile = path.join(resourceDir, 'lease.json');
      await fs.unlink(leaseFile).catch(() => {});
    } finally {
      await this.releaseMutex(mutex);
    }
  }

  public async assertFence(resourceId: string, fencingToken: number): Promise<boolean> {
    const resourceDir = this.getResourceDir(resourceId);
    try {
      const currentLease = await this.readCurrentLease(resourceDir);
      if (!currentLease) {
        return false;
      }
      
      const currentTimeMs = Date.now();
      const expiresMs = new Date(currentLease.expires_at).getTime();

      if (currentTimeMs >= expiresMs) {
        return false; // Expired
      }

      return currentLease.fencing_token === fencingToken;
    } catch {
      return false;
    }
  }
}
