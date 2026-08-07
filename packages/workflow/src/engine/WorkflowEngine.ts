/**
 * CerebroFlow — Workflow Execution Engine
 * State-machine driven DAG executor with suspend/resume for human-in-the-loop.
 * Primary AI: Claude | Engineering implementation: Codex
 */

import type {
  WorkflowDSL, NodeConfig, ExecutionContext, ExecutionResult,
  ExecutionStatus, NodeExecutionStatus, ConditionExpression,
  ConditionOperator,
} from '../dsl/types.js';

// ─── Context Helpers ──────────────────────────────────────────────────────────

function interpolate(template: string, ctx: ExecutionContext): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, path: string) => {
    const keys = path.trim().split('.');
    let val: unknown = ctx.variables;
    for (const k of keys) {
      if (val == null || typeof val !== 'object') return '';
      val = (val as Record<string, unknown>)[k];
    }
    return val != null ? String(val) : '';
  });
}

function evaluateCondition(
  expr: ConditionExpression,
  ctx: ExecutionContext,
): boolean {
  const left = interpolate(String(expr.left), ctx);
  const right = expr.right != null ? interpolate(String(expr.right), ctx) : null;

  const ops: Record<ConditionOperator, () => boolean> = {
    eq: () => left === right,
    neq: () => left !== right,
    gt: () => parseFloat(left) > parseFloat(right ?? '0'),
    gte: () => parseFloat(left) >= parseFloat(right ?? '0'),
    lt: () => parseFloat(left) < parseFloat(right ?? '0'),
    lte: () => parseFloat(left) <= parseFloat(right ?? '0'),
    contains: () => left.includes(right ?? ''),
    not_contains: () => !left.includes(right ?? ''),
    starts_with: () => left.startsWith(right ?? ''),
    is_null: () => left === '' || left === 'null' || left === 'undefined',
    is_not_null: () => left !== '' && left !== 'null' && left !== 'undefined',
    in: () => (right ?? '').split(',').map(s => s.trim()).includes(left),
    not_in: () => !(right ?? '').split(',').map(s => s.trim()).includes(left),
  };

  const result = ops[expr.operator]?.() ?? false;
  if (expr.and?.length) return result && expr.and.every(e => evaluateCondition(e, ctx));
  if (expr.or?.length) return result || expr.or.some(e => evaluateCondition(e, ctx));
  return result;
}

// ─── Node Runner Interface ────────────────────────────────────────────────────

export interface NodeRunner {
  run(node: NodeConfig, ctx: ExecutionContext): Promise<unknown>;
}

// ─── Workflow Engine ──────────────────────────────────────────────────────────

export interface WorkflowEngineOptions {
  runners: Record<string, NodeRunner>;
  onNodeStart?: (nodeId: string, ctx: ExecutionContext) => Promise<void>;
  onNodeComplete?: (nodeId: string, output: unknown, ctx: ExecutionContext) => Promise<void>;
  onNodeError?: (nodeId: string, error: Error, ctx: ExecutionContext) => Promise<void>;
  onSuspend?: (executionId: string, nodeId: string, ctx: ExecutionContext) => Promise<void>;
  onAudit?: (event: AuditEvent) => Promise<void>;
}

export interface AuditEvent {
  executionId: string;
  workflowId: string;
  nodeId?: string;
  event: 'execution_started' | 'node_started' | 'node_completed' | 'node_failed'
       | 'execution_suspended' | 'execution_resumed' | 'execution_completed' | 'execution_failed';
  timestamp: Date;
  data?: Record<string, unknown>;
}

export class WorkflowEngine {
  constructor(private readonly opts: WorkflowEngineOptions) {}

  async execute(
    workflow: WorkflowDSL,
    ctx: ExecutionContext,
    resumeFromNode?: string,
  ): Promise<ExecutionResult> {
    const start = Date.now();
    await this.audit(ctx, { event: 'execution_started' });

    try {
      const execOrder = this.topologicalSort(workflow, resumeFromNode);
      for (const nodeId of execOrder) {
        const node = workflow.nodes.find(n => n.id === nodeId);
        if (!node) continue;

        // Skip already-completed nodes on resume
        if (resumeFromNode && ctx.nodeStatuses[nodeId]?.status === 'completed') continue;

        const result = await this.runNode(node, ctx, workflow);
        if (result === 'suspended') {
          return this.buildResult(ctx, 'suspended', Date.now() - start);
        }
        if (result === 'failed') {
          return this.buildResult(ctx, 'failed', Date.now() - start);
        }
      }

      await this.audit(ctx, { event: 'execution_completed' });
      return this.buildResult(ctx, 'completed', Date.now() - start);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      await this.audit(ctx, { event: 'execution_failed', data: { message: error.message } });
      return this.buildResult(ctx, 'failed', Date.now() - start, error);
    }
  }

