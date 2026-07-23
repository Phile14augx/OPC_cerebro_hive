import { PrismaClient, Prisma } from '@prisma/client';
import { RequestContext } from './context';

// Type alias for a Prisma transaction client so we can pass it down.
export type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export type DbClient = PrismaClient | PrismaTransactionClient;

export interface IRepositoryOptions {
  tx?: PrismaTransactionClient;
  context: RequestContext;
}

export abstract class BaseRepository {
  protected readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Returns either the provided transaction client or the main Prisma client.
   * This facilitates the Unit of Work pattern at the Domain Service layer.
   */
  protected getClient(options: IRepositoryOptions): DbClient {
    return options.tx ?? this.prisma;
  }

  /**
   * Enforces that all queries are scoped to the given tenant.
   */
  protected tenantFilter(context: RequestContext): { tenantId: string } {
    if (!context.tenantId) {
      throw new Error('RequestContext must provide a tenantId to access this repository.');
    }
    return { tenantId: context.tenantId };
  }

  /**
   * Enforces that all queries are scoped to the given workspace.
   */
  protected workspaceFilter(context: RequestContext): { workspaceId: string } {
    if (!context.workspaceId) {
      throw new Error('RequestContext must provide a workspaceId to access this repository.');
    }
    return { workspaceId: context.workspaceId };
  }
}
