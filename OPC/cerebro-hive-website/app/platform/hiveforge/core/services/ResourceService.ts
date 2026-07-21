import { IResourceRepository, resourceRepository } from "../repositories/ResourceRepository";
import { Resource } from "@prisma/client";

export interface IResourceService {
  list(workspaceId: string): Promise<Resource[]>;
  get(id: string): Promise<Resource | null>;
}

export class ResourceService implements IResourceService {
  constructor(private readonly repository: IResourceRepository = resourceRepository) {}

  async list(workspaceId: string): Promise<Resource[]> {
    return this.repository.findByWorkspace(workspaceId);
  }

  async get(id: string): Promise<Resource | null> {
    return this.repository.findById(id);
  }
}

export const resourceService = new ResourceService();
