export interface ModelCapabilities {
  supportsTools: boolean;
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsJSON: boolean;
  supportsReasoning?: boolean; // specialized deep reasoning (e.g. o1-preview)
}

export interface ModelEntry {
  provider: string;
  model: string;
  capabilities: ModelCapabilities;
  baseCostInput: number; // per 1k tokens
  baseCostOutput: number; // per 1k tokens
  tier: 'low' | 'balanced' | 'high' | 'reasoning';
}

/**
 * Static capability registry for M10.1.5.
 * In a fully dynamic system, this could be synced from a DB or provider API.
 */
export class CapabilityRegistry {
  private static readonly models: ModelEntry[] = [
    {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20240620',
      capabilities: { supportsTools: true, supportsStreaming: true, supportsVision: true, supportsJSON: true },
      baseCostInput: 0.003,
      baseCostOutput: 0.015,
      tier: 'high'
    },
    {
      provider: 'anthropic',
      model: 'claude-3-haiku-20240307',
      capabilities: { supportsTools: true, supportsStreaming: true, supportsVision: true, supportsJSON: true },
      baseCostInput: 0.00025,
      baseCostOutput: 0.00125,
      tier: 'low'
    },
    {
      provider: 'openai',
      model: 'gpt-4o',
      capabilities: { supportsTools: true, supportsStreaming: true, supportsVision: true, supportsJSON: true },
      baseCostInput: 0.005,
      baseCostOutput: 0.015,
      tier: 'high'
    },
    {
      provider: 'openai',
      model: 'gpt-4o-mini',
      capabilities: { supportsTools: true, supportsStreaming: true, supportsVision: true, supportsJSON: true },
      baseCostInput: 0.00015,
      baseCostOutput: 0.0006,
      tier: 'low'
    },
    {
      provider: 'openai',
      model: 'o1-preview',
      capabilities: { supportsTools: false, supportsStreaming: false, supportsVision: false, supportsJSON: false, supportsReasoning: true },
      baseCostInput: 0.015,
      baseCostOutput: 0.060,
      tier: 'reasoning'
    }
  ];

  static findSuitableModels(
    requirements: Partial<ModelCapabilities>,
    tier?: ModelEntry['tier'],
    maxCostInput?: number
  ): ModelEntry[] {
    return this.models.filter(m => {
      // Filter by capabilities
      for (const [key, req] of Object.entries(requirements)) {
        if (req && !m.capabilities[key as keyof ModelCapabilities]) return false;
      }

      // Filter by tier
      if (tier && m.tier !== tier) return false;

      // Filter by max cost
      if (maxCostInput !== undefined && m.baseCostInput > maxCostInput) return false;

      return true;
    });
  }
}
