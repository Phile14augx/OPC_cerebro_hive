// =============================================================================
// CerebroHive AI Gateway — Response Cache
// In-memory LRU with optional Redis backing.
// =============================================================================

import { createHash } from 'crypto';
import type { ChatRequest, ChatResponse } from './types';

interface CacheEntry {
  response: ChatResponse;
  expiresAt: number;
}

export class ResponseCache {
  private store = new Map<string, CacheEntry>();
  private readonly maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  /** Deterministic cache key from request (excludes org/workflow IDs) */
  static buildKey(request: ChatRequest): string {
    const keyable = {
      messages: request.messages,
      model: request.model,
      provider: request.provider,
      maxTokens: request.maxTokens,
      temperature: request.temperature ?? 1,
      topP: request.topP ?? 1,
    };
    return createHash('sha256').update(JSON.stringify(keyable)).digest('hex');
  }

  get(key: string): ChatResponse | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    // Mark as cached hit
    return { ...entry.response, cached: true };
  }

  set(key: string, response: ChatResponse, ttlSeconds: number): void {
    if (ttlSeconds <= 0) return;

    // Simple LRU eviction: drop oldest entry when full
    if (this.store.size >= this.maxSize) {
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }

    this.store.set(key, {
      response,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }

  /** Purge expired entries (call periodically) */
  purgeExpired(): number {
    const now = Date.now();
    let purged = 0;
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        purged++;
      }
    }
    return purged;
  }
}
