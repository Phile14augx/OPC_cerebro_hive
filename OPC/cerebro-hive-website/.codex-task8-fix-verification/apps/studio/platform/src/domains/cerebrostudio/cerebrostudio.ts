import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import { PlatformError } from "../../kernel/errors/errors.js";
import { seededRandom } from "../simulator/simulator.js";

/**
 * CerebroStudio™ — the full IDE-style AI development workspace. Organizations create Workspaces
 * (projects); inside a workspace they build versioned Prompts, configure Agents (system prompt +
 * tools + model), chain them into ordered Flows, prototype in cell-based Notebooks, and attach
 * lightweight Datasets. Prompts/Agents/Flows can be Run — this simulates execution deterministically
 * (seeded on the target + input) exactly like this platform's other governed-simulation domains
 * (HiveForge provisioning, DevOps pipelines, MLOps drift) rather than calling a real model provider,
 * so behavior is fully reproducible without external dependencies.
 */

export interface Workspace { id: string; organizationId: string; name: string; description: string; createdAt: string }

export interface PromptVersion { version: number; template: string; createdAt: string }
export interface Prompt {
  id: string; workspaceId: string; organizationId: string; name: string;
  template: string; variables: string[]; versions: PromptVersion[]; updatedAt: string;
}

export interface Agent {
  id: string; workspaceId: string; organizationId: string; name: string;
  systemPrompt: string; model: string; tools: string[]; memoryEnabled: boolean; createdAt: string;
}

export interface FlowStep { id: string; kind: "prompt" | "agent"; refId: string; order: number }
export interface Flow { id: string; workspaceId: string; organizationId: string; name: string; steps: FlowStep[]; createdAt: string }

export interface NotebookCell { id: string; type: "markdown" | "code"; content: string; output?: string }
export interface Notebook { id: string; workspaceId: string; organizationId: string; name: string; cells: NotebookCell[]; createdAt: string }

export interface Dataset {
  id: string; workspaceId: string; organizationId: string; name: string;
  format: "csv" | "jsonl" | "txt"; rows: number; sizeKb: number; sampleRows: Record<string, unknown>[]; createdAt: string;
}

export interface Run {
  id: string; workspaceId: string; organizationId: string;
  targetType: "prompt" | "agent" | "flow"; targetId: string; targetName: string;
  input: string; output: string; tokensUsed: number; latencyMs: number;
  status: "completed" | "failed"; createdAt: string;
}

export interface CerebroStudioRepository {
  insertWorkspace(w: Workspace): Promise<void>;
  listWorkspaces(org: string): Promise<Workspace[]>;
  getWorkspace(org: string, id: string): Promise<Workspace | undefined>;

  insertPrompt(p: Prompt): Promise<void>;
  updatePrompt(p: Prompt): Promise<void>;
  listPrompts(workspaceId: string): Promise<Prompt[]>;
  getPrompt(id: string): Promise<Prompt | undefined>;

  insertAgent(a: Agent): Promise<void>;
  listAgents(workspaceId: string): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | undefined>;

  insertFlow(f: Flow): Promise<void>;
  listFlows(workspaceId: string): Promise<Flow[]>;
  getFlow(id: string): Promise<Flow | undefined>;

  insertNotebook(n: Notebook): Promise<void>;
  updateNotebook(n: Notebook): Promise<void>;
  listNotebooks(workspaceId: string): Promise<Notebook[]>;
  getNotebook(id: string): Promise<Notebook | undefined>;

  insertDataset(d: Dataset): Promise<void>;
  listDatasets(workspaceId: string): Promise<Dataset[]>;

  insertRun(r: Run): Promise<void>;
  listRuns(workspaceId: string): Promise<Run[]>;
}

export class InMemoryCerebroStudioRepository implements CerebroStudioRepository {
  workspaces = new Map<string, Workspace>();
  prompts = new Map<string, Prompt>();
  agents = new Map<string, Agent>();
  flows = new Map<string, Flow>();
  notebooks = new Map<string, Notebook>();
  datasets = new Map<string, Dataset>();
  runs = new Map<string, Run>();

  async insertWorkspace(w: Workspace) { this.workspaces.set(w.id, structuredClone(w)); }
  async listWorkspaces(org: string) { return [...this.workspaces.values()].filter(w => w.organizationId === org); }
  async getWorkspace(org: string, id: string) { const w = this.workspaces.get(id); return w?.organizationId === org ? structuredClone(w) : undefined; }

