import { PlannerProvider } from '../plugins/CapabilityProvider';
import { ExecutionContext } from '../context/ExecutionContext';
import { Goal } from './Goal';
import { ExecutionPlan } from './ExecutionPlan';
import { RuntimeRegistry } from '../registry/RuntimeRegistry';
import { EvaluationProvider } from '../plugins/CapabilityProvider';
import { PlanningSession, ScoredPlan } from './PlanningSession';
import { PolicyResolver } from './PolicyResolver';
import { PolicyDecisionRecord } from './EvaluationPolicy';

export class MetaPlanner implements PlannerProvider {
  public async initialize(): Promise<void> {}
  public async dispose(): Promise<void> {}

  public async createPlan(goal: Goal, context: ExecutionContext): Promise<ExecutionPlan> {
    const registry = RuntimeRegistry.getInstance();
    
    // Step 1: Memory Retrieval (Conceptual)
    // Normally query MemoryProvider here.

    const optLevel = goal.optimizationLevel || 'Balanced';

    // Step 2: Generate Candidate Plans
    const candidates: ExecutionPlan[] = [];
    
    const sequentialPlanner = await registry.resolve<PlannerProvider>({ capability: 'PlannerProvider', name: 'SequentialPlanner' });
    const seqPlan = await sequentialPlanner.createPlan(goal, context);
    seqPlan.assumptions.push(`Selected planner archetype: SequentialPlanner`);
    candidates.push(seqPlan);

    if (optLevel !== 'Fast') {
      const reactPlanner = await registry.resolve<PlannerProvider>({ capability: 'PlannerProvider', name: 'ReActPlanner' });
      const reactPlan = await reactPlanner.createPlan(goal, context);
      reactPlan.assumptions.push(`Selected planner archetype: ReActPlanner`);
      candidates.push(reactPlan);
    }

    if (candidates.length === 1) {
      return candidates[0];
    }

    // Step 3: Evaluate Plans using resolved policy
    const activePolicy = PolicyResolver.resolve(goal, context);
    const evaluator = await registry.resolve<EvaluationProvider>({ capability: 'EvaluationProvider' });
    const scoredPlans = await evaluator.evaluatePlans(candidates, goal, context, activePolicy);

    // Step 4: Rank and Select
    scoredPlans.sort((a, b) => b.score.compositeScore - a.score.compositeScore);
    
    // Tie Resolution (simple implementation)
    // If scores are equal, apply the tieResolution strategy from the policy.
    // For now, we just pick the first one since sort is stable, but a real engine would re-evaluate.
    const bestScored = scoredPlans[0];
    
    // Construct Policy Decision Record
    const decisionRecord: PolicyDecisionRecord = {
      id: `pdr-${Date.now()}`,
      appliedPolicies: activePolicy.sourcePolicies,
      compositePolicy: activePolicy,
      decisions: scoredPlans.map(sp => ({
        planId: sp.plan.id,
        compositeScore: sp.score.compositeScore,
        vetoes: sp.score.reasons.filter(r => r.startsWith('Vetoed')),
        reasons: sp.score.reasons.filter(r => !r.startsWith('Vetoed')),
        ruleResults: sp.ruleResults || []
      })),
      selectedPlanId: bestScored.plan.id
    };

    // Optional: Log the Planning Session
    const session: PlanningSession = {
      id: `session-${Date.now()}`,
      goalId: goal.id,
      goal,
      appliedEvaluationPolicy: activePolicy,
      policyDecisionRecord: decisionRecord,
      candidatePlans: scoredPlans,
      decision: {
        selectedPlanId: bestScored.plan.id,
        needsApproval: activePolicy.tieResolution === 'NeedsApproval' && scoredPlans.length > 1 && scoredPlans[0].score.compositeScore === scoredPlans[1].score.compositeScore,
        reasoning: `Selected ${bestScored.sourcePlanner} with highest composite score: ${bestScored.score.compositeScore} using Policy ${activePolicy.name}`
      },
      createdAt: new Date(),
      completedAt: new Date()
    };
    
    // Output Rejected alternatives to the best plan for traceability
    const rejected = scoredPlans.slice(1);
    rejected.forEach(r => {
      bestScored.plan.alternatives.push(`Rejected ${r.sourcePlanner} (Score: ${r.score.compositeScore}). Reasons: ${r.score.reasons.join(', ')}`);
    });

    return bestScored.plan;
  }
}
