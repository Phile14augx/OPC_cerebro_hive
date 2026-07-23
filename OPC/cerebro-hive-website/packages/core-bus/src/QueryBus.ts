import { RequestContext } from '@cerebro/database';
import { Result } from '@cerebro/domain';
import { Query, IQueryHandler } from './Query';
import { IMiddleware, MiddlewareNext } from './Middleware';

export class QueryBus {
  private handlers = new Map<string, IQueryHandler<any, any>>();
  private middlewares: IMiddleware[] = [];

  use(middleware: IMiddleware) {
    this.middlewares.push(middleware);
  }

  register(type: string, handler: IQueryHandler<any, any>) {
    this.handlers.set(type, handler);
  }

  async execute<TResult>(query: Query, context: RequestContext): Promise<Result<TResult>> {
    const handler = this.handlers.get(query.type);
    if (!handler) {
      throw new Error(`No handler registered for query: ${query.type}`);
    }

    return this.executeWithMiddleware(query, context, () => handler.handle(query, context));
  }

  private async executeWithMiddleware<T>(query: Query, context: RequestContext, target: MiddlewareNext<T>): Promise<T> {
    const runMiddleware = (index: number): Promise<T> => {
      if (index < this.middlewares.length) {
        return this.middlewares[index].execute(query, context, () => runMiddleware(index + 1));
      }
      return target();
    };

    return runMiddleware(0);
  }
}
