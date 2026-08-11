/**
 * Canonical schemas for Observability in the CerebroHive Agent Engineering Platform.
 */

export interface TraceDefinition {
  id: string;
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  type: 'agent' | 'node' | 'tool' | 'model' | 'memory' | 'workflow';
  status: 'pending' | 'success' | 'error';
  startTime: string;
  endTime?: string;
  durationMs?: number;
  tags: Record<string, string>;
  metrics?: Record<string, number>; // e.g. prompt_tokens, completion_tokens
  error?: {
    message: string;
    stack?: string;
  };
}
