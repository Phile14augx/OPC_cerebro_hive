-- 000005_create_publishers_and_categories.down.sql

DROP TABLE IF EXISTS knowledge.tags;
DROP TABLE IF EXISTS knowledge.category_relationships;
DROP TABLE IF EXISTS knowledge.categories;

DROP TABLE IF EXISTS archive.issues;
DROP TABLE IF EXISTS archive.volumes;
DROP TABLE IF EXISTS archive.conferences;
DROP TABLE IF EXISTS archive.journals;
DROP TABLE IF EXISTS archive.publishers;
