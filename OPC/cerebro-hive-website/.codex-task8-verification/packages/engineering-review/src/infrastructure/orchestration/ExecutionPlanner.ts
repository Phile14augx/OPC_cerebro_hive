import { ExecutionPlan, ExecutionPlanNode } from './models';
import { AnalyzerExecutionRequest } from '../analyzers/models';

export class ExecutionPlanner {
  buildPlan(requests: AnalyzerExecutionRequest[]): ExecutionPlan {
    const nodes: ExecutionPlanNode[] = requests.map(req => ({
      nodeId: `node-${req.executionId}`,
      request: req,
      schedulingContext: {
        tenantId: 'default-tenant',
        basePriority: 100,
        estimatedCost: 1,
        concurrencyClass: 'standard',
        retryBudget: 3
      }
    }));

    return {
      planId: `plan-${Date.now()}`,
      plannerVersion: '1.0.0',
      planSchemaVersion: '1.0.0',
      generatedAt: Date.now(),
      nodes,
      dependencies: []
    };
  }
}
