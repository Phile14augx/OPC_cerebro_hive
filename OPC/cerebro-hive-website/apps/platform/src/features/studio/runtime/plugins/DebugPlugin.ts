/**
 * M24 — DebugPlugin
 * Manages breakpoints and step-through debugging. Fires debug events.
 */
import { RuntimePlugin } from './RuntimePlugin';
import { StudioNode } from '../../graph/GraphModel';
import { ExecutionContext } from '../execution/ExecutionContext';
import { TypedValue } from '../routing/ExecutionPortStore';

type DebugEventHandler = (event: { type: string; nodeId: string; data?: unknown }) => void;

export class DebugPlugin implements RuntimePlugin {
  readonly id = 'core.debug';
  private breakpoints: Set<string> = new Set();
  private handler?: DebugEventHandler;
  private pauseSignal?: () => void;

  onDebugEvent(handler: DebugEventHandler): void { this.handler = handler; }
  onPause(signal: () => void): void { this.pauseSignal = signal; }
  addBreakpoint(nodeId: string): void { this.breakpoints.add(nodeId); }
  removeBreakpoint(nodeId: string): void { this.breakpoints.delete(nodeId); }

  beforeNode(node: StudioNode, inputs: Record<string, TypedValue>, context: ExecutionContext): void {
    void context;
    if (this.breakpoints.has(node.id)) {
      this.handler?.({ type: 'BreakpointHit', nodeId: node.id, data: { inputs } });
      this.pauseSignal?.();
    }
  }
}
