export interface AgentMetadata {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  version: string;
  owner: string;
  tags: string[];
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  visibility: 'private' | 'team' | 'public';
  createdAt: string;
  updatedAt: string;
}

export interface AgentConfiguration {
  id: string;
  metadata: AgentMetadata;
  promptReference: {
    templateId: string;
    versionId?: string; // If undefined, uses latest published
  };
  modelConfig: {
    provider: string;
    model: string;
    temperature: number;
    topP: number;
    maxTokens: number;
  };
  memoryStrategy: {
    useWorkingMemory: boolean;
    useConversationMemory: boolean;
    useSemanticMemory: boolean;
    knowledgeSources: string[];
  };
  tools: {
    toolId: string;
    enabled: boolean;
    timeoutMs: number;
    retryPolicy: string;
  }[];
  policies: {
    maxBudget?: number;
    allowedTools: string[];
  };
  evaluationProfile: string[];
}

export class AgentClient {
  constructor(private baseUrl: string, private headers?: Record<string, string>) {}

  async listAgents(): Promise<AgentMetadata[]> {
    return [
      {
        id: 'a-1',
        name: 'Customer Support Bot',
        description: 'Handles frontline customer queries and billing issues.',
        version: '1.2.0',
        owner: 'support-team',
        tags: ['support', 'external'],
        status: 'published',
        visibility: 'public',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'a-2',
        name: 'Code Reviewer',
        description: 'Analyzes pull requests for security flaws.',
        version: '0.9.1',
        owner: 'engineering',
        tags: ['internal', 'security'],
        status: 'draft',
        visibility: 'team',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  async getAgent(id: string): Promise<AgentConfiguration | null> {
    return {
      id,
      metadata: {
        id,
        name: 'Customer Support Bot',
        description: 'Handles frontline customer queries and billing issues.',
        version: '1.2.0',
        owner: 'support-team',
        tags: ['support', 'external'],
        status: 'published',
        visibility: 'public',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      promptReference: {
        templateId: 'p-1',
      },
      modelConfig: {
        provider: 'openai',
        model: 'gpt-4o',
        temperature: 0.7,
        topP: 1,
        maxTokens: 2000
      },
      memoryStrategy: {
        useWorkingMemory: true,
        useConversationMemory: true,
        useSemanticMemory: true,
        knowledgeSources: ['kb-support-docs']
      },
      tools: [
        { toolId: 'tool-search', enabled: true, timeoutMs: 5000, retryPolicy: 'exponential' },
        { toolId: 'tool-billing', enabled: true, timeoutMs: 10000, retryPolicy: 'none' }
      ],
      policies: {
        allowedTools: ['tool-search', 'tool-billing']
      },
      evaluationProfile: ['safety', 'grounding', 'quality']
    };
  }

  async createAgent(data: any) {
    // Scaffold: POST /api/v1/agents
    return { id: 'mock-agent-id', ...data };
  }
}
