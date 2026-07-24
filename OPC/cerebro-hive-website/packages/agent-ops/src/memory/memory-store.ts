/**
 * AgentOps — Agent Memory Store
 * Three-tier memory: episodic (session), semantic (facts), procedural (patterns).
 * Production backend: pgvector for semantic search, Redis for episodic.
 */

import crypto from "node:crypto";

// ── Types ─────────────────────────────────────────────────────────────────────

export type MemoryTier = "episodic" | "semantic" | "procedural";

export interface MemoryEntry {
  id:          string;
  agentId:     string;
  sessionId?:  string;
  tier:        MemoryTier;
  content:     string;
  embedding?:  number[];          // 1536-dim vector for semantic search
  metadata:    Record<string, unknown>;
  importance:  number;            // 0.0–1.0, used for forgetting curve
  accessCount: number;
  createdAt:   string;
  lastAccessAt: string;
  expiresAt?:  string;            // episodic memories expire after session TTL
}

export interface MemorySearchResult {
  entry:      MemoryEntry;
  similarity: number;             // cosine similarity if vector search
  tier:       MemoryTier;
}

export interface MemoryStoreOptions {
  maxEpisodicEntries:    number;  // per session
  maxSemanticEntries:    number;  // per agent
  episodicTtlMs:         number;  // session lifetime
  semanticImportanceCutoff: number; // below this, entries are candidates for forgetting
}

const DEFAULT_OPTIONS: MemoryStoreOptions = {
  maxEpisodicEntries:       500,
  maxSemanticEntries:      2000,
  episodicTtlMs:     3_600_000,  // 1 hour
  semanticImportanceCutoff: 0.3,
};

// ── In-memory implementation (replace with pgvector + Redis in production) ────

export class AgentMemoryStore {
  private readonly entries = new Map<string, MemoryEntry>();
  private readonly opts: MemoryStoreOptions;

  constructor(options: Partial<MemoryStoreOptions> = {}) {
    this.opts = { ...DEFAULT_OPTIONS, ...options };
  }

  // ── Write ──────────────────────────────────────────────────────────────────

