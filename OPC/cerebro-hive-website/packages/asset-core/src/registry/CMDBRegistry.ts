import { CMDBRepository } from './CMDBRepository';
import { ConfigurationItem } from '../domain/ConfigurationItem';
import { AssetRelationship } from '../domain/AssetRelationship';

export class CMDBRegistry {
  constructor(private readonly repository: CMDBRepository) {}

  async registerCI(ci: ConfigurationItem): Promise<void> {
    // Fire event ConfigurationItemCreated or Updated
    await this.repository.saveConfigurationItem(ci);
  }

  async getCI(ciId: string): Promise<ConfigurationItem | null> {
    return this.repository.getConfigurationItem(ciId);
  }

  async mapRelationship(relationship: AssetRelationship): Promise<void> {
    // Fire event RelationshipAdded
    await this.repository.saveRelationship(relationship);
  }

  async getDependencies(ciId: string): Promise<AssetRelationship[]> {
    return this.repository.getDownstreamDependencies(ciId);
  }

  async getDependents(ciId: string): Promise<AssetRelationship[]> {
    return this.repository.getUpstreamDependencies(ciId);
  }
}
