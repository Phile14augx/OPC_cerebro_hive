import { ChangeRequest } from '../domain/ChangeRequest';
import { AssetProvider } from '../integrations/AssetProvider';

export interface RiskContributor {
  evaluate(change: ChangeRequest, assetProvider: AssetProvider): Promise<number>;
}

export class BusinessCriticalityContributor implements RiskContributor {
  async evaluate(change: ChangeRequest, assetProvider: AssetProvider): Promise<number> {
    let score = 0;
    for (const ciId of change.affectedConfigurationItems) {
      const ci = await assetProvider.getConfigurationItem(ciId);
      if (ci?.businessCriticality === 'MissionCritical') score += 30;
      else if (ci?.businessCriticality === 'BusinessCritical') score += 20;
    }
    return score;
  }
}

export class DependencySpanContributor implements RiskContributor {
  async evaluate(change: ChangeRequest, assetProvider: AssetProvider): Promise<number> {
    let score = 0;
    for (const ciId of change.affectedConfigurationItems) {
      const deps = await assetProvider.getDownstreamDependencies(ciId);
      score += deps.length * 5; // 5 points per downstream dependency
    }
    return score;
  }
}

export class RiskEvaluator {
  private contributors: RiskContributor[] = [];

  constructor(private readonly assetProvider: AssetProvider) {
    // Register default contributors
    this.contributors.push(new BusinessCriticalityContributor());
    this.contributors.push(new DependencySpanContributor());
  }

  async calculateRisk(change: ChangeRequest): Promise<number> {
    let totalRisk = 0;
    for (const contributor of this.contributors) {
      totalRisk += await contributor.evaluate(change, this.assetProvider);
    }
    // Cap at 100
    return Math.min(totalRisk, 100);
  }
}
