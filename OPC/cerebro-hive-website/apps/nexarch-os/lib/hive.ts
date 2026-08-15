import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { NexarchDb } from "./db";
import type { Claim, ConnectorStatus, HiveJob } from "./schemas";

export type PgResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: Exclude<ConnectorStatus, "connected">; detail: string };

type QueryFn = (text: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;

export function databaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL?.trim();
  return url && url.length > 0 ? url : undefined;
}

export function workspaceId(): string | undefined {
  const id = process.env.NEXARCH_WORKSPACE_ID?.trim();
  return id && id.length > 0 ? id : undefined;
}

export function prismaAgentId(): string | undefined {
  const id = process.env.NEXARCH_PRISMA_AGENT_ID?.trim();
  return id && id.length > 0 ? id : undefined;
}

export function dispatchDryRunEnabled(): boolean {
  return process.env.NEXARCH_DISPATCH_DRY_RUN === "1";
}

export function dispatchScriptPath(): string {
  if (process.env.NEXARCH_DISPATCH_SCRIPT?.trim()) return process.env.NEXARCH_DISPATCH_SCRIPT.trim();
  return path.resolve(process.cwd(), "..", "..", "scripts", "agent-dispatch.mjs");
}

export function hivePlaneStatus(): {
  postgres: ConnectorStatus;
  workspace: ConnectorStatus;
  dispatchScript: ConnectorStatus;
  dispatchOptIn: boolean;
  pgvector: ConnectorStatus;
  openaiEmbed: ConnectorStatus;
} {
  const script = fs.existsSync(dispatchScriptPath());
  return {
    postgres: databaseUrl() ? "connected" : "not_configured",
    workspace: workspaceId() ? "connected" : "not_configured",
    dispatchScript: script ? "connected" : "not_configured",
    dispatchOptIn: dispatchDryRunEnabled(),
    pgvector: databaseUrl() ? "connected" : "not_configured",
    openaiEmbed: process.env.OPENAI_API_KEY?.trim() ? "connected" : "not_configured",
  };
}

export async function probePostgres(): Promise<{ status: ConnectorStatus; detail: string }> {
  const result = await withPg(async (query) => {
    await query("SELECT 1 AS ok");
    return true;
  });
  if (result.ok) return { status: "connected", detail: "Postgres accepted SELECT 1." };
  return { status: result.status, detail: result.detail };
}

export async function withPg<T>(fn: (query: QueryFn) => Promise<T>): Promise<PgResult<T>> {
  const url = databaseUrl();
  if (!url) return { ok: false, status: "not_configured", detail: "DATABASE_URL missing." };
  try {
    const pg = await import("pg");
    const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 2000 });
    try {
      await client.connect();
      const data = await fn(async (text, values) => {
        const result = await client.query(text, values);
        return { rows: result.rows as Record<string, unknown>[] };
      });
      return { ok: true, data };
    } finally {
      await client.end().catch(() => undefined);
    }
  } catch (err) {
    return { ok: false, status: "error", detail: err instanceof Error ? err.message : String(err) };
  }
}

function jobMetadata(extra: Record<string, unknown>): string {
  return JSON.stringify(extra);
}

export function enqueueLocalJob(
  db: NexarchDb,
  input: { type: string; metadata?: Record<string, unknown>; traceId?: string },
): HiveJob {
  const job: HiveJob = {
    id: randomUUID(),
    type: input.type,
    status: "QUEUED",
    traceId: input.traceId ?? randomUUID(),
    errorCode: null,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    prismaId: null,
    metadataJson: jobMetadata(input.metadata ?? {}),
  };
  db.hiveJobs.insert(job);
  return job;
}

export async function mirrorPlatformJob(job: HiveJob): Promise<PgResult<{ prismaId: string }>> {
  const ws = workspaceId();
  if (!databaseUrl()) return { ok: false, status: "not_configured", detail: "DATABASE_URL missing." };
  if (!ws) return { ok: false, status: "not_configured", detail: "NEXARCH_WORKSPACE_ID missing." };
  return withPg(async (query) => {
    await query(
      `INSERT INTO "PlatformJob"
        ("id", "workspaceId", "type", "status", "traceId", "metadata", "createdAt", "updatedAt")
       VALUES ($1::uuid, $2::uuid, $3, 'QUEUED', $4, $5::jsonb, NOW(), NOW())`,
      [job.id, ws, job.type, job.traceId, job.metadataJson],
    );
    return { prismaId: job.id };
  });
}

export async function enqueuePlatformJob(
  db: NexarchDb,
  input: { type: string; metadata?: Record<string, unknown> },
): Promise<{ job: HiveJob; prisma: PgResult<{ prismaId: string }> }> {
  const job = enqueueLocalJob(db, input);
  const prisma = await mirrorPlatformJob(job);
  if (prisma.ok) {
    const next = { ...job, prismaId: prisma.data.prismaId };
    db.hiveJobs.update(next);
    return { job: next, prisma };
  }
  const next: HiveJob = {
    ...job,
    errorCode: prisma.status === "not_configured" ? "PRISMA_NOT_CONFIGURED" : "PRISMA_ERROR",
    metadataJson: jobMetadata({
      ...(JSON.parse(job.metadataJson) as Record<string, unknown>),
      prismaDetail: prisma.detail,
    }),
  };
  db.hiveJobs.update(next);
  return { job: next, prisma };
}

