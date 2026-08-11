import type { Db } from "../persistence/db.js";
import type { ApiKey, IdentityRepository, Organization, User, Workspace } from "./identity.js";

export class PgIdentityRepository implements IdentityRepository {
  constructor(private readonly db: Db) {}

  async createOrganization(org: Organization): Promise<void> {
    await this.db.insertInto("organizations").values({ id: org.id, name: org.name, slug: org.slug, created_at: new Date(org.createdAt) }).execute();
  }
  async getOrganization(id: string): Promise<Organization | undefined> {
    const row = await this.db.selectFrom("organizations").selectAll().where("id", "=", id).executeTakeFirst();
    return row ? { id: row.id, name: row.name, slug: row.slug, createdAt: row.created_at.toISOString() } : undefined;
  }
  async getOrganizationBySlug(slug: string): Promise<Organization | undefined> {
    const row = await this.db.selectFrom("organizations").selectAll().where("slug", "=", slug).executeTakeFirst();
    return row ? { id: row.id, name: row.name, slug: row.slug, createdAt: row.created_at.toISOString() } : undefined;
  }
  async createUser(user: User): Promise<void> {
    await this.db.insertInto("users").values({
      id: user.id, organization_id: user.organizationId, email: user.email, name: user.name,
      roles: JSON.stringify(user.roles), attributes: JSON.stringify(user.attributes), created_at: new Date(),
    }).execute();
  }
  async getUser(id: string): Promise<User | undefined> {
    const row = await this.db.selectFrom("users").selectAll().where("id", "=", id).executeTakeFirst();
    return row ? { id: row.id, organizationId: row.organization_id, email: row.email, name: row.name, roles: JSON.parse(row.roles), attributes: JSON.parse(row.attributes) } : undefined;
  }
  async createWorkspace(ws: Workspace): Promise<void> {
    await this.db.insertInto("workspaces").values({ id: ws.id, organization_id: ws.organizationId, name: ws.name, kind: ws.kind, created_at: new Date() }).execute();
  }
  async listWorkspaces(organizationId: string): Promise<Workspace[]> {
    const rows = await this.db.selectFrom("workspaces").selectAll().where("organization_id", "=", organizationId).execute();
    return rows.map(r => ({ id: r.id, organizationId: r.organization_id, name: r.name, kind: r.kind }));
  }
  async createApiKey(key: ApiKey & { keyHash: string }): Promise<void> {
    await this.db.insertInto("api_keys").values({
      id: key.id, organization_id: key.organizationId, user_id: key.userId, name: key.name,
      key_hash: key.keyHash, roles: JSON.stringify(key.roles), last_used_at: null, created_at: new Date(), revoked_at: null,
    }).execute();
  }
  async findApiKeyByHash(hash: string): Promise<(ApiKey & { userRoles: string[] }) | undefined> {
    const row = await this.db.selectFrom("api_keys").selectAll().where("key_hash", "=", hash).executeTakeFirst();
    if (!row) return undefined;
    const user = await this.db.selectFrom("users").selectAll().where("id", "=", row.user_id).executeTakeFirst();
    void this.db.updateTable("api_keys").set({ last_used_at: new Date() }).where("id", "=", row.id).execute().catch(() => undefined);
    return {
      id: row.id, organizationId: row.organization_id, userId: row.user_id, name: row.name,
      roles: JSON.parse(row.roles), revoked: row.revoked_at != null, userRoles: user ? JSON.parse(user.roles) : [],
    };
  }
  async revokeApiKey(organizationId: string, id: string): Promise<boolean> {
    const res = await this.db.updateTable("api_keys").set({ revoked_at: new Date() })
      .where("id", "=", id).where("organization_id", "=", organizationId).executeTakeFirst();
    return Number(res.numUpdatedRows ?? 0) > 0;
  }
}
