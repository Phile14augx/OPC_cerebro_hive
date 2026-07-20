import { type AiProvider, type CompletionRequest, estimateTokens } from "./types.js";
import { deterministicEmbedding, EMBEDDING_DIM } from "./mock-provider.js";

/** Minimal fetch-based adapters for live providers; enabled purely by configuration. */

export class OllamaProvider implements AiProvider {
  readonly name = "ollama";
  constructor(private readonly baseUrl: string, private readonly defaultModel = "llama3.2") {}
  async available(): Promise<boolean> {
    try { const r = await fetch(`${this.baseUrl}/api/tags`, { signal: AbortSignal.timeout(1500) }); return r.ok; }
    catch { return false; }
  }
  async complete(req: CompletionRequest) {
    const model = req.model ?? this.defaultModel;
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ model, messages: req.messages, stream: false, options: { temperature: req.temperature ?? 0.2, num_predict: req.maxTokens ?? 1024 } }),
      signal: AbortSignal.timeout(120_000),
    });
    if (!res.ok) throw new Error(`ollama ${res.status}`);
    const json = await res.json() as { message?: { content?: string }; prompt_eval_count?: number; eval_count?: number };
    const text = json.message?.content ?? "";
    if (req.onToken) req.onToken(text);
    return { text, provider: this.name, model, promptTokens: json.prompt_eval_count ?? estimateTokens(req.messages.map(m => m.content).join(" ")), completionTokens: json.eval_count ?? estimateTokens(text) };
  }
  async embed(texts: string[]) {
    return { vectors: texts.map(t => deterministicEmbedding(t)), model: "hash-fallback", dimensions: EMBEDDING_DIM };
  }
}

export class OpenAiProvider implements AiProvider {
  readonly name = "openai";
  constructor(private readonly apiKey: string, private readonly defaultModel = "gpt-4o-mini") {}
  async available(): Promise<boolean> { return this.apiKey.length > 0; }
  async complete(req: CompletionRequest) {
    const model = req.model ?? this.defaultModel;
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({ model, messages: req.messages, temperature: req.temperature ?? 0.2, max_tokens: req.maxTokens ?? 1024 }),
      signal: AbortSignal.timeout(120_000),
    });
    if (!res.ok) throw new Error(`openai ${res.status}`);
    const json = await res.json() as { choices: { message: { content: string } }[]; usage?: { prompt_tokens: number; completion_tokens: number } };
    const text = json.choices[0]?.message.content ?? "";
    if (req.onToken) req.onToken(text);
    return { text, provider: this.name, model, promptTokens: json.usage?.prompt_tokens ?? 0, completionTokens: json.usage?.completion_tokens ?? 0 };
  }
  async embed(texts: string[]) {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({ model: "text-embedding-3-small", input: texts, dimensions: EMBEDDING_DIM }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`openai embed ${res.status}`);
    const json = await res.json() as { data: { embedding: number[] }[] };
    return { vectors: json.data.map(d => d.embedding), model: "text-embedding-3-small", dimensions: EMBEDDING_DIM };
  }
}

export class AnthropicProvider implements AiProvider {
  readonly name = "anthropic";
  constructor(private readonly apiKey: string, private readonly defaultModel = "claude-haiku-4-5-20251001") {}
  async available(): Promise<boolean> { return this.apiKey.length > 0; }
  async complete(req: CompletionRequest) {
    const model = req.model ?? this.defaultModel;
    const system = req.messages.filter(m => m.role === "system").map(m => m.content).join("\n");
    const messages = req.messages.filter(m => m.role !== "system").map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": this.apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model, system: system || undefined, messages, max_tokens: req.maxTokens ?? 1024, temperature: req.temperature ?? 0.2 }),
      signal: AbortSignal.timeout(120_000),
    });
    if (!res.ok) throw new Error(`anthropic ${res.status}`);
    const json = await res.json() as { content: { type: string; text?: string }[]; usage?: { input_tokens: number; output_tokens: number } };
    const text = json.content.filter(c => c.type === "text").map(c => c.text ?? "").join("");
    if (req.onToken) req.onToken(text);
    return { text, provider: this.name, model, promptTokens: json.usage?.input_tokens ?? 0, completionTokens: json.usage?.output_tokens ?? 0 };
  }
  async embed(texts: string[]) {
    return { vectors: texts.map(t => deterministicEmbedding(t)), model: "hash-fallback", dimensions: EMBEDDING_DIM };
  }
}
