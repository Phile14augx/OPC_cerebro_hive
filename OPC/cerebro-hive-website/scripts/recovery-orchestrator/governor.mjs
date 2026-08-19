import { parseJsonContent, validateGovernorDecision } from "./protocol.mjs";

const DEFAULT_PROTOCOL_SYSTEM = `You are the Cerebro Nexarch Recovery Governor. You MUST return exactly one JSON object matching the GovernorDecision protocol supplied in the user message and no prose. The top-level object MUST contain decisionId, wave, decision, canonicalBaseSha, verifiedFacts, conflicts, unknowns, writeAuthorized, and nextAction (which may be null). Never return a recovery-status report instead of the GovernorDecision object. Never fabricate repository facts. Never issue destructive Git commands. Use the supplied evidence and state only. If evidence is insufficient, choose COLLECT_EVIDENCE. Execution commands must be structured as {exe,args,cwd?}; do not use shell pipelines. High-risk actions such as merge, reset, branch deletion, worktree deletion, force push, or production deployment must be BLOCKed for human approval.`;

function protocolShape() {
  return {
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
      stopConditions: [],
    },
  };
}

function serializeError(error) {
  return error instanceof Error ? error.message : String(error);
}

export class QwenGovernorAdapter {
  constructor({ baseUrl, apiKey, model, systemPrompt = "", timeoutMs = 120_000 }) {
    if (!baseUrl) throw new Error("QWEN_BASE_URL is required");
    if (!model) throw new Error("QWEN_MODEL is required");
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
    this.model = model;
    this.systemPrompt = `${DEFAULT_PROTOCOL_SYSTEM}\n\n${systemPrompt || ""}`.trim();
    this.timeoutMs = timeoutMs;
  }

  async request(messages) {
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
          response_format: { type: "json_object" },
          messages,
        }),
        signal: controller.signal,
      });
      const text = await response.text();
      if (!response.ok) throw new Error(`QWEN_HTTP_${response.status}: ${text}`);
      const payload = JSON.parse(text);
      const content = payload?.choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content.trim()) {
        const error = new Error("QWEN_PROTOCOL_INVALID: empty message.content");
        error.rawResponse = text;
        throw error;
      }
      return content;
    } finally {
      clearTimeout(timer);
    }
  }

  parseAndValidate(content) {
    return validateGovernorDecision(parseJsonContent(content));
  }

  async decide(input) {
    const requiredShape = protocolShape();
    const baseMessages = [
      { role: "system", content: this.systemPrompt },
      {
        role: "user",
        content: JSON.stringify({
          protocolVersion: 1,
          instruction: "Return exactly one GovernorDecision JSON object. Do not return a status report or wrapper object.",
          requiredShape,
          input,
        }),
      },
    ];

    const firstContent = await this.request(baseMessages);
    try {
      return this.parseAndValidate(firstContent);
    } catch (firstError) {
      const repairMessages = [
        ...baseMessages,
        { role: "assistant", content: firstContent.slice(0, 24_000) },
        {
          role: "user",
          content: JSON.stringify({
            instruction: "Your previous response violated the GovernorDecision protocol. Repair it. Return ONLY the corrected top-level GovernorDecision JSON object, with no wrapper and no prose.",
            validationError: serializeError(firstError),
            requiredShape,
          }),
        },
      ];

      const secondContent = await this.request(repairMessages);
      try {
        return this.parseAndValidate(secondContent);
      } catch (secondError) {
        const error = new Error(`QWEN_PROTOCOL_INVALID_AFTER_RETRY: ${serializeError(secondError)}`);
        error.firstValidationError = serializeError(firstError);
        error.firstContent = firstContent.slice(0, 24_000);
        error.secondContent = secondContent.slice(0, 24_000);
        throw error;
      }
    }
  }
}
