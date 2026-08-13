import { Command } from '@cerebro/core-bus';
import { PublishAgentInput } from '@cerebro/capability-contracts';

export class CreateAgentCommand extends Command {
  constructor(
    public readonly agentId: string,
    public readonly payload: PublishAgentInput,
    public readonly idempotencyKey?: string
  ) {
    super('CreateAgentCommand');
  }
}
