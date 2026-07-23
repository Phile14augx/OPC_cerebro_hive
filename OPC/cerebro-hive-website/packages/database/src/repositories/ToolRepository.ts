import { Tool, ToolVersion, Prisma } from '@prisma/client';
import { BaseRepository, IRepositoryOptions } from './BaseRepository';

export interface CreateToolInput {
  name: string;
  description?: string;
  categoryId?: string;
  schema: Prisma.InputJsonValue;
  endpoint?: string;
  handlerCode?: string;
}

export class ToolRepository extends BaseRepository {
  async registerTool(input: CreateToolInput, options: IRepositoryOptions): Promise<{ tool: Tool; initialVersion: ToolVersion }> {
    const db = this.getClient(options);

    const tool = await db.tool.create({
      data: {
        name: input.name,
        description: input.description,
        categoryId: input.categoryId,
        versions: {
          create: {
            version: 1,
            schema: input.schema,
            endpoint: input.endpoint,
            handlerCode: input.handlerCode,
          }
        }
      },
      include: {
        versions: true
      }
    });

    return { tool, initialVersion: tool.versions[0] };
  }

  async publishVersion(toolId: string, input: { schema: Prisma.InputJsonValue; endpoint?: string; handlerCode?: string }, options: IRepositoryOptions): Promise<ToolVersion> {
    const db = this.getClient(options);

    const latest = await db.toolVersion.findFirst({
      where: { toolId },
      orderBy: { version: 'desc' }
    });
    const nextVersion = (latest?.version ?? 0) + 1;

    return db.toolVersion.create({
      data: {
        toolId,
        version: nextVersion,
        schema: input.schema,
        endpoint: input.endpoint,
        handlerCode: input.handlerCode,
      }
    });
  }
}
