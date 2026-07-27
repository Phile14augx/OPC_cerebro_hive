
import { RuntimeIR } from '../execution/RuntimeIR';
import { RuntimeOptimizer } from '../optimizer/RuntimeOptimizer';
import { CostEstimator } from './CostEstimator';

export class RuntimePlanner {
  static planExecution(rawIr: RuntimeIR) {
    const optimizedIr = RuntimeOptimizer.optimize(rawIr);
    const estimatedCost = CostEstimator.estimate(optimizedIr);
    
    console.log(`[Planner] Execution Planned. Estimated Cost: $${estimatedCost.totalUsd.toFixed(4)}`);
    
    return {
      ir: optimizedIr,
      estimatedCost
    };
  }
}
