import type { AgentLifecycleStatus } from '@cerebro/agent-registry-contracts';

export interface LegacyAgentClassificationInput {
  isActive: boolean;
  selectedVersionId: string | null;
}

export interface LegacyAgentClassification {
  lifecycle: AgentLifecycleStatus;
  reviewRequired: boolean;
}

export function classifyLegacyAgent(input: LegacyAgentClassificationInput): LegacyAgentClassification {
  if (!input.selectedVersionId) return { lifecycle: 'DRAFT', reviewRequired: false };
  if (!input.isActive) return { lifecycle: 'SUSPENDED', reviewRequired: true };
  return { lifecycle: 'PRODUCTION', reviewRequired: false };
}