  private async runNode(
    node: NodeConfig,
    ctx: ExecutionContext,
    workflow: WorkflowDSL,
  ): Promise<'ok' | 'suspended' | 'failed'> {
    const maxAttempts = node.retry?.max_attempts ?? 1;
    let attempt = 0;

    while (attempt < maxAttempts) {
      attempt++;
      ctx.nodeStatuses[node.id] = {
        nodeId: node.id,
        status: 'running',
        startedAt: new Date(),
        retryCount: attempt - 1,
      };
      await this.opts.onNodeStart?.(node.id, ctx);
      await this.audit(ctx, { event: 'node_started', nodeId: node.id });

      try {
        // Handle condition branching
        if (node.config.kind === 'condition') {
          const result = evaluateCondition(node.config.expression, ctx);
          const nextIds = result ? node.config.true_path : node.config.false_path;
          ctx.variables[`${node.id}_result`] = result;
          ctx.variables[`${node.id}_branch`] = result ? 'true' : 'false';
          this.markComplete(node.id, result, ctx);
          await this.audit(ctx, { event: 'node_completed', nodeId: node.id, data: { branch: result } });

          // Skip nodes NOT in the active branch
          const allBranchIds = [...node.config.true_path, ...node.config.false_path];
          const skipIds = allBranchIds.filter(id => !nextIds.includes(id));
          for (const id of skipIds) {
            ctx.nodeStatuses[id] = { nodeId: id, status: 'cancelled', retryCount: 0 };
          }
          return 'ok';
        }

        // Human approval → suspend
        if (node.config.kind === 'human_approval') {
          ctx.nodeStatuses[node.id] = { nodeId: node.id, status: 'suspended', startedAt: new Date(), retryCount: 0 };
          await this.opts.onSuspend?.(ctx.executionId, node.id, ctx);
          await this.audit(ctx, { event: 'execution_suspended', nodeId: node.id });
          return 'suspended';
        }

        const runner = this.opts.runners[node.config.kind];
        if (!runner) throw new Error(`No runner registered for node kind: ${node.config.kind}`);

        const output = await runner.run(node, ctx);

        // Store output in context variables if the node declares an output_variable
        if ('output_variable' in node.config && node.config.output_variable) {
          ctx.variables[node.config.output_variable] = output;
        }

        this.markComplete(node.id, output, ctx);
        await this.opts.onNodeComplete?.(node.id, output, ctx);
        await this.audit(ctx, { event: 'node_completed', nodeId: node.id });
        return 'ok';
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        await this.opts.onNodeError?.(node.id, error, ctx);
        await this.audit(ctx, { event: 'node_failed', nodeId: node.id, data: { error: error.message, attempt } });

        if (attempt >= maxAttempts) {
          const onError = node.on_error ?? workflow.error_handling.default_on_error;
          ctx.nodeStatuses[node.id] = {
            nodeId: node.id, status: 'failed',
            startedAt: ctx.nodeStatuses[node.id]?.startedAt,
            completedAt: new Date(), retryCount: attempt - 1, error: error.message,
          };

          if (onError === 'dead_letter') {
            ctx.nodeStatuses[node.id].status = 'dead_lettered';
            return 'failed';
          }
          if (onError === 'skip') return 'ok';
          return 'failed';
        }

        // Retry delay
        const delay = this.calculateDelay(attempt, node.retry);
        await new Promise(res => setTimeout(res, delay));
      }
    }
    return 'failed';
  }

  private markComplete(nodeId: string, output: unknown, ctx: ExecutionContext) {
    ctx.nodeStatuses[nodeId] = {
      ...ctx.nodeStatuses[nodeId],
      nodeId,
      status: 'completed',
      completedAt: new Date(),
      output,
      retryCount: ctx.nodeStatuses[nodeId]?.retryCount ?? 0,
    };
  }

  private topologicalSort(workflow: WorkflowDSL, startFrom?: string): string[] {
    const nodes = workflow.nodes;
    const visited = new Set<string>();
    const order: string[] = [];

    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      const node = nodes.find(n => n.id === nodeId);
      if (node?.depends_on) {
        for (const dep of node.depends_on) visit(dep);
      }
      order.push(nodeId);
    };

    if (startFrom) {
      visit(startFrom);
      // Include all nodes that depend on startFrom transitively
      for (const n of nodes) if (!visited.has(n.id)) visit(n.id);
    } else {
      for (const n of nodes) visit(n.id);
    }

    return order;
  }

  private calculateDelay(attempt: number, retry?: { strategy?: string; delay_seconds?: number }): number {
    if (!retry) return 1000;
    const base = (retry.delay_seconds ?? 1) * 1000;
    if (retry.strategy === 'exponential') return base * Math.pow(2, attempt - 1);
    if (retry.strategy === 'fibonacci') {
      const fib = [1, 1, 2, 3, 5, 8, 13, 21];
      return base * (fib[Math.min(attempt - 1, fib.length - 1)] ?? 1);
    }
    return base;
  }

  private buildResult(
    ctx: ExecutionContext,
    status: ExecutionStatus,
    durationMs: number,
    error?: Error,
  ): ExecutionResult {
    const failedNode = Object.values(ctx.nodeStatuses).find(n => n.status === 'failed');
    return {
      executionId: ctx.executionId,
      status,
      durationMs,
      output: ctx.variables,
      nodeResults: Object.values(ctx.nodeStatuses),
      error: error || failedNode ? {
        nodeId: failedNode?.nodeId ?? 'unknown',
        message: error?.message ?? failedNode?.error ?? 'Unknown error',
        code: 'EXECUTION_FAILED',
        retryable: false,
        deadLettered: failedNode?.status === 'dead_lettered',
      } : undefined,
    };
  }

  private async audit(ctx: ExecutionContext, partial: Partial<AuditEvent>) {
    await this.opts.onAudit?.({
      executionId: ctx.executionId,
      workflowId: ctx.workflowId,
      timestamp: new Date(),
      ...partial,
    } as AuditEvent);
  }
}
