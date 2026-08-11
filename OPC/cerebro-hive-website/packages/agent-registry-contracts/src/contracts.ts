import type { AgentDefinitionV1, AgentDraftDocumentV1, DefinitionValidationError } from './agent-definition';

export type AgentLifecycleStatus = 'DRAFT' | 'SANDBOX' | 'CERTIFIED' | 'PRODUCTION' | 'SUSPENDED';
export type AgentDraftValidationStatus = 'UNVALIDATED' | 'VALID' | 'INVALID';
export type AgentLifecycleAction = 'enter_sandbox' | 'certify' | 'promote_to_production' | 'suspend' | 'reactivate';

export interface AgentDraftDto {
  id: string;
  agentId: string;
  baseVersionId: string | null;
  revision: number;
  validationStatus: AgentDraftValidationStatus;
  validationErrors: DefinitionValidationError[];
  definition?: AgentDraftDocumentV1;
  updatedBy: string | null;
  updatedAt: string;
}

export interface AgentVersionDto {
  id: string;
  agentId: string;
  version: number;
  definition: AgentDefinitionV1;
  definitionHash: string;
  publishedBy: string | null;
  publishedAt: string;
}

export interface AgentRegistryRecordDto {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  lifecycleStatus: AgentLifecycleStatus;
  ownerId: string | null;
  activeVersionId: string | null;
  activeVersion: AgentVersionDto | null;
  draft: Omit<AgentDraftDto, 'definition'> | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAgentDraftCommand {
  expectedRevision: number;
  definition: AgentDraftDocumentV1;
}

export interface PublishAgentDraftCommand {
  expectedDraftRevision: number;
}

export interface TransitionAgentLifecycleCommand {
  action: AgentLifecycleAction;
}
