import { createHash } from "node:crypto";
import { evaluateExpression, extractExpression } from "../../kernel/util/arithmetic.js";
import { type AiProvider, type ChatMessage, type CompletionRequest, estimateTokens } from "./types.js";

export const EMBEDDING_DIM = 256;

const EMBED_STOPWORDS = new Set("the a an and or of to in for is are was were be been with on at from by this that it as its our your their has have had will would can could should not no under over".split(" "));

/** Deterministic hashed bag-of-words embedding — offline, stable, cosine-meaningful. */
export function deterministicEmbedding(text: string, dim = EMBEDDING_DIM): number[] {
  const vec = new Array<number>(dim).fill(0);
  const tokens = text.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 1 && !EMBED_STOPWORDS.has(t));
  for (const tok of tokens) {
    const h = createHash("md5").update(tok).digest();
    const idx = ((h[0]! << 8) | h[1]!) % dim;
    const sign = h[2]! % 2 === 0 ? 1 : -1;
    vec[idx]! += sign * (1 + (h[3]! % 7) / 10);
  }
  const norm = Math.sqrt(vec.reduce((a, v) => a + v * v, 0)) || 1;
  return vec.map(v => v / norm);
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) dot += a[i]! * b[i]!;
  return dot;
}

function lastUser(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) if (messages[i]!.role === "user") return messages[i]!.content;
  return messages.map(m => m.content).join("\n");
}

/**
 * Offline deterministic language provider. Produces structured, grounded-in-input
 * responses so the whole platform (reasoning, eval, hub, simulator) exercises real
 * data flow without external model access. Swap for a live provider via config.
 */
export class MockProvider implements AiProvider {
  readonly name = "mock";
  async available(): Promise<boolean> { return true; }

  async complete(req: CompletionRequest) {
    const prompt = lastUser(req.messages);
    const system = req.messages.find(m => m.role === "system")?.content ?? "";
    const text = this.respond(system, prompt);
    if (req.onToken) for (const word of text.split(/(?<= )/)) req.onToken(word);
    return {
      text,
      provider: this.name,
      model: req.model ?? "cerebro-mock-1",
      promptTokens: estimateTokens(req.messages.map(m => m.content).join(" ")),
      completionTokens: estimateTokens(text),
    };
  }

  async embed(texts: string[]) {
    return { vectors: texts.map(t => deterministicEmbedding(t)), model: "cerebro-mock-embed-1", dimensions: EMBEDDING_DIM };
  }

  private respond(system: string, prompt: string): string {
    const expr = extractExpression(prompt);
    if (expr) {
      const val = evaluateExpression(expr.replace(/\^/g, "**"));
      if (val !== undefined) return `Computed ${expr} = ${val}.`;
    }
    if (/\bplan\b|\bdecompose\b|\bsteps\b/i.test(system + " " + prompt)) {
      const goal = prompt.replace(/\s+/g, " ").slice(0, 140);
      return JSON.stringify({ steps: [
        { id: 1, description: `Analyze requirements for: ${goal}` },
        { id: 2, description: "Gather relevant context and constraints" },
        { id: 3, description: "Execute the core task" },
        { id: 4, description: "Verify output against the goal" },
      ] });
    }
    if (/\bsummar/i.test(system + " " + prompt)) {
      const body = prompt.replace(/\s+/g, " ");
      const sentences = body.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ");
      return `Summary: ${sentences.slice(0, 280)}`;
    }
    if (/\bjson\b/i.test(system)) {
      return JSON.stringify({ answer: prompt.slice(0, 120), confidence: 0.62 });
    }
    const digest = createHash("sha1").update(prompt).digest("hex").slice(0, 6);
    return `Processed request [${digest}]: ${prompt.replace(/\s+/g, " ").slice(0, 200)}. Analysis complete; grounded on provided input only.`;
  }
}
