-- 000009_create_collaboration.up.sql

-- -----------------------------------------------------------------------------
-- ENTERPRISE COLLABORATION (archive schema)
-- Collections, Bookmarks, Annotations, Highlights
-- -----------------------------------------------------------------------------

-- Collections (Folders/Groups for Papers)
CREATE TABLE archive.collections (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES identity.workspaces(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT false,
    
    version BIGINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID
);

CREATE INDEX idx_archive_collections_workspace ON archive.collections(workspace_id);
CREATE INDEX idx_archive_collections_owner ON archive.collections(owner_id);

-- Collection Items (Mapping Papers to Collections)
CREATE TABLE archive.collection_items (
    collection_id UUID NOT NULL REFERENCES archive.collections(id) ON DELETE CASCADE,
    paper_id UUID NOT NULL REFERENCES archive.papers(id) ON DELETE CASCADE,
    
    added_by UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (collection_id, paper_id)
);

CREATE INDEX idx_archive_collection_items_paper ON archive.collection_items(paper_id);

-- Bookmarks & Favorites
CREATE TABLE archive.bookmarks (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    paper_id UUID NOT NULL REFERENCES archive.papers(id) ON DELETE CASCADE,
    
    folder_name VARCHAR(100), -- Optional lightweight grouping for bookmarks
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, paper_id)
);

CREATE INDEX idx_archive_bookmarks_user ON archive.bookmarks(user_id);

-- Annotations & Highlights (PDF/Text overlays)
CREATE TABLE archive.annotations (
    id UUID PRIMARY KEY,
    paper_version_id UUID NOT NULL REFERENCES archive.paper_versions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    
    annotation_type VARCHAR(50) NOT NULL DEFAULT 'highlight', -- highlight, comment, freehand
    
    -- The text that was highlighted (useful for search)
    selected_text TEXT, 
    
    -- Coordinate data for PDF bounding boxes or DOM selections
    position_data JSONB NOT NULL,
    
    color VARCHAR(20) DEFAULT '#FFE866',
    note TEXT, -- The user's comment attached to the highlight
    
    is_public BOOLEAN NOT NULL DEFAULT false, -- If true, shared with the workspace
    
    version BIGINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID
);

CREATE INDEX idx_archive_annotations_paper ON archive.annotations(paper_version_id);
CREATE INDEX idx_archive_annotations_author ON archive.annotations(author_id);

-- Discussion/Comments on Papers or Collections
CREATE TABLE archive.comments (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES identity.workspaces(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    
    -- Polymorphic relation
    entity_type VARCHAR(50) NOT NULL, -- paper, collection, annotation
    entity_id UUID NOT NULL,
    
    parent_comment_id UUID REFERENCES archive.comments(id) ON DELETE CASCADE, -- For threading
    
    content TEXT NOT NULL,
    
    version BIGINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID
);

CREATE INDEX idx_archive_comments_entity ON archive.comments(entity_type, entity_id);
