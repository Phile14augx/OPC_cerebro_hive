-- 000003_create_audit_tables.down.sql

DROP TABLE IF EXISTS audit.security_logs;
DROP TABLE IF EXISTS audit.api_logs;
DROP TABLE IF EXISTS audit.entity_changes;
DROP TABLE IF EXISTS audit.events;
