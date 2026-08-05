/**
 * scripts/lib/providers/base-provider.mjs
 *
 * Base class for agent providers. Handles:
 *   - retry with exponential backoff
 *   - hard timeout + SIGKILL
 *   - heartbeat monitoring (warn if no output for HEARTBEAT_INTERVAL_MS)
 *   - traceId injection via AGENT_TRACE_ID env var
 *   - resource metrics (wall clock, output size)
 */

import { spawn } from "node:child_process";
import { extractTokenUsage } from "../run-logger.mjs";

const IS_WIN = process.platform === "win32";
const HEARTBEAT_INTERVAL_MS = parseInt(process.env.HEARTBEAT_INTERVAL_MS ?? "600000", 10); // 10 min

export class BaseProvider {
  /** @param {string} name */
  constructor(name) {
    this.name = name;
  }

  /**
   * Override in subclasses: return [cmd, argv] to spawn.
   * @param {string} prompt
   * @returns {[string, string[]]}
   */
  // eslint-disable-next-line no-unused-vars
  buildCommand(prompt) {
    throw new Error(`${this.name} must implement buildCommand()`);
  }

  /**
   * Override in subclasses: return env vars for this provider.
   * @returns {Record<string, string>}
   */
  buildEnv() { return {}; }

  /** Check whether the required env var / CLI binary is available. */
  available() { return true; }

  /**
   * Run this provider with full safeguards.
   *
   * @param {{
   *   prompt: string,
   *   cwd: string,
   *   timeoutMs: number,
   *   maxRetries: number,
   *   noRetry?: boolean,
   *   traceId?: string,
   *   onHeartbeat?: (ts: string, partial: string) => void,
   * }} opts
   * @returns {Promise<{
   *   stdout: string, stderr: string, exitCode: number,
   *   durationMs: number, tokenUsage: object|null,
   *   outputBytes: number, label: string
   * }>}
   */
  async run(opts) {
    const {
      prompt, cwd, timeoutMs, maxRetries, noRetry = false,
      traceId = "", onHeartbeat,
    } = opts;

    const attempt = (n) => new Promise((resolve, reject) => {
      const t0 = Date.now();
      const [cmd, argv] = this.buildCommand(prompt);
      const env = {
        ...process.env,
        ...this.buildEnv(),
        AGENT_TRACE_ID: traceId,
        AGENT_NAME: this.name,
      };

      process.stdout.write(`\n[${this.name}] attempt ${n}/${maxRetries} — starting\n`);

      const proc = spawn(cmd, argv, { cwd, shell: IS_WIN, env });
      const stdout = [];
      const stderr = [];

      // ── Heartbeat monitor ─────────────────────────────────────────────
      let lastOutputAt = Date.now();
      const heartbeat = setInterval(() => {
        const silentMs = Date.now() - lastOutputAt;
        if (silentMs > HEARTBEAT_INTERVAL_MS) {
          const ts = new Date().toISOString();
          const msg = `[${this.name}] heartbeat warning: no output for ${(silentMs / 60000).toFixed(1)} min`;
          process.stderr.write(msg + "\n");
          onHeartbeat?.(ts, stdout.join("").slice(-500));
        }
      }, 30_000);

      proc.stdout?.on("data", (d) => {
        lastOutputAt = Date.now();
        process.stdout.write(`[${this.name}] ${d}`);
        stdout.push(String(d));
      });
      proc.stderr?.on("data", (d) => {
        lastOutputAt = Date.now();
        process.stderr.write(`[${this.name}] ${d}`);
        stderr.push(String(d));
      });

      // ── Hard timeout ──────────────────────────────────────────────────
      const timer = setTimeout(() => {
        clearInterval(heartbeat);
        proc.kill("SIGKILL");
        reject(new Error(`[${this.name}] hard timeout after ${timeoutMs / 60000} min`));
      }, timeoutMs);

      proc.on("close", (code) => {
        clearTimeout(timer);
        clearInterval(heartbeat);
        const durationMs = Date.now() - t0;
        const stdoutStr = stdout.join("");
        const stderrStr = stderr.join("");
        const result = {
          label: this.name,
          stdout: stdoutStr,
          stderr: stderrStr,
          exitCode: code,
          durationMs,
          outputBytes: Buffer.byteLength(stdoutStr + stderrStr, "utf8"),
          tokenUsage: extractTokenUsage(stdoutStr + stderrStr),
        };
        if (code === 0) {
          process.stdout.write(`[${this.name}] ✓ finished in ${(durationMs / 1000).toFixed(1)}s\n`);
          resolve(result);
        } else {
          reject(Object.assign(new Error(`[${this.name}] exited ${code}`), result));
        }
      });
    });

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    for (let n = 1; n <= maxRetries; n++) {
      try {
        return await attempt(n);
      } catch (err) {
        if (n === maxRetries || noRetry) throw err;
        const delay = 15_000 * n;
        process.stderr.write(`[${this.name}] retry ${n}/${maxRetries} in ${delay / 1000}s…\n`);
        await sleep(delay);
      }
    }
  }
}
