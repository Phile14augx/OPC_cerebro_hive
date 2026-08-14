// ============================================================
// memory-sdk/src/memory-manager.ts
// ============================================================

import {
  ContentType,
  DataClassification,
  MemoryQuery,
  MemoryRecord,
  MemoryTier,
} from "./types";

// ── Helpers ────────────────────────────────────────────────────────────────

function generateMemoryId(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const TIER_ORDER: MemoryTier[] = [
  "L0_active_context",
  "L1_working_memory",
  "L2_episodic",
  "L3_semantic",
  "L4_procedural",
  "L5_organizational",
  "L6_archive",
];

const SENSITIVITY_RANK: Record<DataClassification, number> = {
  public: 0,
  internal: 1,
  confidential: 2,
  restricted: 3,
  secret: 4,
};

/**
 * Tokenize text to a lowercase bag-of-words for keyword matching.
 */
function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

/**
 * Compute a simple keyword overlap relevance score between [0, 1].
 */
function keywordRelevance(record: MemoryRecord, query: string): number {
  if (!query) return 0;
  const queryTokens = tokenize(query);
  if (queryTokens.size === 0) return 0;

  const recordText = [
    record.content,
    record.tags.join(" "),
    record.source,
    record.metadata ? JSON.stringify(record.metadata) : "",
  ].join(" ");

  const recordTokens = tokenize(recordText);
  let matches = 0;
  for (const t of queryTokens) {
    if (recordTokens.has(t)) matches++;
  }
  return matches / queryTokens.size;
}

/**
 * Recency score — decays with age. Returns 0-1 where 1 = just created.
 */
function recencyScore(record: MemoryRecord, nowMs: number): number {
  const ageMs = nowMs - new Date(record.accessedAt).getTime();
  // Half-life of 7 days
  const halfLifeMs = 7 * 24 * 3600 * 1000;
  return Math.exp((-Math.LN2 * ageMs) / halfLifeMs);
}

// ── MemoryManager ──────────────────────────────────────────────────────────

export class MemoryManager {
  private store: Map<string, MemoryRecord> = new Map();

  // ── Write ────────────────────────────────────────────────────────────────

  write(
    record: Omit<MemoryRecord, "memoryId" | "version" | "createdAt" | "accessedAt">
  ): MemoryRecord {
    const now = new Date().toISOString();
    const memoryId = generateMemoryId();

    let expiresAt: string | undefined = record.expiresAt;
    if (!expiresAt && record.ttlMs !== undefined) {
      expiresAt = new Date(Date.now() + record.ttlMs).toISOString();
    }

    const newRecord: MemoryRecord = {
      ...record,
      memoryId,
      version: 1,
      createdAt: now,
      accessedAt: now,
      expiresAt,
      invalidated: false,
    };

    this.store.set(memoryId, Object.freeze({ ...newRecord }));
    return { ...newRecord };
  }

  // ── Retrieve ─────────────────────────────────────────────────────────────

  retrieve(query: MemoryQuery): MemoryRecord[] {
    const now = Date.now();
    const topK = query.topK ?? 20;

    let candidates = Array.from(this.store.values()).filter((r) => {
      // Tenant scope
      if (r.tenantId !== query.tenantId) return false;

      // Workspace scope
      if (query.workspaceId !== undefined && r.workspaceId !== query.workspaceId)
        return false;

      // Invalidated filter
      if (!query.includeInvalidated && r.invalidated) return false;

      // Expiry filter
      if (!query.includeExpired && r.expiresAt) {
        if (new Date(r.expiresAt).getTime() <= now) return false;
      }

      // Agent filter
      if (query.agentId !== undefined && r.agentId !== query.agentId)
        return false;

      // Mission filter
      if (query.missionId !== undefined && r.missionId !== query.missionId)
        return false;

      // Task filter
      if (query.taskId !== undefined && r.taskId !== query.taskId) return false;

      // Tier filter
      if (query.tier !== undefined) {
        const tiers = Array.isArray(query.tier) ? query.tier : [query.tier];
        if (!tiers.includes(r.tier)) return false;
      }

      // Sensitivity ceiling
      if (query.sensitivity !== undefined) {
        if (
          SENSITIVITY_RANK[r.sensitivity] >
          SENSITIVITY_RANK[query.sensitivity]
        )
          return false;
      }

      // Permission check
      if (query.permissions !== undefined) {
        if (!this.authorize(r.memoryId, query.permissions)) return false;
      }

      // Tag filter — record must contain ALL requested tags
      if (query.tags && query.tags.length > 0) {
        const hasAll = query.tags.every((t) => r.tags.includes(t));
        if (!hasAll) return false;
      }

      return true;
    });

    // Rank by relevance if a text query is provided
    if (query.query) {
      candidates = this.rank(candidates, query.query);
    } else {
      // Default: most recently accessed first
      candidates.sort(
        (a, b) =>
          new Date(b.accessedAt).getTime() - new Date(a.accessedAt).getTime()
      );
    }

    const results = candidates.slice(0, topK);

    // Update accessedAt for returned records
    for (const r of results) {
      const mutable = { ...r, accessedAt: new Date().toISOString() };
      this.store.set(r.memoryId, Object.freeze(mutable));
    }

    return results.map((r) => ({ ...r }));
  }

  // ── Rank ─────────────────────────────────────────────────────────────────

  rank(records: MemoryRecord[], query: string): MemoryRecord[] {
    const nowMs = Date.now();

    const scored = records.map((r) => {
      const relevance = keywordRelevance(r, query);
      const recency = recencyScore(r, nowMs);
      // Weighted combination: relevance 70%, recency 30%
      const combinedScore = relevance * 0.7 + recency * 0.3;
      return { record: r, score: combinedScore };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.record);
  }

  // ── Expire ───────────────────────────────────────────────────────────────

  expire(): number {
    const now = Date.now();
    let count = 0;

    for (const [id, record] of this.store.entries()) {
      if (record.expiresAt && new Date(record.expiresAt).getTime() <= now) {
        this.store.delete(id);
        count++;
      }
    }

    return count;
  }

  // ── Archive ───────────────────────────────────────────────────────────────

  archive(memoryId: string): void {
    const record = this.getOrThrow(memoryId);
    const updated: MemoryRecord = {
      ...record,
      tier: "L6_archive",
      accessedAt: new Date().toISOString(),
      version: record.version + 1,
    };
    this.store.set(memoryId, Object.freeze(updated));
  }

  // ── Promote ───────────────────────────────────────────────────────────────

  promote(memoryId: string, tier: MemoryTier): void {
    const record = this.getOrThrow(memoryId);
    const currentIdx = TIER_ORDER.indexOf(record.tier);
    const targetIdx = TIER_ORDER.indexOf(tier);

    if (targetIdx >= currentIdx) {
      throw new Error(
        `Cannot promote from tier "${record.tier}" to "${tier}" — target must be a lower-level (earlier) tier.`
      );
    }

    const updated: MemoryRecord = {
      ...record,
      tier,
      accessedAt: new Date().toISOString(),
      version: record.version + 1,
    };
    this.store.set(memoryId, Object.freeze(updated));
  }

  // ── Invalidate ────────────────────────────────────────────────────────────

  invalidate(memoryId: string): void {
    const record = this.getOrThrow(memoryId);
    const updated: MemoryRecord = {
      ...record,
      invalidated: true,
      accessedAt: new Date().toISOString(),
      version: record.version + 1,
    };
    this.store.set(memoryId, Object.freeze(updated));
  }

  // ── Deduplicate ───────────────────────────────────────────────────────────

  deduplicate(agentId: string, tier: MemoryTier): number {
    const records = Array.from(this.store.values()).filter(
      (r) => r.agentId === agentId && r.tier === tier && !r.invalidated
    );

    // Group by content fingerprint (first 200 chars, normalised)
    const seen = new Map<string, MemoryRecord>();
    let removed = 0;

    // Sort by version desc so we keep the newest version of each duplicate
    records.sort((a, b) => b.version - a.version);

    for (const record of records) {
      const fp = record.content
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
        .slice(0, 200);

      if (seen.has(fp)) {
        // This is a duplicate — invalidate it
        this.store.delete(record.memoryId);
        removed++;
      } else {
        seen.set(fp, record);
      }
    }

    return removed;
  }

  // ── Authorize ─────────────────────────────────────────────────────────────

  authorize(memoryId: string, agentId: string): boolean {
    const record = this.store.get(memoryId);
    if (!record) return false;
    if (record.invalidated) return false;

    // Owner always has access
    if (record.agentId === agentId) return true;

    // Empty permissions means agent-private (owner only)
    if (record.permissions.length === 0) return false;

    // Wildcard permission
    if (record.permissions.includes("*")) return true;

    return record.permissions.includes(agentId);
  }

  // ── Summarize ─────────────────────────────────────────────────────────────

  summarize(records: MemoryRecord[]): string {
    if (records.length === 0) return "";

    const parts: string[] = [];

    for (const r of records) {
      const header = `[${r.tier}][${r.source}][conf:${r.confidence.toFixed(2)}]`;
      let body = r.content;

      // Parse JSON content for a compact representation
      if (r.contentType === "json") {
        try {
          const parsed = JSON.parse(r.content);
          body = JSON.stringify(parsed, null, 0);
        } catch {
          body = r.content;
        }
      }

      const tagStr = r.tags.length > 0 ? ` tags:[${r.tags.join(",")}]` : "";
      parts.push(`${header}${tagStr}\n${body}`);
    }

    return parts.join("\n\n---\n\n");
  }

  // ── Compress ──────────────────────────────────────────────────────────────

  compress(agentId: string, tier: MemoryTier): void {
    const records = Array.from(this.store.values())
      .filter(
        (r) =>
          r.agentId === agentId &&
          r.tier === tier &&
          !r.invalidated &&
          r.contentType === "text"
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    if (records.length < 3) return; // nothing meaningful to compress

    // Group into clusters of similar records (same tags)
    const clusters = new Map<string, MemoryRecord[]>();
    for (const r of records) {
      const key = [...r.tags].sort().join("|") || "__untagged__";
      if (!clusters.has(key)) clusters.set(key, []);
      clusters.get(key)!.push(r);
    }

    for (const [, cluster] of clusters) {
      if (cluster.length < 2) continue;

      // Merge all cluster records into one
      const merged = cluster
        .map((r) => r.content.trim())
        .filter((c, i, arr) => arr.indexOf(c) === i) // de-dup content
        .join("\n");

      const representative = cluster[cluster.length - 1]; // newest

      const mergedRecord: MemoryRecord = {
        ...representative,
        memoryId: generateMemoryId(),
        content: merged,
        version: representative.version + 1,
        createdAt: cluster[0].createdAt,
        accessedAt: new Date().toISOString(),
        metadata: {
          ...representative.metadata,
          compressedFrom: cluster.map((r) => r.memoryId),
        },
      };

      // Remove originals, insert merged
      for (const r of cluster) {
        this.store.delete(r.memoryId);
      }
      this.store.set(mergedRecord.memoryId, Object.freeze(mergedRecord));
    }
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  getStats(): {
    totalRecords: number;
    byTier: Record<MemoryTier, number>;
    expiringIn24h: number;
    totalAgents: number;
  } {
    const now = Date.now();
    const in24h = now + 24 * 3600 * 1000;

    const byTier: Record<MemoryTier, number> = {
      L0_active_context: 0,
      L1_working_memory: 0,
      L2_episodic: 0,
      L3_semantic: 0,
      L4_procedural: 0,
      L5_organizational: 0,
      L6_archive: 0,
    };

    const agents = new Set<string>();
    let expiringIn24h = 0;

    for (const r of this.store.values()) {
      if (!r.invalidated) {
        byTier[r.tier]++;
        agents.add(r.agentId);

        if (r.expiresAt) {
          const expMs = new Date(r.expiresAt).getTime();
          if (expMs > now && expMs <= in24h) expiringIn24h++;
        }
      }
    }

    return {
      totalRecords: this.store.size,
      byTier,
      expiringIn24h,
      totalAgents: agents.size,
    };
  }

  // ── Internal helpers ───────────────────────────────────────────────────────

  private getOrThrow(memoryId: string): MemoryRecord {
    const record = this.store.get(memoryId);
    if (!record) throw new Error(`Memory record not found: ${memoryId}`);
    return record;
  }
}
