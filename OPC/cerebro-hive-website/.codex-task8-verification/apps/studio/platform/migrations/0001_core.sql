CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE organizations (
  id text PRIMARY KEY, name text NOT NULL, slug text NOT NULL UNIQUE, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE users (
  id text PRIMARY KEY, organization_id text NOT NULL REFERENCES organizations(id),
  email text NOT NULL, name text NOT NULL, roles text NOT NULL DEFAULT '[]',
  attributes text NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, email)
);
CREATE TABLE workspaces (
  id text PRIMARY KEY, organization_id text NOT NULL REFERENCES organizations(id),
  name text NOT NULL, kind text NOT NULL DEFAULT 'general', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE api_keys (
  id text PRIMARY KEY, organization_id text NOT NULL REFERENCES organizations(id),
  user_id text NOT NULL, name text NOT NULL, key_hash text NOT NULL UNIQUE,
  roles text NOT NULL DEFAULT '[]', last_used_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), revoked_at timestamptz
);
CREATE TABLE audit_log (
  id text PRIMARY KEY, organization_id text NOT NULL, actor text NOT NULL, action text NOT NULL,
  resource text NOT NULL, resource_id text, details text NOT NULL DEFAULT '{}', trace_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_org_time ON audit_log (organization_id, created_at DESC);

CREATE TABLE agents (
  id text PRIMARY KEY, organization_id text NOT NULL, name text NOT NULL, kind text NOT NULL,
  capabilities text NOT NULL DEFAULT '[]', endpoint text, status text NOT NULL DEFAULT 'offline',
  last_heartbeat_at timestamptz, metadata text NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE executions (
  id text PRIMARY KEY, organization_id text NOT NULL, workspace_id text, agent_id text,
  goal text NOT NULL, status text NOT NULL, input text NOT NULL DEFAULT '{}',
  result text, error text, plan text, checkpoints text NOT NULL DEFAULT '[]',
  attempts int NOT NULL DEFAULT 0, max_attempts int NOT NULL DEFAULT 3,
  queued_at timestamptz NOT NULL DEFAULT now(), started_at timestamptz, finished_at timestamptz, trace_id text
);
CREATE INDEX exec_org_status ON executions (organization_id, status, queued_at);
CREATE TABLE execution_steps (
  id text PRIMARY KEY, execution_id text NOT NULL REFERENCES executions(id), organization_id text NOT NULL,
  seq int NOT NULL, name text NOT NULL, status text NOT NULL, tool text, input text, output text,
  started_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz
);
CREATE INDEX steps_exec ON execution_steps (execution_id, seq);
CREATE TABLE artifacts (
  id text PRIMARY KEY, organization_id text NOT NULL, execution_id text, name text NOT NULL,
  content_type text NOT NULL DEFAULT 'text/plain', content text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE memory_records (
  id text PRIMARY KEY, organization_id text NOT NULL, workspace_id text, tier text NOT NULL,
  scope_key text NOT NULL, content text NOT NULL, summary text, embedding vector(256),
  importance real NOT NULL DEFAULT 0.5, version int NOT NULL DEFAULT 1, expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX memory_scope ON memory_records (organization_id, tier, scope_key, updated_at DESC);

CREATE TABLE documents (
  id text PRIMARY KEY, organization_id text NOT NULL, workspace_id text, title text NOT NULL,
  source text NOT NULL DEFAULT 'upload', content_type text NOT NULL, status text NOT NULL DEFAULT 'uploaded',
  raw_size int NOT NULL DEFAULT 0, metadata text NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE chunks (
  id text PRIMARY KEY, document_id text NOT NULL REFERENCES documents(id), organization_id text NOT NULL,
  seq int NOT NULL, text text NOT NULL, embedding vector(256), token_estimate int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX chunks_doc ON chunks (document_id, seq);
CREATE TABLE entities (
  id text PRIMARY KEY, organization_id text NOT NULL, name text NOT NULL, kind text NOT NULL,
  properties text NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, kind, name)
);
CREATE TABLE relationships (
  id text PRIMARY KEY, organization_id text NOT NULL,
  from_entity_id text NOT NULL REFERENCES entities(id), to_entity_id text NOT NULL REFERENCES entities(id),
  kind text NOT NULL, properties text NOT NULL DEFAULT '{}', document_id text, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE workflows (
  id text PRIMARY KEY, organization_id text NOT NULL, name text NOT NULL, version int NOT NULL DEFAULT 1,
  definition text NOT NULL, status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE workflow_runs (
  id text PRIMARY KEY, workflow_id text NOT NULL REFERENCES workflows(id), organization_id text NOT NULL,
  status text NOT NULL, trigger text NOT NULL, input text NOT NULL DEFAULT '{}', state text NOT NULL DEFAULT '{}',
  error text, started_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz
);
CREATE TABLE approvals (
  id text PRIMARY KEY, organization_id text NOT NULL, subject_kind text NOT NULL, subject_id text NOT NULL,
  requested_by text NOT NULL, approver_role text NOT NULL DEFAULT 'admin', status text NOT NULL DEFAULT 'pending',
  reason text, decided_by text, decided_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE guard_events (
  id text PRIMARY KEY, organization_id text NOT NULL, direction text NOT NULL, risk_score int NOT NULL,
  blocked int NOT NULL DEFAULT 0, findings text NOT NULL DEFAULT '[]', content_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE eval_runs (
  id text PRIMARY KEY, organization_id text NOT NULL, suite text NOT NULL, target text NOT NULL,
  total int NOT NULL, passed int NOT NULL, failed int NOT NULL, score real NOT NULL,
  report text NOT NULL DEFAULT '{}', baseline_score real, regression int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE prompts (
  id text PRIMARY KEY, organization_id text NOT NULL, name text NOT NULL, version int NOT NULL DEFAULT 1,
  template text NOT NULL, variables text NOT NULL DEFAULT '[]', created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name, version)
);
CREATE TABLE ai_calls (
  id text PRIMARY KEY, organization_id text NOT NULL, provider text NOT NULL, model text NOT NULL,
  operation text NOT NULL, prompt_tokens int NOT NULL DEFAULT 0, completion_tokens int NOT NULL DEFAULT 0,
  cost_usd numeric(12,6) NOT NULL DEFAULT 0, latency_ms int NOT NULL DEFAULT 0, cached int NOT NULL DEFAULT 0,
  ok int NOT NULL DEFAULT 1, trace_id text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_calls_org_time ON ai_calls (organization_id, created_at DESC);
CREATE TABLE connectors (
  id text PRIMARY KEY, organization_id text NOT NULL, kind text NOT NULL, name text NOT NULL,
  config text NOT NULL DEFAULT '{}', status text NOT NULL DEFAULT 'configured', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE world_entities (
  id text PRIMARY KEY, organization_id text NOT NULL, kind text NOT NULL, ref_id text NOT NULL,
  name text NOT NULL, state text NOT NULL DEFAULT '{}', embedding vector(256), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, kind, ref_id)
);
CREATE TABLE insights (
  id text PRIMARY KEY, organization_id text NOT NULL, kind text NOT NULL, title text NOT NULL,
  body text NOT NULL, confidence real NOT NULL DEFAULT 0.5, source text NOT NULL DEFAULT 'hub',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE simulations (
  id text PRIMARY KEY, organization_id text NOT NULL, kind text NOT NULL, scenario text NOT NULL,
  result text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE notifications (
  id text PRIMARY KEY, organization_id text NOT NULL, user_id text, severity text NOT NULL DEFAULT 'info',
  title text NOT NULL, body text NOT NULL DEFAULT '', read int NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE feature_flags (
  key text NOT NULL, organization_id text NOT NULL, enabled int NOT NULL DEFAULT 0, payload text,
  updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (key, organization_id)
);
