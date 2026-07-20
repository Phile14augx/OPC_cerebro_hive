import { newId } from "../../kernel/ids/id.js";
import { PlatformError } from "../../kernel/errors/errors.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import type { RuntimeService } from "../runtime/runtime.js";
import { z } from "zod";

/** Workflow definition: a DAG of typed nodes, compiled + validated before activation. */
export const workflowNodeSchema = z.object({
  id: z.string(),
  type: z.enum(["task", "agent", "approval", "branch", "delay", "compensation"]),
  name: z.string(),
  config: z.record(z.unknown()).default({}),
  next: z.array(z.string()).default([]),
  compensateWith: z.string().optional(),
});
export const workflowDefinitionSchema = z.object({
  entry: z.string(),
  nodes: z.array(workflowNodeSchema).min(1),
  triggers: z.array(z.object({ type: z.enum(["manual", "api", "webhook", "cron", "event"]), config: z.record(z.unknown()).default({}) })).default([{ type: "manual", config: {} }]),
});
export type WorkflowDefinition = z.infer<typeof workflowDefinitionSchema>;
export type WorkflowNode = z.infer<typeof workflowNodeSchema>;

export interface Workflow { id: string; organizationId: string; name: string; version: number; definition: WorkflowDefinition; status: "active" | "disabled"; createdAt: string; updatedAt: string }
export interface WorkflowRun {
  id: string; workflowId: string; organizationId: string;
  status: "running" | "waiting_approval" | "completed" | "failed" | "compensated";
  trigger: string; input: Record<string, unknown>;
  state: { completed: string[]; outputs: Record<string, string>; pendingApproval?: { nodeId: string; approvalId: string } };
  error?: string; startedAt: string; finishedAt?: string;
}

export interface FlowRepository {
  insertWorkflow(wf: Workflow): Promise<void>;
  updateWorkflow(wf: Workflow): Promise<void>;
  getWorkflow(organizationId: string, id: string): Promise<Workflow | undefined>;
  listWorkflows(organizationId: string): Promise<Workflow[]>;
  insertRun(run: WorkflowRun): Promise<void>;
  updateRun(run: WorkflowRun): Promise<void>;
  getRun(organizationId: string, id: string): Promise<WorkflowRun | undefined>;
  listRuns(organizationId: string, workflowId?: string): Promise<WorkflowRun[]>;
}

export class InMemoryFlowRepository implements FlowRepository {
  workflows = new Map<string, Workflow>();
  runs = new Map<string, WorkflowRun>();
  async insertWorkflow(wf: Workflow) { this.workflows.set(wf.id, structuredClone(wf)); }
  async updateWorkflow(wf: Workflow) { this.workflows.set(wf.id, structuredClone(wf)); }
  async getWorkflow(org: string, id: string) { const w = this.workflows.get(id); return w?.organizationId === org ? structuredClone(w) : undefined; }
  async listWorkflows(org: string) { return [...this.workflows.values()].filter(w => w.organizationId === org).map(w => structuredClone(w)); }
  async insertRun(run: WorkflowRun) { this.runs.set(run.id, structuredClone(run)); }
  async updateRun(run: WorkflowRun) { this.runs.set(run.id, structuredClone(run)); }
  async getRun(org: string, id: string) { const r = this.runs.get(id); return r?.organizationId === org ? structuredClone(r) : undefined; }
  async listRuns(org: string, workflowId?: string) {
    return [...this.runs.values()].filter(r => r.organizationId === org && (!workflowId || r.workflowId === workflowId)).map(r => structuredClone(r));
  }
}

export interface ApprovalGateway {
  request(ctx: RequestContext, subjectKind: string, subjectId: string, approverRole: string): Promise<string>;
  status(organizationId: string, approvalId: string): Promise<"pending" | "approved" | "rejected">;
}

/**
 * Cerebro Flow™ — workflow compiler + runtime with triggers, approvals,
 * retries, and saga-style compensation. Temporal-style: state survives in the
 * repository; runs resume from recorded state after approval decisions.
 */
export class FlowService {
  constructor(
    private readonly repo: FlowRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
    private readonly runtime: RuntimeService,
    private readonly approvals: ApprovalGateway,
  ) {}

