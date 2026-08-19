import test from "node:test";
import assert from "node:assert/strict";
import { RecoveryPolicyEngine, pathAllowed } from "./policy.mjs";
import { validateExecutionOrder, validateGovernorDecision } from "./protocol.mjs";
import { GitGuard } from "./git-guard.mjs";
import {
  buildEvidenceProgress,
  buildGovernorHistory,
  closureRequiresHumanApproval,
  commandFingerprint,
  sanitizeStateForGovernor,
  validateDecisionAgainstState,
} from "./orchestrator.mjs";

const baseOrder = {
  actionId: "A1",
  mode: "READ_ONLY",
  repository: "D:/repo",
  commands: [{ exe: "git", args: ["status", "--porcelain=v1"] }],
  allowedPaths: [],
  forbiddenPaths: [],
  acceptanceCriteria: [],
  stopConditions: [],
};

const baseDecision = {
  decisionId: "D1",
  wave: "W0.2",
  decision: "COLLECT_EVIDENCE",
  canonicalBaseSha: "abc",
  verifiedFacts: [],
  conflicts: [],
  unknowns: [],
  writeAuthorized: false,
  nextAction: { ...baseOrder },
};

function completedExecution(command = baseOrder.commands[0]) {
  return {
    type: "EXECUTION_RESULT",
    payload: {
      result: {
        status: "COMPLETED",
        commands: [{ command, exitCode: 0, timedOut: false }],
      },
      integrity: { ok: true },
    },
  };
}

test("protocol accepts structured read-only order", () => {
  assert.equal(validateExecutionOrder({ ...baseOrder }).actionId, "A1");
});

test("protocol rejects shell-string commands", () => {
  assert.throws(() => validateExecutionOrder({ ...baseOrder, commands: ["git status"] }), /must be an object/);
});

test("policy rejects git reset even for write mode", () => {
  const policy = new RecoveryPolicyEngine();
  const result = policy.evaluate({ ...baseOrder, mode: "WRITE", commands: [{ exe: "git", args: ["reset", "--hard"] }] });
  assert.equal(result.allowed, false);
  assert.match(result.reason, /PROHIBITED_COMMAND/);
});

test("policy rejects commits in v0.1 so path scope cannot be bypassed", () => {
  const policy = new RecoveryPolicyEngine();
  const result = policy.evaluate({ ...baseOrder, mode: "WRITE", commands: [{ exe: "git", args: ["commit", "-m", "x"] }] });
  assert.equal(result.allowed, false);
  assert.match(result.reason, /PROHIBITED_COMMAND/);
});

test("policy rejects git commit in read-only mode", () => {
  const policy = new RecoveryPolicyEngine();
  const result = policy.evaluate({ ...baseOrder, commands: [{ exe: "git", args: ["commit", "-m", "x"] }] });
  assert.equal(result.allowed, false);
});

test("policy blocks recursive recovery orchestrator invocation", () => {
  const policy = new RecoveryPolicyEngine();
  const result = policy.evaluate({
    ...baseOrder,
    commands: [{
      exe: "node",
      args: ["D:\\CEREBRO_RECOVERY_RUNNER\\OPC\\cerebro-hive-website\\scripts\\recovery-orchestrator\\cli.mjs", "diagnose", "W0.2"],
    }],
  });
  assert.equal(result.allowed, false);
  assert.match(result.reason, /CONTROL_PLANE_REENTRY_BLOCKED/);
});

test("path scope is prefix-bounded", () => {
  assert.equal(pathAllowed("scripts/recovery-orchestrator/a.mjs", ["scripts/recovery-orchestrator"], []), true);
  assert.equal(pathAllowed("package.json", ["scripts/recovery-orchestrator"], []), false);
});

test("governor decision requires write authorization boolean", () => {
  assert.throws(() => validateGovernorDecision({
    decisionId: "D1",
    wave: "W0.2",
    decision: "VERIFY",
    canonicalBaseSha: "abc",
    verifiedFacts: [],
    conflicts: [],
    unknowns: [],
    nextAction: { ...baseOrder, mode: "VERIFY" },
  }), /writeAuthorized/);
});

test("governor BLOCK decision cannot carry an executor action", () => {
  assert.throws(() => validateGovernorDecision({
    ...baseDecision,
    decision: "BLOCK",
    nextAction: { ...baseOrder },
  }), /BLOCK decisions must set nextAction to null/);
});

test("read-only evidence decision cannot authorize writes", () => {
  assert.throws(() => validateGovernorDecision({
    ...baseDecision,
    writeAuthorized: true,
  }), /COLLECT_EVIDENCE cannot set writeAuthorized=true/);
});

test("governor BLOCK decision with null action is valid", () => {
  const result = validateGovernorDecision({
    ...baseDecision,
    decision: "BLOCK",
    writeAuthorized: false,
    nextAction: null,
  });
  assert.equal(result.decision, "BLOCK");
});

