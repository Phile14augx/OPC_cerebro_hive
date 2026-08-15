import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { connectorStatusSchema, funnelStageSchema, parseRow, agentSchema } from "../lib/schemas";

describe("schemas", () => {
  it("accepts honest connector statuses only", () => {
    assert.equal(connectorStatusSchema.parse("not_configured"), "not_configured");
    assert.throws(() => connectorStatusSchema.parse("connected_fake"));
  });

  it("parses a nexarch agent row", () => {
    const agent = parseRow(agentSchema, {
      id: "nexarch",
      name: "Nexarch",
      role: "Conductor",
      departmentId: "conductor",
      parentId: null,
      tier: "lead",
      status: "active",
      summary: "Routes work",
    });
    assert.equal(agent.id, "nexarch");
  });

  it("keeps funnel stages in the Nexarch GTM set", () => {
    assert.equal(funnelStageSchema.parse("workspace"), "workspace");
    assert.throws(() => funnelStageSchema.parse("closed-won"));
  });
});
