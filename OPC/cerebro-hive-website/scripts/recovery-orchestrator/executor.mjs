import { spawn } from "node:child_process";

function executeProcess(command, defaultCwd, timeoutMs) {
  return new Promise((resolve) => {
    const startedAt = new Date().toISOString();
    const started = Date.now();
    const child = spawn(command.exe, command.args, {
      cwd: command.cwd ?? defaultCwd,
      shell: false,
      windowsHide: true,
      env: process.env,
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutMs);
    child.stdout?.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr?.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({
        command,
        exitCode: -1,
        stdout,
        stderr: `${stderr}${error.message}`,
        timedOut,
        startedAt,
        durationMs: Date.now() - started,
      });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        command,
        exitCode: code ?? -1,
        stdout,
        stderr,
        timedOut,
        startedAt,
        durationMs: Date.now() - started,
      });
    });
  });
}

export class LocalShellExecutor {
  constructor({ timeoutMs = 120_000 } = {}) {
    this.timeoutMs = timeoutMs;
  }

  async execute(order) {
    const results = [];
    for (const command of order.commands) {
      const result = await executeProcess(command, order.repository, this.timeoutMs);
      results.push(result);
      if (result.exitCode !== 0 || result.timedOut) {
        return {
          actionId: order.actionId,
          status: "FAILED",
          commands: results,
          failure: result.timedOut ? "COMMAND_TIMEOUT" : "COMMAND_FAILED",
        };
      }
    }
    return { actionId: order.actionId, status: "COMPLETED", commands: results };
  }
}

export class HttpExecutorAdapter {
  constructor({ executeUrl, apiKey, timeoutMs = 180_000 }) {
    if (!executeUrl) throw new Error("HttpExecutorAdapter requires executeUrl");
    this.executeUrl = executeUrl;
    this.apiKey = apiKey;
    this.timeoutMs = timeoutMs;
  }

  async execute(order) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(this.executeUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify(order),
        signal: controller.signal,
      });
      const text = await response.text();
      if (!response.ok) throw new Error(`EXECUTOR_HTTP_${response.status}: ${text}`);
      return JSON.parse(text);
    } finally {
      clearTimeout(timer);
    }
  }
}
