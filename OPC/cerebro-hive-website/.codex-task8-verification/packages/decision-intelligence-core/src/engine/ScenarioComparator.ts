import { DecisionScenario } from '../domain/DecisionScenario';
import { OptimizationEngine } from './OptimizationEngine';
import { PortfolioSimulator } from './PortfolioSimulator';

export class ScenarioComparator {
  constructor(
    private readonly simulator: PortfolioSimulator,
    private readonly optimizer: OptimizationEngine
  ) {}

  public async evaluateOptions(scenarios: DecisionScenario[]): Promise<DecisionScenario[]> {
    console.log(`\n[ScenarioComparator] Evaluating ${scenarios.length} Strategic Options...`);

    // 1. Simulate each scenario in isolated Digital Twins
    const simulatedScenarios: DecisionScenario[] = [];
    for (const scenario of scenarios) {
      const result = await this.simulator.simulateScenario(scenario);
      simulatedScenarios.push(result);
    }

    // 2. Rank and optimize
    return this.optimizer.optimize(simulatedScenarios);
  }
}
