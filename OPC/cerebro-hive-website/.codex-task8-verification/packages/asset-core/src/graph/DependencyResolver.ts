import { CMDBRepository } from '../registry/CMDBRepository';
import { ConfigurationItem } from '../domain/ConfigurationItem';

export interface DependencyPath {
  path: ConfigurationItem[];
}

export class DependencyResolver {
  constructor(private readonly repository: CMDBRepository) {}

  /**
   * Resolves the full downstream dependency tree (what this CI depends on).
   */
  async resolveDownstream(ciId: string, depth = 5): Promise<DependencyPath[]> {
    if (depth === 0) return [];

    const rootCi = await this.repository.getConfigurationItem(ciId);
    if (!rootCi) return [];

    const relationships = await this.repository.getDownstreamDependencies(ciId);
    if (relationships.length === 0) {
      return [{ path: [rootCi] }];
    }

    const paths: DependencyPath[] = [];
    for (const rel of relationships) {
      const subPaths = await this.resolveDownstream(rel.targetCiId, depth - 1);
      for (const sp of subPaths) {
        paths.push({ path: [rootCi, ...sp.path] });
      }
    }

    return paths;
  }
}
