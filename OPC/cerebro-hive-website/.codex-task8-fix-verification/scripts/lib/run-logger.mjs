/**
 * scripts/lib/run-logger.mjs
 *
 * Structured per-run execution logger.
 *
 * Each dispatch creates:
 *   .agents/runs/<ISO-timestamp>-<milestone-id>/
 *     manifest.json        — run metadata, status, PR URL, timing
 *     claude-prompt.txt    — exact prompt sent to Claude
 *     gemini-prompt.txt    — exact prompt sent to Gemini
 *     claude-output.txt    — raw stdout/stderr from Claude
 *     gemini-output.txt    — raw stdout/stderr from Gemini
 *     validation.txt       — output of pnpm build/lint/typecheck/test
 *     events.jsonl         — append-only structured event log
 *     summary.md           — human-readable Markdown summary
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const RUNS_DIR = path.join(ROOT, ".agents", "runs");

/** Semantic version of the prompt templates. Bump when prompt logic changes. */
export const PROMPT_VERSION = "3.0.0";

export class RunLogger {
  /**
   * @param {string} milestoneId  e.g. "M10.1"
   * @param {string} milestoneTitle
   * @param {string} traceId      UUID for this run (shared with all sub-processes)
   */
  constructor(milestoneId, milestoneTitle, traceId = "") {
    this.milestoneId = milestoneId;
    this.milestoneTitle = milestoneTitle;
    this.traceId = traceId;
    this.startedAt = new Date();
    const ts = this.startedAt.toISOString().replace(/[:.]/g, "-");
    this.runDir = path.join(RUNS_DIR, `${ts}-${milestoneId.toLowerCase()}`);
    fs.mkdirSync(this.runDir, { recursive: true });

    this.manifest = {
      traceId,
      promptVersion: PROMPT_VERSION,
      milestoneId,
      milestoneTitle,
      startedAt: this.startedAt.toISOString(),
      finishedAt: null,
      status: "running",   // running | success | failed | rolled-back
      branch: null,
      prUrl: null,
      prNumber: null,
      durationMs: null,
      agents: {
        claude: { files: [], durationMs: null, exitCode: null, tokenUsage: null },
        gemini: { files: [], durationMs: null, exitCode: null, tokenUsage: null },
      },
      validation: { stages: [], passed: false },
      resourceMetrics: null,
      policyResult: null,
      error: null,
    };
    this._writeManifest();
    this._appendEvent("run.started", { milestoneId, traceId, promptVersion: PROMPT_VERSION });
  }

  // ─── Manifest helpers ────────────────────────────────────────────────────

  _writeManifest() {
    fs.writeFileSync(
      path.join(this.runDir, "manifest.json"),
      JSON.stringify(this.manifest, null, 2) + "\n",
      "utf8"
    );
  }

