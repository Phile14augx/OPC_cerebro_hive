import type { ExecutionStatus } from "@cerebro/domain";
import { Type } from "@sinclair/typebox";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { ExecutionRuntimeService, PauseNotSupportedError } from "./ExecutionRuntimeService";

export interface RuntimeRouteOptions extends FastifyPluginOptions {
  executionRuntimeService: ExecutionRuntimeService;
}

/**
 * Phase 10.2 — real handlers backed by the Phase 9 execution runtime,
 * replacing the previous mocked responses (hardcoded `mock-uuid-execution-id`,
 * `{ success: true }` regardless of outcome, an empty `executions` array,
 * and a `setInterval`-driven fake SSE stream). See `ADR-052` for the full
 * Implemented/Statically-reviewed/Runtime-verification-blocked breakdown —
 * this file could not be run against a live server in this sandbox (no
 * generated `@prisma/client`), so "real" here means real logic and real
 * dependencies, not "observed working against a live deployment."
 *
 * Uses the same plugin shape as `conversations.routes.ts`
 * (`FastifyInstance`/`FastifyPluginOptions`, `Type` from `@sinclair/typebox`
 * directly) rather than `FastifyPluginAsyncTypebox`'s generic-options form,
 * since that's the already-proven-working pattern this app's other
 * dependency-injected route modules use.
 */
