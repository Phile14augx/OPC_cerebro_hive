/**
 * KnowledgeOps — Hybrid Retrieval Engine
 * Combines dense vector search (ANN cosine) + sparse BM25 full-text search,
 * then reranks with a cross-encoder. Queries pgvector + PostgreSQL full-text.
 */

import crypto from "node:crypto";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RetrievedChunk {
  id:           string;
  documentId:   string;
  collectionId: string;
  content:      string;
  metadata:     Record<string, unknown>;
  vectorScore:  number;   // 0–1 cosine similarity
  bm25Score:    number;   // BM25 TF-IDF rank
  fusedScore:   number;   // RRF fused score
  rerankedScore?: number; // cross-encoder score (optional)
  chunkIndex:   number;
  level:        number;
}

export interface RetrievalOptions {
  collectionId:   string;
  query:          string;
  embedding?:     number[];         // if pre-computed
  topK?:          number;           // default 10
  vectorWeight?:  number;           // RRF weight for vector (default 0.5)
  bm25Weight?:    number;           // RRF weight for BM25 (default 0.5)
  useReranker?:   boolean;          // apply cross-encoder (default true)
  metadataFilter?: Record<string, unknown>;
  levelFilter?:   number;           // restrict to chunk hierarchy level
  minScore?:      number;           // minimum fused score
}

export interface RetrievalResult {
  chunks:       RetrievedChunk[];
  totalFound:   number;
  queryHash:    string;
  latencyMs:    number;
  mode:         "vector" | "bm25" | "hybrid" | "reranked";
}

// ── Database client interface (injected to avoid hard pg dep) ─────────────────

export interface DbClient {
  query<T>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

// ── Embedder interface ────────────────────────────────────────────────────────

export type EmbedFn = (text: string) => Promise<number[]>;
export type RerankerFn = (
  query: string,
  docs: string[],
) => Promise<number[]>;

// ── Reciprocal Rank Fusion ────────────────────────────────────────────────────

function rrf(
  lists: Array<Array<{ id: string; score: number }>>,
  weights: number[],
  k = 60,
): Map<string, number> {
  const scores = new Map<string, number>();

  for (let li = 0; li < lists.length; li++) {
    const w = weights[li] ?? 1;
    lists[li].forEach(({ id }, rank) => {
      const prev = scores.get(id) ?? 0;
      scores.set(id, prev + w * (1 / (k + rank + 1)));
    });
  }
  return scores;
}

// ── Hybrid Retriever ──────────────────────────────────────────────────────────

export class HybridRetriever {
  constructor(
    private readonly db: DbClient,
    private readonly embed: EmbedFn,
    private readonly rerank?: RerankerFn,
  ) {}

  async retrieve(opts: RetrievalOptions): Promise<RetrievalResult> {
    const start      = Date.now();
    const topK       = opts.topK       ?? 10;
    const vecW       = opts.vectorWeight ?? 0.5;
    const bm25W      = opts.bm25Weight  ?? 0.5;
    const useReranker = opts.useReranker ?? true;
    const queryHash  = crypto.createHash("sha256").update(opts.query).digest("hex").slice(0, 16);

    // ── 1. Embed query ───────────────────────────────────────────────────────
    const embedding = opts.embedding ?? await this.embed(opts.query);

    // ── 2. Vector search (ANN cosine) ────────────────────────────────────────
    const vectorResults = await this.vectorSearch(
      opts.collectionId,
      embedding,
      topK * 3,   // fetch more candidates for fusion
      opts.metadataFilter,
      opts.levelFilter,
    );

    // ── 3. BM25 full-text search ─────────────────────────────────────────────
    const bm25Results = await this.bm25Search(
      opts.collectionId,
      opts.query,
      topK * 3,
      opts.metadataFilter,
      opts.levelFilter,
    );

    // ── 4. Reciprocal Rank Fusion ────────────────────────────────────────────
    const vectorList = vectorResults.map((r) => ({ id: r.id, score: r.vectorScore }));
    const bm25List   = bm25Results.map((r) => ({ id: r.id, score: r.bm25Score }));

    const fusedScores = rrf([vectorList, bm25List], [vecW, bm25W]);

    // Merge chunks from both result sets
    const allChunks = new Map<string, RetrievedChunk>();
    for (const c of [...vectorResults, ...bm25Results]) {
      if (!allChunks.has(c.id)) allChunks.set(c.id, c);
    }

    let merged: RetrievedChunk[] = [...allChunks.values()]
      .map((c) => ({
        ...c,
        fusedScore: fusedScores.get(c.id) ?? 0,
      }))
      .filter((c) => !opts.minScore || c.fusedScore >= opts.minScore)
      .sort((a, b) => b.fusedScore - a.fusedScore)
      .slice(0, topK);

    // ── 5. Cross-encoder reranking ───────────────────────────────────────────
    let mode: RetrievalResult["mode"] = "hybrid";

    if (useReranker && this.rerank && merged.length > 0) {
      const rerankScores = await this.rerank(
        opts.query,
        merged.map((c) => c.content),
      );

      merged = merged
        .map((c, i) => ({ ...c, rerankedScore: rerankScores[i] }))
        .sort((a, b) => (b.rerankedScore ?? 0) - (a.rerankedScore ?? 0));

      mode = "reranked";
    }

    return {
      chunks:     merged,
      totalFound: allChunks.size,
      queryHash,
      latencyMs:  Date.now() - start,
      mode,
    };
  }

