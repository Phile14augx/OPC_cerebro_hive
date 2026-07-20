/** Per-request principal + tenancy context, threaded through every service call. */
export interface Principal {
  userId: string;
  organizationId: string;
  workspaceId?: string;
  roles: string[];
  apiKeyId?: string;
  attributes: Record<string, string>;
}

export interface RequestContext {
  principal: Principal;
  traceId?: string;
  spanId?: string;
  requestId: string;
}

export const SYSTEM_PRINCIPAL: Principal = {
  userId: "system", organizationId: "system", roles: ["system"], attributes: {},
};

export function systemContext(requestId = "system"): RequestContext {
  return { principal: SYSTEM_PRINCIPAL, requestId };
}
