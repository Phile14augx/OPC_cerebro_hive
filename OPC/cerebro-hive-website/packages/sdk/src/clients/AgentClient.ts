import type {
  AgentDraftDto,
  AgentLifecycleAction,
  AgentRegistryRecordDto,
  AgentVersionDto,
  PublishAgentDraftCommand,
  TransitionAgentLifecycleCommand,
  UpdateAgentDraftCommand,
} from '@cerebro/agent-registry-contracts';
import { BaseClient } from './BaseClient';

export type AgentMetadata = AgentRegistryRecordDto;
// Kept as a legacy read contract while older Studio components are retired.
// Registry methods below return AgentRegistryRecordDto and never populate this shape.
export interface AgentConfiguration {
  id: string;
  metadata: { name: string; description: string; avatar?: string; version: string; owner: string; tags: string[]; status: string; visibility: string; createdAt: string; updatedAt: string };
  promptReference: { templateId: string; versionId?: string };
  modelConfig: { provider: string; model: string; temperature: number; topP: number; maxTokens: number };
  memoryStrategy: { useWorkingMemory: boolean; useConversationMemory: boolean; useSemanticMemory: boolean; knowledgeSources: string[] };
  tools: { toolId: string; enabled: boolean; timeoutMs: number; retryPolicy: string }[];
  policies: { maxBudget?: number; allowedTools: string[] };
  evaluationProfile: string[];
}

interface ApiEnvelope<T> { success: boolean; data: T }

export class AgentClient extends BaseClient {
  constructor(baseUrl: string, headers?: Record<string, string>) {
    super(baseUrl, headers);
  }

  async listAgents(params?: { page?: number; limit?: number; search?: string }): Promise<{ data: AgentRegistryRecordDto[]; meta: { total: number } }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    const query = queryParams.toString();
    const response = await this.fetchJson<ApiEnvelope<AgentRegistryRecordDto[]>>(`/api/v1/agents${query ? `?${query}` : ''}`);
    return { data: response.data, meta: { total: response.data.length } };
  }

  async getAgent(id: string): Promise<AgentRegistryRecordDto | null> {
    return (await this.fetchJson<ApiEnvelope<AgentRegistryRecordDto>>(`/api/v1/agents/${id}`)).data;
  }

  async createAgent(data: { name: string; description?: string }): Promise<AgentRegistryRecordDto> {
    return (await this.fetchJson<ApiEnvelope<AgentRegistryRecordDto>>('/api/v1/agents', {
      method: 'POST', body: JSON.stringify(data),
    })).data;
  }

  async getDraft(id: string): Promise<AgentDraftDto> {
    return (await this.fetchJson<ApiEnvelope<AgentDraftDto>>(`/api/v1/agents/${id}/draft`)).data;
  }

  async updateDraft(id: string, command: UpdateAgentDraftCommand): Promise<AgentDraftDto> {
    return (await this.fetchJson<ApiEnvelope<AgentDraftDto>>(`/api/v1/agents/${id}/draft`, {
      method: 'PATCH', body: JSON.stringify(command),
    })).data;
  }

  async listVersions(id: string): Promise<AgentVersionDto[]> {
    return (await this.fetchJson<ApiEnvelope<AgentVersionDto[]>>(`/api/v1/agents/${id}/versions`)).data;
  }

  async getVersion(id: string, versionId: string): Promise<AgentVersionDto> {
    return (await this.fetchJson<ApiEnvelope<AgentVersionDto>>(`/api/v1/agents/${id}/versions/${versionId}`)).data;
  }

  async publishDraft(id: string, command: PublishAgentDraftCommand, idempotencyKey?: string): Promise<unknown> {
    return (await this.fetchJson<ApiEnvelope<unknown>>(`/api/v1/agents/${id}/publish`, {
      method: 'POST',
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      body: JSON.stringify(command),
    })).data;
  }

  async transitionLifecycle(id: string, command: TransitionAgentLifecycleCommand | { action: AgentLifecycleAction }): Promise<AgentRegistryRecordDto> {
    return (await this.fetchJson<ApiEnvelope<AgentRegistryRecordDto>>(`/api/v1/agents/${id}/lifecycle`, {
      method: 'POST', body: JSON.stringify(command),
    })).data;
  }
}
