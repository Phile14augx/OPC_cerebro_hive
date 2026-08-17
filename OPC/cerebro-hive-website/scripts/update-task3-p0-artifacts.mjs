import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  auditWorkspaceContracts,
  generateWorkspaceInventory,
} from "./audit-workspace-contracts.mjs";
import { buildRepairQueue } from "./triage-workspace-contracts.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(projectRoot, relativePath), "utf8"));
const writeJson = (relativePath, value) =>
  fs.writeFileSync(path.join(projectRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`);

const inventory = generateWorkspaceInventory({ projectRoot, expectedWorkspaceCount: 141 });
const inventoryByPath = new Map(
  inventory.workspaces.map((workspace) => [workspace.path, workspace]),
);
const manifest = readJson("config/workspace-validation-classification.json");
const triage = readJson("artifacts/w0.2/workspace-validation-triage.json");

const typecheckRepairs = new Set(["apps/platform-api", "services/forge-api"]);
const noTestByDesign = new Map([
  [
    "packages/tables",
    "Workspace is an empty export shell with no runtime behavior; build, typecheck, and lint remain the applicable contracts.",
  ],
  [
    "packages/visualization",
    "Workspace is an empty export shell with no runtime behavior; build, typecheck, and lint remain the applicable contracts.",
  ],
  [
    "services/archive-worker",
    "Workspace contains no qualifying source under the deterministic discovery policy; a test contract becomes required when source is introduced.",
  ],
]);
const testRepairs = new Set([
  "apps/eda-api",
  "apps/eda-portal",
  "packages/asset-core",
  "packages/config",
  "packages/eda-artifacts",
  "packages/eda-coverage",
  "packages/eda-domain",
  "packages/eda-events",
  "packages/eda-execution",
  "packages/eda-findings",
  "packages/eda-knowledge",
  "packages/eda-observability",
  "packages/eda-parser",
  "packages/eda-parsers",
  "packages/eda-sdk",
  "packages/eda-security",
  "packages/eda-storage",
  "packages/eda-tenancy",
  "packages/eda-ui",
  "packages/eda-workflow",
  "packages/experience",
  "packages/motion",
  "packages/plugin-sdk",
  "packages/tokens",
  "services/archive-api",
  "services/eda-execution-worker",
  "services/eda-parser-worker",
  "services/eda-rtl-index-worker",
  "services/eda-temporal-worker",
  "services/forge-api",
]);

const realContract = (command, evidence) => ({ classification: "REAL", command, evidence });

for (const workspace of manifest.workspaces) {
  const current = inventoryByPath.get(workspace.path);
  if (!current) throw new Error(`W0C_STALE_MANIFEST_PATH ${workspace.path}`);
  workspace.packageName = current.packageName;
  workspace.hasSource = current.hasSource;
  workspace.semanticCandidates = current.semanticCandidates;

  if (typecheckRepairs.has(workspace.path)) {
    workspace.contracts.typecheck = realContract(
      current.contracts.typecheck,
      `Task 3A verified compiler contract: ${current.contracts.typecheck}`,
    );
  }
  if (testRepairs.has(workspace.path)) {
    workspace.contracts.test = realContract(
      current.contracts.test,
      `Task 3B verified test contract with discovered tests: ${current.contracts.test}`,
    );
  }
  if (noTestByDesign.has(workspace.path)) {
    workspace.contracts.test = {
      classification: "NOT-APPLICABLE",
      command: null,
      evidence: noTestByDesign.get(workspace.path),
    };
  }
  if (workspace.path === "packages/db") {
    workspace.contracts["schema-config"] = realContract(
      current.contracts["schema-config"],
      `Task 3C verified canonical and deliberately invalid Prisma schemas: ${current.contracts["schema-config"]}`,
    );
  }
}

writeJson("artifacts/w0.2/workspace-validation-inventory.json", inventory);
writeJson("config/workspace-validation-classification.json", manifest);

let auditReport;
try {
  auditReport = auditWorkspaceContracts({
    projectRoot,
    manifestPath: path.join(projectRoot, "config/workspace-validation-classification.json"),
    expectedWorkspaceCount: 141,
  });
} catch (error) {
  if (!error.auditResult) throw error;
  auditReport = error.auditResult;
}
writeJson("artifacts/w0.2/workspace-validation-findings.json", {
  ...auditReport,
  green: auditReport.findings.length === 0,
});

const resolved = new Set([
  ...[...typecheckRepairs].map((workspacePath) => `${workspacePath}:typecheck`),
  ...[...testRepairs].map((workspacePath) => `${workspacePath}:test`),
  ...[...noTestByDesign.keys()].map((workspacePath) => `${workspacePath}:test`),
  "packages/db:schema-config",
]);
const remainingFindings = triage.findings.filter(
  (finding) => !resolved.has(`${finding.workspacePath}:${finding.contract}`),
);
const repairQueue = buildRepairQueue(remainingFindings);
const updatedTriage = { ...triage, findings: remainingFindings, repairQueue };
writeJson("artifacts/w0.2/workspace-validation-triage.json", updatedTriage);
writeJson("artifacts/w0.2/workspace-validation-repair-queue.json", {
  schemaVersion: 1,
  groups: repairQueue,
  dag: triage.repairDag,
});

console.log(
  JSON.stringify(
    {
      workspaces: auditReport.workspaceCount,
      controlPlaneRoots: auditReport.controlPlaneCount,
      classifications: auditReport.classificationCounts,
      defects: auditReport.findings.filter((finding) => finding.code === "W0C_CLASSIFIED_DEFECT")
        .length,
      repairSurface: remainingFindings.filter((finding) => finding.semanticDisposition === "REPAIR")
        .length,
      p0Groups: repairQueue.filter((group) => group.priority === "P0").map((group) => group.id),
    },
    null,
    2,
  ),
);
