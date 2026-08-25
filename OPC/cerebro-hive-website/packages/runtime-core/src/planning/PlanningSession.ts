import { Goal } from './Goal';
import { EvaluationPolicy, PolicyDecisionRecord } from './EvaluationPolicy';

import { ScoredPlan } from './types';
export type { ScoredPlan };

export interface PlanningSession {
  id: string;
  goalId: string;
  goal: Goal;
  
  policyDecisionRecord?: PolicyDecisionRecord;
  appliedEvaluationPolicy: EvaluationPolicy;
  
  candidatePlans: ScoredPlan[];
  
  // The decision made by the system or human
  decision: {
    selectedPlanId?: string;
    needsApproval: boolean;
    reasoning: string;
  };
  
  createdAt: Date;
  completedAt?: Date;
}
