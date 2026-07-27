
import { CompilationContext, CompilerPass } from './CompilationContext';
import { StudioGraph } from '../../graph/GraphModel';

export class CompilerEngine {
  private passes: CompilerPass[] = [];

  public registerPass(pass: CompilerPass) {
    this.passes.push(pass);
  }

  public compile(graph: StudioGraph, workflowId: string): CompilationContext {
    const startTime = performance.now();
    
    // Initial empty context
    let context: CompilationContext = {
      graph,
      plan: {
        metadata: {
          version: '2.1',
          compatibility: '>=2.0',
          compilerVersion: '1.0.0',
          generatedAt: new Date().toISOString(),
          sourceHash: 'mock-hash'
        },
        workflowId,
        executionMode: 'simulation',
        stages: [],
        dependencies: [],
        resources: [],
        estimates: {
          llmCost: 0, apiCost: 0, computeCost: 0, storageCost: 0, networkCost: 0, humanReviewCost: 0, totalCost: 0
        }
      },
      diagnostics: [],
      artifacts: {},
      metrics: {
        compilationTimeMs: 0,
        passTimings: {},
        nodeCount: graph.nodes.length,
        stageCount: 0,
        optimizationCount: 0
      }
    };

    // Note: A real implementation would resolve pass dependencies via topological sort here.
    
    // Execute Passes Immutably
    for (const pass of this.passes) {
      const passStart = performance.now();
      
      console.log(`[Compiler Engine] Running Pass: ${pass.id} (${pass.phase})`);
      
      // Execute pass against a read-only clone of the context (shallow copy for demonstration)
      const passResult = pass.run({ ...context });
      
      const passDuration = performance.now() - passStart;

      // Aggregating Diagnostics & State Immutably
      context = {
        ...passResult.context,
        diagnostics: [...context.diagnostics, ...passResult.diagnostics],
        metrics: {
          ...passResult.context.metrics,
          passTimings: {
            ...passResult.context.metrics.passTimings,
            [pass.id]: passDuration
          }
        }
      };
      
      // Short-circuit if a fatal error occurs
      if (passResult.diagnostics.some(d => d.level === 'Error')) {
        console.warn(`[Compiler Engine] Fatal error in pass ${pass.id}, halting compilation.`);
        break;
      }
    }

    context.metrics.compilationTimeMs = performance.now() - startTime;
    return context;
  }
}
