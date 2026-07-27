/**
 * M24 — OutputRouter
 *
 * Routes a node's output into the ExecutionPortStore.
 * Future fan-out, transforms, and type coercions live here.
 */
import { StudioNode } from '../../graph/GraphModel';
import { ExecutionContext } from '../execution/ExecutionContext';
import { TypedValue, ExecutionPortStore } from './ExecutionPortStore';

export class OutputRouter {
  static route(
    node: StudioNode,
    stageId: string,
    portId: string,
    value: TypedValue,
    context: ExecutionContext,
    portStore: ExecutionPortStore,
  ): void {
    portStore.write(
      {
        executionId: context.executionId,
        stageId,
        nodeId: node.id,
        portId,
      },
      value,
    );
  }
}
