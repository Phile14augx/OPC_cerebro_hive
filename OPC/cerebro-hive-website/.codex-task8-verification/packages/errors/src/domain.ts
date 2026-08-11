/**
 * @cerebro/errors — Structured error hierarchy
 *
 * DomainError (base)
 *   ├── ValidationError
 *   ├── NotFoundError
 *   ├── ConflictError
 *   ├── AuthError
 *   │     ├── UnauthenticatedError
 *   │     └── ForbiddenError
 *   ├── RateLimitError
 *   ├── QuotaExceededError
 *   ├── AIProviderError
 *   ├── TemporalError
 *   └── InternalError
 */

import type { ErrorCode } from "@cerebro/shared-types";

// ── Base ──────────────────────────────────────────────────────────────────────

export interface DomainErrorOptions {
  code:       ErrorCode;
  message:    string;
  statusCode: number;
  detail?:    Record<string, unknown>;
  cause?:     unknown;
  traceId?:   string;
}

export class DomainError extends Error {
  readonly code:       ErrorCode;
  readonly statusCode: number;
  readonly detail:     Record<string, unknown>;
  readonly traceId:    string | null;
  override readonly cause: unknown;

  constructor(opts: DomainErrorOptions) {
    super(opts.message);
    this.name       = this.constructor.name;
    this.code       = opts.code;
    this.statusCode = opts.statusCode;
    this.detail     = opts.detail ?? {};
    this.cause      = opts.cause  ?? null;
    this.traceId    = opts.traceId ?? null;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      error:      this.code,
      message:    this.message,
      statusCode: this.statusCode,
      detail:     this.detail,
      traceId:    this.traceId,
    };
  }
}

// ── Validation ────────────────────────────────────────────────────────────────

export class ValidationError extends DomainError {
  constructor(message: string, detail?: Record<string, unknown>, traceId?: string) {
    super({ code: "VALIDATION_ERROR", message, statusCode: 400, detail, traceId });
  }
}

// ── Not Found ─────────────────────────────────────────────────────────────────

export class NotFoundError extends DomainError {
  constructor(resource: string, id?: string, traceId?: string) {
    const message = id ? `${resource} '${id}' not found` : `${resource} not found`;
    super({ code: "NOT_FOUND", message, statusCode: 404, detail: { resource, id }, traceId });
  }
}

// ── Conflict ──────────────────────────────────────────────────────────────────

export class ConflictError extends DomainError {
  constructor(message: string, detail?: Record<string, unknown>, traceId?: string) {
    super({ code: "CONFLICT", message, statusCode: 409, detail, traceId });
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export class AuthError extends DomainError {}

export class UnauthenticatedError extends AuthError {
  constructor(message: string = "Authentication required", traceId?: string) {
    super({ code: "UNAUTHORIZED", message, statusCode: 401, traceId });
  }
}

export class ForbiddenError extends AuthError {
  constructor(message: string = "Insufficient permissions", detail?: Record<string, unknown>, traceId?: string) {
    super({ code: "FORBIDDEN", message, statusCode: 403, detail, traceId });
  }
}

// ── Rate limiting ─────────────────────────────────────────────────────────────

export class RateLimitError extends DomainError {
  readonly retryAfterMs: number;

  constructor(retryAfterMs: number, traceId?: string) {
    super({
      code:       "RATE_LIMIT_EXCEEDED",
      message:    `Rate limit exceeded. Retry after ${Math.ceil(retryAfterMs / 1000)}s.`,
      statusCode: 429,
      detail:     { retryAfterMs, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) },
      traceId,
    });
    this.retryAfterMs = retryAfterMs;
  }
}

// ── Quota ─────────────────────────────────────────────────────────────────────

export class QuotaExceededError extends DomainError {
  constructor(resource: string, limit: number, used: number, traceId?: string) {
    super({
      code:       "QUOTA_EXCEEDED",
      message:    `Quota exceeded for ${resource}: ${used}/${limit}`,
      statusCode: 429,
      detail:     { resource, limit, used },
      traceId,
    });
  }
}

// ── AI Provider ───────────────────────────────────────────────────────────────

export class AIProviderError extends DomainError {
  constructor(provider: string, message: string, cause?: unknown, traceId?: string) {
    super({
      code:       "PROVIDER_ERROR",
      message:    `AI provider error (${provider}): ${message}`,
      statusCode: 502,
      detail:     { provider },
      cause,
      traceId,
    });
  }
}

// ── Temporal ──────────────────────────────────────────────────────────────────

export class TemporalError extends DomainError {
  constructor(message: string, cause?: unknown, traceId?: string) {
    super({
      code:       "WORKFLOW_EXECUTION_FAILED",
      message:    `Workflow engine error: ${message}`,
      statusCode: 500,
      cause,
      traceId,
    });
  }
}

// ── Internal ──────────────────────────────────────────────────────────────────

export class InternalError extends DomainError {
  constructor(message: string = "Internal server error", cause?: unknown, traceId?: string) {
    super({ code: "INTERNAL_ERROR", message, statusCode: 500, cause, traceId });
  }
}

// ── Type guard ────────────────────────────────────────────────────────────────

export function isDomainError(err: unknown): err is DomainError {
  return err instanceof DomainError;
}

export function toDomainError(err: unknown, traceId?: string): DomainError {
  if (isDomainError(err)) return err;
  const message = err instanceof Error ? err.message : "An unexpected error occurred";
  return new InternalError(message, err, traceId);
}
