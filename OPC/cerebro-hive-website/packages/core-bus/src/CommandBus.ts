import { RequestContext } from '@cerebro/db';
import { Result } from '@cerebro/domain';
import { Command, ICommandHandler } from './Command';
import { IMiddleware, MiddlewareNext } from './Middleware';

export class CommandBus {
  private handlers = new Map<string, ICommandHandler<Command, unknown>>();
  private middlewares: IMiddleware[] = [];

  use(middleware: IMiddleware) {
    this.middlewares.push(middleware);
  }

  register(type: string, handler: ICommandHandler<Command, unknown>) {
    this.handlers.set(type, handler);
  }

  async execute<TResult>(command: Command, context: RequestContext): Promise<Result<TResult>> {
    const handler = this.handlers.get(command.type);
    if (!handler) {
      throw new Error(`No handler registered for command: ${command.type}`);
    }

    return this.executeWithMiddleware(command, context, () => handler.handle(command, context)) as Promise<Result<TResult>>;
  }

  private async executeWithMiddleware<T>(command: Command, context: RequestContext, target: MiddlewareNext<T>): Promise<T> {
    const runMiddleware = (index: number): Promise<T> => {
      if (index < this.middlewares.length) {
        return this.middlewares[index].execute(command, context, () => runMiddleware(index + 1));
      }
      return target();
    };

    return runMiddleware(0);
  }
}
