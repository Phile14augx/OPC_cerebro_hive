import { PublishAgentInput } from "@cerebro/capability-contracts";
import { Command } from "@cerebro/core-bus";

export class CreateAgentCommand extends Command {
  constructor(
    public readonly agentId: string,
    public readonly payload: PublishAgentInput,
    public readonly idempotencyKey?: string,
  ) {
    super("CreateAgentCommand");
  }
}
