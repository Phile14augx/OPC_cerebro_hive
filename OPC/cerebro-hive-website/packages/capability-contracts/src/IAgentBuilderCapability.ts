import { Result } from '@cerebro/domain';
import { RequestContext } from '@cerebro/database';

export interface PublishAgentInput {
  modelId: string;
  instructions: string;
  tools: any[];
}

export interface IAgentBuilderCapability {
  buildAndPublishAgent(
    agentId: string,
    input: PublishAgentInput,
    context: RequestContext,
    idempotencyKey?: string
  ): Promise<Result<any>>;
}
