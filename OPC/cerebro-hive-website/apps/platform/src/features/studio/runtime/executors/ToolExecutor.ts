/**
 * M24 — ToolExecutor (stub)
 *
 * Placeholder for Tool, REST, SQL, Browser, MCP, and subflow node types.
 * Registers the capability so the kernel resolves gracefully.
 * Full implementation: M25+.
 */
import { RuntimeExecutor } from '../kernel/RuntimeCapabilityRegistry';
import { StudioNode } from '../../graph/GraphModel';
import { ExecutionContext } from '../execution/ExecutionContext';
import { ExecutionResult, ok } from '../execution/ExecutionResult';
import { TypedValue } from '../routing/ExecutionPortStore';
import { Types } from '../../compiler/types/TypeSystem';

const TOOL_TYPES = ['Tool', 'HttpRequest', 'SqlQuery', 'BrowserAction', 'McpCall', 'Subflow'];

export class ToolExecutor implements RuntimeExecutor {
  readonly supportedTypes = TOOL_TYPES;
  canHandle(node: StudioNode): boolean { return TOOL_TYPES.includes(node.type); }

  async execute(node: StudioNode, context: ExecutionContext, _inputs: Record<string, TypedValue>): Promise<ExecutionResult> {
    void _inputs;
    context.logger(`[ToolExecutor] Stub executing node type "${node.type}" — full implementation in M25`);
    return ok(
      { stub: true, nodeType: node.type },
      Types.JSON,
      { durationMs: 0, warnings: [`ToolExecutor for "${node.type}" is a stub — implement in M25`] },
    );
  }
}
