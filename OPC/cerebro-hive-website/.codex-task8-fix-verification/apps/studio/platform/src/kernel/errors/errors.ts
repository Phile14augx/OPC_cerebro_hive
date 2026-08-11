export type ErrorCode =
  | "not_found" | "conflict" | "validation" | "unauthorized" | "forbidden"
  | "rate_limited" | "timeout" | "unavailable" | "internal" | "guard_blocked"
  | "precondition_failed" | "cancelled";

export class PlatformError extends Error {
  readonly code: ErrorCode;
  readonly details?: unknown;
  readonly retryable: boolean;
  constructor(code: ErrorCode, message: string, opts?: { details?: unknown; retryable?: boolean; cause?: unknown }) {
    super(message, { cause: opts?.cause });
    this.code = code;
    this.details = opts?.details;
    this.retryable = opts?.retryable ?? (code === "timeout" || code === "unavailable" || code === "rate_limited");
  }
  static notFound(what: string, id?: string) { return new PlatformError("not_found", id ? `${what} ${id} not found` : `${what} not found`); }
  static forbidden(msg = "forbidden") { return new PlatformError("forbidden", msg); }
  static validation(msg: string, details?: unknown) { return new PlatformError("validation", msg, { details }); }
  static conflict(msg: string) { return new PlatformError("conflict", msg); }
}

export function httpStatus(code: ErrorCode): number {
  switch (code) {
    case "not_found": return 404;
    case "conflict": return 409;
    case "validation": return 400;
    case "unauthorized": return 401;
    case "forbidden": return 403;
    case "rate_limited": return 429;
    case "timeout": return 504;
    case "unavailable": return 503;
    case "guard_blocked": return 422;
    case "precondition_failed": return 412;
    case "cancelled": return 499 as number;
    default: return 500;
  }
}
