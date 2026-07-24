/**
 * platform-api — Billing routes (Stripe webhook proxy + usage budgets)
 */

import { Router } from "express";
import { requireAuth, requirePermission } from "@cerebro/auth";
import { prisma, auditRepository } from "@cerebro/db";
import { asyncHandler } from "@cerebro/errors";

export const billingRouter = Router();

billingRouter.use(requireAuth);

// GET /v1/billing/subscription
billingRouter.get("/subscription", requirePermission("org:read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const subscription = await prisma.subscription.findFirst({
    where:   { orgId, status: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] } },
    orderBy: { createdAt: "desc" },
  });

  res.json(subscription ?? null);
}));

// GET /v1/billing/invoices
billingRouter.get("/invoices", requirePermission("org:manage_billing"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const { page = "1", limit = "20" } = req.query as Record<string, string>;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const [items, total] = await Promise.all([
    prisma.invoice.findMany({
      where:   { orgId },
      skip,
      take:    parseInt(limit, 10),
      orderBy: { issuedAt: "desc" },
    }),
    prisma.invoice.count({ where: { orgId } }),
  ]);

  res.json({ items, total });
}));

// GET /v1/billing/budgets
billingRouter.get("/budgets", requirePermission("ai:usage_read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const budgets = await prisma.usageBudget.findMany({
    where:   { orgId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  res.json({ items: budgets, total: budgets.length });
}));

// POST /v1/billing/budgets
billingRouter.post("/budgets", requirePermission("ai:settings_update"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const { period, limitUsd, alertThresholds = [0.8, 0.95], workflowId, modelId } = req.body as {
    period?:           string;
    limitUsd?:         number;
    alertThresholds?:  number[];
    workflowId?:       string;
    modelId?:          string;
  };

  const budget = await prisma.usageBudget.create({
    data: {
      orgId,
      period:           (period ?? "monthly") as never,
      limitUsd,
      alertThresholds,
      workflowId,
      modelId,
      status:           "ACTIVE",
    },
  });

  await auditRepository.record({
    orgId,
    actorId:      userId,
    eventType:    "billing.budget_created",
    resourceType: "usage_budget",
    resourceId:   budget.id,
    action:       "create",
    outcome:      "success",
    details:      { limitUsd, period },
  });

  res.status(201).json(budget);
}));
