export const MODES = new Set(["READ_ONLY", "VERIFY", "WRITE", "PUSH"]);

export function assertObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
}

export function validateCommandSpec(command, index = 0) {
  assertObject(command, `commands[${index}]`);
  if (typeof command.exe !== "string" || !command.exe.trim()) {
    throw new Error(`commands[${index}].exe must be a non-empty string`);
  }
  if (!Array.isArray(command.args) || command.args.some((arg) => typeof arg !== "string")) {
    throw new Error(`commands[${index}].args must be a string array`);
  }
  if (command.cwd !== undefined && typeof command.cwd !== "string") {
    throw new Error(`commands[${index}].cwd must be a string when provided`);
  }
  return command;
}

export function validateExecutionOrder(order) {
  assertObject(order, "execution order");
  if (typeof order.actionId !== "string" || !order.actionId.trim()) {
    throw new Error("execution order actionId is required");
  }
  if (!MODES.has(order.mode)) {
    throw new Error(`unsupported execution mode: ${order.mode}`);
  }
  if (typeof order.repository !== "string" || !order.repository.trim()) {
    throw new Error("execution order repository is required");
  }
  if (!Array.isArray(order.commands) || order.commands.length === 0) {
    throw new Error("execution order must contain at least one command");
  }
  order.commands.forEach(validateCommandSpec);
  for (const key of ["allowedPaths", "forbiddenPaths", "acceptanceCriteria", "stopConditions"]) {
    if (order[key] !== undefined && (!Array.isArray(order[key]) || order[key].some((v) => typeof v !== "string"))) {
      throw new Error(`${key} must be a string array`);
    }
  }
  return {
    ...order,
    allowedPaths: order.allowedPaths ?? [],
    forbiddenPaths: order.forbiddenPaths ?? [],
    acceptanceCriteria: order.acceptanceCriteria ?? [],
    stopConditions: order.stopConditions ?? [],
  };
}

export function validateGovernorDecision(decision) {
  assertObject(decision, "governor decision");
  if (typeof decision.decisionId !== "string" || !decision.decisionId.trim()) {
    throw new Error("decisionId is required");
  }
  if (typeof decision.wave !== "string" || !decision.wave.trim()) {
    throw new Error("wave is required");
  }
  if (typeof decision.decision !== "string" || !decision.decision.trim()) {
    throw new Error("decision is required");
  }
  if (typeof decision.canonicalBaseSha !== "string" || !decision.canonicalBaseSha.trim()) {
    throw new Error("canonicalBaseSha is required");
  }
  if (typeof decision.writeAuthorized !== "boolean") {
    throw new Error("writeAuthorized must be boolean");
  }
  if (decision.nextAction !== undefined && decision.nextAction !== null) {
    decision.nextAction = validateExecutionOrder(decision.nextAction);
  }
  return decision;
}

export function parseJsonContent(content) {
  if (typeof content !== "string") throw new Error("governor response content must be a string");
  const trimmed = content.trim();
  const unfenced = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
    : trimmed;
  return JSON.parse(unfenced);
}
