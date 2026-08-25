import { BaseClient } from './BaseClient';

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

export class AgentClient extends BaseClient {
  constructor(baseUrl: string, headers?: Record<string, string>) {
    super(baseUrl, headers);
  }

  async listAgents(params?: { page?: number; limit?: number; search?: string }): Promise<{ data: AgentMetadata[]; meta: Record<string, unknown> }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    const endpoint = `/api/v1/agents${query ? `?${query}` : ''}`;
    
    return this.fetchJson<{ data: AgentMetadata[]; meta: Record<string, unknown> }>(endpoint);
  }

  async getAgent(id: string): Promise<AgentConfiguration | null> {
    const res = await this.fetchJson<{ success: boolean; data: AgentConfiguration }>(`/api/v1/agents/${id}`);
    return res.data;
  }

  async createAgent(data: Record<string, unknown>): Promise<AgentConfiguration> {
    const res = await this.fetchJson<{ success: boolean; data: AgentConfiguration }>('/api/v1/agents', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  }
}
