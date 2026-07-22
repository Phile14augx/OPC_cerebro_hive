import { Deployment } from "@prisma/client";

export interface IDeploymentRepository {
  findById(id: string): Promise<Deployment | null>;
  create(data: Partial<Deployment>): Promise<Deployment>;
  update(id: string, data: Partial<Deployment>): Promise<Deployment>;
}

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export class PrismaDeploymentRepository implements IDeploymentRepository {
  async findById(id: string): Promise<Deployment | null> {
    return prisma.deployment.findUnique({ where: { id } });
  }

  async create(data: any): Promise<Deployment> {
    return prisma.deployment.create({ data });
  }

  async update(id: string, data: any): Promise<Deployment> {
    return prisma.deployment.update({ where: { id }, data });
  }
}

export const deploymentRepository = new PrismaDeploymentRepository();
