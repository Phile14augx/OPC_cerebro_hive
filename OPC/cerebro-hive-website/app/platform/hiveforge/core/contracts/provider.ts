/**
 * Provider Contracts
 * Defines the structure for Infrastructure Providers (AWS, Azure, Local)
 */

export interface CapabilityNode {
  id: string;
  name: string;
  enabled: boolean;
  children?: CapabilityNode[];
}

export interface ProviderIdentity {
  id: string;
  vendor: string;
  version: string;
  apiVersion: string;
}

export interface ProviderCapabilities {
  compute?: CapabilityNode;
  gpu?: CapabilityNode;
  kubernetes?: CapabilityNode;
  serverless?: CapabilityNode;
  databases?: CapabilityNode;
  networking?: CapabilityNode;
}

export interface ProviderRegion {
  id: string;
  name: string;
  availabilityZones: string[];
  latencyTier: "low" | "medium" | "high";
}

export interface ProviderLimits {
  quotas: Record<string, number>;
  instanceLimits: Record<string, number>;
  storageLimits: Record<string, string>;
  apiRateLimits: Record<string, string>;
}

export interface ProviderRuntime {
  health: "Healthy" | "Warning" | "Critical" | "Unknown";
  authentication: "oauth" | "token" | "iam" | "none";
  provisioningEndpoint: string;
  costEstimatorUrl?: string;
}

export interface ProviderContract {
  identity: ProviderIdentity;
  capabilities: ProviderCapabilities;
  regions: ProviderRegion[];
  limits: ProviderLimits;
  runtime: ProviderRuntime;
  
  validateCapability(path: string): boolean;
  estimateCost(blueprintId: string, spec: unknown): Promise<{ currency: string; amount: number }>;
}

export interface ProviderMetrics {
  cpuUsagePercent?: number;
  memoryUsageBytes?: number;
  diskUsageBytes?: number;
  networkInBytes?: number;
  networkOutBytes?: number;
  [key: string]: unknown;
}

export interface IResourceDriver<TConfig = unknown, TState = unknown> {
  validate(config: TConfig): Promise<boolean>;
  estimate(config: TConfig): Promise<number>;
  provision(config: TConfig): Promise<TState>;
  configure(state: TState, config: TConfig): Promise<TState>;
  destroy(state: TState): Promise<void>;
  metrics(state: TState): Promise<ProviderMetrics>;
}

export interface IProvisioningProvider {
  create(resourceId: string, type: string, config: any): Promise<any>;
  update(resourceId: string, type: string, config: any): Promise<any>;
  delete(resourceId: string, type: string): Promise<void>;
  
  snapshot?(resourceId: string): Promise<string>;
  resize?(resourceId: string, newSize: string): Promise<void>;
  reboot?(resourceId: string): Promise<void>;
  powerOff?(resourceId: string): Promise<void>;
  powerOn?(resourceId: string): Promise<void>;
  
  logs?(resourceId: string): Promise<string[]>;
  metrics?(resourceId: string): Promise<ProviderMetrics>;
  
  backup?(resourceId: string): Promise<string>;
  restore?(resourceId: string, backupId: string): Promise<void>;
}
