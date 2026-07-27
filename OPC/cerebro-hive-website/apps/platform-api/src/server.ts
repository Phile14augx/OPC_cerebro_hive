import { PrismaClient } from '@prisma/client';
import { bootstrap } from './bootstrap';

import { AgentRepository, IdempotencyRepository, OutboxRepository, AuditRepository, WorkspaceRepository, PrismaUnitOfWork } from '@cerebro/database';
import { AgentApplicationService, UnitOfWork, OutboxPublisher, AuditLogger, PolicyEngine, AgentValidator } from '@cerebro/domain';
import { AgentBuilderCapability, AgentRuntimeService, ToolRuntime, ToolRegistry } from '@cerebro/agent-builder-capability';
import { createGateway } from '@cerebro/ai-gateway';

import { CommandBus, QueryBus, DomainEventBus } from '@cerebro/core-bus';
import { CreateAgentCommand } from './modules/agents/agents.commands';
import { CreateAgentCommandHandler } from './modules/agents/agents.handlers';

async function main() {
  // 1. Database
  const prisma = new PrismaClient();

  // 2. Repositories
  const agentRepo = new AgentRepository(prisma);
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

  // 5. Message Buses
  const commandBus = new CommandBus();
  const queryBus = new QueryBus();
  const eventBus = new DomainEventBus();

  // Register Handlers
  commandBus.register('CreateAgentCommand', new CreateAgentCommandHandler(agentBuilderCapability));

  // 6. Bootstrap Fastify
  const server = await bootstrap(commandBus, {
    agentRuntimeService,
    agentRepository: agentRepo,
    workspaceRepository: workspaceRepo,
    aiGateway,
    toolRuntime,
    toolRegistry,
  });

  try {
    // Was hardcoded to 3000. The Helm chart injects PORT=4000 (platformApi.port
    // in values.yaml) as an env var into the container; this code ignored it
    // completely, so the Deployment's containerPort/readiness probe (4000)
    // and the actual listening socket (3000) never matched — the pod could
    // not have passed a readiness check against api.cerebrohive.com. See
    // audit/MILESTONE-25.5-PRODUCTION-READINESS.md.
    const port = Number(process.env.PORT) || 3000;
    await server.listen({ port, host: '0.0.0.0' });
    server.log.info(`CerebroHive Platform API is running on http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
