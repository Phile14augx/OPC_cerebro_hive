/**
 * Service Manifest Contracts
 */

export interface ServiceManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  supportedProviders: string[];
  supportedBlueprints: string[];
  capabilities: string[]; // dot notation
  dependencies: string[];
  pricingMetadata: {
    model: "pay-as-you-go" | "subscription" | "free";
    basePrice?: number;
    currency?: string;
  };
  aiGuidance?: string;
  documentationUrl?: string;
  healthCheckEndpoint?: string;
}
