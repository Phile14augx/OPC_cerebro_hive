import { DomainError } from '@cerebro/domain';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  traceId?: string;
}

export class ErrorMapper {
  static mapToProblemDetails(error: Error, traceId?: string): ProblemDetails {
    if (error instanceof DomainError) {
      return this.mapDomainError(error, traceId);
    }

    // Unhandled / Unexpected Errors
    return {
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected failure occurred.',
      traceId,
    };
  }

  private static mapDomainError(error: DomainError, traceId?: string): ProblemDetails {
    const defaultDetails = {
      type: `https://api.cerebrohive.com/errors/${error.code.toLowerCase()}`,
      title: error.name,
      detail: error.message,
      traceId,
    };

    switch (error.code) {
      case 'VALIDATION_ERROR':
        return { ...defaultDetails, status: 400 };
      case 'AUTHORIZATION_ERROR':
      case 'POLICY_VIOLATION_ERROR':
        return { ...defaultDetails, status: 403 };
      case 'NOT_FOUND_ERROR':
        return { ...defaultDetails, status: 404 };
      case 'CONFLICT_ERROR':
      case 'CONCURRENCY_ERROR':
        return { ...defaultDetails, status: 409 };
      case 'DUPLICATE_COMMAND_ERROR':
        return { ...defaultDetails, status: 409 }; // Alternatively could be 200 with cached result, but 409 is standard for explicit duplicates without idempotency fetch mechanism exposed here
      case 'EXTERNAL_DEPENDENCY_ERROR':
        return { ...defaultDetails, status: 503 };
      default:
        return { ...defaultDetails, status: 422 }; // BusinessRuleViolation or InvariantViolation
    }
  }
}
