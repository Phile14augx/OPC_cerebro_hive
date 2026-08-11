// =============================================================================
// CerebroHive AI Gateway — OpenAI Provider
// =============================================================================

import OpenAI from 'openai';
import { randomUUID } from 'crypto';
import type { AIProvider } from './base.provider';
import { calculateCost, estimateTokens } from './base.provider';
import type { ChatRequest, ChatResponse, ProviderConfig, StreamChunk, ToolDefinition, ToolCall } from '../types';
import { GatewayError, GATEWAY_ERRORS } from '../types';

function isApiError(e: unknown): e is { status: number; message: string } {
  return typeof e === 'object' && e !== null && 'status' in e && 'message' in e;
}

// ─── Provider-Agnostic → OpenAI Translation ─────────────────────────────────

function translateTools(tools?: ToolDefinition[]): OpenAI.ChatCompletionTool[] | undefined {
  if (!tools?.length) return undefined;
  return tools.map(t => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.inputSchema,
    },
  }));
}

function translateToolChoice(
  choice?: ChatRequest['toolChoice']
): OpenAI.ChatCompletionToolChoiceOption | undefined {
  if (!choice) return undefined;
  if (choice === 'auto' || choice === 'none' || choice === 'required') return choice;
  if (typeof choice === 'object' && 'name' in choice) {
    return { type: 'function', function: { name: choice.name } };
  }
  return undefined;
}

/** Extract ToolCall[] from OpenAI's response. */
function extractToolCalls(
  calls?: OpenAI.ChatCompletionMessageToolCall[]
): ToolCall[] | undefined {
  if (!calls?.length) return undefined;
  return calls.map(tc => ({
    id: tc.id,
    name: tc.function.name,
    arguments: tc.function.arguments,
  }));
}

/**
 * Translate gateway ChatMessage[] to OpenAI's message format. Handles:
 * - 'tool' role → OpenAI tool message with tool_call_id
 * - 'assistant' with toolCalls → tool_calls array
 */
function translateMessages(
  messages: ChatRequest['messages']
): OpenAI.ChatCompletionMessageParam[] {
  return messages.map(msg => {
    if (msg.role === 'tool') {
      return {
        role: 'tool' as const,
        tool_call_id: msg.toolCallId ?? '',
        content: msg.content,
      };
    }

    if (msg.role === 'assistant' && msg.toolCalls?.length) {
      return {
        role: 'assistant' as const,
        content: msg.content || null,
        tool_calls: msg.toolCalls.map(tc => ({
          id: tc.id,
          type: 'function' as const,
          function: { name: tc.name, arguments: tc.arguments },
        })),
      };
    }

    return { role: msg.role, content: msg.content };
  });
}

// ─── Provider ────────────────────────────────────────────────────────────────

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

    const openaiTools = translateTools(request.tools);
    const toolChoice = openaiTools ? translateToolChoice(request.toolChoice) : undefined;

    try {
      const response = await this.client.chat.completions.create({
        model,
        max_tokens: request.maxTokens ?? 4096,
        temperature: request.temperature,
        top_p: request.topP,
        stream: false,
        messages: translateMessages(request.messages),
        ...(openaiTools && { tools: openaiTools }),
        ...(toolChoice && { tool_choice: toolChoice }),
      });

      const choice = response.choices[0];
      const inputTokens = response.usage?.prompt_tokens ?? estimateTokens(request.messages.map(m => m.content).join(' '));
      const outputTokens = response.usage?.completion_tokens ?? estimateTokens(choice.message.content ?? '');
      const toolCalls = extractToolCalls(choice.message.tool_calls);

      return {
        id: response.id,
        content: choice.message.content ?? '',
        model: response.model,
        provider: 'openai',
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
          choice.finish_reason === 'tool_calls'
            ? 'tool_use'
            : choice.finish_reason === 'length'
              ? 'max_tokens'
              : 'stop',
      };
    } catch (err) {
      if (isApiError(err)) {
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
        messages: translateMessages(request.messages),
        ...(request.tools?.length && { tools: translateTools(request.tools) }),
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
      if (isApiError(err)) {
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

