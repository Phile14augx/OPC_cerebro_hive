-- ─────────────────────────────────────────────────────────────────────────────
-- KnowledgeOps — pgvector Schema Migrations
-- Enables hybrid BM25 + vector retrieval for RAG pipelines.
-- Run via: psql $DATABASE_URL -f migrations.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;      -- for BM25-like text search
CREATE EXTENSION IF NOT EXISTS btree_gin;    -- for composite GIN indexes
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Document collections ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS knowledge_collections (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL UNIQUE,
  description   TEXT,
  embedding_dim INTEGER NOT NULL DEFAULT 1536,   -- OpenAI/Anthropic embedding size
  chunking_strategy TEXT NOT NULL DEFAULT 'semantic',  -- fixed|semantic|hierarchical
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Source documents ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS knowledge_documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id   UUID NOT NULL REFERENCES knowledge_collections(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  source_url      TEXT,
  source_type     TEXT NOT NULL CHECK (source_type IN ('file', 'url', 'api', 'database', 'manual')),
  content_hash    TEXT NOT NULL,              -- SHA-256 of raw content (dedup)
  raw_content     TEXT,                       -- original text (nullable for large docs)
  char_count      INTEGER NOT NULL DEFAULT 0,
  chunk_count     INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'processing', 'ready', 'failed')),
  error           TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}',
  tags            TEXT[] NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  indexed_at      TIMESTAMPTZ,
  UNIQUE(collection_id, content_hash)
);

CREATE INDEX IF NOT EXISTS idx_documents_collection  ON knowledge_documents(collection_id);
CREATE INDEX IF NOT EXISTS idx_documents_status      ON knowledge_documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_tags        ON knowledge_documents USING GIN(tags);

-- ── Document chunks ───────────────────────────────────────────────────────────
-- Primary table for retrieval. Each row = one retrievable unit.
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id     UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  collection_id   UUID NOT NULL REFERENCES knowledge_collections(id) ON DELETE CASCADE,
  chunk_index     INTEGER NOT NULL,           -- position in document
  content         TEXT NOT NULL,
  content_tokens  INTEGER NOT NULL DEFAULT 0,
  embedding       vector(1536),              -- dense vector for ANN search
  -- BM25 fields
  tsv             TSVECTOR,                  -- precomputed full-text search vector
  -- Hierarchical chunking
  parent_chunk_id UUID REFERENCES knowledge_chunks(id),
  level           INTEGER NOT NULL DEFAULT 0, -- 0=leaf, 1=section, 2=chapter
  -- Metadata
  start_char      INTEGER,
  end_char        INTEGER,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(document_id, chunk_index)
);

-- ANN vector index (IVFFlat for cosine similarity)
-- Recreate with: CREATE INDEX ... USING ivfflat (embedding vector_cosine_ops) WITH (lists=100)
CREATE INDEX IF NOT EXISTS idx_chunks_embedding
  ON knowledge_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Full-text search index for BM25
CREATE INDEX IF NOT EXISTS idx_chunks_tsv
  ON knowledge_chunks USING GIN(tsv);

-- Composite index for collection-scoped queries
CREATE INDEX IF NOT EXISTS idx_chunks_collection_level
  ON knowledge_chunks(collection_id, level);

CREATE INDEX IF NOT EXISTS idx_chunks_parent
  ON knowledge_chunks(parent_chunk_id)
  WHERE parent_chunk_id IS NOT NULL;

-- Auto-update TSV on insert/update
CREATE OR REPLACE FUNCTION update_chunk_tsv()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.tsv := to_tsvector('english', NEW.content);
  RETURN NEW;
END;
$$;

CREATE TRIGGER chunk_tsv_update
  BEFORE INSERT OR UPDATE OF content ON knowledge_chunks
  FOR EACH ROW EXECUTE FUNCTION update_chunk_tsv();

-- ── Retrieval audit log ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS retrieval_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id   UUID NOT NULL REFERENCES knowledge_collections(id),
  query           TEXT NOT NULL,
  query_embedding vector(1536),
  retrieval_mode  TEXT NOT NULL CHECK (retrieval_mode IN ('vector', 'bm25', 'hybrid', 'reranked')),
  top_k           INTEGER NOT NULL,
  results         JSONB NOT NULL DEFAULT '[]',   -- [{chunk_id, score, rank}]
  latency_ms      INTEGER,
  user_id         TEXT,
  session_id      TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_retrieval_logs_collection
  ON retrieval_logs(collection_id, created_at DESC);

-- ── Collection stats (materialized view) ─────────────────────────────────────
CREATE MATERIALIZED VIEW IF NOT EXISTS collection_stats AS
SELECT
  c.id,
  c.name,
  COUNT(DISTINCT d.id)   AS document_count,
  COUNT(DISTINCT ch.id)  AS chunk_count,
  SUM(ch.content_tokens) AS total_tokens,
  MAX(d.indexed_at)      AS last_indexed_at
FROM knowledge_collections c
LEFT JOIN knowledge_documents d  ON d.collection_id = c.id AND d.status = 'ready'
LEFT JOIN knowledge_chunks    ch ON ch.collection_id = c.id
GROUP BY c.id, c.name;

CREATE UNIQUE INDEX IF NOT EXISTS idx_collection_stats_id ON collection_stats(id);

-- Refresh function (called by ingestion pipeline after indexing)
CREATE OR REPLACE FUNCTION refresh_collection_stats()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY collection_stats;
END;
$$;
