// =============================================================================
// CerebroForge™ — Core types for the agent workflow engine
// =============================================================================

export type ForgePhase =
  | 'idea'
  | 'planning'
  | 'requirements'
  | 'architecture'
  | 'design'
  | 'implementation'
  | 'testing'
  | 'review'
  | 'deployment'
  | 'monitoring';

export type ForgeAgentType =
  | 'pm'
  | 'architect'
  | 'ux'
  | 'frontend'
  | 'backend'
  | 'mobile'
  | 'desktop'
  | 'chatbot'
  | 'database'
  | 'qa'
  | 'security'
  | 'devops'
  | 'docs';

export type AgentStatus = 'idle' | 'active' | 'running' | 'completed' | 'failed' | 'scanning';

export interface ForgeModule {
  name: string;
  description?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  storyCount: number;
  apiCount: number;
  status: 'pending' | 'generating' | 'done';
}

export interface ForgeMilestone {
  title: string;
  weekLabel: string;
  order: number;
}

export interface ForgeStack {
  frontend: string;
  backend: string;
  database: string;
  mobile?: string | null;
  infra: string;
}

export interface ForgeArchService {
  name: string;
  port: number;
  database: string | null;
  runtime: string;
  responsibilities: string[];
}

export interface ForgeArchitecture {
  pattern: string;
  services: ForgeArchService[];
  techStack: Record<string, string[]>;
  decisions: Array<{ title: string; context: string; decision: string; status: string }>;
  folderStructure?: string;
}

export interface ForgePlan {
  modules: ForgeModule[];
  actors: string[];
  milestones: ForgeMilestone[];
  totalStories: number;
  totalApis: number;
  stack: ForgeStack;
  businessSummary: string;
}

export interface ForgeRequirements {
  functional: string[];
  nonFunctional: string[];
  actors: Array<{ name: string; permissions: string[] }>;
  entities: Array<{ name: string; fields: string[] }>;
  apiContracts: Array<{ method: string; path: string; description: string }>;
  userStories: Array<{ actor: string; action: string; benefit: string }>;
}

export interface GeneratedFile {
  filePath: string;
  language: string;
  content: string;
  serviceId?: string;
  agentType: ForgeAgentType;
  status: 'pending' | 'generating' | 'done' | 'failed';
  lineCount: number;
}

export interface AgentContext {
  projectId: string;
  projectName: string;
  prompt: string;
  phase: ForgePhase;
  plan?: ForgePlan;
  requirements?: ForgeRequirements;
  architecture?: ForgeArchitecture;
  generatedFiles: GeneratedFile[];
  agentStatuses: Partial<Record<ForgeAgentType, AgentStatus>>;
}

export interface AgentHandoff {
  fromAgent: ForgeAgentType;
  toAgent: ForgeAgentType;
  phase: ForgePhase;
  context: AgentContext;
  outputSummary: string;
}

// Phase → responsible agent(s)
export const PHASE_AGENTS: Record<ForgePhase, ForgeAgentType[]> = {
  idea:           ['pm'],
  planning:       ['pm'],
  requirements:   ['pm', 'database'],
  architecture:   ['architect', 'database'],
  design:         ['ux'],
  implementation: ['frontend', 'backend', 'mobile', 'desktop', 'chatbot', 'database'],
  testing:        ['qa', 'security'],
  review:         ['security', 'architect'],
  deployment:     ['devops'],
  monitoring:     ['devops', 'docs'],
};

// Ordered pipeline of phases
export const FORGE_PIPELINE: ForgePhase[] = [
  'idea',
  'planning',
  'requirements',
  'architecture',
  'design',
  'implementation',
  'testing',
  'review',
  'deployment',
  'monitoring',
];
