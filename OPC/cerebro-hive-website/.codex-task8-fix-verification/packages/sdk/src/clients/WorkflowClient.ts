import { BaseClient } from './BaseClient';

export interface WorkflowMetadata {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowNode {
  id: string;
  type: 'agent' | 'tool' | 'condition' | 'start' | 'end';
  position: { x: number; y: number };
  data: any;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface WorkflowConfiguration {
  id: string;
  metadata: WorkflowMetadata;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export class WorkflowClient extends BaseClient {
  constructor(baseUrl: string, headers?: Record<string, string>) {
    super(baseUrl, headers);
  }

  async listWorkflows(params?: { page?: number; limit?: number; search?: string }): Promise<{ data: WorkflowMetadata[]; meta: any }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    const endpoint = `/api/v1/workflows${query ? `?${query}` : ''}`;
    
    return this.fetchJson<{ data: WorkflowMetadata[]; meta: any }>(endpoint);
  }

  async getWorkflow(id: string): Promise<WorkflowConfiguration | null> {
    const res = await this.fetchJson<{ success: boolean; data: WorkflowConfiguration }>(`/api/v1/workflows/${id}`);
    return res.data;
  }

  async executeWorkflow(id: string): Promise<{ executionId: string; status: string }> {
    const res = await this.fetchJson<{ success: boolean; data: any }>(`/api/v1/workflows/${id}/execute`, {
      method: 'POST'
    });
    return res.data;
  }
}
