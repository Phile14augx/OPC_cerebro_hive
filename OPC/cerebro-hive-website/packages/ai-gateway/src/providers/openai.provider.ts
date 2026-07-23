// =============================================================================
// CerebroHive AI Gateway — OpenAI Provider
// =============================================================================

import OpenAI from 'openai';
import { randomUUID } from 'crypto';
import type { AIProvider } from './base.provider';
import { calculateCost, estimateTokens } from './base.provider';
import type { ChatRequest, ChatResponse, ProviderConfig, StreamChunk } from '../types';
import { GatewayError, GATEWAY_ERRORS } from '../types';

export class OpenAIProvider implements AIProvider {
  readonly name = 'openai';
  private client: OpenAI;

  constructor(public readonly config: ProviderConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey ?? process.env.OPENAI_API_KEY,
      baseURL: config.baseUrl,
      timeout: config.timeoutMs ?? 120_000,
      maxRetries: 0,
    });
  }

  async complete(request: ChatRequest): Promise<ChatResponse> {
    const start = Date.now();
    const model = request.model ?? this.config.defaultModel;

    try {
      const response = await this.client.chat.completions.create({
        model,
        max_tokens: request.maxTokens ?? 4096,
        temperature: request.temperature,
        top_p: request.topP,
        stream: false,
        messages: request.messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      });

      const choice = response.choices[0];
      const inputTokens = response.usage?.prompt_tokens ?? estimateTokens(request.messages.map(m => m.content).join(' '));
      const outputTokens = response.usage?.completion_tokens ?? estimateTokens(choice.message.content ?? '');

      return {
        id: response.id,
        content: choice.message.content ?? '',
        model: response.model,
        provider: 'openai',
        usage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
        cost: calculateCost(inputTokens, outputTokens, this.config),
        durationMs: Date.now() - start,
        cached: false,
        finishReason: choice.finish_reason === 'length' ? 'max_tokens' : 'stop',
      };
    } catch (err) {
      if (err instanceof OpenAI.APIStatusError) {
        throw new GatewayError(
          `OpenAI API error: ${err.message}`,
          err.status === 429 ? GATEWAY_ERRORS.RATE_LIMITED : GATEWAY_ERRORS.PROVIDER_ERROR,
          'openai',
          err.status === 429 || err.status >= 500
        );
      }
      throw err;
    }
  }

  async *stream(request: ChatRequest): AsyncGenerator<StreamChunk> {
    const model = request.model ?? this.config.defaultModel;
    const id = randomUUID();
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      const stream = await this.client.chat.completions.create({
        model,
        max_tokens: request.maxTokens ?? 4096,
        temperature: request.temperature,
        stream: true,
        stream_options: { include_usage: true },
        messages: request.messages.map(m => ({ role: m.role, content: m.content })),
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? '';
        if (delta) yield { id, delta, done: false };

        if (chunk.usage) {
          inputTokens = chunk.usage.prompt_tokens;
          outputTokens = chunk.usage.completion_tokens;
        }
      }

      yield {
        id,
        delta: '',
        done: true,
        usage: { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens },
        cost: calculateCost(inputTokens, outputTokens, this.config),
      };
    } catch (err) {
      if (err instanceof OpenAI.APIStatusError) {
        throw new GatewayError(`OpenAI stream error: ${err.message}`, GATEWAY_ERRORS.PROVIDER_ERROR, 'openai', err.status >= 500);
      }
      throw err;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}
