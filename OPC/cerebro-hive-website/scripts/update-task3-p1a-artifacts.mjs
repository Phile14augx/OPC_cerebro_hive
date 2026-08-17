import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { format, resolveConfig } from "prettier";

import {
  auditWorkspaceContracts,
  generateWorkspaceInventory,
} from "./audit-workspace-contracts.mjs";
import { buildRepairQueue } from "./triage-workspace-contracts.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(projectRoot, relativePath), "utf8"));
const writeJson = async (relativePath, value) => {
  const absolutePath = path.join(projectRoot, relativePath);
  const prettierConfig = (await resolveConfig(absolutePath, { editorconfig: true })) ?? {};
  fs.writeFileSync(
    absolutePath,
    await format(JSON.stringify(value), {
      ...prettierConfig,
      parser: "json",
      filepath: absolutePath,
    }),
  );
};

const baseline = readJson("artifacts/w0.2/p1a-typecheck-baseline.json");
const repairedPaths = new Set(baseline.groups.flatMap((group) => group.workspaces));
assert.equal(repairedPaths.size, 55, "P1A must retain the reviewed 55-workspace scope");

const inventory = generateWorkspaceInventory({ projectRoot, expectedWorkspaceCount: 141 });
const inventoryByPath = new Map(
  inventory.workspaces.map((workspace) => [workspace.path, workspace]),
);
const manifest = readJson("config/workspace-validation-classification.json");
const triage = readJson("artifacts/w0.2/workspace-validation-triage.json");
const repairedTypechecksBefore = manifest.workspaces.filter(
  (workspace) =>
    repairedPaths.has(workspace.path) && workspace.contracts.typecheck.classification === "REAL",
).length;
const approvedBuildExceptionsBefore = manifest.workspaces
  .filter((workspace) => workspace.contracts.build.classification === "ABSENT-BY-DESIGN")
  .map((workspace) => ({ path: workspace.path, contract: workspace.contracts.build }));

for (const workspace of manifest.workspaces) {
  const current = inventoryByPath.get(workspace.path);
  if (!current) throw new Error(`W0C_STALE_MANIFEST_PATH ${workspace.path}`);

  workspace.packageName = current.packageName;
  workspace.hasSource = current.hasSource;
  workspace.semanticCandidates = current.semanticCandidates;

  if (repairedPaths.has(workspace.path)) {
    assert.match(
      current.contracts.typecheck ?? "",
      /\btsc\b.*(?:-p|--project)(?:\s|=).*--noEmit/,
      `${workspace.path} must expose the proven P1A compiler contract`,
    );
    workspace.contracts.typecheck = {
      classification: "REAL",
      command: current.contracts.typecheck,
      evidence: `Task 3 P1A independently executed package-local compiler contract and proved red-on-invalid semantics: ${current.contracts.typecheck}`,
    };
  }
}

const approvedBuildExceptionsAfter = manifest.workspaces
  .filter((workspace) => workspace.contracts.build.classification === "ABSENT-BY-DESIGN")
  .map((workspace) => ({ path: workspace.path, contract: workspace.contracts.build }));
assert.deepEqual(
  approvedBuildExceptionsAfter,
  approvedBuildExceptionsBefore,
  "P1A must preserve approved build-exception evidence verbatim",
);

await writeJson("artifacts/w0.2/workspace-validation-inventory.json", inventory);
await writeJson("config/workspace-validation-classification.json", manifest);

let auditReport;
try {
  auditReport = auditWorkspaceContracts({
    projectRoot,
    manifestPath: path.join(projectRoot, "config", "workspace-validation-classification.json"),
    expectedWorkspaceCount: 141,
  });
} catch (error) {
  if (!error.auditResult) throw error;
  auditReport = error.auditResult;
}

const resolved = new Set([...repairedPaths].map((workspacePath) => `${workspacePath}:typecheck`));
const resolvedFindings = triage.findings.filter((finding) =>
  resolved.has(`${finding.workspacePath}:${finding.contract}`),
);
assert.ok(
  (resolvedFindings.length === 55 && repairedTypechecksBefore === 0) ||
    (resolvedFindings.length === 0 && repairedTypechecksBefore === 55),
  "P1A must either resolve exactly 55 queued typecheck findings or verify the fully applied state",
);

const remainingFindings = triage.findings.filter(
  (finding) => !resolved.has(`${finding.workspacePath}:${finding.contract}`),
);
const repairQueue = buildRepairQueue(remainingFindings);
const updatedTriage = { ...triage, findings: remainingFindings, repairQueue };

await writeJson("artifacts/w0.2/workspace-validation-findings.json", {
  ...auditReport,
  green: auditReport.findings.length === 0,
});
await writeJson("artifacts/w0.2/workspace-validation-triage.json", updatedTriage);
await writeJson("artifacts/w0.2/workspace-validation-repair-queue.json", {
  schemaVersion: 1,
  groups: repairQueue,
  dag: triage.repairDag,
});

const repairSurface = remainingFindings.filter(
  (finding) => finding.semanticDisposition === "REPAIR",
).length;
assert.equal(auditReport.classificationCounts["FALSE-GREEN"], 0);
assert.equal(auditReport.classificationCounts["ABSENT-BY-DESIGN"], 2);
assert.equal(auditReport.classificationCounts.BROKEN, 274);
assert.equal(repairSurface, 274);
assert.equal(
  repairQueue.find((group) => group.id === "build:rejected-exception")?.workspaces.length,
  68,
);
assert.deepEqual(
  repairQueue.filter((group) => group.id.startsWith("typecheck:")),
  [],
);

console.log(
  JSON.stringify(
    {
      workspaces: auditReport.workspaceCount,
      controlPlaneRoots: auditReport.controlPlaneCount,
      classifications: auditReport.classificationCounts,
      repairedTypecheckContracts: repairedPaths.size,
      repairSurface,
      rejectedBuildExceptions: 68,
    },
    null,
    2,
  ),
);
