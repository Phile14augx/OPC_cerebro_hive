-- 000002_create_system_tables.down.sql

DROP TABLE IF EXISTS system.outbox;
DROP TABLE IF EXISTS system.jobs;
DROP TABLE IF EXISTS system.settings;
DROP TABLE IF EXISTS system.feature_flags;
