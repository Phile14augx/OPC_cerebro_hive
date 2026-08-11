/**
 * M24 — InputResolver
 *
 * Resolves a node's input values by walking graph edges and reading
 * from the ExecutionPortStore. Future routing logic (fan-in, merges,
 * default values, optional inputs) lives here — not in the runtime.
 */
import { StudioNode } from '../../graph/GraphModel';
import { ExecutionContext } from '../execution/ExecutionContext';
import { TypedValue, ExecutionPortStore } from './ExecutionPortStore';
import { Types } from '../../compiler/types/TypeSystem';

export class InputResolver {
  static resolve(
    node: StudioNode,
    stageId: string,
    context: ExecutionContext,
    portStore: ExecutionPortStore,
  ): Record<string, TypedValue> {
    const inputs: Record<string, TypedValue> = {};
    const incomingEdges = context.graph.edges.filter(e => e.target === node.id);

    for (const edge of incomingEdges) {
      // Find the stage the source node belongs to
      const sourceStageId = context.executionPlan.stages
        .find(s => s.nodes.includes(edge.source))?.id ?? stageId;

      const value = portStore.read({
        executionId: context.executionId,
        stageId: sourceStageId,
        nodeId: edge.source,
        portId: edge.sourcePort ?? 'output',
      });

      const targetPortId = edge.targetPort ?? 'input';
      inputs[targetPortId] = value ?? {
        type: Types.Unknown,
        value: null,
        timestamp: Date.now(),
      };
    }
    return inputs;
  }
}
