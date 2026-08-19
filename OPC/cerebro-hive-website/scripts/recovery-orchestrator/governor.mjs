import { parseJsonContent, validateGovernorDecision } from "./protocol.mjs";

const DEFAULT_SYSTEM = `You are the Cerebro Nexarch Recovery Governor. Return exactly one JSON object and no prose. You must choose one bounded next action. Never fabricate repository facts. Never issue destructive Git commands. Use the supplied evidence and state only. If evidence is insufficient, choose COLLECT_EVIDENCE. Execution commands must be structured as {exe,args,cwd?}; do not use shell pipelines. High-risk actions such as merge, reset, branch deletion, worktree deletion, force push, or production deployment must be BLOCKed for human approval.`;

export class QwenGovernorAdapter {
  constructor({ baseUrl, apiKey, model, systemPrompt = DEFAULT_SYSTEM, timeoutMs = 120_000 }) {
    if (!baseUrl) throw new Error("QWEN_BASE_URL is required");
    if (!model) throw new Error("QWEN_MODEL is required");
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
    this.model = model;
    this.systemPrompt = systemPrompt;
    this.timeoutMs = timeoutMs;
  }

  async decide(input) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0,
          messages: [
            { role: "system", content: this.systemPrompt },
            {
              role: "user",
              content: JSON.stringify({
                protocolVersion: 1,
                requiredShape: {
                  decisionId: "string",
                  wave: "string",
                  decision: "COLLECT_EVIDENCE | AUTHORIZE_IMPLEMENTATION | VERIFY | PUSH | BLOCK | CLOSE_WAVE",
                  canonicalBaseSha: "string",
                  verifiedFacts: [],
                  conflicts: [],
                  unknowns: [],
                  writeAuthorized: false,
                  nextAction: {
                    actionId: "string",
                    mode: "READ_ONLY | VERIFY | WRITE | PUSH",
                    repository: "absolute path",
                    commands: [{ exe: "git", args: ["status", "--porcelain=v1"] }],
                    allowedPaths: [],
                    forbiddenPaths: [],
                    acceptanceCriteria: [],
                    stopConditions: []
                  }
                },
                input,
              }),
            },
          ],
        }),
        signal: controller.signal,
      });
      const text = await response.text();
      if (!response.ok) throw new Error(`QWEN_HTTP_${response.status}: ${text}`);
      const payload = JSON.parse(text);
      const content = payload?.choices?.[0]?.message?.content;
      return validateGovernorDecision(parseJsonContent(content));
    } finally {
      clearTimeout(timer);
    }
  }
}
