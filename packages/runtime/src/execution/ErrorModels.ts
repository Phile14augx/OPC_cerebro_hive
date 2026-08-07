export class AgentExecutionError extends Error {
  constructor(message: string, public readonly code: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'AgentExecutionError';
  }
}

export class ProviderUnavailableError extends AgentExecutionError {
  constructor(message: string, originalError?: Error) {
    super(message, 'PROVIDER_UNAVAILABLE', originalError);
    this.name = 'ProviderUnavailableError';
  }
}

export class InvalidModelError extends AgentExecutionError {
  constructor(message: string, originalError?: Error) {
    super(message, 'INVALID_MODEL', originalError);
    this.name = 'InvalidModelError';
  }
}

export class AuthenticationFailedError extends AgentExecutionError {
  constructor(message: string, originalError?: Error) {
    super(message, 'AUTHENTICATION_FAILED', originalError);
    this.name = 'AuthenticationFailedError';
  }
}

export class RateLimitedError extends AgentExecutionError {
  constructor(message: string, originalError?: Error) {
    super(message, 'RATE_LIMITED', originalError);
    this.name = 'RateLimitedError';
  }
}

export class TimeoutError extends AgentExecutionError {
  constructor(message: string, originalError?: Error) {
    super(message, 'TIMEOUT', originalError);
    this.name = 'TimeoutError';
  }
}

export class ToolFailureError extends AgentExecutionError {
  constructor(message: string, originalError?: Error) {
    super(message, 'TOOL_FAILURE', originalError);
    this.name = 'ToolFailureError';
  }
}

export class ValidationError extends AgentExecutionError {
  constructor(message: string, originalError?: Error) {
    super(message, 'VALIDATION_ERROR', originalError);
    this.name = 'ValidationError';
  }
}
