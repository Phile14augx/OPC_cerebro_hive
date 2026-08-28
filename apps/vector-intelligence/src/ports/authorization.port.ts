export interface AccessContext {
  subjectId: string;
  tenantId: string;
  scopes: string[];
  aclGroups: string[];
}

export interface AuthorizationRequest {
  action: 'read' | 'write';
  namespace: string;
}

export interface AuthorizationPort {
  authorize(context: AccessContext, request: AuthorizationRequest): Promise<void>;
}

export class AuthorizationError extends Error {
  constructor(message = 'The subject is not authorized for this namespace') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class DependencyTimeoutError extends Error {
  constructor(dependency: string) {
    super(`${dependency} timed out`);
    this.name = 'DependencyTimeoutError';
  }
}
