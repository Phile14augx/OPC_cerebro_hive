import { LucideIcon } from "lucide-react";

export type EntityStatus = "concept" | "development" | "alpha" | "beta" | "production" | "deprecated";

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

export interface EntityHero {
  title: string;
  subtitle: string;
  description: string;
  primaryCta?: string;
  secondaryCta?: string;
}

// Global Base Interface (Taxonomy)
export interface BaseEntity {
  id: string;
  slug: string;
  title: string;
  summary: string;
  hero: EntityHero;
  iconName?: string; // Storing string name for Lucide icons to avoid serialization issues
  category: string;
  status: EntityStatus;
  version?: string;
  tags: string[];
  seo?: SEOData;
  relatedItems?: string[]; // array of IDs referencing the graph
  documentation?: string; // URL or path
  roadmap?: string[]; // Array of upcoming features/milestones
}

// Specific Entity Types
export interface PlatformCapability extends BaseEntity {
  group: "AI Runtime" | "Knowledge" | "Infrastructure" | "Developer" | "Core";
  features: string[];
  // If set, this capability has a real, working implementation reachable on
  // the site (not just marketing copy) — e.g. the AgentOS live runtime page.
  // Only populate this for capabilities that are genuinely demoable.
  liveDemoUrl?: string;
  liveDemoLabel?: string;
}

export type ProductSectionId = 
  | "hero" 
  | "executive_summary"
  | "business_problems"
  | "core_capabilities"
  | "architecture_overview"
  | "feature_matrix"
  | "deployment_models"
  | "security_compliance"
  | "integration_ecosystem"
  | "api_sdk"
  | "developer_experience"
  | "ai_capabilities"
  | "platform_dependencies"
  | "performance_benchmarks"
  | "roadmap"
  | "case_studies"
  | "industries"
  | "related_services"
  | "pricing"
  | "faq"
  | "cta";

export interface ProductConfiguration {
  layout: "saas" | "platform" | "developer_tool" | "infrastructure";
  sections: ProductSectionId[];
}

export interface Feature {
  title: string;
  description: string;
  icon?: string;
}

export interface Integration {
  system: string;
  type: string; // e.g. "Native", "API", "Webhook"
}

export interface PackagedProduct extends BaseEntity {
  // Product Manifest
  maturity: "beta" | "ga" | "legacy";
  config: ProductConfiguration;
  
  // Marketing & Positioning
  businessProblems: string[];
  targetPersonas: string[];
  industries: string[];
  
  // Technical & Feature Details
  coreCapabilities: Feature[];
  deploymentModels: string[]; // e.g. ["Cloud", "On-Premises", "VPC"]
  securityFeatures: string[];
  integrations: Integration[];
  
  // Developer Experience
  apiReference?: string; // link to docs
  sdkLanguages?: string[];
  
  // Graph Relationships
  platformCapabilities: string[]; // What powers it
  relatedServices: string[]; // Services that deploy it
  relatedResearch: string[]; // Research papers that formed it
  
  pricing?: PricingModel;
  faqs?: FAQ[];
  caseStudies?: CaseStudyReference[];
}

export type ServiceSectionId = 
  | "hero" 
  | "executive_summary"
  | "business_challenges"
  | "methodology" 
  | "architecture" 
  | "roadmap" 
  | "deliverables" 
  | "case_studies" 
  | "roi" 
  | "pricing" 
  | "faq" 
  | "cta"
  | "products";

export interface ServiceConfiguration {
  layout: "enterprise" | "standard";
  sections: ServiceSectionId[];
}

export interface BusinessChallenge {
  title: string;
  description: string;
}

export interface TimelinePhase {
  title: string;
  duration: string;
  activities: string[];
}

export interface SuccessMetric {
  metric: string;
  value: string;
  timeframe: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface PricingModel {
  type: string; // e.g. "Fixed Scope", "Capacity Retainer"
  description: string;
  startingAt?: string;
}

export interface CaseStudyReference {
  clientName: string;
  impact: string;
  link: string;
}

export interface EnterpriseService extends BaseEntity {
  // New Narrative Configuration
  config: ServiceConfiguration;

  // Consulting Narrative Fields
  executiveProblem?: string;
  businessImpact?: string;
  
  // Arrays of rich content
  businessChallenges: BusinessChallenge[];
  targetPersonas: string[];
  industries: string[];
  methodologyOverview: string;
  timeline: TimelinePhase[];
  successMetrics: SuccessMetric[];
  
  // Graph Relationships
  products: string[]; // references Product IDs
  platformCapabilities: string[]; // references PlatformCapability IDs
  relatedResearch: string[];
  
  // Business details
  deliverables: string[];
  engagementModel: string;
  pricing?: PricingModel;
  
  caseStudies?: CaseStudyReference[];
  faqs?: FAQ[];
}

export interface ResearchProgram extends BaseEntity {
  feedsPlatformCapabilities: string[]; // references PlatformCapability IDs
  publications: string[];
  experiments: string[];
  openSourceProjects: string[];
}
