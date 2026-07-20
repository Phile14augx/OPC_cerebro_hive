import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { XGateway } from "../../ai/x/gateway.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import { cosine } from "../../ai/x/mock-provider.js";
import { PlatformError } from "../../kernel/errors/errors.js";

export type DocContentType = "text/markdown" | "text/plain" | "text/html" | "text/csv" | "text/code" | "application/pdf";

export interface KnowledgeDocument {
  id: string; organizationId: string; workspaceId?: string; title: string; source: string;
  contentType: DocContentType; status: "uploaded" | "parsed" | "indexed" | "failed";
  rawSize: number; metadata: Record<string, unknown>; createdAt: string;
}
export interface Chunk { id: string; documentId: string; organizationId: string; seq: number; text: string; embedding?: number[]; tokenEstimate: number }
export interface KnowledgeEntity { id: string; organizationId: string; name: string; kind: string; properties: Record<string, unknown> }
export interface KnowledgeRelationship { id: string; organizationId: string; fromEntityId: string; toEntityId: string; kind: string; documentId?: string }

export interface KnowledgeRepository {
  insertDocument(doc: KnowledgeDocument): Promise<void>;
  updateDocumentStatus(organizationId: string, id: string, status: KnowledgeDocument["status"]): Promise<void>;
  getDocument(organizationId: string, id: string): Promise<KnowledgeDocument | undefined>;
  listDocuments(organizationId: string, limit?: number): Promise<KnowledgeDocument[]>;
  insertChunks(chunks: Chunk[]): Promise<void>;
  chunksByOrg(organizationId: string, limit?: number): Promise<Chunk[]>;
  chunksByDocument(documentId: string): Promise<Chunk[]>;
  upsertEntity(entity: Omit<KnowledgeEntity, "id">): Promise<KnowledgeEntity>;
  insertRelationship(rel: Omit<KnowledgeRelationship, "id">): Promise<KnowledgeRelationship>;
  entitiesByOrg(organizationId: string): Promise<KnowledgeEntity[]>;
  relationshipsByEntity(entityId: string): Promise<KnowledgeRelationship[]>;
}

export class InMemoryKnowledgeRepository implements KnowledgeRepository {
  docs = new Map<string, KnowledgeDocument>();
  chunks: Chunk[] = [];
  entities = new Map<string, KnowledgeEntity>();
  rels: KnowledgeRelationship[] = [];

  async insertDocument(doc: KnowledgeDocument): Promise<void> { this.docs.set(doc.id, doc); }
  async updateDocumentStatus(_org: string, id: string, status: KnowledgeDocument["status"]): Promise<void> {
    const d = this.docs.get(id); if (d) d.status = status;
  }
  async getDocument(org: string, id: string) { const d = this.docs.get(id); return d?.organizationId === org ? d : undefined; }
  async listDocuments(org: string, limit = 100) {
    return [...this.docs.values()].filter(d => d.organizationId === org).slice(-limit).reverse();
  }
  async insertChunks(chunks: Chunk[]): Promise<void> { this.chunks.push(...chunks); }
  async chunksByOrg(org: string, limit = 5000) { return this.chunks.filter(c => c.organizationId === org).slice(-limit); }
  async chunksByDocument(documentId: string) { return this.chunks.filter(c => c.documentId === documentId); }
  async upsertEntity(input: Omit<KnowledgeEntity, "id">): Promise<KnowledgeEntity> {
    const key = `${input.organizationId}:${input.kind}:${input.name.toLowerCase()}`;
    const existing = this.entities.get(key);
    if (existing) return existing;
    const entity = { ...input, id: newId("ent") };
    this.entities.set(key, entity);
    return entity;
  }
  async insertRelationship(rel: Omit<KnowledgeRelationship, "id">): Promise<KnowledgeRelationship> {
    const r = { ...rel, id: newId("rel") }; this.rels.push(r); return r;
  }
  async entitiesByOrg(org: string) { return [...this.entities.values()].filter(e => e.organizationId === org); }
  async relationshipsByEntity(entityId: string) { return this.rels.filter(r => r.fromEntityId === entityId || r.toEntityId === entityId); }
}

export interface SearchHit { chunkId: string; documentId: string; documentTitle: string; seq: number; text: string; score: number; via: ("vector" | "keyword" | "graph")[] }
export interface SearchResult { hits: SearchHit[]; citations: { documentId: string; title: string; chunkSeq: number }[]; entities: string[] }

const STOPWORDS = new Set("the a an and or of to in for is are was be with on at from by this that it as".split(" "));

function parseContent(contentType: DocContentType, raw: string): string {
  switch (contentType) {
    case "text/html": return raw.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ");
    case "text/markdown": return raw.replace(/```[\s\S]*?```/g, m => m.replace(/```\w*\n?/g, "")).replace(/[#*_>`]/g, "");
    case "text/csv": return raw.split(/\r?\n/).map(line => line.split(",").join(" | ")).join("\n");
    default: return raw;
  }
}

