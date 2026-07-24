import { CMDBRepository } from '../registry/CMDBRepository';
import { ConfigurationItem } from '../domain/ConfigurationItem';

export class ImpactAnalyzer {
  constructor(private readonly repository: CMDBRepository) {}

  /**
   * Identifies all upstream CIs that would be impacted if the given CI fails.
   */
  async analyzeImpact(failedCiId: string): Promise<ConfigurationItem[]> {
    const impacted = new Map<string, ConfigurationItem>();
    
    // Breadth-first traversal up the dependency chain
    const queue = [failedCiId];
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const dependents = await this.repository.getUpstreamDependencies(currentId);
      
      for (const rel of dependents) {
        if (!impacted.has(rel.sourceCiId)) {
          const ci = await this.repository.getConfigurationItem(rel.sourceCiId);
          if (ci) {
            impacted.set(ci.ciId, ci);
            queue.push(ci.ciId);
          }
        }
      }
    }
    
    return Array.from(impacted.values());
  }
}
