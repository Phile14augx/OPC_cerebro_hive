/**
 * @cerebro/db — User, Organization & Membership Repositories
 * Aligned to actual Prisma schema field names.
 */

import { type Prisma, type User, type Organization, type OrgMembership, type UserRole, prisma } from "../client/index.js";

// ── User repository ───────────────────────────────────────────────────────────

export interface CreateUserInput {
  email:         string;
  name:          string;
  avatarUrl?:    string;
  authProvider?: import("../client/index.js").AuthProvider;
  externalId?:   string;
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

  async findByExternalId(externalId: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { externalId } });
  },

  async findByIdOrThrow(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw Object.assign(new Error(`User ${id} not found`), { code: "NOT_FOUND" });
    return user;
  },

  async update(id: string, data: Partial<Pick<User, "name" | "avatarUrl" | "lastLoginAt">>): Promise<User> {
    return prisma.user.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
  },

  async recordLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data:  { lastLoginAt: new Date() },
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  },

  async findMemberships(userId: string): Promise<(OrgMembership & { org: Organization })[]> {
    return prisma.orgMembership.findMany({
      where:   { userId },
      include: { org: true },
    });
  },
};

// ── Organization repository ───────────────────────────────────────────────────

export interface CreateOrgInput {
  name:       string;
  slug:       string;
  ownerId:    string;
  plan?:      string;
  logoUrl?:   string;  // schema field is `logoUrl`, not `avatarUrl`
}

export const orgRepository = {
  async create(input: CreateOrgInput): Promise<Organization> {
    return prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name:    input.name,
          slug:    input.slug,
          ownerId: input.ownerId,
          plan:    (input.plan ?? "FREE") as Prisma.EnumPlanTierFieldUpdateOperationsInput["set"],
          logoUrl: input.logoUrl,
        },
      });

      // Auto-create OWNER membership for the creator
      await tx.orgMembership.create({
        data: {
          orgId:  org.id,
          userId: input.ownerId,
          role:   "OWNER",
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

  async update(
    id: string,
    data: Partial<Pick<Organization, "name" | "logoUrl">> & {
      settings?: Prisma.InputJsonValue;
      limits?:   Prisma.InputJsonValue;
    }
  ): Promise<Organization> {
    return prisma.organization.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
  },

  async delete(id: string): Promise<void> {
    await prisma.organization.delete({ where: { id } });
  },

  async getMembers(orgId: string): Promise<(OrgMembership & { user: User })[]> {
    return prisma.orgMembership.findMany({
      where:   { orgId },
      include: { user: true },
      orderBy: { joinedAt: "asc" },
    });
  },

  async getMembership(orgId: string, userId: string): Promise<OrgMembership | null> {
    return prisma.orgMembership.findFirst({ where: { orgId, userId } });
  },

  async addMember(orgId: string, userId: string, role: string = "MEMBER"): Promise<OrgMembership> {
    return prisma.orgMembership.upsert({
      where:  { userId_orgId: { orgId, userId } },
      create: { orgId, userId, role: role as UserRole },
      update: { role: role as UserRole },
    });
  },

  async removeMember(orgId: string, userId: string): Promise<void> {
    await prisma.orgMembership.delete({
      where: { userId_orgId: { orgId, userId } },
    });
  },

  async updateMemberRole(orgId: string, userId: string, role: string): Promise<OrgMembership> {
    return prisma.orgMembership.update({
      where: { userId_orgId: { orgId, userId } },
      data:  { role: role as UserRole },
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
    return prisma.apiKey.findFirst({ where: { keyPrefix } });
  },

  async findByOrgId(orgId: string) {
    return prisma.apiKey.findMany({
      where:   { orgId },
      orderBy: { createdAt: "desc" },
    });
  },

  async recordUsage(id: string): Promise<void> {
    await prisma.apiKey.update({
      where: { id },
      data:  { lastUsedAt: new Date() },
    });
  },

  async revoke(id: string, orgId: string): Promise<void> {
    void orgId; // kept for call-site compatibility
    await prisma.apiKey.update({
      where: { id },
      data:  { revokedAt: new Date() },
    });
  },
};