test("governor history omits protocol errors and recursive control-plane executions", () => {
  const records = [
    { type: "GOVERNOR_ERROR", payload: { error: { message: "AbortError" } } },
    { type: "GOVERNOR_REPLAN", payload: { reason: "NON_ADVANCING_EVIDENCE_ACTION" } },
    { type: "STATE", payload: { status: "BLOCKED", blocker: "GOVERNOR_PROTOCOL_ERROR" } },
    {
      type: "EXECUTION_RESULT",
      payload: {
        result: {
          commands: [{ command: { exe: "node", args: ["D:/runner/scripts/recovery-orchestrator/cli.mjs"] } }],
        },
      },
    },
    completedExecution(),
  ];
  const history = buildGovernorHistory(records);
  assert.equal(history.length, 1);
  assert.equal(history[0].type, "EXECUTION_RESULT");
  assert.equal(history[0].payload.result.commands[0].command.exe, "git");
});

test("transient blocked state is normalized before governor sees it", () => {
  const state = sanitizeStateForGovernor({
    status: "BLOCKED",
    blocker: "GOVERNOR_PROTOCOL_ERROR",
    lastActionId: "A1",
    repository: "D:/repo",
  });
  assert.equal(state.status, "EVIDENCE_READY");
  assert.equal(state.blocker, undefined);
  assert.equal(state.transientControlPlaneFailureOmitted, true);
});

test("unverified CLOSED state is reopened before governor sees it", () => {
  const state = sanitizeStateForGovernor({
    status: "CLOSED",
    lastActionId: "A1",
    repository: "D:/repo",
  });
  assert.equal(state.status, "EVIDENCE_READY");
  assert.equal(state.unverifiedClosureReopened, true);
});

test("unapproved closure proposal block is reopened for evidence collection", () => {
  const state = sanitizeStateForGovernor({
    status: "BLOCKED",
    blocker: "WAVE_CLOSURE_REQUIRES_HUMAN_APPROVAL",
    closureProposal: { verifiedFacts: ["unsupported closure claim"] },
    lastActionId: "A1",
    repository: "D:/repo",
  });
  assert.equal(state.status, "EVIDENCE_READY");
  assert.equal(state.blocker, undefined);
  assert.equal(state.closureProposal, undefined);
  assert.equal(state.unverifiedClosureReopened, true);
});

test("CLOSE_WAVE is human-gated in v0.1", () => {
  assert.equal(closureRequiresHumanApproval({ decision: "CLOSE_WAVE" }), true);
  assert.equal(closureRequiresHumanApproval({ decision: "VERIFY" }), false);
});

test("command fingerprint normalizes executable path and arguments", () => {
  assert.equal(
    commandFingerprint({ exe: "C:\\Program Files\\Git\\bin\\git.exe", args: ["STATUS", "--PORCELAIN=v1"] }),
    "git.exe|status\u001f--porcelain=v1|",
  );
});

test("W0.2 evidence progress marks repeated git status as evidenced and advances to identity", () => {
  const progress = buildEvidenceProgress([completedExecution()], {
    wave: "W0.2",
    canonicalBaseSha: "abc",
  });
  assert.ok(progress.completed.includes("REPOSITORY_STATUS_CAPTURED"));
  assert.equal(progress.nextObjective.id, "REPOSITORY_IDENTITY_RECONCILED");
  assert.deepEqual(progress.recommendedCommands[0], { exe: "git", args: ["rev-parse", "HEAD"] });
});

test("governor planning rejects exact repetition of successful evidence commands", () => {
  const history = [completedExecution()];
  const state = { repository: "D:/repo", wave: "W0.2", canonicalBaseSha: "abc" };
  const progress = buildEvidenceProgress(history, state);
  assert.throws(() => validateDecisionAgainstState({
    ...baseDecision,
    decisionId: "D2",
  }, state, history, progress), /NON_ADVANCING_EVIDENCE_ACTION/);
});

test("governor planning rejects sweeping evidence claims while W0.2 objectives remain outstanding", () => {
  const history = [completedExecution()];
  const state = { repository: "D:/repo", wave: "W0.2", canonicalBaseSha: "abc" };
  const progress = buildEvidenceProgress(history, state);
  assert.throws(() => validateDecisionAgainstState({
    ...baseDecision,
    decisionId: "D2",
    verifiedFacts: ["All evidence collected for wave W0.2 is consistent and valid."],
    nextAction: {
      ...baseOrder,
      actionId: "A2",
      commands: [{ exe: "git", args: ["rev-parse", "HEAD"] }],
    },
  }, state, history, progress), /UNSUPPORTED_AGGREGATE_EVIDENCE_CLAIM/);
});

test("git guard freezes read-only state changes", () => {
  const guard = new GitGuard();
  const result = guard.verify(baseOrder,
    { head: "a", branch: "main", statusRaw: "", changedPaths: [] },
    { head: "b", branch: "main", statusRaw: "", changedPaths: [] });
  assert.equal(result.ok, false);
  assert.deepEqual(result.violations, ["READ_ONLY_HEAD_CHANGED"]);
});
