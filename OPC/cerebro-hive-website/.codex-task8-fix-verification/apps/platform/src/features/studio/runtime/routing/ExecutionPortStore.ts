/**
 * M24 — ExecutionPortStore
 *
 * Scoped key-value store for inter-node data propagation.
 * Key format: executionId / stageId / nodeId / portId
 * Prevents collisions across parallel or nested executions.
 */
import { DataType } from '../../compiler/types/TypeSystem';

export interface TypedValue {
  type: DataType;
  value: unknown;
  timestamp: number;
}

export interface ExecutionPortAddress {
  executionId: string;
  stageId: string;
  nodeId: string;
  portId: string;
}

function toKey(addr: ExecutionPortAddress): string {
  return `${addr.executionId}::${addr.stageId}::${addr.nodeId}::${addr.portId}`;
}

export class ExecutionPortStore {
  private slots: Map<string, TypedValue> = new Map();

  write(addr: ExecutionPortAddress, value: TypedValue): void {
    this.slots.set(toKey(addr), value);
  }

  read(addr: ExecutionPortAddress): TypedValue | undefined {
    return this.slots.get(toKey(addr));
  }

  /** All values for a given nodeId across all ports and stages. */
  readAllForNode(executionId: string, nodeId: string): TypedValue[] {
    const results: TypedValue[] = [];
    for (const [key, val] of this.slots) {
      if (key.startsWith(`${executionId}::`) && key.includes(`::${nodeId}::`)) {
        results.push(val);
      }
    }
    return results;
  }

  /** Deep-clone of all current slots — used for snapshotting. */
  snapshot(): Record<string, TypedValue> {
    const out: Record<string, TypedValue> = {};
    this.slots.forEach((v, k) => { out[k] = JSON.parse(JSON.stringify(v)); });
    return out;
  }

  clear(): void { this.slots.clear(); }
}
