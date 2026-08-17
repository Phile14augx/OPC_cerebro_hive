import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function workspaceGlobs(projectRoot) {
  const content = fs.readFileSync(path.join(projectRoot, "pnpm-workspace.yaml"), "utf8");
  return [...content.matchAll(/^\s*-\s*["']([^"']+)["']/gm)].map((match) => match[1]);
}

function discoverWorkspacePaths(projectRoot, globs) {
  const paths = new Set();
  for (const glob of globs) {
    const base = path.join(projectRoot, glob.replace(/\/\*+$/, ""));
    if (!fs.existsSync(base)) continue;
    for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
      const candidate = path.join(base, entry.name);
      if (fs.existsSync(path.join(candidate, "package.json"))) {
        paths.add(path.relative(projectRoot, candidate).replaceAll("\\", "/"));
      }
    }
  }
  return [...paths].sort();
}

function hasSource(projectRoot, workspacePath) {
  const pending = [path.join(projectRoot, workspacePath)];
  let sourceFound = false;
  const findings = [];
  const schemaConfigEvidence = [];
  while (pending.length > 0) {
    const directory = pending.pop();
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (["node_modules", "dist", "build", ".next", "coverage", ".git", ".turbo"].includes(entry.name)) continue;
      const candidate = path.join(directory, entry.name);
      const metadata = fs.lstatSync(candidate);
      if (metadata.isSymbolicLink()) {
        try {
          fs.statSync(candidate);
        } catch (error) {
          if (error.code === "ENOENT") {
            findings.push({
              code: "W0C_DANGLING_SOURCE_PATH",
              workspacePath,
              path: path.relative(projectRoot, candidate).replaceAll("\\", "/"),
              phase: "source-discovery",
            });
            continue;
          }
          throw error;
        }
        continue;
      }
      if (entry.isDirectory()) pending.push(candidate);
      if (entry.isFile()) {
        const relativePath = path.relative(path.join(projectRoot, workspacePath), candidate).replaceAll("\\", "/");
        if (/\.(?:[cm]?[jt]sx?|py|go|rs)$/i.test(entry.name)) sourceFound = true;
        if (/(?:^|\/)(?:schema\.prisma|openapi\.(?:ya?ml|json)|[^/]+\.(?:graphql|gql|proto)|(?:schema|schemas)\/[^/]+\.(?:json|ya?ml))$/i.test(relativePath)) {
          schemaConfigEvidence.push(relativePath);
        }
      }
    }
  }
  return { hasSource: sourceFound, findings, schemaConfigEvidence: schemaConfigEvidence.sort() };
}

function validationCommandClassification(command) {
  if (/\bexit\s+0\b|\|\|\s*true\b|--passWithNoTests\b|process\.exit\(0\)/i.test(command)) {
    return "FALSE-GREEN";
  }
  if (/^\s*(?:echo\b.*|true|:)\s*$/i.test(command)) return "PLACEHOLDER";
  return "REAL";
}

function semanticValidationCandidates(scripts = {}) {
  const candidates = [];
  for (const [script, command] of Object.entries(scripts)) {
    const contract = /^(build)(?::|$)/i.test(script) ? "build"
      : /^(test)(?::|$)/i.test(script) ? "test"
        : /^(typecheck)(?::|$)/i.test(script) ? "typecheck"
          : /^(lint)(?::|$)/i.test(script) ? "lint"
            : /^(?:schema|config|yaml|validate:(?:schema|config|yaml))(?::|$)/i.test(script) ? "schema-config"
              : null;
    if (!contract) continue;
    const classification = validationCommandClassification(command);
    if (classification === "REAL") continue;
    const evidence = /--passWithNoTests\b/i.test(command)
      ? "Validation script can succeed when no tests are discovered."
      : classification === "PLACEHOLDER"
        ? "Validation script is a placeholder and performs no meaningful validation."
        : "Validation script contains an unconditional or failure-swallowing success path.";
    candidates.push({ script, contract, classification, command, evidence });
  }
  return candidates.sort((left, right) => left.script.localeCompare(right.script));
}

