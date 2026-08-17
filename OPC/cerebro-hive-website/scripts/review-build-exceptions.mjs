import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { buildRepairQueue } from "./triage-workspace-contracts.mjs";

function stringLeaves(value) {
  if (typeof value === "string") return [value];
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap(stringLeaves);
}

function packageMetadata(projectRoot, workspace) {
  const workspaceRoot = path.join(projectRoot, workspace.path);
  const packageJson = JSON.parse(fs.readFileSync(path.join(workspaceRoot, "package.json"), "utf8"));
  const targets = [packageJson.main, packageJson.module, packageJson.types, ...stringLeaves(packageJson.exports)]
    .filter((value) => typeof value === "string");
  const entries = fs.readdirSync(workspaceRoot, { withFileTypes: true }).map((entry) => entry.name);
  const scripts = packageJson.scripts ?? {};
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies,
    ...packageJson.optionalDependencies,
  };
  return {
    packageJson,
    targets,
    sourceTargets: targets.filter((target) => /^(?:\.\/)?(?:src\/)?index\.[cm]?[jt]sx?$/.test(target) || /^(?:\.\/)?src\//.test(target)),
    prebuiltTargets: targets.filter((target) => /^(?:\.\/)?(?:dist|build|lib|generated)\//i.test(target)),
    standaloneSignals: [
      packageJson.bin ? "package.json#bin" : null,
      entries.some((name) => /^Dockerfile(?:\.|$)/i.test(name)) ? "Dockerfile" : null,
      Object.keys(scripts).some((name) => /^(?:start|serve|deploy|docker|publish|prepublish|prepack|postpack|release)(?::|$)/i.test(name))
        ? "executable/deployment/publish script"
        : null,
      Object.keys(scripts).some((name) => /^(?:generate|codegen)(?::|$)/i.test(name)) ? "generated-artifact script" : null,
    ].filter(Boolean),
    dependencies,
    buildCommand: scripts.build ?? null,
  };
}

function compilingConsumers(workspace, workspaceByName, metadataByPath, manifestByPath) {
  const visited = new Set([workspace.packageName]);
  const pending = [workspace.packageName];
  const compiling = new Set();
  while (pending.length > 0) {
    const dependencyName = pending.shift();
    for (const consumer of workspaceByName.values()) {
      const metadata = metadataByPath.get(consumer.path);
      if (!(dependencyName in metadata.dependencies)) continue;
      if (!visited.has(consumer.packageName)) {
        visited.add(consumer.packageName);
        pending.push(consumer.packageName);
      }
      const build = manifestByPath.get(consumer.path)?.contracts?.build;
      const command = build?.command ?? metadata.buildCommand ?? "";
      if (build?.classification === "REAL" && /(?:next|vite|tsc|tsx|tsup|rollup|webpack|esbuild|nest)\b/i.test(command)) {
        compiling.add(consumer.path);
      }
    }
  }
  return [...compiling].sort();
}

export function reviewBuildExceptionProposals({ projectRoot, manifest, exceptions, manifestSha256 }) {
  const manifestByPath = new Map(manifest.workspaces.map((workspace) => [workspace.path, workspace]));
  const workspaceByName = new Map(manifest.workspaces.map((workspace) => [workspace.packageName, workspace]));
  const metadataByPath = new Map(manifest.workspaces.map((workspace) => [workspace.path, packageMetadata(projectRoot, workspace)]));
  const rootPackagePath = path.join(projectRoot, "package.json");
  const rootPackageText = fs.existsSync(rootPackagePath) ? fs.readFileSync(rootPackagePath, "utf8") : "";
  const decisions = exceptions.exceptions.map((proposal) => {
    const workspace = manifestByPath.get(proposal.workspacePath);
    const metadata = metadataByPath.get(proposal.workspacePath);
    const consumers = compilingConsumers(workspace, workspaceByName, metadataByPath, manifestByPath);
    const typecheck = workspace.contracts.typecheck?.classification;
    const test = workspace.contracts.test?.classification;
    const explicitRootBuildAssumption = new RegExp(`(?:${workspace.packageName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}|${workspace.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}).{0,80}build`, "i").test(rootPackageText);
    const criteria = {
      PRIVATE_SOURCE_DISTRIBUTION: metadata.packageJson.private === true && metadata.sourceTargets.length > 0,
      NO_PREBUILT_EXPORT: metadata.prebuiltTargets.length === 0,
      NO_STANDALONE_ARTIFACT: metadata.standaloneSignals.length === 0,
      COMPILING_CONSUMER: consumers.length > 0,
      NO_EXPLICIT_ROOT_BUILD_ASSUMPTION: !explicitRootBuildAssumption,
      NO_FALSE_GREEN_RELEASE: metadata.packageJson.private === true && !metadata.packageJson.publishConfig,
      REAL_TYPECHECK_AND_TEST: typecheck === "REAL" && test === "REAL",
    };
    const failedCriteria = Object.entries(criteria).filter(([, passes]) => !passes).map(([name]) => name);
    const technicalRecommendation = failedCriteria.length === 0 ? "APPROVE" : "REJECT";
    return {
      workspacePath: workspace.path,
      packageName: workspace.packageName,
      contract: "build",
      technicalRecommendation,
      failedCriteria,
      criteria,
      evidence: {
        private: metadata.packageJson.private === true,
        sourceTargets: metadata.sourceTargets,
        prebuiltTargets: metadata.prebuiltTargets,
        standaloneSignals: metadata.standaloneSignals,
        compilingConsumers: consumers,
        typecheckClassification: typecheck,
        testClassification: test,
      },
      compilingConsumers: consumers,
      proposedDisposition: technicalRecommendation === "APPROVE" ? "ABSENT-BY-DESIGN" : "REPAIR",
      reason: technicalRecommendation === "APPROVE"
        ? "Private source-distributed library is compiled by a verified consumer and has no independent artifact or release surface."
        : `Build exception criteria failed: ${failedCriteria.join(", ")}`,
      owner: null,
      reviewer: null,
      reviewReference: null,
      reviewStatus: "REQUIRED",
    };
  }).sort((left, right) => left.workspacePath.localeCompare(right.workspacePath));
  return {
    schemaVersion: 1,
    reviewedManifestSha256: manifestSha256 ?? crypto.createHash("sha256").update(JSON.stringify(exceptions)).digest("hex"),
    decisions,
  };
}

export function adoptBuildExceptionReview({ triage, exceptions, review, owner, reviewReference }) {
  const decisionByPath = new Map(review.decisions.map((decision) => [decision.workspacePath, decision]));
  const updatedExceptions = exceptions.exceptions.map((exception) => {
    const decision = decisionByPath.get(exception.workspacePath);
    const adoptedDecision = decision.technicalRecommendation === "APPROVE" ? "ABSENT-BY-DESIGN" : "REPAIR";
    return {
      ...exception,
      technicalRecommendation: decision.technicalRecommendation,
      adoptedDecision,
      disposition: adoptedDecision,
      decisionReason: decision.reason,
      owner,
      reviewer: null,
      reviewEvidence: null,
      reviewReference,
      reviewedManifestSha256: review.reviewedManifestSha256,
      reviewStatus: "PENDING_REVIEWER",
    };
  });
  const updatedFindings = triage.findings.map((finding) => {
    if (finding.contract !== "build" || !decisionByPath.has(finding.workspacePath)) return finding;
    const decision = decisionByPath.get(finding.workspacePath);
    if (decision.technicalRecommendation === "APPROVE") {
      return {
        ...finding,
        semanticDisposition: "PENDING_ABSENT_BY_DESIGN_REVIEW",
        proposedDisposition: "Approve ABSENT-BY-DESIGN after eligible human reviewer sign-off.",
        priority: "P3",
        repairGroup: "build:pending-approved-exception",
      };
    }
    return {
      ...finding,
      semanticDisposition: "REPAIR",
      proposedDisposition: "Add an independently verifiable build contract; technical exception proposal rejected.",
      priority: "P2",
      repairGroup: "build:rejected-exception",
      dependsOn: ["schema-validation"],
    };
  });
  return {
    triage: {
      ...triage,
      findings: updatedFindings,
      exceptions: updatedExceptions.filter((exception) => exception.adoptedDecision === "ABSENT-BY-DESIGN"),
      repairQueue: buildRepairQueue(updatedFindings),
    },
    exceptions: { ...exceptions, exceptions: updatedExceptions },
  };
}
