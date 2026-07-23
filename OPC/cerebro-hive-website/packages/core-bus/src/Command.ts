import { RequestContext } from '@cerebro/database';
import { Result } from '@cerebro/domain';

export abstract class Command {
  constructor(public readonly type: string) {}
}

export interface ICommandHandler<TCommand extends Command, TResult> {
  handle(command: TCommand, context: RequestContext): Promise<Result<TResult>>;
}
