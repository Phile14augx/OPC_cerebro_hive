import { RequestContext } from '@cerebro/database';

export type MiddlewareNext<T> = () => Promise<T>;

export interface IMiddleware {
  execute<T>(message: any, context: RequestContext, next: MiddlewareNext<T>): Promise<T>;
}
