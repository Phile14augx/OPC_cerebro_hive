import { createHash, randomBytes } from "node:crypto";
import { newId } from "../ids/id.js";
import { PlatformError } from "../errors/errors.js";
import type { Principal } from "../context/context.js";

export interface Organization { id: string; name: string; slug: string; createdAt: string }
export interface User { id: string; organizationId: string; email: string; name: string; roles: string[]; attributes: Record<string, string> }
export interface Workspace { id: string; organizationId: string; name: string; kind: string }
export interface ApiKey { id: string; organizationId: string; userId: string; name: string; roles: string[]; revoked: boolean }

export interface IdentityRepository {
  createOrganization(org: Organization): Promise<void>;
  getOrganization(id: string): Promise<Organization | undefined>;
  getOrganizationBySlug(slug: string): Promise<Organization | undefined>;
  createUser(user: User): Promise<void>;
  getUser(id: string): Promise<User | undefined>;
  createWorkspace(ws: Workspace): Promise<void>;
  listWorkspaces(organizationId: string): Promise<Workspace[]>;
  createApiKey(key: ApiKey & { keyHash: string }): Promise<void>;
  findApiKeyByHash(hash: string): Promise<(ApiKey & { userRoles: string[] }) | undefined>;
  revokeApiKey(organizationId: string, id: string): Promise<boolean>;
}

export function hashKey(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export class IdentityService {
  constructor(private readonly repo: IdentityRepository) {}

  async bootstrapOrganization(input: { name: string; slug: string; ownerEmail: string; ownerName: string }): Promise<{ organization: Organization; owner: User; workspace: Workspace; apiKey: { id: string; secret: string } }> {
    const existing = await this.repo.getOrganizationBySlug(input.slug);
    if (existing) throw PlatformError.conflict(`organization slug ${input.slug} already exists`);
    const organization: Organization = { id: newId("org"), name: input.name, slug: input.slug, createdAt: new Date().toISOString() };
    await this.repo.createOrganization(organization);
    const owner: User = { id: newId("usr"), organizationId: organization.id, email: input.ownerEmail, name: input.ownerName, roles: ["owner"], attributes: {} };
    await this.repo.createUser(owner);
    const workspace: Workspace = { id: newId("ws"), organizationId: organization.id, name: "Default", kind: "general" };
    await this.repo.createWorkspace(workspace);
    const apiKey = await this.issueApiKey(organization.id, owner.id, "bootstrap", ["owner"]);
    return { organization, owner, workspace, apiKey };
  }

  async issueApiKey(organizationId: string, userId: string, name: string, roles: string[]): Promise<{ id: string; secret: string }> {
    const secret = `chk_${randomBytes(24).toString("hex")}`;
    const key: ApiKey & { keyHash: string } = {
      id: newId("key"), organizationId, userId, name, roles, revoked: false, keyHash: hashKey(secret),
    };
    await this.repo.createApiKey(key);
    return { id: key.id, secret };
  }

  async authenticate(secret: string): Promise<Principal> {
    const found = await this.repo.findApiKeyByHash(hashKey(secret));
    if (!found || found.revoked) throw new PlatformError("unauthorized", "invalid api key");
    const roles = found.roles.length ? found.roles : found.userRoles;
    return { userId: found.userId, organizationId: found.organizationId, roles, apiKeyId: found.id, attributes: {} };
  }
}
