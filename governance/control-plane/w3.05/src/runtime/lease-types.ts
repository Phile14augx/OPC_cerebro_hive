import type { ReasonCode, RunManifest } from '../types.js';
import type { Lease } from '../lease.js';

export class LeaseStoreError extends Error {
  public code: ReasonCode;
  constructor(code: ReasonCode, message: string) {
    super(`[${code}] ${message}`);
    this.code = code;
    this.name = 'LeaseStoreError';
  }
}

export interface ILeaseStore {
  acquire(resourceId: string, manifest: RunManifest, ttlMs?: number): Promise<Lease>;
  renew(resourceId: string, fencingToken: number, ttlMs?: number): Promise<Lease>;
  release(resourceId: string, fencingToken: number): Promise<void>;
  assertFence(resourceId: string, fencingToken: number): Promise<boolean>;
}
