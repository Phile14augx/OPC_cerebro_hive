import type { AgentRuntimeService } from "@cerebro/agent-builder-capability";
import type { AgentRepository, RequestContext } from "@cerebro/db";
import type { AgentExecutionContext } from "@cerebro/domain";
import { randomUUID } from "node:crypto";

import type { ServerCommand } from "./commandSchemas";
import { OperatingEventStream } from "./OperatingEventStream";
import { OperatingSystemService } from "./OperatingSystemService";

export class UnsupportedOperatingCommandError extends Error {}
export class TaskPersistenceNotInstalledError extends Error {}
export class OperatingCommandService {
  constructor(private readonly operatingSystemService: OperatingSystemService, private readonly runtime: AgentRuntimeService, private readonly agentRepository: AgentRepository, private readonly events: OperatingEventStream) {}
  async dispatch(context: RequestContext, command: ServerCommand) {
    if (command.kind === "create-task") throw new TaskPersistenceNotInstalledError();
    const target = await this.operatingSystemService.getEntityDetail(context, "agent", command.targetId);
    if (!target) throw new UnsupportedOperatingCommandError("TARGET_NOT_FOUND");
    const version = await this.agentRepository.getLatestVersion(command.targetId, { context });
    if (!version || !version.modelId || typeof version.instructions !== "string") throw new UnsupportedOperatingCommandError("AGENT_VERSION_NOT_FOUND");
    const id = randomUUID();
    this.events.publish({ id, event: "execution", source: "execution", workspaceId: context.workspaceId!, occurredAt: new Date().toISOString(), data: { id, status: "running", targetId: command.targetId } });
    const executionContext: AgentExecutionContext = { conversationId: id, tenantId: context.tenantId, workspaceId: context.workspaceId!, userId: context.userId ?? "anonymous", traceId: context.traceId!, correlationId: context.correlationId!, agentVersionId: version.id, promptVersionId: version.id, modelId: version.modelId, memory: { workingMemory: {}, conversationHistory: [] }, availableTools: [], tokenBudget: { maxTokens: 4096, tokensUsed: 0 }, executionMode: "sync" };
    void this.runtime.execute(executionContext, typeof command.input.message === "string" ? command.input.message : "Execute requested operating-system action", version.instructions).then(() => this.events.publish({ id: randomUUID(), event: "execution", source: "execution", workspaceId: context.workspaceId!, occurredAt: new Date().toISOString(), data: { id, status: "completed", targetId: command.targetId } })).catch(() => this.events.publish({ id: randomUUID(), event: "execution", source: "execution", workspaceId: context.workspaceId!, occurredAt: new Date().toISOString(), data: { id, status: "failed", targetId: command.targetId } }));
    return { id, status: "running" as const };
  }
}
