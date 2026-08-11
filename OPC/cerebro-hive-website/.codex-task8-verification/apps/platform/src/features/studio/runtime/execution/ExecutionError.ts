/**
 * M24 — Structured Error Model
 *
 * Replaces raw `throw new Error()`.
 * Future AI Copilot can read .suggestion to recommend fixes.
 */

export type ExecutionErrorCategory =
  | 'NodeExecutionError'
  | 'InputResolutionError'
  | 'TypeMismatchError'
  | 'ProviderError'
  | 'TimeoutError'
  | 'CancellationError'
  | 'PolicyViolationError'
  | 'ResourceExhaustedError'
  | 'SchemaValidationError'
  | 'UnknownError';

export type ExecutionErrorSeverity = 'Fatal' | 'Recoverable' | 'Warning';

export class ExecutionError extends Error {
  readonly category: ExecutionErrorCategory;
  readonly severity: ExecutionErrorSeverity;
  readonly nodeId?: string;
  readonly executionId?: string;
  readonly stageId?: string;
  readonly retryable: boolean;
  readonly suggestion?: string;
  readonly cause?: unknown;

  constructor(opts: {
    category: ExecutionErrorCategory;
    severity?: ExecutionErrorSeverity;
    message: string;
    nodeId?: string;
    executionId?: string;
    stageId?: string;
    retryable?: boolean;
    suggestion?: string;
    cause?: unknown;
  }) {
    super(opts.message);
    this.name = 'ExecutionError';
    this.category = opts.category;
    this.severity = opts.severity ?? 'Recoverable';
    this.nodeId = opts.nodeId;
    this.executionId = opts.executionId;
    this.stageId = opts.stageId;
    this.retryable = opts.retryable ?? false;
    this.suggestion = opts.suggestion;
    this.cause = opts.cause;
  }

  toJSON() {
    return {
      name: this.name,
      category: this.category,
      severity: this.severity,
      message: this.message,
      nodeId: this.nodeId,
      executionId: this.executionId,
      stageId: this.stageId,
      retryable: this.retryable,
      suggestion: this.suggestion,
    };
  }
}
