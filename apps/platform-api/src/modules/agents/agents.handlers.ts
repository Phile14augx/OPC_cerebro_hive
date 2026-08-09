import { IAgentBuilderCapability } from "@cerebro/capability-contracts";
import { ICommandHandler } from "@cerebro/core-bus";
import { RequestContext } from "@cerebro/db";
import { Result } from "@cerebro/domain";
import { CreateAgentCommand } from "./agents.commands";

export class CreateAgentCommandHandler implements ICommandHandler<CreateAgentCommand, any> {
  constructor(private readonly agentBuilder: IAgentBuilderCapability) {}

  async handle(command: CreateAgentCommand, context: RequestContext): Promise<Result<any>> {
    return this.agentBuilder.buildAndPublishAgent(
      command.agentId,
      command.payload,
      context,
      command.idempotencyKey,
    );
  }
}
