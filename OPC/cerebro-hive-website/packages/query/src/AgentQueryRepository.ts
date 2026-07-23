import { PrismaClient } from '@prisma/client';
import { Result } from '@cerebro/domain';

export interface AgentListParams {
  tenantId: string;
  workspaceId: string;
  limit?: number;
  offset?: number;
}

export class AgentQueryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listAgents(params: AgentListParams): Promise<Result<any[]>> {
    const agents = await this.prisma.agent.findMany({
      where: {
        tenantId: params.tenantId,
        workspaceId: params.workspaceId,
      },
      take: params.limit || 50,
      skip: params.offset || 0,
      orderBy: { createdAt: 'desc' },
      include: {
        versions: {
          take: 1,
          orderBy: { version: 'desc' },
        },
      }
    });

    return Result.ok(agents);
  }
}
