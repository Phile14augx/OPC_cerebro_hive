import { User, TenantMember } from '@prisma/client';
import { BaseRepository, IRepositoryOptions } from './BaseRepository';

export interface ProvisionUserInput {
  email: string;
  name?: string;
  avatarUrl?: string;
  roleId: string;
}

export class UserRepository extends BaseRepository {
  async findUserByEmail(email: string, options: IRepositoryOptions): Promise<User | null> {
    const db = this.getClient(options);
    return db.user.findUnique({
      where: { email },
    });
  }

  async provisionUserInTenant(input: ProvisionUserInput, options: IRepositoryOptions): Promise<{ user: User; member: TenantMember }> {
    const db = this.getClient(options);
    const { tenantId } = this.tenantFilter(options.context);

    // We can use the db client to ensure we either reuse the tx or use prisma.
    // However, finding and creating can have race conditions. 
    // In a real implementation this might be an upsert inside a transaction.
    let user = await db.user.findUnique({ where: { email: input.email } });
    
    if (!user) {
      user = await db.user.create({
        data: {
          email: input.email,
          name: input.name,
          avatarUrl: input.avatarUrl,
        }
      });
    }

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
