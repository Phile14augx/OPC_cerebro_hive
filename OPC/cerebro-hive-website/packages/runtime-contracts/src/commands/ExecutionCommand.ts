export type ExecutionCommandType = 
  | 'StartExecutionCommand'
  | 'ResumeExecutionCommand'
  | 'CancelExecutionCommand'
  | 'ApproveExecutionCommand'
  | 'RejectExecutionCommand'
  | 'TimeoutExecutionCommand';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
export interface ExecutionCommand<T = Record<string, any>> {
  readonly id: string;
  readonly type: ExecutionCommandType;
  readonly executionId: string;
  readonly payload: T;
  readonly timestamp: Date;
  readonly tenantId: string;
}

export interface StartExecutionCommandPayload {
  readonly agentId: string;
  readonly agentVersionId: string;
  readonly input: string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
  readonly context?: Record<string, any>;
}
export type StartExecutionCommand = ExecutionCommand<StartExecutionCommandPayload>;

export interface ResumeExecutionCommandPayload {
  readonly expectedSequence: bigint;
  readonly incomingEventId?: string; // If resumed by an inbox event
}
export type ResumeExecutionCommand = ExecutionCommand<ResumeExecutionCommandPayload>;

export interface CancelExecutionCommandPayload {
  readonly reason: string;
  readonly requestedBy: string;
}
export type CancelExecutionCommand = ExecutionCommand<CancelExecutionCommandPayload>;

export interface ApproveExecutionCommandPayload {
  readonly toolCallId: string;
  readonly approvedBy: string;
  readonly comments?: string;
}
export type ApproveExecutionCommand = ExecutionCommand<ApproveExecutionCommandPayload>;

export interface RejectExecutionCommandPayload {
  readonly toolCallId: string;
  readonly rejectedBy: string;
  readonly reason: string;
}
export type RejectExecutionCommand = ExecutionCommand<RejectExecutionCommandPayload>;

export interface TimeoutExecutionCommandPayload {
  readonly reason: string;
}
export type TimeoutExecutionCommand = ExecutionCommand<TimeoutExecutionCommandPayload>;