  async insertPrompt(p: Prompt) { this.prompts.set(p.id, structuredClone(p)); }
  async updatePrompt(p: Prompt) { this.prompts.set(p.id, structuredClone(p)); }
  async listPrompts(workspaceId: string) { return [...this.prompts.values()].filter(p => p.workspaceId === workspaceId); }
  async getPrompt(id: string) { const p = this.prompts.get(id); return p ? structuredClone(p) : undefined; }

  async insertAgent(a: Agent) { this.agents.set(a.id, structuredClone(a)); }
  async listAgents(workspaceId: string) { return [...this.agents.values()].filter(a => a.workspaceId === workspaceId); }
  async getAgent(id: string) { const a = this.agents.get(id); return a ? structuredClone(a) : undefined; }

  async insertFlow(f: Flow) { this.flows.set(f.id, structuredClone(f)); }
  async listFlows(workspaceId: string) { return [...this.flows.values()].filter(f => f.workspaceId === workspaceId); }
  async getFlow(id: string) { const f = this.flows.get(id); return f ? structuredClone(f) : undefined; }

  async insertNotebook(n: Notebook) { this.notebooks.set(n.id, structuredClone(n)); }
  async updateNotebook(n: Notebook) { this.notebooks.set(n.id, structuredClone(n)); }
  async listNotebooks(workspaceId: string) { return [...this.notebooks.values()].filter(n => n.workspaceId === workspaceId); }
  async getNotebook(id: string) { const n = this.notebooks.get(id); return n ? structuredClone(n) : undefined; }

  async insertDataset(d: Dataset) { this.datasets.set(d.id, structuredClone(d)); }
  async listDatasets(workspaceId: string) { return [...this.datasets.values()].filter(d => d.workspaceId === workspaceId); }

  async insertRun(r: Run) { this.runs.set(r.id, structuredClone(r)); }
  async listRuns(workspaceId: string) { return [...this.runs.values()].filter(r => r.workspaceId === workspaceId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
}

const SAMPLE_COMPLETIONS = [
  "Based on the provided context, here is a structured response addressing each point raised.",
  "Analysis complete. The key finding is a clear upward trend, with three notable outliers flagged for review.",
  "Understood — I've broken the task into steps and executed each in sequence, verifying output at every stage.",
  "Here is a concise summary: the request has been fulfilled and the result meets the stated constraints.",
  "I've cross-referenced the available tools and returned the most relevant match with supporting rationale.",
];

function interpolate(template: string, rand: () => number): { output: string; variables: string[] } {
  const variables = [...new Set([...template.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]!))];
  const base = SAMPLE_COMPLETIONS[Math.floor(rand() * SAMPLE_COMPLETIONS.length)]!;
  return { output: base, variables };
}

export class CerebroStudioService {
  constructor(
    private readonly repo: CerebroStudioRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
  ) {}

  // ---------------- Workspaces ----------------

