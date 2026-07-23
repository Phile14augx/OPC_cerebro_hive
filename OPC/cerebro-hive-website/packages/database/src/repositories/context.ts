export interface RequestContext {
  tenantId: string;
  workspaceId?: string;
  userId?: string;
  roles?: string[];
  permissions?: string[];
  requestId?: string;
  correlationId?: string;
}