export default async function runtimeRoutes(server: FastifyInstance, opts: RuntimeRouteOptions) {
  const { executionRuntimeService } = opts;

  // Execute
  server.post(
    "/execute",
    {
      schema: {
        description: "Start a new Agent execution",
        tags: ["Runtime"],
        body: Type.Object({
          type: Type.String(), // e.g., 'Agent' — only 'Agent' has a real provider today (see AgentExecutionProvider.ts)
          id: Type.String(), // agentId
          message: Type.String(),
          variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
        }),
        response: {
          202: Type.Object({
            executionId: Type.String(),
            status: Type.String(),
          }),
          422: Type.Object({
            type: Type.String(),
            title: Type.String(),
            status: Type.Number(),
            detail: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { type, id, message } = request.body as { type: string; id: string; message: string };
      const ctx = request.cerebroContext;

      if (type !== "Agent") {
        return reply.code(422).send({
          type: "https://api.cerebrohive.com/errors/unsupported-execution-kind",
          title: "Unsupported execution kind",
          status: 422,
          detail: `No real execution provider exists yet for kind '${type}' — only 'Agent' is supported (see TECHNICAL-DEBT.md).`,
        });
      }

      const execution = await executionRuntimeService.startAgentExecution({
        tenantId: ctx.tenantId,
        workspaceId: ctx.workspaceId,
        userId: ctx.userId,
        // traceId/correlationId are typed optional on RequestContext (some
        // routes don't need them), but requestContextHook unconditionally
        // sets both on every request -- see RequestContextMiddleware.ts.
        traceId: ctx.traceId!,
        correlationId: ctx.correlationId!,
        agentId: id,
        message,
      });

      return reply.code(202).send({
        executionId: execution.id.toString(),
        status: execution.status,
      });
    },
  );

  // Pause — honestly not supported by the current domain model (see
  // ExecutionRuntimeService.pauseExecution()'s own doc comment).
  server.post(
    "/pause",
    {
      schema: {
        description: "Pause a running execution (not currently supported)",
        tags: ["Runtime"],
        body: Type.Object({ executionId: Type.String() }),
      },
    },
    async (_request, reply) => {
      return reply.code(501).send({
        type: "https://api.cerebrohive.com/errors/not-implemented",
        title: "Pause is not supported",
        status: 501,
        detail: new PauseNotSupportedError().message,
      });
    },
  );

  // Resume
  server.post(
    "/resume",
    {
      schema: {
        description: "Resume a WAITING execution",
        tags: ["Runtime"],
        body: Type.Object({ executionId: Type.String() }),
        response: { 200: Type.Object({ executionId: Type.String(), status: Type.String() }) },
      },
    },
    async (request, reply) => {
      const { executionId } = request.body as { executionId: string };
      const execution = await executionRuntimeService.resumeExecution(executionId);
      return reply.send({ executionId: execution.id.toString(), status: execution.status });
    },
  );

  // Cancel
  server.post(
    "/cancel",
    {
      schema: {
        description: "Cancel an execution",
        tags: ["Runtime"],
        body: Type.Object({ executionId: Type.String(), reason: Type.Optional(Type.String()) }),
        response: { 200: Type.Object({ executionId: Type.String(), status: Type.String() }) },
      },
    },
    async (request, reply) => {
      const { executionId, reason } = request.body as { executionId: string; reason?: string };
      const ctx = request.cerebroContext;
      const execution = await executionRuntimeService.cancelExecution(executionId, {
        actor: ctx.userId,
        reason,
      });
      return reply.send({ executionId: execution.id.toString(), status: execution.status });
    },
  );

  // Get Executions
  server.get(
    "/executions",
    {
      schema: {
        description: "List executions for the caller's tenant",
        tags: ["Runtime"],
        querystring: Type.Object({
          status: Type.Optional(Type.String()),
          limit: Type.Optional(Type.Integer()),
        }),
        response: { 200: Type.Array(Type.Any()) },
      },
    },
    async (request, reply) => {
      const { status, limit } = request.query as { status?: string; limit?: number };
      const ctx = request.cerebroContext;
      const executions = await executionRuntimeService.listExecutions(ctx.tenantId, {
        status: status as ExecutionStatus | undefined,
        limit,
      });
      return reply.send(
        executions.map((e) => ({
          id: e.id.toString(),
          kind: e.kind,
          status: e.status,
          createdAt: e.createdAt,
        })),
      );
    },
  );

  // Get Execution by ID
  server.get(
    "/executions/:id",
    {
      schema: {
        description: "Get execution details",
        tags: ["Runtime"],
        params: Type.Object({ id: Type.String() }),
        response: { 200: Type.Any() },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const execution = await executionRuntimeService.getExecution(id);
      return reply.send({
        id: execution.id.toString(),
        kind: execution.kind,
        status: execution.status,
        createdAt: execution.createdAt,
        transitionHistory: execution.transitionHistory,
      });
    },
  );

  // Server-Sent Events stream — Phase 10 scope note: this now reports a
  // real, honest "not yet wired" state instead of a setInterval-driven fake
  // token stream. Real SSE delivery requires subscribing to this
  // Execution's actual event sink (Phase 9g-4's InMemoryEventBus reuse
  // pattern, per ADR-049 decision 5) and is not built in this pass — see
  // ADR-052's Deferred section.
  server.get(
    "/events/stream",
    {
      schema: {
        description: "Stream runtime events via SSE (not yet wired to real events — see ADR-052)",
        tags: ["Runtime"],
        querystring: Type.Object({ executionId: Type.Optional(Type.String()) }),
      },
    },
    async (_request, reply) => {
      reply.raw.setHeader("Content-Type", "text/event-stream");
      reply.raw.setHeader("Cache-Control", "no-cache");
      reply.raw.setHeader("Connection", "keep-alive");
      reply.raw.write(
        `data: ${JSON.stringify({
          type: "NotYetWired",
          detail: "Real event streaming is not implemented in this pass — see ADR-052.",
        })}\n\n`,
      );
      reply.raw.end();
    },
  );
}

// Errors thrown by ExecutionRuntimeService (NotFoundError, InvariantViolationError,
// AuthorizationError, ConcurrencyError — all real DomainError subclasses)
// propagate to the app's existing global error handler (bootstrap.ts's
// setErrorHandler -> ErrorMapper.mapToProblemDetails()), which already maps
// every DomainError code to the correct HTTP status — no new mapping code
// needed here. PauseNotSupportedError is handled inline above (never thrown),
// so it never reaches the global handler.
