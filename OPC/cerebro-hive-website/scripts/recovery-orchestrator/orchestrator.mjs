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
    transientControlPlaneFailureOmitted: _transientControlPlaneFailureOmitted,
    unverifiedClosureReopened: _unverifiedClosureReopened,
    recoverableEvidenceMiss: _recoverableEvidenceMiss,
    ...rest
  } = state;
  return rest;
}

function normalizeArg(value) {
  return String(value ?? "").toLowerCase().replace(/\\/g, "/");
}

function executableName(command) {
  return normalizeArg(command?.exe).split("/").pop();
}

export function commandFingerprint(command) {
  const exe = executableName(command);
  const args = Array.isArray(command?.args) ? command.args.map(normalizeArg) : [];
  const cwd = normalizeArg(command?.cwd ?? "");
  return `${exe}|${args.join("\u001f")}|${cwd}`;
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

function parseMissingImmutablePath({ command, exitCode, timedOut, stderr } = {}) {
  if (executableName(command) !== "git") return null;
  if (normalizeArg(command?.args?.[0]) !== "show") return null;
  if (exitCode !== 128 || timedOut === true) return null;
  const match = String(stderr ?? "").match(/fatal: path '([^']+)' does not exist in '([^']+)'/i);
  if (!match) return null;
  return {
    classification: "IMMUTABLE_PATH_ABSENT",
    path: match[1],
    ref: match[2],
    command,
  };
}

function recoverableEvidenceMissFromState(state) {
  if (state?.status !== "EXECUTION_FAILED") return null;
  return parseMissingImmutablePath({
    command: state.executionFailure?.command,
    exitCode: state.executionFailure?.exitCode,
    timedOut: state.executionFailure?.timedOut,
    stderr: state.executionFailure?.stderr,
  });
}

function recoverableEvidenceMissFromResult(result) {
  if (result?.status === "COMPLETED") return null;
  const entries = Array.isArray(result?.commands) ? result.commands : [];
  const failed = entries.length ? entries.at(-1) : null;
  return parseMissingImmutablePath(failed);
}

export function sanitizeStateForGovernor(state) {
  let clean = state;
  let transientControlPlaneFailureOmitted = false;
  let unverifiedClosureReopened = false;
  let recoverableEvidenceMiss = null;

  if (stateHasTransientControlPlaneFailure(clean)) {
    clean = clearTransientFailureState(clean);
    clean = {
      ...clean,
      status: clean.lastActionId ? "EVIDENCE_READY" : "ACTIVE",
    };
    transientControlPlaneFailureOmitted = true;
  }

  // A failed immutable `git show <ref>:<path>` that proves the path does not
  // exist is evidence, not a terminal executor defect. Reopen so the governor
  // can inspect the candidate recovery ref without repeating the failed probe.
  recoverableEvidenceMiss = recoverableEvidenceMissFromState(clean);
  if (recoverableEvidenceMiss) {
    clean = {
      ...clearTransientFailureState(clean),
      status: clean.lastActionId ? "EVIDENCE_READY" : "ACTIVE",
      recoverableEvidenceMiss,
    };
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

  if (!transientControlPlaneFailureOmitted && !unverifiedClosureReopened && !recoverableEvidenceMiss) return clean;
  return {
    ...clean,
    ...(transientControlPlaneFailureOmitted ? { transientControlPlaneFailureOmitted: true } : {}),
    ...(unverifiedClosureReopened ? { unverifiedClosureReopened: true } : {}),
    ...(recoverableEvidenceMiss ? { recoverableEvidenceMiss } : {}),
  };
}

function recordIsTransientControlPlaneDiagnostic(record) {
  if (!record || typeof record !== "object") return false;
  if (["GOVERNOR_ERROR", "GOVERNOR_REPLAN"].includes(record.type)) return true;

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

function executionEntries(records) {
  const entries = [];
  for (const record of records) {
    if (record?.type !== "EXECUTION_RESULT") continue;
    if (record.payload?.integrity?.ok === false) continue;
    for (const entry of record.payload?.result?.commands ?? []) {
      if (entry?.command) entries.push(entry);
    }
  }
  return entries;
}

function successfulEvidenceCommands(records) {
  return executionEntries(records)
    .filter((entry) => entry.exitCode === 0 && entry.timedOut !== true)
    .map((entry) => entry.command);
}

function commandHasArgs(command, expected) {
  if (executableName(command) !== "git") return false;
  const args = Array.isArray(command?.args) ? command.args.map(normalizeArg) : [];
  const normalizedExpected = expected.map(normalizeArg);
  return args.length === normalizedExpected.length && args.every((arg, index) => arg === normalizedExpected[index]);
}

function missingPathEvidence(records, ref, repoPath) {
  const normalizedRef = normalizeArg(ref);
  const normalizedPath = normalizeArg(repoPath);
  for (const entry of executionEntries(records)) {
    const miss = parseMissingImmutablePath(entry);
    if (!miss) continue;
    if (normalizeArg(miss.ref) === normalizedRef && normalizeArg(miss.path) === normalizedPath) {
      return miss;
    }
  }
  return null;
}

const W02_OBJECTIVES = [
  {
    id: "REPOSITORY_STATUS_CAPTURED",
    description: "Capture the target checkout porcelain state without mutation.",
  },
  {
    id: "REPOSITORY_IDENTITY_RECONCILED",
    description: "Capture target HEAD, current branch, and local origin/main ref so the checkout can be reconciled to the canonical base.",
  },
  {
    id: "WORKSPACE_DEFINITION_CAPTURED",
    description: "Read pnpm-workspace.yaml from the immutable canonical base SHA.",
  },
  {
    id: "ROOT_CONTROL_PLANE_CAPTURED",
    description: "Read the root package.json from the immutable canonical base SHA so the root control plane is counted separately from child workspaces.",
  },
  {
    id: "CONTRACT_AUDIT_SOURCE_CAPTURED",
    description: "Reconcile the workspace-contract audit implementation across the canonical base and the immutable PR #42 candidate ref.",
  },
  {
    id: "EXEMPTION_POLICY_CAPTURED",
    description: "Reconcile the workspace-contract exemptions source across the canonical base and the immutable PR #42 candidate ref, including baseline absence when applicable.",
  },
  {
    id: "GITHUB_WORKFLOW_SOURCE_CAPTURED",
    description: "Reconcile the GitHub-visible Website CI workflow across the canonical base and the immutable PR #42 candidate ref.",
  },
  {
    id: "WORKSPACE_DENOMINATOR_PROVEN",
    description: "Prove the canonical child-workspace denominator plus root control plane from immutable refs; do not recursively count arbitrary package.json files.",
  },
  {
    id: "PR42_TRUE_DELTA_RECONCILED",
    description: "Reconcile current main versus PR #42 head and preserved local recovery work without merging or overwriting unique work.",
  },
  {
    id: "CONTRACT_MATRIX_VERIFIED",
    description: "Run or reproduce the canonical fail-closed build/typecheck/lint/test contract matrix on an immutable/external snapshot.",
  },
  {
    id: "NEGATIVE_CONTROLS_VERIFIED",
    description: "Prove representative missing/no-op/false-green contracts fail and propagate to the final gate.",
  },
  {
    id: "SCHEMA_CONFIG_VALIDATION_VERIFIED",
    description: "Prove schema/config validation has both positive and deliberate-negative evidence.",
  },
  {
    id: "GITHUB_VISIBLE_JOBS_VERIFIED",
    description: "Verify required GitHub-visible job names and final-gate dependency/failure propagation.",
  },
  {
    id: "GITHUB_ACTIONS_RUN_VERIFIED",
    description: "Verify an actual GitHub Actions run demonstrates the required fail-closed behavior before W0.2 closure can be proposed.",
  },
];

export function buildEvidenceProgress(records, state) {
  const successful = successfulEvidenceCommands(records);
  const successfulFingerprints = [...new Set(successful.map(commandFingerprint))];
  const baseSha = state?.canonicalBaseSha;
  const pr42HeadSha = state?.pr42HeadSha;
  const knownMissing = executionEntries(records)
    .map((entry) => ({ entry, miss: parseMissingImmutablePath(entry) }))
    .filter(({ miss }) => Boolean(miss));
  const knownMissingFingerprints = [...new Set(knownMissing.map(({ entry }) => commandFingerprint(entry.command)))];

  const completed = new Set();
  const evidenceNotes = [];

  if (successful.some((command) => commandHasArgs(command, ["status", "--porcelain=v1"]))) {
    completed.add("REPOSITORY_STATUS_CAPTURED");
  }

  const hasHead = successful.some((command) => commandHasArgs(command, ["rev-parse", "HEAD"]));
  const hasBranch = successful.some((command) => commandHasArgs(command, ["branch", "--show-current"]));
  const hasOriginMain = successful.some((command) => commandHasArgs(command, ["rev-parse", "refs/remotes/origin/main"]));
  if (hasHead && hasBranch && hasOriginMain) completed.add("REPOSITORY_IDENTITY_RECONCILED");

  function immutableSourceStatus(repoPath) {
    if (!baseSha) return { captured: false, baseAbsent: false, sourceRef: null };
    const baseSpec = `${baseSha}:${repoPath}`;
    const baseCaptured = successful.some((command) => commandHasArgs(command, ["show", baseSpec]));
    const baseAbsent = Boolean(missingPathEvidence(records, baseSha, repoPath));
    const candidateSpec = pr42HeadSha ? `${pr42HeadSha}:${repoPath}` : null;
    const candidateCaptured = Boolean(candidateSpec) && successful.some((command) => commandHasArgs(command, ["show", candidateSpec]));

    if (baseAbsent) {
      evidenceNotes.push(`${repoPath} is absent at canonical base ${baseSha}; candidate-ref evidence is required before treating the source as captured.`);
    }

    return {
      captured: baseCaptured || (baseAbsent && candidateCaptured),
      baseAbsent,
      sourceRef: baseCaptured ? baseSha : (candidateCaptured ? pr42HeadSha : null),
    };
  }

  if (baseSha) {
    if (successful.some((command) => commandHasArgs(command, ["show", `${baseSha}:OPC/cerebro-hive-website/pnpm-workspace.yaml`]))) {
      completed.add("WORKSPACE_DEFINITION_CAPTURED");
    }
    if (successful.some((command) => commandHasArgs(command, ["show", `${baseSha}:OPC/cerebro-hive-website/package.json`]))) {
      completed.add("ROOT_CONTROL_PLANE_CAPTURED");
    }

    const auditStatus = immutableSourceStatus("OPC/cerebro-hive-website/scripts/audit-workspace-contracts.mjs");
    if (auditStatus.captured) completed.add("CONTRACT_AUDIT_SOURCE_CAPTURED");

    const exemptionStatus = immutableSourceStatus("OPC/cerebro-hive-website/scripts/workspace-contract-exemptions.yaml");
    if (exemptionStatus.captured) completed.add("EXEMPTION_POLICY_CAPTURED");

    const workflowStatus = immutableSourceStatus(".github/workflows/website-ci.yml");
    if (workflowStatus.captured) completed.add("GITHUB_WORKFLOW_SOURCE_CAPTURED");
  }

  const objectives = W02_OBJECTIVES.map((objective) => ({
    ...objective,
    status: completed.has(objective.id) ? "EVIDENCED" : "OUTSTANDING",
  }));
  const outstanding = objectives.filter((objective) => objective.status === "OUTSTANDING");

  function recommendedSourceCommand(repoPath) {
    if (!baseSha) return [];
    const baseAbsent = Boolean(missingPathEvidence(records, baseSha, repoPath));
    if (baseAbsent) {
      if (!pr42HeadSha) return [];
      return [{ exe: "git", args: ["show", `${pr42HeadSha}:${repoPath}`] }];
    }
    return [{ exe: "git", args: ["show", `${baseSha}:${repoPath}`] }];
  }

  let recommendedCommands = [];
  const next = outstanding[0]?.id;
  if (next === "REPOSITORY_IDENTITY_RECONCILED") {
    recommendedCommands = [
      { exe: "git", args: ["rev-parse", "HEAD"] },
      { exe: "git", args: ["branch", "--show-current"] },
      { exe: "git", args: ["rev-parse", "refs/remotes/origin/main"] },
    ].filter((command) => !successfulFingerprints.includes(commandFingerprint(command)));
  } else if (next === "WORKSPACE_DEFINITION_CAPTURED" && baseSha) {
    recommendedCommands = [{ exe: "git", args: ["show", `${baseSha}:OPC/cerebro-hive-website/pnpm-workspace.yaml`] }];
  } else if (next === "ROOT_CONTROL_PLANE_CAPTURED" && baseSha) {
    recommendedCommands = [{ exe: "git", args: ["show", `${baseSha}:OPC/cerebro-hive-website/package.json`] }];
  } else if (next === "CONTRACT_AUDIT_SOURCE_CAPTURED") {
    recommendedCommands = recommendedSourceCommand("OPC/cerebro-hive-website/scripts/audit-workspace-contracts.mjs");
  } else if (next === "EXEMPTION_POLICY_CAPTURED") {
    recommendedCommands = recommendedSourceCommand("OPC/cerebro-hive-website/scripts/workspace-contract-exemptions.yaml");
  } else if (next === "GITHUB_WORKFLOW_SOURCE_CAPTURED") {
    recommendedCommands = recommendedSourceCommand(".github/workflows/website-ci.yml");
  }

  return {
    wave: state?.wave,
    objectives,
    completed: objectives.filter((objective) => objective.status === "EVIDENCED").map((objective) => objective.id),
    outstanding: outstanding.map((objective) => objective.id),
    nextObjective: outstanding[0] ?? null,
    recommendedCommands,
    evidenceNotes,
    candidateRefs: {
      canonicalBaseSha: baseSha ?? null,
      pr42HeadSha: pr42HeadSha ?? null,
    },
    recentSuccessfulCommandFingerprints: successfulFingerprints.slice(-50),
    knownMissingCommandFingerprints: knownMissingFingerprints.slice(-50),
    rule: "Every evidence action must advance at least one outstanding W0.2 objective. Exact successful commands and immutable-path probes already proven missing must not be repeated unless the inspected ref changed.",
  };
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
const UNSUPPORTED_AGGREGATE_FACT_PATTERN = /(all evidence.*(consistent|valid|complete)|all .*criteria.*(met|satisfied)|no conflicts|no unknowns|everything .*verified)/i;

export function validateDecisionAgainstState(decision, state, history, evidenceProgress = buildEvidenceProgress(history, state)) {
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

  if (evidenceProgress.outstanding.length > 0) {
    const unsupported = decision.verifiedFacts.find((fact) => UNSUPPORTED_AGGREGATE_FACT_PATTERN.test(fact));
    if (unsupported) {
      throw new Error(`UNSUPPORTED_AGGREGATE_EVIDENCE_CLAIM: ${unsupported}`);
    }
  }

  if (["COLLECT_EVIDENCE", "VERIFY"].includes(decision.decision) && decision.nextAction) {
    const prior = new Set([
      ...evidenceProgress.recentSuccessfulCommandFingerprints,
      ...(evidenceProgress.knownMissingCommandFingerprints ?? []),
    ]);
    const proposed = decision.nextAction.commands.map(commandFingerprint);
    if (proposed.length > 0 && proposed.every((fingerprint) => prior.has(fingerprint))) {
      throw new Error(`NON_ADVANCING_EVIDENCE_ACTION: all proposed commands already completed successfully or proved an immutable path missing: ${proposed.join(", ")}`);
    }
  }
}

function retryablePlanningError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return /^(NON_ADVANCING_EVIDENCE_ACTION|UNSUPPORTED_AGGREGATE_EVIDENCE_CLAIM):/.test(message);
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
    const persistedState = await this.ledger.latestState(this.initialState);
    let state = { ...this.initialState, ...persistedState };

    for (let iteration = 0; iteration < this.maxIterations; iteration += 1) {
      const fullHistory = await this.ledger.readAll();
      const history = buildGovernorHistory(fullHistory, 20);
      const governorState = sanitizeStateForGovernor(state);
      const ids = usedIds(fullHistory);
      const evidenceProgress = buildEvidenceProgress(fullHistory, governorState);
      let decision;
      let planningFeedback = null;

      try {
        for (let planningAttempt = 0; planningAttempt < 3; planningAttempt += 1) {
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
                rule: "Treat only target-repository execution evidence as candidate repository facts. Control-plane transport/protocol failures are diagnostics, not portfolio facts. An immutable path absence is evidence about the inspected ref, not a repository execution defect. CLOSE_WAVE is only a proposal in v0.1 and cannot itself close a wave.",
              },
              closurePolicy: {
                proposalAllowed: this.allowClosureProposal,
                rule: this.allowClosureProposal
                  ? "A CLOSE_WAVE proposal may be emitted, but the orchestrator still requires human approval."
                  : "CLOSE_WAVE is disabled. Continue COLLECT_EVIDENCE or VERIFY until a human explicitly enables closure proposals after reviewing acceptance evidence.",
              },
              evidenceProgress,
              planningFeedback,
              usedDecisionIds: ids.decisionIds.slice(-50),
              usedActionIds: ids.actionIds.slice(-50),
            }));
            validateDecisionAgainstState(decision, governorState, fullHistory, evidenceProgress);
            break;
          } catch (error) {
            if (!retryablePlanningError(error) || planningAttempt === 2) throw error;
            planningFeedback = {
              rejectedPlan: error.message,
              instruction: "Replan the same decisionId. Remove unsupported aggregate claims and choose a different bounded READ_ONLY/VERIFY action that advances the next outstanding W0.2 evidence objective. Do not repeat a successful or known-missing command fingerprint. Prefer recommendedCommands when supplied.",
              nextObjective: evidenceProgress.nextObjective,
              recommendedCommands: evidenceProgress.recommendedCommands,
            };
            await this.ledger.append("GOVERNOR_REPLAN", {
              iteration,
              planningAttempt: planningAttempt + 1,
              reason: error.message,
              nextObjective: evidenceProgress.nextObjective,
            });
          }
        }
      } catch (error) {
        const failure = {
          classification: "GOVERNOR_PROTOCOL_ERROR",
          iteration,
          state: governorState,
          evidenceProgress,
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
        evidenceProgressBefore: evidenceProgress,
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
      const recoverableEvidenceMiss = recoverableEvidenceMissFromResult(result);
      const evidenceReady = completed || Boolean(recoverableEvidenceMiss);
      state = {
        ...clearTransientFailureState(state),
        wave: decision.wave,
        status: evidenceReady ? "EVIDENCE_READY" : "EXECUTION_FAILED",
        canonicalBaseSha: decision.canonicalBaseSha,
        lastDecisionId: decision.decisionId,
        lastActionId: order.actionId,
        lastEvidence: artifact,
        ...(recoverableEvidenceMiss ? { recoverableEvidenceMiss } : {}),
        ...(!evidenceReady ? {
          blocker: executionFailure?.classification ?? "EXECUTION_FAILED",
          executionFailure,
        } : {}),
        updatedAt: new Date().toISOString(),
      };
      await this.ledger.append("STATE", state);

      if (once || !evidenceReady) return state;
    }

    const exhausted = { ...clearTransientFailureState(state), status: "BLOCKED", blocker: "MAX_ITERATIONS_EXCEEDED" };
    await this.ledger.append("STATE", exhausted);
    return exhausted;
  }
}
