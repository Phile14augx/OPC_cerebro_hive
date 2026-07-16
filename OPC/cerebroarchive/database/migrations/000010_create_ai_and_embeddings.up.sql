-- 000010_create_ai_and_embeddings.up.sql

CREATE EXTENSION IF NOT EXISTS vector;

-- -----------------------------------------------------------------------------
-- AI CONFIGURATION & REGISTRY (ai schema)
-- -----------------------------------------------------------------------------

CREATE TABLE ai.embedding_models (
    id UUID PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL, -- e.g., 'text-embedding-3-small', 'voyage-law-2'
    provider VARCHAR(100) NOT NULL,
    dimension INT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai.llm_models (
    id UUID PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    provider VARCHAR(100) NOT NULL,
    context_window INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai.prompt_templates (
    id UUID PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    template_text TEXT NOT NULL,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- PROCESSING PROVENANCE & JOBS
-- -----------------------------------------------------------------------------

-- Tracks the end-to-end execution of a PDF parser (e.g. GROBID, Marker)
CREATE TABLE ai.processing_runs (
    id UUID PRIMARY KEY,
    paper_version_id UUID NOT NULL REFERENCES archive.paper_versions(id) ON DELETE CASCADE,
    parser_name VARCHAR(100) NOT NULL,
    parser_version VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'processing',
    error_log TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_ai_processing_runs_paper ON ai.processing_runs(paper_version_id);

-- Tracks embedding generation jobs
CREATE TABLE ai.embedding_jobs (
    id UUID PRIMARY KEY,
    model_id UUID NOT NULL REFERENCES ai.embedding_models(id) ON DELETE CASCADE,
    chunking_strategy VARCHAR(100) NOT NULL,
    chunk_size INT,
    chunk_overlap INT,
    status VARCHAR(50) NOT NULL DEFAULT 'processing',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- -----------------------------------------------------------------------------
-- CHUNKING & TARGET RESOLUTION
-- -----------------------------------------------------------------------------

-- The actual parsed text sections from a processing run
CREATE TABLE ai.chunks (
    id UUID PRIMARY KEY,
    processing_run_id UUID NOT NULL REFERENCES ai.processing_runs(id) ON DELETE CASCADE,
    
    parent_chunk_id UUID REFERENCES ai.chunks(id) ON DELETE CASCADE,
    
    raw_text TEXT NOT NULL,
    token_count INT,
    
    -- Rich Metadata
    heading VARCHAR(512),
    page_number INT,
    section_name VARCHAR(255),
    bbox JSONB, -- Coordinates in PDF
    language VARCHAR(10),
    ordinal INT NOT NULL,
    
    is_table BOOLEAN NOT NULL DEFAULT false,
    is_figure BOOLEAN NOT NULL DEFAULT false,
    is_caption BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_chunks_run ON ai.chunks(processing_run_id);

-- Resolves Polymorphic issues: Every embedding must point to a target ID
CREATE TABLE ai.embedding_targets (
    id UUID PRIMARY KEY,
    target_type VARCHAR(50) NOT NULL, -- 'chunk', 'paper_version', 'author', 'category'
    
    -- Only ONE of these will be populated per row
    chunk_id UUID REFERENCES ai.chunks(id) ON DELETE CASCADE,
    paper_version_id UUID REFERENCES archive.paper_versions(id) ON DELETE CASCADE,
    author_id UUID REFERENCES research.authors(id) ON DELETE CASCADE,
    category_id UUID REFERENCES knowledge.categories(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CHECK (
        (target_type = 'chunk' AND chunk_id IS NOT NULL) OR
        (target_type = 'paper_version' AND paper_version_id IS NOT NULL) OR
        (target_type = 'author' AND author_id IS NOT NULL) OR
        (target_type = 'category' AND category_id IS NOT NULL)
    )
);

CREATE INDEX idx_ai_targets_chunk ON ai.embedding_targets(chunk_id);
CREATE INDEX idx_ai_targets_paper ON ai.embedding_targets(paper_version_id);

-- -----------------------------------------------------------------------------
-- EMBEDDINGS (Unconstrained Dimension, 1:Many)
-- -----------------------------------------------------------------------------

CREATE TABLE ai.embeddings (
    id UUID PRIMARY KEY,
    embedding_target_id UUID NOT NULL REFERENCES ai.embedding_targets(id) ON DELETE CASCADE,
    embedding_job_id UUID NOT NULL REFERENCES ai.embedding_jobs(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES ai.embedding_models(id) ON DELETE CASCADE,
    
    embedding vector, -- Unconstrained! Dimension validation in application logic or trigger
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_embeddings_target ON ai.embeddings(embedding_target_id);

-- HNSW Index is created manually in code after determining dimensions, or we create expression indexes per model.
-- e.g., CREATE INDEX ON ai.embeddings USING hnsw (embedding vector_cosine_ops) WHERE model_id = 'XYZ';

-- -----------------------------------------------------------------------------
-- RAG & CONVERSATIONAL MEMORY
-- -----------------------------------------------------------------------------

CREATE TABLE ai.rag_sessions (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES identity.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai.rag_messages (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES ai.rag_sessions(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- user, assistant, system
    content TEXT NOT NULL,
    
    -- Provenance
    llm_model_id UUID REFERENCES ai.llm_models(id) ON DELETE SET NULL,
    prompt_template_id UUID REFERENCES ai.prompt_templates(id) ON DELETE SET NULL,
    temperature NUMERIC(3,2),
    tokens_used INT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RAG Provenance: Tracks every piece of retrieved text and why it was chosen
CREATE TABLE ai.message_citations (
    id UUID PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES ai.rag_messages(id) ON DELETE CASCADE,
    chunk_id UUID NOT NULL REFERENCES ai.chunks(id) ON DELETE CASCADE,
    
    retrieval_stage VARCHAR(50), -- e.g., 'initial_vector_search', 'reranker'
    score NUMERIC(7,5), -- e.g., cosine similarity
    rerank_score NUMERIC(7,5),
    prompt_position INT, -- Order it appeared in the context window
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai.feedback (
    id UUID PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES ai.rag_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    is_positive BOOLEAN NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- SEMANTIC KNOWLEDGE GRAPH (RDF Style)
-- -----------------------------------------------------------------------------

CREATE TABLE ai.nodes (
    id UUID PRIMARY KEY,
    label VARCHAR(255) NOT NULL, -- e.g., 'Machine Learning', 'Geoffrey Hinton'
    node_type VARCHAR(100), -- Concept, Person, Algorithm
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai.edges (
    id UUID PRIMARY KEY,
    subject_id UUID NOT NULL REFERENCES ai.nodes(id) ON DELETE CASCADE,
    predicate VARCHAR(255) NOT NULL, -- e.g., 'invented', 'improves'
    object_id UUID NOT NULL REFERENCES ai.nodes(id) ON DELETE CASCADE,
    
    -- Provenance of extraction
    source_chunk_id UUID REFERENCES ai.chunks(id) ON DELETE SET NULL,
    llm_model_id UUID REFERENCES ai.llm_models(id) ON DELETE SET NULL,
    confidence NUMERIC(3,2),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_edges_subject ON ai.edges(subject_id);
CREATE INDEX idx_ai_edges_object ON ai.edges(object_id);
