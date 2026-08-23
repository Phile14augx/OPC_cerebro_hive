export type ExecutionEventType =
  | 'ExecutionStarted'
  | 'PromptPrepared'
  | 'LLMStarted'
  | 'LLMCompleted'
  | 'ToolRequested'
  | 'ToolStarted'
  | 'ToolCompleted'
  | 'ApprovalRequested'
  | 'ApprovalGranted'
  | 'ExecutionCompleted'
  | 'ExecutionFailed'
  | 'ExecutionCancelled';

/**
 * The root interface for all immutable execution events.
 * Provides strong typing, deterministic ordering (sequence), and schema versioning.
 */
export interface ExecutionEvent<TPayload = Record<string, unknown>> {
  readonly id: string;
  readonly executionId: string;
  readonly sequence: bigint;
  readonly type: ExecutionEventType;
  readonly occurredAt: Date;
  
  /** The version of the event emission contract. */
  readonly eventVersion: number;
  /** The schema version for the specific payload structure. */
  readonly schemaVersion: number;
  
  // ─── P5.4 Event Metadata Envelope ───
  readonly tenantId: string;
  readonly causationId?: string;
  readonly correlationId?: string;
  readonly parentEventId?: string;
  readonly producer?: string;
  readonly traceId?: string;
  readonly actorId?: string;
  readonly recordedAt?: Date;
  // ────────────────────────────────────
  
  readonly payload: TPayload;
}

// ─── Specific Event Payloads ────────────────────────────────────────────────

export interface ExecutionStartedPayload {
  readonly agentId: string;
  readonly agentVersionId: string;
  readonly conversationId?: string;
  readonly context: Record<string, unknown>;
}
export type ExecutionStartedEvent = ExecutionEvent<ExecutionStartedPayload>;

export interface PromptPreparedPayload {
  readonly systemPrompt: string;
  readonly resolvedVariables: Record<string, unknown>;
}
export type PromptPreparedEvent = ExecutionEvent<PromptPreparedPayload>;

export interface LLMStartedPayload {
  readonly stepNumber: number;
  readonly provider: string;
  readonly model: string;
  readonly inputTokensEstimate?: number;
}
export type LLMStartedEvent = ExecutionEvent<LLMStartedPayload>;

export interface LLMCompletedPayload {
  readonly stepNumber: number;
  readonly content: string;
  readonly toolCalls?: Array<{ id: string; name: string; arguments: string }>;
  readonly finishReason: 'stop' | 'tool_use' | 'max_tokens' | 'error';
  readonly usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  readonly costUsd?: number;
  readonly durationMs: number;
}
export type LLMCompletedEvent = ExecutionEvent<LLMCompletedPayload>;

export interface ToolRequestedPayload {
  readonly stepNumber: number;
  readonly toolCallId: string;
  readonly toolName: string;
  readonly arguments: Record<string, unknown>;
}
export type ToolRequestedEvent = ExecutionEvent<ToolRequestedPayload>;

export interface ToolStartedPayload {
  readonly stepNumber: number;
  readonly toolCallId: string;
}
export type ToolStartedEvent = ExecutionEvent<ToolStartedPayload>;

export interface ToolCompletedPayload {
  readonly stepNumber: number;
  readonly toolCallId: string;
  readonly result: unknown;
  readonly durationMs: number;
}
export type ToolCompletedEvent = ExecutionEvent<ToolCompletedPayload>;

export interface ApprovalRequestedPayload {
  readonly stepNumber: number;
  readonly toolCallId: string;
  readonly requestedBy: string;
}
export type ApprovalRequestedEvent = ExecutionEvent<ApprovalRequestedPayload>;

export interface ApprovalGrantedPayload {
  readonly stepNumber: number;
  readonly toolCallId: string;
  readonly grantedBy: string;
  readonly comments?: string;
}
export type ApprovalGrantedEvent = ExecutionEvent<ApprovalGrantedPayload>;

export interface ExecutionCompletedPayload {
  readonly finalOutput: string;
  readonly totalDurationMs: number;
  readonly totalCostUsd: number;
}
export type ExecutionCompletedEvent = ExecutionEvent<ExecutionCompletedPayload>;

export interface ExecutionFailedPayload {
  readonly reason: string;
  readonly errorDetails?: Record<string, unknown>;
  readonly stepNumber?: number;
}
export type ExecutionFailedEvent = ExecutionEvent<ExecutionFailedPayload>;

export interface ExecutionCancelledPayload {
  readonly reason?: string;
  readonly cancelledBy?: string;
}
export type ExecutionCancelledEvent = ExecutionEvent<ExecutionCancelledPayload>;
