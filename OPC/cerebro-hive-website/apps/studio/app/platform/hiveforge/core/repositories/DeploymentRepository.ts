import { prisma, type Deployment, type Prisma } from "@cerebro/db";

export interface IDeploymentRepository {
  findById(id: string): Promise<Deployment | null>;
  create(data: Prisma.DeploymentCreateArgs["data"]): Promise<Deployment>;
  update(id: string, data: Prisma.DeploymentUpdateArgs["data"]): Promise<Deployment>;
}

export class PrismaDeploymentRepository implements IDeploymentRepository {
  async findById(id: string): Promise<Deployment | null> {
    return prisma.deployment.findUnique({ where: { id } });
  }

  async create(data: Prisma.DeploymentCreateArgs["data"]): Promise<Deployment> {
    return prisma.deployment.create({ data });
  }

  async update(id: string, data: Prisma.DeploymentUpdateArgs["data"]): Promise<Deployment> {
    return prisma.deployment.update({ where: { id }, data });
  }
}

export const deploymentRepository = new PrismaDeploymentRepository();
