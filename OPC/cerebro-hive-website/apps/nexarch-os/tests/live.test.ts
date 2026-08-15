import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mapGithubNotifications } from "../lib/live";
import { listEnvConnections } from "../lib/connectors";

describe("live connectors", () => {
  it("maps GitHub notifications into comms threads", () => {
    const threads = mapGithubNotifications([
      {
        id: "99",
        reason: "mention",
        updated_at: "2026-08-15T00:00:00Z",
        subject: { title: "PlatformJob honesty", type: "Issue" },
        repository: { full_name: "cerebro/hive" },
      },
    ]);
    assert.equal(threads[0]?.id, "gh-99");
    assert.equal(threads[0]?.lane, "github");
    assert.equal(threads[0]?.status, "open");
  });

  it("does not mark hive plane connected from empty env", () => {
    delete process.env.DATABASE_URL;
    delete process.env.NEXARCH_WORKSPACE_ID;
    delete process.env.NEXARCH_DISPATCH_DRY_RUN;
    delete process.env.OPENAI_API_KEY;
    delete process.env.GITHUB_TOKEN;
    const hive = listEnvConnections().filter((c) => c.group === "hive");
    assert.equal(
      hive.filter((c) => c.status === "connected").length,
      0,
    );
  });
});
