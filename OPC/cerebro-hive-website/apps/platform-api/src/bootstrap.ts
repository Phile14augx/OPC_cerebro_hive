import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

import { requestContextHook } from './middleware/RequestContextMiddleware';
import { requireAuthHook } from './middleware/AuthMiddleware';
import { createRequireWorkspaceAccessHook } from './middleware/WorkspaceAccessMiddleware';
import type { WorkspaceRepository } from '@cerebro/database';
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
import type { AgentRuntimeService, ToolRuntime, ToolRegistry } from '@cerebro/agent-builder-capability';
import type { AgentRepository } from '@cerebro/database';
import type { AIGateway } from '@cerebro/ai-gateway';

export interface BootstrapDeps {
  agentRuntimeService: AgentRuntimeService;
  agentRepository: AgentRepository;
  workspaceRepository: WorkspaceRepository;
  aiGateway: AIGateway;
  toolRuntime: ToolRuntime;
  toolRegistry: ToolRegistry;
}

export async function bootstrap(bus: CommandBus, deps: BootstrapDeps) {
  // Initialize Runtime Registry: mock providers first (unchanged), then the
  // real AIGateway-backed LLM provider and the real ToolRuntime-backed tool
  // provider, both at higher priority than any mock — see
  // AIGatewayProviders.ts / ToolRuntimeProvider.ts. RuntimeRegistry.resolve()
  // prefers the real ones whenever they're healthy.
  registerMockProviders();
  registerAIGatewayProvider(deps.aiGateway);
  registerToolRuntimeProvider(deps.toolRuntime, deps.toolRegistry);

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

  // Global Middleware
  server.addHook('preHandler', requestContextHook);

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
    protectedApi.register(runtimeRoutes, { prefix: '/api/v1/runtime' });
    protectedApi.register(conversationsRoutes, {
      prefix: '/api/v1/conversations',
      agentRuntimeService: deps.agentRuntimeService,
      agentRepository: deps.agentRepository,
    });
  });

  return server;
}