export function chunkText(text: string, target = 1100, overlap = 150): string[] {
  const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const p of paragraphs) {
    if (current.length + p.length + 1 > target && current) {
      chunks.push(current);
      current = current.slice(-overlap) + "\n" + p;
    } else {
      current = current ? `${current}\n${p}` : p;
    }
  }
  if (current.trim()) chunks.push(current);
  return chunks.length ? chunks : [text.slice(0, target)];
}

export function extractEntities(text: string): { name: string; kind: string }[] {
  const out = new Map<string, { name: string; kind: string }>();
  for (const m of text.matchAll(/\b([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+){0,3})(?:™|®)?\b/g)) {
    const name = m[1]!.trim();
    if (name.length < 3 || STOPWORDS.has(name.toLowerCase())) continue;
    const kind = /™|®|Inc|Corp|Ltd|Platform|Engine|System|OS\b/.test(m[0]!) ? "product" : /^[A-Z][a-z]+\s[A-Z][a-z]+$/.test(name) ? "person_or_org" : "concept";
    out.set(name.toLowerCase(), { name, kind });
    if (out.size >= 25) break;
  }
  for (const m of text.matchAll(/\b([a-z0-9.-]+@[a-z0-9.-]+\.[a-z]{2,})\b/gi)) out.set(m[1]!.toLowerCase(), { name: m[1]!, kind: "email" });
  return [...out.values()];
}

/**
 * Cerebro Knowledge Fabric™ — ingestion pipeline emitting the canonical event
 * chain (uploaded → parsed → chunk → embedding → graph → indexed), GraphRAG
 * expansion, and hybrid vector+keyword search with citations.
 */
export class KnowledgeFabric {
  constructor(
    private readonly repo: KnowledgeRepository,
    private readonly x: XGateway,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
  ) {}

  async ingest(ctx: RequestContext, input: { title: string; contentType: DocContentType; content: string; workspaceId?: string; source?: string }): Promise<{ document: KnowledgeDocument; chunks: number; entities: number }> {
    this.policy.assert(ctx.principal, "knowledge:write", { kind: "document", organizationId: ctx.principal.organizationId, workspaceId: input.workspaceId });
    if (!input.content.trim()) throw PlatformError.validation("document content is empty");
    const org = ctx.principal.organizationId;
    const doc: KnowledgeDocument = {
      id: newId("doc"), organizationId: org, workspaceId: input.workspaceId, title: input.title,
      source: input.source ?? "upload", contentType: input.contentType, status: "uploaded",
      rawSize: input.content.length, metadata: {}, createdAt: new Date().toISOString(),
    };
    await this.repo.insertDocument(doc);
    await this.bus.publish(Subjects.knowledge.documentUploaded, { documentId: doc.id, title: doc.title, size: doc.rawSize }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });

    const text = parseContent(input.contentType, input.content);
    const pieces = chunkText(text);
    await this.bus.publish(Subjects.knowledge.documentParsed, { documentId: doc.id, title: doc.title, chunks: pieces.length }, { organizationId: org, traceId: ctx.traceId });

    const { vectors } = await this.x.embed(org, pieces, { traceId: ctx.traceId });
    const chunks: Chunk[] = pieces.map((t, i) => ({
      id: newId("chk"), documentId: doc.id, organizationId: org, seq: i, text: t,
      embedding: vectors[i], tokenEstimate: Math.ceil(t.length / 4),
    }));
    await this.repo.insertChunks(chunks);
    for (const c of chunks.slice(0, 3)) {
      await this.bus.publish(Subjects.knowledge.chunkGenerated, { documentId: doc.id, chunkId: c.id, seq: c.seq }, { organizationId: org, traceId: ctx.traceId });
    }
    await this.bus.publish(Subjects.knowledge.embeddingCreated, { documentId: doc.id, count: chunks.length }, { organizationId: org, traceId: ctx.traceId });

