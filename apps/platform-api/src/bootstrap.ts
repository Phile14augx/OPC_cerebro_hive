import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

import { requestContextHook } from './middleware/RequestContextMiddleware';
import { requireAuthHook } from './middleware/AuthMiddleware';
import { createRequireWorkspaceAccessHook } from './middleware/WorkspaceAccessMiddleware';
import { onRequestLog, onSendLog } from './middleware/RequestLogger';
import type { WorkspaceRepository, AgentConversationRepository, PrismaUnitOfWork } from '@cerebro/db';
import { ErrorMapper } from './errors/ErrorMapper';
import agentRoutes from './modules/agents/agents.routes';
import workflowsRoutes from './modules/workflows/workflows.routes';
import telemetryRoutes from './modules/telemetry/telemetry.routes';
import healthRoutes from './modules/health/health.routes';
import runtimeRoutes from './modules/runtime/runtime.routes';
import conversationsRoutes from './modules/conversations/conversations.routes';
import { CommandBus } from '@cerebro/core-bus';
import { registerMockProviders } from './modules/runtime/providers/MockProviders';
import { registerAIGatewayProvider } from './modules/runtime/providers/AIGatewayProviders';
import { registerToolRuntimeProvider } from './modules/runtime/providers/ToolRuntimeProvider';
import type { AgentRuntimeService } from '@cerebro/agent-builder-capability';
import type { IToolRegistry, CapabilityResolver, ToolSandbox, IToolEventPublisher } from '@cerebro/tooling';
import type { AgentRepository } from '@cerebro/db';
import type { AIGateway } from '@cerebro/ai-gateway';
import { ExecutionOrchestrator, InMemoryExecutionRepository } from '@cerebro/domain';
import { AgentExecutionProvider } from './modules/runtime/AgentExecutionProvider';
import { ExecutionRuntimeService } from './modules/runtime/ExecutionRuntimeService';
import { executionsRoutes } from './modules/executions/executions.routes';
import type { ExecutionRuntimeKernel } from '@cerebro/runtime-core/src/execution/kernel/ExecutionRuntimeKernel';
import type { ExecutionStore } from '@cerebro/runtime-core/src/execution/ExecutionStore';
import type { ExecutionReplayService } from '@cerebro/runtime-core/src/execution/ExecutionReplayService';

export interface BootstrapDeps {
  agentRuntimeService: AgentRuntimeService;
  agentRepository: AgentRepository;
  agentConversationRepository: AgentConversationRepository;
  workspaceRepository: WorkspaceRepository;
  aiGateway: AIGateway;
  toolRegistry: IToolRegistry;
  unitOfWork: PrismaUnitOfWork;
  executionKernel: ExecutionRuntimeKernel;
  executionStore: ExecutionStore;
  executionReplayService: ExecutionReplayService;
  capabilityResolver: CapabilityResolver;
  sandbox: ToolSandbox;
  eventPublisher: IToolEventPublisher;
}

