import path from "node:path";
import { validateGovernorDecision } from "./protocol.mjs";

function serializableError(error) {
  if (!error || typeof error !== "object") {
    return { name: "Error", message: String(error) };
  }
  return {
    name: error.name ?? "Error",
    message: error.message ?? String(error),
    stack: error.stack,
    firstValidationError: error.firstValidationError,
    firstContent: error.firstContent,
    secondContent: error.secondContent,
    rawResponse: error.rawResponse,
  };
}

function clearTransientFailureState(state) {
  const {
    blocker: _blocker,
    integrityViolations: _integrityViolations,
    executionFailure: _executionFailure,
    ...rest
  } = state;
  return rest;
}

function summarizeExecutionFailure(result) {
  if (result?.status === "COMPLETED") return undefined;
  const failed = Array.isArray(result?.commands) && result.commands.length > 0
    ? result.commands[result.commands.length - 1]
    : undefined;
  return {
    classification: result?.failure ?? "EXECUTION_FAILED",
    command: failed?.command,
    exitCode: failed?.exitCode,
    timedOut: failed?.timedOut,
    stderr: typeof failed?.stderr === "string" ? failed.stderr.slice(0, 4000) : failed?.stderr,
  };
}

function normalizeFsPath(value) {
  const resolved = path.resolve(value);
  return process.platform === "win32" ? resolved.toLowerCase() : resolved;
}

function validateDecisionAgainstState(decision, state) {
  if (state.lastDecisionId && decision.decisionId === state.lastDecisionId) {
    throw new Error(`DUPLICATE_DECISION_ID: ${decision.decisionId}`);
  }
  if (decision.nextAction && state.lastActionId && decision.nextAction.actionId === state.lastActionId) {
    throw new Error(`DUPLICATE_ACTION_ID: ${decision.nextAction.actionId}`);
  }
  if (decision.nextAction && normalizeFsPath(decision.nextAction.repository) !== normalizeFsPath(state.repository)) {
    throw new Error(`EXECUTION_TARGET_MISMATCH: expected ${state.repository}, got ${decision.nextAction.repository}`);
  }
}

export class RecoveryOrchestrator {
  constructor({ governor, executor, policy, gitGuard, evidenceStore, ledger, initialState, maxIterations = 50 }) {
    this.governor = governor;
    this.executor = executor;
    this.policy = policy;
    this.gitGuard = gitGuard;
    this.evidenceStore = evidenceStore;
    this.ledger = ledger;
    this.initialState = initialState;
    this.maxIterations = maxIterations;
  }

  async run({ once = false } = {}) {
    let state = await this.ledger.latestState(this.initialState);

    for (let iteration = 0; iteration < this.maxIterations; iteration += 1) {
      const history = await this.ledger.readAll();
      let decision;
      try {
        decision = validateGovernorDecision(await this.governor.decide({ state, history: history.slice(-20) }));
        validateDecisionAgainstState(decision, state);
      } catch (error) {
        const failure = {
          classification: "GOVERNOR_PROTOCOL_ERROR",
          iteration,
          state,
          error: serializableError(error),
          capturedAt: new Date().toISOString(),
        };
        const artifact = await this.evidenceStore.write("governor-error", `iteration-${iteration + 1}`, failure);
        await this.evidenceStore.appendManifest({ ...artifact, actionId: `GOVERNOR-ERROR-${iteration + 1}` });
        await this.ledger.append("GOVERNOR_ERROR", { artifact, error: failure.error });
        const blocked = {
          ...clearTransientFailureState(state),
          status: "BLOCKED",
          blocker: "GOVERNOR_PROTOCOL_ERROR",
          lastEvidence: artifact,
          updatedAt: new Date().toISOString(),
        };
        await this.ledger.append("STATE", blocked);
        return blocked;
      }

      await this.ledger.append("GOVERNOR_DECISION", decision);

      if (!decision.nextAction) {
        const cleanState = clearTransientFailureState(state);
        state = {
          ...cleanState,
          wave: decision.wave,
          status: decision.decision === "CLOSE_WAVE" ? "CLOSED" : decision.decision,
          canonicalBaseSha: decision.canonicalBaseSha,
          lastDecisionId: decision.decisionId,
          ...(decision.decision === "BLOCK" ? { blocker: "GOVERNOR_BLOCK" } : {}),
          updatedAt: new Date().toISOString(),
        };
        await this.ledger.append("STATE", state);
        if (once || decision.decision === "BLOCK" || decision.decision === "CLOSE_WAVE") return state;
        continue;
      }

      const order = decision.nextAction;
      if (["WRITE", "PUSH"].includes(order.mode) && !decision.writeAuthorized) {
        const blocked = { classification: "WRITE_WITHOUT_GOVERNOR_AUTHORIZATION", order };
        await this.ledger.append("POLICY_BLOCK", blocked);
        return { ...clearTransientFailureState(state), status: "BLOCKED", blocker: blocked.classification };
      }

      const policy = this.policy.evaluate(order);
      if (!policy.allowed) {
        await this.ledger.append("POLICY_BLOCK", { order, policy });
        return { ...clearTransientFailureState(state), status: "BLOCKED", blocker: policy.reason };
      }

      const before = await this.gitGuard.capture(order.repository);
      const result = await this.executor.execute(order);
      const after = await this.gitGuard.capture(order.repository);
      const integrity = this.gitGuard.verify(order, before, after);

      const evidence = {
        decisionId: decision.decisionId,
        actionId: order.actionId,
        decision,
        order,
        before,
        result,
        after,
        integrity,
      };
      const artifact = await this.evidenceStore.write("execution", order.actionId, evidence);
      await this.evidenceStore.appendManifest({ ...artifact, actionId: order.actionId });
      await this.ledger.append("EXECUTION_RESULT", { actionId: order.actionId, artifact, result, integrity });

      if (!integrity.ok) {
        const frozen = {
          ...clearTransientFailureState(state),
          status: "FROZEN",
          blocker: "UNAUTHORIZED_RECOVERY_MUTATION",
          integrityViolations: integrity.violations,
          lastDecisionId: decision.decisionId,
          lastActionId: order.actionId,
          lastEvidence: artifact,
          updatedAt: new Date().toISOString(),
        };
        await this.ledger.append("STATE", frozen);
        return frozen;
      }

      const completed = result.status === "COMPLETED";
      const executionFailure = summarizeExecutionFailure(result);
      state = {
        ...clearTransientFailureState(state),
        wave: decision.wave,
        status: completed ? "EVIDENCE_READY" : "EXECUTION_FAILED",
        canonicalBaseSha: decision.canonicalBaseSha,
        lastDecisionId: decision.decisionId,
        lastActionId: order.actionId,
        lastEvidence: artifact,
        ...(completed ? {} : {
          blocker: executionFailure?.classification ?? "EXECUTION_FAILED",
          executionFailure,
        }),
        updatedAt: new Date().toISOString(),
      };
      await this.ledger.append("STATE", state);

      if (once || !completed) return state;
    }

    const exhausted = { ...clearTransientFailureState(state), status: "BLOCKED", blocker: "MAX_ITERATIONS_EXCEEDED" };
    await this.ledger.append("STATE", exhausted);
    return exhausted;
  }
}
