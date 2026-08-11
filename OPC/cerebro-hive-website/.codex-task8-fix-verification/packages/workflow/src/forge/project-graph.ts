// =============================================================================
// ProjectGraph — in-memory shared state for all forge agents
// Backed by a Map keyed on projectId, synced to Prisma asynchronously
// =============================================================================
import type {
  ForgePhase, ForgeAgentType, AgentStatus, AgentContext,
  ForgePlan, ForgeRequirements, ForgeArchitecture, GeneratedFile,
} from './types';

export class ProjectGraph {
  private graphs = new Map<string, AgentContext>();
  private listeners = new Map<string, Set<(ctx: AgentContext) => void>>();

  // ─── Initialise ───────────────────────────────────────────────────────────
  init(projectId: string, projectName: string, prompt: string): AgentContext {
    const ctx: AgentContext = {
      projectId,
      projectName,
      prompt,
      phase: 'idea',
      generatedFiles: [],
      agentStatuses: {},
    };
    this.graphs.set(projectId, ctx);
    return ctx;
  }

  get(projectId: string): AgentContext | undefined {
    return this.graphs.get(projectId);
  }

  getOrThrow(projectId: string): AgentContext {
    const ctx = this.graphs.get(projectId);
    if (!ctx) throw new Error(`ProjectGraph: no context for project ${projectId}`);
    return ctx;
  }

  // ─── Phase transitions ────────────────────────────────────────────────────
  advancePhase(projectId: string, phase: ForgePhase): AgentContext {
    return this.update(projectId, ctx => ({ ...ctx, phase }));
  }

  // ─── Plan ────────────────────────────────────────────────────────────────
  setPlan(projectId: string, plan: ForgePlan): AgentContext {
    return this.update(projectId, ctx => ({ ...ctx, plan }));
  }

  // ─── Requirements ─────────────────────────────────────────────────────────
  setRequirements(projectId: string, requirements: ForgeRequirements): AgentContext {
    return this.update(projectId, ctx => ({ ...ctx, requirements }));
  }

  // ─── Architecture ─────────────────────────────────────────────────────────
  setArchitecture(projectId: string, architecture: ForgeArchitecture): AgentContext {
    return this.update(projectId, ctx => ({ ...ctx, architecture }));
  }

  // ─── Agent status ─────────────────────────────────────────────────────────
  setAgentStatus(projectId: string, agent: ForgeAgentType, status: AgentStatus): AgentContext {
    return this.update(projectId, ctx => ({
      ...ctx,
      agentStatuses: { ...ctx.agentStatuses, [agent]: status },
    }));
  }

  // ─── Files ────────────────────────────────────────────────────────────────
  addFile(projectId: string, file: GeneratedFile): AgentContext {
    return this.update(projectId, ctx => ({
      ...ctx,
      generatedFiles: [...ctx.generatedFiles.filter(f => f.filePath !== file.filePath), file],
    }));
  }

  updateFileStatus(
    projectId: string,
    filePath: string,
    status: GeneratedFile['status'],
    content?: string,
  ): AgentContext {
    return this.update(projectId, ctx => ({
      ...ctx,
      generatedFiles: ctx.generatedFiles.map(f =>
        f.filePath === filePath
          ? { ...f, status, ...(content !== undefined ? { content, lineCount: content.split('\n').length } : {}) }
          : f,
      ),
    }));
  }

  // ─── Subscribe to changes ─────────────────────────────────────────────────
  subscribe(projectId: string, cb: (ctx: AgentContext) => void): () => void {
    if (!this.listeners.has(projectId)) this.listeners.set(projectId, new Set());
    this.listeners.get(projectId)!.add(cb);
    return () => this.listeners.get(projectId)?.delete(cb);
  }

  // ─── Private ──────────────────────────────────────────────────────────────
  private update(projectId: string, fn: (ctx: AgentContext) => AgentContext): AgentContext {
    const existing = this.graphs.get(projectId);
    if (!existing) throw new Error(`ProjectGraph: no context for project ${projectId}`);
    const next = fn(existing);
    this.graphs.set(projectId, next);
    // notify listeners
    this.listeners.get(projectId)?.forEach(cb => cb(next));
    return next;
  }
}

// Singleton instance — shared across the NestJS DI container
export const projectGraph = new ProjectGraph();
