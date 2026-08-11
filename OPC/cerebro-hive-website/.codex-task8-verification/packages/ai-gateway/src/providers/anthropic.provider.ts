// =============================================================================
// CerebroHive AI Gateway — Anthropic (Claude) Provider
// =============================================================================

import Anthropic from '@anthropic-ai/sdk';
import { randomUUID } from 'crypto';
import type { AIProvider } from './base.provider';
import { calculateCost } from './base.provider';
import type { ChatRequest, ChatResponse, ProviderConfig, StreamChunk, ToolDefinition, ToolCall } from '../types';
import { GatewayError, GATEWAY_ERRORS } from '../types';

/** Narrow an unknown catch value to an API status error shape */
function isApiError(e: unknown): e is { status: number; message: string } {
  return typeof e === 'object' && e !== null && 'status' in e && 'message' in e;
}

// ─── Provider-Agnostic → Anthropic Translation ──────────────────────────────

function translateTools(tools?: ToolDefinition[]): Anthropic.Tool[] | undefined {
  if (!tools?.length) return undefined;
  return tools.map(t => ({
    name: t.name,
    description: t.description,
    input_schema: t.inputSchema as Anthropic.Tool.InputSchema,
  }));
}

function translateToolChoice(
  choice?: ChatRequest['toolChoice']
): Anthropic.MessageCreateParams['tool_choice'] | undefined {
  if (!choice) return undefined;
  if (choice === 'auto') return { type: 'auto' };
  if (choice === 'none') return undefined; // Anthropic doesn't have 'none' — omit tools instead
  if (choice === 'required') return { type: 'any' };
  if (typeof choice === 'object' && 'name' in choice) return { type: 'tool', name: choice.name };
  return undefined;
}

/** Extract ToolCall[] from Anthropic's response content blocks. */
function extractToolCalls(content: Anthropic.ContentBlock[]): ToolCall[] | undefined {
  const calls = content
    .filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
    .map(b => ({
      id: b.id,
      name: b.name,
      arguments: JSON.stringify(b.input),
    }));
  return calls.length > 0 ? calls : undefined;
}

/**
 * Translate gateway ChatMessage[] to Anthropic's message format. Handles:
 * - 'tool' role → tool_result content block on the preceding user turn
 * - 'assistant' with toolCalls → tool_use content blocks
 * - system messages are separated by the caller
 */
function translateMessages(
  messages: ChatRequest['messages']
): Anthropic.MessageParam[] {
  const result: Anthropic.MessageParam[] = [];

  for (const msg of messages) {
    if (msg.role === 'system') continue; // handled separately

    if (msg.role === 'tool') {
      // Anthropic expects tool results as a user message with tool_result content
      result.push({
        role: 'user',
        content: [{
          type: 'tool_result',
          tool_use_id: msg.toolCallId ?? '',
          content: msg.content,
        }],
      });
      continue;
    }

    if (msg.role === 'assistant' && msg.toolCalls?.length) {
      // Reconstruct the assistant turn with tool_use blocks
      const content: Anthropic.ContentBlock[] = [];
      if (msg.content) {
        content.push({ type: 'text', text: msg.content } as Anthropic.TextBlock);
      }
      for (const tc of msg.toolCalls) {
        content.push({
          type: 'tool_use',
          id: tc.id,
          name: tc.name,
          input: JSON.parse(tc.arguments),
        } as Anthropic.ToolUseBlock);
      }
      result.push({ role: 'assistant', content });
      continue;
    }

    result.push({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    });
  }

  return result;
}

// ─── Provider ────────────────────────────────────────────────────────────────

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
    const systemPrompt = systemMessages.map(m => m.content).join('\n\n');

    const anthropicTools = translateTools(request.tools);
    const toolChoice = anthropicTools ? translateToolChoice(request.toolChoice) : undefined;

    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: request.maxTokens ?? 4096,
        temperature: request.temperature,
        system: systemPrompt || undefined,
        messages: translateMessages(request.messages),
        ...(anthropicTools && { tools: anthropicTools }),
        ...(toolChoice && { tool_choice: toolChoice }),
      });

      const inputTokens = response.usage.input_tokens;
      const outputTokens = response.usage.output_tokens;
      const textContent = response.content
        .filter(b => b.type === 'text')
        .map(b => (b as Anthropic.TextBlock).text)
        .join('');
      const toolCalls = extractToolCalls(response.content);

      return {
        id: response.id,
        content: textContent,
        model: response.model,
        provider: 'anthropic',
        toolCalls,
        usage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
        cost: calculateCost(inputTokens, outputTokens, this.config),
        durationMs: Date.now() - start,
        cached: false,
        finishReason:
          response.stop_reason === 'tool_use'
            ? 'tool_use'
            : response.stop_reason === 'max_tokens'
              ? 'max_tokens'
              : 'stop',
      };
    } catch (err) {
      if (isApiError(err)) {
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
    const systemPrompt = systemMessages.map(m => m.content).join('\n\n');

    let inputTokens = 0;
    let outputTokens = 0;

    try {
      const stream = this.client.messages.stream({
        model,
        max_tokens: request.maxTokens ?? 4096,
        temperature: request.temperature,
        system: systemPrompt || undefined,
        messages: translateMessages(request.messages),
        ...(request.tools?.length && { tools: translateTools(request.tools) }),
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
      if (isApiError(err)) {
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
      // Minimal API call to verify connectivity
      await this.client.messages.create({
        model: this.config.defaultModel ?? 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'ping' }],
      });
      return true;
    } catch {
      return false;
    }
  }
}

