/**
 * @module runtime-core/execution
 * ExecutionRun — a single attempt to complete a Task.
 *
 * Mission → Task → ExecutionRun (1:N per task retry).
 * This separation enables clean retry semantics, fine-grained cost
 * attribution, and replay/lineage without conflating attempt history.
 */

import { randomUUID } from "crypto";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ExecutionStatus =
  | "created"
  | "initializing"
  | "running"
  | "waiting_tool"
  | "waiting_approval"
  | "completed"
  | "failed"
  | "timed_out"
  | "cancelled";

export interface ModelInvocationRecord {
  invocationId: string;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs: number;
  timestamp: string;
}

export interface ToolInvocationRecord {
  invocationId: string;
  toolId: string;
  toolName: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  durationMs: number;
  costUsd: number;
  timestamp: string;
  /** Result of policy check before execution. */
  policyDecision: "allow" | "deny" | "require_approval";
}

export interface ExecutionStep {
  stepId: string;
  stepIndex: number;
  type: "think" | "tool_call" | "model_call" | "delegation" | "checkpoint" | "human_turn";
  description: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  durationMs: number;
  timestamp: string;
}

export interface ResourceUsageSummary {
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  totalCostUsd: number;
  toolCallsMade: number;
  modelCallsMade: number;
  iterations: number;
  wallClockMs: number;
}

export interface ExecutionRun {
  id: string;
  taskId: string;
  missionId: string;
  agentDefinitionId: string;
  agentInstanceId: string;
  /** 1-based; increments on each retry. */
  attemptNumber: number;
  status: ExecutionStatus;
  modelInvocations: ModelInvocationRecord[];
  toolInvocations: ToolInvocationRecord[];
  steps: ExecutionStep[];
  usage: ResourceUsageSummary;
  /** Final output produced on success. */
  output?: Record<string, unknown>;
  /** Error detail on failure. */
  error?: string;
  /** Opaque checkpoint reference for resumable execution. */
  checkpointRef?: string;
  traceId: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createExecutionRun(input: {
  taskId: string;
  missionId: string;
  agentDefinitionId: string;
  agentInstanceId: string;
  attemptNumber: number;
  traceId?: string;
}): ExecutionRun {
  const now = new Date().toISOString();
  const emptyUsage: ResourceUsageSummary = {
    totalTokens: 0,
    inputTokens: 0,
    outputTokens: 0,
    totalCostUsd: 0,
    toolCallsMade: 0,
    modelCallsMade: 0,
    iterations: 0,
    wallClockMs: 0,
  };
  return {
    id: `run_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
    taskId: input.taskId,
    missionId: input.missionId,
    agentDefinitionId: input.agentDefinitionId,
    agentInstanceId: input.agentInstanceId,
    attemptNumber: input.attemptNumber,
    status: "created",
    modelInvocations: [],
    toolInvocations: [],
    steps: [],
    usage: emptyUsage,
    traceId: input.traceId ?? randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
}

// ---------------------------------------------------------------------------
// Reducer — pure functions for accumulating run state
// ---------------------------------------------------------------------------

export function recordModelCall(
  run: ExecutionRun,
  call: Omit<ModelInvocationRecord, "invocationId">,
): ExecutionRun {
  const inv: ModelInvocationRecord = {
    ...call,
    invocationId: `minv_${randomUUID().slice(0, 8)}`,
  };
  const u = run.usage;
  return {
    ...run,
    modelInvocations: [...run.modelInvocations, inv],
    usage: {
      ...u,
      totalTokens:    u.totalTokens    + inv.inputTokens + inv.outputTokens,
      inputTokens:    u.inputTokens    + inv.inputTokens,
      outputTokens:   u.outputTokens   + inv.outputTokens,
      totalCostUsd:   u.totalCostUsd   + inv.costUsd,
      modelCallsMade: u.modelCallsMade + 1,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function recordToolCall(
  run: ExecutionRun,
  call: Omit<ToolInvocationRecord, "invocationId">,
): ExecutionRun {
  const inv: ToolInvocationRecord = {
    ...call,
    invocationId: `tinv_${randomUUID().slice(0, 8)}`,
  };
  const u = run.usage;
  return {
    ...run,
    toolInvocations: [...run.toolInvocations, inv],
    usage: {
      ...u,
      totalCostUsd:  u.totalCostUsd  + inv.costUsd,
      toolCallsMade: u.toolCallsMade + 1,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function addExecutionStep(
  run: ExecutionRun,
  step: Omit<ExecutionStep, "stepId" | "stepIndex">,
): ExecutionRun {
  const s: ExecutionStep = {
    ...step,
    stepId:    `step_${randomUUID().slice(0, 8)}`,
    stepIndex: run.steps.length,
  };
  return {
    ...run,
    steps: [...run.steps, s],
    usage: { ...run.usage, iterations: run.usage.iterations + 1 },
    updatedAt: new Date().toISOString(),
  };
}

export function completeRun(
  run: ExecutionRun,
  output: Record<string, unknown>,
): ExecutionRun {
  const now = new Date().toISOString();
  const startMs = run.startedAt ? new Date(run.startedAt).getTime() : Date.now();
  return {
    ...run,
    status: "completed",
    output,
    completedAt: now,
    updatedAt: now,
    usage: {
      ...run.usage,
      wallClockMs: Date.now() - startMs,
    },
  };
}

export function failRun(run: ExecutionRun, error: string): ExecutionRun {
  const now = new Date().toISOString();
  const startMs = run.startedAt ? new Date(run.startedAt).getTime() : Date.now();
  return {
    ...run,
    status: "failed",
    error,
    completedAt: now,
    updatedAt: now,
    usage: { ...run.usage, wallClockMs: Date.now() - startMs },
  };
}

// ---------------------------------------------------------------------------
// In-memory repository
// ---------------------------------------------------------------------------

class ExecutionRunRepository {
  private readonly runs = new Map<string, ExecutionRun>();

  add(run: ExecutionRun): void { this.runs.set(run.id, run); }

  get(id: string): ExecutionRun | undefined { return this.runs.get(id); }

  getRequired(id: string): ExecutionRun {
    const r = this.runs.get(id);
    if (!r) throw new Error(`ExecutionRun '${id}' not found`);
    return r;
  }

  update(run: ExecutionRun): void {
    this.runs.set(run.id, { ...run, updatedAt: new Date().toISOString() });
  }

  listByTask(taskId: string): ExecutionRun[] {
    return [...this.runs.values()]
      .filter(r => r.taskId === taskId)
      .sort((a, b) => a.attemptNumber - b.attemptNumber);
  }

  listByMission(missionId: string): ExecutionRun[] {
    return [...this.runs.values()]
      .filter(r => r.missionId === missionId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  all(): ExecutionRun[] { return [...this.runs.values()]; }
}

export const executionRepository = new ExecutionRunRepository();
