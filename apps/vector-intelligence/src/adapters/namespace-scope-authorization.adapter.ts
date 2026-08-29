import { AccessContext, AuthorizationError, AuthorizationPort, AuthorizationRequest } from '../ports/authorization.port';

export class NamespaceScopeAuthorizationAdapter implements AuthorizationPort {
  async authorize(context: AccessContext, request: AuthorizationRequest): Promise<void> {
    const tenantNamespace = request.namespace === context.tenantId || request.namespace.startsWith(`${context.tenantId}/`);
    const broadScope = `vector:${request.action}`;
    const namespaceScope = `hive-vector:${request.action}:${request.namespace}`;
    if (!context.subjectId || !tenantNamespace || (!context.scopes.includes(broadScope) && !context.scopes.includes(namespaceScope))) {
      throw new AuthorizationError();
    }
  }
}
