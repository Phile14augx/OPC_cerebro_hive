/**
 * platform-api — Prompt Registry routes
 * Full CRUD + version management for org-scoped prompts.
 */

import { Router } from "express";
import { requireAuth, requirePermission } from "@cerebro/auth";
import { promptRepository, auditRepository } from "@cerebro/db";
import { asyncHandler, NotFoundError, ValidationError, ConflictError } from "@cerebro/errors";

export const promptsRouter = Router();

promptsRouter.use(requireAuth);

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── GET /v1/prompts ───────────────────────────────────────────────────────────

promptsRouter.get("/", requirePermission("prompts:read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const { page, limit, status, category, search, tags } = req.query as Record<string, string | undefined>;

  const result = await promptRepository.list({
    orgId,
    status,
    category,
    search,
    tags:  tags  ? tags.split(",")  : undefined,
    page:  page  ? parseInt(page,  10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });

  res.json({ ...result, page: parseInt(page ?? "1", 10), limit: parseInt(limit ?? "20", 10) });
}));

// ── POST /v1/prompts ──────────────────────────────────────────────────────────

promptsRouter.post("/", requirePermission("prompts:create"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const { name, slug, description, category, tags, content, model, variables } = req.body as {
    name?:        string;
    slug?:        string;
    description?: string;
    category?:    string;
    tags?:        string[];
    content?:     string;
    model?:       string;
    variables?:   string[];
  };

  if (!name?.trim())    throw new ValidationError("name is required");
  if (!content?.trim()) throw new ValidationError("content (initial version) is required");
  if (!model?.trim())   throw new ValidationError("model is required");

  const resolvedSlug = (slug ?? slugify(name)).trim();

  // Uniqueness check
  const existing = await promptRepository.findBySlug(resolvedSlug, orgId);
  if (existing) throw new ConflictError(`Prompt with slug "${resolvedSlug}" already exists`);

  // Create prompt + initial version in one go
  const prompt = await promptRepository.create({
    orgId,
    name:        name.trim(),
    slug:        resolvedSlug,
    description,
    category,
    tags,
    createdById: userId,
  });

  const version = await promptRepository.createVersion({
    promptId:  prompt.id,
    orgId,
    version:   1,
    content:   content.trim(),
    model,
    variables,
    changelog: "Initial version",
    createdBy: userId,
  });

  // Mark v1 active immediately
  await promptRepository.setActiveVersion(prompt.id, 1);

  await auditRepository.record({
    orgId, actorId: userId,
    eventType: "prompt.created", resourceType: "prompt", resourceId: prompt.id, action: "create", outcome: "success",
  });

  res.status(201).json({ ...prompt, versions: [version] });
}));

// ── GET /v1/prompts/:id ───────────────────────────────────────────────────────

promptsRouter.get("/:id", requirePermission("prompts:read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }
  const prompt = await promptRepository.findByIdOrThrow(req.params["id"]!, orgId);
  res.json(prompt);
}));

// ── PATCH /v1/prompts/:id ─────────────────────────────────────────────────────

promptsRouter.patch("/:id", requirePermission("prompts:update"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  await promptRepository.findByIdOrThrow(req.params["id"]!, orgId);

  const updated = await promptRepository.update(req.params["id"]!, orgId, {
    ...req.body as Record<string, unknown>,
    updatedById: userId,
  });

  await auditRepository.record({
    orgId, actorId: userId,
    eventType: "prompt.updated", resourceType: "prompt", resourceId: updated.id, action: "update", outcome: "success",
  });

  res.json(updated);
}));

// ── POST /v1/prompts/:id/publish ──────────────────────────────────────────────

promptsRouter.post("/:id/publish", requirePermission("prompts:update"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }
  await promptRepository.findByIdOrThrow(req.params["id"]!, orgId);
  const prompt = await promptRepository.publish(req.params["id"]!, orgId, userId);
  await auditRepository.record({
    orgId, actorId: userId,
    eventType: "prompt.published", resourceType: "prompt", resourceId: prompt.id, action: "publish", outcome: "success",
  });
  res.json(prompt);
}));

// ── POST /v1/prompts/:id/deprecate ────────────────────────────────────────────

promptsRouter.post("/:id/deprecate", requirePermission("prompts:update"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }
  await promptRepository.findByIdOrThrow(req.params["id"]!, orgId);
  const prompt = await promptRepository.deprecate(req.params["id"]!, orgId, userId);
  res.json(prompt);
}));

// ── DELETE /v1/prompts/:id ────────────────────────────────────────────────────

promptsRouter.delete("/:id", requirePermission("prompts:delete"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }
  await promptRepository.findByIdOrThrow(req.params["id"]!, orgId);
  await promptRepository.delete(req.params["id"]!, orgId);
  await auditRepository.record({
    orgId, actorId: userId,
    eventType: "prompt.deleted", resourceType: "prompt", resourceId: req.params["id"]!, action: "delete", outcome: "success",
  });
  res.status(204).end();
}));

// ── GET /v1/prompts/:id/versions ──────────────────────────────────────────────

promptsRouter.get("/:id/versions", requirePermission("prompts:read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }
  await promptRepository.findByIdOrThrow(req.params["id"]!, orgId);
  const versions = await promptRepository.listVersions(req.params["id"]!);
  res.json({ items: versions, total: versions.length });
}));

// ── POST /v1/prompts/:id/versions ─────────────────────────────────────────────

promptsRouter.post("/:id/versions", requirePermission("prompts:update"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const { content, model, variables, description, changelog } = req.body as {
    content?:     string;
    model?:       string;
    variables?:   string[];
    description?: string;
    changelog?:   string;
  };

  if (!content?.trim()) throw new ValidationError("content is required");
  if (!model?.trim())   throw new ValidationError("model is required");

  await promptRepository.findByIdOrThrow(req.params["id"]!, orgId);
  const nextVersion = await promptRepository.nextVersionNumber(req.params["id"]!);

  const version = await promptRepository.createVersion({
    promptId:  req.params["id"]!,
    orgId,
    version:   nextVersion,
    content:   content.trim(),
    model,
    variables,
    description,
    changelog,
    createdBy: userId,
  });

  res.status(201).json(version);
}));

// ── POST /v1/prompts/:id/versions/:version/activate ───────────────────────────

promptsRouter.post("/:id/versions/:version/activate", requirePermission("prompts:update"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const version = parseInt(req.params["version"]!, 10);
  if (isNaN(version)) throw new ValidationError("version must be a number");

  await promptRepository.findByIdOrThrow(req.params["id"]!, orgId);
  const versionRecord = await promptRepository.getVersion(req.params["id"]!, version);
  if (!versionRecord) throw new NotFoundError(`Version ${version} not found`);

  await promptRepository.setActiveVersion(req.params["id"]!, version);

  await auditRepository.record({
    orgId, actorId: userId,
    eventType: "prompt.version_activated", resourceType: "prompt", resourceId: req.params["id"]!, action: "activate", outcome: "success",
    metadata: { version },
  });

  res.json({ promptId: req.params["id"]!, activeVersion: version });
}));
