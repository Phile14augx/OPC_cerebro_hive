import { Tenant } from '@prisma/client';
import { BaseRepository, IRepositoryOptions } from './BaseRepository';

export interface CreateTenantInput {
  name: string;
  slug: string;
  billingPlan?: string;
}

export class TenantRepository extends BaseRepository {
  async createTenant(input: CreateTenantInput, options: IRepositoryOptions): Promise<Tenant> {
    const db = this.getClient(options);
    return db.tenant.create({
      data: {
        name: input.name,
        slug: input.slug,
        billingPlan: input.billingPlan ?? 'enterprise',
      },
    });
  }

  async getTenantById(tenantId: string, options: IRepositoryOptions): Promise<Tenant | null> {
    const db = this.getClient(options);
    return db.tenant.findUnique({
      where: { id: tenantId },
    });
  }

  async suspendTenant(options: IRepositoryOptions): Promise<Tenant> {
    const db = this.getClient(options);
    const { tenantId } = this.tenantFilter(options.context);

    return db.tenant.update({
      where: { id: tenantId },
      data: { isActive: false },
    });
  }
}
