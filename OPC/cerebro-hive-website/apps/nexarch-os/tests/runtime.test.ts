import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { openDb } from "../lib/db";
import { seedNexarch } from "../lib/seed";
import { getRuntime } from "../lib/agents";

describe("agent runtime", () => {
  it("runs every seeded agent and persists last-run", async () => {
    const db = openDb(":memory:");
    seedNexarch(db, { force: true });
    const runtime = getRuntime(db);
    for (const agent of db.agents.list()) {
      const run = await runtime.run(agent.id);
      assert.equal(run.agentId, agent.id);
      assert.ok(run.summary.length > 0);
      assert.equal(db.agentRuns.last(agent.id)?.id, run.id);
    }
    db.close();
  });

  it("dispatcher and hiveops refuse rather than fake success", async () => {
    const db = openDb(":memory:");
    seedNexarch(db, { force: true });
    const runtime = getRuntime(db);
    const dispatcher = await runtime.run("dispatcher");
    const hiveops = await runtime.run("hiveops-lead");
    assert.equal(dispatcher.ok, false, dispatcher.summary);
    assert.equal(hiveops.ok, false, hiveops.summary);
    assert.match(dispatcher.summary.toLowerCase(), /not_configured|not wired|not_wired/);
    assert.match(hiveops.summary.toLowerCase(), /not wired|not_wired|succeeded/);
    db.close();
  });

  it("broadcasts to the whole company", async () => {
    const db = openDb(":memory:");
    seedNexarch(db, { force: true });
    const result = await getRuntime(db).broadcast("morning check");
    assert.equal(result.replies.length, db.agents.list().length);
    db.close();
  });
});
