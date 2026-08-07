import { CapabilityRegistry, ModelCapabilities, ModelEntry } from './CapabilityRegistry';

export interface ModelRouterRequest {
  capabilities?: Partial<ModelCapabilities>;
  tier?: ModelEntry['tier'];
  costLimit?: number;
  preferredProvider?: string;
  userOverrides?: Record<string, any>;
}

export interface ModelRoute {
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export class ModelRouter {
  static resolve(request: ModelRouterRequest): ModelRoute {
    const requiredCaps = request.capabilities || {};
    
    // Find matching models
    const candidates = CapabilityRegistry.findSuitableModels(
      requiredCaps, 
      request.tier, 
      request.costLimit
    );

    if (candidates.length === 0) {
      throw new Error(`No models found satisfying requirements: ${JSON.stringify(request)}`);
    }

    // Sort candidates: prefer preferredProvider, then sort by cost (cheapest first)
    candidates.sort((a, b) => {
      if (request.preferredProvider) {
        if (a.provider === request.preferredProvider && b.provider !== request.preferredProvider) return -1;
        if (a.provider !== request.preferredProvider && b.provider === request.preferredProvider) return 1;
      }
      return a.baseCostInput - b.baseCostInput;
    });

    const selected = candidates[0];

    return {
      provider: selected.provider,
      model: selected.model,
      temperature: 0.7, // Dynamic temperature could be driven by tenant config
      maxTokens: 4096
    };
  }
}
