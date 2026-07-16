-- 000010_create_ai_and_embeddings.down.sql

DROP TABLE IF EXISTS ai.edges;
DROP TABLE IF EXISTS ai.nodes;

DROP TABLE IF EXISTS ai.feedback;
DROP TABLE IF EXISTS ai.message_citations;
DROP TABLE IF EXISTS ai.rag_messages;
DROP TABLE IF EXISTS ai.rag_sessions;

DROP TABLE IF EXISTS ai.embeddings;
DROP TABLE IF EXISTS ai.embedding_targets;
DROP TABLE IF EXISTS ai.chunks;

DROP TABLE IF EXISTS ai.embedding_jobs;
DROP TABLE IF EXISTS ai.processing_runs;

DROP TABLE IF EXISTS ai.prompt_templates;
DROP TABLE IF EXISTS ai.llm_models;
DROP TABLE IF EXISTS ai.embedding_models;

-- Note: We generally don't drop extensions in down migrations as other schemas might depend on them,
-- but if we want to be strict:
-- DROP EXTENSION IF EXISTS vector;
