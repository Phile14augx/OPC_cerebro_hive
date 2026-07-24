/**
 * platform-api — Workflow CRUD + execution routes
 */

import { Router } from "express";
import { requireAuth, requirePermission } from "@cerebro/auth";
import { workflowRepository, executionRepository, auditRepository } from "@cerebro/db";
import { asyncHandler, NotFoundError, ValidationError } from "@cerebro/errors";
import { queue, SUBJECTS } from "@cerebro/queue";
import { randomUUID } from "node:crypto";

export const workflowsRouter = Router();

// All workflow routes require auth
workflowsRouter.use(requireAuth);

// GET /v1/workflows
workflowsRouter.get("/", requirePermission("workflows:read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const { page, limit, status, search, tags } = req.query as Record<string, string | undefined>;

  const result = await workflowRepository.list({
    orgId,
    status: status ? status.split(",") : undefined,
    tags:   tags   ? tags.split(",")   : undefined,
    search,
    page:   page  ? parseInt(page,  10) : undefined,
    limit:  limit ? parseInt(limit, 10) : undefined,
  });

  res.json({ ...result, page: parseInt(page ?? "1", 10), limit: parseInt(limit ?? "20", 10) });
}));

// POST /v1/workflows
workflowsRouter.post("/", requirePermission("workflows:create"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const { name, description, definition, tags } = req.body as {
    name?:        string;
    description?: string;
    definition?:  unknown;
    tags?:        string[];
  };

  if (!name?.trim()) throw new ValidationError("name is required");

  const workflow = await workflowRepository.create({
    orgId,
    name:        name.trim(),
    description,
    definition:  definition ?? {},
    tags:        tags ?? [],
    createdById: userId,
  });

  await auditRepository.record({
    orgId,
    actorId:      userId,
    eventType:    "workflow.created",
    resourceType: "workflow",
    resourceId:   workflow.id,
    action:       "create",
    outcome:      "success",
  });

  res.status(201).json(workflow);
}));

// GET /v1/workflows/:id
workflowsRouter.get("/:id", requirePermission("workflows:read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const workflow = await workflowRepository.findByIdOrThrow(req.params["id"]!, orgId);
  res.json(workflow);
}));

// PATCH /v1/workflows/:id
workflowsRouter.patch("/:id", requirePermission("workflows:update"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  await workflowRepository.findByIdOrThrow(req.params["id"]!, orgId); // existence check

  const updated = await workflowRepository.update(req.params["id"]!, orgId, {
    ...(req.body as Record<string, unknown>),
    updatedById: userId,
  });

  res.json(updated);
}));

// POST /v1/workflows/:id/publish
workflowsRouter.post("/:id/publish", requirePermission("workflows:publish"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const workflow = await workflowRepository.publish(req.params["id"]!, orgId, userId);

  await auditRepository.record({
    orgId,
    actorId:      userId,
    eventType:    "workflow.published",
    resourceType: "workflow",
    resourceId:   workflow.id,
    action:       "publish",
    outcome:      "success",
  });

  res.json(workflow);
}));

// DELETE /v1/workflows/:id
workflowsRouter.delete("/:id", requirePermission("workflows:delete"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  await workflowRepository.findByIdOrThrow(req.params["id"]!, orgId);
  await workflowRepository.delete(req.params["id"]!, orgId);

  await auditRepository.record({
    orgId,
    actorId:      userId,
    eventType:    "workflow.deleted",
    resourceType: "workflow",
    resourceId:   req.params["id"]!,
    action:       "delete",
    outcome:      "success",
  });

  res.status(204).send();
}));

// ── Executions ────────────────────────────────────────────────────────────────

// POST /v1/workflows/:id/execute
workflowsRouter.post("/:id/execute", requirePermission("workflows:execute"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  await workflowRepository.findByIdOrThrow(req.params["id"]!, orgId);

  const { input = {}, testMode = false } = req.body as { input?: Record<string, unknown>; testMode?: boolean };

  const execution = await executionRepository.create({
    workflowId:   req.params["id"]!,
    orgId,
    triggeredById: userId,
    triggerType:  "api",
    input,
    testMode,
  });

  // Publish execution started event
  await queue.publish(SUBJECTS.WORKFLOW.EXECUTION_STARTED, {
    id:          randomUUID(),
    orgId,
    workflowId:  req.params["id"]!,
    executionId: execution.id,
    triggeredBy: userId,
    input,
    version:     1,
  }, { traceId: req.headers["x-trace-id"] as string | undefined });

  res.status(202).json(execution);
}));

// GET /v1/workflows/:id/executions
workflowsRouter.get("/:id/executions", requirePermission("workflows:read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const { page, limit, status } = req.query as Record<string, string | undefined>;

  const result = await executionRepository.list(orgId, {
    workflowId: req.params["id"],
    status:     status ? status.split(",") : undefined,
    page:       page  ? parseInt(page,  10) : undefined,
    limit:      limit ? parseInt(limit, 10) : undefined,
  });

  res.json(result);
}));

// GET /v1/workflows/executions/:execId
workflowsRouter.get("/executions/:execId", requirePermission("workflows:read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const execution = await executionRepository.findById(req.params["execId"]!, orgId);
  if (!execution) throw new NotFoundError("WorkflowExecution", req.params["execId"]);

  res.json(execution);
}));

// POST /v1/workflows/executions/:execId/cancel
workflowsRouter.post("/executions/:execId/cancel", requirePermission("workflows:execute"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const execution = await executionRepository.findById(req.params["execId"]!, orgId);
  if (!execution) throw new NotFoundError("WorkflowExecution", req.params["execId"]);

  if (["COMPLETED", "FAILED", "CANCELLED"].includes(execution.status)) {
    res.status(409).json({ error: "ALREADY_TERMINAL", message: `Execution is already ${execution.status}` });
    return;
  }

  const updated = await executionRepository.update(req.params["execId"]!, {
    status:      "CANCELLED",
    completedAt: new Date(),
  });

  await queue.publish(SUBJECTS.WORKFLOW.EXECUTION_CANCELLED, {
    id:          randomUUID(),
    orgId,
    executionId: req.params["execId"]!,
    cancelledBy: userId,
    version:     1,
  });

  await auditRepository.record({
    orgId,
    actorId:      userId,
    eventType:    "execution.cancelled",
    resourceType: "execution",
    resourceId:   req.params["execId"]!,
    action:       "cancel",
    outcome:      "success",
  });

  res.json(updated);
}));

// POST /v1/workflows/:id/archive
workflowsRouter.post("/:id/archive", requirePermission("workflows:update"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const workflow = await workflowRepository.archive(req.params["id"]!, orgId, userId);

  await auditRepository.record({
    orgId,
    actorId:      userId,
    eventType:    "workflow.archived",
    resourceType: "workflow",
    resourceId:   workflow.id,
    action:       "archive",
    outcome:      "success",
  });

  res.json(workflow);
}));
