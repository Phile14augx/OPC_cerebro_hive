export type AuthenticatedScope = {
  tenantId: string;
  workspaceId: string;
  userId: string;
};

export const DEV_TENANT_ID =
  process.env['TWIN_STUDIO_DEV_TENANT_ID'] ?? '00000000-0000-4000-8000-000000000101';
export const DEV_WORKSPACE_ID =
  process.env['TWIN_STUDIO_DEV_WORKSPACE_ID'] ?? '00000000-0000-4000-8000-000000000102';
export const DEV_USER_ID =
  process.env['TWIN_STUDIO_DEV_USER_ID'] ?? '00000000-0000-4000-8000-000000000103';

export function usesLocalDevelopmentAuth() {
  return process.env['NODE_ENV'] !== 'production' && process.env['TWIN_STUDIO_DEV_AUTH'] !== 'disabled';
}

export function localDevelopmentScope(): AuthenticatedScope {
  return {
    tenantId: DEV_TENANT_ID,
    workspaceId: DEV_WORKSPACE_ID,
    userId: DEV_USER_ID,
  };
}
