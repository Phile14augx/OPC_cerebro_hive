-- 000006_create_archive_core.up.sql

-- -----------------------------------------------------------------------------
-- ARCHIVE CORE (archive schema)
-- -----------------------------------------------------------------------------

-- Papers (The core logical entity, workspace isolated)
CREATE TABLE archive.papers (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES identity.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, published, archived, retracted
    visibility VARCHAR(50) NOT NULL DEFAULT 'private', -- private, internal, public
    
    current_version_id UUID, -- References the active version in paper_versions
    
    version BIGINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID
);

CREATE INDEX idx_archive_papers_workspace ON archive.papers(workspace_id);

-- Paper Versions (Immutable snapshots)
CREATE TABLE archive.paper_versions (
    id UUID PRIMARY KEY,
    paper_id UUID NOT NULL REFERENCES archive.papers(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    title TEXT NOT NULL,
    abstract TEXT,
    full_text_hash VARCHAR(255),
    commit_message TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID, -- The author/system that created this version
    UNIQUE(paper_id, version_number)
);

-- Note: We can now add the FK constraint to papers.current_version_id safely
ALTER TABLE archive.papers
ADD CONSTRAINT fk_papers_current_version
FOREIGN KEY (current_version_id) REFERENCES archive.paper_versions(id) ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- PAPER METADATA (Normalized)
-- -----------------------------------------------------------------------------

-- Identifiers (DOI, ISBN, etc.)
CREATE TABLE archive.paper_identifiers (
    paper_id UUID PRIMARY KEY REFERENCES archive.papers(id) ON DELETE CASCADE,
    doi VARCHAR(255),
    isbn VARCHAR(255),
    issn VARCHAR(255),
    arxiv_id VARCHAR(255),
    pmid VARCHAR(255),
    semantic_scholar_id VARCHAR(255),
    crossref_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_archive_paper_ident_doi ON archive.paper_identifiers(doi);

-- Statistics (Citations, views, downloads - frequently updated)
CREATE TABLE archive.paper_statistics (
    paper_id UUID PRIMARY KEY REFERENCES archive.papers(id) ON DELETE CASCADE,
    citation_count INT NOT NULL DEFAULT 0,
    download_count INT NOT NULL DEFAULT 0,
    view_count INT NOT NULL DEFAULT 0,
    reference_count INT NOT NULL DEFAULT 0,
    figure_count INT NOT NULL DEFAULT 0,
    table_count INT NOT NULL DEFAULT 0,
    equation_count INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Publication info
CREATE TABLE archive.paper_publication (
    paper_id UUID PRIMARY KEY REFERENCES archive.papers(id) ON DELETE CASCADE,
    publisher_id UUID REFERENCES archive.publishers(id) ON DELETE SET NULL,
    journal_id UUID REFERENCES archive.journals(id) ON DELETE SET NULL,
    conference_id UUID REFERENCES archive.conferences(id) ON DELETE SET NULL,
    
    published_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    
    volume VARCHAR(50),
    issue VARCHAR(50),
    pages VARCHAR(50),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- ASSETS (Rich Metadata for Object Storage)
-- -----------------------------------------------------------------------------

CREATE TABLE archive.paper_assets (
    id UUID PRIMARY KEY,
    paper_version_id UUID NOT NULL REFERENCES archive.paper_versions(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL, -- pdf, image, source_code, dataset, notebook, video
    mime_type VARCHAR(255) NOT NULL,
    
    storage_provider VARCHAR(50) NOT NULL DEFAULT 'minio',
    bucket VARCHAR(255) NOT NULL,
    object_key TEXT NOT NULL,
    
    size_bytes BIGINT NOT NULL,
    checksum VARCHAR(255),
    checksum_algorithm VARCHAR(50),
    
    -- Rich Metadata
    page_count INT,
    language VARCHAR(10),
    ocr_available BOOLEAN NOT NULL DEFAULT false,
    text_extractable BOOLEAN NOT NULL DEFAULT true,
    encrypted BOOLEAN NOT NULL DEFAULT false,
    
    thumbnail_key TEXT,
    preview_key TEXT,
    virus_scan_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, clean, infected
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_archive_assets_version ON archive.paper_assets(paper_version_id);
