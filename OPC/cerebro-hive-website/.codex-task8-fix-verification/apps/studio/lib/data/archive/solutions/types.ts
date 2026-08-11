export interface SolutionHero {
  title: string;
  subtitle: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
}

export interface BusinessProblem {
  problem: string;
  impact: string;
  aiSolution?: string;
}

export interface Capability {
  name: string;
  description: string;
  benefits?: string[];
  techUsed?: string[];
}

export interface AIAgent {
  name: string;
  role: string;
  description: string;
}

export interface TechStackLayer {
  layer: string;
  technologies: string[];
}

export interface TechItem {
  name: string;
  role: string;
  icon?: string;
}

export interface ROI {
  metric: string;
  label: string;
  description: string;
}

export interface SolutionCaseStudy {
  industry: string;
  title: string;
  timeline: string;
  outcome: string;
  metric: string;
  description?: string;
  savings?: string;
}

export interface SolutionResource {
  title: string;
  type: string;
  link: string;
}

export interface PipelineStep {
  id: string;
  label: string;
  subLabels?: string[];
}

export interface WorkflowStep {
  step: number;
  name: string;
  description?: string;
}

export interface TimelinePhase {
  phase: string;
  week: string;
  description: string;
}

export interface Solution {
  name: string;
  slug: string;
  category: "AI & Generative AI" | "Enterprise Automation" | "Customer Experience" | "Data & Intelligence" | "Enterprise Platforms" | "Infrastructure";
  color: string;
  
  // New fields
  tagline: string;
  implementationWeeks: string;
  readiness: "Enterprise Ready" | "Production Ready" | "Beta";
  difficulty: "Low" | "Medium" | "High";
  deploymentModels: string[];
  roiLevel: "High" | "Medium" | "Very High";
  industries: string[];
  
  hero: SolutionHero;
  overview: string;
  businessProblems: BusinessProblem[];
  capabilities: Capability[];
  
  pipeline: PipelineStep[];
  workflowSteps: WorkflowStep[];
  
  architecture: {
    nodes: any[];
    edges: any[];
  };
  workflows: {
    nodes: any[];
    edges: any[];
  };
  
  agents: AIAgent[];
  techStack: TechStackLayer[];
  techStackFlat: TechItem[];
  
  roi: ROI[];
  timeline: TimelinePhase[];
  
  deliverables: string[];
  engagementModels: string[];
  securityFeatures: string[];
  integrations: string[];
  
  featuredCaseStudy?: SolutionCaseStudy;
  caseStudy: SolutionCaseStudy; // legacy
  resources: SolutionResource[];
  recommendedProducts?: string[];
  recommendedResearch?: string[];
}
