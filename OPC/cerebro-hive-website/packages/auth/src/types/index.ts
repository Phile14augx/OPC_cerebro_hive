export type Permission = 
  | 'forge.deploy'
  | 'forge.delete'
  | 'flow.execute'
  | 'studio.publish'
  | 'archive.upload'
  | 'ops.admin'
  | 'platform.settings';

export interface UserPreferences {
  theme: "light" | "dark";
  locale: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  tenantId: string;
  organizationId: string;
  roles: string[];
  permissions: Permission[];
  features: string[];
  preferences: UserPreferences;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
}

export interface Organization {
  id: string;
  name: string;
}

export interface Workspace {
  id: string;
  tenantId: string;
  name: string;
}

export interface Session {
  user: User | null;
  isLoading: boolean;
  error?: string;
}
