import { PrismaClient } from '@prisma/client';

export interface ITransactionContext {}

export class PrismaUnitOfWork {
  constructor(private readonly prisma: PrismaClient) {}

  async execute<T>(work: (tx: ITransactionContext) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      // Cast Prisma transaction client to ITransactionContext
      return work(tx as any);
    });
  }
}
