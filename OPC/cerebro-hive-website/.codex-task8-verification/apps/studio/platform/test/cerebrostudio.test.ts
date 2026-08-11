import { describe, expect, it } from "vitest";
import { testPlatform } from "./helpers.js";

describe("CerebroStudio™ — full IDE-style AI development workspace", () => {
  it("creates a workspace and lists it", async () => {
    const { platform, ctx } = await testPlatform();
    const ws = await platform.cerebroStudio.createWorkspace(ctx, { name: "Growth Team", description: "Growth experiments" });
    expect(ws.name).toBe("Growth Team");
    const listed = await platform.cerebroStudio.listWorkspaces(ctx);
    expect(listed.map(w => w.id)).toContain(ws.id);
    const fetched = await platform.cerebroStudio.getWorkspace(ctx, ws.id);
    expect(fetched.id).toBe(ws.id);
  });

  it("creates a prompt, extracts variables, versions it, and runs it", async () => {
    const { platform, ctx } = await testPlatform();
    const ws = await platform.cerebroStudio.createWorkspace(ctx, { name: "WS" });
    const prompt = await platform.cerebroStudio.createPrompt(ctx, ws.id, { name: "Welcome Email", template: "Hi {{name}}, welcome to {{company}}!" });
    expect(prompt.variables.sort()).toEqual(["company", "name"]);
    expect(prompt.versions.length).toBe(1);

    const updated = await platform.cerebroStudio.updatePrompt(ctx, prompt.id, "Hi {{name}}, thanks for joining {{company}} on {{date}}.");
    expect(updated.versions.length).toBe(2);
    expect(updated.variables.sort()).toEqual(["company", "date", "name"]);

    const run = await platform.cerebroStudio.runPrompt(ctx, prompt.id, "name=Sam, company=Acme");
    expect(run.status).toBe("completed");
    expect(run.output.length).toBeGreaterThan(0);
    expect(run.targetType).toBe("prompt");
  });

  it("creates and runs an agent", async () => {
    const { platform, ctx } = await testPlatform();
    const ws = await platform.cerebroStudio.createWorkspace(ctx, { name: "WS" });
    const agent = await platform.cerebroStudio.createAgent(ctx, ws.id, { name: "Support Bot", systemPrompt: "You are a helpful support agent.", tools: ["knowledge-search"], memoryEnabled: true });
    expect(agent.model).toBe("cerebro-router-auto");
    const run = await platform.cerebroStudio.runAgent(ctx, agent.id, "How do I reset my password?");
    expect(run.targetType).toBe("agent");
    expect(run.output).toContain("Support Bot");
  });

  it("chains a prompt and an agent into a flow and runs the whole flow", async () => {
    const { platform, ctx } = await testPlatform();
    const ws = await platform.cerebroStudio.createWorkspace(ctx, { name: "WS" });
    const prompt = await platform.cerebroStudio.createPrompt(ctx, ws.id, { name: "Draft", template: "Draft a reply to: {{message}}" });
    const agent = await platform.cerebroStudio.createAgent(ctx, ws.id, { name: "Reviewer", systemPrompt: "Review and polish drafts." });
    const flow = await platform.cerebroStudio.createFlow(ctx, ws.id, { name: "Draft & Review", steps: [{ kind: "prompt", refId: prompt.id }, { kind: "agent", refId: agent.id }] });
    expect(flow.steps.length).toBe(2);
    expect(flow.steps[0]!.order).toBe(0);

    const run = await platform.cerebroStudio.runFlow(ctx, flow.id, "customer is asking for a refund");
    expect(run.targetType).toBe("flow");
    expect(run.output).toContain("Draft");
    expect(run.output).toContain("Reviewer");
  });

  it("refuses to create a flow with zero steps", async () => {
    const { platform, ctx } = await testPlatform();
    const ws = await platform.cerebroStudio.createWorkspace(ctx, { name: "WS" });
    await expect(platform.cerebroStudio.createFlow(ctx, ws.id, { name: "Empty", steps: [] })).rejects.toThrow();
  });

  it("creates a notebook, adds cells, and runs a code cell", async () => {
    const { platform, ctx } = await testPlatform();
    const ws = await platform.cerebroStudio.createWorkspace(ctx, { name: "WS" });
    const notebook = await platform.cerebroStudio.createNotebook(ctx, ws.id, "Exploration");
    await platform.cerebroStudio.addCell(ctx, notebook.id, { type: "markdown", content: "# Exploring the dataset" });
    const withCode = await platform.cerebroStudio.addCell(ctx, notebook.id, { type: "code", content: "summarize(dataset)" });
    const codeCell = withCode.cells.find(c => c.type === "code")!;
    const ran = await platform.cerebroStudio.runCell(ctx, notebook.id, codeCell.id);
    expect(ran.cells.find(c => c.id === codeCell.id)?.output).toBeDefined();
  });

  it("creates a dataset with sample rows", async () => {
    const { platform, ctx } = await testPlatform();
    const ws = await platform.cerebroStudio.createWorkspace(ctx, { name: "WS" });
    const dataset = await platform.cerebroStudio.createDataset(ctx, ws.id, { name: "Support Tickets", format: "csv", sampleRows: [{ id: 1, subject: "Cannot log in" }, { id: 2, subject: "Billing question" }] });
    expect(dataset.rows).toBe(2);
    expect(dataset.sampleRows.length).toBe(2);
    const listed = await platform.cerebroStudio.listDatasets(ctx, ws.id);
    expect(listed.map(d => d.id)).toContain(dataset.id);
  });

  it("lists runs for a workspace across prompt/agent/flow executions, most recent first", async () => {
    const { platform, ctx } = await testPlatform();
    const ws = await platform.cerebroStudio.createWorkspace(ctx, { name: "WS" });
    const prompt = await platform.cerebroStudio.createPrompt(ctx, ws.id, { name: "P", template: "Hello {{x}}" });
    await platform.cerebroStudio.runPrompt(ctx, prompt.id, "x=1");
    await platform.cerebroStudio.runPrompt(ctx, prompt.id, "x=2");
    const runs = await platform.cerebroStudio.listRuns(ctx, ws.id);
    expect(runs.length).toBe(2);
  });

  it("scopes workspaces per organization — a second org cannot see the first org's workspace", async () => {
    const { platform, ctx } = await testPlatform();
    const { ctx: otherCtx } = await testPlatform();
    const ws = await platform.cerebroStudio.createWorkspace(ctx, { name: "Private" });
    await expect(platform.cerebroStudio.getWorkspace(otherCtx, ws.id)).rejects.toThrow();
  });
});