  // ── Private: vector search ────────────────────────────────────────────────

  private async vectorSearch(
    collectionId: string,
    embedding: number[],
    limit: number,
    metadataFilter?: Record<string, unknown>,
    levelFilter?: number,
  ): Promise<RetrievedChunk[]> {
    const embeddingLiteral = `'[${embedding.join(",")}]'`;

    const filters = [
      `ch.collection_id = $1`,
      levelFilter !== undefined ? `ch.level = $2` : null,
    ].filter(Boolean).join(" AND ");

    const params: unknown[] = [collectionId];
    if (levelFilter !== undefined) params.push(levelFilter);
    params.push(limit);

    const sql = `
      SELECT
        ch.id,
        ch.document_id,
        ch.collection_id,
        ch.content,
        ch.metadata,
        ch.chunk_index,
        ch.level,
        1 - (ch.embedding <=> ${embeddingLiteral}::vector) AS vector_score
      FROM knowledge_chunks ch
      WHERE ${filters}
        AND ch.embedding IS NOT NULL
      ORDER BY ch.embedding <=> ${embeddingLiteral}::vector
      LIMIT $${params.length}
    `;

    const result = await this.db.query<{
      id: string; document_id: string; collection_id: string;
      content: string; metadata: Record<string, unknown>;
      chunk_index: number; level: number; vector_score: number;
    }>(sql, params);

    return result.rows.map((r) => ({
      id:           r.id,
      documentId:   r.document_id,
      collectionId: r.collection_id,
      content:      r.content,
      metadata:     r.metadata,
      chunkIndex:   r.chunk_index,
      level:        r.level,
      vectorScore:  parseFloat(String(r.vector_score)),
      bm25Score:    0,
      fusedScore:   0,
    }));
  }

  // ── Private: BM25 full-text search ───────────────────────────────────────

  private async bm25Search(
    collectionId: string,
    query: string,
    limit: number,
    metadataFilter?: Record<string, unknown>,
    levelFilter?: number,
  ): Promise<RetrievedChunk[]> {
    const params: unknown[] = [collectionId, query, limit];
    const levelClause = levelFilter !== undefined
      ? `AND ch.level = ${levelFilter}`
      : "";

    const sql = `
      SELECT
        ch.id,
        ch.document_id,
        ch.collection_id,
        ch.content,
        ch.metadata,
        ch.chunk_index,
        ch.level,
        ts_rank_cd(ch.tsv, plainto_tsquery('english', $2), 32) AS bm25_score
      FROM knowledge_chunks ch
      WHERE ch.collection_id = $1
        AND ch.tsv @@ plainto_tsquery('english', $2)
        ${levelClause}
      ORDER BY bm25_score DESC
      LIMIT $3
    `;

    const result = await this.db.query<{
      id: string; document_id: string; collection_id: string;
      content: string; metadata: Record<string, unknown>;
      chunk_index: number; level: number; bm25_score: number;
    }>(sql, params);

    return result.rows.map((r) => ({
      id:           r.id,
      documentId:   r.document_id,
      collectionId: r.collection_id,
      content:      r.content,
      metadata:     r.metadata,
      chunkIndex:   r.chunk_index,
      level:        r.level,
      vectorScore:  0,
      bm25Score:    parseFloat(String(r.bm25_score)),
      fusedScore:   0,
    }));
  }
}

// ── Chunking strategies ───────────────────────────────────────────────────────

export interface ChunkOptions {
  strategy:   "fixed" | "semantic" | "hierarchical";
  chunkSize:  number;   // tokens (fixed) or chars (semantic)
  overlap:    number;   // overlap in same units
}

export function chunkText(text: string, opts: ChunkOptions): string[] {
  switch (opts.strategy) {
    case "fixed":       return fixedChunk(text, opts.chunkSize, opts.overlap);
    case "semantic":    return semanticChunk(text, opts.chunkSize, opts.overlap);
    case "hierarchical": return hierarchicalChunk(text);
    default:            return fixedChunk(text, opts.chunkSize, opts.overlap);
  }
}

function fixedChunk(text: string, size: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  const step = size - overlap;
  while (start < text.length) {
    chunks.push(text.slice(start, start + size));
    start += step;
    if (step <= 0) break;
  }
  return chunks;
}

function semanticChunk(text: string, maxSize: number, overlap: number): string[] {
  // Split on sentence boundaries, then group into windows
  const sentences = text
    .replace(/([.!?])\s+/g, "$1\n")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (current.length + sentence.length > maxSize && current.length > 0) {
      chunks.push(current.trim());
      // Keep last N chars as overlap
      const overlapText = current.slice(-overlap);
      current = overlapText + " " + sentence;
    } else {
      current += (current ? " " : "") + sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function hierarchicalChunk(text: string): string[] {
  // Level 2: whole sections (h1/h2)
  // Level 1: paragraphs
  // Level 0: sentences
  const sections = text.split(/\n#{1,2}\s/);
  const chunks: string[] = [];

  for (const section of sections) {
    chunks.push(section.trim());  // level 1 (section)
    const paragraphs = section.split(/\n\n+/);
    for (const para of paragraphs) {
      if (para.trim()) chunks.push(para.trim());  // level 0 (paragraph)
    }
  }
  return chunks.filter(Boolean);
}
