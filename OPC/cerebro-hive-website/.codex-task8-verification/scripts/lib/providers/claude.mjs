/**
 * scripts/lib/providers/claude.mjs
 *
 * Claude provider — wraps the `claude` CLI (Anthropic).
 * CLI binary resolved via CLAUDE_CLI env var, or "claude" from $PATH.
 */

import { BaseProvider } from "./base-provider.mjs";

export class ClaudeProvider extends BaseProvider {
  constructor() { super("claude"); }

  available() {
    return Boolean(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_CLI);
  }

  buildCommand(prompt) {
    const bin = process.env.CLAUDE_CLI ?? "claude";
    return [bin, ["--dangerously-skip-permissions", "-p", prompt]];
  }

  buildEnv() {
    return { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "" };
  }
}
