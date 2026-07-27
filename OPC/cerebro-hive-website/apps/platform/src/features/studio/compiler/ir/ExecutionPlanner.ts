
import { StudioGraph } from '../../graph/GraphModel';
import { ExecutionPlan, Stage, StageDependency, Resource } from './ExecutionPlan';

export class ExecutionPlanner {
  static plan(graph: StudioGraph, workflowId: string): ExecutionPlan {
    console.log('[ExecutionPlanner] Performing Topological Sort to group nodes into Stages...');
    
    // MOCK: Topological Sort algorithm
    // In a real implementation, this would trace edges and assign nodes to `levels`
    // where nodes without incoming edges are level 0, nodes depending only on level 0 are level 1, etc.
    const stages: Stage[] = [
      {
        id: 'stage-0',
        level: 0,
        parallel: false,
        nodes: graph.nodes.map(n => n.id), // Mock: shoving all nodes in stage 0
        inputs: [],
        outputs: [],
        estimatedDurationMs: 500,
        estimatedCost: 0.002
      }
    ];

    const dependencies: StageDependency[] = [];
    const resources: Resource[] = this.extractResources(graph);

    return {
      version: '1.0.0',
      workflowId,
      executionMode: 'simulation',
      graph,
      stages,
      dependencies,
      resources,
      estimates: {
        totalDurationMs: 0,
        totalCost: 0
      },
      diagnostics: []
    };
  }

  private static extractResources(graph: StudioGraph): Resource[] {
    const resources: Resource[] = [];
    graph.nodes.forEach(node => {
      if (node.type === 'LLM') {
        resources.push({
          id: `res-${node.id}`,
          type: 'LLM_INFERENCE',
          provider: 'OpenAI',
          identifier: node.configuration.model || 'gpt-4o',
          quantity: 2000,
          estimatedCost: 0.015
        });
      }
    });
    return resources;
  }
}

export class CostEstimator {
  static estimate(plan: ExecutionPlan): ExecutionPlan {
    console.log('[CostEstimator] Aggregating stage durations and resource costs...');
    let totalCost = 0;
    let totalDurationMs = 0;

    plan.resources.forEach(r => totalCost += r.estimatedCost);
    plan.stages.forEach(s => totalDurationMs += s.estimatedDurationMs);

    plan.estimates = { totalCost, totalDurationMs };
    return plan;
  }
}
