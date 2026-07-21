/**
 * FinOps Cost Abstraction Model
 */

export interface CostEstimate {
  amount: number;
  currency: string;
  billingPeriod: "hourly" | "monthly" | "yearly";
}

export interface ResourceCostModel {
  estimatedCost: CostEstimate;
  committedCost?: CostEstimate; // e.g., Reserved Instances
  observedCost?: CostEstimate;  // Actual billing API value
  optimizedCost?: CostEstimate; // AI/FinOps recommendation value
  
  breakdown: {
    compute?: number;
    storage?: number;
    networkEgress?: number;
    licensing?: number;
  };
}
