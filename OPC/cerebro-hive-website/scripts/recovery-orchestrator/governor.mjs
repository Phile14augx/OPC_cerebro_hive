import { parseJsonContent, validateGovernorDecision } from "./protocol.mjs";

const DEFAULT_PROTOCOL_SYSTEM = `You are the Cerebro Nexarch Recovery Governor. You MUST return exactly one JSON object matching the GovernorDecision protocol supplied in the user message and no prose. The top-level object MUST contain decisionId, wave, decision, canonicalBaseSha, verifiedFacts, conflicts, unknowns, writeAuthorized, and nextAction (which may be null). Use the exact decisionId/actionId values supplied by the protocol constraints; do not invent or reuse identifiers. Never return a recovery-status report instead of the GovernorDecision object. Never fabricate repository facts. Never issue destructive Git commands. Use the supplied evidence and state only. If evidence is insufficient, choose COLLECT_EVIDENCE. Execution commands must be structured as {exe,args,cwd?}; do not use shell pipelines. High-risk actions such as merge, reset, branch deletion, worktree deletion, force push, or production deployment must be BLOCKed for human approval. A prior GOVERNOR_PROTOCOL_ERROR is an orchestrator transport/protocol failure, not evidence that the portfolio itself is blocked; resume from the last valid recovery evidence.`;

function nextDecisionId(input) {
  const wave = input?.state?.wave ?? "W0.2";
  const used = new Set([
    ...(Array.isArray(input?.usedDecisionIds) ? input.usedDecisionIds : []),
    ...(typeof input?.state?.lastDecisionId === "string" ? [input.state.lastDecisionId] : []),
  ]);
  const escaped = wave.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^${escaped}-(\\d+)$`);
  let max = 0;
  for (const id of used) {
    const match = pattern.exec(id);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `${wave}-${String(max + 1).padStart(3, "0")}`;
}

function decisionEnum(input) {
  const values = ["COLLECT_EVIDENCE", "AUTHORIZE_IMPLEMENTATION", "VERIFY", "PUSH", "BLOCK"];
  if (input?.closurePolicy?.proposalAllowed === true) values.push("CLOSE_WAVE");
  return values;
}

function executionOrderSchema({ expectedActionId, repository }) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      actionId: { type: "string", const: expectedActionId },
      mode: { type: "string", enum: ["READ_ONLY", "VERIFY", "WRITE", "PUSH"] },
      repository: repository
        ? { type: "string", const: repository }
        : { type: "string", minLength: 1 },
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

function governorDecisionSchema(input) {
  const expectedDecisionId = nextDecisionId(input);
  const expectedActionId = `${expectedDecisionId}-ACTION`;
  const wave = input?.state?.wave;
  const repository = input?.state?.repository;
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      decisionId: { type: "string", const: expectedDecisionId },
      wave: wave ? { type: "string", const: wave } : { type: "string", minLength: 1 },
      decision: {
        type: "string",
        enum: decisionEnum(input),
      },
      canonicalBaseSha: { type: "string", minLength: 1 },
      verifiedFacts: { type: "array", items: { type: "string" } },
      conflicts: { type: "array", items: { type: "string" } },
      unknowns: { type: "array", items: { type: "string" } },
      writeAuthorized: { type: "boolean" },
      nextAction: {
        anyOf: [
          { type: "null" },
          executionOrderSchema({ expectedActionId, repository }),
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

function protocolShape(input) {
  const decisionId = nextDecisionId(input);
  const actionId = `${decisionId}-ACTION`;
  return {
    decisionId,
    wave: input?.state?.wave ?? "W0.2",
    decision: "COLLECT_EVIDENCE",
    canonicalBaseSha: input?.state?.canonicalBaseSha ?? "full git SHA",
    verifiedFacts: ["fact supported by supplied target-repository evidence"],
    conflicts: ["unresolved contradiction"],
    unknowns: ["missing fact"],
    writeAuthorized: false,
    nextAction: {
      actionId,
      mode: "READ_ONLY",
      repository: input?.state?.repository ?? "absolute path supplied in state",
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

  async request(messages, schema) {
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
            format: schema,
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
              schema,
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
    const requiredShape = protocolShape(input);
    const schema = governorDecisionSchema(input);
    const expectedDecisionId = requiredShape.decisionId;
    const expectedActionId = requiredShape.nextAction.actionId;
    const closureInstruction = input?.closurePolicy?.proposalAllowed === true
      ? "CLOSE_WAVE may be proposed only if every wave acceptance criterion has direct evidence; it still requires human approval."
      : "CLOSE_WAVE is disabled for this run. Do not propose closure. Continue COLLECT_EVIDENCE or VERIFY, or BLOCK only for a genuine repository/policy blocker.";
    const baseMessages = [
      { role: "system", content: this.systemPrompt },
      {
        role: "user",
        content: JSON.stringify({
          protocolVersion: 1,
          instruction: `Return exactly one GovernorDecision JSON object. Use decisionId ${expectedDecisionId} exactly. If nextAction is non-null, use actionId ${expectedActionId} exactly. Do not return a status report or wrapper object. Every required field must be present. verifiedFacts/conflicts/unknowns are arrays of strings. If no executor action is needed, set nextAction to null. ${closureInstruction}`,
          requiredDecisionId: expectedDecisionId,
          requiredActionId: expectedActionId,
          requiredShape,
          jsonSchema: schema,
          input,
        }),
      },
    ];

    const firstContent = await this.request(baseMessages, schema);
    try {
      return this.parseAndValidate(firstContent);
    } catch (firstError) {
      const repairMessages = [
        ...baseMessages,
        { role: "assistant", content: firstContent.slice(0, 24_000) },
        {
          role: "user",
          content: JSON.stringify({
            instruction: `Your previous response violated the GovernorDecision protocol. Repair it. Return ONLY the corrected top-level GovernorDecision JSON object. Use decisionId ${expectedDecisionId} exactly and, when nextAction is non-null, actionId ${expectedActionId} exactly. Do not return a recovery-status object. ${closureInstruction}`,
            validationError: serializeError(firstError),
            requiredDecisionId: expectedDecisionId,
            requiredActionId: expectedActionId,
            requiredShape,
            jsonSchema: schema,
          }),
        },
      ];

      const secondContent = await this.request(repairMessages, schema);
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
