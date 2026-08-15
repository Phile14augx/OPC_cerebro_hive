import { ExecutionEvent, ExecutionSnapshot } from '@cerebro/runtime-contracts';
import { ExecutionState } from './ExecutionStateMachine.js';
import { ExecutionCheckpoint } from './ExecutionCheckpoint.js';

export interface ExecutionOutboxEntry {
  id: string;
  type: string;
  payload: any;
  dispatched: boolean;
  createdAt: Date;
}

export interface ExecutionRecord {
  id: string;
  agentId: string;
  agentVersionId: string;
  status: ExecutionState;
  version: number; // Optimistic concurrency version
  startedAt: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

export interface ExecutionStore {
  /** Creates a new execution record */
  createExecution(execution: Omit<ExecutionRecord, 'version'>): Promise<ExecutionRecord>;

  /** 
   * Updates execution status/metadata using optimistic concurrency control and Lease Fencing.
   * Throws an error if the current version doesn't match `expectedVersion`.
   * Throws an error if the `fencingToken` does not match the active lease for the execution.
   */
  updateExecution(
    id: string,
    updates: Partial<Omit<ExecutionRecord, 'id' | 'version'>>,
    expectedVersion: number,
    fencingToken: bigint
  ): Promise<ExecutionRecord>;

  getExecution(id: string): Promise<ExecutionRecord | null>;

  /** Appends a sequence of events. Throws if a sequence number conflict occurs, or if fencingToken is invalid. */
  appendEvents(
    executionId: string, 
    events: ExecutionEvent<any>[], 
    fencingToken: bigint,
    outboxEntries?: ExecutionOutboxEntry[]
  ): Promise<void>;

  /** Retrieves all events for an execution strictly ordered by sequence. */
  getEvents(executionId: string, afterSequence?: bigint): Promise<ExecutionEvent<any>[]>;

  /** Stores a state snapshot, guarded by the fencing token */
  saveSnapshot(snapshot: ExecutionSnapshot, fencingToken: bigint, hash: string): Promise<void>;

  /** Retrieves the latest snapshot for an execution */
  getLatestSnapshot(executionId: string): Promise<ExecutionSnapshot | null>;

  /** Saves a provider interaction checkpoint, guarded by the fencing token */
  saveCheckpoint(checkpoint: ExecutionCheckpoint, fencingToken: bigint): Promise<void>;
}
