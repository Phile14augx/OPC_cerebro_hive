import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import Database from "better-sqlite3";

type SqliteDatabase = InstanceType<typeof Database>;
import {
  agentRunSchema,
  agentSchema,
  boolFromInt,
  broadcastReplySchema,
  broadcastSchema,
  claimSchema,
  commsThreadSchema,
  contentItemSchema,
  departmentSchema,
  funnelDealSchema,
  hiveJobSchema,
  knowledgeEdgeSchema,
  knowledgeNodeSchema,
  ledgerEntrySchema,
  type HiveJob,
  type HiveJobStatus,
  parseRow,
  parseRows,
  pulseSnapshotSchema,
  skillSchema,
  socialAccountSchema,
  taskSchema,
  workflowSchema,
  type Agent,
  type AgentRun,
  type Broadcast,
  type BroadcastReply,
  type Claim,
  type CommsThread,
  type ContentItem,
  type Department,
  type FunnelDeal,
  type KnowledgeEdge,
  type KnowledgeNode,
  type LedgerEntry,
  type PulseSnapshot,
  type Skill,
  type SocialAccount,
  type Task,
  type Workflow,
} from "./schemas";

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  summary TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  department_id TEXT NOT NULL,
  parent_id TEXT,
  tier TEXT NOT NULL,
  status TEXT NOT NULL,
  summary TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS agent_runs (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT NOT NULL,
  ok INTEGER NOT NULL,
  summary TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS broadcasts (
  id TEXT PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS broadcast_replies (
  id TEXT PRIMARY KEY,
  broadcast_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  ok INTEGER NOT NULL,
  reply TEXT NOT NULL,
  finished_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS comms (
  id TEXT PRIMARY KEY,
  lane TEXT NOT NULL,
  from_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  preview TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS funnel_deals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  stage TEXT NOT NULL,
  value_usd INTEGER NOT NULL,
  next_step TEXT NOT NULL,
  owner_agent_id TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS content_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  channel TEXT NOT NULL,
  status TEXT NOT NULL,
  scheduled_for TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS social_accounts (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  handle TEXT NOT NULL,
  cadence TEXT NOT NULL,
  followers_seed INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS ledger (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  amount_usd REAL NOT NULL,
  direction TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS knowledge_nodes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  kind TEXT NOT NULL,
  path TEXT,
  summary TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS knowledge_edges (
  id TEXT PRIMARY KEY,
  from_id TEXT NOT NULL,
  to_id TEXT NOT NULL,
  label TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY,
  source_id TEXT,
  text TEXT NOT NULL,
  status TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  agent_id TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  steps_json TEXT NOT NULL,
  last_run_at TEXT,
  last_summary TEXT
);
CREATE TABLE IF NOT EXISTS pulse_history (
  id TEXT PRIMARY KEY,
  captured_at TEXT NOT NULL,
  agents_active INTEGER NOT NULL,
  open_comms INTEGER NOT NULL,
  open_tasks INTEGER NOT NULL,
  runway_months REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS hive_jobs (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  trace_id TEXT,
  error_code TEXT,
  started_at TEXT,
  finished_at TEXT,
  prisma_id TEXT,
  metadata_json TEXT NOT NULL
);
`;

function mapAgent(row: Record<string, unknown>): Agent {
  return parseRow(agentSchema, {
    id: row.id,
    name: row.name,
    role: row.role,
    departmentId: row.department_id,
    parentId: row.parent_id,
    tier: row.tier,
    status: row.status,
    summary: row.summary,
  });
}

function mapDepartment(row: Record<string, unknown>): Department {
  return parseRow(departmentSchema, {
    id: row.id,
    name: row.name,
    slug: row.slug,
    summary: row.summary,
    order: row.sort_order,
  });
}

function mapRun(row: Record<string, unknown>): AgentRun {
  return parseRow(agentRunSchema, {
    id: row.id,
    agentId: row.agent_id,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    ok: boolFromInt.parse(row.ok),
    summary: row.summary,
  });
}

export type NexarchDb = ReturnType<typeof createRepos>;

function createRepos(sqlite: SqliteDatabase) {
  const departments = {
    list(): Department[] {
      return sqlite
        .prepare("SELECT * FROM departments ORDER BY sort_order")
        .all()
        .map((row) => mapDepartment(row as Record<string, unknown>));
    },
    upsert(row: Department) {
      sqlite
        .prepare(
          `INSERT OR REPLACE INTO departments (id, name, slug, summary, sort_order)
           VALUES (@id, @name, @slug, @summary, @order)`,
        )
        .run(row);
    },
  };

  const agents = {
    list(): Agent[] {
      return sqlite.prepare("SELECT * FROM agents").all().map((row) => mapAgent(row as Record<string, unknown>));
    },
    get(id: string): Agent | null {
      const row = sqlite.prepare("SELECT * FROM agents WHERE id = ?").get(id) as Record<string, unknown> | undefined;
      return row ? mapAgent(row) : null;
    },
    ids(): string[] {
      return sqlite.prepare("SELECT id FROM agents").all().map((r) => (r as { id: string }).id);
    },
    upsert(row: Agent) {
      sqlite
        .prepare(
          `INSERT OR REPLACE INTO agents
           (id, name, role, department_id, parent_id, tier, status, summary)
           VALUES (@id, @name, @role, @departmentId, @parentId, @tier, @status, @summary)`,
        )
        .run(row);
    },
  };

  const agentRuns = {
    list(agentId?: string): AgentRun[] {
      const rows = agentId
        ? sqlite.prepare("SELECT * FROM agent_runs WHERE agent_id = ? ORDER BY started_at DESC").all(agentId)
        : sqlite.prepare("SELECT * FROM agent_runs ORDER BY started_at DESC LIMIT 50").all();
      return rows.map((row) => mapRun(row as Record<string, unknown>));
    },
    last(agentId: string): AgentRun | null {
      const row = sqlite
        .prepare("SELECT * FROM agent_runs WHERE agent_id = ? ORDER BY started_at DESC LIMIT 1")
        .get(agentId) as Record<string, unknown> | undefined;
      return row ? mapRun(row) : null;
    },
    insert(run: AgentRun) {
      parseRow(agentRunSchema, run);
      sqlite
        .prepare(
          `INSERT INTO agent_runs (id, agent_id, started_at, finished_at, ok, summary)
           VALUES (@id, @agentId, @startedAt, @finishedAt, @ok, @summary)`,
        )
        .run({ ...run, ok: run.ok ? 1 : 0 });
    },
  };

  const broadcasts = {
    list(): Broadcast[] {
      return parseRows(
        broadcastSchema,
        sqlite.prepare("SELECT id, message, created_at AS createdAt FROM broadcasts ORDER BY created_at DESC").all(),
      );
    },
    insert(row: Broadcast) {
      parseRow(broadcastSchema, row);
      sqlite.prepare("INSERT INTO broadcasts (id, message, created_at) VALUES (@id, @message, @createdAt)").run(row);
    },
    insertReply(row: BroadcastReply) {
      parseRow(broadcastReplySchema, row);
      sqlite
        .prepare(
          `INSERT INTO broadcast_replies (id, broadcast_id, agent_id, ok, reply, finished_at)
           VALUES (@id, @broadcastId, @agentId, @ok, @reply, @finishedAt)`,
        )
        .run({ ...row, ok: row.ok ? 1 : 0 });
    },
    replies(broadcastId: string): BroadcastReply[] {
      return sqlite
        .prepare("SELECT * FROM broadcast_replies WHERE broadcast_id = ?")
        .all(broadcastId)
        .map((row) => {
          const r = row as Record<string, unknown>;
          return parseRow(broadcastReplySchema, {
            id: r.id,
            broadcastId: r.broadcast_id,
            agentId: r.agent_id,
            ok: boolFromInt.parse(r.ok),
            reply: r.reply,
            finishedAt: r.finished_at,
          });
        });
    },
  };

  const comms = {
    list(): CommsThread[] {
      return sqlite.prepare("SELECT * FROM comms ORDER BY created_at DESC").all().map((row) => {
        const r = row as Record<string, unknown>;
        return parseRow(commsThreadSchema, {
          id: r.id,
          lane: r.lane,
          fromName: r.from_name,
          subject: r.subject,
          preview: r.preview,
          status: r.status,
          createdAt: r.created_at,
        });
      });
    },
    upsert(row: CommsThread) {
      sqlite
        .prepare(
          `INSERT OR REPLACE INTO comms (id, lane, from_name, subject, preview, status, created_at)
           VALUES (@id, @lane, @fromName, @subject, @preview, @status, @createdAt)`,
        )
        .run(row);
    },
    markReplied(id: string) {
      sqlite.prepare("UPDATE comms SET status = 'replied' WHERE id = ?").run(id);
    },
  };

  const funnel = {
    list(): FunnelDeal[] {
      return sqlite.prepare("SELECT * FROM funnel_deals").all().map((row) => {
        const r = row as Record<string, unknown>;
        return parseRow(funnelDealSchema, {
          id: r.id,
          name: r.name,
          stage: r.stage,
          valueUsd: r.value_usd,
          nextStep: r.next_step,
          ownerAgentId: r.owner_agent_id,
        });
      });
    },
    upsert(row: FunnelDeal) {
      sqlite
        .prepare(
          `INSERT OR REPLACE INTO funnel_deals (id, name, stage, value_usd, next_step, owner_agent_id)
           VALUES (@id, @name, @stage, @valueUsd, @nextStep, @ownerAgentId)`,
        )
        .run(row);
    },
  };

  const content = {
    list(): ContentItem[] {
      return sqlite.prepare("SELECT * FROM content_items ORDER BY scheduled_for").all().map((row) => {
        const r = row as Record<string, unknown>;
        return parseRow(contentItemSchema, {
          id: r.id,
          title: r.title,
          channel: r.channel,
          status: r.status,
          scheduledFor: r.scheduled_for,
        });
      });
    },
    upsert(row: ContentItem) {
      sqlite
        .prepare(
          `INSERT OR REPLACE INTO content_items (id, title, channel, status, scheduled_for)
           VALUES (@id, @title, @channel, @status, @scheduledFor)`,
        )
        .run(row);
    },
  };

  const social = {
    list(): SocialAccount[] {
      return sqlite.prepare("SELECT * FROM social_accounts").all().map((row) => {
        const r = row as Record<string, unknown>;
        return parseRow(socialAccountSchema, {
          id: r.id,
          platform: r.platform,
          handle: r.handle,
          cadence: r.cadence,
          followersSeed: r.followers_seed,
        });
      });
    },
    upsert(row: SocialAccount) {
      sqlite
        .prepare(
          `INSERT OR REPLACE INTO social_accounts (id, platform, handle, cadence, followers_seed)
           VALUES (@id, @platform, @handle, @cadence, @followersSeed)`,
        )
        .run(row);
    },
  };

  const ledger = {
    list(): LedgerEntry[] {
      return sqlite.prepare("SELECT * FROM ledger ORDER BY date DESC").all().map((row) => {
        const r = row as Record<string, unknown>;
        return parseRow(ledgerEntrySchema, {
          id: r.id,
          date: r.date,
          description: r.description,
          category: r.category,
          amountUsd: r.amount_usd,
          direction: r.direction,
        });
      });
    },
    upsert(row: LedgerEntry) {
      sqlite
        .prepare(
          `INSERT OR REPLACE INTO ledger (id, date, description, category, amount_usd, direction)
           VALUES (@id, @date, @description, @category, @amountUsd, @direction)`,
        )
        .run(row);
    },
    insert(row: Omit<LedgerEntry, "id"> & { id?: string }) {
      const entry: LedgerEntry = { id: row.id ?? randomUUID(), ...row };
      this.upsert(entry);
      return entry;
    },
  };

  const knowledge = {
    nodes(): KnowledgeNode[] {
      return sqlite.prepare("SELECT * FROM knowledge_nodes").all().map((row) => {
        const r = row as Record<string, unknown>;
        return parseRow(knowledgeNodeSchema, {
          id: r.id,
          title: r.title,
          kind: r.kind,
          path: r.path,
          summary: r.summary,
        });
      });
    },
    edges(): KnowledgeEdge[] {
      return sqlite.prepare("SELECT * FROM knowledge_edges").all().map((row) => {
        const r = row as Record<string, unknown>;
        return parseRow(knowledgeEdgeSchema, {
          id: r.id,
          fromId: r.from_id,
          toId: r.to_id,
          label: r.label,
        });
      });
    },
    upsertNode(row: KnowledgeNode) {
      sqlite
        .prepare(
          `INSERT OR REPLACE INTO knowledge_nodes (id, title, kind, path, summary)
           VALUES (@id, @title, @kind, @path, @summary)`,
        )
        .run(row);
    },
    upsertEdge(row: KnowledgeEdge) {
      sqlite
        .prepare(
          `INSERT OR REPLACE INTO knowledge_edges (id, from_id, to_id, label)
           VALUES (@id, @fromId, @toId, @label)`,
        )
        .run(row);
    },
  };

  const claims = {
    list(): Claim[] {
      return sqlite.prepare("SELECT * FROM claims ORDER BY created_at DESC").all().map((row) => {
        const r = row as Record<string, unknown>;
        return parseRow(claimSchema, {
          id: r.id,
          sourceId: r.source_id,
          text: r.text,
          status: r.status,
          createdBy: r.created_by,
          createdAt: r.created_at,
        });
      });
    },
    get(id: string): Claim | null {
      const r = sqlite.prepare("SELECT * FROM claims WHERE id = ?").get(id) as Record<string, unknown> | undefined;
      if (!r) return null;
      return parseRow(claimSchema, {
        id: r.id,
        sourceId: r.source_id,
        text: r.text,
        status: r.status,
        createdBy: r.created_by,
        createdAt: r.created_at,
      });
    },
    upsert(row: Claim) {
      sqlite
        .prepare(
          `INSERT OR REPLACE INTO claims (id, source_id, text, status, created_by, created_at)
           VALUES (@id, @sourceId, @text, @status, @createdBy, @createdAt)`,
        )
        .run(row);
    },
    promote(id: string): Claim | null {
      const claim = this.get(id);
      if (!claim || claim.status === "rejected") return null;
      const next: Claim = { ...claim, status: "fact" };
      this.upsert(next);
      knowledge.upsertNode({
        id: `fact-${claim.id}`,
        title: claim.text.slice(0, 80),
        kind: "fact",
        path: null,
        summary: `Promoted by operator from claim ${claim.id}`,
      });
      return next;
    },
  };

  const tasks = {
    list(): Task[] {
      return sqlite.prepare("SELECT * FROM tasks ORDER BY created_at DESC").all().map((row) => {
        const r = row as Record<string, unknown>;
        return parseRow(taskSchema, {
          id: r.id,
          title: r.title,
          status: r.status,
          agentId: r.agent_id,
          createdAt: r.created_at,
        });
      });
    },
    upsert(row: Task) {
      sqlite
        .prepare(
          `INSERT OR REPLACE INTO tasks (id, title, status, agent_id, created_at)
           VALUES (@id, @title, @status, @agentId, @createdAt)`,
        )
        .run(row);
    },
  };

  const skills = {
    list(): Skill[] {
      return parseRows(
        skillSchema,
        sqlite.prepare("SELECT id, slug, name, description, agent_id AS agentId FROM skills").all(),
      );
    },
    getBySlug(slug: string): Skill | null {
      const row = sqlite.prepare("SELECT id, slug, name, description, agent_id AS agentId FROM skills WHERE slug = ?").get(slug);
      return row ? parseRow(skillSchema, row) : null;
    },
    upsert(row: Skill) {
      sqlite
        .prepare(
          `INSERT OR REPLACE INTO skills (id, slug, name, description, agent_id)
           VALUES (@id, @slug, @name, @description, @agentId)`,
        )
        .run(row);
    },
  };

  const workflows = {
    list(): Workflow[] {
      return sqlite.prepare("SELECT * FROM workflows").all().map((row) => {
        const r = row as Record<string, unknown>;
        return parseRow(workflowSchema, {
          id: r.id,
          name: r.name,
          stepsJson: r.steps_json,
          lastRunAt: r.last_run_at,
          lastSummary: r.last_summary,
        });
      });
    },
    get(id: string): Workflow | null {
      const r = sqlite.prepare("SELECT * FROM workflows WHERE id = ?").get(id) as Record<string, unknown> | undefined;
      if (!r) return null;
      return parseRow(workflowSchema, {
        id: r.id,
        name: r.name,
        stepsJson: r.steps_json,
        lastRunAt: r.last_run_at,
        lastSummary: r.last_summary,
      });
    },
    upsert(row: Workflow) {
      sqlite
        .prepare(
          `INSERT OR REPLACE INTO workflows (id, name, steps_json, last_run_at, last_summary)
           VALUES (@id, @name, @stepsJson, @lastRunAt, @lastSummary)`,
        )
        .run(row);
    },
    recordRun(id: string, summary: string) {
      sqlite
        .prepare("UPDATE workflows SET last_run_at = ?, last_summary = ? WHERE id = ?")
        .run(new Date().toISOString(), summary, id);
    },
  };

  const hiveJobs = {
    list(): HiveJob[] {
      return sqlite.prepare("SELECT * FROM hive_jobs ORDER BY started_at DESC, id DESC").all().map((row) => {
        const r = row as Record<string, unknown>;
        return parseRow(hiveJobSchema, {
          id: r.id,
          type: r.type,
          status: r.status,
          traceId: r.trace_id,
          errorCode: r.error_code,
          startedAt: r.started_at,
          finishedAt: r.finished_at,
          prismaId: r.prisma_id,
          metadataJson: r.metadata_json,
        });
      });
    },
    get(id: string): HiveJob | null {
      const r = sqlite.prepare("SELECT * FROM hive_jobs WHERE id = ?").get(id) as Record<string, unknown> | undefined;
      if (!r) return null;
      return parseRow(hiveJobSchema, {
        id: r.id,
        type: r.type,
        status: r.status,
        traceId: r.trace_id,
        errorCode: r.error_code,
        startedAt: r.started_at,
        finishedAt: r.finished_at,
        prismaId: r.prisma_id,
        metadataJson: r.metadata_json,
      });
    },
    insert(row: HiveJob) {
      parseRow(hiveJobSchema, row);
      sqlite
        .prepare(
          `INSERT INTO hive_jobs
           (id, type, status, trace_id, error_code, started_at, finished_at, prisma_id, metadata_json)
           VALUES (@id, @type, @status, @traceId, @errorCode, @startedAt, @finishedAt, @prismaId, @metadataJson)`,
        )
        .run(row);
    },
    update(row: HiveJob) {
      parseRow(hiveJobSchema, row);
      sqlite
        .prepare(
          `UPDATE hive_jobs SET
             type = @type, status = @status, trace_id = @traceId, error_code = @errorCode,
             started_at = @startedAt, finished_at = @finishedAt, prisma_id = @prismaId, metadata_json = @metadataJson
           WHERE id = @id`,
        )
        .run(row);
    },
    recordWorkerTerminal(id: string, status: Extract<HiveJobStatus, "SUCCEEDED" | "FAILED" | "CANCELLED" | "TIMED_OUT">, errorCode?: string) {
      const current = this.get(id);
      if (!current) return null;
      const next: HiveJob = {
        ...current,
        status,
        errorCode: errorCode ?? current.errorCode,
        finishedAt: new Date().toISOString(),
      };
      this.update(next);
      return next;
    },
  };

  const pulse = {
    list(): PulseSnapshot[] {
      return sqlite.prepare("SELECT * FROM pulse_history ORDER BY captured_at").all().map((row) => {
        const r = row as Record<string, unknown>;
        return parseRow(pulseSnapshotSchema, {
          id: r.id,
          capturedAt: r.captured_at,
          agentsActive: r.agents_active,
          openComms: r.open_comms,
          openTasks: r.open_tasks,
          runwayMonths: r.runway_months,
        });
      });
    },
    upsert(row: PulseSnapshot) {
      sqlite
        .prepare(
          `INSERT OR REPLACE INTO pulse_history
           (id, captured_at, agents_active, open_comms, open_tasks, runway_months)
           VALUES (@id, @capturedAt, @agentsActive, @openComms, @openTasks, @runwayMonths)`,
        )
        .run(row);
    },
  };

  const meta = {
    get(key: string): string | null {
      const row = sqlite.prepare("SELECT value FROM meta WHERE key = ?").get(key) as { value: string } | undefined;
      return row?.value ?? null;
    },
    set(key: string, value: string) {
      sqlite.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)").run(key, value);
    },
  };

  return {
    departments,
    agents,
    agentRuns,
    broadcasts,
    comms,
    funnel,
    content,
    social,
    ledger,
    knowledge,
    claims,
    tasks,
    skills,
    workflows,
    hiveJobs,
    pulse,
    meta,
    close() {
      sqlite.close();
    },
    exec(sql: string) {
      sqlite.exec(sql);
    },
  };
}

export function dbFilePath(): string {
  if (process.env.NEXARCH_OS_DB && process.env.NEXARCH_OS_DB.length > 0) {
    return process.env.NEXARCH_OS_DB;
  }
  return path.join(process.cwd(), "data", "nexarch-os.db");
}

export function openDb(file = dbFilePath()): NexarchDb {
  if (file !== ":memory:") {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }
  const sqlite = new Database(file);
  if (file !== ":memory:") {
    sqlite.pragma("journal_mode = WAL");
  }
  sqlite.exec(SCHEMA_SQL);
  return createRepos(sqlite);
}
