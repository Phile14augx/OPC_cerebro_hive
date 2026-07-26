
export interface PromptVersion {
  id: string;
  promptId: string;
  version: number;
  template: string;
  variables: string[];
  approvalStatus: 'draft' | 'review' | 'approved' | 'deprecated';
  metadata: {
    owner: string;
    intendedAgent: string;
    supportedModels: string[];
    temperatureDefault: number;
    maxTokens: number;
  };
}

export interface PromptResolver {
  resolve(promptId: string, variables: Record<string, string>): Promise<string>;
}
