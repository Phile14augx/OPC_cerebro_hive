import { LucideIcon } from "lucide-react";

export type ProductType = "software" | "framework";

export interface CompetitorComparison {
  competitor: string;
  features: Record<string, "yes" | "no" | "partial" | "limited">;
}

export interface DeploymentOption {
  name: string;
  icon: string;
  description: string;
}

export interface ArchitectureData {
  nodes: any[];
  edges: any[];
}

export interface BaseProduct {
  slug: string;
  type: ProductType;
  name: string;
  tagline: string;
  description: string;
  color: string;
  heroImage?: string;
  architecture?: ArchitectureData; // Level 2 React Flow
}

export interface SoftwarePlatform extends BaseProduct {
  type: "software";
  modules: string[];
  features: string[];
  deploymentOptions: DeploymentOption[];
  comparisons: {
    featuresList: string[]; // List of features being compared
    cerebro: Record<string, "yes" | "no" | "partial" | "limited">; // Cerebro's capabilities
    competitors: CompetitorComparison[];
  };
  integrations: string[];
}

export interface ProprietaryFramework extends BaseProduct {
  type: "framework";
  phases: string[];
  components: string[];
  deliverables: string[];
  industries: string[];
  illustrationText?: string; // Text representation of the framework for Level 2 layout
}

export type ProductData = SoftwarePlatform | ProprietaryFramework;
