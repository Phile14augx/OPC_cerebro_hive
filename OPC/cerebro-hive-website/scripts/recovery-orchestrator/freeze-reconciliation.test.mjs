import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { validateGovernorDecision } from "./protocol.mjs";
import { GitGuard } from "./git-guard.mjs";
import { EvidenceStore } from "./evidence-store.mjs";
import { RecoveryLedger } from "./ledger.mjs";
import {
  reconcileFalsePositiveFreeze,
  validateFalsePositiveFreezeEvidence,
} from "./freeze-reconciliation.mjs";

const repo = "D:/repo";
const command = {
  exe: "git",
  args: ["ls-tree", "-r", "--name-only", "abc", "--", ":(glob)OPC/cerebro-hive-website/apps/*/package.json"],
};

function snapshot(statusRaw) {
  const lines = statusRaw.split(/\r?\n/).filter(Boolean);
  return {
    head: "abc",
    branch: "recovery",
    statusRaw,
    statusEntries: lines.map((raw) => ({ raw, status: raw.slice(0, 2), path: raw.slice(3).trim() })),
    changedPaths: lines.map((raw) => raw.slice(3).trim()),
  };
}

function frozenEvidence({ executionStatus = "COMPLETED" } = {}) {
  const dirty = " M OPC/cerebro-hive-website/PROGRESS.md\n?? .worktrees/\n";
  const before = snapshot(dirty);
  const after = snapshot(dirty);
  const failed = executionStatus === "FAILED";
  return {
    decisionId: "W0.2-015",
    actionId: "W0.2-015-ACTION",
    decision: {
      decisionId: "W0.2-015",
      wave: "W0.2",
      decision: "VERIFY",
      canonicalBaseSha: "abc",
      verifiedFacts: [],
      conflicts: [],
      unknowns: ["WORKSPACE_DENOMINATOR_PROVEN"],
      writeAuthorized: false,
      nextAction: null,
    },
    order: {
      actionId: "W0.2-015-ACTION",
      mode: "VERIFY",
      repository: repo,
      commands: [command],
      allowedPaths: ["OPC/cerebro-hive-website/scripts/recovery-orchestrator"],
      forbiddenPaths: [],
      acceptanceCriteria: [],
      stopConditions: [],
    },
    before,
    result: {
      actionId: "W0.2-015-ACTION",
      status: executionStatus,
      commands: [{
        command,
        exitCode: failed ? 128 : 0,
        stdout: failed ? "" : "OPC/cerebro-hive-website/apps/studio/package.json\n",
        stderr: failed ? "fatal: pathspec magic not supported in fixture\n" : "",
        timedOut: false,
      }],
      ...(failed ? { failure: "COMMAND_FAILED" } : {}),
    },
    after,
    integrity: {
      ok: false,
      violations: [
        "OUT_OF_SCOPE_PATH OPC/cerebro-hive-website/PROGRESS.md",
        "OUT_OF_SCOPE_PATH .worktrees/",
      ],
      classification: "EXECUTOR_INTEGRITY_VIOLATION",
    },
  };
}

test("read-only Git inspection cannot be mislabeled VERIFY", () => {
  assert.throws(() => validateGovernorDecision({
    decisionId: "W0.2-015",
    wave: "W0.2",
    decision: "VERIFY",
    canonicalBaseSha: "abc",
    verifiedFacts: [],
    conflicts: [],
    unknowns: ["WORKSPACE_DENOMINATOR_PROVEN"],
    writeAuthorized: false,
    nextAction: {
      actionId: "W0.2-015-ACTION",
      mode: "VERIFY",
      repository: repo,
      commands: [command],
      allowedPaths: [],
      forbiddenPaths: [],
      acceptanceCriteria: [],
      stopConditions: [],
    },
  }), /read-only Git commands require READ_ONLY action mode/);
});

test("VERIFY guard does not reclassify unchanged pre-existing dirt as mutation", () => {
  const guard = new GitGuard();
  const dirty = " M OPC/cerebro-hive-website/PROGRESS.md\n";
  const result = guard.verify({
    mode: "VERIFY",
    allowedPaths: ["OPC/cerebro-hive-website/scripts/recovery-orchestrator"],
    forbiddenPaths: [],
  }, snapshot(dirty), snapshot(dirty));
  assert.equal(result.ok, true);
  assert.deepEqual(result.violations, []);
});

test("VERIFY guard still rejects a newly changed out-of-scope path", () => {
  const guard = new GitGuard();
  const before = snapshot(" M OPC/cerebro-hive-website/PROGRESS.md\n");
  const after = snapshot(" M OPC/cerebro-hive-website/PROGRESS.md\n?? OPC/cerebro-hive-website/rogue.txt\n");
  const result = guard.verify({
    mode: "VERIFY",
    allowedPaths: ["OPC/cerebro-hive-website/scripts/recovery-orchestrator"],
    forbiddenPaths: [],
  }, before, after);
  assert.equal(result.ok, false);
  assert.deepEqual(result.violations, ["OUT_OF_SCOPE_PATH OPC/cerebro-hive-website/rogue.txt"]);
});

