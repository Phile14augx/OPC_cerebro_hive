import { Goal } from './Goal.js';
import { ExecutionPlan } from './ExecutionPlan.js';
import { PlanScore } from './PlanScore.js';
import { EvaluationPolicy, PolicyDecisionRecord } from './EvaluationPolicy.js';

export interface ScoredPlan {
  plan: ExecutionPlan;
  score: PlanScore;
  ruleResults: import('../governance/GovernanceRule.js').RuleResult[];
  sourcePlanner: string;
}

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
