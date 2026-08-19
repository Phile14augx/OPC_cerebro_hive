import test from "node:test";
import assert from "node:assert/strict";
import { RecoveryPolicyEngine, pathAllowed } from "./policy.mjs";
import { validateExecutionOrder, validateGovernorDecision } from "./protocol.mjs";
import { GitGuard } from "./git-guard.mjs";
import {
  buildEvidenceProgress,
  buildGovernorHistory,
  buildWorkspaceDenominatorCommand,
  closureRequiresHumanApproval,
  commandFingerprint,
  deriveWorkspaceDenominator,
  parseWorkspaceGlobs,
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

function completedExecution(command = baseOrder.commands[0], stdout = "") {
  return {
    type: "EXECUTION_RESULT",
    payload: {
      result: {
        status: "COMPLETED",
        commands: [{ command, exitCode: 0, stdout, stderr: "", timedOut: false }],
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

const denominatorBase = "f5db3c622988edf91d69f5617fe603e93e5f2e1d";
const denominatorRoot = "OPC/cerebro-hive-website";
const denominatorYaml = `packages:\n  - "apps/*"\n  - "packages/*"\n  - "packages/capabilities/*"\n  - "services/*"\n`;
const denominatorGlobs = ["apps/*", "packages/*", "packages/capabilities/*", "services/*"];

function denominatorPriorHistory() {
  return [
    completedExecution({ exe: "git", args: ["status", "--porcelain=v1"] }),
    completedExecution({ exe: "git", args: ["rev-parse", "HEAD"] }, "local-head\n"),
    completedExecution({ exe: "git", args: ["branch", "--show-current"] }, "recovery\n"),
    completedExecution({ exe: "git", args: ["rev-parse", "refs/remotes/origin/main"] }, `${denominatorBase}\n`),
    completedExecution({ exe: "git", args: ["show", `${denominatorBase}:${denominatorRoot}/pnpm-workspace.yaml`] }, denominatorYaml),
    completedExecution({ exe: "git", args: ["show", `${denominatorBase}:${denominatorRoot}/package.json`] }, '{"private":true}\n'),
    completedExecution({ exe: "git", args: ["show", `${denominatorBase}:${denominatorRoot}/scripts/audit-workspace-contracts.mjs`] }, "// audit\n"),
    completedExecution({ exe: "git", args: ["show", `${denominatorBase}:${denominatorRoot}/scripts/workspace-contract-exemptions.yaml`] }, "exemptions: []\n"),
    completedExecution({ exe: "git", args: ["show", `${denominatorBase}:.github/workflows/website-ci.yml`] }, "name: Website CI\n"),
  ];
}

test("workspace globs are parsed from captured pnpm-workspace.yaml", () => {
  assert.deepEqual(parseWorkspaceGlobs(denominatorYaml), denominatorGlobs);
});

test("workspace denominator command uses immutable ref and exact package pathspecs", () => {
  assert.deepEqual(buildWorkspaceDenominatorCommand(denominatorBase, denominatorGlobs), {
    exe: "git",
    args: [
      "ls-tree",
      "-r",
      "--name-only",
      denominatorBase,
      "--",
      `:(glob)${denominatorRoot}/apps/*/package.json`,
      `:(glob)${denominatorRoot}/packages/*/package.json`,
      `:(glob)${denominatorRoot}/packages/capabilities/*/package.json`,
      `:(glob)${denominatorRoot}/services/*/package.json`,
    ],
  });
});

test("workspace denominator derivation deduplicates children and counts root once", () => {
  const evidence = deriveWorkspaceDenominator({
    stdout: [
      `${denominatorRoot}/apps/studio/package.json`,
      `${denominatorRoot}/packages/auth/package.json`,
      `${denominatorRoot}/packages/capabilities/memory/package.json`,
      `${denominatorRoot}/services/forge-api/package.json`,
      `${denominatorRoot}/services/forge-api/package.json`,
    ].join("\n"),
    workspaceGlobs: denominatorGlobs,
    sourceRef: denominatorBase,
    rootControlPlaneCaptured: true,
  });
  assert.equal(evidence.valid, true);
  assert.equal(evidence.childWorkspaceCount, 4);
  assert.equal(evidence.rootControlPlaneCount, 1);
  assert.equal(evidence.totalProjectEntities, 5);
  assert.equal(evidence.childWorkspacePaths.length, 4);
  assert.deepEqual(evidence.unexpectedPaths, []);
});

test("unexpected package paths invalidate workspace denominator evidence", () => {
  const evidence = deriveWorkspaceDenominator({
    stdout: `${denominatorRoot}/apps/studio/deep/package.json\n`,
    workspaceGlobs: denominatorGlobs,
    sourceRef: denominatorBase,
    rootControlPlaneCaptured: true,
  });
  assert.equal(evidence.valid, false);
  assert.equal(evidence.childWorkspaceCount, 0);
  assert.deepEqual(evidence.unexpectedPaths, [`${denominatorRoot}/apps/studio/deep/package.json`]);
});

test("W0.2 planner recommends deterministic denominator probe after source capture", () => {
  const history = denominatorPriorHistory();
  const state = { repository: "D:/repo", wave: "W0.2", canonicalBaseSha: denominatorBase };
  const progress = buildEvidenceProgress(history, state);
  assert.equal(progress.nextObjective.id, "WORKSPACE_DENOMINATOR_PROVEN");
  assert.deepEqual(progress.workspaceDefinition.globs, denominatorGlobs);
  assert.deepEqual(progress.recommendedCommands, [buildWorkspaceDenominatorCommand(denominatorBase, denominatorGlobs)]);
});

test("W0.2 denominator becomes evidenced after immutable tree output is captured", () => {
  const history = denominatorPriorHistory();
  const command = buildWorkspaceDenominatorCommand(denominatorBase, denominatorGlobs);
  history.push(completedExecution(command, [
    `${denominatorRoot}/apps/studio/package.json`,
    `${denominatorRoot}/packages/auth/package.json`,
    `${denominatorRoot}/packages/capabilities/memory/package.json`,
    `${denominatorRoot}/services/forge-api/package.json`,
  ].join("\n")));
  const progress = buildEvidenceProgress(history, { repository: "D:/repo", wave: "W0.2", canonicalBaseSha: denominatorBase });
  assert.ok(progress.completed.includes("WORKSPACE_DENOMINATOR_PROVEN"));
  assert.equal(progress.denominatorEvidence.childWorkspaceCount, 4);
  assert.equal(progress.denominatorEvidence.totalProjectEntities, 5);
  assert.equal(progress.nextObjective.id, "PR42_TRUE_DELTA_RECONCILED");
});

test("governor must include deterministic recommended denominator command", () => {
  const history = denominatorPriorHistory();
  const state = { repository: "D:/repo", wave: "W0.2", canonicalBaseSha: denominatorBase };
  const progress = buildEvidenceProgress(history, state);
  assert.throws(() => validateDecisionAgainstState({
    decisionId: "W0.2-015",
    wave: "W0.2",
    decision: "COLLECT_EVIDENCE",
    canonicalBaseSha: denominatorBase,
    verifiedFacts: [],
    conflicts: [],
    unknowns: ["WORKSPACE_DENOMINATOR_PROVEN"],
    writeAuthorized: false,
    nextAction: {
      actionId: "W0.2-015-ACTION",
      mode: "READ_ONLY",
      repository: "D:/repo",
      commands: [{ exe: "git", args: ["log", "-1", "--oneline"] }],
      allowedPaths: [],
      forbiddenPaths: [],
      acceptanceCriteria: ["advance denominator proof"],
      stopConditions: ["stop on failure"],
    },
  }, state, history, progress), /does not include a deterministic recommended command/);
});
