import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { openDb } from "../lib/db";
import { seedNexarch } from "../lib/seed";
import { buildHierarchy } from "../lib/hierarchy";

describe("hierarchy", () => {
  it("places workers under pillar leads under nexarch", () => {
    const db = openDb(":memory:");
    seedNexarch(db, { force: true });
    const tree = buildHierarchy(db.departments.list(), db.agents.list());
    assert.equal(tree.totalAgents, 18);
    const forge = tree.departments.find((d) => d.department.id === "forge");
    assert.equal(forge?.roots[0]?.agent.id, "forge-lead");
    const workerIds = forge?.roots[0]?.children.map((c) => c.agent.id) ?? [];
    for (const id of ["architect", "codegen", "reviewer"]) {
      assert.ok(workerIds.includes(id), `missing ${id}`);
    }
    db.close();
  });
});
