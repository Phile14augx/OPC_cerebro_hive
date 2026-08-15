import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseLedgerCsv, computePulse } from "../lib/pulse";
import { openDb } from "../lib/db";
import { seedNexarch } from "../lib/seed";

describe("finances", () => {
  it("parses a valid csv and refuses a bad header", () => {
    const ok = parseLedgerCsv("date,description,category,amount,direction\n2026-08-01,GPU,compute,99,out");
    assert.equal(ok.entries.length, 1);
    assert.equal(ok.entries[0]?.direction, "out");
    const bad = parseLedgerCsv("foo,bar\n1,2");
    assert.match(bad.error ?? "", /Header/);
  });

  it("computes runway from the seeded ledger", () => {
    const db = openDb(":memory:");
    seedNexarch(db, { force: true });
    const pulse = computePulse(db);
    assert.ok(pulse.runwayMonths > 0);
    assert.equal(pulse.agentsActive, 18);
    db.close();
  });
});
