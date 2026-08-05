/**
 * scripts/lib/agent-registry.mjs
 *
 * Pluggable agent interface.  Every provider (Claude, Gemini, OpenAI, …)
 * must implement the AgentProvider duck-type:
 *
 *   interface AgentProvider {
 *     name: string;                               // e.g. "claude", "gemini"
 *     available(): boolean;                       // check env / CLI presence
 *     run(opts: RunOptions): Promise<AgentResult>;
 *   }
 *
 *   interface RunOptions {
 *     prompt:       string;
 *     cwd:          string;
 *     timeoutMs:    number;
 *     maxRetries:   number;
 *     noRetry:      boolean;
 *     traceId:      string;
 *     onHeartbeat?: (ts: string, partial: string) => void;
 *   }
 *
 *   interface AgentResult {
 *     stdout:     string;
 *     stderr:     string;
 *     exitCode:   number;
 *     durationMs: number;
 *     tokenUsage: TokenUsage | null;
 *   }
 *
 *   interface TokenUsage {
 *     inputTokens?:  number;
 *     outputTokens?: number;
 *     totalTokens?:  number;
 *   }
 *
 * Registration:
 *   import { registry } from "./agent-registry.mjs";
 *   registry.register(myProvider);
 *   const provider = registry.get("claude");
 *
 * Built-in providers (auto-registered):
 *   claude   — scripts/lib/providers/claude.mjs
 *   gemini   — scripts/lib/providers/gemini.mjs
 */

import { ClaudeProvider } from "./providers/claude.mjs";
import { GeminiProvider } from "./providers/gemini.mjs";

class AgentRegistry {
  constructor() {
    /** @type {Map<string, object>} */
    this._providers = new Map();
  }

  /**
   * Register a provider.  Overwrites any existing provider with the same name.
   * @param {{ name: string, available(): boolean, run(opts): Promise<object> }} provider
   */
  register(provider) {
    if (typeof provider.name !== "string" || !provider.name) {
      throw new Error("AgentProvider must have a non-empty `name` string.");
    }
    if (typeof provider.run !== "function") {
      throw new Error(`AgentProvider "${provider.name}" must implement run().`);
    }
    this._providers.set(provider.name, provider);
  }

  /**
   * Retrieve a registered provider by name.
   * @param {string} name
   * @returns {object}
   */
  get(name) {
    const p = this._providers.get(name);
    if (!p) throw new Error(`No agent provider registered for "${name}". Available: ${[...this._providers.keys()].join(", ")}`);
    return p;
  }

  /** All registered provider names. */
  get names() { return [...this._providers.keys()]; }

  /**
   * Run two providers in parallel, each with their own prompt + options.
   * Returns both results once both settle.
   *
   * @param {{ provider: string, opts: object }[]} tasks
   * @returns {Promise<AgentResult[]>}
   */
  async runParallel(tasks) {
    return Promise.all(
      tasks.map(({ provider: name, opts }) => this.get(name).run(opts))
    );
  }
}

// ── Singleton registry (pre-populated with built-in providers) ─────────────

export const registry = new AgentRegistry();
registry.register(new ClaudeProvider());
registry.register(new GeminiProvider());
