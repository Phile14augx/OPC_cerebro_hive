import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { openDb } from "../lib/db";
import { seedNexarch } from "../lib/seed";

describe("db repos", () => {
  it("opens in-memory sqlite and round-trips an agent", () => {
    const db = openDb(":memory:");
    seedNexarch(db, { force: true });
    const agent = db.agents.get("nexarch");
    assert.equal(agent?.name, "Nexarch");
    assert.ok(db.departments.list().length >= 7);
    db.close();
  });

  it("zod-validates agent rows on the way out of sqlite", () => {
    const db = openDb(":memory:");
    db.exec(
      `INSERT INTO agents (id, name, role, department_id, parent_id, tier, status, summary)
       VALUES ('bad', 'Bad', 'x', 'forge', null, 'god', 'active', 'nope')`,
    );
    assert.throws(() => db.agents.list());
    db.close();
  });
});
