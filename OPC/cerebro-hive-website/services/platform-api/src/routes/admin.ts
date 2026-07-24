/**
 * platform-api — Admin routes (system-admin only)
 */

import { Router } from "express";
import { requireAuth } from "@cerebro/auth";
import { prisma, auditRepository } from "@cerebro/db";
import { asyncHandler, ForbiddenError } from "@cerebro/errors";

export const adminRouter = Router();

adminRouter.use(requireAuth);

// Enforce system-admin for ALL admin routes
adminRouter.use((req, _res, next) => {
  if (!req.auth?.isAdmin) {
    next(new ForbiddenError("System admin required"));
    return;
  }
  next();
});

// GET /v1/admin/orgs — paginated list of all orgs
adminRouter.get("/orgs", asyncHandler(async (req, res) => {
  const { page = "1", limit = "50", search } = req.query as Record<string, string | undefined>;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const where = search ? {
    OR: [
      { name: { contains: search, mode: "insensitive" as const } },
      { slug: { contains: search, mode: "insensitive" as const } },
    ],
  } : {};

  const [items, total] = await Promise.all([
    prisma.organization.findMany({ where, skip, take: parseInt(limit, 10), orderBy: { createdAt: "desc" } }),
    prisma.organization.count({ where }),
  ]);

  res.json({ items, total });
}));

// GET /v1/admin/users — paginated list of all users
adminRouter.get("/users", asyncHandler(async (req, res) => {
  const { page = "1", limit = "50", search } = req.query as Record<string, string | undefined>;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const where = search ? {
    OR: [
      { email:       { contains: search, mode: "insensitive" as const } },
      { displayName: { contains: search, mode: "insensitive" as const } },
    ],
  } : {};

  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, skip, take: parseInt(limit, 10), orderBy: { createdAt: "desc" } }),
    prisma.user.count({ where }),
  ]);

  res.json({ items: items.map(({ keycloakId: _kc, authProviderId: _ap, ...u }) => u), total });
}));

// GET /v1/admin/audit — platform-wide audit log
adminRouter.get("/audit", asyncHandler(async (req, res) => {
  const { page = "1", limit = "100", eventType, severity, from, to } = req.query as Record<string, string | undefined>;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const where = {
    ...(eventType  && { eventType }),
    ...(severity   && { severity }),
    ...((from || to) && {
      timestamp: {
        ...(from && { gte: new Date(from) }),
        ...(to   && { lte: new Date(to) }),
      },
    }),
  };

  const [items, total] = await Promise.all([
    prisma.auditEvent.findMany({ where, skip, take: parseInt(limit, 10), orderBy: { timestamp: "desc" } }),
    prisma.auditEvent.count({ where }),
  ]);

  res.json({ items, total });
}));

// POST /v1/admin/feature-flags
adminRouter.post("/feature-flags", asyncHandler(async (req, res) => {
  const { userId } = req.auth!;
  const { key, name, description, enabled = false, rolloutPercentage = 0, targeting } = req.body as {
    key?:               string;
    name?:              string;
    description?:       string;
    enabled?:           boolean;
    rolloutPercentage?: number;
    targeting?:         Record<string, unknown>;
  };

  if (!key?.trim()) { res.status(400).json({ error: "key is required" }); return; }

  const flag = await prisma.featureFlag.upsert({
    where:  { key: key.trim() },
    create: { key: key.trim(), name: name ?? key, description, enabled, rolloutPercentage, targeting: targeting ?? {} },
    update: { name, description, enabled, rolloutPercentage, targeting },
  });

  await auditRepository.record({
    orgId:        "system",
    actorId:      userId,
    eventType:    "feature_flag.upserted",
    resourceType: "feature_flag",
    resourceId:   flag.id,
    action:       "upsert",
    outcome:      "success",
    details:      { key: flag.key, enabled },
  });

  res.json(flag);
}));

// GET /v1/admin/feature-flags
adminRouter.get("/feature-flags", asyncHandler(async (_req, res) => {
  const flags = await prisma.featureFlag.findMany({ orderBy: { key: "asc" } });
  res.json({ items: flags, total: flags.length });
}));

// GET /v1/admin/stats — platform overview
adminRouter.get("/stats", asyncHandler(async (_req, res) => {
  const [orgs, users, workflows, executions, agents] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.workflow.count(),
    prisma.workflowExecution.count(),
    prisma.agent.count(),
  ]);

  res.json({
    orgs, users, workflows,
    executions, agents,
    timestamp: new Date().toISOString(),
  });
}));