function contractRecord(contractName, command, hasSource, schemaConfigEvidence = []) {
  if (command) {
    const classification = validationCommandClassification(command);
    const reason = classification === "REAL"
      ? `Declared package script: ${command}`
      : classification === "PLACEHOLDER"
        ? `Declared ${contractName} script is a placeholder: ${command}`
        : `Declared ${contractName} script can report success without meaningful validation: ${command}`;
    return { classification, command, evidence: reason };
  }
  if (contractName === "schema-config" && schemaConfigEvidence.length > 0) {
    return {
      classification: "BROKEN",
      command: null,
      evidence: `Schema/config assets lack a declared validation contract: ${schemaConfigEvidence.join(", ")}`,
    };
  }
  if (contractName === "schema-config" || !hasSource) {
    return {
      classification: "NOT-APPLICABLE",
      command: null,
      evidence: contractName === "schema-config"
        ? "No applicable schema/config validation script was declared."
        : "Workspace contains no qualifying source under the deterministic discovery policy.",
    };
  }
  return {
    classification: "BROKEN",
    command: null,
    evidence: `Source-bearing workspace has no declared ${contractName} validation contract.`,
  };
}

export function generateClassificationManifest(inventory) {
  return {
    baselineWorkspaceCount: inventory.baselineWorkspaceCount,
    controlPlane: inventory.controlPlane,
    workspaces: inventory.workspaces.map((workspace) => ({
      path: workspace.path,
      packageName: workspace.packageName,
      hasSource: workspace.hasSource,
      semanticCandidates: workspace.semanticCandidates,
      contracts: Object.fromEntries(
        ["build", "test", "typecheck", "lint", "schema-config"].map((contractName) => [
          contractName,
          contractRecord(
            contractName,
            workspace.contracts[contractName],
            workspace.hasSource,
            workspace.schemaConfigEvidence,
          ),
        ]),
      ),
    })),
  };
}

export function generateWorkspaceInventory({ projectRoot, expectedWorkspaceCount }) {
  const workspacePaths = discoverWorkspacePaths(projectRoot, workspaceGlobs(projectRoot));
  if (workspacePaths.length !== expectedWorkspaceCount) {
    throw new Error(`W0C_WORKSPACE_GRAPH_MISMATCH expected ${expectedWorkspaceCount}, found ${workspacePaths.length}`);
  }
  const workspaces = workspacePaths.map((workspacePath) => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, workspacePath, "package.json"), "utf8"));
    const sourceDiscovery = hasSource(projectRoot, workspacePath);
    const schemaConfigScript = Object.entries(packageJson.scripts ?? {}).find(([name]) =>
      /^(?:schema|config|yaml|validate:(?:schema|config|yaml))(?:$|:)/i.test(name),
    );
    return {
      path: workspacePath,
      packageName: packageJson.name ?? null,
      hasSource: sourceDiscovery.hasSource,
      contracts: {
        ...Object.fromEntries(["build", "test", "typecheck", "lint"].map((name) => [name, packageJson.scripts?.[name] ?? null])),
        "schema-config": schemaConfigScript?.[1] ?? null,
      },
      schemaConfigEvidence: sourceDiscovery.schemaConfigEvidence,
      semanticCandidates: semanticValidationCandidates(packageJson.scripts),
      findings: sourceDiscovery.findings,
    };
  });
  return {
    baselineWorkspaceCount: expectedWorkspaceCount,
    rootControlPlane: true,
    workspaces,
    controlPlane: [{ path: ".", classification: "CONTROL-PLANE" }],
    externalDependencies: [],
    findings: workspaces.flatMap((workspace) => workspace.findings),
  };
}

