import { randomUUID } from "node:crypto";
import type { NexarchDb } from "../db";
import type { AgentRun, BroadcastReply } from "../schemas";

export type AgentRunResult = { ok: boolean; summary: string; data?: unknown };

export type RuntimeAgent = {
  id: string;
  name: string;
  description: string;
  departmentId: string;
  run(): Promise<AgentRunResult>;
  respond?(message: string): Promise<AgentRunResult>;
};

export function createRuntime(db: NexarchDb, agents: RuntimeAgent[]) {
  const registry = new Map(agents.map((a) => [a.id, a]));

  return {
    list(): RuntimeAgent[] {
      return [...registry.values()];
    },
    get(id: string): RuntimeAgent | undefined {
      return registry.get(id);
    },
    async run(id: string): Promise<AgentRun> {
      const agent = registry.get(id);
      if (!agent) throw new Error(`unknown agent: ${id}`);
      const startedAt = new Date().toISOString();
      let result: AgentRunResult;
      try {
        result = await agent.run();
      } catch (err) {
        result = { ok: false, summary: err instanceof Error ? err.message : String(err) };
      }
      const run: AgentRun = {
        id: randomUUID(),
        agentId: id,
        startedAt,
        finishedAt: new Date().toISOString(),
        ok: result.ok,
        summary: result.summary,
      };
      db.agentRuns.insert(run);
      db.tasks.upsert({
        id: `run-${run.id.slice(0, 8)}`,
        title: `${agent.name}: ${run.summary.slice(0, 80)}`,
        status: run.ok ? "done" : "backlog",
        agentId: id,
        createdAt: run.finishedAt,
      });
      return run;
    },
    async broadcast(message: string): Promise<{ id: string; message: string; createdAt: string; replies: BroadcastReply[] }> {
      const broadcastId = randomUUID();
      const createdAt = new Date().toISOString();
      db.broadcasts.insert({ id: broadcastId, message, createdAt });

      const replies = await Promise.all(
        [...registry.values()].map(async (agent) => {
          let result: AgentRunResult;
          try {
            result = await (agent.respond ? agent.respond(message) : agent.run());
          } catch (err) {
            result = { ok: false, summary: err instanceof Error ? err.message : String(err) };
          }
          const reply: BroadcastReply = {
            id: randomUUID(),
            broadcastId,
            agentId: agent.id,
            ok: result.ok,
            reply: result.summary,
            finishedAt: new Date().toISOString(),
          };
          db.broadcasts.insertReply(reply);
          return reply;
        }),
      );

      return { id: broadcastId, message, createdAt, replies };
    },
  };
}

export type AgentRuntime = ReturnType<typeof createRuntime>;
