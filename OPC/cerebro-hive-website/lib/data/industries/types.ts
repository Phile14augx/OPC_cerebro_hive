import { LucideIcon } from "lucide-react";

export interface IndustryHero {
  title: string;
  subtitle: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  dynamicBackgroundType?: string;
}

export interface EngineConfig {
  heroTheme: string;
  backgroundAnimation: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export interface IndustryChallenge {
  title: string;
  pain: string; // Legacy fallback
  cost: string; // Legacy fallback
  businessImpact: string; // Legacy fallback
  
  // NEW PREMIUM FIELDS
  priority?: "Critical" | "High" | "Medium";
  category?: "Fraud" | "Compliance" | "Customer" | "Risk" | "Operations" | "Supply Chain" | "Inventory" | "Pricing";
  problems?: string[];
  solutions?: string[];
  outcomes?: string[];
  techStack?: string[];
  aiAgent?: string;
  readiness?: {
    implementation: string;
    complexity: string;
    roi: string;
  }
}

export interface MatrixItem {
  name: string;
  description: string;
  roi: "High" | "Medium" | "Emerging";
}

export interface ArchitectureNodeData {
  label: string;
  type?: "gateway" | "ai" | "database" | "cloud" | "agent" | "client" | "system";
  icon?: string;
  status?: "Healthy" | "Warning" | "Offline" | "Learning" | "Active";
  description?: string;
}

export interface ArchitectureEdgeData {
  animated?: boolean;
  label?: string;
}

export interface AI_Agent {
  name: string;
  description: string;
  capabilities: string[];
  responsibilities?: string[];
  tools?: string[];
  outputs?: string[];
}

export interface TechStackItem {
  layer: string; // e.g., "AI Models", "Knowledge", "Vector DB"
  technologies: string[];
}

export interface BusinessOutcome {
  metric: string;
  label: string;
  description: string;
}

export interface CaseStudy {
  client: string;
  title: string;
  timeline: string;
  architecture: string;
  outcome: string;
  metric: string;
}

export interface RoadmapPhase {
  phase: string;
  name: string;
  description: string;
}

export interface Industry {
  name: string;
  slug: string;
  color: string;
  
  // The new rendering engine config
  engineConfig: EngineConfig;
  
  hero: IndustryHero;
  
  overview: {
    maturityScore: number;
    currentChallengesSummary: string;
    opportunitySummary: string;
    statistics: { metric: string; label: string }[];
  };

  // Data for IndustryTopology (Globe)
  segments: string[];

  challenges: IndustryChallenge[];
  opportunityMatrix: MatrixItem[]; // Used for SolutionExplorer
  
  architecture: {
    nodes: any[];
    edges: any[];
  };
  
  workflows?: {
    nodes: any[];
    edges: any[];
  };
  
  agents: AI_Agent[];
  
  // Specifically for the Quantiva ERP Integration
  erpIntegration: string[];
  
  techStack: TechStackItem[];
  outcomes: BusinessOutcome[];
  caseStudy: CaseStudy;
  roadmap: RoadmapPhase[];
  
  compliance: { badge: string; description: string }[];
  
  relatedProducts: string[];
  relatedSolutions: string[];
  
  resources: { title: string; type: string; link: string }[];
}
