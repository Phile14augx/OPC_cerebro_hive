/**
 * M24 — RuntimePlugin Interface
 *
 * Every new cross-cutting feature installs as a plugin.
 * The kernel never changes — plugins absorb all future capabilities.
 *
 * Hook order:
 *   beforeExecution → [per node: beforeNode → afterNode] → afterExecution
 */
import { StudioNode } from '../../graph/GraphModel';
import { ExecutionContext } from '../execution/ExecutionContext';
import { ExecutionResult } from '../execution/ExecutionResult';
import { TypedValue } from '../routing/ExecutionPortStore';

export interface RuntimePlugin {
  readonly id: string;

  /** Called once before the execution loop begins. */
  beforeExecution?(context: ExecutionContext): void | Promise<void>;

  /** Called before each node executes. Can mutate inputs. */
  beforeNode?(
    node: StudioNode,
    inputs: Record<string, TypedValue>,
    context: ExecutionContext,
  ): void | Promise<void>;

  /** Called after each node executes. Can observe/mutate the result. */
  afterNode?(
    node: StudioNode,
    result: ExecutionResult,
    context: ExecutionContext,
  ): void | Promise<void>;

  /** Called once after the execution loop ends (success, error, or cancel). */
  afterExecution?(context: ExecutionContext): void | Promise<void>;
}

export class PluginPipeline {
  private plugins: RuntimePlugin[] = [];

  install(plugin: RuntimePlugin): void { this.plugins.push(plugin); }

  async runBeforeExecution(ctx: ExecutionContext): Promise<void> {
    for (const p of this.plugins) await p.beforeExecution?.(ctx);
  }

  async runBeforeNode(node: StudioNode, inputs: Record<string, TypedValue>, ctx: ExecutionContext): Promise<void> {
    for (const p of this.plugins) await p.beforeNode?.(node, inputs, ctx);
  }

  async runAfterNode(node: StudioNode, result: ExecutionResult, ctx: ExecutionContext): Promise<void> {
    for (const p of this.plugins) await p.afterNode?.(node, result, ctx);
  }

  async runAfterExecution(ctx: ExecutionContext): Promise<void> {
    for (const p of this.plugins) await p.afterExecution?.(ctx);
  }
}
