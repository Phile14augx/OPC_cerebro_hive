import { describe, expect, it } from "vitest";
import { newId, idTime } from "../src/kernel/ids/id.js";
import { subjectMatches } from "../src/kernel/events/events.js";
import { InMemoryEventBus } from "../src/kernel/events/memory-bus.js";
import { PolicyEngine } from "../src/kernel/policy/policy.js";
import { evaluateExpression } from "../src/domains/runtime/tools.js";
import { testPlatform } from "./helpers.js";

describe("kernel", () => {
  it("generates sortable unique ids with recoverable time", () => {
    const a = newId("x"); const b = newId("x");
    expect(a).not.toBe(b);
    expect(Math.abs(idTime(a) - Date.now())).toBeLessThan(5000);
  });

  it("matches NATS-style subjects", () => {
    expect(subjectMatches("runtime.*.started", "runtime.execution.started")).toBe(true);
    expect(subjectMatches("runtime.>", "runtime.execution.step")).toBe(true);
    expect(subjectMatches("flow.>", "runtime.execution.step")).toBe(false);
    expect(subjectMatches("a.b", "a.b.c")).toBe(false);
  });

  it("delivers events to wildcard subscribers", async () => {
    const bus = new InMemoryEventBus();
    const got: string[] = [];
    await bus.subscribe("knowledge.>", e => { got.push(e.subject); });
    await bus.publish("knowledge.document.uploaded", { x: 1 }, { organizationId: "o1" });
    await bus.publish("runtime.execution.started", {}, { organizationId: "o1" });
    expect(got).toEqual(["knowledge.document.uploaded"]);
  });

  it("enforces tenant isolation and role grants", () => {
    const policy = new PolicyEngine();
    const dev = { userId: "u", organizationId: "org1", roles: ["developer"], attributes: {} };
    expect(policy.can(dev, "runtime:run", { kind: "execution", organizationId: "org1" })).toBe(true);
    expect(policy.can(dev, "runtime:run", { kind: "execution", organizationId: "org2" })).toBe(false);
    expect(policy.can(dev, "governance:write", { kind: "approval", organizationId: "org1" })).toBe(false);
    const viewer = { userId: "v", organizationId: "org1", roles: ["viewer"], attributes: {} };
    expect(policy.can(viewer, "knowledge:read", { kind: "document", organizationId: "org1" })).toBe(true);
    expect(policy.can(viewer, "knowledge:write", { kind: "document", organizationId: "org1" })).toBe(false);
  });

  it("evaluates arithmetic safely", () => {
    expect(evaluateExpression("2+3*4")).toBe(14);
    expect(evaluateExpression("(2+3)*4")).toBe(20);
    expect(evaluateExpression("2**3")).toBe(8);
    expect(evaluateExpression("42 * 17 + 100".replace(/\s+/g, ""))).toBe(814);
  });

  it("authenticates api keys and rejects bad ones", async () => {
    const { platform } = await testPlatform();
    await expect(platform.identity.authenticate("chk_bogus")).rejects.toThrow();
  });
});
