/**
 * platform-api — LLM Evaluation routes
 * Full CRUD for eval datasets and eval runs, with lifecycle management.
 */

import { Router } from "express";
import { requireAuth, requirePermission } from "@cerebro/auth";
import { evaluationRepository, auditRepository } from "@cerebro/db";
import { asyncHandler, NotFoundError, ValidationError, ConflictError } from "@cerebro/errors";
import { queue, SUBJECTS } from "@cerebro/queue";

export const evaluationsRouter = Router();

evaluationsRouter.use(requireAuth);

// ── Datasets ──────────────────────────────────────────────────────────────────

// GET /v1/evaluations/datasets
evaluationsRouter.get("/datasets", requirePermission("evaluations:read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }
  const datasets = await evaluationRepository.listDatasets(orgId);
  res.json({ items: datasets, total: datasets.length });
}));

// POST /v1/evaluations/datasets
evaluationsRouter.post("/datasets", requirePermission("evaluations:create"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const { name, description, rowCount, schema, sourceType, storageKey } = req.body as {
    name?:        string;
    description?: string;
    rowCount?:    number;
    schema?:      Record<string, unknown>;
    sourceType?:  string;
    storageKey?:  string;
  };

  if (!name?.trim()) throw new ValidationError("name is required");

  const dataset = await evaluationRepository.createDataset({
    orgId, name: name.trim(), description, rowCount, schema, sourceType, storageKey,
    createdById: userId,
  });

  res.status(201).json(dataset);
}));

// GET /v1/evaluations/datasets/:id
evaluationsRouter.get("/datasets/:id", requirePermission("evaluations:read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }
  const dataset = await evaluationRepository.findDatasetById(req.params["id"]!, orgId);
  if (!dataset) throw new NotFoundError("Dataset not found");
  res.json(dataset);
}));

// DELETE /v1/evaluations/datasets/:id
evaluationsRouter.delete("/datasets/:id", requirePermission("evaluations:delete"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }
  const dataset = await evaluationRepository.findDatasetById(req.params["id"]!, orgId);
  if (!dataset) throw new NotFoundError("Dataset not found");
  await evaluationRepository.deleteDataset(req.params["id"]!);
  res.status(204).end();
}));

// ── Eval Runs ─────────────────────────────────────────────────────────────────

// GET /v1/evaluations/runs
evaluationsRouter.get("/runs", requirePermission("evaluations:read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const { page, limit, status, promptId, datasetId } = req.query as Record<string, string | undefined>;

  const result = await evaluationRepository.listRuns({
    orgId, status, promptId, datasetId,
    page:  page  ? parseInt(page,  10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });

  res.json({ ...result, page: parseInt(page ?? "1", 10), limit: parseInt(limit ?? "20", 10) });
}));

// POST /v1/evaluations/runs
evaluationsRouter.post("/runs", requirePermission("evaluations:create"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const { name, promptId, promptSlug, datasetId, model } = req.body as {
    name?:       string;
    promptId?:   string;
    promptSlug?: string;
    datasetId?:  string;
    model?:      string;
  };

  if (!name?.trim())  throw new ValidationError("name is required");
  if (!model?.trim()) throw new ValidationError("model is required");

  const run = await evaluationRepository.createRun({
    orgId,
    name:        name.trim(),
    promptId,
    promptSlug,
    datasetId,
    model,
    createdById: userId,
  });

  // Publish to queue so eval worker picks it up
  await queue.publish(SUBJECTS.AGENT.RUN_STARTED, {
    orgId,
    evalRunId:   run.id,
    triggeredBy: userId,
  }).catch(err => {
    // Non-fatal — eval worker polls DB as fallback
    console.error("Failed to publish eval run to queue:", err);
  });

  await auditRepository.record({
    orgId, actorId: userId,
    eventType: "eval.run.created", resourceType: "eval_run", resourceId: run.id, action: "create", outcome: "success",
  });

  res.status(202).json(run);
}));

// GET /v1/evaluations/runs/:id
evaluationsRouter.get("/runs/:id", requirePermission("evaluations:read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }
  const run = await evaluationRepository.findRunByIdOrThrow(req.params["id"]!, orgId);
  res.json(run);
}));

// POST /v1/evaluations/runs/:id/cancel
evaluationsRouter.post("/runs/:id/cancel", requirePermission("evaluations:update"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const run = await evaluationRepository.findRunByIdOrThrow(req.params["id"]!, orgId);

  if (["COMPLETED", "FAILED", "CANCELLED"].includes(run.status)) {
    res.status(409).json({ error: "ALREADY_TERMINAL", status: run.status });
    return;
  }

  const cancelled = await evaluationRepository.cancelRun(run.id);

  await auditRepository.record({
    orgId, actorId: userId,
    eventType: "eval.run.cancelled", resourceType: "eval_run", resourceId: run.id, action: "cancel", outcome: "success",
  });

  res.json(cancelled);
}));

// DELETE /v1/evaluations/runs/:id
evaluationsRouter.delete("/runs/:id", requirePermission("evaluations:delete"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const run = await evaluationRepository.findRunByIdOrThrow(req.params["id"]!, orgId);
  await evaluationRepository.deleteRun(run.id);
  res.status(204).end();
}));

// ── Internal webhook (eval worker → platform-api) ─────────────────────────────

// POST /v1/evaluations/runs/:id/result  (internal, requires service token)
evaluationsRouter.post("/runs/:id/result", requireAuth, asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const { status, metrics, passed, samples, errorMsg } = req.body as {
    status?:   string;
    metrics?:  Record<string, number>;
    passed?:   number;
    samples?:  number;
    errorMsg?: string;
  };

  const run = await evaluationRepository.findRunByIdOrThrow(req.params["id"]!, orgId);

  let updated;
  if (status === "COMPLETED" && metrics) {
    updated = await evaluationRepository.completeRun(run.id, metrics, passed ?? 0, samples ?? 0);
  } else if (status === "FAILED") {
    updated = await evaluationRepository.failRun(run.id, errorMsg ?? "Unknown error");
  } else {
    updated = await evaluationRepository.updateRun(run.id, { status, metrics, passed, samples, errorMsg });
  }

  res.json(updated);
}));
