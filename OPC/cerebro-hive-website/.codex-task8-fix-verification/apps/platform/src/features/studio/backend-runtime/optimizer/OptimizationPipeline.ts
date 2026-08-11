
import { RuntimeIR } from '../execution/RuntimeIR';
import { ExecutionIntelligenceStore } from '../intelligence/ExecutionIntelligenceStore';

export interface OptimizationPass {
  name: string;
  priority: number;
  dependencies: string[];
  execute(ir: RuntimeIR, store: ExecutionIntelligenceStore): RuntimeIR;
}

export class OptimizationPipeline {
  private passes: OptimizationPass[] = [];

  registerPass(pass: OptimizationPass) {
    this.passes.push(pass);
    this.passes.sort((a, b) => a.priority - b.priority);
  }

  optimize(ir: RuntimeIR, store: ExecutionIntelligenceStore) {
    let currentIr = ir;
    for (const pass of this.passes) {
      currentIr = pass.execute(currentIr, store);
    }
    return currentIr;
  }
}
