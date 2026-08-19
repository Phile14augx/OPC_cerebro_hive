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
    closureProposal: _closureProposal,
    ...rest
  } = state;
  return rest;
}

function normalizeArg(value) {
  return String(value ?? "").toLowerCase().replace(/\\/g, "/");
}

function isRecoveryControlPlaneCommand(command) {
  if (!command || typeof command !== "object") return false;
  const args = Array.isArray(command.args) ? command.args : [];
  return args.some((arg) => normalizeArg(arg).includes("/scripts/recovery-orchestrator/"));
}

function stateHasTransientControlPlaneFailure(state) {
  if (!state || typeof state !== "object") return false;
  if (state.blocker === "GOVERNOR_PROTOCOL_ERROR") return true;
  return isRecoveryControlPlaneCommand(state.executionFailure?.command);
}

function stateHasUnapprovedClosureBlock(state) {
  return state?.status === "BLOCKED" && state?.blocker === "WAVE_CLOSURE_REQUIRES_HUMAN_APPROVAL";
}

export function sanitizeStateForGovernor(state) {
  let clean = state;
  let transientControlPlaneFailureOmitted = false;
  let unverifiedClosureReopened = false;

  if (stateHasTransientControlPlaneFailure(clean)) {
    clean = clearTransientFailureState(clean);
    clean = {
      ...clean,
      status: clean.lastActionId ? "EVIDENCE_READY" : "ACTIVE",
    };
    transientControlPlaneFailureOmitted = true;
  }

  // v0.1 has no authenticated closure-approval artifact. Therefore a prior
  // CLOSED state or unapproved closure proposal is reopened for more evidence.
  if (clean.status === "CLOSED" || stateHasUnapprovedClosureBlock(clean)) {
    clean = {
      ...clearTransientFailureState(clean),
      status: clean.lastActionId ? "EVIDENCE_READY" : "ACTIVE",
    };
    unverifiedClosureReopened = true;
  }

  if (!transientControlPlaneFailureOmitted && !unverifiedClosureReopened) return clean;
  return {
    ...clean,
    ...(transientControlPlaneFailureOmitted ? { transientControlPlaneFailureOmitted: true } : {}),
    ...(unverifiedClosureReopened ? { unverifiedClosureReopened: true } : {}),
  };
}

function recordIsTransientControlPlaneDiagnostic(record) {
  if (!record || typeof record !== "object") return false;
  if (record.type === "GOVERNOR_ERROR") return true;

  if (record.type === "STATE" && stateHasTransientControlPlaneFailure(record.payload)) {
    return true;
  }

  if (record.type === "EXECUTION_RESULT") {
    const commands = record.payload?.result?.commands;
    return Array.isArray(commands) && commands.some((entry) => isRecoveryControlPlaneCommand(entry?.command));
  }

  return false;
}

export function buildGovernorHistory(records, limit = 20) {
  return records
    .filter((record) => !recordIsTransientControlPlaneDiagnostic(record))
    .slice(-limit);
}

