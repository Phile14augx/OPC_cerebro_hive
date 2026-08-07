/**
 * CerebroCopilot — Streaming Response Protocol
 * SSE-based streaming format used by the Copilot widget embedded across all AEOS products.
 * Codex builds the widget; Claude defines the protocol.
 * Primary AI: Claude
 */

export type StreamEventType =
  | 'token'           // Partial text token
  | 'tool_call'       // Copilot invoking an AEOS product
  | 'tool_result'     // Result from an AEOS product call
  | 'insight'         // Proactive insight being surfaced
  | 'plan'            // Multi-step plan for user confirmation
  | 'confirmation'    // Requesting user confirmation before proceeding
  | 'approval_card'   // Human-approval card
  | 'done'            // Stream complete
  | 'error';          // Stream error

export interface StreamEvent {
  type: StreamEventType;
  id: string;
  conversationId: string;
  messageId: string;
  timestamp: Date;
  payload: StreamEventPayload;
}

export type StreamEventPayload =
  | TokenPayload
  | ToolCallPayload
  | ToolResultPayload
  | InsightPayload
  | PlanPayload
  | ConfirmationPayload
  | DonePayload
  | ErrorPayload;

export interface TokenPayload { type: 'token'; text: string }
export interface ToolCallPayload { type: 'tool_call'; product: string; action: string; inputs: Record<string, unknown>; toolCallId: string }
export interface ToolResultPayload { type: 'tool_result'; toolCallId: string; result: unknown; success: boolean; durationMs: number }
export interface InsightPayload { type: 'insight'; insight: { id: string; title: string; urgency: string; detail: string; suggestedAction?: string } }
export interface PlanPayload { type: 'plan'; planId: string; steps: Array<{ stepNumber: number; description: string; requiresHumanInput: boolean }>; requiresConfirmation: boolean }
export interface ConfirmationPayload { type: 'confirmation'; question: string; confirmLabel: string; cancelLabel: string; context: Record<string, unknown> }
export interface DonePayload { type: 'done'; totalTokens: number; durationMs: number; toolCallCount: number }
export interface ErrorPayload { type: 'error'; code: string; message: string; retryable: boolean }

/** Encode a StreamEvent to SSE wire format */
export function encodeSSE(event: StreamEvent): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}

/** Parse an SSE message from the wire */
export function decodeSSE(raw: string): StreamEvent | null {
  const lines = raw.trim().split('\n');
  const dataLine = lines.find(l => l.startsWith('data: '));
  if (!dataLine) return null;
  try {
    return JSON.parse(dataLine.slice(6)) as StreamEvent;
  } catch {
    return null;
  }
}

/** Build a token event (called per LLM token during streaming) */
export function tokenEvent(text: string, conversationId: string, messageId: string): StreamEvent {
  return { type: 'token', id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, conversationId, messageId, timestamp: new Date(), payload: { type: 'token', text } };
}

/** Build a tool-call event */
export function toolCallEvent(product: string, action: string, inputs: Record<string, unknown>, conversationId: string, messageId: string): StreamEvent {
  const toolCallId = `tc_${Date.now()}`;
  return { type: 'tool_call', id: `evt_${Date.now()}`, conversationId, messageId, timestamp: new Date(), payload: { type: 'tool_call', product, action, inputs, toolCallId } };
}

/** Build the final done event */
export function doneEvent(conversationId: string, messageId: string, totalTokens: number, durationMs: number, toolCallCount: number): StreamEvent {
  return { type: 'done', id: `evt_done_${messageId}`, conversationId, messageId, timestamp: new Date(), payload: { type: 'done', totalTokens, durationMs, toolCallCount } };
}

/** Build a confirmation event — stream pauses until user responds */
export function confirmationEvent(question: string, context: Record<string, unknown>, conversationId: string, messageId: string): StreamEvent {
  return { type: 'confirmation', id: `evt_confirm_${Date.now()}`, conversationId, messageId, timestamp: new Date(), payload: { type: 'confirmation', question, confirmLabel: 'Confirm', cancelLabel: 'Cancel', context } };
}
