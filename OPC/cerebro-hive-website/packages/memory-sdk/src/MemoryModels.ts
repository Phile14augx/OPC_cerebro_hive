
export type MemoryLayer = 'WORKING' | 'CONVERSATION' | 'TASK' | 'EPISODIC' | 'SEMANTIC';

export interface BaseMemory {
  id: string;
  type: MemoryLayer;
  ownerId: string; // Agent or Workflow ID
  timestamp: string;
  ttl?: number;
  metadata: Record<string, unknown>;
  confidenceScore: number;
}

export interface WorkingMemory extends BaseMemory {
  type: 'WORKING';
  context: Record<string, unknown>;
}

export interface TaskMemory extends BaseMemory {
  type: 'TASK';
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  artifacts: string[]; // Artifact references
  metrics: Record<string, number>;
}

export interface EpisodicMemory extends BaseMemory {
  type: 'EPISODIC';
  executionId: string;
  decision: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  lessonsLearned: string[];
}
