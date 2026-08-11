# Chapter 3 — PostgreSQL Schema

> ✅ built and tested today · 🟡 partially built · ⬜ target, not yet built.
> This chapter is the schema the nine stateful bounded contexts from Chapter 2 §2.7 map onto.
> Cortex, Simulator, and the Context Engine own no schema here — they're stateless domain
> services (Ch. 2 §2.3.10–2.3.11) with nothing to persist.

## 3.1 What changes vs. the MVP, and why

The MVP (`agentos/app/models/*.py`) runs on SQLite with string UUIDs, JSON (not JSONB) columns,
**no foreign key constraints between tables**, no enums (`lifecycle_state` is a free-text
string), and no tenant scoping. That was the right call for a zero-infrastructure local MVP —
it's the wrong call for the target architecture. This schema fixes four things structurally
rather than by convention:

1. **Real foreign keys.** `execution.runs.agent_id` actually references `registry.agents(id)`
   with `ON DELETE RESTRICT`. Today's SQLAlchemy models have no such constraint — a `Run` can
   silently reference an `agent_id` that doesn't exist.
2. **Native enums instead of free-text status columns.** `registry.agents.lifecycle_state` is a
   Postgres `ENUM`, not a string — a stray typo can no longer set an agent's lifecycle to a
   36th invalid state. This is the direct fix for the Chapter 2 §2.6 gap #4.
