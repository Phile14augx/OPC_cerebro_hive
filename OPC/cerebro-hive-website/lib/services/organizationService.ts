export type DepartmentTheme = 'executive' | 'engineering' | 'research' | 'consulting' | 'business';

export interface OrgMetrics {
  employees: number;
  teams: number;
  projects: number;
  countries?: number;
  [key: string]: number | undefined;
}

export interface OrganizationNodeData extends Record<string, unknown> {
  id: string;
  type: 'executive' | 'department' | 'team';
  theme: DepartmentTheme;
  title: string;
  subtitle?: string;
  description?: string;
  avatar?: string;
  metrics?: OrgMetrics;
  capabilities?: string[];
  technologies?: string[];
  parentId?: string;
  hasChildren?: boolean;
}

// Mock Database
const MOCK_DB: Record<string, OrganizationNodeData> = {
  'ceo': {
    id: 'ceo',
    type: 'executive',
    theme: 'executive',
    title: 'Philemon V Nath',
    subtitle: 'Founder & CEO',
    avatar: '/images/leadership/philemon.png',
    description: 'Leading CerebroHive Strategy',
    metrics: { employees: 68, teams: 17, projects: 29, countries: 5 },
    capabilities: ['Enterprise Strategy', 'Vision', 'Growth'],
    hasChildren: true
  },
  'engineering': {
    id: 'engineering',
    type: 'department',
    theme: 'engineering',
    title: 'Engineering',
    subtitle: 'Building the infrastructure behind every product.',
    avatar: '/images/leadership/marcus.png',
    metrics: { employees: 42, teams: 8, projects: 14 },
    capabilities: ['Platform Architecture', 'Cloud', 'Backend', 'AI Systems'],
    technologies: ['Go', 'Python', 'Rust', 'Kubernetes'],
    parentId: 'ceo',
    hasChildren: true
  },
  'research': {
    id: 'research',
    type: 'department',
    theme: 'research',
    title: 'Research',
    subtitle: 'Exploring the future of enterprise intelligence.',
    avatar: '/images/leadership/elena.png',
    metrics: { employees: 15, teams: 4, projects: 23 },
    capabilities: ['Multimodal AI', 'Reasoning Systems', 'Evaluation'],
    technologies: ['PyTorch', 'JAX', 'CUDA'],
    parentId: 'ceo',
    hasChildren: true
  },
  'consulting': {
    id: 'consulting',
    type: 'department',
    theme: 'consulting',
    title: 'Consulting',
    subtitle: 'Delivering transformation to enterprise clients.',
    metrics: { employees: 8, teams: 3, projects: 87 },
    capabilities: ['AI Strategy', 'Operating Models', 'Governance'],
    parentId: 'ceo',
    hasChildren: false
  },
  'business': {
    id: 'business',
    type: 'department',
    theme: 'business',
    title: 'Business',
    subtitle: 'Driving growth and ecosystem partnerships.',
    metrics: { employees: 3, teams: 2, projects: 0 },
    capabilities: ['Partnerships', 'Sales', 'Marketing'],
    parentId: 'ceo',
    hasChildren: false
  },
  // Engineering Teams
  'eng-platform': {
    id: 'eng-platform',
    type: 'team',
    theme: 'engineering',
    title: 'Platform Architecture',
    subtitle: 'Core Kubernetes & Compute',
    metrics: { employees: 12, teams: 0, projects: 3 },
    parentId: 'engineering',
    hasChildren: false
  },
  'eng-backend': {
    id: 'eng-backend',
    type: 'team',
    theme: 'engineering',
    title: 'Backend Systems',
    subtitle: 'Microservices & Data',
    metrics: { employees: 18, teams: 0, projects: 8 },
    parentId: 'engineering',
    hasChildren: false
  },
  'eng-ai': {
    id: 'eng-ai',
    type: 'team',
    theme: 'engineering',
    title: 'AI Systems',
    subtitle: 'Inference & Model Serving',
    metrics: { employees: 12, teams: 0, projects: 3 },
    parentId: 'engineering',
    hasChildren: false
  },
  // Research Teams
  'res-reasoning': {
    id: 'res-reasoning',
    type: 'team',
    theme: 'research',
    title: 'Reasoning Systems',
    subtitle: 'Agentic Frameworks',
    metrics: { employees: 8, teams: 0, projects: 12 },
    parentId: 'research',
    hasChildren: false
  },
  'res-eval': {
    id: 'res-eval',
    type: 'team',
    theme: 'research',
    title: 'Evaluation',
    subtitle: 'Benchmarks & Safety',
    metrics: { employees: 7, teams: 0, projects: 11 },
    parentId: 'research',
    hasChildren: false
  }
};

export const OrganizationService = {
  // Get the root node (CEO)
  getRootNode: async (): Promise<OrganizationNodeData> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_DB['ceo'];
  },

  // Get immediate children of a specific node
  getChildren: async (parentId: string): Promise<OrganizationNodeData[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return Object.values(MOCK_DB).filter(node => node.parentId === parentId);
  },
  
  // Fetch a specific node by ID
  getNode: async (id: string): Promise<OrganizationNodeData | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_DB[id] || null;
  }
};
