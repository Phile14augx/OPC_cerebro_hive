import { Query, IQueryHandler } from '@cerebro/core-bus';
import { RequestContext } from '@cerebro/database';
import { Result } from '@cerebro/domain';
import { AgentQueryRepository } from './AgentQueryRepository';

export class ListAgentsQuery extends Query {
  constructor(public readonly limit?: number, public readonly offset?: number) {
    super('ListAgentsQuery');
  }
}

export class ListAgentsQueryHandler implements IQueryHandler<ListAgentsQuery, any[]> {
  constructor(private readonly queryRepo: AgentQueryRepository) {}

  async handle(query: ListAgentsQuery, context: RequestContext): Promise<Result<any[]>> {
    return this.queryRepo.listAgents({
      tenantId: context.tenantId,
      workspaceId: context.workspaceId!,
      limit: query.limit,
      offset: query.offset,
    });
  }
}
