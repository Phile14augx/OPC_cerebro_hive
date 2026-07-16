-- 000003_create_audit_tables.up.sql

-- System-wide immutable events
CREATE TABLE audit.events (
    id UUID PRIMARY KEY,
    event_type VARCHAR(255) NOT NULL,
    actor_id UUID,          -- User who initiated
    tenant_id UUID,         -- Optional for cross-tenant events
    workspace_id UUID,      -- Optional for workspace specific
    resource_type VARCHAR(255),
    resource_id UUID,
    payload JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_events_actor ON audit.events(actor_id);
CREATE INDEX idx_audit_events_resource ON audit.events(resource_type, resource_id);
CREATE INDEX idx_audit_events_tenant ON audit.events(tenant_id);

-- Entity changes (CDC style changes for rollback/history)
CREATE TABLE audit.entity_changes (
    id UUID PRIMARY KEY,
    entity_type VARCHAR(255) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE
    actor_id UUID,
    old_data JSONB,
    new_data JSONB,
    changed_fields JSONB, -- Array of field names that changed
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_entity_changes_entity ON audit.entity_changes(entity_type, entity_id);
CREATE INDEX idx_audit_entity_changes_actor ON audit.entity_changes(actor_id);

-- API Logs (For debugging, compliance, tracking rate limits or abuse)
CREATE TABLE audit.api_logs (
    id UUID PRIMARY KEY,
    request_id UUID NOT NULL,
    actor_id UUID,
    method VARCHAR(10) NOT NULL,
    path TEXT NOT NULL,
    status_code INT NOT NULL,
    duration_ms INT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_api_logs_actor ON audit.api_logs(actor_id);
CREATE INDEX idx_audit_api_logs_request_id ON audit.api_logs(request_id);

-- Security Logs (Logins, Failed Logins, MFA, Password Resets)
CREATE TABLE audit.security_logs (
    id UUID PRIMARY KEY,
    event_type VARCHAR(255) NOT NULL, -- e.g., 'login_success', 'login_failed', 'password_changed'
    actor_id UUID,
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    severity VARCHAR(50) NOT NULL DEFAULT 'info', -- info, warning, critical
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_security_logs_actor ON audit.security_logs(actor_id);
CREATE INDEX idx_audit_security_logs_type ON audit.security_logs(event_type);
