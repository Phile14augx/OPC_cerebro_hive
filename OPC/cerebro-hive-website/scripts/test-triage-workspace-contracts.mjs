import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { triageWorkspaceValidation, validateWorkspaceExceptions } from "./triage-workspace-contracts.mjs";

function fixtureWorkspace({ contract, classification, command = null, packageJson = {}, source = "export const value = 1;\n", workspacePath = "packages/example" }) {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "w0-2-triage-"));
  fs.mkdirSync(path.join(projectRoot, workspacePath, "src"), { recursive: true });
  fs.writeFileSync(path.join(projectRoot, workspacePath, "src", "index.ts"), source);
  fs.writeFileSync(
    path.join(projectRoot, workspacePath, "package.json"),
    JSON.stringify({ name: "@fixture/example", ...packageJson }),
  );
  const manifest = {
    workspaces: [{
      path: workspacePath,
      packageName: "@fixture/example",
      hasSource: true,
      contracts: { [contract]: { classification, command, evidence: "fixture evidence" } },
    }],
  };
  const auditReport = {
    findings: [{ code: "W0C_CLASSIFIED_DEFECT", workspacePath, contract, classification, evidence: "fixture evidence" }],
  };
  return { projectRoot, manifest, auditReport };
}

test("retains false-green validation as a P0 repair", () => {
  const fixture = fixtureWorkspace({
    contract: "test",
    classification: "FALSE-GREEN",
    command: "vitest run --passWithNoTests",
  });

  const result = triageWorkspaceValidation(fixture);

  assert.equal(result.findings[0].semanticDisposition, "REPAIR");
  assert.equal(result.findings[0].priority, "P0");
  assert.equal(result.findings[0].needsContract, true);
  assert.equal(result.exceptions.length, 0);
  assert.deepEqual(result.repairDag.map((node) => node.id), [
    "audit-infrastructure",
    "false-green-hotspots",
    "typecheck-contracts",
    "test-contracts",
    "schema-validation",
    "lint-build-cleanup",
    "negative-controls",
    "governance-gate-integration",
  ]);
});

test("retains missing TypeScript typecheck as a P1 repair", () => {
  const fixture = fixtureWorkspace({ contract: "typecheck", classification: "BROKEN" });

  const result = triageWorkspaceValidation(fixture);

  assert.equal(result.findings[0].semanticDisposition, "REPAIR");
  assert.equal(result.findings[0].priority, "P1");
  assert.match(result.findings[0].evidence.join(" "), /TypeScript source/);
});

test("proposes but does not approve a build exception for source-distributed packages", () => {
  const fixture = fixtureWorkspace({
    contract: "build",
    classification: "BROKEN",
    packageJson: { private: true, exports: { ".": "./src/index.ts" } },
  });

  const result = triageWorkspaceValidation(fixture);

  assert.equal(result.findings[0].semanticDisposition, "PROPOSE_ABSENT_BY_DESIGN");
  assert.equal(result.findings[0].priority, "P3");
  assert.equal(result.exceptions[0].reviewStatus, "REQUIRED");
  assert.equal(result.exceptions[0].owner, null);
  assert.equal(result.exceptions[0].reviewEvidence, null);
});

test("recognizes source exports without a dot-slash prefix", () => {
  const fixture = fixtureWorkspace({
    contract: "build",
    classification: "BROKEN",
    packageJson: { exports: { ".": { types: "src/index.ts", import: "src/index.ts" } } },
  });

  const result = triageWorkspaceValidation(fixture);

  assert.equal(result.findings[0].semanticDisposition, "PROPOSE_ABSENT_BY_DESIGN");
});

test("retains a missing production service build as a repair", () => {
  const fixture = fixtureWorkspace({
    contract: "build",
    classification: "BROKEN",
    workspacePath: "services/example",
    packageJson: { exports: { ".": "src/index.ts" } },
  });

  const result = triageWorkspaceValidation(fixture);

  assert.equal(result.findings[0].semanticDisposition, "REPAIR");
  assert.equal(result.findings[0].priority, "P1");
  assert.equal(result.exceptions.length, 0);
});

test("rejects an approved exception without durable review evidence", () => {
  assert.throws(
    () => validateWorkspaceExceptions({
      exceptions: [{
        workspacePath: "packages/example",
        contract: "build",
        rationale: "source distributed",
        architecturalJustification: "consumer compiles source",
        permanence: "PERMANENT",
        expiryOrReviewTrigger: "architecture change",
        owner: null,
        reviewer: null,
        reviewEvidence: null,
        reviewStatus: "APPROVED",
      }],
    }),
    /W0C_UNREVIEWED_EXCEPTION/,
  );
});

test("accepts an owner-bound decision that is still pending a human reviewer", () => {
  const result = validateWorkspaceExceptions({
    exceptions: [{
      workspacePath: "packages/example",
      contract: "build",
      rationale: "source distributed",
      architecturalJustification: "consumer compiles source",
      permanence: "PERMANENT",
      expiryOrReviewTrigger: "architecture change",
      owner: "Phile14augx",
      reviewer: null,
      reviewEvidence: null,
      reviewReference: "docs/review.md; artifacts/review.json",
      reviewStatus: "PENDING_REVIEWER",
    }],
  });

  assert.equal(result.exceptionCount, 1);
});
