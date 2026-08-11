// =============================================================================
// Anthropic Provider — wraps @ai-sdk/anthropic
// =============================================================================
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText, streamText } from 'ai';
import type {
  AIService, AIServiceConfig, AIGenerateRequest,
  AIGenerateResult, AIStreamChunk,
} from '../service/AIService';

export class AnthropicProvider implements AIService {
  private client: ReturnType<typeof createAnthropic>;
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
    this.client = createAnthropic({ apiKey: config.apiKey ?? process.env.ANTHROPIC_API_KEY });
  }

  private buildMessages(req: AIGenerateRequest) {
    const msgs: Array<{ role: string; content: string }> = [];
    msgs.push(...req.messages);
    return msgs as any;
  }

  async generateText(req: AIGenerateRequest): Promise<AIGenerateResult> {
    const t0 = Date.now();
    const result = await generateText({
      model: this.client(this.config.modelId),
      system: req.systemPrompt,
      messages: this.buildMessages(req),
      temperature: req.temperature ?? this.config.temperature ?? 0.7,
      maxTokens: req.maxTokens ?? this.config.maxTokens ?? 4096,
    });
    return {
      text: result.text,
      tokensIn: result.usage?.promptTokens ?? 0,
      tokensOut: result.usage?.completionTokens ?? 0,
      model: this.config.modelId,
      durationMs: Date.now() - t0,
    };
  }

  async *streamText(req: AIGenerateRequest): AsyncGenerator<AIStreamChunk> {
    const result = await streamText({
      model: this.client(this.config.modelId),
      system: req.systemPrompt,
      messages: this.buildMessages(req),
      temperature: req.temperature ?? this.config.temperature ?? 0.7,
      maxTokens: req.maxTokens ?? this.config.maxTokens ?? 8192,
    });
    for await (const chunk of result.textStream) {
      yield { delta: chunk, done: false };
    }
    yield { delta: '', done: true };
  }

  async generateStructured<T>(
    req: AIGenerateRequest & { schema: string; schemaDescription: string },
  ): Promise<T> {
    const systemPrompt = `${req.systemPrompt ?? ''}

You must respond with valid JSON only — no markdown, no explanation, no code fences.
The JSON must conform to this schema:
${req.schema}

Schema description: ${req.schemaDescription}`;

    const result = await this.generateText({ ...req, systemPrompt, maxTokens: 8192 });
    try {
      return JSON.parse(result.text) as T;
    } catch {
      const match = result.text.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]) as T;
      throw new Error(`Anthropic returned non-JSON response: ${result.text.slice(0, 200)}`);
    }
  }
}