  _appendEvent(type, payload = {}) {
    const record = { ts: new Date().toISOString(), type, ...payload };
    fs.appendFileSync(
      path.join(this.runDir, "events.jsonl"),
      JSON.stringify(record) + "\n",
      "utf8"
    );
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  setBranch(branch) {
    this.manifest.branch = branch;
    this._writeManifest();
    this._appendEvent("branch.created", { branch });
  }

  logPrompt(agent, prompt) {
    fs.writeFileSync(path.join(this.runDir, `${agent}-prompt.txt`), prompt, "utf8");
    this._appendEvent(`${agent}.prompt.written`);
  }

  logFiles(agent, files) {
    this.manifest.agents[agent].files = files;
    this._writeManifest();
  }

  logAgentOutput(agent, { stdout, stderr, exitCode, durationMs, tokenUsage }) {
    const combined = [stdout, stderr].filter(Boolean).join("\n");
    fs.writeFileSync(path.join(this.runDir, `${agent}-output.txt`), combined, "utf8");
    this.manifest.agents[agent].exitCode = exitCode;
    this.manifest.agents[agent].durationMs = durationMs;
    this.manifest.agents[agent].tokenUsage = tokenUsage ?? null;
    this._writeManifest();
    this._appendEvent(`${agent}.finished`, { exitCode, durationMs, tokenUsage });
  }

  logValidation(passed, output, stages = []) {
    fs.writeFileSync(path.join(this.runDir, "validation.txt"), output ?? "", "utf8");
    this.manifest.validation = { stages, passed, output };
    this._writeManifest();
    this._appendEvent("validation.finished", { passed, stages: stages.map((s) => ({ name: s.name, status: s.status })) });
  }

  logResourceMetrics(metrics) {
    this.manifest.resourceMetrics = metrics;
    this._writeManifest();
    this._appendEvent("resource.metrics", metrics);
  }

  logPolicyResult(result) {
    this.manifest.policyResult = result;
    this._writeManifest();
    this._appendEvent("policy.evaluated", result);
  }

  setPrUrl(url, number) {
    this.manifest.prUrl = url;
    this.manifest.prNumber = number;
    this._writeManifest();
    this._appendEvent("pr.opened", { url, number });
  }

  finish(status, error = null) {
    const finishedAt = new Date();
    this.manifest.finishedAt = finishedAt.toISOString();
    this.manifest.status = status;
    this.manifest.durationMs = finishedAt - this.startedAt;
    this.manifest.error = error ? String(error) : null;
    this._writeManifest();
    this._appendEvent("run.finished", { status, durationMs: this.manifest.durationMs });
    this._writeSummary();
  }

  _writeSummary() {
    const m = this.manifest;
    const dur = m.durationMs ? `${(m.durationMs / 1000 / 60).toFixed(1)} min` : "—";
    const claudeDur = m.agents.claude.durationMs
      ? `${(m.agents.claude.durationMs / 1000).toFixed(1)}s`
      : "—";
    const geminiDur = m.agents.gemini.durationMs
      ? `${(m.agents.gemini.durationMs / 1000).toFixed(1)}s`
      : "—";

    const lines = [
      `# Dispatch Run: ${m.milestoneId} — ${m.milestoneTitle}`,
      ``,
      `| Field | Value |`,
      `|---|---|`,
      `| Status | **${m.status}** |`,
      `| Started | ${m.startedAt} |`,
      `| Finished | ${m.finishedAt ?? "—"} |`,
      `| Duration | ${dur} |`,
      `| Branch | \`${m.branch ?? "—"}\` |`,
      `| PR | ${m.prUrl ? `[#${m.prNumber}](${m.prUrl})` : "—"} |`,
      `| Validation | ${m.validation.passed ? "✅ passed" : "❌ failed"} |`,
      ``,
      `## Agent results`,
      ``,
      `### Claude`,
      `- Files: ${m.agents.claude.files.map((f) => `\`${f}\``).join(", ") || "—"}`,
      `- Duration: ${claudeDur}`,
      `- Exit code: ${m.agents.claude.exitCode ?? "—"}`,
      m.agents.claude.tokenUsage
        ? `- Tokens: ${JSON.stringify(m.agents.claude.tokenUsage)}`
        : `- Tokens: (not captured)`,
      ``,
      `### Gemini`,
      `- Files: ${m.agents.gemini.files.map((f) => `\`${f}\``).join(", ") || "—"}`,
      `- Duration: ${geminiDur}`,
      `- Exit code: ${m.agents.gemini.exitCode ?? "—"}`,
      m.agents.gemini.tokenUsage
        ? `- Tokens: ${JSON.stringify(m.agents.gemini.tokenUsage)}`
        : `- Tokens: (not captured)`,
      ``,
      m.error ? `## Error\n\n\`\`\`\n${m.error}\n\`\`\`` : "",
    ];

    fs.writeFileSync(
      path.join(this.runDir, "summary.md"),
      lines.filter((l) => l !== undefined).join("\n") + "\n",
      "utf8"
    );
  }

  /** Path of the run directory, for surfacing to CI logs. */
  get path() {
    return this.runDir;
  }
}

// ─── Token usage extraction ────────────────────────────────────────────────

/**
 * Try to parse token usage from raw agent output.
 * Both Claude and Gemini CLIs emit usage in slightly different formats.
 * Returns null if nothing parseable is found.
 *
 * @param {string} output
 * @returns {{ inputTokens?: number, outputTokens?: number, totalTokens?: number } | null}
 */
export function extractTokenUsage(output) {
  if (!output) return null;

  // Claude CLI format: "Input tokens: 1234  Output tokens: 567"
  const claudeMatch = output.match(
    /input\s+tokens?[:\s]+(\d+).*?output\s+tokens?[:\s]+(\d+)/is
  );
  if (claudeMatch) {
    const input = parseInt(claudeMatch[1], 10);
    const out = parseInt(claudeMatch[2], 10);
    return { inputTokens: input, outputTokens: out, totalTokens: input + out };
  }

  // Gemini CLI format: "Tokens used: 1234 (prompt: 987, candidates: 247)"
  const geminiMatch = output.match(/tokens\s+used[:\s]+(\d+)/i);
  if (geminiMatch) {
    const total = parseInt(geminiMatch[1], 10);
    const promptMatch = output.match(/prompt[:\s]+(\d+)/i);
    const candidateMatch = output.match(/candidates?[:\s]+(\d+)/i);
    return {
      inputTokens: promptMatch ? parseInt(promptMatch[1], 10) : undefined,
      outputTokens: candidateMatch ? parseInt(candidateMatch[1], 10) : undefined,
      totalTokens: total,
    };
  }

  // Generic JSON blob anywhere in output: {"usage":{"input_tokens":N,"output_tokens":N}}
  const jsonMatch = output.match(/"input_tokens"\s*:\s*(\d+).*?"output_tokens"\s*:\s*(\d+)/s);
  if (jsonMatch) {
    const input = parseInt(jsonMatch[1], 10);
    const out = parseInt(jsonMatch[2], 10);
    return { inputTokens: input, outputTokens: out, totalTokens: input + out };
  }

  return null;
}
