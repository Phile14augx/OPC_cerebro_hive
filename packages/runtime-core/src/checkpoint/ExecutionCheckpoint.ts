import { ExecutionContextProps } from '../context/ExecutionContext.js';

export interface CheckpointContract {
  id: string; // UUID
  executionId: string;
  workspaceId: string;
  currentNode?: string; // Node ID
  completedSteps: string[];
  contextSnapshot: ExecutionContextProps; // Serializable version of the context
  variables: Record<string, any>;
  pendingActions: any[];
  eventOffset: number;
  createdAt: Date;
}

export interface CheckpointManager {
  createCheckpoint(
    executionId: string, 
    contextSnapshot: ExecutionContextProps, 
    details: Pick<CheckpointContract, 'currentNode' | 'completedSteps' | 'variables' | 'pendingActions' | 'eventOffset'>
  ): Promise<CheckpointContract>;

  getLatestCheckpoint(executionId: string): Promise<CheckpointContract | null>;
  listCheckpoints(executionId: string): Promise<CheckpointContract[]>;
}
