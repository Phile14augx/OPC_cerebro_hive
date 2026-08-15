import type { NexarchDb } from "../db";
import { createNexarchAgents } from "./nexarch";
import { createRuntime, type AgentRuntime } from "./runtime";

const runtimes = new WeakMap<NexarchDb, AgentRuntime>();

export function getRuntime(db: NexarchDb): AgentRuntime {
  let runtime = runtimes.get(db);
  if (!runtime) {
    runtime = createRuntime(db, createNexarchAgents(db));
    runtimes.set(db, runtime);
  }
  return runtime;
}

export function assertSeedMatchesRuntime(db: NexarchDb): string[] {
  const runtimeIds = new Set(getRuntime(db).list().map((a) => a.id));
  return db.agents.ids().filter((id) => !runtimeIds.has(id));
}
