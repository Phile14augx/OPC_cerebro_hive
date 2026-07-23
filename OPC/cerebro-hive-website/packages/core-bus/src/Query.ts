import { RequestContext } from '@cerebro/database';
import { Result } from '@cerebro/domain';

export abstract class Query {
  constructor(public readonly type: string) {}
}

export interface IQueryHandler<TQuery extends Query, TResult> {
  handle(query: TQuery, context: RequestContext): Promise<Result<TResult>>;
}
