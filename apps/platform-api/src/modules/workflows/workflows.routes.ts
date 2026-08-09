import { prisma } from "@cerebro/db";
import { FastifyInstance } from "fastify";
import { requirePermission } from "../../middleware/AuthMiddleware";
import { PaginationQuery } from "../common/pagination";

export default async function workflowsRoutes(fastify: FastifyInstance) {
  // LIST WORKFLOWS
  fastify.get("/", { schema: { querystring: PaginationQuery } }, async (request, reply) => {
    const workspaceId = request.cerebroContext.workspaceId;
    const { page = 1, limit = 20, sort, search } = request.query as any;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { workspaceId };
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort) {
      if (sort.startsWith("-")) orderBy = { [sort.substring(1)]: "desc" };
      else orderBy = { [sort]: "asc" };
    }

    const [total, data] = await Promise.all([
      prisma.workflow.count({ where }),
      prisma.workflow.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { versions: { take: 1, orderBy: { version: "desc" } } },
      }),
    ]);

    return reply.send({
      success: true,
      data,
      meta: { total, page: Number(page), limit: take, totalPages: Math.ceil(total / take) },
    });
  });

  // GET WORKFLOW
  fastify.get("/:id", async (request, reply) => {
    const workspaceId = request.cerebroContext.workspaceId;
    const { id } = request.params as { id: string };

    const workflow = await prisma.workflow.findUnique({
      where: { id },
      include: {
        versions: { orderBy: { version: "desc" }, include: { nodes: true, edges: true } },
      },
    });

    if (!workflow || workflow.workspaceId !== workspaceId) {
      return reply.code(404).send({
        success: false,
        error: {
          code: "WORKFLOW_NOT_FOUND",
          message: "Workflow not found.",
          requestId: request.cerebroContext.traceId,
        },
      });
    }

    return reply.send({ success: true, data: workflow });
  });

  // EXECUTE WORKFLOW
  fastify.post(
    "/:id/execute",
    { preHandler: requirePermission("workflows:execute") },
    async (request, reply) => {
      const workspaceId = request.cerebroContext.workspaceId;
      const { id } = request.params as { id: string };

      const workflow = await prisma.workflow.findUnique({ where: { id } });
      if (!workflow || workflow.workspaceId !== workspaceId) {
        return reply.code(404).send({
          success: false,
          error: { code: "WORKFLOW_NOT_FOUND", message: "Workflow not found." },
        });
      }

      // Create an execution record
      const execution = await prisma.workflowExecution.create({
        data: {
          workflowId: id,
          status: "RUNNING",
        },
      });

      return reply.code(201).send({ success: true, data: execution });
    },
  );
}
