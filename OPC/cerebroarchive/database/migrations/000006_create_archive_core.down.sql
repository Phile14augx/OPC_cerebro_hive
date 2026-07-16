-- 000006_create_archive_core.down.sql

DROP TABLE IF EXISTS archive.paper_assets;
DROP TABLE IF EXISTS archive.paper_publication;
DROP TABLE IF EXISTS archive.paper_statistics;
DROP TABLE IF EXISTS archive.paper_identifiers;

ALTER TABLE archive.papers DROP CONSTRAINT fk_papers_current_version;

DROP TABLE IF EXISTS archive.paper_versions;
DROP TABLE IF EXISTS archive.papers;
