// ── API error types (shared between services and clients) ─────────────────────

export type ErrorCode =
  // Auth
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INVALID_API_KEY"
  | "API_KEY_EXPIRED"
  | "INSUFFICIENT_PERMISSIONS"
  | "SESSION_EXPIRED"
  | "MFA_REQUIRED"
  // Validation
  | "VALIDATION_ERROR"
  | "INVALID_REQUEST"
  | "MISSING_REQUIRED_FIELD"
  | "FIELD_TOO_LONG"
  | "INVALID_FORMAT"
  // Resources
  | "NOT_FOUND"
  | "ALREADY_EXISTS"
  | "CONFLICT"
  | "GONE"
  // Rate limiting
  | "RATE_LIMIT_EXCEEDED"
  | "TOKEN_BUDGET_EXCEEDED"
  | "CONCURRENT_LIMIT_EXCEEDED"
  // Billing
  | "PLAN_LIMIT_EXCEEDED"
  | "SUBSCRIPTION_REQUIRED"
  | "PAYMENT_REQUIRED"
  // AI
  | "AI_PROVIDER_ERROR"
  | "AI_PROVIDER_UNAVAILABLE"
  | "MODEL_NOT_FOUND"
  | "CONTEXT_TOO_LONG"
  | "CONTENT_FILTER"
  // Workflows
  | "WORKFLOW_NOT_FOUND"
  | "WORKFLOW_NOT_PUBLISHED"
  | "EXECUTION_IN_PROGRESS"
  | "EXECUTION_FAILED"
  | "STEP_TIMEOUT"
  // Server
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "DATABASE_ERROR"
  | "GENERATION_BUILD_FAILED"
  | "CAPABILITY_NOT_IMPLEMENTED"
  | "TALENT_SCHEMA_UNAVAILABLE"
  | "ANALYZER_UNAVAILABLE";

export interface ApiError {
  code:       ErrorCode;
  message:    string;
  details?:   Record<string, unknown>;
  field?:     string;             // for validation errors
  requestId?: string;
  traceId?:   string;
}

export interface ApiErrorResponse {
  error:     ApiError;
  status:    number;
  timestamp: string;
  path:      string;
}

export function isApiError(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as Record<string, unknown>)["error"] === "object"
  );
}