    const entityInputs = extractEntities(text.slice(0, 8000));
    const docEntity = await this.repo.upsertEntity({ organizationId: org, name: doc.title, kind: "document", properties: { documentId: doc.id } });
    let entityCount = 0;
    for (const e of entityInputs) {
      const entity = await this.repo.upsertEntity({ organizationId: org, name: e.name, kind: e.kind, properties: {} });
      await this.repo.insertRelationship({ organizationId: org, fromEntityId: entity.id, toEntityId: docEntity.id, kind: "mentioned_in", documentId: doc.id });
      entityCount++;
    }
    await this.bus.publish(Subjects.knowledge.graphUpdated, { documentId: doc.id, entities: entityCount }, { organizationId: org, traceId: ctx.traceId });
    await this.repo.updateDocumentStatus(org, doc.id, "indexed");
    await this.bus.publish(Subjects.knowledge.searchIndexed, { documentId: doc.id }, { organizationId: org, traceId: ctx.traceId });
    doc.status = "indexed";
    return { document: doc, chunks: chunks.length, entities: entityCount };
  }

  async listDocuments(ctx: RequestContext, limit = 100): Promise<KnowledgeDocument[]> {
    this.policy.assert(ctx.principal, "knowledge:read", { kind: "document", organizationId: ctx.principal.organizationId });
    return this.repo.listDocuments(ctx.principal.organizationId, limit);
  }

  async search(ctx: RequestContext, query: string, opts?: { limit?: number; graphExpand?: boolean }): Promise<SearchResult> {
    this.policy.assert(ctx.principal, "knowledge:read", { kind: "document", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const limit = opts?.limit ?? 6;
    const [{ vectors }, chunks, docs] = await Promise.all([
      this.x.embed(org, [query], { traceId: ctx.traceId }),
      this.repo.chunksByOrg(org),
      this.repo.listDocuments(org, 500),
    ]);
    const qv = vectors[0]!;
    const titleById = new Map(docs.map(d => [d.id, d.title]));
    const qTerms = query.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 2 && !STOPWORDS.has(t));

    const scored = chunks.map(c => {
      const vec = c.embedding ? cosine(qv, c.embedding) : 0;
      const lower = c.text.toLowerCase();
      let kw = 0;
      for (const t of qTerms) if (lower.includes(t)) kw += 1;
      kw = qTerms.length ? kw / qTerms.length : 0;
      const via: ("vector" | "keyword" | "graph")[] = [];
      if (vec > 0.05) via.push("vector");
      if (kw > 0) via.push("keyword");
      return { chunk: c, score: vec * 0.65 + kw * 0.35, via };
    }).filter(s => s.score > 0.02).sort((a, b) => b.score - a.score);

    let top = scored.slice(0, limit);

    if (opts?.graphExpand !== false && top.length) {
      const entities = await this.repo.entitiesByOrg(org);
      const topText = top.map(t => t.chunk.text.toLowerCase()).join(" ");
      const present = entities.filter(e => e.kind !== "document" && topText.includes(e.name.toLowerCase())).slice(0, 5);
      const relatedDocIds = new Set<string>();
      for (const e of present) {
        for (const rel of await this.repo.relationshipsByEntity(e.id)) if (rel.documentId) relatedDocIds.add(rel.documentId);
      }
      const already = new Set(top.map(t => t.chunk.id));
      for (const docId of relatedDocIds) {
        const docChunks = await this.repo.chunksByDocument(docId);
        const best = docChunks.filter(c => !already.has(c.id))
          .map(c => ({ chunk: c, score: (c.embedding ? cosine(qv, c.embedding) : 0) * 0.6, via: ["graph"] as ("vector" | "keyword" | "graph")[] }))
          .sort((a, b) => b.score - a.score)[0];
        if (best && best.score > 0.03) { top.push(best); already.add(best.chunk.id); }
      }
      top = top.sort((a, b) => b.score - a.score).slice(0, limit + 2);
    }

    const hits: SearchHit[] = top.map(t => ({
      chunkId: t.chunk.id, documentId: t.chunk.documentId,
      documentTitle: titleById.get(t.chunk.documentId) ?? "unknown",
      seq: t.chunk.seq, text: t.chunk.text.slice(0, 500), score: Number(t.score.toFixed(4)), via: t.via,
    }));
    const entitiesInHits = new Set<string>();
    const allEntities = await this.repo.entitiesByOrg(org);
    const hitText = hits.map(h => h.text.toLowerCase()).join(" ");
    for (const e of allEntities) if (e.kind !== "document" && hitText.includes(e.name.toLowerCase())) entitiesInHits.add(e.name);
    return {
      hits,
      citations: hits.map(h => ({ documentId: h.documentId, title: h.documentTitle, chunkSeq: h.seq })),
      entities: [...entitiesInHits].slice(0, 10),
    };
  }

  async answer(ctx: RequestContext, question: string): Promise<{ answer: string; citations: SearchResult["citations"] }> {
    const result = await this.search(ctx, question, { limit: 5 });
    const context = result.hits.map((h, i) => `[${i + 1}] (${h.documentTitle}#${h.seq}) ${h.text}`).join("\n\n");
    const res = await this.x.complete(ctx.principal.organizationId, {
      messages: [
        { role: "system", content: "Answer strictly from the provided sources. Cite as [n]. If sources are insufficient, say so." },
        { role: "user", content: `Sources:\n${context}\n\nQuestion: ${question}` },
      ],
      metadata: { purpose: "knowledge:answer" },
    }, { traceId: ctx.traceId });
    return { answer: res.text, citations: result.citations };
  }
}
