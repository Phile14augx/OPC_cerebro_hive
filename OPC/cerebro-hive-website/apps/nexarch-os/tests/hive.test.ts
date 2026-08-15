import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { openDb } from "../lib/db";
import { seedNexarch } from "../lib/seed";
import { enqueuePlatformJob, hivePlaneStatus, summarizeJobs } from "../lib/hive";
import { searchBrain } from "../lib/brain";

describe("hive control plane", () => {
  it("treats missing DATABASE_URL as not_configured", () => {
    const prev = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    delete process.env.NEXARCH_WORKSPACE_ID;
    delete process.env.NEXARCH_DISPATCH_DRY_RUN;
    const plane = hivePlaneStatus();
    assert.equal(plane.postgres, "not_configured");
    assert.equal(plane.dispatchOptIn, false);
    if (prev) process.env.DATABASE_URL = prev;
  });

  it("enqueues a local QUEUED job and never stamps SUCCEEDED", async () => {
    const db = openDb(":memory:");
    seedNexarch(db, { force: true });
    const prevUrl = process.env.DATABASE_URL;
    const prevWs = process.env.NEXARCH_WORKSPACE_ID;
    delete process.env.DATABASE_URL;
    delete process.env.NEXARCH_WORKSPACE_ID;
    const { job, prisma } = await enqueuePlatformJob(db, { type: "nexarch.test" });
    assert.equal(job.status, "QUEUED");
    assert.equal(job.finishedAt, null);
    assert.equal(prisma.ok, false);
    if (!prisma.ok) assert.equal(prisma.status, "not_configured");
    assert.equal(db.hiveJobs.list().some((j) => j.status === "SUCCEEDED"), false);
    assert.match(summarizeJobs(db.hiveJobs.list()), /SUCCEEDED=0/);
    if (prevUrl) process.env.DATABASE_URL = prevUrl;
    if (prevWs) process.env.NEXARCH_WORKSPACE_ID = prevWs;
    db.close();
  });

  it("falls back to grep when pgvector is not configured", async () => {
    const prev = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    const result = await searchBrain("");
    assert.equal(result.provider, "grep");
    assert.deepEqual(result.hits, []);
    if (prev) process.env.DATABASE_URL = prev;
  });
});
