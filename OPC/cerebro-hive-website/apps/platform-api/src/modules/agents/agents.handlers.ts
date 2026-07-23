import { ICommandHandler } from '@cerebro/core-bus';
import { Result } from '@cerebro/domain';
import { RequestContext } from '@cerebro/database';
import { IAgentBuilderCapability } from '@cerebro/capability-contracts';
import { CreateAgentCommand } from './agents.commands';

export class CreateAgentCommandHandler implements ICommandHandler<CreateAgentCommand, any> {
  constructor(private readonly agentBuilder: IAgentBuilderCapability) {}

  async handle(command: CreateAgentCommand, context: RequestContext): Promise<Result<any>> {
    return this.agentBuilder.buildAndPublishAgent(
      command.agentId,
      command.payload,
      context,
      command.idempotencyKey
    );
  }
}
