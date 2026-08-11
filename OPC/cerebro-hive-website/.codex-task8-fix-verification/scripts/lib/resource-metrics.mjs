/**
 * scripts/lib/resource-metrics.mjs
 *
 * Captures resource metrics for a dispatch run.
 *
 * Metrics recorded:
 *   wallClockMs      — total elapsed time
 *   cpuUserMs        — user CPU time consumed by the dispatch process
 *   cpuSystemMs      — system CPU time consumed by the dispatch process
 *   peakHeapBytes    — peak heap allocated (sampled at intervals)
 *   agentOutputBytes — combined stdout+stderr bytes from both agents
 *   totalTokens      — sum of all agent token counts
 *   tokensPerSecond  — totalTokens / (agentWallClockSec)
 *   costUsd          — estimated cost based on per-token pricing (if configured)
 *
 * Usage:
 *   const metrics = new ResourceMetrics();
 *   metrics.start();
 *   // … run agents …
 *   metrics.recordAgent("claude", agentResult);
 *   metrics.recordAgent("gemini", agentResult);
 *   const snapshot = metrics.finish();
 */

import os from "node:os";
import process from "node:process";

// Per-token pricing in USD (override via env vars).
// Defaults reflect approximate 2025 pricing — update as needed.
const PRICING = {
  claude: {
    input:  parseFloat(process.env.CLAUDE_PRICE_INPUT_PER_1K  ?? "0.003"),   // $/1K input tokens
    output: parseFloat(process.env.CLAUDE_PRICE_OUTPUT_PER_1K ?? "0.015"),   // $/1K output tokens
  },
  gemini: {
    input:  parseFloat(process.env.GEMINI_PRICE_INPUT_PER_1K  ?? "0.00035"),
    output: parseFloat(process.env.GEMINI_PRICE_OUTPUT_PER_1K ?? "0.00105"),
  },
};

function estimateCost(agentName, tokenUsage) {
  if (!tokenUsage) return 0;
  const p = PRICING[agentName];
  if (!p) return 0;
  const inputCost  = ((tokenUsage.inputTokens  ?? 0) / 1000) * p.input;
  const outputCost = ((tokenUsage.outputTokens ?? 0) / 1000) * p.output;
  return inputCost + outputCost;
}

export class ResourceMetrics {
  constructor() {
    this._startCpu  = null;
    this._startTime = null;
    this._peakSampler = null;
    this._peakHeapBytes = 0;
    this._agents = {};   // agentName → { durationMs, outputBytes, tokenUsage }
    this.snapshot = null;
  }

  start() {
    this._startCpu  = process.cpuUsage();
    this._startTime = process.hrtime.bigint();
    this._peakHeapBytes = process.memoryUsage().heapUsed;

    // Sample heap every 5 s while agents are running
    this._peakSampler = setInterval(() => {
      const heap = process.memoryUsage().heapUsed;
      if (heap > this._peakHeapBytes) this._peakHeapBytes = heap;
    }, 5_000);
  }

  /**
   * Record results from one agent.
   * @param {string} name
   * @param {{ durationMs: number, outputBytes: number, tokenUsage: object|null }} result
   */
  recordAgent(name, result) {
    this._agents[name] = {
      durationMs: result.durationMs ?? 0,
      outputBytes: result.outputBytes ?? 0,
      tokenUsage: result.tokenUsage ?? null,
    };
  }

  /** Finalise all metrics and return a plain snapshot object. */
  finish() {
    clearInterval(this._peakSampler);

    const wallClockMs = Number(process.hrtime.bigint() - this._startTime) / 1_000_000;
    const cpu = process.cpuUsage(this._startCpu);

    // Agent totals
    let totalOutputBytes = 0;
    let totalTokens = 0;
    let totalAgentMs = 0;
    let costUsd = 0;

    for (const [name, a] of Object.entries(this._agents)) {
      totalOutputBytes += a.outputBytes;
      totalAgentMs     += a.durationMs;
      const t = a.tokenUsage;
      if (t?.totalTokens) totalTokens += t.totalTokens;
      costUsd += estimateCost(name, t);
    }

    // tokens/sec based on actual parallel wall clock (not summed serial time)
    const agentWallClockSec = Math.max(
      ...Object.values(this._agents).map((a) => a.durationMs),
      1
    ) / 1000;

    this.snapshot = {
      wallClockMs: Math.round(wallClockMs),
      cpuUserMs:   Math.round(cpu.user / 1000),
      cpuSystemMs: Math.round(cpu.system / 1000),
      peakHeapBytes: this._peakHeapBytes,
      agentOutputBytes: totalOutputBytes,
      totalAgentMs: Math.round(totalAgentMs),
      totalTokens,
      tokensPerSecond: totalTokens > 0 ? Math.round(totalTokens / agentWallClockSec) : null,
      costUsd: Math.round(costUsd * 1e6) / 1e6,   // 6 decimal places
      agents: Object.fromEntries(
        Object.entries(this._agents).map(([name, a]) => [
          name,
          {
            durationMs: a.durationMs,
            outputBytes: a.outputBytes,
            tokenUsage: a.tokenUsage,
            costUsd: Math.round(estimateCost(name, a.tokenUsage) * 1e6) / 1e6,
          },
        ])
      ),
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        cpuCount: os.cpus().length,
        totalMemoryBytes: os.totalmem(),
      },
    };

    return this.snapshot;
  }
}
