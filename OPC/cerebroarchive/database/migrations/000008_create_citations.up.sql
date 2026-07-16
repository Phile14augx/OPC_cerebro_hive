-- 000008_create_citations.up.sql

-- -----------------------------------------------------------------------------
-- CITATIONS & REFERENCES (research schema)
-- -----------------------------------------------------------------------------

-- The Reference block found at the end of a paper
CREATE TABLE research.references (
    id UUID PRIMARY KEY,
    source_paper_version_id UUID NOT NULL REFERENCES archive.paper_versions(id) ON DELETE CASCADE,
    
    -- The target could be a known paper in our DB, or just raw text if unmatched
    target_paper_id UUID REFERENCES archive.papers(id) ON DELETE SET NULL, 
    
    raw_reference_text TEXT NOT NULL,
    reference_number INT, -- e.g., [1]
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_research_refs_source ON research.references(source_paper_version_id);
CREATE INDEX idx_research_refs_target ON research.references(target_paper_id);

-- Citations (The actual inline citation connecting two papers)
CREATE TABLE research.citations (
    id UUID PRIMARY KEY,
    source_paper_version_id UUID NOT NULL REFERENCES archive.paper_versions(id) ON DELETE CASCADE,
    target_paper_id UUID NOT NULL REFERENCES archive.papers(id) ON DELETE CASCADE,
    
    reference_id UUID REFERENCES research.references(id) ON DELETE SET NULL,
    
    -- Semantic Graph Properties
    citation_type VARCHAR(50) NOT NULL DEFAULT 'background', -- supports, extends, criticizes, replicates, background, survey, method, dataset, benchmark
    is_self_citation BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_research_citations_source ON research.citations(source_paper_version_id);
CREATE INDEX idx_research_citations_target ON research.citations(target_paper_id);

-- Citation Contexts (The surrounding text where the citation occurred, invaluable for RAG and AI evaluation)
CREATE TABLE research.citation_contexts (
    id UUID PRIMARY KEY,
    citation_id UUID NOT NULL REFERENCES research.citations(id) ON DELETE CASCADE,
    
    context_text TEXT NOT NULL, -- e.g., "Unlike previous methods [1], our approach..."
    section_name VARCHAR(255),  -- e.g., "Introduction", "Methodology"
    page_number INT,
    
    sentiment_score NUMERIC(3,2), -- AI-derived later (-1.0 to 1.0)
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_research_citation_contexts_cit ON research.citation_contexts(citation_id);
