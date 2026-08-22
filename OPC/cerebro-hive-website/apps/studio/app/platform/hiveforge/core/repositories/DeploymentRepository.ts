import { Deployment } from "@cerebro/db";

export interface IDeploymentRepository {
  findById(id: string): Promise<Deployment | null>;
  create(data: Partial<Deployment>): Promise<Deployment>;
  update(id: string, data: Partial<Deployment>): Promise<Deployment>;
}

import { prisma } from "@cerebro/db";

export class PrismaDeploymentRepository implements IDeploymentRepository {
  async findById(id: string): Promise<Deployment | null> {
    return prisma.deployment.findUnique({ where: { id } });
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
  async create(data: any): Promise<Deployment> {
    return prisma.deployment.create({ data });
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
  async update(id: string, data: any): Promise<Deployment> {
    return prisma.deployment.update({ where: { id }, data });
  }
}

export const deploymentRepository = new PrismaDeploymentRepository();
