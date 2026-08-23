import { prisma, type Prisma, type Resource } from "@cerebro/db";

export interface IResourceRepository {
  findById(id: string): Promise<Resource | null>;
  findByWorkspace(workspaceId: string): Promise<Resource[]>;
  create(data: Prisma.ResourceCreateArgs["data"]): Promise<Resource>;
  update(id: string, data: Prisma.ResourceUpdateArgs["data"]): Promise<Resource>;
  delete(id: string): Promise<void>;
}

export class PrismaResourceRepository implements IResourceRepository {
  async findById(id: string): Promise<Resource | null> {
    return prisma.resource.findUnique({ where: { id } });
  }

  async findByWorkspace(workspaceId: string): Promise<Resource[]> {
    return prisma.resource.findMany({ where: { workspaceId } });
  }

  async create(data: Prisma.ResourceCreateArgs["data"]): Promise<Resource> {
    return prisma.resource.create({ data });
  }

  async update(id: string, data: Prisma.ResourceUpdateArgs["data"]): Promise<Resource> {
    return prisma.resource.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.resource.delete({ where: { id } });
  }
}

export const resourceRepository = new PrismaResourceRepository();
