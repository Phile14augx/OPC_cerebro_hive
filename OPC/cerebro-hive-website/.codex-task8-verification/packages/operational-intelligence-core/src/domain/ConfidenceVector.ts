export interface ConfidenceVector {
  reliability: number; // Probability of Success
  speed: number;       // Normalized MTTR
  safety: number;      // Inverse probability of rollback/blast radius increase
  cost: number;        // Normalized resource efficiency
  operatorTrust: number; // Based on manual override frequency
  
  compositeScore: number; // Weighted average based on Policy defaults
}
