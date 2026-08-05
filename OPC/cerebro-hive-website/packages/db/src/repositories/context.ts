export interface RequestContext {
  tenantId: string;
  workspaceId?: string;
  userId?: string;
  roles?: string[];
  permissions?: string[];
  traceId?: string;
  requestId?: string;
  correlationId?: string;
  locale?: string;
  timezone?: string;
  featureFlags?: string[];
  timestamp?: Date;
}
