import { ModelRegistry, AIModelDTO } from '../registry/ModelRegistry';

export interface RouteRequest {
  capabilities: string[]; // e.g. ['chat', 'vision']
  maxCostPer1k?: number;
  priority: 'cost' | 'latency' | 'quality';
}

export class ModelRouter {
  constructor(private registry: ModelRegistry) {}

  async route(request: RouteRequest): Promise<AIModelDTO> {
    const model = await this.registry.findBestModel({
      capabilities: request.capabilities,
      maxCost: request.maxCostPer1k
    });

    if (!model) {
      throw new Error(`No available model satisfies requirements: ${JSON.stringify(request)}`);
    }

    return model;
  }
}
