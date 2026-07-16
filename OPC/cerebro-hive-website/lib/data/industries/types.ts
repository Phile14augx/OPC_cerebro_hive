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

  // NEW: Enterprise Digital Twin Config
  digitalTwin?: DigitalTwinConfig;
}

// NEW: Enterprise Digital Twin Config (Semantic Explorer)
export type NodeState = 'idle' | 'receiving' | 'processing' | 'reasoning' | 'thinking' | 'executing' | 'completed' | 'monitoring';

export interface TwinNode {
  id: string;
  label: string;
  type: 'entity' | 'system' | 'agent' | 'database' | 'logic' | 'ai';
  icon?: string;
  
  // For the Inspector Panel
  purpose?: string;
  inputs?: string[];
  outputs?: string[];
  relatedProducts?: string[];
  relatedResearch?: string[];
  businessValue?: string;
  techStack?: string[];
  
  // Simulation config
  processingTimeMs?: number; 
}

export interface TwinConnection {
  from: string;
  to: string;
  label?: string;
  animated?: boolean;
}

export interface TwinMetric {
  id: string;
  label: string;
  startValue: number;
  endValue: number;
  format: 'percentage' | 'number' | 'time' | 'currency';
  prefix?: string;
  suffix?: string;
}

export interface TwinEvent {
  timeOffset: number; // in milliseconds from start
  nodeId: string;
  state: NodeState;
  message: string;
}

// Represents different semantic zoom levels
export interface DigitalTwinConfig {
  
  // Level 1: Overview
  overview: {
    title: string;
    description: string;
    primaryNodes: string[]; // IDs of nodes to show
  };

  // Level 2: Workflow (Collaborating Agents & Systems)
  workflow: {
    nodes: TwinNode[];
    connections: TwinConnection[];
  };

  // Level 3: Architecture (Technical specifics, APIs, DBs)
  architecture: {
    nodes: TwinNode[];
    connections: TwinConnection[];
  };
  
  // Agents involved in this industry simulator
  agents: { id: string; name: string; role: string }[];
  
  // Metrics to animate during simulation
  metrics: TwinMetric[];
  
  // Simulation sequence
  events: TwinEvent[]; 
  
  integrations: string[];
}
