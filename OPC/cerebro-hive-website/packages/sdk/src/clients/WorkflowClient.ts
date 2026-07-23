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

export class WorkflowClient {
  constructor(private baseUrl: string, private headers?: Record<string, string>) {}

  async listWorkflows(): Promise<WorkflowMetadata[]> {
    return [
      {
        id: 'w-1',
        name: 'Customer Onboarding',
        description: 'Handles new customer registration, welcome email, and initial CRM setup.',
        status: 'published',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'w-2',
        name: 'Incident Response',
        description: 'Triage incoming alerts, query logs, and notify on-call if necessary.',
        status: 'draft',
        version: '0.1.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  async getWorkflow(id: string): Promise<WorkflowConfiguration | null> {
    return {
      id,
      metadata: {
        id,
        name: 'Customer Onboarding',
        description: 'Handles new customer registration, welcome email, and initial CRM setup.',
        status: 'published',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      nodes: [
        { id: 'node-start', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Trigger' } },
        { id: 'node-agent-1', type: 'agent', position: { x: 250, y: 150 }, data: { label: 'Data Extractor Agent', agentId: 'a-3' } },
        { id: 'node-condition-1', type: 'condition', position: { x: 250, y: 250 }, data: { label: 'Is Valid?' } },
        { id: 'node-tool-1', type: 'tool', position: { x: 100, y: 350 }, data: { label: 'CRM Sync Tool', toolId: 'tool-crm' } },
        { id: 'node-tool-2', type: 'tool', position: { x: 400, y: 350 }, data: { label: 'Alert Tool', toolId: 'tool-alert' } },
        { id: 'node-end', type: 'end', position: { x: 250, y: 450 }, data: { label: 'End' } }
      ],
      edges: [
        { id: 'e-1', source: 'node-start', target: 'node-agent-1' },
        { id: 'e-2', source: 'node-agent-1', target: 'node-condition-1' },
        { id: 'e-3', source: 'node-condition-1', target: 'node-tool-1', sourceHandle: 'true' },
        { id: 'e-4', source: 'node-condition-1', target: 'node-tool-2', sourceHandle: 'false' },
        { id: 'e-5', source: 'node-tool-1', target: 'node-end' },
        { id: 'e-6', source: 'node-tool-2', target: 'node-end' }
      ]
    };
  }
}
