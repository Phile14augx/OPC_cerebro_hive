/**
 * M24 — CompilerEngine (real implementation)
 *
 * Replaces the mock `return {} as any` with real pass execution:
 *   1. Initialize CompilationContext from the graph
 *   2. Sort registered passes in topological order (respecting `requires`)
 *   3. Run each pass, accumulate diagnostics, track per-pass timing
 *   4. Detect circular pass dependencies (throws with clear message)
 *   5. Return fully populated CompilationContext
 */
import { CompilationContext, CompilerPass } from './CompilationContext';
import { StudioGraph } from '../../graph/GraphModel';

export class CompilerEngine {
  private passes: Map<string, CompilerPass> = new Map();

  public registerPass(pass: CompilerPass): void {
    this.passes.set(pass.id, pass);
  }

  // Topological sort with cycle detection
  private sortPasses(): CompilerPass[] {
    const sorted: CompilerPass[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>(); // cycle detection

    const visit = (passId: string): void => {
      if (visited.has(passId)) return;
      if (visiting.has(passId)) {
        throw new Error(`[CompilerEngine] Circular dependency detected at pass: "${passId}"`);
      }
      visiting.add(passId);
      const pass = this.passes.get(passId);
      if (pass) {
        pass.requires.forEach(req => visit(req));
        visited.add(passId);
        sorted.push(pass);
      }
      visiting.delete(passId);
    };

    for (const passId of this.passes.keys()) visit(passId);
    return sorted;
  }

  public compile(graph: StudioGraph, workflowId: string): CompilationContext {
    const t0 = performance.now();

    // Initialize a fresh context
    let ctx: CompilationContext = {
      graph,
      plan: {
        metadata: {
          version: workflowId,
          compatibility: '1.0',
          compilerVersion: 'm24',
          generatedAt: new Date().toISOString(),
          sourceHash: workflowId,
        },
        workflowId,
        executionMode: 'simulation',
        stages: [],
        dependencies: [],
        resources: [],
        estimates: {
          llmCost: 0, apiCost: 0, computeCost: 0,
          storageCost: 0, networkCost: 0, humanReviewCost: 0, totalCost: 0,
        },
      },
      diagnostics: [],
      artifacts: { symbolTable: {}, debugMap: {} },
      metrics: {
        compilationTimeMs: 0,
        passTimings: {},
        nodeCount: graph.nodes.length,
        stageCount: 0,
        optimizationCount: 0,
      },
    };

    const orderedPasses = this.sortPasses();
    console.info(
      `[CompilerEngine] Compiling "${workflowId}" | ${graph.nodes.length} nodes | ` +
      `${orderedPasses.length} passes: ${orderedPasses.map(p => p.id).join(' → ')}`,
    );

    for (const pass of orderedPasses) {
      const pt0 = performance.now();
      try {
        const result = pass.run(ctx);
        // Merge returned context immutably
        ctx = result.context;
        ctx.diagnostics = [...ctx.diagnostics, ...result.diagnostics];
      } catch (err) {
        console.error(`[CompilerEngine] Pass "${pass.id}" threw:`, err);
        ctx.diagnostics.push({
          level: 'Error',
          message: `Pass "${pass.id}" failed: ${String(err)}`,
          nodeId: undefined,
        });
      }
      ctx.metrics.passTimings[pass.id] = parseFloat((performance.now() - pt0).toFixed(2));
    }

    ctx.metrics.compilationTimeMs = parseFloat((performance.now() - t0).toFixed(2));
    ctx.metrics.stageCount = ctx.plan.stages.length;

    const errors = ctx.diagnostics.filter(d => d.level === 'Error');
    console.info(
      `[CompilerEngine] Done in ${ctx.metrics.compilationTimeMs}ms | ` +
      `${ctx.diagnostics.length} diagnostics (${errors.length} errors)`,
    );

    return ctx;
  }
}
