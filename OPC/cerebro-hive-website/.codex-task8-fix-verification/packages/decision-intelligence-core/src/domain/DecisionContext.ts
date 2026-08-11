export interface DecisionContext {
  contextId: string;
  objectives: {
    maximize: ('Availability' | 'Compliance' | 'Performance')[];
    minimize: ('Cost' | 'RecoveryTime' | 'BlastRadius')[];
  };
  weights: {
    Availability: number;
    Compliance: number;
    Performance: number;
    Cost: number;
    RecoveryTime: number;
    BlastRadius: number;
  };
}
