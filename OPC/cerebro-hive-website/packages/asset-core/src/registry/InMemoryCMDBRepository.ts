import { CMDBRepository } from './CMDBRepository';
import { ConfigurationItem } from '../domain/ConfigurationItem';
import { AssetRelationship } from '../domain/AssetRelationship';

export class InMemoryCMDBRepository implements CMDBRepository {
  private cis = new Map<string, ConfigurationItem>();
  private relationships: AssetRelationship[] = [];

  async saveConfigurationItem(ci: ConfigurationItem): Promise<void> {
    this.cis.set(ci.ciId, { ...ci, updatedAt: new Date() });
  }

  async getConfigurationItem(ciId: string): Promise<ConfigurationItem | null> {
    return this.cis.get(ciId) || null;
  }

  async saveRelationship(relationship: AssetRelationship): Promise<void> {
    // Avoid duplicates
    const exists = this.relationships.find(
      r => r.sourceCiId === relationship.sourceCiId &&
           r.targetCiId === relationship.targetCiId &&
           r.relationshipType === relationship.relationshipType
    );
    if (!exists) {
      this.relationships.push(relationship);
    }
  }

  async getRelationshipsFor(ciId: string): Promise<AssetRelationship[]> {
    return this.relationships.filter(
      r => r.sourceCiId === ciId || r.targetCiId === ciId
    );
  }

  async getDownstreamDependencies(ciId: string): Promise<AssetRelationship[]> {
    return this.relationships.filter(r => r.sourceCiId === ciId);
  }

  async getUpstreamDependencies(ciId: string): Promise<AssetRelationship[]> {
    return this.relationships.filter(r => r.targetCiId === ciId);
  }
}
