import { isReadOnlyGitCommand } from "./protocol.mjs";

function withoutFreezeFields(state) {
  const {
    blocker: _blocker,
    integrityViolations: _integrityViolations,
    executionFailure: _executionFailure,
    ...rest
  } = state;
  return rest;
}

function summarizeExecutionFailure(result) {
  if (result?.status !== "FAILED") return null;
  const commands = Array.isArray(result?.commands) ? result.commands : [];
  const failed = [...commands].reverse().find((entry) => entry?.exitCode !== 0 || entry?.timedOut === true) ?? commands.at(-1);
  return {
    classification: result?.failure ?? "EXECUTION_FAILED",
    command: failed?.command,
    exitCode: failed?.exitCode,
    timedOut: failed?.timedOut,
    stderr: typeof failed?.stderr === "string" ? failed.stderr.slice(0, 4000) : failed?.stderr,
  };
}

export function validateFalsePositiveFreezeEvidence(state, evidence) {
  const failures = [];

  if (state?.status !== "FROZEN" || state?.blocker !== "UNAUTHORIZED_RECOVERY_MUTATION") {
    failures.push("STATE_IS_NOT_UNAUTHORIZED_MUTATION_FREEZE");
  }
  if (!evidence || typeof evidence !== "object") failures.push("EVIDENCE_OBJECT_REQUIRED");
  if (evidence?.actionId !== state?.lastActionId) failures.push("ACTION_ID_MISMATCH");
  if (evidence?.decisionId !== state?.lastDecisionId) failures.push("DECISION_ID_MISMATCH");
  if (evidence?.order?.mode !== "VERIFY") failures.push("FALSE_POSITIVE_RECONCILIATION_REQUIRES_VERIFY_MODE");
  if (evidence?.decision?.writeAuthorized !== false) failures.push("WRITE_AUTHORIZATION_PRESENT");

  const resultStatus = evidence?.result?.status;
  if (!["COMPLETED", "FAILED"].includes(resultStatus)) failures.push("EXECUTION_STATUS_UNSUPPORTED");

  const commands = Array.isArray(evidence?.order?.commands) ? evidence.order.commands : [];
  if (commands.length === 0 || !commands.every(isReadOnlyGitCommand)) {
    failures.push("NON_READ_ONLY_GIT_COMMAND_PRESENT");
  }

  if (evidence?.before?.head !== evidence?.after?.head) failures.push("HEAD_CHANGED");
  if (evidence?.before?.branch !== evidence?.after?.branch) failures.push("BRANCH_CHANGED");
  if (evidence?.before?.statusRaw !== evidence?.after?.statusRaw) failures.push("PORCELAIN_STATUS_CHANGED");

  const violations = Array.isArray(evidence?.integrity?.violations) ? evidence.integrity.violations : [];
  if (violations.length === 0 || !violations.every((item) => /^OUT_OF_SCOPE_PATH\s+/.test(String(item)))) {
    failures.push("VIOLATIONS_ARE_NOT_PURE_PREEXISTING_SCOPE_FLAGS");
  }

  return {
    ok: failures.length === 0,
    failures,
    executionStatus: resultStatus,
    executionFailure: summarizeExecutionFailure(evidence?.result),
    classification: failures.length === 0
      ? (resultStatus === "FAILED"
          ? "CONTROL_PLANE_GUARD_FALSE_POSITIVE_WITH_EXECUTION_FAILURE"
          : "CONTROL_PLANE_GUARD_FALSE_POSITIVE")
      : "FREEZE_RECONCILIATION_REJECTED",
  };
}

export async function reconcileFalsePositiveFreeze({
  state,
  evidenceStore,
  ledger,
  expectedSha256,
}) {
  if (!expectedSha256) throw new Error("RECOVERY_RECONCILE_FREEZE_SHA256_REQUIRED");
  if (expectedSha256 !== state?.lastEvidence?.sha256) {
    throw new Error(`RECOVERY_RECONCILE_FREEZE_SHA256_MISMATCH: expected current freeze evidence ${state?.lastEvidence?.sha256 ?? "UNKNOWN"}`);
  }

  const evidence = await evidenceStore.readVerified(state.lastEvidence);
  const validation = validateFalsePositiveFreezeEvidence(state, evidence);
  if (!validation.ok) {
    throw new Error(`FREEZE_RECONCILIATION_REJECTED: ${validation.failures.join(", ")}`);
  }

  const reconciliation = {
    classification: validation.classification,
    frozenDecisionId: state.lastDecisionId,
    frozenActionId: state.lastActionId,
    evidence: state.lastEvidence,
    executionStatus: validation.executionStatus,
    executionFailure: validation.executionFailure,
    reason: validation.executionStatus === "FAILED"
      ? "VERIFY-mode action contained only read-only Git commands and HEAD, branch, and porcelain status were byte-identical before and after. OUT_OF_SCOPE_PATH flags therefore described pre-existing dirty evidence, not executor mutations. The independent executor command failure is preserved and remains unresolved."
      : "VERIFY-mode action contained only read-only Git commands; HEAD, branch, and porcelain status were byte-identical before and after. OUT_OF_SCOPE_PATH flags therefore described pre-existing dirty evidence rather than executor mutations.",
    reconciledAt: new Date().toISOString(),
  };

  await ledger.append("FREEZE_RECONCILIATION", reconciliation);

  const executionFailed = validation.executionStatus === "FAILED";
  const reconciledState = {
    ...withoutFreezeFields(state),
    status: executionFailed ? "EXECUTION_FAILED" : "EVIDENCE_READY",
    freezeReconciliation: reconciliation,
    ...(executionFailed ? {
      blocker: validation.executionFailure?.classification ?? "EXECUTION_FAILED",
      executionFailure: validation.executionFailure,
    } : {}),
    updatedAt: new Date().toISOString(),
  };
  await ledger.append("STATE", reconciledState);
  return reconciledState;
}
