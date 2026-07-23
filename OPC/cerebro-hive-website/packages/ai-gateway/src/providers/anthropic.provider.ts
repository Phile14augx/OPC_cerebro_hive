// =============================================================================
// CerebroHive AI Gateway — Anthropic (Claude) Provider
// =============================================================================

import Anthropic from '@anthropic-ai/sdk';
import { randomUUID } from 'crypto';
import type { AIProvider } from './base.provider';
import { calculateCost } from './base.provider';
import type { ChatRequest, ChatResponse, ProviderConfig, StreamChunk } from '../types';
import { GatewayError, GATEWAY_ERRORS } from '../types';

export class AnthropicProvider implements AIProvider {
  readonly name = 'anthropic';
  private client: Anthropic;

  constructor(public readonly config: ProviderConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey ?? process.env.ANTHROPIC_API_KEY,
      timeout: config.timeoutMs ?? 120_000,
      maxRetries: 0, // Gateway handles retries at a higher level
    });
  }

  async complete(request: ChatRequest): Promise<ChatResponse> {
    const start = Date.now();
    const model = request.model ?? this.config.defaultModel;

    // Split system message from conversation
    const systemMessages = request.messages.filter(m => m.role === 'system');
    const conversationMessages = request.messages.filter(m => m.role !== 'system');
    const systemPrompt = systemMessages.map(m => m.content).join('\n\n');

    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: request.maxTokens ?? 4096,
        temperature: request.temperature,
        system: systemPrompt || undefined,
        messages: conversationMessages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      });

      const inputTokens = response.usage.input_tokens;
      const outputTokens = response.usage.output_tokens;
      const content = response.content
        .filter(b => b.type === 'text')
        .map(b => (b as Anthropic.TextBlock).text)
        .join('');

      return {
        id: response.id,
        content,
        model: response.model,
        provider: 'anthropic',
        usage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
        cost: calculateCost(inputTokens, outputTokens, this.config),
        durationMs: Date.now() - start,
        cached: false,
        finishReason:
          response.stop_reason === 'max_tokens' ? 'max_tokens' : 'stop',
      };
    } catch (err) {
      if (err instanceof Anthropic.APIStatusError) {
        const retryable = err.status === 429 || err.status >= 500;
        throw new GatewayError(
          `Anthropic API error: ${err.message}`,
          err.status === 429 ? GATEWAY_ERRORS.RATE_LIMITED : GATEWAY_ERRORS.PROVIDER_ERROR,
          'anthropic',
          retryable
        );
      }
      throw err;
    }
  }

  async *stream(request: ChatRequest): AsyncGenerator<StreamChunk> {
    const model = request.model ?? this.config.defaultModel;
    const id = randomUUID();

    const systemMessages = request.messages.filter(m => m.role === 'system');
    const conversationMessages = request.messages.filter(m => m.role !== 'system');
    const systemPrompt = systemMessages.map(m => m.content).join('\n\n');

    let inputTokens = 0;
    let outputTokens = 0;

    try {
      const stream = this.client.messages.stream({
        model,
        max_tokens: request.maxTokens ?? 4096,
        temperature: request.temperature,
        system: systemPrompt || undefined,
        messages: conversationMessages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          yield { id, delta: event.delta.text, done: false };
        }
        if (event.type === 'message_delta' && event.usage) {
          outputTokens = event.usage.output_tokens;
        }
        if (event.type === 'message_start' && event.message.usage) {
          inputTokens = event.message.usage.input_tokens;
        }
      }

      yield {
        id,
        delta: '',
        done: true,
        usage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
        cost: calculateCost(inputTokens, outputTokens, this.config),
      };
    } catch (err) {
      if (err instanceof Anthropic.APIStatusError) {
        throw new GatewayError(
          `Anthropic stream error: ${err.message}`,
          GATEWAY_ERRORS.PROVIDER_ERROR,
          'anthropic',
          err.status >= 500
        );
      }
      throw err;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.models.list({ limit: 1 });
      return true;
    } catch {
      return false;
    }
  }
}
