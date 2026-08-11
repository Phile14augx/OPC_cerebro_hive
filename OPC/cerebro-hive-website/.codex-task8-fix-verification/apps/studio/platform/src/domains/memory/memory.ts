import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { XGateway } from "../../ai/x/gateway.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import { cosine } from "../../ai/x/mock-provider.js";

export type MemoryTier =
  | "conversation" | "longterm" | "semantic" | "episodic" | "workspace"
  | "project" | "organization" | "entity" | "temporal";

export interface MemoryRecord {
  id: string; organizationId: string; workspaceId?: string; tier: MemoryTier;
  scopeKey: string; content: string; summary?: string; embedding?: number[];
  importance: number; version: number; expiresAt?: string; createdAt: string; updatedAt: string;
}

export interface MemoryQuery { tier?: MemoryTier; scopeKey?: string; query?: string; limit?: number; workspaceId?: string }

export interface MemoryRepository {
  insert(rec: MemoryRecord): Promise<void>;
  update(rec: MemoryRecord): Promise<void>;
  delete(organizationId: string, id: string): Promise<void>;
  byScope(organizationId: string, tier: MemoryTier, scopeKey: string): Promise<MemoryRecord[]>;
  search(organizationId: string, q: MemoryQuery): Promise<MemoryRecord[]>;
  expired(now: Date): Promise<MemoryRecord[]>;
}

export class InMemoryMemoryRepository implements MemoryRepository {
  records = new Map<string, MemoryRecord>();
  async insert(rec: MemoryRecord): Promise<void> { this.records.set(rec.id, rec); }
  async update(rec: MemoryRecord): Promise<void> { this.records.set(rec.id, rec); }
  async delete(_org: string, id: string): Promise<void> { this.records.delete(id); }
  async byScope(org: string, tier: MemoryTier, scopeKey: string): Promise<MemoryRecord[]> {
    return [...this.records.values()]
      .filter(r => r.organizationId === org && r.tier === tier && r.scopeKey === scopeKey)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
  async search(org: string, q: MemoryQuery): Promise<MemoryRecord[]> {
    let out = [...this.records.values()].filter(r => r.organizationId === org);
    if (q.tier) out = out.filter(r => r.tier === q.tier);
    if (q.scopeKey) out = out.filter(r => r.scopeKey === q.scopeKey);
    if (q.workspaceId) out = out.filter(r => !r.workspaceId || r.workspaceId === q.workspaceId);
    return out.slice(-1 * (q.limit ?? 50));
  }
  async expired(now: Date): Promise<MemoryRecord[]> {
    return [...this.records.values()].filter(r => r.expiresAt && new Date(r.expiresAt) < now);
  }
}

const TIER_LIMITS: Partial<Record<MemoryTier, number>> = { conversation: 40, episodic: 60, temporal: 100 };
const TIER_TTL_HOURS: Partial<Record<MemoryTier, number>> = { temporal: 24 * 7, conversation: 24 * 30 };

/**
 * Cerebro Memory Fabric™ — nine permission-aware memory tiers with embedding
 * retrieval, versioning, expiration, and model-backed compression.
 */
export class MemoryFabric {
  constructor(
    private readonly repo: MemoryRepository,
    private readonly x: XGateway,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
  ) {}

  async write(ctx: RequestContext, input: { tier: MemoryTier; scopeKey: string; content: string; workspaceId?: string; importance?: number }): Promise<MemoryRecord> {
    this.policy.assert(ctx.principal, "memory:write", { kind: "memory", organizationId: ctx.principal.organizationId, workspaceId: input.workspaceId });
    const { vectors } = await this.x.embed(ctx.principal.organizationId, [input.content]);
    const ttlHours = TIER_TTL_HOURS[input.tier];
    const now = new Date();
    const rec: MemoryRecord = {
      id: newId("mem"), organizationId: ctx.principal.organizationId, workspaceId: input.workspaceId,
      tier: input.tier, scopeKey: input.scopeKey, content: input.content, embedding: vectors[0],
      importance: input.importance ?? 0.5, version: 1,
      expiresAt: ttlHours ? new Date(now.getTime() + ttlHours * 3600_000).toISOString() : undefined,
      createdAt: now.toISOString(), updatedAt: now.toISOString(),
    };
    await this.repo.insert(rec);
    await this.bus.publish(Subjects.memory.written, { memoryId: rec.id, tier: rec.tier, scopeKey: rec.scopeKey }, { organizationId: rec.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    await this.compressIfNeeded(ctx, input.tier, input.scopeKey);
    return rec;
  }

  async retrieve(ctx: RequestContext, q: MemoryQuery & { query: string }): Promise<(MemoryRecord & { score: number })[]> {
    this.policy.assert(ctx.principal, "memory:read", { kind: "memory", organizationId: ctx.principal.organizationId, workspaceId: q.workspaceId });
    const { vectors } = await this.x.embed(ctx.principal.organizationId, [q.query]);
    const qv = vectors[0]!;
    const candidates = await this.repo.search(ctx.principal.organizationId, { ...q, limit: 500, workspaceId: ctx.principal.workspaceId ?? q.workspaceId });
    return candidates
      .map(r => ({ ...r, score: r.embedding ? cosine(qv, r.embedding) * (0.7 + 0.3 * r.importance) : 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, q.limit ?? 8);
  }

  async timeline(ctx: RequestContext, tier: MemoryTier, scopeKey: string): Promise<MemoryRecord[]> {
    this.policy.assert(ctx.principal, "memory:read", { kind: "memory", organizationId: ctx.principal.organizationId });
    return this.repo.byScope(ctx.principal.organizationId, tier, scopeKey);
  }

  /** Compress oldest records of an over-limit scope into a versioned summary record. */
  private async compressIfNeeded(ctx: RequestContext, tier: MemoryTier, scopeKey: string): Promise<void> {
    const limit = TIER_LIMITS[tier];
    if (!limit) return;
    const all = await this.repo.byScope(ctx.principal.organizationId, tier, scopeKey);
    if (all.length <= limit) return;
    const toCompress = all.slice(0, Math.ceil(limit / 2));
    const body = toCompress.map(r => r.content).join("\n");
    const res = await this.x.complete(ctx.principal.organizationId, {
      messages: [
        { role: "system", content: "Summarize these memory records into a dense factual digest. Keep names, numbers, decisions." },
        { role: "user", content: body.slice(0, 6000) },
      ],
      metadata: { purpose: "memory:compress" },
    }, { traceId: ctx.traceId });
    const maxVersion = Math.max(...all.map(r => r.version));
    const { vectors } = await this.x.embed(ctx.principal.organizationId, [res.text]);
    const summary: MemoryRecord = {
      id: newId("mem"), organizationId: ctx.principal.organizationId, tier, scopeKey,
      content: res.text, summary: res.text, embedding: vectors[0], importance: 0.8,
      version: maxVersion + 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    await this.repo.insert(summary);
    for (const r of toCompress) await this.repo.delete(ctx.principal.organizationId, r.id);
    await this.bus.publish(Subjects.memory.summarized, { tier, scopeKey, compressed: toCompress.length }, { organizationId: ctx.principal.organizationId, traceId: ctx.traceId });
  }

  /** Expiration sweep — call from a background worker. */
  async sweepExpired(): Promise<number> {
    const expired = await this.repo.expired(new Date());
    for (const r of expired) {
      await this.repo.delete(r.organizationId, r.id);
      await this.bus.publish(Subjects.memory.expired, { memoryId: r.id, tier: r.tier }, { organizationId: r.organizationId });
    }
    return expired.length;
  }
}
