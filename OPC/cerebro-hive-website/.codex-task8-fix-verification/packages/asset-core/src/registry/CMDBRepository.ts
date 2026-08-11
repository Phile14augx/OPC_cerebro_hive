import { ConfigurationItem } from '../domain/ConfigurationItem';
import { AssetRelationship } from '../domain/AssetRelationship';

export interface CMDBRepository {
  saveConfigurationItem(ci: ConfigurationItem): Promise<void>;
  getConfigurationItem(ciId: string): Promise<ConfigurationItem | null>;
  
  saveRelationship(relationship: AssetRelationship): Promise<void>;
  getRelationshipsFor(ciId: string): Promise<AssetRelationship[]>;
  
  // Basic query for fetching dependencies
  getDownstreamDependencies(ciId: string): Promise<AssetRelationship[]>;
  getUpstreamDependencies(ciId: string): Promise<AssetRelationship[]>;
}