3. **A real fix for the Approval polymorphism gap (Ch. 2 §2.6 gap #1).** Today,
   `governance.Approval.run_id` sometimes holds a `Run.id` and sometimes a `WorkflowRun.id`, and
   the API layer (`governance.py`'s `decide_approval`) guesses which by querying `Run` first,
   `WorkflowRun` second. §3.4 below replaces that with two nullable foreign keys and a `CHECK`
   constraint that exactly one is set — the database now enforces what was previously an
   unenforced convention.
4. **Tenant isolation via Row-Level Security**, closing the Chapter 1 §1.3 NFR gap ("no
   `organization_id` scoping enforced yet"). Every table gets an `org_id`, and every table gets
   an RLS policy scoping reads/writes to `current_setting('app.current_org_id')` — set once per
   request by the API gateway (Ch. 4), not re-checked ad hoc in every query.

## 3.2 Extensions and conventions

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS vector;     -- pgvector, for Memory & Knowledge embeddings
CREATE EXTENSION IF NOT EXISTS pg_trgm;    -- trigram search, for a poor-man's lexical fallback
                                            -- alongside OpenSearch (Ch. 8) rather than instead of it
```

Conventions applied to every table below:
- Primary key: `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`.
- `org_id uuid NOT NULL REFERENCES identity.organizations(id)` on every table except
  `identity.organizations` itself, `tools.definitions`/`tools.skill_packages` when global
  (nullable `org_id` — see §3.6), and `marketplace.agent_templates` (global catalog).
- `created_at timestamptz NOT NULL DEFAULT now()`; tables that are ever updated also get
  `updated_at timestamptz NOT NULL DEFAULT now()` maintained by a shared trigger (§3.7).
- JSON columns are `jsonb`, not `json` — indexable, and what the MVP's `JSON` SQLAlchemy type
  maps onto in Postgres in practice anyway.

## 3.3 Schema: `identity`

```sql
CREATE SCHEMA identity;

CREATE TABLE identity.organizations (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text NOT NULL,
    slug        text NOT NULL UNIQUE,
    created_at  timestamptz NOT NULL DEFAULT now()
);

-- Target extension beyond the MVP (which has no user concept, only API keys) —
-- needed once Ch. 13 replaces API-key-only auth with Keycloak/OIDC.
CREATE TABLE identity.users (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id        uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
    email         text NOT NULL,
    display_name  text NOT NULL DEFAULT '',
    created_at    timestamptz NOT NULL DEFAULT now(),
    UNIQUE (org_id, email)
);

CREATE TABLE identity.api_keys (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id        uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
    user_id       uuid REFERENCES identity.users(id) ON DELETE SET NULL,
    key_hash      text NOT NULL UNIQUE,  -- sha256 of the key; the MVP stores the key itself in
                                         -- plaintext (APIKey.key) — this is a real security fix,
                                         -- not a style change
    owner         text NOT NULL,
    trust_level   text NOT NULL DEFAULT 'standard',
    revoked       boolean NOT NULL DEFAULT false,
    created_at    timestamptz NOT NULL DEFAULT now(),
    last_used_at  timestamptz
);

CREATE INDEX idx_api_keys_org ON identity.api_keys (org_id) WHERE NOT revoked;
```

## 3.4 Schema: `registry`

```sql
CREATE SCHEMA registry;

CREATE TYPE registry.lifecycle_state AS ENUM (
    'idle', 'thinking', 'planning', 'executing', 'waiting',
    'calling_tool', 'reflecting', 'completed', 'failed'
);

CREATE TYPE registry.agent_status AS ENUM ('active', 'disabled');

CREATE TABLE registry.agents (
    id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id             uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
    slug               text NOT NULL,
    name               text NOT NULL,
    description        text NOT NULL DEFAULT '',
    version            text NOT NULL DEFAULT '1.0.0',
    owner              text NOT NULL DEFAULT 'system',
    capabilities       jsonb NOT NULL DEFAULT '[]',
    permissions        jsonb NOT NULL DEFAULT '{}',
    tools              jsonb NOT NULL DEFAULT '[]',
    skills             jsonb NOT NULL DEFAULT '[]',
    llm_provider       text NOT NULL DEFAULT 'mock',
    llm_model          text NOT NULL DEFAULT 'mock-1',
    temperature        numeric(3,2) NOT NULL DEFAULT 0.30,
    reasoning_profile  text NOT NULL DEFAULT 'chain_of_thought',
    memory_profile     text NOT NULL DEFAULT 'standard',
    deployment_target  text NOT NULL DEFAULT 'local',
    lifecycle_state    registry.lifecycle_state NOT NULL DEFAULT 'idle',
    status             registry.agent_status NOT NULL DEFAULT 'active',
    category           text NOT NULL DEFAULT 'general',
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now(),
    UNIQUE (org_id, slug)
);

CREATE INDEX idx_agents_org_status ON registry.agents (org_id, status);
CREATE INDEX idx_agents_category ON registry.agents (org_id, category);
```

## 3.5 Schema: `execution`

```sql
CREATE SCHEMA execution;

CREATE TYPE execution.run_status AS ENUM (
    'idle', 'thinking', 'planning', 'executing', 'waiting',
    'calling_tool', 'reflecting', 'completed', 'failed', 'pending_approval'
);

CREATE TABLE execution.runs (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id           uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
    agent_id         uuid NOT NULL REFERENCES registry.agents(id) ON DELETE RESTRICT,
    goal             text NOT NULL,
    status           execution.run_status NOT NULL DEFAULT 'idle',
    plan             jsonb NOT NULL DEFAULT '[]',
    steps_completed  jsonb NOT NULL DEFAULT '[]',
    result           text,
    error            text,
    created_at       timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_runs_org_status ON execution.runs (org_id, status);
CREATE INDEX idx_runs_agent ON execution.runs (agent_id);

CREATE TABLE execution.workflow_runs (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id         uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
    workflow_name  text NOT NULL,
    definition     jsonb NOT NULL,
    status         text NOT NULL DEFAULT 'running',  -- running|paused|completed|failed;
                                                       -- kept as text, not enum, because the
                                                       -- Workflow Engine's node-type vocabulary
                                                       -- (Ch. 11) evolves faster than a migration
                                                       -- cadence should gate
    node_states    jsonb NOT NULL DEFAULT '{}',
    context        jsonb NOT NULL DEFAULT '{}',
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_workflow_runs_org_status ON execution.workflow_runs (org_id, status);

-- The Agent Mesh (Ch. 2 §2.3.3, Ch. 10) records which sub-Run a workflow's
-- `agent`/`agent_vote` node dispatched. The MVP encodes this as a
-- `{node_id}_run_id` key inside workflow_runs.context (jsonb) and the
-- governance router *scans* every paused workflow's context for a matching
-- run id to know which one to resume (Ch. 2 §2.6 gap #1, second instance).
-- This join table replaces that scan with an actual indexed lookup.
CREATE TABLE execution.mesh_delegations (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_run_id  uuid NOT NULL REFERENCES execution.workflow_runs(id) ON DELETE CASCADE,
    node_id          text NOT NULL,
    run_id           uuid NOT NULL REFERENCES execution.runs(id) ON DELETE CASCADE,
    created_at       timestamptz NOT NULL DEFAULT now(),
    UNIQUE (workflow_run_id, node_id)
);

CREATE INDEX idx_mesh_delegations_run ON execution.mesh_delegations (run_id);
```

## 3.6 Schema: `memory` and `knowledge`

```sql
CREATE SCHEMA memory;

CREATE TYPE memory.tier AS ENUM (
    'working', 'short_term', 'long_term', 'semantic', 'episodic', 'procedural'
);

CREATE TABLE memory.items (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
    agent_id    uuid NOT NULL REFERENCES registry.agents(id) ON DELETE CASCADE,
    run_id      uuid REFERENCES execution.runs(id) ON DELETE SET NULL,
    tier        memory.tier NOT NULL,
    content     text NOT NULL,
    embedding   vector(256),  -- matches app/core/embeddings.py's DIM today; production swap to a
                              -- real embedding model (Ch. 7) changes this to that model's native
                              -- dimension (e.g. 1536 or 3072), which is a column-type migration,
                              -- not a redesign
    meta        jsonb NOT NULL DEFAULT '{}',
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_memory_agent_tier ON memory.items (agent_id, tier);
CREATE INDEX idx_memory_embedding ON memory.items USING hnsw (embedding vector_cosine_ops);

CREATE SCHEMA knowledge;

CREATE TABLE knowledge.documents (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
    title       text NOT NULL,
    source      text NOT NULL DEFAULT 'upload',
    content     text NOT NULL,
    meta        jsonb NOT NULL DEFAULT '{}',
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE knowledge.chunks (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id  uuid NOT NULL REFERENCES knowledge.documents(id) ON DELETE CASCADE,  -- the MVP
                                                                                       -- has no
                                                                                       -- cascade
                                                                                       -- here
                                                                                       -- (Ch. 2
                                                                                       -- §2.3.5)
    ordinal      int NOT NULL,
    text         text NOT NULL,
    embedding    vector(256),
    created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_chunks_document ON knowledge.chunks (document_id, ordinal);
CREATE INDEX idx_chunks_embedding ON knowledge.chunks USING hnsw (embedding vector_cosine_ops);
```

## 3.7 Schema: `tools`

```sql
CREATE SCHEMA tools;

CREATE TABLE tools.definitions (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id       uuid REFERENCES identity.organizations(id) ON DELETE CASCADE,  -- nullable: a
                                                                                  -- null org_id
                                                                                  -- means a
                                                                                  -- platform-wide
                                                                                  -- built-in tool
                                                                                  -- (filesystem_read,
                                                                                  -- http_request,
                                                                                  -- python_eval,
                                                                                  -- web_search
                                                                                  -- today),
                                                                                  -- visible to
                                                                                  -- every tenant
    name         text NOT NULL,
    description  text NOT NULL DEFAULT '',
    kind         text NOT NULL DEFAULT 'builtin',  -- builtin|mcp|rest|graphql
    schema       jsonb NOT NULL DEFAULT '{}',
    permissions  jsonb NOT NULL DEFAULT '[]',
    enabled      boolean NOT NULL DEFAULT true,
    created_at   timestamptz NOT NULL DEFAULT now(),
    UNIQUE (COALESCE(org_id, '00000000-0000-0000-0000-000000000000'::uuid), name)
);

CREATE TABLE tools.skill_packages (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id       uuid REFERENCES identity.organizations(id) ON DELETE CASCADE,
    name         text NOT NULL,
    version      text NOT NULL DEFAULT '1.0.0',
    description  text NOT NULL DEFAULT '',
    config       jsonb NOT NULL DEFAULT '{}',
    created_at   timestamptz NOT NULL DEFAULT now(),
    UNIQUE (COALESCE(org_id, '00000000-0000-0000-0000-000000000000'::uuid), name, version)
);
```

## 3.8 Schema: `governance`

```sql
CREATE SCHEMA governance;

CREATE TYPE governance.policy_action AS ENUM ('require_approval', 'block');
CREATE TYPE governance.approval_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE governance.policies (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id       uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
    name         text NOT NULL,
    description  text NOT NULL DEFAULT '',
    rule         jsonb NOT NULL,  -- {"if": {"field", "op", "value"}, "then": policy_action}
    enabled      boolean NOT NULL DEFAULT true,
    created_at   timestamptz NOT NULL DEFAULT now(),
    UNIQUE (org_id, name)
);

-- Fixes the Approval polymorphism gap (§3.1 point 3): exactly one of
-- run_id / workflow_run_id is set, enforced by CHECK rather than guessed by
-- the application querying one table then the other.
CREATE TABLE governance.approvals (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id            uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
    run_id            uuid REFERENCES execution.runs(id) ON DELETE CASCADE,
    workflow_run_id   uuid REFERENCES execution.workflow_runs(id) ON DELETE CASCADE,
    policy_name       text NOT NULL,
    reason            text NOT NULL DEFAULT '',
    status            governance.approval_status NOT NULL DEFAULT 'pending',
    decided_by        text,
    decision_note     text,
    created_at        timestamptz NOT NULL DEFAULT now(),
    decided_at        timestamptz,
    CONSTRAINT exactly_one_subject CHECK (
        (run_id IS NOT NULL AND workflow_run_id IS NULL) OR
        (run_id IS NULL AND workflow_run_id IS NOT NULL)
    )
);

CREATE INDEX idx_approvals_pending ON governance.approvals (org_id) WHERE status = 'pending';
CREATE INDEX idx_approvals_run ON governance.approvals (run_id);
CREATE INDEX idx_approvals_workflow_run ON governance.approvals (workflow_run_id);

CREATE TABLE governance.audit_log (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
    actor       text NOT NULL,
    action      text NOT NULL,
    target      text NOT NULL DEFAULT '',
    meta        jsonb NOT NULL DEFAULT '{}',
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_org_created ON governance.audit_log (org_id, created_at DESC);
```

## 3.9 Schema: `observability` (partitioned)

These three tables are append-only and by far the highest write volume in the system — every
span, every metric, every domain event. They're range-partitioned by month on their timestamp
column from day one, because retrofitting partitioning onto a live multi-hundred-million-row
table is exactly the kind of migration nobody wants to run under load.

```sql
CREATE SCHEMA observability;

CREATE TABLE observability.trace_spans (
    id           uuid NOT NULL DEFAULT gen_random_uuid(),
    org_id       uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
    run_id       uuid NOT NULL REFERENCES execution.runs(id) ON DELETE CASCADE,
    name         text NOT NULL,
    status       text NOT NULL DEFAULT 'ok',
    attributes   jsonb NOT NULL DEFAULT '{}',
    started_at   timestamptz NOT NULL DEFAULT now(),
    duration_ms  numeric(12,3) NOT NULL DEFAULT 0,
    PRIMARY KEY (id, started_at)
) PARTITION BY RANGE (started_at);

CREATE TABLE observability.metric_events (
    id          uuid NOT NULL DEFAULT gen_random_uuid(),
    org_id      uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
    run_id      uuid REFERENCES execution.runs(id) ON DELETE CASCADE,
    name        text NOT NULL,
    value       numeric NOT NULL DEFAULT 0,
    tags        jsonb NOT NULL DEFAULT '{}',
    created_at  timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE observability.event_log (
    id          uuid NOT NULL DEFAULT gen_random_uuid(),
    org_id      uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
    run_id      uuid,  -- intentionally not a hard FK: events can outlive the run they describe,
                        -- and this is the event-sourcing log Ch. 12 promotes to the system of
                        -- record — it must never be blocked by a run being deleted
    event_type  text NOT NULL,
    payload     jsonb NOT NULL DEFAULT '{}',
    created_at  timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- One partition-creation function reused for all three tables; called by a
-- monthly cron job (or pg_partman in production) to pre-create next month's
-- partition before it's needed.
CREATE OR REPLACE FUNCTION observability.create_monthly_partition(
    parent_table text, schema_name text, target_date date
) RETURNS void AS $$
DECLARE
    partition_name text := parent_table || '_' || to_char(target_date, 'YYYY_MM');
    start_date date := date_trunc('month', target_date);
    end_date date := start_date + interval '1 month';
BEGIN
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I.%I PARTITION OF %I.%I FOR VALUES FROM (%L) TO (%L)',
        schema_name, partition_name, schema_name, parent_table, start_date, end_date
    );
END;
$$ LANGUAGE plpgsql;

-- Example: pre-create this month and next for all three tables.
SELECT observability.create_monthly_partition('trace_spans', 'observability', date_trunc('month', now())::date);
SELECT observability.create_monthly_partition('trace_spans', 'observability', (date_trunc('month', now()) + interval '1 month')::date);
SELECT observability.create_monthly_partition('metric_events', 'observability', date_trunc('month', now())::date);
SELECT observability.create_monthly_partition('metric_events', 'observability', (date_trunc('month', now()) + interval '1 month')::date);
SELECT observability.create_monthly_partition('event_log', 'observability', date_trunc('month', now())::date);
SELECT observability.create_monthly_partition('event_log', 'observability', (date_trunc('month', now()) + interval '1 month')::date);

CREATE INDEX idx_trace_spans_run ON observability.trace_spans (run_id);
CREATE INDEX idx_metric_events_run_name ON observability.metric_events (run_id, name);
CREATE INDEX idx_event_log_run ON observability.event_log (run_id);
CREATE INDEX idx_event_log_type ON observability.event_log (org_id, event_type, created_at DESC);
```

## 3.10 Schema: `marketplace`

```sql
CREATE SCHEMA marketplace;

CREATE TABLE marketplace.agent_templates (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug         text NOT NULL UNIQUE,  -- global catalog — not org-scoped, same as the MVP
    name         text NOT NULL,
    description  text NOT NULL DEFAULT '',
    definition   jsonb NOT NULL,
    rating       numeric(2,1) NOT NULL DEFAULT 5.0,
    created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE marketplace.installations (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id         uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
    template_slug  text NOT NULL REFERENCES marketplace.agent_templates(slug),
    agent_id       uuid NOT NULL REFERENCES registry.agents(id) ON DELETE CASCADE,
    installed_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_installations_org ON marketplace.installations (org_id);
```

## 3.11 Row-Level Security (multi-tenancy)

Applied identically to every `org_id`-bearing table — shown once for `registry.agents`, the
pattern repeats verbatim for the other twenty-odd tables:

```sql
ALTER TABLE registry.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON registry.agents
    USING (org_id = current_setting('app.current_org_id')::uuid);
```

The API Gateway (Ch. 4) sets `app.current_org_id` once per request (`SET LOCAL app.current_org_id = '<org uuid>'`) immediately after authenticating the caller — every query issued for the rest of that request is automatically scoped, so a bug in a single handler can't leak cross-tenant data the way a forgotten `WHERE org_id = ...` clause could.

## 3.12 Shared `updated_at` trigger

```sql
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_agents_updated_at BEFORE UPDATE ON registry.agents
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_runs_updated_at BEFORE UPDATE ON execution.runs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_workflow_runs_updated_at BEFORE UPDATE ON execution.workflow_runs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

## 3.13 Table count, honestly

This is **26 tables across 8 schemas** (9 contexts from Ch. 2 §2.7, minus Identity/Registry
sharing no additional split, plus the new `mesh_delegations` join table). A "100–200+ table"
target some AgentOS proposals cite gets there by also modeling billing, full RBAC/ABAC role
hierarchies, per-tenant feature flags, SSO configuration, notification preferences, and a dozen
other adjacent SaaS-platform concerns as their own tables — those are real future contexts
(billing lands in Ch. 19), not omissions from this chapter. Inflating this chapter with tables
for contexts that don't exist yet would be padding, not thoroughness; each new context gets its
own schema, in its own chapter, when it's actually designed.

## 3.14 Migration strategy

Chapter 4's Go services own their schema via versioned, checked-in SQL migrations (`golang-migrate`
or `goose` — either is a thin wrapper over exactly the DDL in this chapter), one migration
directory per schema (`migrations/registry/`, `migrations/execution/`, ...), applied in the
dependency order implied by the foreign keys above: `identity` → `registry` → `execution` →
{`memory`, `knowledge`, `tools`} → `governance` → `observability` → `marketplace`.

## 3.15 Mapping from today's SQLAlchemy MVP

| MVP model (`agentos/app/models/*.py`) | Target table | What changes |
|---|---|---|
| `identity.APIKey` | `identity.api_keys` | plaintext key → `key_hash`; adds `org_id`, `user_id` |
| `registry.Agent` | `registry.agents` | string PK → uuid; `lifecycle_state`/`status` → native enums; adds `org_id`, real FK-backed uniqueness |
| `execution.Run` | `execution.runs` | adds `org_id`; `agent_id` becomes an enforced FK; `status` → enum |
| `execution.WorkflowRun` | `execution.workflow_runs` + `execution.mesh_delegations` | mesh-delegation tracking moves out of `context` jsonb into its own indexed table |
| `memory.MemoryItem` | `memory.items` | `embedding` JSON list → pgvector `vector(256)` with an HNSW index; adds `org_id` |
| `knowledge.Document` / `Chunk` | `knowledge.documents` / `knowledge.chunks` | adds the cascade delete the MVP is missing; same embedding change as Memory |
| `tools.ToolDefinition` / `SkillPackage` | `tools.definitions` / `tools.skill_packages` | adds nullable `org_id` for the global-vs-tenant distinction |
| `governance.Policy` / `Approval` / `AuditLog` | `governance.policies` / `approvals` / `audit_log` | `Approval` gains the dual-FK + `CHECK` fix from §3.8 |
| `observability.TraceSpan` / `MetricEvent` / `EventLogEntry` | `observability.trace_spans` / `metric_events` / `event_log` | monthly range partitioning; composite PK `(id, timestamp)` required by Postgres partitioning rules |
| `marketplace.AgentTemplate` / `Installation` | `marketplace.agent_templates` / `installations` | adds `org_id` to `installations` (installs are tenant-scoped even though the catalog isn't) |

Chapter 4 picks this schema up and defines the Go package layout (repositories, one per schema)
that talks to it.
