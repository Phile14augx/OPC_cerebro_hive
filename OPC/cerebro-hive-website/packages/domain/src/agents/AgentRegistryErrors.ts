import { DomainError } from '../errors/DomainError';

export class AgentRegistryError extends DomainError {
  constructor(code: string, message: string, public readonly details: Record<string, unknown> = {}) {
    super(message, code);
  }
}

export interface AgentRegistryActorContext {
  tenantId: string;
  workspaceId: string;
  userId?: string;
  permissions: string[];
  traceId?: string;
  correlationId?: string;
}

export function requireAgentCapability(context: AgentRegistryActorContext, permission: string): AgentRegistryError | null {
  return context.permissions.includes('*') || context.permissions.includes(permission)
    ? null
    : new AgentRegistryError('AGENT_FORBIDDEN', `Missing required capability: ${permission}`);
}

export function normalizeAgentRegistryError(error: unknown): AgentRegistryError {
  if (error instanceof AgentRegistryError) return error;
  if (error && typeof error === 'object' && 'code' in error) {
    const value = error as { code: string; message?: string; details?: Record<string, unknown> };
    return new AgentRegistryError(value.code, value.message ?? value.code, value.details ?? {});
  }
  return new AgentRegistryError('AGENT_REGISTRY_ERROR', error instanceof Error ? error.message : 'Agent registry operation failed');
}
