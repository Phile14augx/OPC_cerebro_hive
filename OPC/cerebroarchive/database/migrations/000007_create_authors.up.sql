-- 000007_create_authors.up.sql

-- -----------------------------------------------------------------------------
-- AUTHORS & AFFILIATIONS (research schema)
-- -----------------------------------------------------------------------------

CREATE TABLE research.countries (
    id UUID PRIMARY KEY,
    iso_code VARCHAR(2) UNIQUE NOT NULL, -- e.g., US, UK
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE research.institutions (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    country_id UUID REFERENCES research.countries(id) ON DELETE SET NULL,
    website VARCHAR(512),
    grid_id VARCHAR(100), -- Global Research Identifier Database
    ror_id VARCHAR(100), -- Research Organization Registry
    
    version BIGINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID
);

-- Core Author Entity (The canonical resolved identity)
CREATE TABLE research.authors (
    id UUID PRIMARY KEY,
    canonical_name VARCHAR(255) NOT NULL,
    
    -- Identity Resolution Identifiers
    orcid VARCHAR(50) UNIQUE,
    google_scholar_id VARCHAR(100),
    semantic_scholar_id VARCHAR(100),
    scopus_id VARCHAR(100),
    researchgate_id VARCHAR(100),
    
    -- Confidence score for AI-merged identities (0-100)
    identity_confidence_score INT DEFAULT 100,
    
    version BIGINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID
);

CREATE INDEX idx_research_authors_orcid ON research.authors(orcid);

-- Author Aliases (The raw names extracted from PDFs/Metadata that point to the canonical author)
CREATE TABLE research.author_aliases (
    id UUID PRIMARY KEY,
    author_id UUID NOT NULL REFERENCES research.authors(id) ON DELETE CASCADE,
    alias_name VARCHAR(255) NOT NULL, -- e.g., 'A. Ng', 'Andrew Y. Ng'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_research_author_aliases_author ON research.author_aliases(author_id);

-- Affiliations (Authors can belong to multiple institutions over time)
CREATE TABLE research.affiliations (
    id UUID PRIMARY KEY,
    author_id UUID NOT NULL REFERENCES research.authors(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES research.institutions(id) ON DELETE CASCADE,
    department VARCHAR(255),
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Junction between Paper Versions and Authors
-- Note: Tied to paper_versions to preserve history (authors shouldn't retroactively change on a published PDF snapshot without a new version)
CREATE TABLE research.paper_authors (
    paper_version_id UUID NOT NULL REFERENCES archive.paper_versions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES research.authors(id) ON DELETE CASCADE,
    
    -- Author's institution *at the time of publication*
    institution_id UUID REFERENCES research.institutions(id) ON DELETE SET NULL, 
    
    author_position INT NOT NULL, -- 1 = First Author
    is_corresponding BOOLEAN NOT NULL DEFAULT false,
    contribution_statement TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (paper_version_id, author_id)
);

CREATE INDEX idx_research_paper_authors_author ON research.paper_authors(author_id);
