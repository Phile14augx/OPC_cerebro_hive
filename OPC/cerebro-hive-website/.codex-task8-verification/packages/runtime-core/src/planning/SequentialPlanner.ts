import { PlannerProvider } from '../plugins/CapabilityProvider';
import { ExecutionContext } from '../context/ExecutionContext';
import { Goal } from './Goal';
import { ExecutionPlan, ExecutionNode } from './ExecutionPlan';

export class SequentialPlanner implements PlannerProvider {
  public async initialize(): Promise<void> {}
  public async dispose(): Promise<void> {}

  public async createPlan(goal: Goal, context: ExecutionContext): Promise<ExecutionPlan> {
    // A simplistic linear decomposition for CRUD/basic tasks
    const node1: ExecutionNode = {
      id: 'seq-1',
      type: 'Action',
      objective: `Validate inputs for: ${goal.intent}`,
      capabilityRequired: 'ToolProvider',
      status: 'Pending',
    };

    const node2: ExecutionNode = {
      id: 'seq-2',
      type: 'Action',
      objective: `Execute linear workflow for: ${goal.intent}`,
      capabilityRequired: 'AgentProvider',
      status: 'Pending',
    };

    return {
      id: `plan-${Date.now()}`,
      version: 1,
      goalId: goal.id,
      nodes: [node1, node2],
      edges: [
        { sourceId: 'seq-1', targetId: 'seq-2' }
      ],
      confidence: 0.9,
      assumptions: ['Sequential steps will not fail'],
      risks: ['Hardcoded linear path'],
      alternatives: [],
      createdAt: new Date()
    };
  }
}
