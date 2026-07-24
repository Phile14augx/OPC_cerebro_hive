/**
 * platform-api — Agent CRUD + run routes
 */

import { Router } from "express";
import { requireAuth, requirePermission } from "@cerebro/auth";
import { agentRepository, agentRunRepository, auditRepository } from "@cerebro/db";
import { asyncHandler, ValidationError } from "@cerebro/errors";
import { queue, SUBJECTS } from "@cerebro/queue";
import { randomUUID } from "node:crypto";

export const agentsRouter = Router();

agentsRouter.use(requireAuth);

// GET /v1/agents
agentsRouter.get("/", requirePermission("agents:read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const { page, limit, status, search } = req.query as Record<string, string | undefined>;

  const result = await agentRepository.list(orgId, {
    status: status ? status.split(",") : undefined,
    search,
    page:   page  ? parseInt(page,  10) : undefined,
    limit:  limit ? parseInt(limit, 10) : undefined,
  });

  res.json(result);
}));

// POST /v1/agents
agentsRouter.post("/", requirePermission("agents:create"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const body = req.body as {
    name?:         string;
    slug?:         string;
    description?:  string;
    definition?:   unknown;
    systemPrompt?: string;
    tools?:        unknown[];
    modelId?:      string;
    temperature?:  number;
    maxTokens?:    number;
    memoryEnabled?: boolean;
    version?:      string;
  };

  if (!body.name?.trim()) throw new ValidationError("name is required");
  if (!body.slug?.trim()) throw new ValidationError("slug is required");
  if (!/^[a-z0-9-]+$/.test(body.slug)) throw new ValidationError("slug must be lowercase alphanumeric with hyphens");

  const agent = await agentRepository.create({
    orgId,
    name:          body.name.trim(),
    slug:          body.slug,
    description:   body.description,
    definition:    body.definition ?? {},
    systemPrompt:  body.systemPrompt,
    tools:         body.tools ?? [],
    modelId:       body.modelId ?? "claude-sonnet-4-6",
    temperature:   body.temperature,
    maxTokens:     body.maxTokens,
    memoryEnabled: body.memoryEnabled,
    version:       body.version,
    createdById:   userId,
  });

  res.status(201).json(agent);
}));

// GET /v1/agents/:id
agentsRouter.get("/:id", requirePermission("agents:read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const agent = await agentRepository.findByIdOrThrow(req.params["id"]!, orgId);
  res.json(agent);
}));

// PATCH /v1/agents/:id
agentsRouter.patch("/:id", requirePermission("agents:update"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  await agentRepository.findByIdOrThrow(req.params["id"]!, orgId);

  const agent = await agentRepository.update(req.params["id"]!, {
    ...(req.body as Record<string, unknown>),
    updatedById: userId,
  });

  res.json(agent);
}));

// DELETE /v1/agents/:id
agentsRouter.delete("/:id", requirePermission("agents:delete"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  await agentRepository.findByIdOrThrow(req.params["id"]!, orgId);
  await agentRepository.delete(req.params["id"]!);

  await auditRepository.record({
    orgId,
    actorId:      userId,
    eventType:    "agent.deleted",
    resourceType: "agent",
    resourceId:   req.params["id"]!,
    action:       "delete",
    outcome:      "success",
  });

  res.status(204).send();
}));

// POST /v1/agents/:id/run
agentsRouter.post("/:id/run", requirePermission("agents:run"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const agent = await agentRepository.findByIdOrThrow(req.params["id"]!, orgId);

  const { input = {}, workflowExecId } = req.body as {
    input?:          Record<string, unknown>;
    workflowExecId?: string;
  };

  const run = await agentRunRepository.create({
    agentId:        agent.id,
    orgId,
    workflowExecId,
    triggeredById:  userId,
    input,
    modelId:        agent.modelId ?? "claude-sonnet-4-6",
  });

  await queue.publish(SUBJECTS.AGENT.RUN_STARTED, {
    id:      randomUUID(),
    orgId,
    agentId: agent.id,
    runId:   run.id,
    modelId: agent.modelId ?? "claude-sonnet-4-6",
    input,
    version: 1,
  });

  res.status(202).json(run);
}));

// GET /v1/agents/:id/runs
agentsRouter.get("/:id/runs", requirePermission("agents:read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const { page, limit, status } = req.query as Record<string, string | undefined>;

  const result = await agentRunRepository.list(orgId, {
    agentId: req.params["id"],
    status:  status ? status.split(",") : undefined,
    page:    page  ? parseInt(page,  10) : undefined,
    limit:   limit ? parseInt(limit, 10) : undefined,
  });

  res.json(result);
}));
