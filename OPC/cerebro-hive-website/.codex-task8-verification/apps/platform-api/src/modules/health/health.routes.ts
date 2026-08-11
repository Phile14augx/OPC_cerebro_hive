import { FastifyInstance } from 'fastify';

export default async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/live', async () => {
    return { status: 'UP' };
  });

  fastify.get('/readiness', async () => {
    // Check DB, Redis, etc here in the future
    return { status: 'UP' };
  });

  fastify.get('/startup', async () => {
    return { status: 'UP' };
  });

  fastify.get('/health', async () => {
    return { status: 'UP', version: process.env.npm_package_version || '1.0.0' };
  });

  fastify.get('/version', async () => {
    return { version: process.env.npm_package_version || '1.0.0' };
  });

  fastify.get('/metrics', async (request, reply) => {
    // Return Prometheus metrics from OpenTelemetry in the future
    return reply.type('text/plain').send('# HELP up CerebroHive platform is up\nup 1\n');
  });
}