export async function bootstrap(bus: CommandBus, deps: BootstrapDeps) {
  // Initialize Runtime Registry: mock providers first (unchanged), then the
  // real AIGateway-backed LLM provider and the real ToolRuntime-backed tool
  // provider, both at higher priority than any mock — see
  // AIGatewayProviders.ts / ToolRuntimeProvider.ts. RuntimeRegistry.resolve()
  // prefers the real ones whenever they're healthy.
  registerMockProviders();
  registerAIGatewayProvider(deps.aiGateway);
  registerToolRuntimeProvider(deps.capabilityResolver, deps.toolRegistry, deps.sandbox, deps.eventPublisher);

  // Phase 10.1/10.2 — the first real, live caller of Phase 9's execution
  // runtime. `InMemoryExecutionRepository` is the same standalone, real
  // (not-a-mock) implementation the whole of Phase 9 was built and verified
  // against — there is no database-backed `ExecutionRepository` yet (see
  // hiveforge/TECHNICAL-DEBT.md §2), so every Execution created through this
  // wiring is process-lifetime only, lost on restart. `AgentExecutionProvider`
  // is the one real `ExecutionProviderPort` this engagement has — it bridges
  // to the already-real `AgentRuntimeService`; no other execution kind
  // ('Workflow', 'Tool', 'Evaluation') has a real provider yet, and
  // `runtime.routes.ts` rejects those kinds explicitly rather than silently
  // pretending to execute them.
  const executionRepository = new InMemoryExecutionRepository();
  const agentExecutionProvider = new AgentExecutionProvider(deps.agentRuntimeService, deps.agentRepository);
  const executionOrchestrator = new ExecutionOrchestrator(executionRepository, agentExecutionProvider);
  const executionRuntimeService = new ExecutionRuntimeService(executionOrchestrator, executionRepository);

  const server = Fastify({ logger: true }).withTypeProvider<TypeBoxTypeProvider>();

  // Plugins
  await server.register(cors);
  await server.register(swagger, {
    openapi: {
      info: { title: 'CerebroHive Platform API', version: '1.0.0' },
      servers: [{ url: 'http://localhost:3000' }],
    },
  });
  await server.register(swaggerUi, {
    routePrefix: '/docs',
  });

  // Global Middleware — order matters: context first, then timing, then auth.
  server.addHook('preHandler', requestContextHook);
  server.addHook('onRequest', onRequestLog);
  server.addHook('onSend', onSendLog);

  // Global Error Handler
  server.setErrorHandler((error, request, reply) => {
    // Fastify schema validation errors
    if (error.validation) {
      return reply.code(400).send({
        type: 'https://api.cerebrohive.com/errors/schema-validation',
        title: 'Validation Error',
        status: 400,
        detail: 'Request body or parameters did not match the required schema',
        validation: error.validation
      });
    }

    // Domain & System Errors
    const problem = ErrorMapper.mapToProblemDetails(error, request.cerebroContext?.traceId);
    reply.code(problem.status).send(problem);
  });

  // Health routes stay unauthenticated and outside the protected group below —
  // Kubernetes liveness/readiness probes don't carry a JWT, and if this were
  // gated the pod would never be marked Ready.
  server.register(healthRoutes, { prefix: '/' });

  // Everything else requires a verified JWT. This is a genuine Fastify
  // encapsulation boundary (a nested `register`), not just "add the hook
  // early" — addHook on the root instance would have applied to healthRoutes
  // too. Previously nothing in this file required authentication at all; see
  // audit/P0-AUTH-AUTHZ-GAP.md for the finding this closes.
  server.register(async (protectedApi) => {
    protectedApi.addHook('preHandler', requireAuthHook);
    // Runs after requireAuthHook — needs the verified tenantId it sets.
    // Closes task #44: workspaceId was previously trusted straight from a
    // header with no check that it belongs to the authenticated tenant.
    protectedApi.addHook('preHandler', createRequireWorkspaceAccessHook(deps.workspaceRepository));

    protectedApi.register(agentRoutes, { prefix: '/api/v1/agents', bus, agentRepository: deps.agentRepository });
    protectedApi.register(workflowsRoutes, { prefix: '/api/v1/workflows' });
    protectedApi.register(telemetryRoutes, { prefix: '/api/v1/telemetry' });
    protectedApi.register(runtimeRoutes, { prefix: '/api/v1/runtime', executionRuntimeService });
    protectedApi.register(executionsRoutes, { 
      prefix: '/api/v1/executions',
      executionKernel: deps.executionKernel,
      executionStore: deps.executionStore,
    });
    protectedApi.register(conversationsRoutes, {
      prefix: '/api/v1/conversations',
      agentRuntimeService: deps.agentRuntimeService,
      agentRepository: deps.agentRepository,
      agentConversationRepository: deps.agentConversationRepository,
      unitOfWork: deps.unitOfWork,
    });
  });

  return server;
}

