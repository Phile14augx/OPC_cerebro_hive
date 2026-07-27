
export interface IntelligenceModel {
  version: string;
  status: 'Draft' | 'Shadow' | 'Active' | 'Deprecated';
  weights: Record<string, number>; // Weights for multi-objective optimization (Latency vs Cost)
  routingHeuristics: any;
}

export class ModelRegistry {
  private models = new Map<string, IntelligenceModel>();

  register(model: IntelligenceModel) {
    this.models.set(model.version, model);
  }

  getActiveModel(): IntelligenceModel {
    // Return the currently active model (enables A/B testing and seamless rollbacks)
    return Array.from(this.models.values()).find(m => m.status === 'Active')!;
  }
}
