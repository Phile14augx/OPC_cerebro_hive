
export interface ReasoningSummary {
  strategy: string;
  branchesExplored: number;
  selectedPath: string;
  confidence: number;
  rationale: string;
  metrics: Record<string, number>;
}

export interface ReasoningStrategy {
  name: string;
  initialize(inputs: unknown): Promise<void>;
  execute(): Promise<void>;
  evaluate(): Promise<void>;
  finalize(): Promise<ReasoningSummary>;
}

export const ReasoningEvents = {
  REASONING_STARTED: 'REASONING_STARTED',
  STRATEGY_SELECTED: 'STRATEGY_SELECTED',
  BRANCH_EXPANDED: 'BRANCH_EXPANDED',
  BRANCH_PRUNED: 'BRANCH_PRUNED',
  DEBATE_ROUND_COMPLETED: 'DEBATE_ROUND_COMPLETED',
  CONSENSUS_REACHED: 'CONSENSUS_REACHED',
  REASONING_COMPLETED: 'REASONING_COMPLETED'
};
