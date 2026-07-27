import { PrismaClient } from '@prisma/client';
import { bootstrap } from './bootstrap';

import { AgentRepository, IdempotencyRepository, OutboxRepository, AuditRepository, PrismaUnitOfWork } from '@cerebro/database';
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
    aiGateway,
    toolRuntime,
    toolRegistry,
  });

  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    server.log.info('CerebroHive Platform API is running on http://localhost:3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