  store(input: {
    agentId:    string;
    sessionId?: string;
    tier:       MemoryTier;
    content:    string;
    embedding?: number[];
    metadata?:  Record<string, unknown>;
    importance?: number;
    ttlMs?:     number;
  }): MemoryEntry {
    const now = new Date().toISOString();
    const expiresAt = input.tier === "episodic"
      ? new Date(Date.now() + (input.ttlMs ?? this.opts.episodicTtlMs)).toISOString()
      : input.ttlMs
        ? new Date(Date.now() + input.ttlMs).toISOString()
        : undefined;

    const entry: MemoryEntry = {
      id:           crypto.randomUUID(),
      agentId:      input.agentId,
      sessionId:    input.sessionId,
      tier:         input.tier,
      content:      input.content,
      embedding:    input.embedding,
      metadata:     input.metadata ?? {},
      importance:   input.importance ?? 0.5,
      accessCount:  0,
      createdAt:    now,
      lastAccessAt: now,
      expiresAt,
    };

    this.entries.set(entry.id, entry);
    this.evictIfNeeded(input.agentId, input.tier, input.sessionId);
    return entry;
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  recall(id: string): MemoryEntry | null {
    const entry = this.entries.get(id);
    if (!entry || this.isExpired(entry)) return null;

    // Update access statistics (spaced repetition reinforcement)
    entry.accessCount++;
    entry.lastAccessAt = new Date().toISOString();
    // Boost importance slightly on access (Ebbinghaus effect)
    entry.importance = Math.min(1.0, entry.importance + 0.05);
    return entry;
  }

  search(options: {
    agentId:    string;
    sessionId?: string;
    tier?:      MemoryTier;
    query?:     string;
    embedding?: number[];
    limit?:     number;
    minImportance?: number;
  }): MemorySearchResult[] {
    const { agentId, sessionId, tier, limit = 10, minImportance = 0 } = options;
    const now = Date.now();

    let candidates = [...this.entries.values()].filter((e) => {
      if (e.agentId !== agentId) return false;
      if (this.isExpired(e)) return false;
      if (tier && e.tier !== tier) return false;
      if (sessionId && e.tier === "episodic" && e.sessionId !== sessionId) return false;
      if (e.importance < minImportance) return false;
      return true;
    });

    // Vector similarity search if embedding provided
    if (options.embedding && options.embedding.length > 0) {
      candidates = candidates
        .map((e) => ({
          entry:      e,
          similarity: e.embedding ? cosineSimilarity(options.embedding!, e.embedding) : 0,
          tier:       e.tier,
        }))
        .filter((r) => r.similarity > 0.7)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      return candidates as MemorySearchResult[];
    }

    // Keyword search fallback
    if (options.query) {
      const q = options.query.toLowerCase();
      candidates = candidates.filter((e) =>
        e.content.toLowerCase().includes(q) ||
        Object.values(e.metadata).some((v) =>
          String(v).toLowerCase().includes(q),
        ),
      );
    }

    return candidates
      .sort((a, b) => b.importance - a.importance || b.accessCount - a.accessCount)
      .slice(0, limit)
      .map((e) => ({ entry: e, similarity: 1.0, tier: e.tier }));
  }

  // ── Episodic session replay ────────────────────────────────────────────────

  getSession(agentId: string, sessionId: string): MemoryEntry[] {
    return [...this.entries.values()]
      .filter((e) =>
        e.agentId === agentId &&
        e.sessionId === sessionId &&
        e.tier === "episodic" &&
        !this.isExpired(e),
      )
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  // ── Forgetting curve ──────────────────────────────────────────────────────

  runForgettingCurve(agentId: string): number {
    const candidates = [...this.entries.values()].filter(
      (e) => e.agentId === agentId && e.tier === "semantic",
    );

    let forgotten = 0;
    for (const entry of candidates) {
      const daysSinceAccess =
        (Date.now() - new Date(entry.lastAccessAt).getTime()) / 86_400_000;

      // Ebbinghaus: R = e^(-t / S) where S = stability proportional to importance
      const stability = entry.importance * 30;  // max 30 days retention
      const retention = Math.exp(-daysSinceAccess / stability);

      // Decay importance
      entry.importance = entry.importance * retention;

      if (entry.importance < this.opts.semanticImportanceCutoff && entry.accessCount === 0) {
        this.entries.delete(entry.id);
        forgotten++;
      }
    }
    return forgotten;
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────

  pruneExpired(): number {
    let pruned = 0;
    for (const [id, entry] of this.entries) {
      if (this.isExpired(entry)) {
        this.entries.delete(id);
        pruned++;
      }
    }
    return pruned;
  }

  stats(agentId: string): {
    episodic:   number;
    semantic:   number;
    procedural: number;
    total:      number;
  } {
    const counts = { episodic: 0, semantic: 0, procedural: 0, total: 0 };
    for (const e of this.entries.values()) {
      if (e.agentId !== agentId || this.isExpired(e)) continue;
      counts[e.tier]++;
      counts.total++;
    }
    return counts;
  }

  private isExpired(entry: MemoryEntry): boolean {
    return entry.expiresAt ? Date.now() > new Date(entry.expiresAt).getTime() : false;
  }

  private evictIfNeeded(agentId: string, tier: MemoryTier, sessionId?: string): void {
    const entries = [...this.entries.values()].filter(
      (e) =>
        e.agentId === agentId &&
        e.tier === tier &&
        (tier !== "episodic" || e.sessionId === sessionId),
    );

    const limit = tier === "episodic"
      ? this.opts.maxEpisodicEntries
      : this.opts.maxSemanticEntries;

    if (entries.length <= limit) return;

    // Evict lowest importance entries first
    entries
      .sort((a, b) => a.importance - b.importance)
      .slice(0, entries.length - limit)
      .forEach((e) => this.entries.delete(e.id));
  }
}

// ── Vector math ───────────────────────────────────────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] ** 2;
    normB += b[i] ** 2;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// ── Singleton ────────────────────────────────────────────────────────────────
export const memoryStore = new AgentMemoryStore();
