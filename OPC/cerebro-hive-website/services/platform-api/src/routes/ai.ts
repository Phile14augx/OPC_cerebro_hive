/**
 * platform-api — AI usage routes (chat proxy + usage analytics)
 */

import { Router } from "express";
import { requireAuth, requirePermission } from "@cerebro/auth";
import { aiUsageRepository } from "@cerebro/db";
import { asyncHandler, ValidationError } from "@cerebro/errors";
import { getPlatformApiConfig } from "@cerebro/config";

export const aiRouter = Router();

aiRouter.use(requireAuth);

const cfg = getPlatformApiConfig();

// POST /v1/ai/chat — proxy to ai-gateway
aiRouter.post("/chat", requirePermission("ai:chat"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const body = req.body as {
    model?:    string;
    messages?: unknown[];
    system?:   string;
    stream?:   boolean;
    maxTokens?: number;
    temperature?: number;
  };

  if (!body.messages?.length) throw new ValidationError("messages are required");

  const gatewayRes = await fetch(`${cfg.AI_GATEWAY_URL}/v1/chat`, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Org-ID":     orgId,
      "X-User-ID":    userId,
      "X-Trace-ID":   req.headers["x-trace-id"] as string ?? "",
    },
    body: JSON.stringify(body),
  });

  if (!gatewayRes.ok) {
    const err = await gatewayRes.json() as Record<string, unknown>;
    res.status(gatewayRes.status).json(err);
    return;
  }

  if (body.stream) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    gatewayRes.body?.pipeTo(new WritableStream({
      write(chunk) { res.write(chunk); },
      close()      { res.end(); },
    }));
  } else {
    const data = await gatewayRes.json() as Record<string, unknown>;
    res.json(data);
  }
}));

// GET /v1/ai/usage — usage analytics
aiRouter.get("/usage", requirePermission("ai:usage_read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const { from, to, modelId, provider } = req.query as Record<string, string | undefined>;

  const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const toDate   = to   ? new Date(to)   : new Date();

  const summary = await aiUsageRepository.getUsageSummary(orgId, {
    from:     fromDate,
    to:       toDate,
    modelId,
    provider,
  });

  res.json({
    period: { from: fromDate.toISOString(), to: toDate.toISOString() },
    ...summary,
  });
}));

// GET /v1/ai/usage/records
aiRouter.get("/usage/records", requirePermission("ai:usage_read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const { from, to, workflowId, agentId, page, limit } = req.query as Record<string, string | undefined>;

  const result = await aiUsageRepository.list(orgId, {
    from:       from ? new Date(from) : undefined,
    to:         to   ? new Date(to)   : undefined,
    workflowId,
    agentId,
    page:       page  ? parseInt(page,  10) : undefined,
    limit:      limit ? parseInt(limit, 10) : undefined,
  });

  res.json(result);
}));
