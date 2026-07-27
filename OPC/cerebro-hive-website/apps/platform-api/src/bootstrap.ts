import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

import { requestContextHook } from './middleware/RequestContextMiddleware';
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

  // Routes
  server.register(healthRoutes, { prefix: '/' });
  server.register(agentRoutes, { prefix: '/api/v1/agents', bus, agentRepository: deps.agentRepository });
  server.register(workflowsRoutes, { prefix: '/api/v1/workflows' });
  server.register(telemetryRoutes, { prefix: '/api/v1/telemetry' });
  server.register(runtimeRoutes, { prefix: '/api/v1/runtime' });
  server.register(conversationsRoutes, {
    prefix: '/api/v1/conversations',
    agentRuntimeService: deps.agentRuntimeService,
    agentRepository: deps.agentRepository,
  });

  return server;
}
