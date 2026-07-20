import type { ApiKey, IdentityRepository, Organization, User, Workspace } from "./identity.js";

export class InMemoryIdentityRepository implements IdentityRepository {
  orgs = new Map<string, Organization>();
  users = new Map<string, User>();
  workspaces = new Map<string, Workspace>();
  keys = new Map<string, ApiKey & { keyHash: string }>();

  async createOrganization(org: Organization): Promise<void> { this.orgs.set(org.id, org); }
  async getOrganization(id: string): Promise<Organization | undefined> { return this.orgs.get(id); }
  async getOrganizationBySlug(slug: string): Promise<Organization | undefined> {
    return [...this.orgs.values()].find(o => o.slug === slug);
  }
  async createUser(user: User): Promise<void> { this.users.set(user.id, user); }
  async getUser(id: string): Promise<User | undefined> { return this.users.get(id); }
  async createWorkspace(ws: Workspace): Promise<void> { this.workspaces.set(ws.id, ws); }
  async listWorkspaces(organizationId: string): Promise<Workspace[]> {
    return [...this.workspaces.values()].filter(w => w.organizationId === organizationId);
  }
  async createApiKey(key: ApiKey & { keyHash: string }): Promise<void> { this.keys.set(key.id, key); }
  async findApiKeyByHash(hash: string): Promise<(ApiKey & { userRoles: string[] }) | undefined> {
    const key = [...this.keys.values()].find(k => k.keyHash === hash);
    if (!key) return undefined;
    const user = this.users.get(key.userId);
    return { ...key, userRoles: user?.roles ?? [] };
  }
  async revokeApiKey(organizationId: string, id: string): Promise<boolean> {
    const key = this.keys.get(id);
    if (!key || key.organizationId !== organizationId) return false;
    key.revoked = true;
    return true;
  }
}
