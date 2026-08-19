import { parseJsonContent, validateGovernorDecision } from "./protocol.mjs";

const DEFAULT_PROTOCOL_SYSTEM = `You are the Cerebro Nexarch Recovery Governor. You MUST return exactly one JSON object matching the GovernorDecision protocol supplied in the user message and no prose. The top-level object MUST contain decisionId, wave, decision, canonicalBaseSha, verifiedFacts, conflicts, unknowns, writeAuthorized, and nextAction (which may be null). Never return a recovery-status report instead of the GovernorDecision object. Never fabricate repository facts. Never issue destructive Git commands. Use the supplied evidence and state only. If evidence is insufficient, choose COLLECT_EVIDENCE. Execution commands must be structured as {exe,args,cwd?}; do not use shell pipelines. High-risk actions such as merge, reset, branch deletion, worktree deletion, force push, or production deployment must be BLOCKed for human approval. A prior GOVERNOR_PROTOCOL_ERROR is an orchestrator transport/protocol failure, not evidence that the portfolio itself is blocked; resume from the last valid recovery evidence.`;

function executionOrderSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      actionId: { type: "string", minLength: 1 },
      mode: { type: "string", enum: ["READ_ONLY", "VERIFY", "WRITE", "PUSH"] },
      repository: { type: "string", minLength: 1 },
      commands: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            exe: { type: "string", minLength: 1 },
            args: { type: "array", items: { type: "string" } },
            cwd: { type: "string" },
          },
          required: ["exe", "args"],
        },
      },
      allowedPaths: { type: "array", items: { type: "string" } },
      forbiddenPaths: { type: "array", items: { type: "string" } },
      acceptanceCriteria: { type: "array", items: { type: "string" } },
      stopConditions: { type: "array", items: { type: "string" } },
    },
    required: [
      "actionId",
      "mode",
      "repository",
      "commands",
      "allowedPaths",
      "forbiddenPaths",
      "acceptanceCriteria",
      "stopConditions",
    ],
  };
}

function governorDecisionSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      decisionId: { type: "string", minLength: 1 },
      wave: { type: "string", minLength: 1 },
      decision: {
        type: "string",
        enum: ["COLLECT_EVIDENCE", "AUTHORIZE_IMPLEMENTATION", "VERIFY", "PUSH", "BLOCK", "CLOSE_WAVE"],
      },
      canonicalBaseSha: { type: "string", minLength: 1 },
      verifiedFacts: { type: "array", items: { type: "string" } },
      conflicts: { type: "array", items: { type: "string" } },
      unknowns: { type: "array", items: { type: "string" } },
      writeAuthorized: { type: "boolean" },
      nextAction: {
        anyOf: [
          { type: "null" },
          executionOrderSchema(),
        ],
      },
    },
    required: [
      "decisionId",
      "wave",
      "decision",
      "canonicalBaseSha",
      "verifiedFacts",
      "conflicts",
      "unknowns",
      "writeAuthorized",
      "nextAction",
    ],
  };
}

function protocolShape() {
  return {
    decisionId: "W0.2-002",
    wave: "W0.2",
    decision: "COLLECT_EVIDENCE",
    canonicalBaseSha: "full git SHA",
    verifiedFacts: ["fact supported by supplied evidence"],
    conflicts: ["unresolved contradiction"],
    unknowns: ["missing fact"],
    writeAuthorized: false,
    nextAction: {
      actionId: "W0.2-002-EVIDENCE",
      mode: "READ_ONLY",
      repository: "absolute path supplied in state",
      commands: [{ exe: "git", args: ["status", "--porcelain=v1"] }],
      allowedPaths: [],
      forbiddenPaths: [],
      acceptanceCriteria: ["raw evidence captured"],
      stopConditions: ["stop on command failure"],
    },
  };
}

function serializeError(error) {
  return error instanceof Error ? error.message : String(error);
}

function unwrapDecision(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  if (typeof value.decisionId === "string") return value;
  for (const key of ["governorDecision", "governor_decision", "result", "response", "output"]) {
    const nested = value[key];
    if (nested && typeof nested === "object" && !Array.isArray(nested) && typeof nested.decisionId === "string") {
      return nested;
    }
  }
  return value;
}

export class QwenGovernorAdapter {
  constructor({ baseUrl, apiKey, model, systemPrompt = "", timeoutMs = 120_000, apiStyle = "auto" }) {
    if (!baseUrl) throw new Error("QWEN_BASE_URL is required");
    if (!model) throw new Error("QWEN_MODEL is required");
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
    this.model = model;
    this.systemPrompt = `${DEFAULT_PROTOCOL_SYSTEM}\n\n${systemPrompt || ""}`.trim();
    this.timeoutMs = timeoutMs;
    this.apiStyle = apiStyle === "auto" ? this.detectApiStyle() : apiStyle;
  }

  detectApiStyle() {
    try {
      const url = new URL(this.baseUrl);
      if (url.port === "11434" || /\/v1$/.test(url.pathname)) return "ollama";
    } catch {
      // Validation of the URL happens naturally when fetch is called.
    }
    return "openai";
  }

  ollamaNativeUrl() {
    const url = new URL(this.baseUrl);
    url.pathname = url.pathname.replace(/\/v1\/?$/, "").replace(/\/$/, "") + "/api/chat";
    url.search = "";
    url.hash = "";
    return url.toString();
  }

  async request(messages) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      if (this.apiStyle === "ollama") {
        const response = await fetch(this.ollamaNativeUrl(), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            model: this.model,
            messages,
            stream: false,
            think: false,
            format: governorDecisionSchema(),
            options: { temperature: 0 },
          }),
          signal: controller.signal,
        });
        const text = await response.text();
        if (!response.ok) throw new Error(`QWEN_HTTP_${response.status}: ${text}`);
        const payload = JSON.parse(text);
        const content = payload?.message?.content;
        if (typeof content !== "string" || !content.trim()) {
          const error = new Error("QWEN_PROTOCOL_INVALID: empty Ollama message.content");
          error.rawResponse = text;
          throw error;
        }
        return content;
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0,
          reasoning_effort: "none",
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "governor_decision",
              strict: true,
              schema: governorDecisionSchema(),
            },
          },
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
    return validateGovernorDecision(unwrapDecision(parseJsonContent(content)));
  }

  async decide(input) {
    const requiredShape = protocolShape();
    const schema = governorDecisionSchema();
    const baseMessages = [
      { role: "system", content: this.systemPrompt },
      {
        role: "user",
        content: JSON.stringify({
          protocolVersion: 1,
          instruction: "Return exactly one GovernorDecision JSON object. Do not return a status report or wrapper object. Every required field must be present. verifiedFacts/conflicts/unknowns are arrays of strings. If no executor action is needed, set nextAction to null.",
          requiredShape,
          jsonSchema: schema,
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
            instruction: "Your previous response violated the GovernorDecision protocol. Repair it. Return ONLY the corrected top-level GovernorDecision JSON object. decisionId is mandatory. Do not return a recovery-status object.",
            validationError: serializeError(firstError),
            requiredShape,
            jsonSchema: schema,
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
