export type IdentityType = 'Human' | 'Service' | 'Robot';

export interface BaseIdentity {
  id: string;
  type: IdentityType;
  tenantId: string;
  roles: string[];
}

export interface HumanIdentity extends BaseIdentity {
  type: 'Human';
  email: string;
  displayName: string;
  organizationId: string;
}

export interface ServiceIdentity extends BaseIdentity {
  type: 'Service';
  serviceName: string;
  permissions: string[];
}

export interface RobotIdentity extends BaseIdentity {
  type: 'Robot';
  agentId: string;
  ownerId: string;
}

export type PlatformIdentity = HumanIdentity | ServiceIdentity | RobotIdentity;
