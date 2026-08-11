import type { FastifyPluginAsync } from 'fastify';
import { Value } from '@sinclair/typebox/value';

import {
  isOperatingNodeType,
  type DemoMode,
} from '../../../../../packages/shared-types/src/domain/operating-system';
import {
  DemoModeDisabledError,
  OperatingSystemService,
} from './OperatingSystemService';
import { CommandRequestSchema, parseServerCommandText, type ServerCommand } from './commandSchemas';
import { OperatingCommandService, TaskPersistenceNotInstalledError, UnsupportedOperatingCommandError } from './OperatingCommandService';
import { OperatingEventStream } from './OperatingEventStream';

interface OperatingSystemRouteOptions {
  operatingSystemService: OperatingSystemService;
  operatingCommandService?: OperatingCommandService;
  operatingEventStream?: OperatingEventStream;
}

const operatingSystemRoutes: FastifyPluginAsync<OperatingSystemRouteOptions> =
  async (server, options) => {
    server.get('/graph', async (request, reply) => {
      const { mode } = request.query as { mode?: unknown };
      if (mode !== undefined && mode !== 'live' && mode !== 'demo') {
        return reply.code(400).send({ error: 'INVALID_MODE' });
      }

      try {
        const data = await options.operatingSystemService.getSnapshot(
          request.cerebroContext,
          (mode ?? 'live') as DemoMode,
        );
        return { data };
      } catch (error) {
        if (error instanceof DemoModeDisabledError) {
          return reply.code(403).send({ error: 'DEMO_MODE_DISABLED' });
        }
        throw error;
      }
    });

    server.get('/entities/:type/:id', async (request, reply) => {
      const { type, id } = request.params as { type: unknown; id: unknown };
      if (!isOperatingNodeType(type)) {
        return reply.code(400).send({ error: 'INVALID_ENTITY_TYPE' });
      }
      if (typeof id !== 'string' || id.trim().length === 0) {
        return reply.code(400).send({ error: 'INVALID_ENTITY_ID' });
      }

      const data = await options.operatingSystemService.getEntityDetail(
        request.cerebroContext,
        type,
        id,
      );
      if (!data) {
        return reply.code(404).send({ error: 'ENTITY_NOT_FOUND' });
      }
      return { data };
    });

    server.post('/commands', async (request, reply) => {
      const payload = request.body as Record<string, unknown>;
      if (!Value.Check(CommandRequestSchema, payload)) {
        return reply.code(422).send({ error: 'UNSUPPORTED_COMMAND' });
      }
      const command = 'text' in payload ? parseServerCommandText(payload.text as string) : payload as ServerCommand;
      if (!command) return reply.code(422).send({ error: 'UNSUPPORTED_COMMAND' });
      if (command.kind === 'create-task') {
        return reply.code(501).send({ error: 'TASK_PERSISTENCE_NOT_INSTALLED' });
      }
      if (!options.operatingCommandService) {
        return reply.code(501).send({ error: 'RUNTIME_DISPATCH_NOT_INSTALLED' });
      }
      try {
        const data = await options.operatingCommandService.dispatch(request.cerebroContext, command);
        return reply.code(202).send({ data });
      } catch (error) {
        if (error instanceof TaskPersistenceNotInstalledError) return reply.code(501).send({ error: 'TASK_PERSISTENCE_NOT_INSTALLED' });
        if (error instanceof UnsupportedOperatingCommandError) return reply.code(422).send({ error: error.message || 'UNSUPPORTED_COMMAND' });
        throw error;
      }
    });

    server.get('/events', async (request, reply) => {
      const { cursor } = request.query as { cursor?: string };
      const stream = options.operatingEventStream;
      const workspaceId = request.cerebroContext.workspaceId!;
      if (cursor && (!stream || !stream.isValidCursor(cursor, workspaceId))) return reply.code(400).send({ error: 'INVALID_CURSOR' });
      reply.hijack();
      reply.raw.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive' });
      const write = (event: { id: string; event: string; data: Record<string, unknown> }) => reply.raw.write(`id: ${stream?.cursorFor(event as never) ?? event.id}\nevent: ${event.event}\ndata: ${JSON.stringify(event.data)}\n\n`);
      const unsubscribe = stream?.subscribeWithReplay(workspaceId, cursor, write);
      const heartbeat = setInterval(() => reply.raw.write(': heartbeat\n\n'), 15_000);
      request.raw.once('close', () => { clearInterval(heartbeat); unsubscribe?.(); });
    });
  };

export default operatingSystemRoutes;
