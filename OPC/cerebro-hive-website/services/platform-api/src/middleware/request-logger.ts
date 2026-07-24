/**
 * platform-api — Structured request logging middleware
 */

import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const requestId = (req.headers["x-request-id"] as string | undefined) ?? randomUUID();
  const traceId   = (req.headers["x-trace-id"]   as string | undefined) ?? randomUUID();

  req.headers["x-request-id"] = requestId;
  req.headers["x-trace-id"]   = traceId;
  res.setHeader("X-Request-ID", requestId);
  res.setHeader("X-Trace-ID",   traceId);

  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const level = res.statusCode >= 500 ? "error"
                : res.statusCode >= 400 ? "warn"
                : "info";

    console[level]({
      type:       "http",
      method:     req.method,
      path:       req.path,
      status:     res.statusCode,
      durationMs,
      requestId,
      traceId,
      ip:         req.ip,
      userAgent:  req.headers["user-agent"],
      userId:     (req as typeof req & { auth?: { userId: string } }).auth?.userId ?? null,
    });
  });

  next();
}
