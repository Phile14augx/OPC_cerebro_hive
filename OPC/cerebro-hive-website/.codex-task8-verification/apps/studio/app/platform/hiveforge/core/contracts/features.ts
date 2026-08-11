export type FeatureStage = "Labs" | "Beta" | "Enterprise" | "General" | "Deprecated";

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  stage: FeatureStage;
  isEnabledDefault: boolean;
  requiresEnterpriseLicense: boolean;
}

export interface FeatureRegistryContext {
  getFeature(id: string): FeatureFlag | undefined;
  isFeatureEnabled(id: string, workspaceId?: string): boolean;
  registerFeature(feature: FeatureFlag): void;
}