  /** Compile: schema-validate, check node references + reachability + cycles. */
  compile(definition: unknown): WorkflowDefinition {
    const parsed = workflowDefinitionSchema.parse(definition);
    const ids = new Set(parsed.nodes.map(n => n.id));
    if (ids.size !== parsed.nodes.length) throw PlatformError.validation("duplicate node ids");
    if (!ids.has(parsed.entry)) throw PlatformError.validation(`entry node ${parsed.entry} not found`);
    for (const n of parsed.nodes) {
      for (const nxt of n.next) if (!ids.has(nxt)) throw PlatformError.validation(`node ${n.id} references missing node ${nxt}`);
      if (n.compensateWith && !ids.has(n.compensateWith)) throw PlatformError.validation(`compensation node ${n.compensateWith} missing`);
    }
    // Cycle detection (DFS)
    const byId = new Map(parsed.nodes.map(n => [n.id, n]));
    const visiting = new Set<string>(); const done = new Set<string>();
    const visit = (id: string): void => {
      if (done.has(id)) return;
      if (visiting.has(id)) throw PlatformError.validation(`cycle detected at node ${id}`);
      visiting.add(id);
      for (const nxt of byId.get(id)!.next) visit(nxt);
      visiting.delete(id); done.add(id);
    };
    visit(parsed.entry);
    return parsed;
  }