  async createWorkspace(ctx: RequestContext, input: { name: string; description?: string }): Promise<Workspace> {
    this.policy.assert(ctx.principal, "cerebrostudio:write", { kind: "workspace", organizationId: ctx.principal.organizationId });
    const workspace: Workspace = {
      id: newId("stw"), organizationId: ctx.principal.organizationId,
      name: input.name, description: input.description ?? "", createdAt: new Date().toISOString(),
    };
    await this.repo.insertWorkspace(workspace);
    await this.bus.publish(Subjects.cerebrostudio.workspaceCreated, { workspaceId: workspace.id, name: workspace.name }, { organizationId: workspace.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return workspace;
  }

  listWorkspaces(ctx: RequestContext): Promise<Workspace[]> {
    this.policy.assert(ctx.principal, "cerebrostudio:read", { kind: "workspace", organizationId: ctx.principal.organizationId });
    return this.repo.listWorkspaces(ctx.principal.organizationId);
  }

  async getWorkspace(ctx: RequestContext, id: string): Promise<Workspace> {
    this.policy.assert(ctx.principal, "cerebrostudio:read", { kind: "workspace", organizationId: ctx.principal.organizationId });
    const w = await this.repo.getWorkspace(ctx.principal.organizationId, id);
    if (!w) throw PlatformError.notFound("workspace", id);
    return w;
  }

  private async requireWorkspace(ctx: RequestContext, workspaceId: string): Promise<Workspace> {
    const w = await this.repo.getWorkspace(ctx.principal.organizationId, workspaceId);
    if (!w) throw PlatformError.notFound("workspace", workspaceId);
    return w;
  }

  // ---------------- Prompts ----------------

  async createPrompt(ctx: RequestContext, workspaceId: string, input: { name: string; template: string }): Promise<Prompt> {
    this.policy.assert(ctx.principal, "cerebrostudio:write", { kind: "prompt", organizationId: ctx.principal.organizationId });
    await this.requireWorkspace(ctx, workspaceId);
    const variables = [...new Set([...input.template.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]!))];
    const now = new Date().toISOString();
    const prompt: Prompt = {
      id: newId("prm"), workspaceId, organizationId: ctx.principal.organizationId, name: input.name,
      template: input.template, variables, versions: [{ version: 1, template: input.template, createdAt: now }], updatedAt: now,
    };
    await this.repo.insertPrompt(prompt);
    await this.bus.publish(Subjects.cerebrostudio.promptCreated, { promptId: prompt.id, workspaceId }, { organizationId: prompt.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return prompt;
  }

  async updatePrompt(ctx: RequestContext, id: string, template: string): Promise<Prompt> {
    this.policy.assert(ctx.principal, "cerebrostudio:write", { kind: "prompt", organizationId: ctx.principal.organizationId });
    const prompt = await this.repo.getPrompt(id);
    if (!prompt || prompt.organizationId !== ctx.principal.organizationId) throw PlatformError.notFound("prompt", id);
    const nextVersion = (prompt.versions.at(-1)?.version ?? 0) + 1;
    const now = new Date().toISOString();
    prompt.template = template;
    prompt.variables = [...new Set([...template.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]!))];
    prompt.versions.push({ version: nextVersion, template, createdAt: now });
    prompt.updatedAt = now;
    await this.repo.updatePrompt(prompt);
    await this.bus.publish(Subjects.cerebrostudio.promptVersioned, { promptId: prompt.id, version: nextVersion }, { organizationId: prompt.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return prompt;
  }

  listPrompts(ctx: RequestContext, workspaceId: string): Promise<Prompt[]> {
    this.policy.assert(ctx.principal, "cerebrostudio:read", { kind: "prompt", organizationId: ctx.principal.organizationId });
    return this.repo.listPrompts(workspaceId);
  }

  // ---------------- Agents ----------------

  async createAgent(ctx: RequestContext, workspaceId: string, input: { name: string; systemPrompt: string; model?: string; tools?: string[]; memoryEnabled?: boolean }): Promise<Agent> {
    this.policy.assert(ctx.principal, "cerebrostudio:write", { kind: "agent", organizationId: ctx.principal.organizationId });
    await this.requireWorkspace(ctx, workspaceId);
    const agent: Agent = {
      id: newId("agt"), workspaceId, organizationId: ctx.principal.organizationId, name: input.name,
      systemPrompt: input.systemPrompt, model: input.model ?? "cerebro-router-auto",
      tools: input.tools ?? [], memoryEnabled: input.memoryEnabled ?? false, createdAt: new Date().toISOString(),
    };
    await this.repo.insertAgent(agent);
    await this.bus.publish(Subjects.cerebrostudio.agentCreated, { agentId: agent.id, workspaceId }, { organizationId: agent.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return agent;
  }

  listAgents(ctx: RequestContext, workspaceId: string): Promise<Agent[]> {
    this.policy.assert(ctx.principal, "cerebrostudio:read", { kind: "agent", organizationId: ctx.principal.organizationId });
    return this.repo.listAgents(workspaceId);
  }

  // ---------------- Flows ----------------

  async createFlow(ctx: RequestContext, workspaceId: string, input: { name: string; steps: { kind: "prompt" | "agent"; refId: string }[] }): Promise<Flow> {
    this.policy.assert(ctx.principal, "cerebrostudio:write", { kind: "flow", organizationId: ctx.principal.organizationId });
    await this.requireWorkspace(ctx, workspaceId);
    if (input.steps.length === 0) throw PlatformError.validation("a flow needs at least one step");
    const flow: Flow = {
      id: newId("flw"), workspaceId, organizationId: ctx.principal.organizationId, name: input.name,
      steps: input.steps.map((s, i) => ({ id: newId("stp"), kind: s.kind, refId: s.refId, order: i })),
      createdAt: new Date().toISOString(),
    };
    await this.repo.insertFlow(flow);
    await this.bus.publish(Subjects.cerebrostudio.flowCreated, { flowId: flow.id, workspaceId, steps: flow.steps.length }, { organizationId: flow.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return flow;
  }

  listFlows(ctx: RequestContext, workspaceId: string): Promise<Flow[]> {
    this.policy.assert(ctx.principal, "cerebrostudio:read", { kind: "flow", organizationId: ctx.principal.organizationId });
    return this.repo.listFlows(workspaceId);
  }

  // ---------------- Notebooks ----------------

  async createNotebook(ctx: RequestContext, workspaceId: string, name: string): Promise<Notebook> {
    this.policy.assert(ctx.principal, "cerebrostudio:write", { kind: "notebook", organizationId: ctx.principal.organizationId });
    await this.requireWorkspace(ctx, workspaceId);
    const notebook: Notebook = { id: newId("nbk"), workspaceId, organizationId: ctx.principal.organizationId, name, cells: [], createdAt: new Date().toISOString() };
    await this.repo.insertNotebook(notebook);
    await this.bus.publish(Subjects.cerebrostudio.notebookCreated, { notebookId: notebook.id, workspaceId }, { organizationId: notebook.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return notebook;
  }

  listNotebooks(ctx: RequestContext, workspaceId: string): Promise<Notebook[]> {
    this.policy.assert(ctx.principal, "cerebrostudio:read", { kind: "notebook", organizationId: ctx.principal.organizationId });
    return this.repo.listNotebooks(workspaceId);
  }

  async addCell(ctx: RequestContext, notebookId: string, input: { type: "markdown" | "code"; content: string }): Promise<Notebook> {
    this.policy.assert(ctx.principal, "cerebrostudio:write", { kind: "notebook", organizationId: ctx.principal.organizationId });
    const notebook = await this.repo.getNotebook(notebookId);
    if (!notebook || notebook.organizationId !== ctx.principal.organizationId) throw PlatformError.notFound("notebook", notebookId);
    notebook.cells.push({ id: newId("cel"), type: input.type, content: input.content });
    await this.repo.updateNotebook(notebook);
    return notebook;
  }

  async runCell(ctx: RequestContext, notebookId: string, cellId: string): Promise<Notebook> {
    this.policy.assert(ctx.principal, "cerebrostudio:write", { kind: "notebook", organizationId: ctx.principal.organizationId });
    const notebook = await this.repo.getNotebook(notebookId);
    if (!notebook || notebook.organizationId !== ctx.principal.organizationId) throw PlatformError.notFound("notebook", notebookId);
    const cell = notebook.cells.find(c => c.id === cellId);
    if (!cell) throw PlatformError.notFound("cell", cellId);
    const rand = seededRandom(`${notebookId}:${cellId}:${cell.content.length}`);
    cell.output = cell.type === "markdown"
      ? "(rendered)"
      : `${SAMPLE_COMPLETIONS[Math.floor(rand() * SAMPLE_COMPLETIONS.length)]}\n> executed in ${20 + Math.floor(rand() * 400)}ms`;
    await this.repo.updateNotebook(notebook);
    return notebook;
  }

  // ---------------- Datasets ----------------

  async createDataset(ctx: RequestContext, workspaceId: string, input: { name: string; format: "csv" | "jsonl" | "txt"; sampleRows?: Record<string, unknown>[] }): Promise<Dataset> {
    this.policy.assert(ctx.principal, "cerebrostudio:write", { kind: "dataset", organizationId: ctx.principal.organizationId });
    await this.requireWorkspace(ctx, workspaceId);
    const rand = seededRandom(`${workspaceId}:${input.name}`);
    const sampleRows = input.sampleRows?.slice(0, 20) ?? [];
    const dataset: Dataset = {
      id: newId("dst"), workspaceId, organizationId: ctx.principal.organizationId, name: input.name, format: input.format,
      rows: sampleRows.length || 100 + Math.floor(rand() * 9900),
      sizeKb: Number((10 + rand() * 4990).toFixed(1)),
      sampleRows, createdAt: new Date().toISOString(),
    };
    await this.repo.insertDataset(dataset);
    await this.bus.publish(Subjects.cerebrostudio.datasetCreated, { datasetId: dataset.id, workspaceId }, { organizationId: dataset.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return dataset;
  }

  listDatasets(ctx: RequestContext, workspaceId: string): Promise<Dataset[]> {
    this.policy.assert(ctx.principal, "cerebrostudio:read", { kind: "dataset", organizationId: ctx.principal.organizationId });
    return this.repo.listDatasets(workspaceId);
  }

  // ---------------- Runs ----------------

  async runPrompt(ctx: RequestContext, promptId: string, input: string): Promise<Run> {
    this.policy.assert(ctx.principal, "cerebrostudio:write", { kind: "run", organizationId: ctx.principal.organizationId });
    const prompt = await this.repo.getPrompt(promptId);
    if (!prompt || prompt.organizationId !== ctx.principal.organizationId) throw PlatformError.notFound("prompt", promptId);
    const rand = seededRandom(`${promptId}:${input}:${Date.now()}`);
    const { output } = interpolate(prompt.template, rand);
    return this.recordRun(ctx, prompt.workspaceId, "prompt", prompt.id, prompt.name, input, output, rand);
  }

  async runAgent(ctx: RequestContext, agentId: string, input: string): Promise<Run> {
    this.policy.assert(ctx.principal, "cerebrostudio:write", { kind: "run", organizationId: ctx.principal.organizationId });
    const agent = await this.repo.getAgent(agentId);
    if (!agent || agent.organizationId !== ctx.principal.organizationId) throw PlatformError.notFound("agent", agentId);
    const rand = seededRandom(`${agentId}:${input}:${Date.now()}`);
    const output = `[${agent.name}] ${SAMPLE_COMPLETIONS[Math.floor(rand() * SAMPLE_COMPLETIONS.length)]}${agent.tools.length ? ` (used tools: ${agent.tools.join(", ")})` : ""}`;
    return this.recordRun(ctx, agent.workspaceId, "agent", agent.id, agent.name, input, output, rand);
  }

  async runFlow(ctx: RequestContext, flowId: string, input: string): Promise<Run> {
    this.policy.assert(ctx.principal, "cerebrostudio:write", { kind: "run", organizationId: ctx.principal.organizationId });
    const flow = await this.repo.getFlow(flowId);
    if (!flow || flow.organizationId !== ctx.principal.organizationId) throw PlatformError.notFound("flow", flowId);
    let current = input;
    const trace: string[] = [];
    for (const step of [...flow.steps].sort((a, b) => a.order - b.order)) {
      const rand = seededRandom(`${flowId}:${step.id}:${current}`);
      if (step.kind === "prompt") {
        const p = await this.repo.getPrompt(step.refId);
        const { output } = interpolate(p?.template ?? current, rand);
        current = output;
        trace.push(`[${p?.name ?? step.refId}] ${output}`);
      } else {
        const a = await this.repo.getAgent(step.refId);
        const output = `${SAMPLE_COMPLETIONS[Math.floor(rand() * SAMPLE_COMPLETIONS.length)]}`;
        current = output;
        trace.push(`[${a?.name ?? step.refId}] ${output}`);
      }
    }
    const rand = seededRandom(`${flowId}:${input}`);
    return this.recordRun(ctx, flow.workspaceId, "flow", flow.id, flow.name, input, trace.join("\n\n"), rand);
  }

  private async recordRun(ctx: RequestContext, workspaceId: string, targetType: Run["targetType"], targetId: string, targetName: string, input: string, output: string, rand: () => number): Promise<Run> {
    const run: Run = {
      id: newId("run"), workspaceId, organizationId: ctx.principal.organizationId,
      targetType, targetId, targetName, input, output,
      tokensUsed: 50 + Math.floor(rand() * 1950), latencyMs: 80 + Math.floor(rand() * 1800),
      status: "completed", createdAt: new Date().toISOString(),
    };
    await this.repo.insertRun(run);
    await this.bus.publish(Subjects.cerebrostudio.runCompleted, { runId: run.id, workspaceId, targetType, targetId }, { organizationId: run.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return run;
  }

  listRuns(ctx: RequestContext, workspaceId: string): Promise<Run[]> {
    this.policy.assert(ctx.principal, "cerebrostudio:read", { kind: "run", organizationId: ctx.principal.organizationId });
    return this.repo.listRuns(workspaceId);
  }
}
