import { prisma } from '@cerebro/db';
import { bootstrap } from './bootstrap';

import { AgentRepository, AgentConversationRepository, IdempotencyRepository, OutboxRepository, AuditRepository, WorkspaceRepository, PrismaUnitOfWork } from '@cerebro/db';
import { AgentApplicationService, OutboxPublisher, AuditLogger, PolicyEngine, AgentValidator } from '@cerebro/domain';
import { AgentBuilderCapability, AgentRuntimeService, ToolRuntime, ToolRegistry } from '@cerebro/agent-builder-capability';
import { createGateway } from '@cerebro/ai-gateway';

import { CommandBus } from '@cerebro/core-bus';
import { CreateAgentCommandHandler } from './modules/agents/agents.handlers';

import { PrismaExecutionStore } from '@cerebro/db';
import { ExecutionManager } from '@cerebro/runtime-core/src/execution/ExecutionManager';
import { ExecutionReplayService } from '@cerebro/runtime-core/src/execution/ExecutionReplayService';
import { ExecutionIdempotencyGuard } from '@cerebro/runtime-core/src/execution/ExecutionIdempotency';
import { ExecutionOutbox } from '@cerebro/runtime-core/src/execution/ExecutionOutbox';
import { ReducerRegistry } from '@cerebro/runtime-core/src/registry/ReducerRegistry';
import { ExecutionEventRegistry } from '@cerebro/runtime-core/src/registry/ExecutionEventRegistry';

import { ExecutionCommandHandler } from '@cerebro/runtime-core/src/execution/commands/ExecutionCommandHandler';
import { StartExecutionValidator, ResumeExecutionValidator, CancelExecutionValidator } from '@cerebro/runtime-core/src/execution/commands/ExecutionValidator';
import { ExecutionRuntimeKernel } from '@cerebro/runtime-core/src/execution/kernel/ExecutionRuntimeKernel';

async function main() {
  // 1. Database (shared, adapter-wired singleton from @cerebro/db)

  // 2. Repositories
  const agentRepo = new AgentRepository(prisma);
  const agentConversationRepo = new AgentConversationRepository(prisma);
  const outboxRepo = new OutboxRepository(prisma);
  const auditRepo = new AuditRepository(prisma);
  const idempotencyRepo = new IdempotencyRepository(prisma);
  const workspaceRepo = new WorkspaceRepository(prisma);

  // 3. Domain Services
  const uow = new PrismaUnitOfWork(prisma);
  const outboxPublisher = new OutboxPublisher(outboxRepo);
  const auditLogger = new AuditLogger(auditRepo);
  const policyEngine = new PolicyEngine({});
  const agentValidator = new AgentValidator();

  const agentAppService = new AgentApplicationService(
    agentRepo,
    uow,
    outboxPublisher,
    auditLogger,
    policyEngine,
    agentValidator,
    idempotencyRepo
  );

  // 4. Capability Layer
  const agentBuilderCapability = new AgentBuilderCapability(agentAppService);

  // 4b. Agent Runtime. AgentRuntimeService no longer holds AIGateway
  // directly — it resolves an LLMProvider via the shared RuntimeRegistry
  // (packages/runtime-core). The gateway is still constructed here and
  // handed to bootstrap(), which registers it into that registry alongside
  // the mock providers (see AIGatewayProviders.ts / MockProviders.ts). Tool
  // execution is wired but no tools are registered yet — see M10.2/M10.3.
  const aiGateway = createGateway();
  const toolRegistry = new ToolRegistry();
  const toolRuntime = new ToolRuntime(toolRegistry);
  const agentRuntimeService = new AgentRuntimeService();

  // 4c. Register built-in tools.
  // Proof-of-concept: current_time. More tools will be added as real
  // capabilities are implemented — this exists to verify the full
  // tool-calling pipeline (model → gateway → runtime → executor → loop).
  toolRegistry.register(
    {
      id: 'current-time',
      name: 'current_time',
      description: 'Returns the current date and time in ISO 8601 format. Use this when the user asks about the current time, date, or needs temporal context.',
      version: '1.0.0',
      executionMode: 'sync',
      permissions: [],
      timeoutMs: 5000,
      retryPolicy: { maxRetries: 0, backoffFactor: 1 },
      inputSchema: { type: 'object', properties: {}, required: [] },
      outputSchema: { type: 'object', properties: { time: { type: 'string' } } },
    },
    { execute: async () => ({ time: new Date().toISOString() }) }
  );

  // 4d. P5 Durable Execution Components
  const executionStore = new PrismaExecutionStore(prisma);
  const executionReplayService = new ExecutionReplayService(
    executionStore,
    new ReducerRegistry(),
    new ExecutionEventRegistry(),
  );
  const executionIdempotencyGuard = new ExecutionIdempotencyGuard(executionStore);
  
  // Dummy Outbox implementation for now (to be replaced by PrismaExecutionOutbox)
  const dummyOutbox: ExecutionOutbox = {
    publish: async () => {},
    fetchPending: async () => [],
    markSent: async () => {},
    markFailed: async () => {}
  };

  const executionManager = new ExecutionManager(
    executionStore,
    executionReplayService,
    executionIdempotencyGuard,
    dummyOutbox,
    null as never, // llmProvider to be resolved from registry
    null as never  // toolProvider to be resolved from registry
  );

  const commandHandler = new ExecutionCommandHandler(executionManager);
  commandHandler.registerValidator('StartExecutionCommand', new StartExecutionValidator());
  commandHandler.registerValidator('ResumeExecutionCommand', new ResumeExecutionValidator());
  commandHandler.registerValidator('CancelExecutionCommand', new CancelExecutionValidator());

  const executionKernel = new ExecutionRuntimeKernel(commandHandler);

  // 5. Message Buses
  const commandBus = new CommandBus();

  // Register Handlers
  commandBus.register('CreateAgentCommand', new CreateAgentCommandHandler(agentBuilderCapability));

  // 6. Bootstrap Fastify
  const server = await bootstrap(commandBus, {
    agentRuntimeService,
    agentRepository: agentRepo,
    agentConversationRepository: agentConversationRepo,
    workspaceRepository: workspaceRepo,
    aiGateway,
    toolRuntime,
    toolRegistry,
    unitOfWork: uow,
    executionKernel,
    executionStore,
    executionReplayService,
  });

  try {
    // Was hardcoded to 3000. The Helm chart injects PORT=4000 (platformApi.port
    // in values.yaml) as an env var into the container; this code ignored it
    // completely, so the Deployment's containerPort/readiness probe (4000)
    // and the actual listening socket (3000) never matched — the pod could
    // not have passed a readiness check against api.cerebrohive.com. See
    // audit/MILESTONE-25.5-PRODUCTION-READINESS.md.
    const port = Number(process.env.PORT) || 3406;
    await server.listen({ port, host: '0.0.0.0' });
    server.log.info(`CerebroHive Platform API is running on http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();