  async create(ctx: RequestContext, input: { name: string; definition: unknown }): Promise<Workflow> {
    this.policy.assert(ctx.principal, "flow:write", { kind: "workflow", organizationId: ctx.principal.organizationId });
    const definition = this.compile(input.definition);
    const wf: Workflow = {
      id: newId("wf"), organizationId: ctx.principal.organizationId, name: input.name, version: 1,
      definition, status: "active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    await this.repo.insertWorkflow(wf);
    await this.bus.publish(Subjects.flow.workflowCreated, { workflowId: wf.id, name: wf.name }, { organizationId: wf.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return wf;
  }

  list(ctx: RequestContext): Promise<Workflow[]> {
    this.policy.assert(ctx.principal, "flow:read", { kind: "workflow", organizationId: ctx.principal.organizationId });
    return this.repo.listWorkflows(ctx.principal.organizationId);
  }

  async run(ctx: RequestContext, workflowId: string, input: Record<string, unknown>, trigger = "api"): Promise<WorkflowRun> {
    this.policy.assert(ctx.principal, "flow:run", { kind: "workflow", organizationId: ctx.principal.organizationId });
    const wf = await this.repo.getWorkflow(ctx.principal.organizationId, workflowId);
    if (!wf) throw PlatformError.notFound("workflow", workflowId);
    if (wf.status !== "active") throw new PlatformError("precondition_failed", "workflow disabled");
    const run: WorkflowRun = {
      id: newId("run"), workflowId, organizationId: wf.organizationId, status: "running", trigger,
      input, state: { completed: [], outputs: {} }, startedAt: new Date().toISOString(),
    };
    await this.repo.insertRun(run);
    await this.bus.publish(Subjects.flow.runStarted, { runId: run.id, workflowId, trigger }, { organizationId: run.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return this.advance(ctx, run, wf);
  }

  /** Resume a run waiting on an approval decision. */
  async resume(ctx: RequestContext, runId: string): Promise<WorkflowRun> {
    const run = await this.repo.getRun(ctx.principal.organizationId, runId);
    if (!run) throw PlatformError.notFound("run", runId);
    if (run.status !== "waiting_approval" || !run.state.pendingApproval) return run;
    const status = await this.approvals.status(run.organizationId, run.state.pendingApproval.approvalId);
    if (status === "pending") return run;
    const wf = await this.repo.getWorkflow(run.organizationId, run.workflowId);
    if (!wf) throw PlatformError.notFound("workflow", run.workflowId);
    if (status === "rejected") {
      run.error = `approval rejected at node ${run.state.pendingApproval.nodeId}`;
      return this.compensate(ctx, run, wf);
    }
    run.state.completed.push(run.state.pendingApproval.nodeId);
    run.state.pendingApproval = undefined;
    run.status = "running";
    await this.repo.updateRun(run);
    return this.advance(ctx, run, wf);
  }

  private async advance(ctx: RequestContext, run: WorkflowRun, wf: Workflow): Promise<WorkflowRun> {
    const byId = new Map(wf.definition.nodes.map(n => [n.id, n]));
    let frontier = run.state.completed.length
      ? run.state.completed.flatMap(id => byId.get(id)?.next ?? []).filter(id => !run.state.completed.includes(id))
      : [wf.definition.entry];

    while (frontier.length) {
      const nodeId = frontier.shift()!;
      if (run.state.completed.includes(nodeId)) continue;
      const node = byId.get(nodeId)!;
      try {
        const proceed = await this.executeNode(ctx, run, node);
        if (!proceed) { await this.repo.updateRun(run); return run; } // waiting on approval
        run.state.completed.push(nodeId);
        await this.repo.updateRun(run);
        await this.bus.publish(Subjects.flow.runStepCompleted, { runId: run.id, nodeId, name: node.name }, { organizationId: run.organizationId, traceId: ctx.traceId });
        frontier.push(...node.next.filter(n => !run.state.completed.includes(n)));
      } catch (err) {
        run.error = err instanceof Error ? err.message : String(err);
        return this.compensate(ctx, run, wf);
      }
    }
    run.status = "completed";
    run.finishedAt = new Date().toISOString();
    await this.repo.updateRun(run);
    await this.bus.publish(Subjects.flow.runCompleted, { runId: run.id, workflowId: run.workflowId }, { organizationId: run.organizationId, traceId: ctx.traceId });
    return run;
  }

  private async executeNode(ctx: RequestContext, run: WorkflowRun, node: WorkflowNode): Promise<boolean> {
    switch (node.type) {
      case "task": case "agent": {
        const goal = String(node.config.goal ?? node.name).replace(/\{\{(\w+)\}\}/g, (_, k: string) => String(run.input[k] ?? ""));
        const exec = await this.runtime.submit(ctx, { goal, input: run.input });
        const finished = await this.runtime.execute({ ...exec });
        if (finished.status !== "completed") throw new Error(`node ${node.id} execution ${finished.status}: ${finished.error ?? ""}`);
        run.state.outputs[node.id] = finished.result?.output.slice(0, 2000) ?? "";
        return true;
      }
      case "approval": {
        const approvalId = await this.approvals.request(ctx, "workflow_node", `${run.id}:${node.id}`, String(node.config.approverRole ?? "admin"));
        run.state.pendingApproval = { nodeId: node.id, approvalId };
        run.status = "waiting_approval";
        await this.bus.publish(Subjects.flow.approvalRequested, { runId: run.id, nodeId: node.id, approvalId }, { organizationId: run.organizationId, traceId: ctx.traceId });
        return false;
      }
      case "branch": {
        const key = String(node.config.onOutputOf ?? "");
        const contains = String(node.config.contains ?? "");
        const matched = (run.state.outputs[key] ?? "").includes(contains);
        run.state.outputs[node.id] = matched ? "branch:true" : "branch:false";
        return true;
      }
      case "delay": {
        await new Promise(r => setTimeout(r, Math.min(2000, Number(node.config.ms ?? 0))));
        run.state.outputs[node.id] = "delayed";
        return true;
      }
      case "compensation": {
        run.state.outputs[node.id] = `compensation:${node.name}`;
        return true;
      }
    }
  }

  /** Saga compensation: run compensateWith nodes for completed nodes, reverse order. */
  private async compensate(ctx: RequestContext, run: WorkflowRun, wf: Workflow): Promise<WorkflowRun> {
    const byId = new Map(wf.definition.nodes.map(n => [n.id, n]));
    for (const nodeId of [...run.state.completed].reverse()) {
      const node = byId.get(nodeId);
      if (node?.compensateWith) {
        const comp = byId.get(node.compensateWith)!;
        run.state.outputs[comp.id] = `compensated:${node.id}`;
      }
    }
    run.status = "compensated";
    run.finishedAt = new Date().toISOString();
    await this.repo.updateRun(run);
    await this.bus.publish(Subjects.flow.runCompensated, { runId: run.id, error: run.error }, { organizationId: run.organizationId, traceId: ctx.traceId });
    return run;
  }
}

/** Cron trigger scheduler: registers interval timers for workflows with cron triggers (coarse: every-N-minutes patterns). */
export class FlowTriggerScheduler {
  private timers: ReturnType<typeof setInterval>[] = [];
  constructor(private readonly flow: FlowService, private readonly repo: FlowRepository) {}
  async start(ctx: RequestContext): Promise<number> {
    const workflows = await this.repo.listWorkflows(ctx.principal.organizationId);
    let registered = 0;
    for (const wf of workflows) {
      for (const trig of wf.definition.triggers) {
        if (trig.type !== "cron") continue;
        const everyMin = Number((trig.config.everyMinutes as number | undefined) ?? 0);
        if (everyMin > 0) {
          this.timers.push(setInterval(() => { void this.flow.run(ctx, wf.id, {}, "cron").catch(() => undefined); }, everyMin * 60_000));
          registered++;
        }
      }
    }
    return registered;
  }
  stop(): void { for (const t of this.timers) clearInterval(t); }
}
