import { Goal } from './Goal';
import { ExecutionPlan } from './ExecutionPlan';
import { PlanScore } from './PlanScore';
import { EvaluationPolicy, PolicyDecisionRecord } from './EvaluationPolicy';

export interface ScoredPlan {
  plan: ExecutionPlan;
  score: PlanScore;
  ruleResults: import('../governance/GovernanceRule').RuleResult[];
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
