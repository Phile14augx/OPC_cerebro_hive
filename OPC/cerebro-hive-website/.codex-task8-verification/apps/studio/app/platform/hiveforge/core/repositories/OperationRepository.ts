import { Operation } from "@cerebro/db";

export interface IOperationRepository {
  findById(id: string): Promise<Operation | null>;
  findByResource(resourceId: string): Promise<Operation[]>;
  create(data: Partial<Operation>): Promise<Operation>;
  update(id: string, data: Partial<Operation>): Promise<Operation>;
}

import { prisma } from "@cerebro/db";

export class PrismaOperationRepository implements IOperationRepository {
  async findById(id: string): Promise<Operation | null> {
    return prisma.operation.findUnique({ where: { id } });
  }

  async findByResource(resourceId: string): Promise<Operation[]> {
    return prisma.operation.findMany({ where: { resourceId } });
  }

  async create(data: any): Promise<Operation> {
    return prisma.operation.create({ data });
  }

  async update(id: string, data: any): Promise<Operation> {
    return prisma.operation.update({ where: { id }, data });
  }
}

export const operationRepository = new PrismaOperationRepository();
