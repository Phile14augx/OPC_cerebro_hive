import { ExecutionEvent } from '../../../runtime-contracts/src/events/ExecutionEvent';
import { ExecutionSnapshot } from '../../../runtime-contracts/src/snapshots/ExecutionSnapshot';
import { ExecutionState } from './ExecutionStateMachine';
import { ExecutionCheckpoint } from './ExecutionCheckpoint';

export interface ExecutionOutboxEntry<TPayload = unknown> {
  id: string;
  type: string;
  payload: TPayload;
  dispatched: boolean;
  createdAt: Date;
}

export interface ExecutionRecord<TMetadata extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  agentId: string;
  agentVersionId: string;
  status: ExecutionState;
  version: number; // Optimistic concurrency version
  startedAt: Date;
  completedAt?: Date;
  metadata?: TMetadata;
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
    events: ExecutionEvent<unknown>[], 
    fencingToken: bigint,
    outboxEntries?: ExecutionOutboxEntry[]
  ): Promise<void>;

  /** Retrieves all events for an execution strictly ordered by sequence. */
  getEvents(executionId: string, afterSequence?: bigint): Promise<ExecutionEvent<unknown>[]>;

  /** Stores a state snapshot, guarded by the fencing token */
  saveSnapshot(snapshot: ExecutionSnapshot, fencingToken: bigint, hash: string): Promise<void>;

  /** Retrieves the latest snapshot for an execution */
  getLatestSnapshot(executionId: string): Promise<ExecutionSnapshot | null>;

  /** Saves a provider interaction checkpoint, guarded by the fencing token */
  saveCheckpoint(checkpoint: ExecutionCheckpoint, fencingToken: bigint): Promise<void>;
}
