import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { openDb } from "../lib/db";
import { NEXARCH_AGENT_IDS, seedNexarch } from "../lib/seed";
import { assertSeedMatchesRuntime } from "../lib/agents";

describe("nexarch seed", () => {
  it("is idempotent and contains no FounderOS demo names", () => {
    const db = openDb(":memory:");
    seedNexarch(db, { force: true });
    seedNexarch(db);
    const blob = JSON.stringify({
      agents: db.agents.list(),
      deals: db.funnel.list(),
      comms: db.comms.list(),
    }).toLowerCase();
    assert.equal(/founder os|zernio|attio|g-brain|alex/.test(blob), false);
    assert.equal(db.meta.get("operator"), "Philemon");
    assert.equal(db.meta.get("company"), "Cerebro Nexarch");
    assert.equal(db.agents.list().length, NEXARCH_AGENT_IDS.length);
    db.close();
  });

  it("fails if a seeded agent has no runtime", () => {
    const db = openDb(":memory:");
    seedNexarch(db, { force: true });
    assert.deepEqual(assertSeedMatchesRuntime(db), []);
    db.close();
  });
});
