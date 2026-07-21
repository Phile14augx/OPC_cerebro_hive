import { describe, expect, it } from "vitest";
import { testPlatform } from "./helpers.js";

describe("CerebroSwarm™ — executive council + architecture coordination layer", () => {
  it("lists the fixed five-agent roster", async () => {
    const { platform, ctx } = await testPlatform();
    const agents = platform.cerebroSwarm.listAgents(ctx);
    expect(agents.map(a => a.role)).toEqual(["ceo", "strategy", "architect", "planner", "reviewer"]);
    expect(agents.every(a => a.name && a.title && a.responsibility)).toBe(true);
  });

  it("submits a directive and runs it through all five agents in order", async () => {
    const { platform, ctx } = await testPlatform();
    const { directive, tasks } = await platform.cerebroSwarm.submitDirective(ctx, { objective: "Build an enterprise AI customer support platform" });
    expect(directive.status).toBe("completed");
    expect(directive.completedAt).toBeDefined();
    expect(tasks.length).toBe(5);
    expect(tasks.map(t => t.role)).toEqual(["ceo", "strategy", "architect", "planner", "reviewer"]);
    expect(tasks.every((t, i) => t.order === i)).toBe(true);
    expect(tasks.every(t => t.status === "completed" && t.output.length > 0)).toBe(true);
  });

  it("chains sender/recipient and dependencies correctly across the task sequence", async () => {
    const { platform, ctx } = await testPlatform();
    const { tasks } = await platform.cerebroSwarm.submitDirective(ctx, { objective: "Ship a new pricing page" });
    expect(tasks[0]!.sender).toBe("User");
    expect(tasks[0]!.dependencies).toEqual([]);
    for (let i = 1; i < tasks.length; i++) {
      expect(tasks[i]!.sender).toBe(tasks[i - 1]!.recipient);
      expect(tasks[i]!.dependencies).toEqual([tasks[i - 1]!.taskId]);
    }
    // every business taskId is unique
    expect(new Set(tasks.map(t => t.taskId)).size).toBe(tasks.length);
  });

  it("respects an explicit priority across the whole chain", async () => {
    const { platform, ctx } = await testPlatform();
    const { directive, tasks } = await platform.cerebroSwarm.submitDirective(ctx, { objective: "Audit vendor contracts", priority: "Low" });
    expect(directive.priority).toBe("Low");
    expect(tasks.every(t => t.priority === "Low")).toBe(true);
  });

  it("refuses an empty objective", async () => {
    const { platform, ctx } = await testPlatform();
    await expect(platform.cerebroSwarm.submitDirective(ctx, { objective: "   " })).rejects.toThrow();
  });

  it("lists directives and fetches a single directive with its tasks", async () => {
    const { platform, ctx } = await testPlatform();
    const { directive: d1 } = await platform.cerebroSwarm.submitDirective(ctx, { objective: "First directive" });
    const { directive: d2 } = await platform.cerebroSwarm.submitDirective(ctx, { objective: "Second directive" });
    const listed = await platform.cerebroSwarm.listDirectives(ctx);
    expect(listed.map(d => d.id)).toEqual(expect.arrayContaining([d1.id, d2.id]));

    const fetched = await platform.cerebroSwarm.getDirective(ctx, d2.id);
    expect(fetched.directive.id).toBe(d2.id);
    expect(fetched.tasks.length).toBe(5);
  });

  it("404s on an unknown directive id", async () => {
    const { platform, ctx } = await testPlatform();
    await expect(platform.cerebroSwarm.getDirective(ctx, "does-not-exist")).rejects.toThrow();
  });

  it("scopes directives per organization — a second org cannot see the first org's directive", async () => {
    const { platform, ctx } = await testPlatform();
    const { ctx: otherCtx } = await testPlatform();
    const { directive } = await platform.cerebroSwarm.submitDirective(ctx, { objective: "Private initiative" });
    await expect(platform.cerebroSwarm.getDirective(otherCtx, directive.id)).rejects.toThrow();
    const otherList = await platform.cerebroSwarm.listDirectives(otherCtx);
    expect(otherList.map(d => d.id)).not.toContain(directive.id);
  });
});
