/**
 * @cerebro/errors — Express error serialization middleware
 */

import type { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import { DomainError, isDomainError, toDomainError } from "./domain.js";

export const errorHandler: ErrorRequestHandler = (
  err:  unknown,
  req:  Request,
  res:  Response,
  next: NextFunction,
): void => {
  if (res.headersSent) { next(err); return; }

  const traceId = req.headers["x-trace-id"] as string | undefined ?? undefined;
  const domainErr = toDomainError(err, traceId);

  // Log — structured, not noisy for expected errors
  if (domainErr.statusCode >= 500) {
    console.error("[error]", {
      code:       domainErr.code,
      message:    domainErr.message,
      statusCode: domainErr.statusCode,
      traceId,
      path:       req.path,
      method:     req.method,
      stack:      domainErr.stack,
      cause:      domainErr.cause,
    });
  } else if (domainErr.statusCode >= 400) {
    console.warn("[error]", {
      code:       domainErr.code,
      message:    domainErr.message,
      statusCode: domainErr.statusCode,
      traceId,
      path:       req.path,
    });
  }

  const body: Record<string, unknown> = {
    success:    false,
    error:      domainErr.code,
    message:    domainErr.message,
    statusCode: domainErr.statusCode,
    traceId:    traceId ?? null,
  };

  if (process.env["NODE_ENV"] !== "production" && domainErr.detail && Object.keys(domainErr.detail).length > 0) {
    body["detail"] = domainErr.detail;
  }

  // Include rate limit headers
  if (domainErr.statusCode === 429 && "retryAfterMs" in domainErr) {
    const retryAfterS = Math.ceil((domainErr as { retryAfterMs: number }).retryAfterMs / 1000);
    res.setHeader("Retry-After", retryAfterS);
    res.setHeader("X-RateLimit-Reset", Date.now() + (domainErr as { retryAfterMs: number }).retryAfterMs);
  }

  res.status(domainErr.statusCode).json(body);
};

/** Wrap async route handlers to forward thrown errors to errorHandler */
export function asyncHandler<T extends (req: Request, res: Response, next: NextFunction) => Promise<void>>(
  fn: T,
): T {
  return ((req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  }) as T;
}

/** 404 handler — must be registered after all routes */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const { DomainError: _DE, ...rest } = { DomainError };
  void next(new (class extends DomainError {
    constructor() {
      super({ code: "NOT_FOUND", message: `Route ${req.method} ${req.path} not found`, statusCode: 404 });
    }
  })());
};
