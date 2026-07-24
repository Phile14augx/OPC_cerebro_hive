/**
 * platform-api — Traces proxy routes
 * Proxies requests to Grafana Tempo HTTP API, adding org-level tenant isolation.
 *
 * Tempo endpoints used:
 *   GET /api/search           → search traces
 *   GET /api/traces/:traceId  → get individual trace
 *   GET /api/tags             → tag keys
 *   GET /api/tag/:name/values → tag values
 *
 * Env: TEMPO_URL (default: http://tempo:3200)
 *      TEMPO_TENANT_HEADER (default: X-Scope-OrgID)
 */

import { Router } from "express";
import { requireAuth, requirePermission } from "@cerebro/auth";
import { asyncHandler, ValidationError } from "@cerebro/errors";

export const tracesRouter = Router();

tracesRouter.use(requireAuth);

const TEMPO_URL           = process.env["TEMPO_URL"]           ?? "http://tempo:3200";
const TEMPO_TENANT_HEADER = process.env["TEMPO_TENANT_HEADER"] ?? "X-Scope-OrgID";

// ── Internal proxy helper ─────────────────────────────────────────────────────

async function tempoProxy(
  path:   string,
  orgId:  string,
  params: Record<string, string | undefined> = {},
): Promise<unknown> {
  const url = new URL(`${TEMPO_URL}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Accept:                  "application/json",
      [TEMPO_TENANT_HEADER]:   orgId,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw Object.assign(new Error(`Tempo ${res.status}: ${text}`), { status: res.status });
  }

  return res.json();
}

// ── GET /v1/traces — search ───────────────────────────────────────────────────

tracesRouter.get("/", requirePermission("traces:read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const { q, tags, minDuration, maxDuration, limit, start, end, serviceName } = req.query as Record<string, string | undefined>;

  // Tempo TraceQL query
  const traceQL = q ?? buildTraceQL({ serviceName, tags });

  const data = await tempoProxy("/api/search", orgId, {
    q:           traceQL || undefined,
    minDuration: minDuration,
    maxDuration: maxDuration,
    limit:       limit ?? "50",
    start,
    end,
  });

  res.json(data);
}));

// ── GET /v1/traces/:traceId — single trace ────────────────────────────────────

tracesRouter.get("/:traceId", requirePermission("traces:read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const { traceId } = req.params;
  if (!traceId || !/^[0-9a-f]{16,32}$/i.test(traceId)) {
    throw new ValidationError("traceId must be a 16–32 character hex string");
  }

  const data = await tempoProxy(`/api/traces/${traceId}`, orgId);
  res.json(data);
}));

// ── GET /v1/traces/tags — tag keys ────────────────────────────────────────────

tracesRouter.get("/meta/tags", requirePermission("traces:read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }
  const data = await tempoProxy("/api/tags", orgId);
  res.json(data);
}));

// ── GET /v1/traces/tags/:name/values ─────────────────────────────────────────

tracesRouter.get("/meta/tags/:name/values", requirePermission("traces:read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }
  const data = await tempoProxy(`/api/tag/${req.params["name"]}/values`, orgId);
  res.json(data);
}));

// ── TraceQL builder ───────────────────────────────────────────────────────────

function buildTraceQL({ serviceName, tags }: { serviceName?: string; tags?: string }): string {
  const conditions: string[] = [];
  if (serviceName) conditions.push(`.service.name = "${serviceName}"`);
  if (tags) {
    for (const tag of tags.split(",")) {
      const [k, v] = tag.trim().split("=");
      if (k && v) conditions.push(`.${k} = "${v}"`);
    }
  }
  return conditions.length > 0 ? `{ ${conditions.join(" && ")} }` : "";
}
