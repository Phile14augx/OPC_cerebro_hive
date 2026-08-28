import { ExecutionPlan } from './ExecutionPlan';
import { PlanScore } from './PlanScore';

export interface ScoredPlan {
  plan: ExecutionPlan;
  score: PlanScore;
  ruleResults: import('../governance/GovernanceRule').RuleResult[];
  sourcePlanner: string;
}
