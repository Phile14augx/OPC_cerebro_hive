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
import {
  buildPr42ReconciliationCommands,
  derivePr42Reconciliation,
  PR42_EXPECTED_MERGE_BASE,
  PR42_PRESERVED_COMMIT,
  PR42_PRESERVED_PARENT,
  PR42_KNOWN_PRESERVED_PATHS,
  PR42_POLICY
} from "./pr42-reconciliation.mjs";

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

test("workspace denominator command enumerates immutable workspace roots with full-tree", () => {
  assert.deepEqual(buildWorkspaceDenominatorCommand(denominatorBase, denominatorGlobs), {
    exe: "git",
    args: [
      "ls-tree",
      "-r",
      "--name-only",
      "--full-tree",
      denominatorBase,
      "--",
      `${denominatorRoot}/apps`,
      `${denominatorRoot}/packages`,
      `${denominatorRoot}/services`,
    ],
  });
});

test("workspace denominator derivation filters manifests, excludes nested packages, and counts root once", () => {
  const evidence = deriveWorkspaceDenominator({
    stdout: [
      `${denominatorRoot}/apps/studio/package.json`,
      `${denominatorRoot}/apps/studio/src/index.ts`,
      `${denominatorRoot}/apps/studio/platform/package.json`,
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
  assert.equal(evidence.rawTreePathCount, 7);
  assert.equal(evidence.packageManifestCount, 5);
  assert.equal(evidence.ignoredNonManifestPathCount, 2);
  assert.equal(evidence.childWorkspaceCount, 4);
  assert.equal(evidence.rootControlPlaneCount, 1);
  assert.equal(evidence.totalProjectEntities, 5);
  assert.equal(evidence.childWorkspacePaths.length, 4);
  assert.deepEqual(evidence.excludedPackageJsonPaths, [`${denominatorRoot}/apps/studio/platform/package.json`]);
  assert.deepEqual(evidence.unexpectedPaths, []);
});

test("nested package manifests are explicitly excluded rather than recursively counted", () => {
  const evidence = deriveWorkspaceDenominator({
    stdout: [
      `${denominatorRoot}/apps/studio/package.json`,
      `${denominatorRoot}/apps/studio/platform/package.json`,
    ].join("\n"),
    workspaceGlobs: denominatorGlobs,
    sourceRef: denominatorBase,
    rootControlPlaneCaptured: true,
  });
  assert.equal(evidence.valid, true);
  assert.equal(evidence.childWorkspaceCount, 1);
  assert.deepEqual(evidence.childWorkspacePaths, [`${denominatorRoot}/apps/studio/package.json`]);
  assert.deepEqual(evidence.excludedPackageJsonPaths, [`${denominatorRoot}/apps/studio/platform/package.json`]);
});

test("non-manifest files inside enumerated workspace roots are ignored", () => {
  const evidence = deriveWorkspaceDenominator({
    stdout: [
      `${denominatorRoot}/apps/studio/package.json`,
      `${denominatorRoot}/apps/studio/README.md`,
      `${denominatorRoot}/packages/auth/src/index.ts`,
    ].join("\n"),
    workspaceGlobs: denominatorGlobs,
    sourceRef: denominatorBase,
    rootControlPlaneCaptured: true,
  });
  assert.equal(evidence.valid, true);
  assert.equal(evidence.childWorkspaceCount, 1);
  assert.equal(evidence.ignoredNonManifestPathCount, 2);
  assert.deepEqual(evidence.unexpectedPaths, []);
});

test("paths outside canonical workspace roots invalidate denominator evidence", () => {
  const evidence = deriveWorkspaceDenominator({
    stdout: [
      `${denominatorRoot}/apps/studio/package.json`,
      `${denominatorRoot}/docs/package.json`,
    ].join("\n"),
    workspaceGlobs: denominatorGlobs,
    sourceRef: denominatorBase,
    rootControlPlaneCaptured: true,
  });
  assert.equal(evidence.valid, false);
  assert.deepEqual(evidence.unexpectedPaths, [`${denominatorRoot}/docs/package.json`]);
});

test("zero-workspace tree output cannot prove the denominator", () => {
  const evidence = deriveWorkspaceDenominator({
    stdout: "",
    workspaceGlobs: denominatorGlobs,
    sourceRef: denominatorBase,
    rootControlPlaneCaptured: true,
  });
  assert.equal(evidence.valid, false);
  assert.equal(evidence.childWorkspaceCount, 0);
  assert.equal(evidence.totalProjectEntities, 1);
});

test("known 141-child fixture produces canonical 142 project entities while excluding 13 nested manifests", () => {
  const direct = Array.from({ length: 141 }, (_, index) => `${denominatorRoot}/packages/pkg-${String(index + 1).padStart(3, "0")}/package.json`);
  const nested = Array.from({ length: 13 }, (_, index) => `${denominatorRoot}/packages/widgets/widget-${String(index + 1).padStart(2, "0")}/package.json`);
  const evidence = deriveWorkspaceDenominator({
    stdout: [...direct, ...nested].join("\n"),
    workspaceGlobs: denominatorGlobs,
    sourceRef: denominatorBase,
    rootControlPlaneCaptured: true,
  });
  assert.equal(evidence.valid, true);
  assert.equal(evidence.packageManifestCount, 154);
  assert.equal(evidence.childWorkspaceCount, 141);
  assert.equal(evidence.excludedPackageJsonPaths.length, 13);
  assert.equal(evidence.rootControlPlaneCount, 1);
  assert.equal(evidence.totalProjectEntities, 142);
});

test("W0.2 planner recommends deterministic denominator probe after source capture", () => {
  const history = denominatorPriorHistory();
  const state = { repository: "D:/repo", wave: "W0.2", canonicalBaseSha: denominatorBase };
  const progress = buildEvidenceProgress(history, state);
  assert.equal(progress.nextObjective.id, "WORKSPACE_DENOMINATOR_PROVEN");
  assert.deepEqual(progress.workspaceDefinition.globs, denominatorGlobs);
  assert.deepEqual(progress.recommendedCommands, [buildWorkspaceDenominatorCommand(denominatorBase, denominatorGlobs)]);
});

test("W0.2 denominator becomes evidenced after immutable full-tree output is captured", () => {
  const history = denominatorPriorHistory();
  const command = buildWorkspaceDenominatorCommand(denominatorBase, denominatorGlobs);
  history.push(completedExecution(command, [
    `${denominatorRoot}/apps/studio/package.json`,
    `${denominatorRoot}/apps/studio/src/index.ts`,
    `${denominatorRoot}/apps/studio/platform/package.json`,
    `${denominatorRoot}/packages/auth/package.json`,
    `${denominatorRoot}/packages/capabilities/memory/package.json`,
    `${denominatorRoot}/services/forge-api/package.json`,
  ].join("\n")));
  const progress = buildEvidenceProgress(history, { repository: "D:/repo", wave: "W0.2", canonicalBaseSha: denominatorBase });
  assert.ok(progress.completed.includes("WORKSPACE_DENOMINATOR_PROVEN"));
  assert.equal(progress.denominatorEvidence.childWorkspaceCount, 4);
  assert.equal(progress.denominatorEvidence.totalProjectEntities, 5);
  assert.deepEqual(progress.denominatorEvidence.excludedPackageJsonPaths, [`${denominatorRoot}/apps/studio/platform/package.json`]);
  assert.equal(progress.nextObjective.id, "PR42_TRUE_DELTA_RECONCILED");
});

test("successful zero-output denominator probe remains outstanding", () => {
  const history = denominatorPriorHistory();
  const command = buildWorkspaceDenominatorCommand(denominatorBase, denominatorGlobs);
  history.push(completedExecution(command, ""));
  const progress = buildEvidenceProgress(history, { repository: "D:/repo", wave: "W0.2", canonicalBaseSha: denominatorBase });
  assert.ok(!progress.completed.includes("WORKSPACE_DENOMINATOR_PROVEN"));
  assert.equal(progress.denominatorEvidence.valid, false);
  assert.equal(progress.nextObjective.id, "WORKSPACE_DENOMINATOR_PROVEN");
});

test("governor must include deterministic recommended denominator command", () => {
  const history = denominatorPriorHistory();
  const state = { repository: "D:/repo", wave: "W0.2", canonicalBaseSha: denominatorBase };
  const progress = buildEvidenceProgress(history, state);
  assert.throws(() => validateDecisionAgainstState({
    decisionId: "W0.2-017",
    wave: "W0.2",
    decision: "COLLECT_EVIDENCE",
    canonicalBaseSha: denominatorBase,
    verifiedFacts: [],
    conflicts: [],
    unknowns: ["WORKSPACE_DENOMINATOR_PROVEN"],
    writeAuthorized: false,
    nextAction: {
      actionId: "W0.2-017-ACTION",
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

const pr42Head = "1252a95ed563ad2c3343b407f789bfe1c084b2be";

function setupPr42BaseHistory() {
  const history = denominatorPriorHistory();
  const command = buildWorkspaceDenominatorCommand(denominatorBase, denominatorGlobs);
  history.push(completedExecution(command, [
    `${denominatorRoot}/apps/studio/package.json`,
  ].join("\n")));
  return history;
}

function mockPr42Outputs({
  mergeBase = PR42_EXPECTED_MERGE_BASE,
  baseCount = 5,
  pr42Count = 28,
  mainPaths = 203,
  pr42Paths = 84,
  overlap = 43,
  preservedPaths = PR42_KNOWN_PRESERVED_PATHS,
  preservedParent = PR42_PRESERVED_PARENT,
  diffPr42Preserved = [],
  uniquePreserved = false
} = {}) {
  let mainOwnedPaths = Array.from({length: mainPaths}, (_, i) => `main-${i}`);
  let pr42OwnedPaths = Array.from({length: pr42Paths}, (_, i) => `pr42-${i}`);

  for (let i = 0; i < overlap; i++) {
    mainOwnedPaths[i] = `overlap-${i}`;
    pr42OwnedPaths[i] = `overlap-${i}`;
  }

  if (!uniquePreserved) {
    for (let i = 0; i < preservedPaths.length; i++) {
      pr42OwnedPaths[overlap + i] = preservedPaths[i];
    }
  }

  mainOwnedPaths.sort();
  pr42OwnedPaths.sort();

  return [
    completedExecution({ exe: "git", args: ["cat-file", "-e", `${denominatorBase}^{commit}`] }),
    completedExecution({ exe: "git", args: ["cat-file", "-e", `${pr42Head}^{commit}`] }),
    completedExecution({ exe: "git", args: ["cat-file", "-e", `${PR42_PRESERVED_COMMIT}^{commit}`] }),
    completedExecution({ exe: "git", args: ["merge-base", denominatorBase, pr42Head] }, mergeBase + "\n"),
    completedExecution({ exe: "git", args: ["rev-list", "--left-right", "--count", `${denominatorBase}...${pr42Head}`] }, `${baseCount}\t${pr42Count}\n`),
    completedExecution({ exe: "git", args: ["diff", "--name-only", "--no-renames", PR42_EXPECTED_MERGE_BASE, denominatorBase] }, mainOwnedPaths.join("\n") + "\n"),
    completedExecution({ exe: "git", args: ["diff", "--name-only", "--no-renames", PR42_EXPECTED_MERGE_BASE, pr42Head] }, pr42OwnedPaths.join("\n") + "\n"),
    completedExecution({ exe: "git", args: ["rev-parse", `${PR42_PRESERVED_COMMIT}^`] }, preservedParent + "\n"),
    completedExecution({ exe: "git", args: ["diff", "--name-only", "--no-renames", PR42_PRESERVED_PARENT, PR42_PRESERVED_COMMIT] }, preservedPaths.join("\n") + "\n"),
    completedExecution({ exe: "git", args: ["diff", "--name-only", "--no-renames", pr42Head, PR42_PRESERVED_COMMIT, "--", ...PR42_KNOWN_PRESERVED_PATHS] }, diffPr42Preserved.join("\n") + "\n"),
  ];
}

test("no reconciliation evidence => Objective 9 OUTSTANDING", () => {
  const history = setupPr42BaseHistory();
  const state = { repository: "D:/repo", wave: "W0.2", canonicalBaseSha: denominatorBase, pr42HeadSha: pr42Head };
  const progress = buildEvidenceProgress(history, state);
  assert.equal(progress.nextObjective.id, "PR42_TRUE_DELTA_RECONCILED");
  assert.equal(progress.completed.includes("PR42_TRUE_DELTA_RECONCILED"), false);
});

test("correct deterministic commands are recommended", () => {
  const history = setupPr42BaseHistory();
  const state = { repository: "D:/repo", wave: "W0.2", canonicalBaseSha: denominatorBase, pr42HeadSha: pr42Head };
  const progress = buildEvidenceProgress(history, state);
  assert.deepEqual(progress.recommendedCommands, buildPr42ReconciliationCommands(denominatorBase, pr42Head));
});

test("all Objective-9 commands are read-only Git", () => {
  const commands = buildPr42ReconciliationCommands(denominatorBase, pr42Head);
  for (const command of commands) {
    assert.equal(command.exe, "git");
    const allowed = ["cat-file", "merge-base", "rev-list", "diff", "rev-parse"];
    assert.ok(allowed.includes(command.args[0]));
  }
});

test("correct counts => Objective 9 EVIDENCED", () => {
  const history = setupPr42BaseHistory();
  history.push(...mockPr42Outputs());
  const state = { repository: "D:/repo", wave: "W0.2", canonicalBaseSha: denominatorBase, pr42HeadSha: pr42Head };
  const progress = buildEvidenceProgress(history, state);
  assert.equal(progress.completed.includes("PR42_TRUE_DELTA_RECONCILED"), true);
});

test("wrong merge base => OUTSTANDING", () => {
  const history = setupPr42BaseHistory();
  history.push(...mockPr42Outputs({ mergeBase: "wrong-base" }));
  const state = { repository: "D:/repo", wave: "W0.2", canonicalBaseSha: denominatorBase, pr42HeadSha: pr42Head };
  const progress = buildEvidenceProgress(history, state);
  assert.equal(progress.completed.includes("PR42_TRUE_DELTA_RECONCILED"), false);
  assert.ok(progress.evidenceNotes.some(n => n.includes("wrong merge base")));
});

test("wrong topology counts => OUTSTANDING", () => {
  const history = setupPr42BaseHistory();
  history.push(...mockPr42Outputs({ baseCount: 4 }));
  const state = { repository: "D:/repo", wave: "W0.2", canonicalBaseSha: denominatorBase, pr42HeadSha: pr42Head };
  const progress = buildEvidenceProgress(history, state);
  assert.equal(progress.completed.includes("PR42_TRUE_DELTA_RECONCILED"), false);
  assert.ok(progress.evidenceNotes.some(n => n.includes("wrong topology counts")));
});

test("missing preserved path => OUTSTANDING", () => {
  const history = setupPr42BaseHistory();
  history.push(...mockPr42Outputs({ preservedPaths: [PR42_KNOWN_PRESERVED_PATHS[0]] }));
  const state = { repository: "D:/repo", wave: "W0.2", canonicalBaseSha: denominatorBase, pr42HeadSha: pr42Head };
  const progress = buildEvidenceProgress(history, state);
  assert.equal(progress.completed.includes("PR42_TRUE_DELTA_RECONCILED"), false);
  assert.ok(progress.evidenceNotes.some(n => n.includes("missing preserved path")));
});

test("non-empty PR42/preserved diff => OUTSTANDING", () => {
  const history = setupPr42BaseHistory();
  history.push(...mockPr42Outputs({ diffPr42Preserved: ["some/path"] }));
  const state = { repository: "D:/repo", wave: "W0.2", canonicalBaseSha: denominatorBase, pr42HeadSha: pr42Head };
  const progress = buildEvidenceProgress(history, state);
  assert.equal(progress.completed.includes("PR42_TRUE_DELTA_RECONCILED"), false);
  assert.ok(progress.evidenceNotes.some(n => n.includes("non-empty PR42/preserved diff")));
});

test("unique preserved work => OUTSTANDING", () => {
  const history = setupPr42BaseHistory();
  history.push(...mockPr42Outputs({ uniquePreserved: true }));
  const state = { repository: "D:/repo", wave: "W0.2", canonicalBaseSha: denominatorBase, pr42HeadSha: pr42Head };
  const progress = buildEvidenceProgress(history, state);
  assert.equal(progress.completed.includes("PR42_TRUE_DELTA_RECONCILED"), false);
  assert.ok(progress.evidenceNotes.some(n => n.includes("unique preserved work")));
});

test("pnpm-lock.yaml disposition is REGENERATE", () => {
  assert.ok(PR42_POLICY.REGENERATE.includes("OPC/cerebro-hive-website/pnpm-lock.yaml"));
  assert.equal(PR42_POLICY.REGENERATE.length, 1);
});

test("KEEP_MAIN paths cannot become PR42 replacement candidates", () => {
  assert.ok(PR42_POLICY.KEEP_MAIN.includes("OPC/cerebro-hive-website/packages/config-core/src/index.ts"));
  assert.equal(PR42_POLICY.KEEP_MAIN.length, 9);
});

test("preserved parent mismatch => OUTSTANDING", () => {
  const history = setupPr42BaseHistory();
  history.push(...mockPr42Outputs({ preservedParent: "0000000000000000000000000000000000000000" }));
  const state = { repository: "D:/repo", wave: "W0.2", canonicalBaseSha: denominatorBase, pr42HeadSha: pr42Head };
  const progress = buildEvidenceProgress(history, state);
  assert.equal(progress.completed.includes("PR42_TRUE_DELTA_RECONCILED"), false);
  assert.ok(progress.evidenceNotes.some(n => n.includes("wrong preserved parent")));
});

test("PR42 branch-owned path partitions are derived exactly", () => {
  const entries = mockPr42Outputs();
  // Extract the execution-entry objects expected by derivePr42Reconciliation
  // mockPr42Outputs returns EXECUTION_RESULT records; we need the inner entry objects
  const extractedEntries = entries.map(record => {
    const commands = record.payload?.result?.commands ?? [];
    return commands.length > 0 ? commands[0] : null;
  });
  const evidence = derivePr42Reconciliation(extractedEntries);
  assert.ok(evidence !== null, "derivePr42Reconciliation must return evidence");
  assert.equal(evidence.mainOwnedPaths.length, 203);
  assert.equal(evidence.pr42OwnedPaths.length, 84);
  assert.equal(evidence.overlapPaths.length, 43);
  assert.equal(evidence.pr42OnlyPaths.length, 41);
  assert.equal(evidence.mainOnlyPaths.length, 160);
  assert.equal(evidence.preservedChangedPaths.length, 9);
  assert.equal(evidence.uniquePreservedPaths.length, 0);

  // Partition set identities
  const overlapSet = new Set(evidence.overlapPaths);
  const pr42OnlySet = new Set(evidence.pr42OnlyPaths);
  const mainOnlySet = new Set(evidence.mainOnlyPaths);
  const pr42OwnedSet = new Set(evidence.pr42OwnedPaths);
  const mainOwnedSet = new Set(evidence.mainOwnedPaths);

  // Set(overlap + pr42Only) === Set(pr42OwnedPaths)
  const derivedPr42Owned = new Set([...overlapSet, ...pr42OnlySet]);
  assert.deepEqual(
    [...derivedPr42Owned].sort(),
    [...pr42OwnedSet].sort(),
    "overlap ∪ pr42Only must equal pr42OwnedPaths"
  );

  // Set(overlap + mainOnly) === Set(mainOwnedPaths)
  const derivedMainOwned = new Set([...overlapSet, ...mainOnlySet]);
  assert.deepEqual(
    [...derivedMainOwned].sort(),
    [...mainOwnedSet].sort(),
    "overlap ∪ mainOnly must equal mainOwnedPaths"
  );

  // No path in both mainOnlyPaths and pr42OnlyPaths
  for (const p of evidence.mainOnlyPaths) {
    assert.equal(pr42OnlySet.has(p), false, `"${p}" must not appear in both mainOnly and pr42Only`);
  }
});

test("packages/db/package.json disposition is VERIFY_BEFORE_RECOVERY", () => {
  assert.ok(PR42_POLICY.VERIFY_BEFORE_RECOVERY.includes("OPC/cerebro-hive-website/packages/db/package.json"));
});

test("KEEP_MAIN paths are absent from every RECOVERY_CANDIDATE path collection", () => {
  const keepMainSet = new Set(PR42_POLICY.KEEP_MAIN);
  for (const [groupKey, group] of Object.entries(PR42_POLICY.RECOVERY_CANDIDATE)) {
    for (const candidatePath of group.paths ?? []) {
      assert.equal(
        keepMainSet.has(candidatePath),
        false,
        `RECOVERY_CANDIDATE.${groupKey} must not contain KEEP_MAIN path "${candidatePath}"`
      );
    }
  }
});