export function auditWorkspaceContracts({ projectRoot, manifestPath, expectedWorkspaceCount }) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const manifestRecords = manifest.workspaces ?? [];
  const records = new Map();
  const classifications = new Set(["REAL", "ABSENT-BY-DESIGN", "BROKEN", "PLACEHOLDER", "FALSE-GREEN", "NOT-APPLICABLE"]);
  const requiredContracts = ["build", "test", "typecheck", "lint", "schema-config"];
  const classificationCounts = Object.fromEntries([...classifications].map((classification) => [classification, 0]));
  const completeManifest = manifest.baselineWorkspaceCount !== undefined;
  let unclassified = 0;
  for (const record of manifestRecords) {
    if (record.path === ".") throw new Error("W0C_ROOT_SCOPE_VIOLATION .");
    if (records.has(record.path)) throw new Error(`W0C_DUPLICATE_MANIFEST_PATH ${record.path}`);
    for (const contract of Object.values(record.contracts ?? {})) {
      const classification = contract.classification ?? contract.status;
      if (!classifications.has(classification)) throw new Error(`W0C_UNKNOWN_CLASSIFICATION ${record.path}`);
    }
    records.set(record.path, record);
  }
  const paths = discoverWorkspacePaths(projectRoot, workspaceGlobs(projectRoot));
  const inventory = [];
  const findings = [];

  if (paths.length !== expectedWorkspaceCount) {
    throw new Error(`W0C_WORKSPACE_GRAPH_MISMATCH expected ${expectedWorkspaceCount}, found ${paths.length}`);
  }

  for (const manifestPathEntry of records.keys()) {
    if (!paths.includes(manifestPathEntry)) throw new Error(`W0C_STALE_MANIFEST_PATH ${manifestPathEntry}`);
  }

  for (const workspacePath of paths) {
    const sourceDiscovery = hasSource(projectRoot, workspacePath);
    inventory.push({ path: workspacePath, hasSource: sourceDiscovery.hasSource });
    findings.push(...sourceDiscovery.findings);
    const record = records.get(workspacePath);
    if (!record) {
      throw new Error(`W0C_MISSING_WORKSPACE ${workspacePath}`);
    }
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, workspacePath, "package.json"), "utf8"));
    const contractNames = completeManifest ? requiredContracts : Object.keys(record.contracts ?? {});
    for (const contractName of contractNames) {
      const contract = record.contracts?.[contractName];
      const classification = contract?.classification ?? contract?.status;
      if (!classification) {
        unclassified += 1;
        findings.push({ code: "W0C_UNCLASSIFIED_SOURCE", workspacePath, contract: contractName });
        continue;
      }
      classificationCounts[classification] += 1;
      if (classification === "ABSENT-BY-DESIGN" && (!contract.owner || !contract.rationale || !contract.review)) {
        findings.push({ code: "W0C_UNREVIEWED_EXCEPTION", workspacePath, contract: contractName });
      }
      const declaredCommand = contract.command ?? packageJson.scripts?.[contractName] ?? "";
      if (classification === "REAL" && validationCommandClassification(declaredCommand) !== "REAL") {
        findings.push({ code: "W0C_FALSE_GREEN_CONTRACT", workspacePath, contract: contractName });
      }
      if (["BROKEN", "PLACEHOLDER", "FALSE-GREEN"].includes(classification)) {
        findings.push({
          code: "W0C_CLASSIFIED_DEFECT",
          workspacePath,
          contract: contractName,
          classification,
          evidence: contract.evidence ?? null,
        });
      }
    }
  }

  const findingsByContract = Object.fromEntries(requiredContracts.map((contractName) => [
    contractName,
    findings.filter((finding) => finding.contract === contractName),
  ]));
  const result = {
    workspaceCount: paths.length,
    workspacePaths: paths,
    controlPlaneCount: manifest.controlPlane?.length ?? 0,
    inventory,
    classificationCounts,
    unclassified,
    findingsByContract,
    findings,
  };
  if (findings.length > 0) {
    const error = new Error(findings.map((finding) =>
      [finding.code, finding.workspacePath, finding.contract, finding.path].filter(Boolean).join(" "),
    ).join("\n"));
    error.auditResult = result;
    throw error;
  }
  return result;
}

const invokedPath = process.argv[1] && path.resolve(process.argv[1]);
const currentPath = fileURLToPath(import.meta.url);
if (invokedPath === currentPath) {
  const projectRoot = path.resolve(path.dirname(currentPath), "..");
  if (process.argv[2] === "--inventory") {
    const inventory = generateWorkspaceInventory({ projectRoot, expectedWorkspaceCount: 141 });
    const outputPath = process.argv[3];
    if (outputPath) {
      const resolvedOutputPath = path.resolve(projectRoot, outputPath);
      fs.mkdirSync(path.dirname(resolvedOutputPath), { recursive: true });
      fs.writeFileSync(resolvedOutputPath, `${JSON.stringify(inventory, null, 2)}\n`);
      console.log(resolvedOutputPath);
    } else {
      console.log(JSON.stringify(inventory, null, 2));
    }
    process.exit(0);
  }
  const manifestPath = path.join(projectRoot, "config", "workspace-validation-classification.json");
  const result = auditWorkspaceContracts({ projectRoot, manifestPath, expectedWorkspaceCount: 141 });
  console.log(JSON.stringify(result, null, 2));
}
