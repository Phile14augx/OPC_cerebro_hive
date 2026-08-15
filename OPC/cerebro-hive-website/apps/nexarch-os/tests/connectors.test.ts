import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { envStatus, listEnvConnections } from "../lib/connectors";

describe("connectors", () => {
  it("reports not_configured when env is empty", () => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.DATABASE_URL;
    delete process.env.NEXARCH_WORKSPACE_ID;
    delete process.env.OPENAI_API_KEY;
    assert.equal(envStatus(["STRIPE_SECRET_KEY"]), "not_configured");
    const stripe = listEnvConnections().find((c) => c.id === "stripe");
    assert.equal(stripe?.status, "not_configured");
  });

  it("never seeds a connected status from empty env", () => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GITHUB_TOKEN;
    delete process.env.IMAP_HOST;
    delete process.env.IMAP_USER;
    delete process.env.IMAP_PASSWORD;
    delete process.env.SLACK_BOT_TOKEN;
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.NOTION_API_KEY;
    delete process.env.DATABASE_URL;
    delete process.env.NEXARCH_WORKSPACE_ID;
    delete process.env.NEXARCH_DISPATCH_DRY_RUN;
    const connected = listEnvConnections().filter((c) => c.status === "connected");
    assert.equal(connected.length, 0);
  });
});
