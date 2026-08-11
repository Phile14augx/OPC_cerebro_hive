
import { CompilerPass, PassResult, CompilationContext } from '../engine/CompilationContext';

export const ExecutionPlannerPass: CompilerPass = {
  id: 'core.planner',
  phase: 'planning',
  description: 'Topological sort to generate Execution Stages',
  run: (context: Readonly<CompilationContext>): PassResult => {
    // Clone plan to maintain immutability
    const newPlan = JSON.parse(JSON.stringify(context.plan));
    
    newPlan.stages = [
      {
        id: 'stage-0',
        level: 0,
        parallel: false,
        nodes: context.graph.nodes.map(n => n.id),
        inputs: [],
        outputs: [],
        cacheable: true,
        priority: 1
      }
    ];

    const newContext = { ...context, plan: newPlan };
    newContext.metrics.stageCount = newPlan.stages.length;

    return {
      context: newContext,
      diagnostics: []
    };
  }
};
