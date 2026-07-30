import { ExecutionCacheKey, CacheEntry } from './models';

export interface IArtifactCache {
  get(key: ExecutionCacheKey): Promise<CacheEntry | null>;
  set(key: ExecutionCacheKey, entry: CacheEntry): Promise<void>;
  invalidate(key: ExecutionCacheKey): Promise<void>;
}

export class InMemoryArtifactCache implements IArtifactCache {
  private readonly store = new Map<string, CacheEntry>();

  private serializeKey(key: ExecutionCacheKey): string {
    return `${key.tenantId}:${key.repositoryId}:${key.analyzerId}:${key.analyzerVersion}:${key.artifactFingerprint.algorithm}:${key.artifactFingerprint.digest}`;
  }

  async get(key: ExecutionCacheKey): Promise<CacheEntry | null> {
    const serialized = this.serializeKey(key);
    return this.store.get(serialized) || null;
  }

  async set(key: ExecutionCacheKey, entry: CacheEntry): Promise<void> {
    const serialized = this.serializeKey(key);
    this.store.set(serialized, entry);
  }

  async invalidate(key: ExecutionCacheKey): Promise<void> {
    const serialized = this.serializeKey(key);
    this.store.delete(serialized);
  }
}