export async function runDispatchDryRun(): Promise<{
  ok: boolean;
  status: ConnectorStatus;
  summary: string;
  exitCode: number | null;
}> {
  if (!dispatchDryRunEnabled()) {
    return {
      ok: false,
      status: "not_configured",
      summary: "NEXARCH_DISPATCH_DRY_RUN is not 1. Dispatcher will not spawn agent-dispatch.mjs.",
      exitCode: null,
    };
  }
  const script = dispatchScriptPath();
  if (!fs.existsSync(script)) {
    return {
      ok: false,
      status: "not_configured",
      summary: `agent-dispatch.mjs not found at ${script}.`,
      exitCode: null,
    };
  }
  const cwd = path.dirname(path.dirname(script));
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [script, "--dry-run"], {
      cwd,
      env: process.env,
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      resolve({
        ok: false,
        status: "error",
        summary: "agent-dispatch --dry-run timed out. Job stays QUEUED, not SUCCEEDED.",
        exitCode: null,
      });
    }, 20_000);
    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({
        ok: false,
        status: "error",
        summary: `Failed to spawn agent-dispatch: ${err.message}`,
        exitCode: null,
      });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      const preview = `${stdout}\n${stderr}`.replace(/\s+/g, " ").trim().slice(0, 400);
      if (code === 0) {
        resolve({
          ok: true,
          status: "connected",
          summary: `Dry-run exited 0. Plan preview: ${preview || "(empty)"}. Worker has not recorded SUCCEEDED.`,
          exitCode: code,
        });
        return;
      }
      resolve({
        ok: false,
        status: "error",
        summary: `Dry-run exited ${code}. ${preview}. Not SUCCEEDED.`,
        exitCode: code,
      });
    });
  });
}

export async function embedQuery(text: string): Promise<PgResult<number[]>> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return { ok: false, status: "not_configured", detail: "OPENAI_API_KEY missing. Cannot embed for pgvector." };
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return { ok: false, status: "error", detail: `OpenAI embeddings returned ${res.status}.` };
    }
    const json = (await res.json()) as { data?: { embedding?: number[] }[] };
    const vector = json.data?.[0]?.embedding;
    if (!vector?.length) return { ok: false, status: "error", detail: "OpenAI returned no embedding." };
    return { ok: true, data: vector };
  } catch (err) {
    return { ok: false, status: "error", detail: err instanceof Error ? err.message : String(err) };
  }
}

export type VectorHit = { path: string; snippet: string; score: number };

export async function searchPgvector(query: string): Promise<PgResult<VectorHit[]>> {
  if (!databaseUrl()) return { ok: false, status: "not_configured", detail: "DATABASE_URL missing. pgvector not queried." };
  const embedded = await embedQuery(query);
  if (!embedded.ok) return embedded;
  const literal = `[${embedded.data.join(",")}]`;
  return withPg(async (q) => {
    const result = await q(
      `SELECT d.title AS title, c.content AS content,
              (1 - (e.vector <=> $1::vector)) AS score
         FROM "Embedding" e
         JOIN "Chunk" c ON c.id = e."chunkId"
         JOIN "DocumentVersion" dv ON dv.id = c."documentVersionId"
         JOIN "Document" d ON d.id = dv."documentId"
        WHERE e.vector IS NOT NULL
        ORDER BY e.vector <=> $1::vector
        LIMIT 8`,
      [literal],
    );
    return result.rows.map((row) => ({
      path: String(row.title ?? "document"),
      snippet: String(row.content ?? "").replace(/\s+/g, " ").trim().slice(0, 140),
      score: Number(row.score ?? 0),
    }));
  });
}

export async function promoteFactToPrisma(claim: Claim): Promise<PgResult<{ memoryId: string }>> {
  const agentId = prismaAgentId();
  if (!databaseUrl()) return { ok: false, status: "not_configured", detail: "DATABASE_URL missing." };
  if (!agentId) {
    return { ok: false, status: "not_configured", detail: "NEXARCH_PRISMA_AGENT_ID missing. Fact stays local." };
  }
  const memoryId = randomUUID();
  return withPg(async (query) => {
    await query(`INSERT INTO "Memory" ("id", "agentId", "context") VALUES ($1::uuid, $2::uuid, $3::jsonb)`, [
      memoryId,
      agentId,
      JSON.stringify({
        source: "nexarch-os",
        claimId: claim.id,
        text: claim.text,
        status: "fact",
        createdBy: claim.createdBy,
      }),
    ]);
    await query(
      `INSERT INTO "MemorySnapshot" ("id", "memoryId", "payload", "createdAt")
       VALUES ($1::uuid, $2::uuid, $3::jsonb, NOW())`,
      [randomUUID(), memoryId, JSON.stringify({ text: claim.text, promotedAt: new Date().toISOString() })],
    );
    return { memoryId };
  });
}

export function summarizeJobs(jobs: HiveJob[]): string {
  const counts = new Map<string, number>();
  for (const job of jobs) counts.set(job.status, (counts.get(job.status) ?? 0) + 1);
  const succeeded = counts.get("SUCCEEDED") ?? 0;
  const parts = [...counts.entries()].map(([k, v]) => `${k}:${v}`);
  return `${jobs.length} hive jobs (${parts.join(", ") || "none"}). SUCCEEDED=${succeeded} (only if a worker recorded it).`;
}
