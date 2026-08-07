import {
  LLMProvider,
  LLMMessage,
  PlannerProvider,
  ExecutionContext,
  CapabilityDescriptor,
  RuntimeRegistry,
  Goal,
  ExecutionPlan
} from '@cerebro/runtime-core';

export class MockLLMProvider implements LLMProvider {
  public async initialize(): Promise<void> {
    console.log('[MockLLMProvider] Initialized.');
  }

  public async dispose(): Promise<void> {
    console.log('[MockLLMProvider] Disposed.');
  }

  public async invokeModel(messages: LLMMessage[], context: ExecutionContext, onToken?: (token: string) => void): Promise<string> {
    const text = "This is a mock LLM response based on the capability architecture.";
    if (onToken) {
      const words = text.split(' ');
      for (const word of words) {
        onToken(word + ' ');
      }
    }
    return text;
  }
}

export class MockPlannerProvider implements PlannerProvider {
  public async createPlan(goal: Goal, context: ExecutionContext): Promise<ExecutionPlan> {
    return {
      id: 'mock-plan-1',
      version: 1,
      goalId: goal.id,
      nodes: [
        {
          id: 'step-1',
          type: 'Action',
          objective: `Understand ${goal.intent}`,
          capabilityRequired: 'LLMProvider',
          status: 'Pending'
        }
      ],
      edges: [],
      confidence: 0.95,
      assumptions: ['Goal is clear'],
      risks: [],
      alternatives: [],
      createdAt: new Date()
    };
  }
}

export function registerMockProviders() {
  const registry = RuntimeRegistry.getInstance();

  const mockLLMDescriptor = new CapabilityDescriptor<LLMProvider>(
    {
      name: 'Mock-GPT4',
      capability: 'LLMProvider',
      version: '1.0.0',
      priority: 10,
      supportedModels: ['gpt-4-mock'],
      supportedFeatures: ['streaming'],
      costClass: 'Medium',
    },
    () => new MockLLMProvider()
  );

  const mockPlannerDescriptor = new CapabilityDescriptor<PlannerProvider>(
    {
      name: 'Mock-ReAct-Planner',
      capability: 'PlannerProvider',
      version: '1.0.0',
      priority: 10,
    },
    () => new MockPlannerProvider()
  );

  registry.register(mockLLMDescriptor);
  registry.register(mockPlannerDescriptor);
  
  // Set health manually to healthy so they can be resolved
  mockLLMDescriptor.setHealth('Healthy');
  mockPlannerDescriptor.setHealth('Healthy');
}
