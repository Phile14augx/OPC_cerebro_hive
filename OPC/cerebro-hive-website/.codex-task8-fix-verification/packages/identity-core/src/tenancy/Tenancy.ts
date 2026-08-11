export interface TenancyScope {
  organizationId: string;
  workspaceId?: string;
  projectId?: string;
  environmentId?: string;
}

export interface ExecutionLocation {
  cloud: string;
  cluster: string;
  region: string;
  availabilityZone?: string;
}

export class TenancyResolver {
  static formatUrn(scope: TenancyScope): string {
    const parts = [`urn:cerebro:org:${scope.organizationId}`];
    if (scope.workspaceId) parts.push(`ws:${scope.workspaceId}`);
    if (scope.projectId) parts.push(`proj:${scope.projectId}`);
    if (scope.environmentId) parts.push(`env:${scope.environmentId}`);
    return parts.join(':');
  }

  static isWithinScope(target: TenancyScope, current: TenancyScope): boolean {
    if (target.organizationId !== current.organizationId) return false;
    if (current.workspaceId && target.workspaceId !== current.workspaceId) return false;
    if (current.projectId && target.projectId !== current.projectId) return false;
    if (current.environmentId && target.environmentId !== current.environmentId) return false;
    return true;
  }
}
