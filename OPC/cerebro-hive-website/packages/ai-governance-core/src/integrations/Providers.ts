export interface AssetProvider {
  linkAssetToCMDB(assetId: string, assetType: string): Promise<string>;
}

export class MockAssetProvider implements AssetProvider {
  async linkAssetToCMDB(assetId: string, assetType: string): Promise<string> {
    // Simulates creating a ConfigurationItem in asset-core and returning the CI ID
    return `ci-${assetType.toLowerCase()}-${assetId}`;
  }
}

export interface ChangeProvider {
  requestDeploymentChange(assetId: string, description: string): Promise<string>;
}

export class MockChangeProvider implements ChangeProvider {
  async requestDeploymentChange(assetId: string, description: string): Promise<string> {
    return `CHG-${Date.now()}`;
  }
}

export interface PolicyProvider {
  validateDeploymentPolicy(modelId: string, evaluationScore: number): Promise<boolean>;
}

export class MockPolicyProvider implements PolicyProvider {
  async validateDeploymentPolicy(modelId: string, evaluationScore: number): Promise<boolean> {
    // E.g., model passes if eval score >= 0.8
    return evaluationScore >= 0.8;
  }
}
