export interface PromptMetadata {
  id: string;
  name: string;
  description: string;
  tags: string[];
  owner: string;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface PromptVersion {
  id: string;
  versionId: string;
  promptTemplateId: string;
  version: number;
  content: string;
  variables: { name: string; type: string; required: boolean; defaultValue?: string; source?: string }[];
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  evaluations: any;
  createdAt: string;
}

export class PromptClient {
  constructor(private baseUrl: string, private headers?: Record<string, string>) {}

  async listPrompts(): Promise<PromptMetadata[]> {
    // Scaffold: Fetch from /api/v1/prompts
    return [
      {
        id: 'p-1',
        name: 'customer-support-agent',
        description: 'Primary prompt for handling customer inquiries.',
        tags: ['support', 'customer-facing'],
        owner: 'system',
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'p-2',
        name: 'code-review-assistant',
        description: 'Analyzes pull requests for vulnerabilities.',
        tags: ['engineering', 'security'],
        owner: 'security-team',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  async getPrompt(id: string): Promise<{ metadata: PromptMetadata; history: PromptVersion[] } | null> {
    // Scaffold: Fetch from /api/v1/prompts/:id
    return {
      metadata: {
        id,
        name: 'customer-support-agent',
        description: 'Primary prompt for handling customer inquiries.',
        tags: ['support', 'customer-facing'],
        owner: 'system',
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      history: [
        {
          id: 'v-2',
          versionId: 'v-2',
          promptTemplateId: id,
          version: 2,
          content: 'You are a helpful customer support agent.\nCustomer: {{customer.name}}\nIssue: {{conversation.last_message}}',
          variables: [
            { name: 'customer.name', type: 'string', required: true, source: 'execution context' },
            { name: 'conversation.last_message', type: 'string', required: true, source: 'conversation' }
          ],
          status: 'published',
          evaluations: { safety: 0.99, grounding: 0.95 },
          createdAt: new Date().toISOString()
        },
        {
          id: 'v-1',
          versionId: 'v-1',
          promptTemplateId: id,
          version: 1,
          content: 'You are a helpful customer support agent.\nCustomer: {{customer.name}}',
          variables: [
            { name: 'customer.name', type: 'string', required: true, source: 'execution context' }
          ],
          status: 'archived',
          evaluations: { safety: 0.98, grounding: 0.90 },
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]
    };
  }
}

