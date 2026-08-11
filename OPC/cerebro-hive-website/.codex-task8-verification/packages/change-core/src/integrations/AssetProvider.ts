export interface CI {
  ciId: string;
  name: string;
  businessCriticality: string;
}

export interface AssetProvider {
  getConfigurationItem(id: string): Promise<CI | null>;
  getDownstreamDependencies(ciId: string): Promise<CI[]>;
}

export class MockAssetProvider implements AssetProvider {
  async getConfigurationItem(id: string): Promise<CI | null> {
    return { ciId: id, name: `Mock Asset ${id}`, businessCriticality: 'MissionCritical' };
  }
  
  async getDownstreamDependencies(ciId: string): Promise<CI[]> {
    return [
      { ciId: 'db-1', name: 'Orders DB', businessCriticality: 'MissionCritical' },
      { ciId: 'cache-1', name: 'Redis Cache', businessCriticality: 'Important' }
    ];
  }
}