function usedIds(history) {
  const decisionIds = [];
  const actionIds = [];
  for (const record of history) {
    if (record?.type === "GOVERNOR_DECISION") {
      if (typeof record.payload?.decisionId === "string") decisionIds.push(record.payload.decisionId);
      if (typeof record.payload?.nextAction?.actionId === "string") actionIds.push(record.payload.nextAction.actionId);
    }
  }
  return { decisionIds, actionIds };
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

const TRANSIENT_FACT_PATTERN = /(aborterror|governor[_ ]protocol[_ ]error|governor protocol error|recovery orchestrator.*blocked|orchestrator transport|malformed governor output)/i;

function validateDecisionAgainstState(decision, state, history) {
  const ids = usedIds(history);
  if (ids.decisionIds.includes(decision.decisionId)) {
    throw new Error(`DUPLICATE_DECISION_ID: ${decision.decisionId}`);
  }
  if (decision.nextAction && ids.actionIds.includes(decision.nextAction.actionId)) {
    throw new Error(`DUPLICATE_ACTION_ID: ${decision.nextAction.actionId}`);
  }
  if (decision.nextAction && normalizeFsPath(decision.nextAction.repository) !== normalizeFsPath(state.repository)) {
    throw new Error(`EXECUTION_TARGET_MISMATCH: expected ${state.repository}, got ${decision.nextAction.repository}`);
  }
  const leaked = decision.verifiedFacts.find((fact) => TRANSIENT_FACT_PATTERN.test(fact));
  if (leaked) {
    throw new Error(`TRANSIENT_CONTROL_PLANE_FACT_LEAK: ${leaked}`);
  }
}

export function closureRequiresHumanApproval(decision) {
  return decision?.decision === "CLOSE_WAVE";
}

export class RecoveryOrchestrator {
  constructor({ governor, executor, policy, gitGuard, evidenceStore, ledger, initialState, maxIterations = 50, allowClosureProposal = false }) {
    this.governor = governor;
    this.executor = executor;
    this.policy = policy;
    this.gitGuard = gitGuard;
    this.evidenceStore = evidenceStore;
    this.ledger = ledger;
    this.initialState = initialState;
    this.maxIterations = maxIterations;
    this.allowClosureProposal = allowClosureProposal;
  }

  async run({ once = false } = {}) {
    let state = await this.ledger.latestState(this.initialState);

    for (let iteration = 0; iteration < this.maxIterations; iteration += 1) {
      const fullHistory = await this.ledger.readAll();
      const history = buildGovernorHistory(fullHistory, 20);
      const governorState = sanitizeStateForGovernor(state);
      const ids = usedIds(fullHistory);
      let decision;
      try {
        decision = validateGovernorDecision(await this.governor.decide({
          state: governorState,
          history,
          historyPolicy: {
            transientControlPlaneDiagnosticsOmitted: true,
            unverifiedClosedStateReopened: governorState.unverifiedClosureReopened === true,
            excludedClasses: [
              "GOVERNOR_PROTOCOL_ERROR",
              "AbortError",
              "recursive recovery-orchestrator execution",
              "unapproved wave closure",
            ],
            rule: "Treat only target-repository execution evidence as candidate repository facts. Control-plane transport/protocol failures are diagnostics, not portfolio facts. CLOSE_WAVE is only a proposal in v0.1 and cannot itself close a wave.",
          },
          closurePolicy: {
            proposalAllowed: this.allowClosureProposal,
            rule: this.allowClosureProposal
              ? "A CLOSE_WAVE proposal may be emitted, but the orchestrator still requires human approval."
              : "CLOSE_WAVE is disabled. Continue COLLECT_EVIDENCE or VERIFY until a human explicitly enables closure proposals after reviewing acceptance evidence.",
          },
          usedDecisionIds: ids.decisionIds.slice(-50),
          usedActionIds: ids.actionIds.slice(-50),
        }));
        validateDecisionAgainstState(decision, governorState, fullHistory);
      } catch (error) {
        const failure = {
          classification: "GOVERNOR_PROTOCOL_ERROR",
          iteration,
          state: governorState,
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

      if (closureRequiresHumanApproval(decision)) {
        const blocked = {
          ...clearTransientFailureState(governorState),
          wave: decision.wave,
          status: "BLOCKED",
          blocker: "WAVE_CLOSURE_REQUIRES_HUMAN_APPROVAL",
          canonicalBaseSha: decision.canonicalBaseSha,
          lastDecisionId: decision.decisionId,
          closureProposal: {
            verifiedFacts: decision.verifiedFacts,
            conflicts: decision.conflicts,
            unknowns: decision.unknowns,
          },
          updatedAt: new Date().toISOString(),
        };
        await this.ledger.append("CLOSURE_PROPOSAL", {
          wave: decision.wave,
          decisionId: decision.decisionId,
          canonicalBaseSha: decision.canonicalBaseSha,
          verifiedFacts: decision.verifiedFacts,
          conflicts: decision.conflicts,
          unknowns: decision.unknowns,
        });
        await this.ledger.append("STATE", blocked);
        return blocked;
      }

      if (!decision.nextAction) {
        const cleanState = clearTransientFailureState(state);
        state = {
          ...cleanState,
          wave: decision.wave,
          status: decision.decision,
          canonicalBaseSha: decision.canonicalBaseSha,
          lastDecisionId: decision.decisionId,
          ...(decision.decision === "BLOCK" ? { blocker: "GOVERNOR_BLOCK" } : {}),
          updatedAt: new Date().toISOString(),
        };
        await this.ledger.append("STATE", state);
        if (once || decision.decision === "BLOCK") return state;
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
