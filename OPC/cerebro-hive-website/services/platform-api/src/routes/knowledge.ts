/**
 * platform-api — Knowledge base routes (collections + documents)
 */

import { Router } from "express";
import { requireAuth, requirePermission } from "@cerebro/auth";
import { collectionRepository, documentRepository, auditRepository } from "@cerebro/db";
import { asyncHandler, ValidationError } from "@cerebro/errors";
import { queue, SUBJECTS } from "@cerebro/queue";
import { randomUUID } from "node:crypto";

export const knowledgeRouter = Router();

knowledgeRouter.use(requireAuth);

// ── Collections ───────────────────────────────────────────────────────────────

knowledgeRouter.get("/collections", requirePermission("knowledge:read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const { page, limit } = req.query as Record<string, string | undefined>;

  const result = await collectionRepository.list(orgId, {
    page:  page  ? parseInt(page,  10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });

  res.json(result);
}));

knowledgeRouter.post("/collections", requirePermission("knowledge:create"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const body = req.body as {
    name?:             string;
    description?:      string;
    embeddingModel?:   string;
    chunkingStrategy?: string;
    chunkSize?:        number;
    chunkOverlap?:     number;
  };

  if (!body.name?.trim()) throw new ValidationError("name is required");

  const collection = await collectionRepository.create({
    orgId,
    name:             body.name.trim(),
    description:      body.description,
    embeddingModel:   body.embeddingModel,
    chunkingStrategy: body.chunkingStrategy,
    chunkSize:        body.chunkSize,
    chunkOverlap:     body.chunkOverlap,
    createdById:      userId,
  });

  res.status(201).json(collection);
}));

knowledgeRouter.get("/collections/:id", requirePermission("knowledge:read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const collection = await collectionRepository.findByIdOrThrow(req.params["id"]!, orgId);
  res.json(collection);
}));

knowledgeRouter.delete("/collections/:id", requirePermission("knowledge:delete"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  await collectionRepository.findByIdOrThrow(req.params["id"]!, orgId);
  await collectionRepository.delete(req.params["id"]!);

  res.status(204).send();
}));

// ── Documents ─────────────────────────────────────────────────────────────────

knowledgeRouter.post("/collections/:collectionId/documents", requirePermission("knowledge:upload"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  await collectionRepository.findByIdOrThrow(req.params["collectionId"]!, orgId);

  const body = req.body as {
    name?:       string;
    sourceType?: string;
    sourceUrl?:  string;
    mimeType?:   string;
    sizeBytes?:  number;
    metadata?:   Record<string, unknown>;
  };

  if (!body.name?.trim()) throw new ValidationError("name is required");
  if (!body.sourceType)   throw new ValidationError("sourceType is required");

  const document = await documentRepository.create({
    collectionId: req.params["collectionId"]!,
    orgId,
    name:         body.name.trim(),
    sourceType:   body.sourceType,
    sourceUrl:    body.sourceUrl,
    mimeType:     body.mimeType,
    sizeBytes:    body.sizeBytes,
    metadata:     body.metadata,
    uploadedById: userId,
  });

  // Trigger async indexing via NATS
  await queue.publish(SUBJECTS.KNOWLEDGE.DOCUMENT_UPLOADED, {
    id:           randomUUID(),
    orgId,
    collectionId: req.params["collectionId"]!,
    documentId:   document.id,
    name:         document.name,
    mimeType:     document.mimeType ?? undefined,
    sizeBytes:    document.sizeBytes ?? undefined,
    version:      1,
  });

  res.status(201).json(document);
}));

knowledgeRouter.get("/collections/:collectionId/documents", requirePermission("knowledge:read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const { page, limit, status } = req.query as Record<string, string | undefined>;

  const result = await documentRepository.list(orgId, {
    collectionId: req.params["collectionId"],
    status:       status ? status.split(",") : undefined,
    page:         page  ? parseInt(page,  10) : undefined,
    limit:        limit ? parseInt(limit, 10) : undefined,
  });

  res.json(result);
}));

knowledgeRouter.delete("/collections/:collectionId/documents/:docId", requirePermission("knowledge:delete"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  await documentRepository.findByIdOrThrow(req.params["docId"]!, orgId);
  await documentRepository.delete(req.params["docId"]!);

  res.status(204).send();
}));
