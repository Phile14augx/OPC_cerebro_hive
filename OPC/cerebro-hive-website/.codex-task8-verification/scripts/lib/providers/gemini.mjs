/**
 * scripts/lib/providers/gemini.mjs
 *
 * Gemini provider — wraps the `gemini` CLI (Google).
 * CLI binary resolved via GEMINI_CLI env var, or "gemini" from $PATH.
 */

import { BaseProvider } from "./base-provider.mjs";

export class GeminiProvider extends BaseProvider {
  constructor() { super("gemini"); }

  available() {
    return Boolean(process.env.GEMINI_API_KEY || process.env.GEMINI_CLI);
  }

  buildCommand(prompt) {
    const bin = process.env.GEMINI_CLI ?? "gemini";
    return [bin, ["-p", prompt]];
  }

  buildEnv() {
    return { GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "" };
  }
}
