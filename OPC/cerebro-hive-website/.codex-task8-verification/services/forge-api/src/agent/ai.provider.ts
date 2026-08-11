import { Provider } from '@nestjs/common';
import { createAIServiceFromEnv } from '@cerebro/ai';
import type { AIService } from '@cerebro/ai';

export const AI_SERVICE = 'AI_SERVICE';

export const AiServiceProvider: Provider<AIService> = {
  provide: AI_SERVICE,
  useFactory: () => createAIServiceFromEnv(),
};