test("false-positive freeze evidence requires byte-identical Git state and read-only Git", () => {
  const evidence = frozenEvidence();
  const state = {
    status: "FROZEN",
    blocker: "UNAUTHORIZED_RECOVERY_MUTATION",
    lastDecisionId: evidence.decisionId,
    lastActionId: evidence.actionId,
  };
  const validation = validateFalsePositiveFreezeEvidence(state, evidence);
  assert.equal(validation.ok, true);
  assert.equal(validation.classification, "CONTROL_PLANE_GUARD_FALSE_POSITIVE");
});

test("false-positive freeze can be reconciled even when independent read-only command failed", () => {
  const evidence = frozenEvidence({ executionStatus: "FAILED" });
  const state = {
    status: "FROZEN",
    blocker: "UNAUTHORIZED_RECOVERY_MUTATION",
    lastDecisionId: evidence.decisionId,
    lastActionId: evidence.actionId,
  };
  const validation = validateFalsePositiveFreezeEvidence(state, evidence);
  assert.equal(validation.ok, true);
  assert.equal(validation.classification, "CONTROL_PLANE_GUARD_FALSE_POSITIVE_WITH_EXECUTION_FAILURE");
  assert.equal(validation.executionFailure.classification, "COMMAND_FAILED");
  assert.equal(validation.executionFailure.exitCode, 128);
});

test("evidence-bound reconciliation appends additive thaw state without rewriting freeze evidence", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "cerebro-freeze-test-"));
  try {
    const evidenceStore = new EvidenceStore(path.join(temp, "evidence"));
    const ledger = new RecoveryLedger(path.join(temp, "recovery-ledger.jsonl"));
    const evidence = frozenEvidence();
    const artifact = await evidenceStore.write("execution", evidence.actionId, evidence);
    const state = {
      portfolio: "Cerebro Nexarch",
      wave: "W0.2",
      status: "FROZEN",
      blocker: "UNAUTHORIZED_RECOVERY_MUTATION",
      lastDecisionId: evidence.decisionId,
      lastActionId: evidence.actionId,
      lastEvidence: artifact,
      integrityViolations: evidence.integrity.violations,
    };
    await ledger.append("STATE", state);

    const reconciled = await reconcileFalsePositiveFreeze({
      state,
      evidenceStore,
      ledger,
      expectedSha256: artifact.sha256,
    });

    assert.equal(reconciled.status, "EVIDENCE_READY");
    assert.equal(reconciled.blocker, undefined);
    assert.equal(reconciled.integrityViolations, undefined);
    assert.equal(reconciled.freezeReconciliation.classification, "CONTROL_PLANE_GUARD_FALSE_POSITIVE");

    const records = await ledger.readAll();
    assert.equal(records.at(-2).type, "FREEZE_RECONCILIATION");
    assert.equal(records.at(-1).type, "STATE");
  } finally {
    await fs.rm(temp, { recursive: true, force: true });
  }
});

test("failed executor command is preserved as EXECUTION_FAILED after false-freeze reconciliation", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "cerebro-freeze-failed-test-"));
  try {
    const evidenceStore = new EvidenceStore(path.join(temp, "evidence"));
    const ledger = new RecoveryLedger(path.join(temp, "recovery-ledger.jsonl"));
    const evidence = frozenEvidence({ executionStatus: "FAILED" });
    const artifact = await evidenceStore.write("execution", evidence.actionId, evidence);
    const state = {
      portfolio: "Cerebro Nexarch",
      wave: "W0.2",
      status: "FROZEN",
      blocker: "UNAUTHORIZED_RECOVERY_MUTATION",
      lastDecisionId: evidence.decisionId,
      lastActionId: evidence.actionId,
      lastEvidence: artifact,
      integrityViolations: evidence.integrity.violations,
    };
    await ledger.append("STATE", state);

    const reconciled = await reconcileFalsePositiveFreeze({
      state,
      evidenceStore,
      ledger,
      expectedSha256: artifact.sha256,
    });

    assert.equal(reconciled.status, "EXECUTION_FAILED");
    assert.equal(reconciled.blocker, "COMMAND_FAILED");
    assert.equal(reconciled.executionFailure.exitCode, 128);
    assert.equal(reconciled.freezeReconciliation.classification, "CONTROL_PLANE_GUARD_FALSE_POSITIVE_WITH_EXECUTION_FAILURE");

    const records = await ledger.readAll();
    assert.equal(records.at(-2).type, "FREEZE_RECONCILIATION");
    assert.equal(records.at(-1).type, "STATE");
  } finally {
    await fs.rm(temp, { recursive: true, force: true });
  }
});
