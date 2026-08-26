export interface CloudMetadata {
  provider: 'AWS' | 'Azure' | 'GCP' | 'Kubernetes' | 'OnPrem' | string;
  resourceId: string; // e.g., ARN, Azure Resource ID
  region?: string;
  accountId?: string; // AWS Account ID, Azure Subscription ID, GCP Project ID
  resourceType?: string; // e.g., 'AWS::RDS::DBInstance'
  resourceName?: string;
  providerMetadata?: Record<string, unknown>; // Extensible provider-specific fields (e.g., storageClass)
}
