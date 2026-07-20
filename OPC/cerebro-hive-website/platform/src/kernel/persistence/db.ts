import { Kysely, PostgresDialect, sql } from "kysely";
import pg from "pg";

/** Kysely table typings for the platform schema (see migrations/*.sql). */
export interface Database {
  organizations: { id: string; name: string; slug: string; created_at: Date };
  users: { id: string; organization_id: string; email: string; name: string; roles: string; attributes: string; created_at: Date };
  workspaces: { id: string; organization_id: string; name: string; kind: string; created_at: Date };
  api_keys: { id: string; organization_id: string; user_id: string; name: string; key_hash: string; roles: string; last_used_at: Date | null; created_at: Date; revoked_at: Date | null };
  audit_log: { id: string; organization_id: string; actor: string; action: string; resource: string; resource_id: string | null; details: string; trace_id: string | null; created_at: Date };
  agents: { id: string; organization_id: string; name: string; kind: string; capabilities: string; endpoint: string | null; status: string; last_heartbeat_at: Date | null; metadata: string; created_at: Date };
  executions: { id: string; organization_id: string; workspace_id: string | null; agent_id: string | null; goal: string; status: string; input: string; result: string | null; error: string | null; plan: string | null; checkpoints: string; attempts: number; max_attempts: number; queued_at: Date; started_at: Date | null; finished_at: Date | null; trace_id: string | null };
  execution_steps: { id: string; execution_id: string; organization_id: string; seq: number; name: string; status: string; tool: string | null; input: string | null; output: string | null; started_at: Date; finished_at: Date | null };
  artifacts: { id: string; organization_id: string; execution_id: string | null; name: string; content_type: string; content: string; created_at: Date };
  memory_records: { id: string; organization_id: string; workspace_id: string | null; tier: string; scope_key: string; content: string; summary: string | null; embedding: string | null; importance: number; version: number; expires_at: Date | null; created_at: Date; updated_at: Date };
  documents: { id: string; organization_id: string; workspace_id: string | null; title: string; source: string; content_type: string; status: string; raw_size: number; metadata: string; created_at: Date };
  chunks: { id: string; document_id: string; organization_id: string; seq: number; text: string; embedding: string | null; token_estimate: number; created_at: Date };
  entities: { id: string; organization_id: string; name: string; kind: string; properties: string; created_at: Date };
  relationships: { id: string; organization_id: string; from_entity_id: string; to_entity_id: string; kind: string; properties: string; document_id: string | null; created_at: Date };
  workflows: { id: string; organization_id: string; name: string; version: number; definition: string; status: string; created_at: Date; updated_at: Date };
  workflow_runs: { id: string; workflow_id: string; organization_id: string; status: string; trigger: string; input: string; state: string; error: string | null; started_at: Date; finished_at: Date | null };
  approvals: { id: string; organization_id: string; subject_kind: string; subject_id: string; requested_by: string; approver_role: string; status: string; reason: string | null; decided_by: string | null; decided_at: Date | null; created_at: Date };
  guard_events: { id: string; organization_id: string; direction: string; risk_score: number; blocked: number; findings: string; content_hash: string; created_at: Date };
  eval_runs: { id: string; organization_id: string; suite: string; target: string; total: number; passed: number; failed: number; score: number; report: string; baseline_score: number | null; regression: number; created_at: Date };
  prompts: { id: string; organization_id: string; name: string; version: number; template: string; variables: string; created_at: Date };
  ai_calls: { id: string; organization_id: string; provider: string; model: string; operation: string; prompt_tokens: number; completion_tokens: number; cost_usd: number; latency_ms: number; cached: number; ok: number; trace_id: string | null; created_at: Date };
  connectors: { id: string; organization_id: string; kind: string; name: string; config: string; status: string; created_at: Date };
  world_entities: { id: string; organization_id: string; kind: string; ref_id: string; name: string; state: string; embedding: string | null; updated_at: Date };
  insights: { id: string; organization_id: string; kind: string; title: string; body: string; confidence: number; source: string; created_at: Date };
  simulations: { id: string; organization_id: string; kind: string; scenario: string; result: string; created_at: Date };
  notifications: { id: string; organization_id: string; user_id: string | null; severity: string; title: string; body: string; read: number; created_at: Date };
  feature_flags: { key: string; organization_id: string; enabled: number; payload: string | null; updated_at: Date };
  schema_migrations: { name: string; applied_at: Date };
}

export type Db = Kysely<Database>;

export function createDb(databaseUrl: string): Db {
  const pool = new pg.Pool({ connectionString: databaseUrl, max: 10 });
  return new Kysely<Database>({ dialect: new PostgresDialect({ pool }) });
}

export { sql };
