// removed

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export interface StartExecutionPayload {
  agentId: string;
  agentVersionId: string;
  input: string;
}

export interface ResumeExecutionPayload {
  expectedSequence: bigint;
}

export interface CancelExecutionPayload {
  reason: string;
}

function requireRecord(payload: unknown): Record<string, unknown> {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    throw new ValidationError("Command requires an object payload");
  }
  return payload as Record<string, unknown>;
}

export function parseStartExecutionPayload(payload: unknown): StartExecutionPayload {
  const rec = requireRecord(payload);

  if (
    typeof rec.agentId !== "string" ||
    typeof rec.agentVersionId !== "string" ||
    typeof rec.input !== "string"
  ) {
    throw new ValidationError("Invalid StartExecutionCommand payload");
  }

  return {
    agentId: rec.agentId,
    agentVersionId: rec.agentVersionId,
    input: rec.input,
  };
}

export function parseResumeExecutionPayload(payload: unknown): ResumeExecutionPayload {
  const rec = requireRecord(payload);

  if (
    typeof rec.expectedSequence !== "bigint"
  ) {
    throw new ValidationError("Invalid ResumeExecutionCommand payload");
  }

  return {
    expectedSequence: rec.expectedSequence,
  };
}

export function parseCancelExecutionPayload(payload: unknown): CancelExecutionPayload {
  const rec = requireRecord(payload);

  if (
    typeof rec.reason !== "string"
  ) {
    throw new ValidationError("Invalid CancelExecutionCommand payload");
  }

  return {
    reason: rec.reason,
  };
}
