
import { ReasoningStrategy } from '@cerebro/reasoning-sdk';
import { SelfConsistencyStrategy, TreeOfThoughtsStrategy, DebateStrategy } from './Strategies';

export class ReasoningEngine {
  private registry = new Map<string, () => ReasoningStrategy>();

  constructor() {
    this.registry.set('SelfConsistency', () => new SelfConsistencyStrategy());
    this.registry.set('TreeOfThoughts', () => new TreeOfThoughtsStrategy());
    this.registry.set('Debate', () => new DebateStrategy());
  }

  async run(strategyName: string, inputs: any) {
    console.log(`[ReasoningEngine] Emitting REASONING_STARTED for ${strategyName}`);
    const strategyFactory = this.registry.get(strategyName);
    if (!strategyFactory) throw new Error(`Unknown strategy ${strategyName}`);
    
    const strategy = strategyFactory();
    
    await strategy.initialize(inputs);
    await strategy.execute();
    await strategy.evaluate();
    
    const summary = await strategy.finalize();
    console.log(`[ReasoningEngine] Emitting REASONING_COMPLETED`);
    
    return summary;
  }
}
