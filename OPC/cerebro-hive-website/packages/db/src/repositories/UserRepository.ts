import { User, TenantMember } from '../generated/client';
import {
  BaseRepository,
  IRepositoryOptions,
  type PrismaTransactionClient,
} from './BaseRepository';

export interface ProvisionUserInput {
  email: string;
  name?: string;
  avatarUrl?: string;
  roleId: string;
}

export interface PasswordCredentialLookup {
  user: User;
  passwordHash: string;
}

export interface UserLookupOptions {
  tx?: PrismaTransactionClient;
}

export class UserRepository extends BaseRepository {
  async findUserByEmail(email: string, options: IRepositoryOptions): Promise<User | null> {
    const db = this.getClient(options);
    return db.user.findUnique({
      where: { email },
    });
  }

  async findPasswordCredentialByEmail(
    email: string,
    options: UserLookupOptions = {},
  ): Promise<PasswordCredentialLookup | null> {
    const db = options.tx ?? this.prisma;
    const record = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        passwordCredential: {
          select: { passwordHash: true },
        },
      },
    });

    if (!record?.passwordCredential) {
      return null;
    }

    const { passwordCredential, ...user } = record;
    return { user, passwordHash: passwordCredential.passwordHash };
  }

  async provisionUserInTenant(input: ProvisionUserInput, options: IRepositoryOptions): Promise<{ user: User; member: TenantMember }> {
    const db = this.getClient(options);
    const { tenantId } = this.tenantFilter(options.context);

    const user = await db.user.upsert({
      where: { email: input.email },
      update: {},
      create: {
        email: input.email,
        name: input.name,
        avatarUrl: input.avatarUrl,
      },
    });

    const member = await db.tenantMember.upsert({
      where: {
        tenantId_userId: { tenantId, userId: user.id }
      },
      create: {
        tenantId,
        userId: user.id,
        roleId: input.roleId
      },
      update: {
        roleId: input.roleId
      }
    });

    return { user, member };
  }

  async getTenantMembers(options: IRepositoryOptions): Promise<(TenantMember & { user: User })[]> {
    const db = this.getClient(options);
    const { tenantId } = this.tenantFilter(options.context);

    return db.tenantMember.findMany({
      where: { tenantId },
      include: { user: true },
    });
  }
}
