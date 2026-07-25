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
import { CommandBus } from '@cerebro/core-bus';
import { registerMockProviders } from './modules/runtime/providers/MockProviders';

export async function bootstrap(bus: CommandBus) {
  // Initialize Runtime Registry and Mock Providers
  registerMockProviders();

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
  server.register(agentRoutes, { prefix: '/api/v1/agents', bus });
  server.register(workflowsRoutes, { prefix: '/api/v1/workflows' });
  server.register(telemetryRoutes, { prefix: '/api/v1/telemetry' });
  server.register(runtimeRoutes, { prefix: '/api/v1/runtime' });

  return server;
}
