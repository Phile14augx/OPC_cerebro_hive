export type ChatRole = "system" | "user" | "assistant" | "tool";
export interface ChatMessage { role: ChatRole; content: string }

export interface CompletionRequest {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  /** Called with incremental tokens when the provider streams. */
  onToken?: (token: string) => void;
  metadata?: { purpose?: string; organizationId?: string; traceId?: string };
}

export interface CompletionResult {
  text: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  cached: boolean;
  costUsd: number;
}

export interface EmbeddingResult { vectors: number[][]; provider: string; model: string; dimensions: number }

export interface AiProvider {
  readonly name: string;
  available(): Promise<boolean>;
  complete(req: CompletionRequest): Promise<Omit<CompletionResult, "cached" | "costUsd" | "latencyMs">>;
  embed(texts: string[]): Promise<Omit<EmbeddingResult, "provider">>;
}

export interface AiCallRecord {
  id: string; organizationId: string; provider: string; model: string; operation: "completion" | "embedding";
  promptTokens: number; completionTokens: number; costUsd: number; latencyMs: number; cached: boolean; ok: boolean;
  traceId?: string; createdAt: string;
}

export interface AiCallRepository { append(rec: AiCallRecord): Promise<void>; usage(organizationId: string): Promise<{ calls: number; costUsd: number; promptTokens: number; completionTokens: number }> }

export class InMemoryAiCallRepository implements AiCallRepository {
  records: AiCallRecord[] = [];
  async append(rec: AiCallRecord): Promise<void> { this.records.push(rec); }
  async usage(organizationId: string) {
    const rs = this.records.filter(r => r.organizationId === organizationId);
    return {
      calls: rs.length,
      costUsd: rs.reduce((a, r) => a + r.costUsd, 0),
      promptTokens: rs.reduce((a, r) => a + r.promptTokens, 0),
      completionTokens: rs.reduce((a, r) => a + r.completionTokens, 0),
    };
  }
}

export function estimateTokens(text: string): number { return Math.max(1, Math.ceil(text.length / 4)); }
