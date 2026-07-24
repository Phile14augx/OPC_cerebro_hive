/**
 * platform-api — Model Catalog routes
 * Serves model metadata from DB (seeded from providers) + AI gateway health.
 *
 * The catalog is seeded once and cached in memory with a 5-minute TTL.
 * The AI gateway is queried live for availability/latency data.
 */

import { Router } from "express";
import { requireAuth, requirePermission } from "@cerebro/auth";
import { asyncHandler } from "@cerebro/errors";
import { prisma } from "@cerebro/db";

export const modelsRouter = Router();

modelsRouter.use(requireAuth);

// ── In-memory cache ───────────────────────────────────────────────────────────

interface CacheEntry<T> { data: T; expiresAt: number }
let catalogCache: CacheEntry<unknown[]> | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ── AI Gateway health ─────────────────────────────────────────────────────────

const AI_GATEWAY_URL = process.env["AI_GATEWAY_URL"] ?? "http://ai-gateway:3002";

async function fetchGatewayModels(): Promise<Record<string, { available: boolean; latencyMs?: number }>> {
  try {
    const res = await fetch(`${AI_GATEWAY_URL}/v1/models`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return {};
    const body = await res.json() as { data?: { id: string; available?: boolean }[] };
    const map: Record<string, { available: boolean; latencyMs?: number }> = {};
    for (const m of body.data ?? []) {
      map[m.id] = { available: m.available ?? true };
    }
    return map;
  } catch {
    return {}; // Gateway offline — return empty (catalog still served from DB)
  }
}

// ── GET /v1/models ─────────────────────────────────────────────────────────────

modelsRouter.get("/", requirePermission("models:read"), asyncHandler(async (req, res) => {
  // Serve from cache if fresh
  if (catalogCache && Date.now() < catalogCache.expiresAt) {
    res.set("X-Cache", "HIT");
    res.json({ items: catalogCache.data, total: catalogCache.data.length });
    return;
  }

  const { provider, status, capability } = req.query as Record<string, string | undefined>;

  const [dbModels, gatewayStatus] = await Promise.all([
    prisma.modelEntry.findMany({
      where: {
        ...(provider    && { provider }),
        ...(status      && { status }),
        ...(capability  && { capabilities: { has: capability } }),
      },
      orderBy: [{ provider: "asc" }, { displayName: "asc" }],
    }),
    fetchGatewayModels(),
  ]);

  const items = dbModels.map(m => ({
    ...m,
    inputPricePer1M:  Number(m.inputPricePer1M),
    outputPricePer1M: Number(m.outputPricePer1M),
    available: gatewayStatus[m.modelId]?.available ?? true,
    latencyMs: gatewayStatus[m.modelId]?.latencyMs ?? null,
  }));

  // Refresh cache
  catalogCache = { data: items, expiresAt: Date.now() + CACHE_TTL_MS };

  res.set("X-Cache", "MISS");
  res.json({ items, total: items.length });
}));

// ── GET /v1/models/:id ────────────────────────────────────────────────────────

modelsRouter.get("/:id", requirePermission("models:read"), asyncHandler(async (req, res) => {
  const model = await prisma.modelEntry.findUnique({ where: { id: req.params["id"] } });
  if (!model) { res.status(404).json({ error: "NOT_FOUND" }); return; }

  const gatewayStatus = await fetchGatewayModels();

  res.json({
    ...model,
    inputPricePer1M:  Number(model.inputPricePer1M),
    outputPricePer1M: Number(model.outputPricePer1M),
    available: gatewayStatus[model.modelId]?.available ?? true,
    latencyMs: gatewayStatus[model.modelId]?.latencyMs ?? null,
  });
}));

// ── POST /v1/models/cache/invalidate (admin) ──────────────────────────────────

modelsRouter.post("/cache/invalidate", requirePermission("admin:write"), asyncHandler(async (_req, res) => {
  catalogCache = null;
  res.json({ invalidated: true });
}));
