import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeStateForGovernor } from "./orchestrator.mjs";

const BASE = "f5db3c622988edf91d69f5617fe603e93e5f2e1d";
const WORKFLOW = ".github/workflows/website-ci.yml";

function workflowCommand() {
  return { exe: "git", args: ["show", `${BASE}:${WORKFLOW}`] };
}

test("git show 'exists on disk, but not in ref' is recoverable immutable absence evidence", () => {
  const state = sanitizeStateForGovernor({
    status: "EXECUTION_FAILED",
    blocker: "COMMAND_FAILED",
    canonicalBaseSha: BASE,
    lastActionId: "W0.2-013-ACTION",
    executionFailure: {
      classification: "COMMAND_FAILED",
      command: workflowCommand(),
      exitCode: 128,
      timedOut: false,
      stderr: `fatal: path '${WORKFLOW}' exists on disk, but not in '${BASE}'\n`,
    },
  });

  assert.equal(state.status, "EVIDENCE_READY");
  assert.equal(state.blocker, undefined);
  assert.equal(state.executionFailure, undefined);
  assert.equal(state.recoverableEvidenceMiss.classification, "IMMUTABLE_PATH_ABSENT");
  assert.equal(state.recoverableEvidenceMiss.ref, BASE);
  assert.equal(state.recoverableEvidenceMiss.path, WORKFLOW);
});
