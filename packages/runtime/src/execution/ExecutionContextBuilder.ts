import { AgentExecutionContext, Agent, AgentVersion, MemoryContext, PermissionsContext, RuntimeContext } from '@cerebro/domain';
import { randomUUID } from 'crypto';

export class ExecutionContextBuilder {
  private context: Partial<AgentExecutionContext> = {};

  withIdentifiers(conversationId: string, tenantId: string, workspaceId: string, userId: string, sessionId: string) {
    this.context.conversationId = conversationId;
    this.context.tenantId = tenantId;
    this.context.workspaceId = workspaceId;
    this.context.userId = userId;
    this.context.sessionId = sessionId;
    return this;
  }

  withAgent(agent: Agent, version: AgentVersion) {
    this.context.agent = agent;
    this.context.version = version;
    return this;
  }

  withMemory(memory: MemoryContext) {
    this.context.memory = memory;
    return this;
  }

  withPermissions(permissions: PermissionsContext) {
    this.context.permissions = permissions;
    return this;
  }

  withRuntime(runtime: RuntimeContext) {
    this.context.runtime = runtime;
    return this;
  }

  build(): AgentExecutionContext {
    if (!this.context.conversationId || !this.context.agent || !this.context.memory) {
      throw new Error('Incomplete AgentExecutionContext');
    }

    return {
      executionId: randomUUID(),
      conversationId: this.context.conversationId,
      tenantId: this.context.tenantId!,
      workspaceId: this.context.workspaceId!,
      userId: this.context.userId!,
      sessionId: this.context.sessionId!,
      agent: this.context.agent,
      version: this.context.version!,
      memory: this.context.memory,
      variables: this.context.variables || {},
      tools: this.context.tools || [],
      permissions: this.context.permissions || { roles: [], allowedTools: [] },
      runtime: this.context.runtime || { executionMode: 'sync', tokenBudget: { maxTokens: 4096, tokensUsed: 0 } },
      metadata: this.context.metadata || {}
    };
  }
}
