import fs from "node:fs";
import path from "node:path";

const IGNORED_DIRECTORIES = new Set(["node_modules", "dist", "build", ".next", "coverage", ".git", ".turbo"]);
const SOURCE_PATTERN = /\.(?:[cm]?[jt]sx?|py|go|rs)$/i;
const TEST_PATTERN = /(?:^|\/)(?:__tests__\/.*|.*\.(?:test|spec)\.[cm]?[jt]sx?)$/i;
const REPAIR_DAG = [
  { id: "audit-infrastructure", dependsOn: [] },
  { id: "false-green-hotspots", dependsOn: ["audit-infrastructure"] },
  { id: "typecheck-contracts", dependsOn: ["false-green-hotspots"] },
  { id: "test-contracts", dependsOn: ["typecheck-contracts"] },
  { id: "schema-validation", dependsOn: ["test-contracts"] },
  { id: "lint-build-cleanup", dependsOn: ["schema-validation"] },
  { id: "negative-controls", dependsOn: ["lint-build-cleanup"] },
  { id: "governance-gate-integration", dependsOn: ["negative-controls"] },
];

function stringLeaves(value) {
  if (typeof value === "string") return [value];
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap(stringLeaves);
}

function workspaceEvidence(projectRoot, workspace) {
  const workspaceRoot = path.join(projectRoot, workspace.path);
  const packageJson = JSON.parse(fs.readFileSync(path.join(workspaceRoot, "package.json"), "utf8"));
  const files = [];
  const pending = [workspaceRoot];
  while (pending.length > 0) {
    const directory = pending.pop();
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (IGNORED_DIRECTORIES.has(entry.name)) continue;
      const candidate = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) pending.push(candidate);
      if (entry.isFile()) files.push(path.relative(workspaceRoot, candidate).replaceAll("\\", "/"));
    }
  }
  const sourceFiles = files.filter((file) => SOURCE_PATTERN.test(file));
  const testFiles = files.filter((file) => TEST_PATTERN.test(file));
  const typescriptFiles = sourceFiles.filter((file) => /\.[cm]?tsx?$/i.test(file));
  const publishedTargets = [packageJson.main, packageJson.module, packageJson.types, ...stringLeaves(packageJson.exports)]
    .filter((value) => typeof value === "string");
  return {
    packageJson,
    sourceFiles,
    testFiles,
    typescriptFiles,
    hasTsconfig: files.some((file) => /(?:^|\/)tsconfig(?:\.[^/]+)?\.json$/i.test(file)),
    sourceDistributed: publishedTargets.some((target) => /^(?:\.\/)?(?:src\/)?index\.[cm]?[jt]sx?$/.test(target) || /^(?:\.\/)?src\//.test(target)),
    distPublished: publishedTargets.some((target) => /^\.\/(?:dist|build|lib)\//.test(target)),
    productionKind: workspace.path.startsWith("apps/") || workspace.path.startsWith("services/"),
  };
}

function exceptionProposal(workspace, finding, rationale, architecturalJustification, permanence = "PERMANENT") {
  return {
    workspacePath: workspace.path,
    packageName: workspace.packageName,
    contract: finding.contract,
    rationale,
    owner: null,
    reviewer: null,
    reviewEvidence: null,
    architecturalJustification,
    permanence,
    expiryOrReviewTrigger: permanence === "TEMPORARY"
      ? "Must be reviewed before the next W0.2 repair release."
      : "Review when package architecture, publication model, or root validation topology changes.",
    reviewStatus: "REQUIRED",
  };
}

function triageFinding(workspace, finding, evidence) {
  const contractRecord = workspace.contracts[finding.contract];
  const base = {
    workspacePath: workspace.path,
    packageName: workspace.packageName,
    sourceBearing: workspace.hasSource,
    contract: finding.contract,
    originalClassification: finding.classification,
    currentCommandOrState: contractRecord?.command ?? "MISSING",
    whyDefective: contractRecord?.evidence ?? finding.evidence,
    evidence: [
      `${evidence.sourceFiles.length} source files`,
      `${evidence.testFiles.length} test files`,
      evidence.hasTsconfig ? "tsconfig present" : "no tsconfig",
    ],
  };

  if (finding.classification === "FALSE-GREEN") {
    const cause = /--passWithNoTests\b/.test(contractRecord?.command ?? "")
      ? "Test discovery may produce successful validation with zero tests."
      : "Validation is an unconditional or failure-swallowing success path.";
    return {
      ...base,
      whyDefective: cause,
      needsContract: true,
      semanticDisposition: "REPAIR",
      proposedDisposition: "Replace with a real fail-closed validation contract.",
      priority: "P0",
      repairGroup: finding.contract === "typecheck" ? "false-green:no-op-typecheck" : "false-green:no-tests-tolerated",
      dependsOn: ["audit-infrastructure"],
    };
  }

  if (finding.contract === "schema-config") {
    return {
      ...base,
      needsContract: true,
      semanticDisposition: "REPAIR",
      proposedDisposition: "Add deterministic schema/config parsing and a red-on-invalid fixture.",
      priority: "P0",
      repairGroup: "schema:missing-validation",
      dependsOn: ["typecheck-contracts", "test-contracts"],
    };
  }

  if (finding.contract === "typecheck") {
    if (evidence.typescriptFiles.length === 0) {
      return {
        ...base,
        needsContract: false,
        semanticDisposition: "RECLASSIFY_NOT_APPLICABLE",
        proposedDisposition: "TypeScript typechecking is not applicable because no TypeScript source was found.",
        priority: "P3",
        repairGroup: "classification:typecheck-not-applicable",
        dependsOn: ["audit-infrastructure"],
      };
    }
    return {
      ...base,
      needsContract: true,
      semanticDisposition: "REPAIR",
      proposedDisposition: "Add a real TypeScript typecheck covering production source.",
      priority: "P1",
      repairGroup: evidence.hasTsconfig ? "typecheck:missing-script" : "typecheck:missing-config-and-script",
      evidence: [...base.evidence, "TypeScript source requires compiler validation"],
      dependsOn: ["false-green-hotspots"],
    };
  }

  if (finding.contract === "test") {
    return {
      ...base,
      needsContract: true,
      semanticDisposition: "REPAIR",
      proposedDisposition: evidence.testFiles.length > 0
        ? "Wire the existing test files into the canonical test contract."
        : "Add meaningful behavioral or contract tests, or submit a package-specific reviewed exception.",
      priority: "P1",
      repairGroup: evidence.testFiles.length > 0 ? "test:unwired-existing-tests" : "test:missing-suite",
      dependsOn: ["typecheck-contracts"],
    };
  }

  if (finding.contract === "lint") {
    return {
      ...base,
      needsContract: true,
      semanticDisposition: "REPAIR",
      proposedDisposition: "Add or inherit a deterministic lint contract reachable from root validation.",
      priority: "P2",
      repairGroup: "lint:missing-contract",
      dependsOn: ["test-contracts", "schema-validation"],
    };
  }

  if (finding.contract === "build" && evidence.sourceDistributed && !evidence.productionKind) {
    return {
      ...base,
      needsContract: false,
      semanticDisposition: "PROPOSE_ABSENT_BY_DESIGN",
      proposedDisposition: "Review a permanent build exception for a package intentionally published from source.",
      priority: "P3",
      repairGroup: "build:source-distributed-exception",
      dependsOn: ["audit-infrastructure"],
      exception: exceptionProposal(
        workspace,
        finding,
        "The package exports source files directly and has no independent build artifact.",
        "The consuming application or bundler owns compilation; a package-local build would duplicate that boundary.",
      ),
    };
  }

  return {
    ...base,
    needsContract: true,
    semanticDisposition: "REPAIR",
    proposedDisposition: evidence.distPublished
      ? "Add a build contract that produces the declared distribution artifacts."
      : "Define a package-appropriate build contract or submit a package-specific reviewed exception.",
    priority: evidence.productionKind ? "P1" : "P2",
    repairGroup: evidence.distPublished ? "build:declared-output-missing" : "build:missing-contract",
    dependsOn: ["lint-contracts"],
  };
}

export function buildRepairQueue(findings) {
  const groups = new Map();
  for (const finding of findings.filter((entry) => entry.semanticDisposition === "REPAIR")) {
    const current = groups.get(finding.repairGroup) ?? {
      id: finding.repairGroup,
      priority: finding.priority,
      contracts: new Set(),
      workspaces: new Set(),
      dependsOn: new Set(finding.dependsOn),
    };
    current.contracts.add(finding.contract);
    current.workspaces.add(finding.workspacePath);
    groups.set(finding.repairGroup, current);
  }
  const order = { P0: 0, P1: 1, P2: 2, P3: 3 };
  return [...groups.values()].map((group) => ({
    ...group,
    contracts: [...group.contracts].sort(),
    workspaces: [...group.workspaces].sort(),
    dependsOn: [...group.dependsOn].sort(),
  })).sort((left, right) => order[left.priority] - order[right.priority] || left.id.localeCompare(right.id));
}

export function validateWorkspaceExceptions({ exceptions }) {
  const seen = new Set();
  for (const exception of exceptions) {
    const key = `${exception.workspacePath}:${exception.contract}`;
    if (seen.has(key)) throw new Error(`W0C_DUPLICATE_EXCEPTION ${key}`);
    seen.add(key);
    if (!exception.workspacePath || /[*?]/.test(exception.workspacePath)) {
      throw new Error(`W0C_INVALID_EXCEPTION_SCOPE ${exception.workspacePath ?? "MISSING"}`);
    }
    for (const field of ["contract", "rationale", "architecturalJustification", "permanence", "expiryOrReviewTrigger", "reviewStatus"]) {
      if (!exception[field]) throw new Error(`W0C_INVALID_EXCEPTION ${key} missing ${field}`);
    }
    if (exception.reviewStatus === "PENDING_REVIEWER" && (!exception.owner || !exception.reviewReference)) {
      throw new Error(`W0C_INCOMPLETE_PENDING_REVIEW ${key}`);
    }
    if (["APPROVED", "REJECTED"].includes(exception.reviewStatus)
      && (!exception.owner || !exception.reviewer || !(exception.reviewEvidence || exception.reviewReference))) {
      throw new Error(`W0C_UNREVIEWED_EXCEPTION ${key}`);
    }
    if (!["REQUIRED", "PENDING_REVIEWER", "APPROVED", "REJECTED"].includes(exception.reviewStatus)) {
      throw new Error(`W0C_UNKNOWN_EXCEPTION_STATUS ${key}`);
    }
  }
  return { exceptionCount: exceptions.length };
}

export function triageWorkspaceValidation({ projectRoot, manifest, auditReport }) {
  const workspaceByPath = new Map(manifest.workspaces.map((workspace) => [workspace.path, workspace]));
  const evidenceByPath = new Map();
  const findings = auditReport.findings
    .filter((finding) => finding.code === "W0C_CLASSIFIED_DEFECT")
    .map((finding) => {
      const workspace = workspaceByPath.get(finding.workspacePath);
      if (!evidenceByPath.has(workspace.path)) evidenceByPath.set(workspace.path, workspaceEvidence(projectRoot, workspace));
      return triageFinding(workspace, finding, evidenceByPath.get(workspace.path));
    })
    .sort((left, right) => left.workspacePath.localeCompare(right.workspacePath) || left.contract.localeCompare(right.contract));
  const exceptions = findings.filter((finding) => finding.exception).map((finding) => finding.exception);
  return {
    schemaVersion: 1,
    findings,
    exceptions,
    repairQueue: buildRepairQueue(findings),
    repairDag: REPAIR_DAG,
  };
}
