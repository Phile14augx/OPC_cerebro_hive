/**
 * platform-api — Health check routes
 * GET /health       — liveness probe
 * GET /health/ready — readiness probe (checks all deps)
 */

import { Router, type Request, type Response } from "express";
import { prisma } from "@cerebro/db";
import { queue } from "@cerebro/queue";

export const healthRouter = Router();

healthRouter.get("/", (_req: Request, res: Response): void => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

healthRouter.get("/ready", async (_req: Request, res: Response): Promise<void> => {
  const checks = await Promise.allSettled([
    prisma.$queryRaw`SELECT 1`.then(() => ({ name: "database", ok: true })),
    queue.healthCheck().then(({ connected }) => ({ name: "nats", ok: connected })),
  ]);

  const results = checks.map((c) =>
    c.status === "fulfilled" ? c.value : { name: "unknown", ok: false, error: String(c.reason) }
  );

  const allOk = results.every(r => r.ok);

  res.status(allOk ? 200 : 503).json({
    status:    allOk ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    checks:    results,
  });
});
