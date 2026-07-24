/**
 * @cerebro/db — User, Organization & Membership Repositories
 */

import { type Prisma, type User, type Organization, type OrgMembership, prisma } from "../client/index.js";

// ── User repository ───────────────────────────────────────────────────────────

export interface CreateUserInput {
  email:          string;
  displayName:    string;
  avatarUrl?:     string;
  authProvider?:  string;
  authProviderId?: string;
  keycloakId?:    string;
}

export const userRepository = {
  async create(input: CreateUserInput): Promise<User> {
    return prisma.user.create({ data: input });
  },

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  async findByKeycloakId(keycloakId: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { keycloakId } });
  },

  async findByIdOrThrow(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw Object.assign(new Error(`User ${id} not found`), { code: "NOT_FOUND" });
    return user;
  },

  async update(id: string, data: Partial<Pick<User, "displayName" | "avatarUrl" | "lastActiveAt">>): Promise<User> {
    return prisma.user.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
  },

  async recordLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data:  { lastActiveAt: new Date(), loginCount: { increment: 1 } },
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  },

  async findMemberships(userId: string): Promise<(OrgMembership & { organization: Organization })[]> {
    return prisma.orgMembership.findMany({
      where:   { userId, status: "ACTIVE" },
      include: { organization: true },
    });
  },
};

// ── Organization repository ───────────────────────────────────────────────────

export interface CreateOrgInput {
  name:        string;
  slug:        string;
  ownerId:     string;
  plan?:       string;
  avatarUrl?:  string;
}

export const orgRepository = {
  async create(input: CreateOrgInput): Promise<Organization> {
    return prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name:      input.name,
          slug:      input.slug,
          ownerId:   input.ownerId,
          plan:      (input.plan ?? "FREE") as Prisma.EnumPlanTierFilter,
          avatarUrl: input.avatarUrl,
        },
      });

      // Auto-create OWNER membership for the creator
      await tx.orgMembership.create({
        data: {
          orgId:  org.id,
          userId: input.ownerId,
          role:   "OWNER",
          status: "ACTIVE",
        },
      });

      return org;
    });
  },

  async findById(id: string): Promise<Organization | null> {
    return prisma.organization.findUnique({ where: { id } });
  },

  async findBySlug(slug: string): Promise<Organization | null> {
    return prisma.organization.findFirst({ where: { slug } });
  },

  async findByIdOrThrow(id: string): Promise<Organization> {
    const org = await this.findById(id);
    if (!org) throw Object.assign(new Error(`Organization ${id} not found`), { code: "NOT_FOUND" });
    return org;
  },

  async update(id: string, data: Partial<Pick<Organization, "name" | "avatarUrl" | "settings" | "limits">>): Promise<Organization> {
    return prisma.organization.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
  },

  async delete(id: string): Promise<void> {
    await prisma.organization.delete({ where: { id } });
  },

  async getMembers(orgId: string): Promise<(OrgMembership & { user: User })[]> {
    return prisma.orgMembership.findMany({
      where:   { orgId, status: "ACTIVE" },
      include: { user: true },
      orderBy: { joinedAt: "asc" },
    });
  },

  async getMembership(orgId: string, userId: string): Promise<OrgMembership | null> {
    return prisma.orgMembership.findFirst({ where: { orgId, userId, status: "ACTIVE" } });
  },

  async addMember(orgId: string, userId: string, role: string = "MEMBER"): Promise<OrgMembership> {
    return prisma.orgMembership.upsert({
      where:  { orgId_userId: { orgId, userId } },
      create: { orgId, userId, role: role as Prisma.EnumMemberRoleFilter, status: "ACTIVE" },
      update: { role: role as Prisma.EnumMemberRoleFilter, status: "ACTIVE" },
    });
  },

  async removeMember(orgId: string, userId: string): Promise<void> {
    await prisma.orgMembership.update({
      where: { orgId_userId: { orgId, userId } },
      data:  { status: "REMOVED", leftAt: new Date() },
    });
  },

  async updateMemberRole(orgId: string, userId: string, role: string): Promise<OrgMembership> {
    return prisma.orgMembership.update({
      where: { orgId_userId: { orgId, userId } },
      data:  { role: role as Prisma.EnumMemberRoleFilter },
    });
  },
};

// ── API Key repository ────────────────────────────────────────────────────────

export interface CreateApiKeyInput {
  orgId:      string;
  userId:     string;
  name:       string;
  keyHash:    string;
  keyPrefix:  string;
  scopes:     string[];
  expiresAt?: Date;
}

export const apiKeyRepository = {
  async create(input: CreateApiKeyInput) {
    return prisma.apiKey.create({ data: input });
  },

  async findByPrefix(keyPrefix: string) {
    return prisma.apiKey.findFirst({ where: { keyPrefix, status: "ACTIVE" } });
  },

  async findByOrgId(orgId: string) {
    return prisma.apiKey.findMany({
      where:   { orgId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });
  },

  async recordUsage(id: string): Promise<void> {
    await prisma.apiKey.update({
      where: { id },
      data:  { lastUsedAt: new Date(), requestCount: { increment: 1 } },
    });
  },

  async revoke(id: string, orgId: string): Promise<void> {
    await prisma.apiKey.update({
      where: { id },
      data:  { status: "REVOKED", revokedAt: new Date() },
    });
  },
};
