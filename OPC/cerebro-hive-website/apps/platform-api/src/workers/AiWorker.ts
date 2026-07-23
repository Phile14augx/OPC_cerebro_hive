import { BaseWorker } from '@cerebro/events';

interface AiWorkerPayload {
  promptId: string;
  context: Record<string, any>;
  callbackUrl?: string;
}

export class AiWorker extends BaseWorker<AiWorkerPayload> {
  constructor(natsConnection: any) {
    super('ai.generation.requested', natsConnection);
  }

  async handle(payload: AiWorkerPayload, headers?: Record<string, string>): Promise<void> {
    console.log(`[AiWorker] Processing generation for prompt ${payload.promptId}`);
    
    // 1. Invoke PromptAssemblyEngine
    // 2. Invoke ModelRouter
    // 3. Persist Output
    // 4. Fire Webhook (if callbackUrl present)
  }
}
