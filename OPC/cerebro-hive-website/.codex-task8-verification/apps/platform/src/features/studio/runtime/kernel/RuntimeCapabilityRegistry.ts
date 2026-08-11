/**
 * M24 — RuntimeCapabilityRegistry
 *
 * Executors register by capability (node type).
 * Future: Python, Docker, REST, SQL, Browser, Agent, Human, MCP, Subflow
 * all register themselves — kernel never changes.
 */
import { StudioNode } from '../../graph/GraphModel';
import { ExecutionContext } from '../execution/ExecutionContext';
import { ExecutionResult } from '../execution/ExecutionResult';
import { TypedValue } from '../routing/ExecutionPortStore';

export interface RuntimeExecutor {
  /** The node types this executor handles. */
  readonly supportedTypes: string[];
  /** Whether this executor can handle the given node. */
  canHandle(node: StudioNode): boolean;
  /** Execute the node. Returns a unified ExecutionResult. */
  execute(
    node: StudioNode,
    context: ExecutionContext,
    inputs: Record<string, TypedValue>,
  ): Promise<ExecutionResult>;
}

export class RuntimeCapabilityRegistry {
  private executors: RuntimeExecutor[] = [];

  register(executor: RuntimeExecutor): void {
    this.executors.push(executor);
  }

  resolve(node: StudioNode): RuntimeExecutor | undefined {
    return this.executors.find(e => e.canHandle(node));
  }

  listCapabilities(): string[] {
    return this.executors.flatMap(e => e.supportedTypes);
  }
}
