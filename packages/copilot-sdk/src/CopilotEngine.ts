/**
 * CerebroCopilot — Main Engine
 * Orchestrates intent classification, guardrails, task decomposition,
 * product routing, and streaming response assembly.
 * Primary AI: Claude
 */

import { IntentClassifier } from './intent/IntentClassifier.js';
import type { ClassifiedIntent } from './intent/IntentClassifier.js';
import { SafetyGuardrails } from './guardrails/SafetyGuardrails.js';
import type { UserPermissions } from './guardrails/SafetyGuardrails.js';
import { TaskDecomposer } from './decomposer/TaskDecomposer.js';
import { buildSystemPrompt, DEFAULT_PERSONA } from './persona/PersonaConfig.js';
import type { PersonaConfig } from './persona/PersonaConfig.js';
import {
  tokenEvent, toolCallEvent, doneEvent, confirmationEvent,
  encodeSSE,
} from './streaming/StreamingProtocol.js';
import type { StreamEvent } from './streaming/StreamingProtocol.js';

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolCallId?: string;
}

export interface CopilotRequest {
  conversationId: string;
  messageId: string;
  message: string;
  history: ConversationMessage[];
  userPermissions: UserPermissions;
  userContext: {
    userName: string;
    userRole: string;
    department: string;
    currentProduct: string;
    tenantName: string;
    timezone: string;
    approvalLimit?: number;
  };
  injectedContext?: Record<string, unknown>;
}

export interface ProductCallHandler {
  call(product: string, action: string, inputs: Record<string, unknown>): Promise<unknown>;
}

export interface LLMProvider {
  streamChat(params: {
    systemPrompt: string;
    messages: ConversationMessage[];
    onToken: (token: string) => void;
  }): Promise<{ totalTokens: number }>;
}

export interface CopilotEngineOptions {
  llm: LLMProvider;
  productRouter: ProductCallHandler;
  persona?: PersonaConfig;
  onEvent?: (event: StreamEvent) => void;
}

export class CopilotEngine {
  private readonly classifier = new IntentClassifier();
  private readonly guardrails = new SafetyGuardrails();
  private readonly decomposer = new TaskDecomposer();
  private readonly persona: PersonaConfig;

  constructor(private readonly opts: CopilotEngineOptions) {
    this.persona = opts.persona ?? DEFAULT_PERSONA;
  }

  async process(req: CopilotRequest): Promise<{ sse: string; intent: ClassifiedIntent }> {
    const start = Date.now();
    const events: string[] = [];
    let toolCallCount = 0;

    const emit = (event: StreamEvent) => {
      events.push(encodeSSE(event));
      this.opts.onEvent?.(event);
    };

    // 1. Classify intent
    const intent = this.classifier.classify(req.message, req.userContext.userRole);

    // 2. Safety check for execute-level actions
    if (intent.autonomyLevel === 'execute') {
      const decision = this.guardrails.evaluate(intent, req.userPermissions);
      if (!decision.allowed) {
        const refusal = this.guardrails.buildRefusalMessage(decision, intent);
        emit(tokenEvent(refusal, req.conversationId, req.messageId));
        emit(doneEvent(req.conversationId, req.messageId, 0, Date.now() - start, 0));
        return { sse: events.join(''), intent };
      }
      if (decision.requiresConfirmation) {
        emit(confirmationEvent(decision.reason!, { intent, decision }, req.conversationId, req.messageId));
        emit(doneEvent(req.conversationId, req.messageId, 0, Date.now() - start, 0));
        return { sse: events.join(''), intent };
      }
    }

    // 3. Check for multi-step plan
    const plan = this.decomposer.decompose(intent);
    if (plan) {
      const planText = this.decomposer.formatPlanForDisplay(plan);
      emit(tokenEvent(planText + '\n\n', req.conversationId, req.messageId));
      if (plan.requiresHumanGating) {
        emit(confirmationEvent('Shall I start executing this plan?', { planId: plan.planId }, req.conversationId, req.messageId));
        emit(doneEvent(req.conversationId, req.messageId, 0, Date.now() - start, 0));
        return { sse: events.join(''), intent };
      }
    }

    // 4. Tool calls for product-routed actions
    if (intent.autonomyLevel !== 'inform' && intent.suggestedProducts.length > 0) {
      const product = intent.suggestedProducts[0]!;
      const action = `${intent.domain}.${intent.action}`;
      emit(toolCallEvent(product, action, { message: req.message, entities: intent.entities }, req.conversationId, req.messageId));
      try {
        await this.opts.productRouter.call(product, action, { message: req.message });
        toolCallCount++;
      } catch {
        // Non-fatal — LLM response will handle gracefully
      }
    }

    // 5. LLM response stream
    const systemPrompt = buildSystemPrompt(this.persona, req.userContext);
    const messages: ConversationMessage[] = [
      ...req.history.slice(-10), // last 10 for context window management
      { role: 'user', content: req.message },
    ];
    if (req.injectedContext) {
      messages[messages.length - 1]!.content += `\n\n[CONTEXT]\n${JSON.stringify(req.injectedContext, null, 2)}\n[/CONTEXT]`;
    }

    const { totalTokens } = await this.opts.llm.streamChat({
      systemPrompt,
      messages,
      onToken: (token) => emit(tokenEvent(token, req.conversationId, req.messageId)),
    });

    emit(doneEvent(req.conversationId, req.messageId, totalTokens, Date.now() - start, toolCallCount));
    return { sse: events.join(''), intent };
  }
}
