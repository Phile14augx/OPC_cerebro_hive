import { Plugin } from "../contracts/plugin";

export interface CostEstimate {
  currency: string;
  hourlyCost: number;
  monthlyCost: number;
}

export class PricingService {
  async estimate(blueprint: Plugin, config: any): Promise<CostEstimate> {
    // Mock implementation. In reality this would read blueprint.manifest.spec.pricing
    // or call the Provider's costEstimator logic.
    let hourlyCost = 0.05; // Base mock cost
    
    // Simulate dynamic pricing based on blueprint ID
    if (blueprint.manifest.metadata.id.includes("gpu")) {
      hourlyCost = 1.10;
    } else if (blueprint.manifest.metadata.id.includes("performance")) {
      hourlyCost = 0.15;
    }
    
    return {
      currency: "USD",
      hourlyCost,
      monthlyCost: hourlyCost * 730 // Average hours in a month
    };
  }
}

export const pricingService = new PricingService();
