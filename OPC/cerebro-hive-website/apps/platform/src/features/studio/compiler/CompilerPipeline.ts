
import { StudioGraph } from '../graph/GraphModel';
import { Diagnostic } from './CompilerErrors';
import { NodeRegistry } from '../nodes/registry';
import { ExecutionPlanner, CostEstimator } from './ir/ExecutionPlanner';
import { ExecutionPlan } from './ir/ExecutionPlan';

export class CompilerPipeline {
  static compile(graph: StudioGraph, workflowId: string): ExecutionPlan | null {
    console.log('[Compiler] Phase 1: Normalize');
    const normalizedGraph = this.normalize(graph);
    
    console.log('[Compiler] Phase 2: Validate');
    const diagnostics = this.validate(normalizedGraph);
    if (diagnostics.some(d => d.level === 'Error')) {
      return null;
    }
    
    console.log('[Compiler] Phase 3: Optimize');
    const optimizedGraph = this.optimize(normalizedGraph);
    
    console.log('[Compiler] Phase 4: Execution Planner (IR Generation)');
    let executionPlan = ExecutionPlanner.plan(optimizedGraph, workflowId);
    
    console.log('[Compiler] Phase 5: Cost Estimator');
    executionPlan = CostEstimator.estimate(executionPlan);

    executionPlan.diagnostics = diagnostics;
    return executionPlan;
  }

  private static normalize(graph: StudioGraph) { return graph; }
  
  private static validate(graph: StudioGraph): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const node of graph.nodes) {
      const def = NodeRegistry.get(node.type);
      if (def) {
        diagnostics.push(...def.validator(node));
      }
    }
    return diagnostics;
  }
  
  private static optimize(graph: StudioGraph) { return graph; }
}
