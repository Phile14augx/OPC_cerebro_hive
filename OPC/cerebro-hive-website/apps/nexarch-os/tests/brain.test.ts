import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { openDb } from "../lib/db";
import { seedNexarch } from "../lib/seed";
import { searchDocs } from "../lib/brain";

describe("brain", () => {
  it("promotes a claim into a fact node", () => {
    const db = openDb(":memory:");
    seedNexarch(db, { force: true });
    const promoted = db.claims.promote("cl1");
    assert.equal(promoted?.status, "fact");
    assert.equal(db.knowledge.nodes().some((n) => n.id === "fact-cl1"), true);
    db.close();
  });

  it("returns [] for empty queries", () => {
    assert.deepEqual(searchDocs(""), []);
  });
});
