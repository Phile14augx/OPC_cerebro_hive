import test from "node:test";
import assert from "node:assert/strict";
import { RecoveryPolicyEngine, pathAllowed } from "./policy.mjs";
import { validateExecutionOrder, validateGovernorDecision } from "./protocol.mjs";
import { GitGuard } from "./git-guard.mjs";

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

test("policy rejects git commit in read-only mode", () => {
  const policy = new RecoveryPolicyEngine();
  const result = policy.evaluate({ ...baseOrder, commands: [{ exe: "git", args: ["commit", "-m", "x"] }] });
  assert.equal(result.allowed, false);
  assert.match(result.reason, /READ_ONLY_GIT_MUTATION/);
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
  }), /writeAuthorized/);
});

test("git guard freezes read-only state changes", () => {
  const guard = new GitGuard();
  const result = guard.verify(baseOrder,
    { head: "a", branch: "main", statusRaw: "", changedPaths: [] },
    { head: "b", branch: "main", statusRaw: "", changedPaths: [] });
  assert.equal(result.ok, false);
  assert.deepEqual(result.violations, ["READ_ONLY_HEAD_CHANGED"]);
});
