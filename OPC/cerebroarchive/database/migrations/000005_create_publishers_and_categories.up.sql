-- 000005_create_publishers_and_categories.up.sql

-- -----------------------------------------------------------------------------
-- PUBLISHERS (archive schema)
-- -----------------------------------------------------------------------------

CREATE TABLE archive.publishers (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    website VARCHAR(512),
    version BIGINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID
);

CREATE TABLE archive.journals (
    id UUID PRIMARY KEY,
    publisher_id UUID REFERENCES archive.publishers(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    abbreviation VARCHAR(100),
    issn_print VARCHAR(20),
    issn_online VARCHAR(20),
    impact_factor NUMERIC(5,3),
    version BIGINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID
);

CREATE INDEX idx_archive_journals_publisher ON archive.journals(publisher_id);

CREATE TABLE archive.conferences (
    id UUID PRIMARY KEY,
    publisher_id UUID REFERENCES archive.publishers(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    acronym VARCHAR(50),
    core_ranking VARCHAR(10), -- e.g. A*, A, B, C
    version BIGINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID
);

CREATE INDEX idx_archive_conferences_publisher ON archive.conferences(publisher_id);

CREATE TABLE archive.volumes (
    id UUID PRIMARY KEY,
    journal_id UUID REFERENCES archive.journals(id) ON DELETE CASCADE,
    volume_number VARCHAR(50) NOT NULL,
    year INT NOT NULL CHECK (year >= 1600 AND year <= 2100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE archive.issues (
    id UUID PRIMARY KEY,
    volume_id UUID REFERENCES archive.volumes(id) ON DELETE CASCADE,
    issue_number VARCHAR(50) NOT NULL,
    publication_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- -----------------------------------------------------------------------------
-- KNOWLEDGE CATEGORIES (knowledge schema)
-- Designed as a Knowledge Graph rather than a strict tree
-- -----------------------------------------------------------------------------

CREATE TABLE knowledge.categories (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    version BIGINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID
);

-- Graph Edges for Categories
CREATE TABLE knowledge.category_relationships (
    id UUID PRIMARY KEY,
    parent_id UUID NOT NULL REFERENCES knowledge.categories(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES knowledge.categories(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL DEFAULT 'subsumes', -- subsumes, related, overlaps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(parent_id, child_id, relationship_type)
);

CREATE INDEX idx_knowledge_cat_rel_child ON knowledge.category_relationships(child_id);

CREATE TABLE knowledge.tags (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
