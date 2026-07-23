export abstract class DomainError extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class AuthorizationError extends DomainError {
  constructor(message: string) {
    super(message, 'AUTHORIZATION_ERROR');
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, 'CONFLICT_ERROR');
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string) {
    super(message, 'NOT_FOUND_ERROR');
  }
}

export class PolicyViolationError extends DomainError {
  constructor(message: string) {
    super(message, 'POLICY_VIOLATION_ERROR');
  }
}

export class ConcurrencyError extends DomainError {
  constructor(message: string) {
    super(message, 'CONCURRENCY_ERROR');
  }
}

export class DuplicateCommandError extends DomainError {
  constructor(message: string) {
    super(message, 'DUPLICATE_COMMAND_ERROR');
  }
}

export class InvariantViolationError extends DomainError {
  constructor(message: string) {
    super(message, 'INVARIANT_VIOLATION_ERROR');
  }
}

export class ExternalDependencyError extends DomainError {
  constructor(message: string) {
    super(message, 'EXTERNAL_DEPENDENCY_ERROR');
  }
}
