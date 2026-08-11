import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import sensible from '@fastify/sensible';
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod';
import { uploadRoutes } from './routes/upload.route.js';

export async function buildApp() {
  const app = fastify({
    logger: true,
  });

  // Add type providers
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Register plugins
  await app.register(helmet);
  await app.register(cors);
  await app.register(sensible);
  await app.register(multipart);
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });

  // Swagger setup
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'CerebroArchive API',
        description: 'Enterprise Knowledge Repository API',
        version: '1.0.0',
      },
    },
    transform: jsonSchemaTransform,
  });
  await app.register(swaggerUi, {
    routePrefix: '/docs',
  });

  // Health check
  app.get('/health', async () => {
    return { status: 'ok', service: 'archive-api' };
  });

  // Register v1 routes
  app.register(async (v1) => {
    await v1.register(uploadRoutes);

    v1.post('/search', async (request, reply) => {
      reply.send({ total: 0, results: [] });
    });
  }, { prefix: '/api/v1' });

  return app;
}
